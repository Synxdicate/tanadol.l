// Minimal Standard MIDI File (SMF type 0/1) reader: notes, tempo map and sustain pedal.
// Enough for solo-piano files; ignores everything else.

export interface MidiNote {
  t: number // start, seconds
  dur: number // seconds, already extended by the sustain pedal
  midi: number
  vel: number // 0..1
}

export interface MidiSong {
  notes: MidiNote[]
  duration: number
}

interface RawNote {
  tick: number
  offTick: number
  midi: number
  vel: number
  ch: number
}

export function parseMidi(buffer: ArrayBuffer): MidiSong {
  const d = new DataView(buffer)
  let p = 0
  const str = (n: number) => String.fromCharCode(...new Uint8Array(buffer, p, n))
  const u32 = () => ((p += 4), d.getUint32(p - 4))
  const u16 = () => ((p += 2), d.getUint16(p - 2))
  const u8 = () => d.getUint8(p++)
  const vlq = () => {
    let v = 0
    let b: number
    do {
      b = u8()
      v = (v << 7) | (b & 0x7f)
    } while (b & 0x80)
    return v
  }

  if (str(4) !== 'MThd') throw new Error('Not a MIDI file')
  const headerLen = d.getUint32(4)
  p = 8
  u16() // format
  const ntrks = u16()
  const division = u16()
  if (division & 0x8000) throw new Error('SMPTE time division is not supported')
  p = 8 + headerLen

  const tempos: { tick: number; usPerQ: number }[] = [{ tick: 0, usPerQ: 500000 }]
  const pedal: { tick: number; down: boolean; ch: number }[] = []
  const raw: RawNote[] = []

  for (let tr = 0; tr < ntrks && p < d.byteLength; tr++) {
    if (str(4) !== 'MTrk') break
    p += 4
    const len = u32()
    const end = p + len
    let tick = 0
    let status = 0
    const open = new Map<number, RawNote[]>() // key: ch*128+note

    while (p < end) {
      tick += vlq()
      const b = u8()
      if (b === 0xff) {
        const type = u8()
        const l = vlq()
        if (type === 0x51 && l === 3) tempos.push({ tick, usPerQ: (u8() << 16) | (u8() << 8) | u8() })
        else p += l
        continue
      }
      if (b === 0xf0 || b === 0xf7) {
        p += vlq()
        continue
      }
      if (b & 0x80) status = b
      else p-- // running status: b was the first data byte
      const kind = status & 0xf0
      const ch = status & 0x0f
      if (kind === 0x90 || kind === 0x80) {
        const note = u8()
        const vel = u8()
        const key = ch * 128 + note
        if (kind === 0x90 && vel > 0) {
          const n = { tick, offTick: -1, midi: note, vel: vel / 127, ch }
          raw.push(n)
          open.set(key, [...(open.get(key) ?? []), n])
        } else {
          const n = open.get(key)?.shift()
          if (n) n.offTick = tick
        }
      } else if (kind === 0xb0) {
        const cc = u8()
        const val = u8()
        if (cc === 64) pedal.push({ tick, down: val >= 64, ch })
      } else if (kind === 0xc0 || kind === 0xd0) {
        p += 1
      } else {
        p += 2 // 0xa0 aftertouch, 0xe0 pitch bend
      }
    }
    // close hanging notes at the end of the track
    for (const q of open.values()) for (const n of q) if (n.offTick < 0) n.offTick = tick
    p = end
  }

  // ticks → seconds through the tempo map
  tempos.sort((a, b) => a.tick - b.tick)
  const seg = tempos.map((t) => ({ ...t, sec: 0 }))
  for (let i = 1; i < seg.length; i++) {
    seg[i].sec = seg[i - 1].sec + ((seg[i].tick - seg[i - 1].tick) * seg[i - 1].usPerQ) / 1e6 / division
  }
  const toSec = (tick: number) => {
    let s = seg[0]
    for (const x of seg) if (x.tick <= tick) s = x
    return s.sec + ((tick - s.tick) * s.usPerQ) / 1e6 / division
  }

  // sustain pedal: a note released while the pedal is down rings until the pedal lifts
  pedal.sort((a, b) => a.tick - b.tick)
  const pedalUpAfter = (tick: number) => {
    let down = false
    for (const e of pedal) {
      if (e.tick <= tick) down = e.down
      else if (down && !e.down) return e.tick
    }
    return down ? Infinity : tick
  }
  const hasPedal = pedal.length > 0

  const notes = raw
    .filter((n) => n.ch !== 9) // skip the percussion channel, if any
    .map((n) => {
      const t = toSec(n.tick)
      let offTick = n.offTick
      if (hasPedal) {
        const up = pedalUpAfter(n.offTick)
        if (up !== n.offTick) offTick = Number.isFinite(up) ? up : n.offTick + division * 4
      }
      let dur = toSec(offTick) - t
      if (!hasPedal) dur = dur * 1.12 + 0.06 // light legato when the file has no pedal marks
      return { t, dur: Math.max(0.05, dur), midi: n.midi, vel: n.vel }
    })
    .sort((a, b) => a.t - b.t)

  const duration = notes.reduce((m, n) => Math.max(m, n.t + n.dur), 0)
  return { notes, duration }
}
