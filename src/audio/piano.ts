// Sampled grand piano + MIDI performer.
//
// Samples: Salamander Grand Piano (Yamaha C5) by Alexander Holm, CC BY 3.0,
// recorded every minor third (A0 … C8) and pitch-shifted to the notes in between.
// Pieces: public-domain / CC BY-SA MIDI files from the Mutopia Project.

import { parseMidi, type MidiNote } from './midi'

const SAMPLE_NAMES = ['A0', ...[1, 2, 3, 4, 5, 6, 7].flatMap((o) => ['C', 'Ds', 'Fs', 'A'].map((n) => n + o)), 'C8']
const NAME_TO_MIDI: Record<string, number> = { C: 0, Ds: 3, Fs: 6, A: 9 }
const sampleMidi = (name: string) => NAME_TO_MIDI[name.slice(0, -1)] + (Number(name.slice(-1)) + 1) * 12

export class GrandPiano {
  private ctx: AudioContext
  private out: GainNode
  private samples = new Map<number, AudioBuffer>()
  private loading: Promise<void> | null = null
  private voices = new Set<{ src: AudioBufferSourceNode; gain: GainNode }>()

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx
    this.out = ctx.createGain()

    // small room: generated stereo impulse, mixed in lightly
    const reverb = ctx.createConvolver()
    reverb.buffer = this.impulse(2.4, 3)
    const wet = ctx.createGain()
    wet.gain.value = 0.22
    this.out.connect(destination)
    this.out.connect(reverb).connect(wet).connect(destination)
  }

  /**
   * Fetch and decode the samples (≈2 MB). Each file is retried a few times; a handful of
   * missing samples is fine (notes borrow the nearest one), so this only rejects when
   * almost nothing loaded. A failed attempt is not cached: calling load() again retries
   * just the samples that are still missing.
   */
  load(base = '/piano/') {
    if (this.ready) return Promise.resolve()
    this.loading ??= (async () => {
      const missing = SAMPLE_NAMES.filter((n) => !this.samples.has(sampleMidi(n)))
      const failures: string[] = []
      await Promise.all(
        missing.map(async (name) => {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const res = await fetch(`${base}${name}.mp3`)
              if (!res.ok) throw new Error(`HTTP ${res.status}`)
              this.samples.set(sampleMidi(name), await this.ctx.decodeAudioData(await res.arrayBuffer()))
              return
            } catch (err) {
              if (attempt === 3) failures.push(`${name}: ${(err as Error).message}`)
              else await new Promise((r) => setTimeout(r, 400 * attempt))
            }
          }
        }),
      )
      if (failures.length) console.warn(`[piano] ${failures.length} sample(s) failed to load`, failures)
      if (!this.playable) throw new Error(`piano samples unavailable (${failures.slice(0, 3).join('; ')})`)
    })().finally(() => {
      this.loading = null // never cache a failure
    })
    return this.loading
  }

  /** every sample is in */
  get ready() {
    return this.samples.size === SAMPLE_NAMES.length
  }

  /** enough samples to cover the keyboard reasonably (each one is re-pitched to its neighbours) */
  get playable() {
    return this.samples.size >= Math.ceil(SAMPLE_NAMES.length * 0.6)
  }

  /** Play one note: nearest sample, re-pitched; release fades like a damper. */
  note(midi: number, t: number, dur: number, vel: number) {
    let best = 0
    let bestDist = Infinity
    for (const m of this.samples.keys()) {
      const dist = Math.abs(m - midi)
      if (dist < bestDist) [best, bestDist] = [m, dist]
    }
    const buf = this.samples.get(best)
    if (!buf) return
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.playbackRate.value = Math.pow(2, (midi - best) / 12)
    const gain = this.ctx.createGain()
    // samples are one velocity layer: shape loudness and brightness from velocity
    const amp = 0.08 + Math.pow(vel, 1.7) * 0.85
    gain.gain.setValueAtTime(amp, t)
    const off = t + dur
    gain.gain.setTargetAtTime(0, off, midi < 48 ? 0.25 : 0.12) // bass strings damp slower
    const tone = this.ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 1800 + vel * 8000
    src.connect(tone).connect(gain).connect(this.out)
    src.start(t)
    src.stop(off + 1.5)
    const voice = { src, gain }
    this.voices.add(voice)
    src.onended = () => this.voices.delete(voice)
  }

  /** Damp everything that is still sounding (used on pause / track change). */
  releaseAll(seconds = 0.25) {
    const now = this.ctx.currentTime
    for (const v of this.voices) {
      v.gain.gain.cancelScheduledValues(now)
      v.gain.gain.setTargetAtTime(0, now, seconds / 3)
      try {
        v.src.stop(now + seconds + 0.1)
      } catch {
        /* not started yet */
      }
    }
    this.voices.clear()
  }

  private impulse(seconds: number, decay: number) {
    const rate = this.ctx.sampleRate
    const len = Math.floor(rate * seconds)
    const buf = this.ctx.createBuffer(2, len, rate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }
}

/** Schedules a MIDI song onto the piano with a little human timing. Supports pause/resume. */
export class Performer {
  private ctx: AudioContext
  private piano: GrandPiano
  private notes: MidiNote[] = []
  private duration = 0
  private cursor = 0
  private origin = 0
  private pausedAt = 0
  private timer = 0
  private playing = false
  onEnd: (() => void) | null = null

  constructor(ctx: AudioContext, piano: GrandPiano) {
    this.ctx = ctx
    this.piano = piano
  }

  async loadSong(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`missing song ${url}`)
    const song = parseMidi(await res.arrayBuffer())
    this.notes = song.notes
    this.duration = song.duration
    this.cursor = 0
    this.pausedAt = 0
  }

  get position() {
    return this.playing ? this.ctx.currentTime - this.origin : this.pausedAt
  }

  get length() {
    return this.duration
  }

  play() {
    if (this.playing || !this.notes.length) return
    this.playing = true
    // resume slightly before where we stopped so the phrase re-enters naturally
    const from = Math.max(0, this.pausedAt - 0.4)
    this.cursor = this.notes.findIndex((n) => n.t >= from)
    if (this.cursor < 0) this.cursor = this.notes.length
    this.origin = this.ctx.currentTime + 0.12 - from
    this.tick()
  }

  pause() {
    if (!this.playing) return
    this.pausedAt = this.position
    this.playing = false
    clearTimeout(this.timer)
    this.piano.releaseAll(0.6)
  }

  stop() {
    this.pause()
    this.pausedAt = 0
    this.cursor = 0
  }

  private tick = () => {
    if (!this.playing) return
    const horizon = this.ctx.currentTime + 0.25
    while (this.cursor < this.notes.length) {
      const n = this.notes[this.cursor]
      const at = this.origin + n.t
      if (at > horizon) break
      // chords spread by a few ms and velocities vary slightly, like hands do
      const human = (Math.random() - 0.5) * 0.012
      const vel = Math.min(1, Math.max(0.05, n.vel * (0.93 + Math.random() * 0.14)))
      this.piano.note(n.midi, Math.max(this.ctx.currentTime, at + human), n.dur, vel)
      this.cursor++
    }
    if (this.cursor >= this.notes.length && this.ctx.currentTime > this.origin + this.duration + 1.5) {
      this.playing = false
      this.pausedAt = 0
      this.onEnd?.()
      return
    }
    this.timer = window.setTimeout(this.tick, 50)
  }
}
