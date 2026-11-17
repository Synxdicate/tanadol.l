<script setup lang="ts">
// Fixed background: a faint dot grid with scroll parallax, a pointer "lens" that lifts
// and tints nearby dots, and a soft accent glow that drifts as you move down the page.
// Static (drawn once, no animation loop) for reduced-motion; pauses when the tab is hidden.
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let w = 0
let h = 0
let dpr = 1
let mx = -9999
let my = -9999
let lensX = -9999
let lensY = -9999
let scroll = 0
let smoothScroll = 0
let reduce = false
let colors = { dot: '', accent: '' }

const GAP = 26
const PARALLAX = 0.35 // the grid moves at 35% of scroll speed
const RADIUS = 150

const readColors = () => {
  const cs = getComputedStyle(document.documentElement)
  colors = { dot: cs.getPropertyValue('--ink').trim(), accent: cs.getPropertyValue('--accent').trim() }
}

const resize = () => {
  if (!canvas.value || !ctx) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = window.innerWidth
  h = window.innerHeight
  canvas.value.width = w * dpr
  canvas.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (reduce) draw()
}

const draw = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  const offset = -(smoothScroll * PARALLAX) % GAP
  const r2 = RADIUS * RADIUS

  ctx.fillStyle = colors.dot
  for (let y = offset - GAP; y < h + GAP; y += GAP) {
    for (let x = GAP / 2; x < w; x += GAP) {
      const dx = x - lensX
      const dy = y - lensY
      const d2 = dx * dx + dy * dy
      if (d2 < r2) continue // drawn in the lens pass
      ctx.globalAlpha = 0.11
      ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5)
    }
  }

  // lens: dots near the pointer grow, push outward and take the accent colour
  if (lensX > -999) {
    ctx.fillStyle = colors.accent
    // first grid row at or above the lens (grid rows sit at offset + k·GAP)
    const yStart = offset + Math.floor((lensY - RADIUS - offset) / GAP) * GAP
    for (let y = yStart; y < lensY + RADIUS + GAP; y += GAP) {
      const xStart = GAP / 2 + Math.floor((lensX - RADIUS - GAP / 2) / GAP) * GAP
      for (let x = xStart; x < lensX + RADIUS + GAP; x += GAP) {
        const dx = x - lensX
        const dy = y - lensY
        const d2 = dx * dx + dy * dy
        if (d2 >= r2) continue
        const t = 1 - Math.sqrt(d2) / RADIUS // 0 at the edge, 1 at the centre
        const push = t * t * 9
        const len = Math.sqrt(d2) || 1
        const px = x + (dx / len) * push
        const py = y + (dy / len) * push
        const s = 1.5 + t * 2.2
        ctx.globalAlpha = 0.12 + t * 0.55
        ctx.beginPath()
        ctx.arc(px, py, s / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1
}

const loop = () => {
  smoothScroll += (scroll - smoothScroll) * 0.12
  lensX += (mx - lensX) * 0.18
  lensY += (my - lensY) * 0.18
  if (mx < -999) lensX = lensY = -9999
  draw()
  // drifting glow follows page progress (handled in CSS via a custom property)
  const max = Math.max(1, document.documentElement.scrollHeight - h)
  document.documentElement.style.setProperty('--scroll-progress', (smoothScroll / max).toFixed(4))
  raf = requestAnimationFrame(loop)
}

const onScroll = () => (scroll = window.scrollY)
const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  mx = e.clientX
  my = e.clientY
}
const onLeave = () => (mx = my = -9999)
const onVisibility = () => {
  cancelAnimationFrame(raf)
  if (!document.hidden && !reduce) raf = requestAnimationFrame(loop)
}

let themeObserver: MutationObserver | null = null
let schemeQuery: MediaQueryList | null = null
const onTheme = () => {
  readColors()
  if (reduce) draw()
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  readColors()
  resize()
  scroll = smoothScroll = window.scrollY
  window.addEventListener('resize', resize)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('visibilitychange', onVisibility)
  themeObserver = new MutationObserver(onTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  schemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  schemeQuery.addEventListener('change', onTheme)
  if (reduce) draw()
  else raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  document.removeEventListener('visibilitychange', onVisibility)
  themeObserver?.disconnect()
  schemeQuery?.removeEventListener('change', onTheme)
})
</script>

<template>
  <div class="bg-fx no-print" aria-hidden="true">
    <div class="glow"></div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.bg-fx {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* fade the grid out toward the edges so it never competes with content */
  mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, #000 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, #000 40%, transparent 100%);
}

/* a slow accent glow that travels from top-right to bottom-left as you scroll */
.glow {
  position: absolute;
  width: 60vmax;
  height: 60vmax;
  left: calc(70% - var(--scroll-progress, 0) * 60%);
  top: calc(-20% + var(--scroll-progress, 0) * 70%);
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 13%, transparent) 0%, transparent 65%);
  filter: blur(20px);
}
</style>
