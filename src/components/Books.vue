<script setup lang="ts">
// The bookshelf: a wooden bookcase of spines. Hover lifts a book, click puts it on the
// reading desk above (large cover + details). Reading books carry a ribbon bookmark.
import { computed, ref } from 'vue'
import { books, type Book } from '../data/books'

type Filter = 'All' | 'Reading' | 'Completed'
const filter = ref<Filter>('All')
const counts = computed(() => ({
  All: books.length,
  Reading: books.filter((b) => b.status === 'Reading').length,
  Completed: books.filter((b) => b.status === 'Completed').length,
}))
const shown = computed(() => (filter.value === 'All' ? books : books.filter((b) => b.status === filter.value)))

const selected = ref<Book>(books.find((b) => b.status === 'Reading') ?? books[0])
const desk = ref<HTMLElement | null>(null)

const pick = (b: Book, reveal = true) => {
  selected.value = b
  // on small screens the desk is above the shelf: bring it back into view
  if (reveal && desk.value) {
    const r = desk.value.getBoundingClientRect()
    if (r.top < 0 || r.bottom > window.innerHeight) desk.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/** step through the books currently on the shelf (respects the filter) */
const step = (dir: number) => {
  const list = shown.value
  const i = list.findIndex((b) => b.title === selected.value.title)
  pick(list[(i + dir + list.length) % list.length], false)
}

// arrow keys move along the shelf
const onSpineKey = (e: KeyboardEvent, i: number) => {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!dir) return
  e.preventDefault()
  const list = shown.value
  const next = (i + dir + list.length) % list.length
  pick(list[next], false)
  ;(document.querySelectorAll<HTMLButtonElement>('.spine')[next])?.focus()
}
// match by title: `selected` holds a reactive proxy, so indexOf would never find it
const index = computed(() => books.findIndex((b) => b.title === selected.value.title) + 1)

// ---------- spine look, derived from the title so it's stable ----------
const hash = (s: string) => {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return h
}
const CLOTH = ['#2f4a3a', '#2b3a55', '#5a2a2e', '#7a5a22', '#3d3d4a', '#4a2f45', '#1f4b4f', '#6b3b22', '#264040', '#8a4b2f', '#3e4f2c', '#2a2a2a']
const spine = (b: Book) => {
  const h = hash(b.title)
  return {
    color: CLOTH[h % CLOTH.length],
    width: 30 + ((h >> 4) % 18), // 30–47px
    height: 82 + ((h >> 9) % 18), // 82–99% of the shelf height
    bands: (h >> 13) % 3, // decoration style
  }
}

const imgFailed = ref(new Set<string>())
const onImgError = (title: string) => (imgFailed.value = new Set(imgFailed.value).add(title))
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Bookshelf</h1>
      <p class="page-subtitle">
        Philosophy, literature, economics and the odd book on learning. {{ counts.All }} on the shelf,
        {{ counts.Completed }} finished.
      </p>
    </header>

    <!-- reading desk: the picked book -->
    <section ref="desk" class="desk card" aria-live="polite">
      <div class="desk-nav">
        <button class="nav-btn" aria-label="Previous book" @click="step(-1)"><i class="pi pi-arrow-left"></i></button>
        <button class="nav-btn" aria-label="Next book" @click="step(1)"><i class="pi pi-arrow-right"></i></button>
      </div>
      <Transition name="swap" mode="out-in">
        <div :key="selected.title" class="desk-inner">
          <div class="desk-cover" :style="{ '--cloth': spine(selected).color }">
            <img
              v-if="!imgFailed.has(selected.title)"
              :src="selected.coverArt"
              alt=""
              referrerpolicy="no-referrer"
              @error="onImgError(selected.title)"
            />
            <div v-else class="cloth-cover">
              <span class="f-title">{{ selected.title }}</span>
              <span class="f-rule"></span>
              <span class="f-author">{{ selected.author }}</span>
            </div>
          </div>
          <div class="desk-text">
            <span class="desk-no font-mono">No. {{ String(index).padStart(2, '0') }} / {{ books.length }}</span>
            <h2 class="desk-title">{{ selected.title }}</h2>
            <p class="desk-author">{{ selected.author }}</p>
            <span :class="['status', selected.status.toLowerCase()]">
              <i :class="['pi', selected.status === 'Reading' ? 'pi-bookmark-fill' : 'pi-check']"></i>
              {{ selected.status === 'Reading' ? 'Currently reading' : 'Finished' }}
            </span>
            <p class="hint font-mono">Pick another book from the shelf below.</p>
          </div>
        </div>
      </Transition>
    </section>

    <div class="toolbar">
      <div class="filters" role="tablist">
        <button
          v-for="f in (['All', 'Reading', 'Completed'] as const)"
          :key="f"
          role="tab"
          :aria-selected="filter === f"
          :class="['filter-btn', { active: filter === f }]"
          @click="filter = f"
        >
          {{ f }} <span class="count font-mono">{{ counts[f] }}</span>
        </button>
      </div>
      <span class="legend font-mono"><span class="mini-ribbon" aria-hidden="true"></span> reading now</span>
    </div>

    <!-- the bookcase -->
    <div class="bookcase">
      <TransitionGroup tag="ul" name="shelf" class="shelf" aria-label="Books">
        <li v-for="(b, i) in shown" :key="b.title" class="slot" :style="{ '--h': spine(b).height + '%' }">
          <button
            :class="['spine', `bands-${spine(b).bands}`, { active: selected.title === b.title }]"
            :style="{ '--cloth': spine(b).color, width: spine(b).width + 'px' }"
            :aria-label="`${b.title} by ${b.author}, ${b.status.toLowerCase()}`"
            :aria-pressed="selected.title === b.title"
            @click="pick(b)"
            @keydown="(e: KeyboardEvent) => onSpineKey(e, i)"
          >
            <span v-if="b.status === 'Reading'" class="ribbon" aria-hidden="true"></span>
            <span class="band top" aria-hidden="true"></span>
            <span class="s-title">{{ b.title }}</span>
            <span class="band bottom" aria-hidden="true"></span>
            <span class="s-author font-mono">{{ b.author.split(' ').slice(-1)[0] }}</span>
          </button>
          <!-- hover preview -->
          <span class="peek" aria-hidden="true">
            <img v-if="!imgFailed.has(b.title)" :src="b.coverArt" alt="" loading="lazy" referrerpolicy="no-referrer" @error="onImgError(b.title)" />
            <span v-else class="peek-cloth" :style="{ background: spine(b).color }"></span>
            <span class="peek-text">
              <span class="peek-title">{{ b.title }}</span>
              <span class="peek-author">{{ b.author }}</span>
            </span>
          </span>
        </li>
        <!-- a little plant at the end of the shelf -->
        <li key="__plant" class="slot plant" aria-hidden="true">
          <svg viewBox="0 0 16 20" shape-rendering="crispEdges">
            <rect x="7" y="2" width="2" height="2" fill="#5f8f4a" />
            <rect x="4" y="4" width="3" height="2" fill="#5f8f4a" />
            <rect x="9" y="3" width="3" height="2" fill="#4d7a3c" />
            <rect x="2" y="6" width="4" height="2" fill="#4d7a3c" />
            <rect x="10" y="6" width="4" height="2" fill="#5f8f4a" />
            <rect x="7" y="4" width="2" height="8" fill="#3f6a31" />
            <rect x="5" y="8" width="2" height="2" fill="#5f8f4a" />
            <rect x="9" y="9" width="3" height="2" fill="#4d7a3c" />
            <rect x="3" y="12" width="10" height="2" fill="#b4532a" />
            <rect x="4" y="14" width="8" height="5" fill="#d0683a" />
            <rect x="4" y="14" width="8" height="1" fill="#e58a5a" />
          </svg>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* ---------- reading desk ---------- */
.desk {
  position: relative;
  padding: 1.5rem;
  margin-bottom: 2.25rem;
  background:
    radial-gradient(120% 120% at 0% 0%, var(--accent-soft), transparent 55%),
    var(--card);
}

.desk-nav {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  gap: 0.4rem;
}

.nav-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink-2);
  font-size: 0.75rem;
  transition: color 0.2s, border-color 0.2s, transform 0.2s var(--ease);
}

.nav-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.nav-btn:active {
  transform: scale(0.92);
}

.desk-inner {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 1.75rem;
  align-items: center;
}

.desk-cover {
  aspect-ratio: 2 / 3;
  border-radius: 3px 6px 6px 3px;
  overflow: hidden;
  background: var(--cloth);
  box-shadow:
    0 18px 30px -12px rgba(0, 0, 0, 0.5),
    inset 3px 0 0 rgba(0, 0, 0, 0.18);
  transform: rotate(-2deg);
}

.desk-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cloth-cover {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem;
  text-align: center;
  color: #f3e6c8;
  background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 4px);
}

.f-title {
  font-family: var(--font-serif-th);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.3;
}

.f-rule {
  width: 30px;
  height: 1px;
  background: #d8b46a;
}

.f-author {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

.desk-text {
  padding-right: 4.75rem; /* room for the ← → buttons */
}

@media (max-width: 640px) {
  .desk-text {
    padding-right: 0;
  }
  .desk-nav {
    top: auto;
    bottom: 0.9rem;
  }
}

.desk-no {
  font-size: 0.68rem;
  color: var(--muted);
}

.desk-title {
  font-family: var(--font-serif-th);
  font-size: clamp(1.5rem, 3.5vw, 2.2rem);
  line-height: 1.25;
  margin: 0.35rem 0 0.3rem;
}

.desk-author {
  margin: 0 0 1rem;
  color: var(--ink-3);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--line);
}

.status.reading {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: var(--accent-soft);
}

.status.completed {
  color: var(--ink-3);
}

.hint {
  margin: 1.25rem 0 0;
  font-size: 0.68rem;
  color: var(--muted);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.25s ease, transform 0.35s var(--ease);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- toolbar ---------- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--line);
}

.filters {
  display: flex;
  gap: 1.75rem;
}

.filter-btn {
  font-family: var(--font-sans);
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0 0 0.6rem;
  border-bottom: 2px solid transparent;
  transition: color 0.3s, border-color 0.3s;
}

.filter-btn.active,
.filter-btn:hover {
  color: var(--accent);
}

.filter-btn.active {
  border-color: var(--accent);
}

.count {
  font-size: 0.65rem;
  opacity: 0.7;
  margin-left: 0.2rem;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.68rem;
  color: var(--muted);
  padding-bottom: 0.6rem;
}

.mini-ribbon {
  width: 7px;
  height: 14px;
  background: var(--accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
}

/* ---------- bookcase ---------- */
.bookcase {
  --row: 210px;
  --plank: 16px;
  --wood: #8a5a34;
  --wood-light: #a8713f;
  --wood-dark: #5e3b20;
  --back: #3a2a1f;
  padding: 18px 18px 0;
  border-radius: 10px;
  background: linear-gradient(180deg, var(--wood-light), var(--wood) 40%, var(--wood-dark));
  box-shadow:
    0 30px 60px -25px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.shelf {
  list-style: none;
  margin: 0;
  padding: 0 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0 3px;
  border-radius: 4px 4px 0 0;
  /* a plank (top face + front edge) under every row, a shadow under each plank, and the back panel */
  background:
    linear-gradient(
        to bottom,
        transparent calc(var(--row) - var(--plank)),
        var(--wood-light) calc(var(--row) - var(--plank)),
        var(--wood-light) calc(var(--row) - var(--plank) + 4px),
        var(--wood) calc(var(--row) - var(--plank) + 4px),
        var(--wood-dark) var(--row)
      )
      0 0 / 100% var(--row),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent 30%) 0 0 / 100% var(--row),
    radial-gradient(120% 90% at 50% 40%, color-mix(in srgb, var(--back) 80%, #6b4a33), var(--back));
}

.slot {
  position: relative;
  height: calc(var(--row) - var(--plank));
  display: flex;
  align-items: flex-end;
}

/* hover preview card: cover thumbnail + full title */
.peek {
  position: absolute;
  bottom: calc(var(--h) + 18px);
  left: 50%;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: max-content;
  max-width: 260px;
  padding: 0.55rem 0.8rem 0.55rem 0.55rem;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 16px 36px var(--shadow);
  opacity: 0;
  transform: translate(-50%, 8px) scale(0.97);
  transform-origin: 50% 100%;
  transition: opacity 0.2s, transform 0.3s var(--ease);
  pointer-events: none;
}

.slot:hover .peek,
.spine:focus-visible + .peek {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.peek img,
.peek-cloth {
  width: 40px;
  height: 60px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 2px 4px 4px 2px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.peek-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.peek-title {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.3;
  color: var(--ink);
}

.peek-author {
  font-size: 0.72rem;
  color: var(--muted);
}

@media (hover: none) {
  .peek {
    display: none;
  }
}

.spine {
  position: relative;
  height: var(--h);
  padding: 10px 0 8px;
  border: none;
  border-radius: 3px 3px 1px 1px;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.35), rgba(255, 255, 255, 0.12) 18%, rgba(255, 255, 255, 0.04) 50%, rgba(0, 0, 0, 0.3)),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.025) 0 2px, transparent 2px 4px),
    var(--cloth);
  color: #f1e3c4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.35);
  transform-origin: 50% 100%;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease), filter 0.3s;
}

.spine:hover,
.spine:focus-visible {
  transform: translateY(-12px);
  box-shadow: 2px 10px 14px rgba(0, 0, 0, 0.45);
  filter: brightness(1.12);
}

.spine.active {
  transform: translateY(-18px);
  box-shadow:
    0 0 0 2px var(--accent),
    2px 14px 18px rgba(0, 0, 0, 0.5);
}

.s-title {
  flex: 1;
  min-height: 0;
  writing-mode: vertical-rl;
  font-family: var(--font-serif-th);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s-author {
  font-size: 7.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.75;
  writing-mode: vertical-rl;
  max-height: 46px;
  overflow: hidden;
}

/* gilt bands — three spine styles */
.band {
  display: block;
  width: 70%;
  height: 0;
  flex-shrink: 0;
}

.bands-0 .band {
  border-top: 1px solid #d8b46a;
  border-bottom: 1px solid #d8b46a;
  height: 4px;
}

.bands-1 .band {
  height: 7px;
  width: 100%;
  background: rgba(0, 0, 0, 0.28);
  box-shadow:
    inset 0 1px 0 #d8b46a,
    inset 0 -1px 0 #d8b46a;
}

.bands-2 .band {
  border-top: 2px solid #d8b46a;
}

/* ribbon bookmark poking out of the top */
.ribbon {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  margin-left: -4px;
  width: 8px;
  height: 14px;
  background: var(--accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
}

.plant svg {
  width: 48px;
  height: 60px;
  margin-left: 10px;
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));
}

.shelf-enter-active,
.shelf-leave-active {
  transition: opacity 0.3s var(--ease), transform 0.35s var(--ease);
}
.shelf-enter-from,
.shelf-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.shelf-leave-active {
  position: absolute;
}
.shelf-move {
  transition: transform 0.45s var(--ease);
}

@media (max-width: 640px) {
  .desk-inner {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 1.1rem;
  }
  .desk {
    padding: 1.1rem;
  }
  .hint {
    display: none;
  }
  .bookcase {
    --row: 168px;
    padding: 12px 10px 0;
  }
  .shelf {
    padding: 0 8px;
  }
  .s-title {
    font-size: 10px;
  }
}
</style>
