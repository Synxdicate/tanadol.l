<script setup lang="ts">
// Floating turntable. Only a spinning record is shown, no third-party player.
//
// Music: classical piano pieces (src/data/music.ts) performed live from MIDI on a sampled
// grand piano (src/audio/piano.ts). Browsers block sound until the visitor interacts, so
// playback starts on the first click / key press anywhere, unless the visitor switched it
// off before (remembered in localStorage).
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { GrandPiano, Performer } from '../audio/piano'
import { pieces } from '../data/music'

const PREF_KEY = 'music'
const VOLUME = 0.85

const playing = ref(false)
const loading = ref(false)
const failed = ref(false)
const muted = ref(false)
const hover = ref(false)
const focused = ref(false)
const index = ref(0)
const progress = ref(0)
const root = ref<HTMLElement | null>(null)
const disc = ref<HTMLElement | null>(null)

const piece = computed(() => pieces[index.value])

// ---------- audio graph ----------
let ctx: AudioContext | null = null
let master: GainNode | null = null
let analyser: AnalyserNode | null = null
let piano: GrandPiano | null = null
let performer: Performer | null = null
let loadedIndex = -1
let suspendTimer = 0

const ensureGraph = () => {
  if (ctx) return
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.82
  master.connect(analyser).connect(ctx.destination)
  piano = new GrandPiano(ctx, master)
  performer = new Performer(ctx, piano)
  performer.onEnd = () => setTimeout(() => go(1), 2500) // short silence between pieces
}

const fadeTo = (value: number, seconds: number) => {
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(value, now + seconds)
}

const play = async () => {
  ensureGraph()
  clearTimeout(suspendTimer)
  playing.value = true
  writePref('on')
  try {
    await ctx!.resume()
    if (!piano!.ready || loadedIndex !== index.value) {
      loading.value = true
      await piano!.load()
      if (loadedIndex !== index.value) {
        await performer!.loadSong(piece.value.midi)
        loadedIndex = index.value
      }
      loading.value = false
    }
    if (!playing.value) return // paused while loading
    failed.value = false
    fadeTo(muted.value ? 0 : VOLUME, 1.2)
    performer!.play()
  } catch {
    loading.value = false
    failed.value = true
    playing.value = false
  }
}

const pause = () => {
  playing.value = false
  fadeTo(0, 0.6)
  performer?.pause()
  suspendTimer = window.setTimeout(() => ctx?.suspend(), 900)
}

const toggle = () => {
  if (playing.value) {
    pause()
    writePref('off')
  } else play()
}

const toggleMute = () => {
  muted.value = !muted.value
  if (playing.value) fadeTo(muted.value ? 0 : VOLUME, 0.4)
}

/** step = +1 next, -1 previous */
const go = (step: number) => {
  const wasPlaying = playing.value
  performer?.stop()
  index.value = (index.value + step + pieces.length) % pieces.length
  progress.value = 0
  if (wasPlaying) {
    playing.value = false
    play()
  }
}

// ---------- preference ----------
const readPref = () => {
  try {
    return localStorage.getItem(PREF_KEY)
  } catch {
    return null
  }
}
const writePref = (v: 'on' | 'off') => {
  try {
    localStorage.setItem(PREF_KEY, v)
  } catch {
    /* storage blocked: lasts for this visit */
  }
}

// ---------- first interaction starts the music ----------
const onFirstInteraction = (e: Event) => {
  removeFirstListeners()
  if (root.value?.contains(e.target as Node)) return // the widget handles its own clicks
  if (readPref() === 'off' || playing.value) return
  play()
}
const removeFirstListeners = () => {
  window.removeEventListener('pointerdown', onFirstInteraction, true)
  window.removeEventListener('keydown', onFirstInteraction, true)
}

// ---------- visuals: eased spin, audio-reactive glow, progress ring ----------
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
let raf = 0
let angle = 0
let speed = 0 // degrees per frame
const RPM_33 = (33.3 * 360) / 60 / 60 // ≈ 3.33°/frame at 60fps
let bins: Uint8Array<ArrayBuffer> | null = null

const frame = () => {
  const spinning = playing.value && !loading.value
  const target = spinning && !reduceMotion ? RPM_33 : 0
  speed += (target - speed) * (spinning ? 0.025 : 0.04) // spin up slowly, wind down
  angle = (angle + speed) % 360
  let level = 0
  if (analyser && spinning) {
    bins ??= new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(bins)
    let sum = 0
    for (let i = 2; i < 24; i++) sum += bins[i]
    level = Math.min(1, sum / (22 * 170))
  }
  if (performer && performer.length) progress.value = Math.min(1, performer.position / performer.length)
  if (disc.value) disc.value.style.transform = `rotate(${angle}deg)`
  root.value?.style.setProperty('--level', level.toFixed(3))
  root.value?.style.setProperty('--progress', progress.value.toFixed(4))
  raf = requestAnimationFrame(frame)
}

onMounted(() => {
  raf = requestAnimationFrame(frame)
  if (readPref() === 'off') return
  window.addEventListener('pointerdown', onFirstInteraction, true)
  window.addEventListener('keydown', onFirstInteraction, true)
})

onUnmounted(() => {
  removeFirstListeners()
  cancelAnimationFrame(raf)
  clearTimeout(suspendTimer)
  performer?.stop()
  ctx?.close()
})
</script>

<template>
  <div
    ref="root"
    :class="['turntable no-print', { playing, open: hover || focused }]"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @focusin="focused = true"
    @focusout="(e: FocusEvent) => (focused = !!root?.contains(e.relatedTarget as Node))"
  >
    <!-- now-playing pill -->
    <div class="pill" :aria-hidden="!(hover || focused)">
      <span :class="['eq', { on: playing && !loading && !muted }]" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <div class="meta">
        <span class="title" :title="`${piece.title} — ${piece.composer} · MIDI: ${piece.license}`">{{ piece.title }}</span>
        <span class="artist font-mono">
          {{ failed ? "couldn't load the piano" : loading ? 'tuning the piano…' : piece.composer }}
        </span>
        <span class="bar" aria-hidden="true"><span></span></span>
      </div>
      <button class="mini prev" aria-label="Previous piece" @click="go(-1)"><i class="pi pi-step-backward"></i></button>
      <button class="mini" aria-label="Next piece" @click="go(1)"><i class="pi pi-step-forward"></i></button>
      <button class="mini" :aria-label="muted ? 'Unmute' : 'Mute'" @click="toggleMute">
        <i :class="['pi', muted ? 'pi-volume-off' : 'pi-volume-up']"></i>
      </button>
    </div>

    <!-- the record -->
    <button
      class="deck"
      :aria-label="playing ? 'Pause music' : 'Play music'"
      :aria-pressed="playing"
      data-magnetic
      @click="toggle"
    >
      <span class="glow" aria-hidden="true"></span>
      <span ref="disc" class="disc" aria-hidden="true">
        <span class="label"><span class="spindle"></span></span>
      </span>
      <span class="sheen" aria-hidden="true"></span>
      <span class="arm" aria-hidden="true"><span class="head"></span></span>
      <span class="state" aria-hidden="true">
        <i :class="['pi', loading ? 'pi-spin pi-spinner' : playing ? 'pi-pause' : 'pi-play']"></i>
      </span>
    </button>
  </div>
</template>

<style scoped>
.turntable {
  --level: 0;
  --size: 64px;
  position: fixed;
  right: calc(20px + env(safe-area-inset-right, 0px));
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  z-index: 120;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ---------- pill ---------- */
.pill {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.5rem 0.45rem 0.85rem;
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--line);
  border-radius: 999px;
  box-shadow: 0 10px 30px var(--shadow);
  opacity: 0;
  transform: translateX(14px) scale(0.96);
  transform-origin: right center;
  pointer-events: none;
  transition: opacity 0.4s var(--ease), transform 0.5s var(--ease);
}

.turntable.open .pill {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.bar {
  position: relative;
  display: block;
  height: 2px;
  margin-top: 5px;
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;
}

.bar span {
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform-origin: 0 50%;
  transform: scaleX(var(--progress, 0));
}

.title {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}

.artist {
  font-size: 0.62rem;
  color: var(--muted);
  white-space: nowrap;
}

.eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.eq i {
  width: 3px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
  transition: height 0.3s;
}

.eq.on i {
  animation: eq 1s ease-in-out infinite;
}
.eq.on i:nth-child(2) {
  animation-delay: -0.25s;
}
.eq.on i:nth-child(3) {
  animation-delay: -0.5s;
}
.eq.on i:nth-child(4) {
  animation-delay: -0.75s;
}

@keyframes eq {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 14px;
  }
}

.mini {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--ink-2);
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s, color 0.2s;
}

.mini:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

/* ---------- record ---------- */
.deck {
  position: relative;
  width: var(--size);
  height: var(--size);
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 10px; /* room for the tonearm so it never pokes past the screen edge */
}

/* soft accent halo that breathes with the music */
.glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent) 0%, transparent 70%);
  opacity: calc(var(--level) * 1.4);
  transform: scale(calc(1 + var(--level) * 0.25));
  transition: opacity 0.12s linear;
  pointer-events: none;
}

.disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%, #191816 0 1.6px, #24221f 1.6px 2.6px),
    #191816;
  box-shadow:
    0 12px 28px var(--shadow),
    0 0 0 1px color-mix(in srgb, var(--ink) 22%, transparent),
    0 0 0 4px var(--bg),
    0 0 0 5px var(--line);
  will-change: transform;
}

.label {
  position: absolute;
  inset: 31%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, transparent 0 18%, rgba(0, 0, 0, 0.15) 19% 20%, transparent 21%),
    conic-gradient(from 0deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #fff) 50%, var(--accent));
}

.spindle {
  position: absolute;
  inset: 42%;
  border-radius: 50%;
  background: #e9e4d8;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.4);
}

/* static light reflection: stays put while the grooves turn underneath */
.sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 35deg, transparent 0 12%, rgba(255, 255, 255, 0.16) 17%, transparent 24%,
      transparent 62%, rgba(255, 255, 255, 0.1) 67%, transparent 74%);
  pointer-events: none;
}

/* tonearm: rests off the record, swings onto it while playing */
.arm {
  position: absolute;
  top: -6px;
  right: -4px;
  width: 3px;
  height: 40px;
  border-radius: 2px;
  background: linear-gradient(var(--ink-3), var(--muted));
  transform-origin: 50% 3px;
  transform: rotate(-38deg);
  transition: transform 0.9s cubic-bezier(0.34, 1.4, 0.64, 1);
  pointer-events: none;
}

.arm::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3.5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink-2);
  box-shadow: 0 0 0 2px var(--bg);
}

.head {
  position: absolute;
  bottom: -5px;
  left: -2.5px;
  width: 8px;
  height: 9px;
  border-radius: 2px;
  background: var(--ink-2);
}

.turntable.playing .arm {
  transform: rotate(16deg);
}

/* play / pause hint on hover */
.state {
  position: absolute;
  inset: 31%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-size: 0.7rem;
  opacity: 0;
  background: rgba(0, 0, 0, 0.35);
  transition: opacity 0.25s;
}

.deck:hover .state,
.deck:focus-visible .state {
  opacity: 1;
}

@media (max-width: 640px) {
  .turntable {
    --size: 54px;
    right: calc(14px + env(safe-area-inset-right, 0px));
    bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  }
  /* on phones the pill shows only while playing, and compactly */
  .pill {
    padding: 0.35rem 0.35rem 0.35rem 0.7rem;
  }
  .artist,
  .prev {
    display: none;
  }
  .title {
    max-width: 130px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .eq.on i {
    animation: none;
    height: 8px;
  }
  .arm {
    transition: none;
  }
}
</style>
