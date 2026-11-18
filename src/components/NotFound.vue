<script setup lang="ts">
// 404: the site cat has wandered off with this page. Offers the main destinations and ⌘K.
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CAT_PALETTE, CAT_SPRITES } from '../catSprites'

const route = useRoute()
const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  CAT_SPRITES.sleep.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === '.') return
      ctx.fillStyle = CAT_PALETTE[ch]
      ctx.fillRect(x, y, 1, 1)
    }),
  )
})

const links = [
  { to: '/', label: 'Home', icon: 'pi-home' },
  { to: '/project', label: 'Projects', icon: 'pi-code' },
  { to: '/article', label: 'Articles', icon: 'pi-pencil' },
  { to: '/books', label: 'Bookshelf', icon: 'pi-book' },
]
const openPalette = () => window.dispatchEvent(new CustomEvent('site:open-palette'))
</script>

<template>
  <div class="page nf">
    <div class="scene" aria-hidden="true">
      <canvas ref="canvas" width="24" height="22"></canvas>
      <span class="z font-mono"><i>z</i><i>z</i><i>Z</i></span>
    </div>

    <p class="code font-mono">404 · {{ route.path }}</p>
    <h1 class="page-title">Lost?</h1>
    <p class="lead">The cat fell asleep on this page and there's nothing here. Try one of these instead.</p>

    <nav class="links" aria-label="Main pages">
      <router-link v-for="l in links" :key="l.to" :to="l.to" class="card link">
        <i :class="['pi', l.icon]"></i> {{ l.label }}
      </router-link>
    </nav>

    <button class="search font-mono" @click="openPalette"><i class="pi pi-search"></i> Search the site (Ctrl+K)</button>
  </div>
</template>

<style scoped>
.nf {
  max-width: 620px;
  text-align: center;
  padding-top: 2.5rem;
}

.scene {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

canvas {
  width: 120px;
  height: 110px;
  image-rendering: pixelated;
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.12));
}

.z {
  position: absolute;
  top: 6px;
  right: -14px;
  color: var(--muted);
  font-weight: 700;
}

.z i {
  position: absolute;
  font-style: normal;
  opacity: 0;
  animation: z 3s infinite;
}
.z i:nth-child(2) {
  animation-delay: 1s;
  font-size: 1.1em;
}
.z i:nth-child(3) {
  animation-delay: 2s;
  font-size: 1.3em;
}

@keyframes z {
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(14px, -30px);
  }
}

.code {
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0 0 1.6rem; /* the script title's flourishes rise above its box */
  word-break: break-all;
}

.lead {
  color: var(--ink-3);
  margin: 0.75rem 0 1.75rem;
  line-height: 1.7;
}

.links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
}

.link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.link .pi {
  color: var(--accent-text);
}

.search {
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
  background: none;
  border: 1px dashed var(--line);
  border-radius: 999px;
  padding: 0.5rem 1rem;
}

.search:hover {
  color: var(--accent-text);
  border-color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .z i {
    animation: none;
    opacity: 0.7;
  }
}
</style>
