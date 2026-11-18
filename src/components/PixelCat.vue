<script setup lang="ts">
// The site cat (original pixel art) and its house.
//  • follows the mouse at a cat's pace, sits beside it, grooms, then naps when you stop moving
//  • click / tap the cat to pet it → hearts; petting a sleeping cat wakes it
//  • click the house to send the cat home (it walks in) or call it back out; remembered
//  • on touch screens the cat wanders along the bottom of the screen on its own
//  • reduced motion: the cat naps beside its house
import { onMounted, onUnmounted, ref } from 'vue'
import { CAT_H, CAT_PALETTE, CAT_SPRITES, CAT_W, HOUSE, HOUSE_H, HOUSE_PALETTE, HOUSE_W, type CatPose } from '../catSprites'

type State = 'sit' | 'walk' | 'sleep' | 'groom'

const SCALE = 2
const SPEED = 140 // px / s
const STOP = 38 // distance at which the cat stops and sits
const PREF_KEY = 'cat'

const canvas = ref<HTMLCanvasElement | null>(null)
const houseCanvas = ref<HTMLCanvasElement | null>(null)
const el = ref<HTMLElement | null>(null)
const houseEl = ref<HTMLElement | null>(null)
const hearts = ref<{ id: number; x: number }[]>([])
const sleeping = ref(false)
const atHome = ref(false) // cat is inside the house
const goingHome = ref(false)
const moving = ref(false) // while walking the cat is click-through, so it never blocks a link
let heartId = 0

// ---------- drawing ----------
const paint = (c: HTMLCanvasElement | null, grid: string[][], palette: Record<string, string>, flip = false) => {
  const ctx = c?.getContext('2d')
  if (!ctx) return
  const w = grid[0].length
  ctx.clearRect(0, 0, w, grid.length)
  grid.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === '.') return
      ctx.fillStyle = palette[ch]
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1)
    }),
  )
}

// ---------- behaviour ----------
let x = 0
let y = 0
let tx = 0
let ty = 0
let facing = 1
let state: State = 'sit'
let idle = 0
let walkClock = 0
let walkFrame = 0
let blinkClock = 0
let groomClock = 0
let last = 0
let raf = 0
let wanderTimer = 0
let lastPose = ''

const groundY = () => window.innerHeight - 14
const door = () => {
  const r = houseEl.value?.getBoundingClientRect()
  return r ? { x: r.left + r.width / 2, y: r.bottom - 4 } : { x: 60, y: groundY() }
}

const setTarget = (px: number, py: number) => {
  // keep clear of the music turntable in the bottom-right corner
  const nearBottom = py > window.innerHeight - 120
  const maxX = nearBottom ? window.innerWidth - 190 : window.innerWidth - 40
  tx = Math.min(Math.max(px, 40), maxX)
  ty = Math.min(Math.max(py, 70), groundY())
}

const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || goingHome.value || atHome.value) return
  setTarget(e.clientX - 26, e.clientY + 44) // sit just below-left of the pointer
}

const wander = () => {
  if (!goingHome.value && !atHome.value) setTarget(120 + Math.random() * (window.innerWidth - 320), groundY())
  wanderTimer = window.setTimeout(wander, 7000 + Math.random() * 9000)
}

const place = () => {
  if (el.value) el.value.style.transform = `translate3d(${Math.round(x - (CAT_W * SCALE) / 2)}px, ${Math.round(y - CAT_H * SCALE)}px, 0)`
}

const step = (now: number) => {
  const dt = Math.min(0.05, (now - last) / 1000 || 0)
  last = now
  raf = requestAnimationFrame(step)
  if (atHome.value) return

  if (goingHome.value) {
    const d = door()
    tx = d.x
    ty = d.y
  }
  const dx = tx - x
  const dy = ty - y
  const dist = Math.hypot(dx, dy)
  const stopAt = goingHome.value ? 4 : STOP

  moving.value = dist > stopAt
  if (dist > stopAt) {
    state = 'walk'
    sleeping.value = false
    const v = Math.min(SPEED * dt, dist - stopAt + 1)
    x += (dx / dist) * v
    y += (dy / dist) * v
    if (Math.abs(dx) > 3) facing = dx > 0 ? 1 : -1
    idle = 0
  } else if (goingHome.value) {
    goingHome.value = false
    atHome.value = true
    return
  } else if (state === 'walk') {
    state = 'sit'
    idle = 0
  }

  if (state !== 'walk') {
    idle += dt
    if (state === 'sit' && idle > 5 && groomClock === 0) {
      state = 'groom'
    }
    if (state === 'groom') {
      groomClock += dt
      if (groomClock > 1.8) state = 'sit'
    }
    if (idle > 14 && state !== 'sleep') {
      state = 'sleep'
      sleeping.value = true
    }
  } else {
    groomClock = 0
  }

  let pose: CatPose
  if (state === 'walk') {
    walkClock += dt
    if (walkClock > 0.14) {
      walkClock = 0
      walkFrame ^= 1
    }
    pose = walkFrame ? 'walk1' : 'walk0'
  } else if (state === 'sleep') {
    pose = 'sleep'
  } else if (state === 'groom') {
    pose = Math.floor(groomClock * 5) % 2 ? 'groom' : 'blink'
  } else {
    blinkClock += dt
    pose = blinkClock % 3.6 > 3.45 ? 'blink' : 'sit'
  }

  const key = pose + facing
  if (key !== lastPose) {
    paint(canvas.value, CAT_SPRITES[pose], CAT_PALETTE, facing < 0)
    lastPose = key
  }
  place()
}

const pet = () => {
  idle = 0
  groomClock = 0
  if (state === 'sleep') {
    state = 'sit'
    sleeping.value = false
  }
  const id = ++heartId
  hearts.value.push({ id, x: (Math.random() - 0.5) * 30 })
  setTimeout(() => (hearts.value = hearts.value.filter((h) => h.id !== id)), 1200)
}

const writePref = (v: 'home' | 'out') => {
  try {
    localStorage.setItem(PREF_KEY, v)
  } catch {
    /* storage blocked: lasts for this visit */
  }
}

const toggleHome = () => {
  if (atHome.value || goingHome.value) {
    // come out of the door and stretch the legs
    goingHome.value = false
    atHome.value = false
    const d = door()
    x = d.x
    y = d.y
    setTarget(d.x + 90, groundY())
    state = 'walk'
    lastPose = ''
    writePref('out')
  } else {
    goingHome.value = true
    writePref('home')
  }
}

const onResize = () => setTarget(tx, ty)
const onCatRequest = () => toggleHome()

onMounted(() => {
  window.addEventListener('site:toggle-cat', onCatRequest)
  paint(houseCanvas.value, HOUSE, HOUSE_PALETTE)
  let pref: string | null = null
  try {
    pref = localStorage.getItem(PREF_KEY)
  } catch {
    /* ignore */
  }
  const d = door()
  x = tx = d.x + 70
  y = ty = groundY()
  atHome.value = pref === 'home'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state = 'sleep'
    sleeping.value = !atHome.value
    paint(canvas.value, CAT_SPRITES.sleep, CAT_PALETTE)
    place()
    return
  }
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', onMove, { passive: true })
  } else {
    wanderTimer = window.setTimeout(wander, 3000)
  }
  window.addEventListener('resize', onResize)
  last = performance.now()
  raf = requestAnimationFrame(step)
})

onUnmounted(() => {
  window.removeEventListener('site:toggle-cat', onCatRequest)
  cancelAnimationFrame(raf)
  clearTimeout(wanderTimer)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="cat-layer no-print">
    <!-- the house: send the cat home / call it out -->
    <button
      ref="houseEl"
      class="house"
      :aria-label="atHome ? 'Call the cat out' : 'Send the cat home'"
      :aria-pressed="atHome"
      @click="toggleHome"
    >
      <canvas ref="houseCanvas" :width="HOUSE_W" :height="HOUSE_H"></canvas>
      <span v-if="atHome" class="zzz home-z font-mono" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span>
      <span class="tip font-mono">{{ atHome ? 'call the cat' : 'cat house' }}</span>
    </button>

    <!-- the cat -->
    <div v-show="!atHome" ref="el" class="cat">
      <button :class="['body', { moving }]" aria-label="Pet the cat" @click="pet">
        <canvas ref="canvas" :width="CAT_W" :height="CAT_H"></canvas>
      </button>
      <span v-if="sleeping" class="zzz font-mono" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span>
      <span v-for="h in hearts" :key="h.id" class="heart" :style="{ '--hx': `${h.x}px` }" aria-hidden="true"></span>
    </div>
  </div>
</template>

<style scoped>
.cat-layer {
  position: fixed;
  inset: 0;
  z-index: 110;
  pointer-events: none;
}

/* ---------- house ---------- */
.house {
  position: absolute;
  left: calc(16px + env(safe-area-inset-left, 0px));
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  padding: 0;
  border: none;
  background: none;
  pointer-events: auto;
  transition: transform 0.3s var(--ease);
}

.house:hover {
  transform: translateY(-2px);
}

.house canvas {
  display: block;
  width: calc(18px * 2.5);
  height: calc(16px * 2.5);
  image-rendering: pixelated;
  filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.12));
}

.house .tip {
  position: absolute;
  left: 52px;
  bottom: 10px;
  white-space: nowrap;
  font-size: 0.66rem;
  color: var(--muted);
  background: var(--bg);
  border: 1px solid var(--line);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s, transform 0.25s var(--ease);
  pointer-events: none;
}

.house:hover .tip,
.house:focus-visible .tip {
  opacity: 1;
  transform: none;
}

/* ---------- cat ---------- */
.cat {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.body.moving {
  pointer-events: none;
}

.body {
  display: block;
  padding: 0;
  border: none;
  background: none;
  pointer-events: auto;
  filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.12));
}

.cat canvas {
  display: block;
  width: calc(24px * 2);
  height: calc(22px * 2);
  image-rendering: pixelated;
}

.zzz {
  position: absolute;
  left: 38px;
  top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
}

.home-z {
  left: 32px;
  top: -6px;
}

.zzz i {
  position: absolute;
  font-style: normal;
  opacity: 0;
  animation: zzz 3s infinite;
}
.zzz i:nth-child(2) {
  animation-delay: 1s;
  font-size: 13px;
}
.zzz i:nth-child(3) {
  animation-delay: 2s;
  font-size: 15px;
}

@keyframes zzz {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(12px, -26px);
  }
}

/* pixel heart (box-shadow sprite) */
.heart {
  position: absolute;
  left: calc(20px + var(--hx));
  top: 0;
  width: 2px;
  height: 2px;
  color: var(--accent);
  box-shadow:
    2px 0, 4px 0, 8px 0, 10px 0,
    0 2px, 2px 2px, 4px 2px, 6px 2px, 8px 2px, 10px 2px, 12px 2px,
    0 4px, 2px 4px, 4px 4px, 6px 4px, 8px 4px, 10px 4px, 12px 4px,
    2px 6px, 4px 6px, 6px 6px, 8px 6px, 10px 6px,
    4px 8px, 6px 8px, 8px 8px,
    6px 10px;
  animation: heart 1.2s var(--ease) forwards;
}

@keyframes heart {
  from {
    opacity: 1;
    transform: translateY(0) scale(0.6);
  }
  to {
    opacity: 0;
    transform: translateY(-46px) scale(1);
  }
}

@media (max-width: 640px) {
  .house canvas {
    width: calc(18px * 2);
    height: calc(16px * 2);
  }
  .house .tip {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zzz i {
    animation: none;
    opacity: 0.8;
  }
}
</style>
