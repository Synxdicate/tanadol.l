<script setup lang="ts">
// Desktop-only pointer effects (the cursor itself is a pixel-art system cursor, see pixelCursor.ts):
//  • a soft spotlight inside any .card under the pointer (via --mx / --my)
//  • "magnetic" pull on elements marked with [data-magnetic]
// Disabled on touch devices and when the visitor prefers reduced motion.
import { onMounted, onUnmounted } from 'vue'

let magnet: HTMLElement | null = null

const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  const target = e.target as Element | null

  const card = target?.closest<HTMLElement>('.card')
  if (card) {
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const m = target?.closest<HTMLElement>('[data-magnetic]') ?? null
  if (magnet && magnet !== m) magnet.style.transform = ''
  magnet = m
  if (m) {
    const r = m.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.25
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.35
    m.style.transform = `translate(${dx}px, ${dy}px)`
  }
}

onMounted(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduce) return
  document.documentElement.classList.add('has-cursor-fx')
  window.addEventListener('pointermove', onMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onMove)
  document.documentElement.classList.remove('has-cursor-fx')
})
</script>

<template>
  <span hidden></span>
</template>

<style>
/* pixel cursors: arrow everywhere, cat paw on anything clickable */
html.pixel-cursor {
  cursor: var(--cursor-default);
}

html.pixel-cursor :is(a, button, [role='tab'], label, summary, select, .deck, a.card) {
  cursor: var(--cursor-pointer);
}

html.pixel-cursor :is(input[type='text'], input[type='email'], textarea) {
  cursor: text;
}

/* spotlight that follows the pointer inside cards */
.has-cursor-fx .card {
  position: relative;
  isolation: isolate;
}

.has-cursor-fx .card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--accent) 10%, transparent),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.35s;
  pointer-events: none;
  z-index: -1;
}

.has-cursor-fx .card:hover::before {
  opacity: 1;
}

[data-magnetic] {
  transition: transform 0.35s var(--ease), background 0.3s, color 0.3s, border-color 0.3s !important;
}
</style>
