<script setup lang="ts">
// The bookshelf: one wooden shelf per category, each a horizontal slider (swipe, drag
// with the mouse, ‹ › buttons, or arrow keys). Hover a spine for a preview, click it to
// put the book on the reading desk. The status filter dims books instead of removing
// them, so the shelves keep their shape.
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { books, CATEGORIES, type Book, type Category } from '../data/books'

// ---------- filters ----------
type CatFilter = 'All' | Category
type StatusFilter = 'All' | 'Reading' | 'Completed'
const category = ref<CatFilter>('All')
const status = ref<StatusFilter>('All')

const catCount = (c: CatFilter) => (c === 'All' ? books.length : books.filter((b) => b.category === c).length)
const statusCount = (s: StatusFilter) => (s === 'All' ? books.length : books.filter((b) => b.status === s).length)
const finished = statusCount('Completed')
const doneIn = (c: Category) => books.filter((b) => b.category === c && b.status === 'Completed').length
const maxCat = Math.max(...CATEGORIES.map((c) => catCount(c)))

const shelves = computed(() =>
  CATEGORIES.filter((c) => category.value === 'All' || c === category.value).map((name) => ({
    name,
    books: books.filter((b) => b.category === name),
  })),
)
const matches = (b: Book) => status.value === 'All' || b.status === status.value
/** books the desk arrows step through: what's on screen and matches the filter */
const browsable = computed(() => shelves.value.flatMap((s) => s.books).filter(matches))

// ---------- reading desk ----------
const selected = ref<Book>(books.find((b) => b.status === 'Reading') ?? books[0])
const desk = ref<HTMLElement | null>(null)
const index = computed(() => books.findIndex((b) => b.title === selected.value.title) + 1)

const pick = (b: Book, reveal = true) => {
  selected.value = b
  if (reveal && desk.value) {
    const r = desk.value.getBoundingClientRect()
    if (r.top < 0 || r.bottom > window.innerHeight) desk.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const step = (dir: number) => {
  const list = browsable.value
  if (!list.length) return
  const i = list.findIndex((b) => b.title === selected.value.title)
  const next = list[(i + dir + list.length) % list.length]
  pick(next, false)
  revealSpine(next)
}

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
    // unsigned shifts: a signed >> made some values negative (narrow spines, no gilt bands)
    width: 30 + ((h >>> 4) % 18), // 30–47px
    height: 82 + ((h >>> 9) % 18), // 82–99% of the shelf height
    bands: (h >>> 13) % 3,
  }
}

const imgFailed = ref(new Set<string>())
const onImgError = (title: string) => (imgFailed.value = new Set(imgFailed.value).add(title))

// ---------- shelf sliders ----------
const rows = new Map<string, HTMLElement>()
const edge = reactive<Record<string, { left: boolean; right: boolean }>>({})
const setRow = (name: string) => (el: unknown) => {
  if (el) rows.set(name, el as HTMLElement)
  else rows.delete(name)
}
const measure = (name: string) => {
  const el = rows.get(name)
  if (!el) return
  edge[name] = { left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }
}
const measureAll = () => rows.forEach((_, name) => measure(name))
const slide = (name: string, dir: number) => {
  const el = rows.get(name)
  el?.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' })
}
const revealSpine = (b: Book) =>
  nextTick(() =>
    document.querySelector<HTMLElement>(`[data-title="${CSS.escape(b.title)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }),
  )

// drag-to-scroll with a mouse (touch already swipes natively)
let drag: { name: string; x: number; left: number; moved: boolean } | null = null
const onDown = (e: PointerEvent, name: string) => {
  if (e.pointerType !== 'mouse') return
  const el = rows.get(name)
  if (el) drag = { name, x: e.clientX, left: el.scrollLeft, moved: false }
}
const onMove = (e: PointerEvent) => {
  if (!drag) return
  const dx = e.clientX - drag.x
  if (Math.abs(dx) > 5) drag.moved = true
  if (drag.moved) rows.get(drag.name)!.scrollLeft = drag.left - dx
}
const onUp = () => setTimeout(() => (drag = null))
const onSpineClick = (b: Book) => {
  if (drag?.moved) return // it was a drag, not a click
  pick(b)
}

// arrow keys move along a shelf
const onSpineKey = (e: KeyboardEvent, list: Book[], i: number) => {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!dir) return
  e.preventDefault()
  const next = list[(i + dir + list.length) % list.length]
  pick(next, false)
  document.querySelector<HTMLElement>(`[data-title="${CSS.escape(next.title)}"]`)?.focus()
}

// ---------- hover preview (one floating card, outside the scrolling rows) ----------
const bookcase = ref<HTMLElement | null>(null)
const peek = ref<{ book: Book; x: number; y: number } | null>(null)
const showPeek = (e: Event, b: Book) => {
  const t = e.currentTarget as HTMLElement
  const host = bookcase.value
  if (!host || !window.matchMedia('(hover: hover)').matches) return
  const r = t.getBoundingClientRect()
  const h = host.getBoundingClientRect()
  peek.value = { book: b, x: r.left - h.left + r.width / 2, y: r.top - h.top }
}
const hidePeek = () => (peek.value = null)

// /books?book=<title> (from the command palette) opens that book on the desk
const route = useRoute()
const openFromQuery = () => {
  const t = route.query.book
  const b = typeof t === 'string' ? books.find((x) => x.title === t) : undefined
  if (b) {
    category.value = 'All'
    status.value = 'All'
    pick(b)
    revealSpine(b)
  }
}
watch(() => route.query.book, openFromQuery)

let ro: ResizeObserver | null = null
onMounted(() => {
  nextTick(() => {
    measureAll()
    openFromQuery()
  })
  ro = new ResizeObserver(measureAll)
  rows.forEach((el) => ro!.observe(el))
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
})
onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
})
const setCategory = (c: CatFilter) => {
  category.value = c
  nextTick(() => {
    rows.forEach((el) => ro?.observe(el))
    measureAll()
  })
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Bookshelf</h1>
      <p class="page-subtitle">
        {{ books.length }} books across {{ CATEGORIES.length }} shelves, {{ finished }} finished. Swipe or drag a shelf
        to browse, tap a spine to read about it.
      </p>
    </header>

    <div class="top-row">
    <svg width="0" height="0" class="defs" aria-hidden="true">
      <filter id="rough-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="2.4" />
      </filter>
    </svg>

    <!-- reading desk -->
    <section ref="desk" class="desk card" aria-live="polite">
      <div class="desk-nav">
        <button class="nav-btn" aria-label="Previous book" @click="step(-1)"><i class="pi pi-arrow-left"></i></button>
        <button class="nav-btn" aria-label="Next book" @click="step(1)"><i class="pi pi-arrow-right"></i></button>
      </div>
      <Transition name="swap" mode="out-in">
        <div :key="selected.title" class="desk-inner">
          <div class="desk-cover" :style="{ '--cloth': spine(selected).color }">
            <span class="tape tl" aria-hidden="true"></span>
            <span class="tape br" aria-hidden="true"></span>
            <img v-fade-img
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
          <!-- library checkout card -->
          <div class="desk-text card-slip">
            <div class="slip-head type">
              <span>LIBRARY CARD</span>
              <span>No. {{ String(index).padStart(2, '0') }} / {{ books.length }}</span>
            </div>
            <dl class="slip-rows">
              <dt class="type">TITLE</dt>
              <dd class="slip-title">{{ selected.title }}</dd>
              <dt class="type">AUTHOR</dt>
              <dd class="type">{{ selected.author }}</dd>
              <dt class="type">SHELF</dt>
              <dd class="type">{{ selected.category }}</dd>
            </dl>
            <span
              :class="['stamp', selected.status.toLowerCase()]"
              :aria-label="selected.status === 'Reading' ? 'Currently reading' : 'Finished'"
              role="img"
            >
              {{ selected.status === 'Reading' ? 'READING' : 'FINISHED' }}
            </span>
          </div>
        </div>
      </Transition>
    </section>
    <!-- reading stats -->
    <aside class="stats card" aria-label="Reading stats">
      <div class="ring-wrap">
        <svg class="ring" viewBox="0 0 120 120" role="img" :aria-label="`${finished} of ${books.length} books finished`">
          <circle cx="60" cy="60" r="50" class="track" />
          <circle
            cx="60"
            cy="60"
            r="50"
            class="fill"
            :stroke-dasharray="`${(finished / books.length) * 314.16} 314.16`"
          />
        </svg>
        <div class="ring-label">
          <strong>{{ finished }}<span>/{{ books.length }}</span></strong>
          <span class="font-mono">finished</span>
        </div>
      </div>
      <ul class="cat-bars">
        <li v-for="c in CATEGORIES" :key="c">
          <span class="cb-name">{{ c }}</span>
          <span class="cb-track">
            <span class="cb-all" :style="{ width: (catCount(c) / maxCat) * 100 + '%' }">
              <span class="cb-done" :style="{ width: (doneIn(c) / catCount(c)) * 100 + '%' }"></span>
            </span>
          </span>
          <span class="cb-n font-mono">{{ doneIn(c) }}/{{ catCount(c) }}</span>
        </li>
      </ul>
    </aside>
    </div>

    <!-- filters -->
    <div class="toolbar">
      <div class="chips" role="tablist" aria-label="Shelf">
        <button
          v-for="c in (['All', ...CATEGORIES] as CatFilter[])"
          :key="c"
          role="tab"
          :aria-selected="category === c"
          :class="['chip-btn', { active: category === c }]"
          @click="setCategory(c)"
        >
          {{ c }} <span class="count font-mono">{{ catCount(c) }}</span>
        </button>
      </div>
      <div class="segmented" role="group" aria-label="Reading status">
        <button
          v-for="s in (['All', 'Reading', 'Completed'] as StatusFilter[])"
          :key="s"
          :aria-pressed="status === s"
          :class="{ active: status === s }"
          @click="status = s"
        >
          <span v-if="s === 'Reading'" class="mini-ribbon" aria-hidden="true"></span>
          {{ s === 'Completed' ? 'Finished' : s }} <span class="count font-mono">{{ statusCount(s) }}</span>
        </button>
      </div>
    </div>

    <!-- the bookcase: one sliding shelf per category -->
    <div ref="bookcase" class="bookcase">
      <TransitionGroup name="unit" tag="div" class="units">
        <section
          v-for="(shelf, si) in shelves"
          :key="shelf.name"
          :class="['unit', { wide: shelf.books.length > 6 }]"
          :aria-label="`${shelf.name} shelf`"
        >
          <span class="plate font-mono">{{ shelf.name }} · {{ shelf.books.length }}</span>
          <div class="row-wrap">
            <button
              v-show="edge[shelf.name]?.left"
              class="arrow left"
              :aria-label="`Scroll ${shelf.name} left`"
              @click="slide(shelf.name, -1)"
            >
              <i class="pi pi-chevron-left"></i>
            </button>
            <ul
              :ref="setRow(shelf.name)"
              class="row"
              @scroll.passive="measure(shelf.name)"
              @pointerdown="(e: PointerEvent) => onDown(e, shelf.name)"
            >
              <li v-for="(b, i) in shelf.books" :key="b.title" class="slot" :style="{ '--h': spine(b).height + '%' }">
                <button
                  :data-title="b.title"
                  :class="['spine', `bands-${spine(b).bands}`, { active: selected.title === b.title, dim: !matches(b) }]"
                  :style="{ '--cloth': spine(b).color, width: spine(b).width + 'px' }"
                  :aria-pressed="selected.title === b.title"
                  @click="onSpineClick(b)"
                  @keydown="(e: KeyboardEvent) => onSpineKey(e, shelf.books, i)"
                  @mouseenter="(e: MouseEvent) => showPeek(e, b)"
                  @mouseleave="hidePeek"
                  @focus="(e: FocusEvent) => showPeek(e, b)"
                  @blur="hidePeek"
                >
                  <span v-if="b.status === 'Reading'" class="ribbon" aria-hidden="true"></span>
                  <span class="band" aria-hidden="true"></span>
                  <span class="s-title">{{ b.title }}</span>
                  <span class="band" aria-hidden="true"></span>
                  <span class="s-author font-mono">{{ b.author.split(' ').slice(-1)[0] }}</span>
                  <!-- the accessible name starts with the visible text, then adds the rest -->
                  <span class="sr-only">— {{ b.author }}, {{ b.status === 'Reading' ? 'reading' : 'finished' }}</span>
                </button>
              </li>
              <li class="slot bookend" aria-hidden="true"><span></span></li>
              <li v-if="si === shelves.length - 1" class="slot plant" aria-hidden="true">
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
            </ul>
            <button
              v-show="edge[shelf.name]?.right"
              class="arrow right"
              :aria-label="`Scroll ${shelf.name} right`"
              @click="slide(shelf.name, 1)"
            >
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>
          <div class="plank" aria-hidden="true"></div>
        </section>
      </TransitionGroup>

      <!-- floating hover preview -->
      <Transition name="peek">
        <div v-if="peek" class="peek" :style="{ left: peek.x + 'px', top: peek.y + 'px' }" aria-hidden="true">
          <img v-fade-img
            v-if="!imgFailed.has(peek.book.title)"
            :src="peek.book.coverArt"
            alt=""
            referrerpolicy="no-referrer"
            @error="onImgError(peek.book.title)"
          />
          <span v-else class="peek-cloth" :style="{ background: spine(peek.book).color }"></span>
          <span class="peek-text">
            <span class="peek-title">{{ peek.book.title }}</span>
            <span class="peek-author">{{ peek.book.author }}</span>
          </span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* ---------- reading desk + stats ---------- */
.top-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stats {
  padding: 1.25rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ring-wrap {
  position: relative;
  width: 108px;
  height: 108px;
  align-self: center;
}

.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring .track {
  fill: none;
  stroke: var(--line);
  stroke-width: 10;
}

.ring .fill {
  fill: none;
  stroke: var(--accent);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s var(--ease);
}

.ring-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  line-height: 1.1;
}

.ring-label strong {
  font-size: 1.6rem;
  letter-spacing: -0.03em;
}

.ring-label strong span {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 600;
}

.ring-label .font-mono {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cat-bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.cat-bars li {
  display: grid;
  grid-template-columns: 108px 1fr 30px;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.cb-name {
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cb-track {
  height: 6px;
}

.cb-all {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  overflow: hidden;
}

.cb-done {
  display: block;
  height: 100%;
  background: var(--accent);
}

.cb-n {
  color: var(--muted);
  text-align: right;
  font-size: 0.75rem;
}

@media (max-width: 900px) {
  .top-row {
    grid-template-columns: 1fr;
  }
  .stats {
    flex-direction: row;
    align-items: center;
    gap: 1.25rem;
  }
  .cat-bars {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .stats {
    flex-direction: column;
    align-items: stretch;
  }
}

.desk {
  position: relative;
  padding: 1.6rem 1.6rem 3.9rem;
  background:
    radial-gradient(120% 120% at 0% 0%, var(--accent-soft), transparent 55%),
    var(--card);
}

.desk-nav {
  position: absolute;
  bottom: 0.9rem;
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
  color: var(--accent-text);
  border-color: var(--accent);
}

.nav-btn:active {
  transform: scale(0.92);
}

.desk-inner {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 1.75rem;
  align-items: center;
}

.desk-cover {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 3px 6px 6px 3px;
  background: var(--cloth);
  box-shadow:
    0 18px 30px -12px rgba(0, 0, 0, 0.5),
    inset 3px 0 0 rgba(0, 0, 0, 0.18);
  transform: rotate(-2deg);
}

.desk-cover img,
.desk-cover .cloth-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

/* two strips of washi tape holding the cover down */
.tape {
  position: absolute;
  z-index: 2;
  width: 64px;
  height: 20px;
  background: color-mix(in srgb, #e9c46a 55%, transparent);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  clip-path: polygon(0 8%, 6% 0, 12% 10%, 18% 0, 24% 8%, 100% 0, 100% 92%, 94% 100%, 88% 90%, 82% 100%, 76% 92%, 0 100%);
}

.tape.tl {
  top: -8px;
  left: -18px;
  transform: rotate(-38deg);
}

.tape.br {
  bottom: -6px;
  right: -20px;
  transform: rotate(-32deg);
  background: color-mix(in srgb, #9cc1c9 55%, transparent);
}

.defs {
  position: absolute;
}

/* ---------- library card ---------- */
.card-slip {
  position: relative;
  padding: 1rem 1.2rem 1.4rem;
  border-radius: 4px;
  background:
    repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in srgb, #4f7fb0 22%, transparent) 27px 28px),
    #fbf6e6;
  color: #2b2620;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 10px 24px -14px rgba(0, 0, 0, 0.35);
  transform: rotate(0.6deg);
}

/* red margin line, like ruled index cards */
.card-slip::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 74px;
  width: 1px;
  background: rgba(200, 70, 60, 0.35);
}

.type {
  font-family: 'Special Elite', var(--font-mono);
  letter-spacing: 0.02em;
}

.slip-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #6b5d4a;
  padding-bottom: 0.4rem;
  margin-bottom: 0.2rem;
  border-bottom: 2px solid #2b2620;
}

.slip-rows {
  display: grid;
  grid-template-columns: 62px 1fr;
  column-gap: 1rem;
  margin: 0;
  line-height: 28px;
}

.slip-rows dt {
  font-size: 0.75rem;
  color: #8a7a64;
}

.slip-rows dd {
  margin: 0;
  min-width: 0;
  font-size: 0.9rem;
}

.slip-title {
  font-family: var(--font-serif-th);
  font-size: clamp(1.15rem, 2.6vw, 1.5rem) !important;
  font-weight: 700;
  line-height: 1.35;
  padding: 0.15rem 0;
}

/* rubber stamp with uneven ink */
.stamp {
  position: absolute;
  right: 1.2rem;
  bottom: 1rem;
  padding: 0.25rem 0.7rem;
  font-family: 'Special Elite', var(--font-mono);
  font-size: 1.05rem;
  letter-spacing: 0.12em;
  border: 2.5px solid currentColor;
  border-radius: 6px;
  transform: rotate(-9deg);
  opacity: 0.85;
  filter: url(#rough-ink);
  mix-blend-mode: multiply;
}

.stamp.reading {
  color: #c0392b;
}

.stamp.completed {
  color: #1f5f8b;
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
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

.desk-text {
  min-width: 0;
}

.desk-no {
  font-size: 0.75rem;
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
  color: var(--accent-text);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: var(--accent-soft);
}

.status.completed {
  color: var(--ink-3);
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
  align-items: center;
  gap: 0.9rem 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip-btn {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-2);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.chip-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.chip-btn.active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}

.count {
  font-size: 0.75rem;
  margin-left: 0.15rem;
}

.segmented {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
}

.segmented button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  background: none;
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  transition: color 0.2s, background 0.25s var(--ease);
}

.segmented button.active {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.mini-ribbon {
  width: 7px;
  height: 13px;
  background: var(--accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
}

/* ---------- bookcase ---------- */
.bookcase {
  --row: 196px;
  --wood: #8a5a34;
  --wood-light: #a8713f;
  --wood-dark: #5e3b20;
  --back: #3a2a1f;
  position: relative;
  padding: 16px 16px 4px;
  border-radius: 10px;
  background:
    repeating-linear-gradient(92deg, rgba(0, 0, 0, 0.05) 0 2px, transparent 2px 7px, rgba(255, 255, 255, 0.03) 7px 8px, transparent 8px 13px),
    linear-gradient(180deg, var(--wood-light), var(--wood) 40%, var(--wood-dark));
  box-shadow:
    0 30px 60px -25px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.units {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

/* wide screens: compartments in three columns; big categories take two */
@media (min-width: 900px) {
  .units {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 14px;
  }
  .unit.wide {
    grid-column: span 2;
  }
  .units:has(> .unit:only-child) {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* wooden bookend closing each row */
.bookend {
  margin-left: 6px;
}

.bookend span {
  display: block;
  width: 12px;
  height: 58px;
  border-radius: 2px 6px 0 0;
  background: linear-gradient(90deg, var(--wood-dark), var(--wood-light) 40%, var(--wood));
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.45);
  transform: skewX(-6deg);
  transform-origin: bottom;
}

.unit {
  position: relative;
}

/* brass label plate */
.plate {
  position: absolute;
  z-index: 3;
  top: 8px;
  left: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #3b2a12;
  background: linear-gradient(180deg, #e3c37a, #b88f3c);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.4) inset,
    0 2px 4px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.row-wrap {
  position: relative;
  border-radius: 4px 4px 0 0;
  background:
    radial-gradient(70% 85% at 50% -10%, rgba(255, 205, 140, 0.2), transparent 70%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent 28%),
    radial-gradient(120% 90% at 50% 40%, color-mix(in srgb, var(--back) 80%, #6b4a33), var(--back));
}

.row {
  list-style: none;
  margin: 0;
  padding: 34px 14px 0;
  height: var(--row);
  display: flex;
  align-items: flex-end;
  gap: 3px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  cursor: grab;
}

.row::-webkit-scrollbar {
  display: none;
}

.row:active {
  cursor: grabbing;
}

.plank {
  height: 16px;
  margin: 0 -6px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--wood-light) 0 4px, var(--wood) 4px, var(--wood-dark));
  box-shadow: 0 6px 10px -4px rgba(0, 0, 0, 0.55);
}

/* slider arrows */
.arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  width: 34px;
  height: 34px;
  margin-top: -6px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: none;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  color: var(--ink);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  font-size: 0.75rem;
  transition: transform 0.2s var(--ease), background 0.2s;
}

.arrow:hover {
  transform: scale(1.08);
  background: var(--bg);
}

.arrow.left {
  left: 8px;
}

.arrow.right {
  right: 8px;
}

.slot {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  scroll-snap-align: start;
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
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease), filter 0.3s, opacity 0.3s;
}

.spine:hover,
.spine:focus-visible {
  transform: translateY(-12px);
  box-shadow: 2px 10px 14px rgba(0, 0, 0, 0.45);
  filter: brightness(1.12);
}

.spine.active {
  transform: translateY(-16px);
  box-shadow:
    0 0 0 2px var(--accent),
    2px 14px 18px rgba(0, 0, 0, 0.5);
}

.spine.dim {
  opacity: 0.28;
  filter: saturate(0.4);
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
  width: 44px;
  height: 56px;
  margin-left: 10px;
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));
}

/* ---------- hover preview ---------- */
.peek {
  position: absolute;
  z-index: 10;
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
  transform: translate(-50%, calc(-100% - 14px));
  pointer-events: none;
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

.peek-enter-active,
.peek-leave-active {
  transition: opacity 0.15s ease;
}
.peek-enter-from,
.peek-leave-to {
  opacity: 0;
}

.unit-enter-active,
.unit-leave-active {
  transition: opacity 0.3s var(--ease), transform 0.35s var(--ease);
}
.unit-enter-from,
.unit-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.unit-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 640px) {
  /* phones: cover on top, the library card full width underneath */
  .desk-inner {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }
  .desk-cover {
    width: 112px;
    justify-self: center;
  }
  .card-slip {
    padding-bottom: 3.6rem; /* the stamp gets its own space below the rows */
    transform: none;
  }
  .stamp {
    bottom: 0.9rem;
  }
  .desk {
    padding: 1.1rem 1.1rem 3.6rem;
  }
  .desk-text {
    padding-right: 0;
  }
  .desk-nav {
    top: auto;
    bottom: 0.9rem;
  }
  .bookcase {
    --row: 170px;
    padding: 10px 8px 4px;
  }
  .row {
    padding: 32px 8px 0;
  }
  .s-title {
    font-size: 10px;
  }
  .arrow {
    display: none !important; /* phones swipe */
  }
}
</style>
