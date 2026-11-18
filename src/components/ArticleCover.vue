<script setup lang="ts">
// Generative cover art for each essay, drawn from the essay's own ideas.
//  • incompleteness-of-mathematics: Euclid-style construction lines, a golden spiral and
//    the Gödel sentence floating among logic symbols
//  • language-education-and-the-people: Badiou's set picture — S (everyone under the state)
//    as a dot grid, L ⊂ S (those who speak the state's language) in the accent colour,
//    and ringed dots for the "singular" members the count leaves out
// Pure SVG in theme colours, so it works in light and dark mode at any size.
import { computed } from 'vue'
import { findArticle } from '../data/articles'

const props = withDefaults(defineProps<{ slug: string; compact?: boolean }>(), { compact: false })

// deterministic pseudo-random so the art is identical on every render
const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// ---------- mathematics ----------
// golden spiral: r = a·e^(bθ) with b = ln(φ)/(π/2), so the radius grows by φ every quarter turn
const golden = (() => {
  const b = Math.log(1.618034) / (Math.PI / 2)
  const cx = 905
  const cy = 205
  const pts: string[] = []
  for (let t = 0; t <= 5 * Math.PI; t += 0.05) {
    const r = 2 * Math.exp(b * t)
    pts.push(`${(cx + r * Math.cos(t)).toFixed(1)},${(cy - r * Math.sin(t)).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
})()

// logic symbols placed around the spiral, never on top of it or past the edge
const symbols = [
  { t: 'G ↔ ¬Prov(⌜G⌝)', x: 560, y: 64, size: 24, o: 0.75 },
  { t: '∀x', x: 1100, y: 70, size: 34, o: 0.5 },
  { t: '∃y', x: 560, y: 160, size: 30, o: 0.45 },
  { t: 'ℕ', x: 1130, y: 180, size: 34, o: 0.45 },
  { t: '⊢', x: 600, y: 250, size: 36, o: 0.5 },
  { t: '¬', x: 1120, y: 280, size: 34, o: 0.4 },
  { t: '1 + 1 = 2', x: 560, y: 360, size: 24, o: 0.7 },
  { t: '{x | x ∉ x}', x: 960, y: 372, size: 22, o: 0.6 },
  { t: 'φ', x: 785, y: 120, size: 30, o: 0.55 },
  { t: '∞', x: 1010, y: 100, size: 30, o: 0.4 },
]

// ---------- language & the people ----------
const dots = (() => {
  const r = rand(42)
  const cols = 30
  const rows = 9
  const out: { x: number; y: number; kind: 'L' | 'S' | 'event' }[] = []
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = 70 + i * 36 + (j % 2) * 18
      const y = 60 + j * 36
      // L: a soft blob in the middle-left — the counted, "speaking" part of S
      const inL = ((x - 470) / 330) ** 2 + ((y - 200) / 120) ** 2 < 1
      const event = !inL && r() < 0.035
      out.push({ x, y, kind: inL ? 'L' : event ? 'event' : 'S' })
    }
  return out
})()

const kind = computed(() => (props.slug.includes('language') ? 'set' : 'math'))
const image = computed(() => findArticle(props.slug)?.cover)
// covers in public/articles/covers/ come in three widths (-sm 640, -md 1200, original 1600)
const srcset = computed(() => {
  const src = image.value
  if (!src || !/^\/articles\/covers\/.+\.webp$/.test(src)) return undefined
  const base = src.replace(/\.webp$/, '')
  return `${base}-sm.webp 640w, ${base}-md.webp 1200w, ${src} 1600w`
})
</script>

<template>
  <figure :class="['cover', kind, { compact }]" aria-hidden="true">
    <img
      v-if="image"
      v-fade-img
      :src="image"
      :srcset="srcset"
      :sizes="compact ? '(max-width: 720px) 92vw, 320px' : '(max-width: 900px) 100vw, 840px'"
      alt=""
      class="photo"
      :loading="compact ? 'lazy' : 'eager'"
      :fetchpriority="compact ? 'auto' : 'high'"
      decoding="async"
    />
    <svg v-else viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      <rect width="1200" height="400" class="ground" />

      <template v-if="kind === 'math'">
        <!-- construction: circle, inscribed triangle, axes -->
        <g class="line">
          <circle cx="300" cy="200" r="150" />
          <circle cx="300" cy="200" r="92" />
          <path d="M 300 50 L 430 275 L 170 275 Z" />
          <path d="M 120 200 L 480 200 M 300 30 L 300 370" class="dash" />
          <path d="M 170 275 L 430 125" class="dash" />
          <path :d="golden" class="accent-line" />
          <rect x="640" y="40" width="485" height="300" class="dash" />
        </g>
        <g class="glyphs">
          <text v-for="(s, i) in symbols" :key="i" :x="s.x" :y="s.y" :font-size="s.size" :opacity="s.o">{{ s.t }}</text>
        </g>
        <circle cx="300" cy="50" r="5" class="dot-accent" />
        <circle cx="430" cy="275" r="5" class="dot-accent" />
        <circle cx="170" cy="275" r="5" class="dot-accent" />
      </template>

      <template v-else>
        <ellipse cx="470" cy="200" rx="345" ry="135" class="set-l" />
        <g>
          <template v-for="(d, i) in dots" :key="i">
            <circle :cx="d.x" :cy="d.y" :r="d.kind === 'L' ? 6 : 4" :class="`d-${d.kind}`" />
            <circle v-if="d.kind === 'event'" :cx="d.x" :cy="d.y" r="13" class="ring" />
          </template>
        </g>
        <g class="labels">
          <text x="70" y="36">L ⊂ S</text>
          <text x="1060" y="390">S \ L</text>
        </g>
      </template>
    </svg>
  </figure>
</template>

<style scoped>
.cover {
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--line);
  aspect-ratio: 3 / 1;
  max-width: 100%;
  background: var(--card);
}

.cover.compact {
  aspect-ratio: 16 / 7;
  border-radius: 10px;
}

.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}

svg {
  display: block;
  width: 100%;
  height: 100%;
}

.ground {
  fill: color-mix(in srgb, var(--accent) 5%, var(--bg));
}

.line circle,
.line path,
.line rect {
  fill: none;
  stroke: var(--ink);
  stroke-opacity: 0.45;
  stroke-width: 1.5;
}

.dash {
  stroke-dasharray: 6 8;
  stroke-opacity: 0.25 !important;
}

.accent-line {
  stroke: var(--accent) !important;
  stroke-opacity: 0.9 !important;
  stroke-width: 2.5 !important;
}

.dot-accent {
  fill: var(--accent);
}

.glyphs text {
  fill: var(--ink);
  font-family: var(--font-mono);
}

.set-l {
  fill: color-mix(in srgb, var(--accent) 10%, transparent);
  stroke: var(--accent);
  stroke-opacity: 0.6;
  stroke-width: 1.5;
  stroke-dasharray: 8 6;
}

.d-L {
  fill: var(--accent);
}

.d-S {
  fill: var(--ink);
  opacity: 0.28;
}

.d-event {
  fill: var(--ink);
  opacity: 0.85;
}

.ring {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
}

.labels text {
  font-family: var(--font-mono);
  font-size: 26px;
  fill: var(--ink);
  opacity: 0.6;
}
</style>
