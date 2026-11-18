<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { profile, projects, awards } from '../data/profile'
import { books } from '../data/books'
import BentoGrid from './BentoGrid.vue'
import GithubActivity from './GithubActivity.vue'
import TerminalLine from './TerminalLine.vue'
import { articles } from '../data/articles'
import ArticleCover from './ArticleCover.vue'

const featured = projects.filter((p) => p.featured)
const topAwards = awards.filter((a) => /Place|Winner|Runner-up/.test(a.result)).slice(0, 5)

// ---------- bookshelf ----------
const bookshelfRow1 = computed(() => books.filter((_, i) => i % 2 === 0))
const bookshelfRow2 = computed(() => books.filter((_, i) => i % 2 !== 0))

type Row = 'left' | 'right'
const containers = {
  left: ref<HTMLElement | null>(null),
  right: ref<HTMLElement | null>(null),
}
const setContainer = (row: Row) => (el: unknown) => {
  containers[row].value = el as HTMLElement | null
}

const state = {
  left: { down: ref(false), hover: false, startX: 0, startScroll: 0 },
  right: { down: ref(false), hover: false, startX: 0, startScroll: 0 },
}
const isDownLeft = state.left.down
const isDownRight = state.right.down

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
let animationId = 0

const autoScroll = () => {
  const l = containers.left.value
  if (l && !state.left.down.value && !state.left.hover) {
    l.scrollLeft += 0.8
    const third = l.scrollWidth / 3
    if (l.scrollLeft >= third * 2) l.scrollLeft -= third
  }
  const r = containers.right.value
  if (r && !state.right.down.value && !state.right.hover) {
    r.scrollLeft -= 0.8
    const third = r.scrollWidth / 3
    if (r.scrollLeft <= third) r.scrollLeft += third
  }
  animationId = requestAnimationFrame(autoScroll)
}

onMounted(() => {
  const r = containers.right.value
  if (r) r.scrollLeft = (r.scrollWidth / 3) * 1.5
  if (!reduceMotion) animationId = requestAnimationFrame(autoScroll)
})
onUnmounted(() => cancelAnimationFrame(animationId))

const onDown = (e: MouseEvent, row: Row) => {
  const el = containers[row].value
  if (!el) return
  state[row].down.value = true
  state[row].startX = e.pageX - el.offsetLeft
  state[row].startScroll = el.scrollLeft
}
const onMove = (e: MouseEvent, row: Row) => {
  const el = containers[row].value
  if (!el || !state[row].down.value) return
  e.preventDefault()
  el.scrollLeft = state[row].startScroll - (e.pageX - el.offsetLeft - state[row].startX) * 1.5
}
const onUp = (row: Row) => (state[row].down.value = false)
const onEnter = (row: Row) => (state[row].hover = true)
const onLeave = (row: Row) => {
  state[row].down.value = false
  state[row].hover = false
}

// ---------- contact ----------
const copied = ref(false)
let copyTimer = 0
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    window.location.href = `mailto:${profile.email}`
    return
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => (copied.value = false), 2000)
}

const hideBroken = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')

// cloth-bound look behind every cover, visible when the image fails to load
const CLOTH = ['#2f4a3a', '#2b3a55', '#5a2a2e', '#7a5a22', '#3d3d4a', '#4a2f45', '#1f4b4f']
const clothFor = (title: string) => {
  let h = 0
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CLOTH[h % CLOTH.length]
}
</script>

<template>
  <div class="page home">
    <!-- Hero -->
    <section class="hero">
      <h1 class="hero-title intro" style="--i: 0">Welcome to my work</h1>
      <p class="hero-tags font-mono intro" style="--i: 1">Offensive Security / CTF / Red Team Tooling / Mathematics / Philosophy</p>
      <div class="intro terminal-wrap" style="--i: 2">
        <TerminalLine
          :lines="[
            'whoami  # offensive security student @ KKU',
            './pentest --scope web,api,network',
            'go build ./AustenC2/agent',
            'ctf --play --since 2022',
            'cat essays/philosophy.md',
          ]"
        />
      </div>
      <p class="hero-desc intro" style="--i: 3">
        Hi, I'm <strong>{{ profile.name }}</strong> — a third-year Cybersecurity student at Khon Kaen University
        focused on web/API and network pentesting, and building the tools red teams use.
      </p>
      <div class="hero-actions intro" style="--i: 4">
        <router-link to="/resume" class="btn btn-primary" data-magnetic><i class="pi pi-file"></i> Resume</router-link>
        <router-link to="/project" class="btn btn-ghost" data-magnetic>Projects</router-link>
        <a :href="profile.links.github" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" aria-label="GitHub" data-magnetic>
          <i class="pi pi-github"></i> <span class="hide-sm">GitHub</span>
        </a>
      </div>

    </section>

    <BentoGrid class="intro" style="--i: 5" />

    <!-- Featured projects -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Featured Projects</h2></div>
      <div class="featured-grid">
        <a
          v-for="p in featured"
          :key="p.name"
          :href="p.demo || p.github"
          target="_blank"
          rel="noopener noreferrer"
          class="card featured-card"
        >
          <span class="kind font-mono">{{ p.kind }}</span>
          <h3>{{ p.name }}</h3>
          <p>{{ p.desc }}</p>
          <div class="chips"><span v-for="s in p.stack" :key="s" class="chip">{{ s }}</span></div>
          <i class="pi pi-arrow-up-right card-icon"></i>
        </a>
      </div>
      <router-link to="/project" class="more-link font-mono">All projects →</router-link>
    </section>

    <!-- Live GitHub activity -->
    <GithubActivity v-reveal />

    <!-- Awards -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Recent Awards</h2></div>
      <ul class="award-list">
        <li v-for="a in topAwards" :key="a.title" class="award">
          <span class="award-year font-mono">{{ a.year }}</span>
          <span class="award-title">
            {{ a.title }}
            <a v-if="a.press" :href="a.press.url" target="_blank" rel="noopener noreferrer" class="press font-mono" :title="`News: ${a.press.source}`">news <i class="pi pi-arrow-up-right"></i></a>
          </span>
          <span class="award-result">{{ a.result }}</span>
        </li>
      </ul>
      <router-link to="/about" class="more-link font-mono">Full list →</router-link>
    </section>

    <!-- Writing -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Latest Writing</h2></div>
      <div class="writing-grid">
        <router-link v-for="a in articles" :key="a.slug" :to="`/article/${a.slug}`" class="card writing">
          <ArticleCover :slug="a.slug" compact class="w-cover" />
          <span class="kind font-mono">{{ a.course }}</span>
          <h3 lang="th">{{ a.title }}</h3>
          <p>{{ a.enTitle }}</p>
          <i class="pi pi-arrow-up-right card-icon"></i>
        </router-link>
      </div>
    </section>

    <!-- Bookshelf -->
    <section v-reveal class="block bookshelf">
      <div class="section-head"><h2 class="section-label">/ What I read</h2></div>
      <router-link to="/books" class="more-link font-mono shelf-link">Open the bookshelf →</router-link>

      <div
        v-for="row in (['left', 'right'] as const)"
        :key="row"
        class="marquee-container"
        role="region"
        tabindex="0"
        :aria-label="row === 'left' ? 'Books I read, first row (scrollable)' : 'Books I read, second row (scrollable)'"
        :ref="setContainer(row)"
        :class="{ 'is-grabbing': row === 'left' ? isDownLeft : isDownRight }"
        @mousedown="(e) => onDown(e, row)"
        @mousemove="(e) => onMove(e, row)"
        @mouseup="onUp(row)"
        @mouseenter="onEnter(row)"
        @mouseleave="onLeave(row)"
        @touchstart.passive="onEnter(row)"
        @touchend="onLeave(row)"
      >
        <div class="marquee-track">
          <div v-for="g in 3" :key="row + g" class="book-group" :aria-hidden="g > 1">
            <div v-for="book in row === 'left' ? bookshelfRow1 : bookshelfRow2" :key="book.title + g" class="book-item">
              <div class="book-cover-wrap" :style="{ '--cloth': clothFor(book.title) }">
                <span class="cloth" aria-hidden="true">{{ book.title }}</span>
                <img v-fade-img
                  :src="book.coverArt"
                  :alt="book.title"
                  class="book-cover"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="hideBroken"
                />
              </div>
              <div class="book-details">
                <span :class="['book-status', book.status.toLowerCase(), 'font-mono']">{{ book.status }}</span>
                <span class="book-title">{{ book.title }}</span>
                <span class="book-author">by {{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section v-reveal class="card cta">
      <p class="section-label">/ Get in touch</p>
      <h2 class="cta-title">Have a security role, project, or CTF team in mind?</h2>
      <p class="cta-desc">Always happy to talk pentesting, tooling, or competitions.</p>
      <div class="cta-actions">
        <a :href="`mailto:${profile.email}`" class="btn btn-primary" data-magnetic><i class="pi pi-envelope"></i> Email me</a>
        <button class="btn btn-ghost copy-btn" aria-live="polite" data-magnetic @click="copyEmail">
          <i :class="['pi', copied ? 'pi-check' : 'pi-copy']"></i>
          {{ copied ? 'Copied!' : profile.email }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 5rem;
}

.hero-title {
  font-family: var(--font-script);
  font-weight: 400;
  font-size: clamp(4rem, 11vw, 6.5rem);
  color: var(--accent); /* large script text: 3:1 is enough */
  margin: 0;
  line-height: 0.95;
}

.hero-tags {
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 600;
  margin: 1.5rem 0 1.75rem;
  line-height: 1.8;
}

.terminal-wrap {
  display: flex;
  justify-content: center;
  margin: 0 0 1.75rem;
}

.hero-desc {
  color: var(--ink-2);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.75;
  font-size: 1.05rem;
}

.hero-desc strong {
  color: var(--ink);
}

.hero-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.block {
  margin-bottom: 4.5rem;
}

/* exactly three featured projects: one row of three, or a single column — never 2 + 1 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

@media (max-width: 720px) {
  .featured-grid {
    grid-template-columns: 1fr;
  }
}

.featured-card {
  position: relative;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.kind {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-text);
  font-weight: 600;
}

.featured-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.featured-card p {
  color: var(--ink-3);
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0 0 0.5rem;
  flex: 1;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.card-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--muted);
  opacity: 0.35;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.featured-card:hover .card-icon {
  color: var(--accent-text);
  opacity: 1;
  transform: translate(2px, -2px);
}

.writing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.writing {
  position: relative;
  padding: 0.75rem 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.writing .card-icon {
  display: none;
}

.w-cover {
  margin-bottom: 1.1rem;
}

.writing > :not(.w-cover) {
  padding: 0 0.85rem;
}

.writing h3 {
  font-family: var(--font-serif-th);
  font-size: 1.15rem;
  line-height: 1.6;
  margin: 0.5rem 0 0.4rem;
}

.writing p {
  margin: 0;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink-3);
}

.writing:hover .card-icon {
  color: var(--accent-text);
  opacity: 1;
  transform: translate(2px, -2px);
}

.more-link {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.more-link:hover {
  color: var(--accent-text);
}

.award-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.award {
  display: grid;
  grid-template-columns: 3.5rem 1fr auto;
  gap: 1rem;
  align-items: baseline;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}

.award-year {
  font-size: 0.75rem;
  color: var(--muted);
}

.press {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.4rem;
  padding: 0.05rem 0.4rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted);
  vertical-align: middle;
  transition: color 0.2s, border-color 0.2s;
}

.press .pi {
  font-size: 0.5rem;
}

.press:hover {
  color: var(--accent-text);
  border-color: var(--accent);
}

.award-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.award-result {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent-text);
  text-align: right;
}

/* bookshelf */
.marquee-container {
  width: 100%;
  padding: 1.25rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}

.marquee-container::-webkit-scrollbar {
  display: none;
}

.marquee-container.is-grabbing {
  cursor: grabbing;
}

.marquee-track {
  display: inline-block;
  width: max-content;
}

.book-group {
  display: inline-flex;
  gap: 3rem;
  padding-right: 3rem;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 320px;
  transition: transform 0.4s var(--ease);
}

.book-item:hover {
  transform: translateY(-6px);
}

.book-cover-wrap {
  position: relative;
  width: 80px;
  height: 118px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 25px var(--shadow);
  background: var(--placeholder);
  border: 1px solid var(--line);
}

.cloth {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 0.4rem;
  text-align: center;
  white-space: normal;
  font-family: var(--font-serif-th);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25;
  color: #f3e6c8;
  background:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 4px),
    var(--cloth);
}

.book-cover {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.book-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  white-space: normal;
}

.book-status {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
}

.book-status.reading {
  color: var(--accent-text);
}

.book-status.completed {
  color: var(--muted);
}

.book-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
}

.book-author {
  font-size: 0.82rem;
  color: var(--muted);
}

.bookshelf {
  margin-bottom: 3rem;
}

.cta {
  text-align: center;
  padding: 3rem 1.5rem;
}

.cta .section-label {
  margin-bottom: 1rem;
}

.cta-title {
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 auto 0.75rem;
  max-width: 560px;
  line-height: 1.25;
}

.cta-desc {
  color: var(--ink-3);
  margin: 0 0 1.75rem;
}

.cta-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.copy-btn {
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

@media (max-width: 640px) {
  .hide-sm {
    display: none;
  }
  .hero-actions {
    flex-wrap: nowrap;
  }
  .hero-actions .btn {
    padding: 0.7rem 1rem;
  }
  .hero {
    margin-bottom: 3rem;
  }
  .award {
    grid-template-columns: 3rem 1fr;
  }
  .award-result {
    grid-column: 2;
    text-align: left;
  }
  .book-item {
    width: 280px;
  }
}
</style>
