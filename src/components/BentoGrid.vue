<script setup lang="ts">
// "At a glance" bento: focus, headline numbers, a live Khon Kaen clock,
// what's on the reading list and the latest award.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { awards, stats } from '../data/profile'
import { books } from '../data/books'
import CountUp from './CountUp.vue'

const reading = books.find((b) => b.status === 'Reading') ?? books[0]

// data for the stat tiles, all derived from the awards list
const YEARS = [2022, 2023, 2024, 2025, 2026]
const ctfYears = new Set(awards.filter((a) => a.category === 'Cybersecurity').map((a) => a.year))
const awardsByYear = YEARS.map((year) => ({ year, n: awards.filter((a) => a.year === year).length }))
const maxPerYear = Math.max(...awardsByYear.map((b) => b.n), 1)
const latest = awards[0]

// live local time in Khon Kaen (ICT, UTC+7)
const now = ref(new Date())
let clock = 0
onMounted(() => (clock = window.setInterval(() => (now.value = new Date()), 1000)))
onUnmounted(() => clearInterval(clock))
const fmt = (opts: Intl.DateTimeFormatOptions) =>
  computed(() => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', ...opts }).format(now.value))
const time = fmt({ hour: '2-digit', minute: '2-digit', hour12: false })
const seconds = fmt({ second: '2-digit' })
const day = fmt({ weekday: 'long' })
const hour = computed(() => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false }).format(now.value)))
// pixel sun by day, crescent moon by night (Khon Kaen time)
const SUN = ['...#...', '.#...#.', '..###..', '#.###.#', '..###..', '.#...#.', '...#...']
const MOON = ['..###..', '.##....', '##.....', '##.....', '##.....', '.##....', '..###..']
const isDay = computed(() => hour.value >= 6 && hour.value < 18)
const skyIcon = computed(() => (isDay.value ? SUN : MOON))

const status = computed(() => {
  const h = hour.value
  if (h < 5) return 'late night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
})
</script>

<template>
  <section class="bento" aria-label="At a glance">
    <article class="card tile focus">
      <span class="eyebrow font-mono">Currently</span>
      <h2>Third-year Cybersecurity student at Khon Kaen University</h2>
      <p>Learning offensive security by doing it: web and API testing, internal networks, and writing the tooling red teams use.</p>
      <div class="chips">
        <span class="chip">Web/API Pentesting</span>
        <span class="chip">Network Pentesting</span>
        <span class="chip">Red Team Tooling</span>
      </div>
    </article>

    <article v-for="(s, i) in stats" :key="s.label" class="card tile stat">
      <span class="stat-value"><CountUp :value="s.value" /></span>

      <!-- 0: years of CTF — timeline, filled dots = years with a CTF result -->
      <div v-if="i === 0" class="viz timeline" aria-hidden="true">
        <span v-for="y in YEARS" :key="y" :class="['tl-dot', { on: ctfYears.has(y) }]" :title="String(y)"></span>
        <span class="tl-cap font-mono"><span>{{ YEARS[0] }}</span><span>now</span></span>
      </div>

      <!-- 1: awards — bars per year from the awards list -->
      <div v-else-if="i === 1" class="viz bars" aria-hidden="true">
        <div v-for="b in awardsByYear" :key="b.year" class="bar-col">
          <span class="bar" :style="{ height: `${(b.n / maxPerYear) * 100}%` }"></span>
          <span class="bar-year font-mono">{{ String(b.year).slice(2) }}</span>
        </div>
      </div>

      <!-- 2: runner-up — a pixel podium with 2nd place lit -->
      <svg v-else class="viz podium" viewBox="0 0 30 14" shape-rendering="crispEdges" aria-hidden="true">
        <rect x="0" y="6" width="9" height="8" class="p2" />
        <rect x="10" y="2" width="10" height="12" class="p1" />
        <rect x="21" y="9" width="9" height="5" class="p3" />
        <rect x="3" y="8" width="3" height="1" class="num" />
        <rect x="5" y="9" width="1" height="1" class="num" />
        <rect x="3" y="10" width="3" height="1" class="num" />
        <rect x="3" y="11" width="1" height="1" class="num" />
        <rect x="3" y="12" width="3" height="1" class="num" />
      </svg>

      <span class="stat-label font-mono">{{ s.label }}</span>
    </article>

    <article class="card tile clock">
      <span class="eyebrow font-mono"><i class="pi pi-map-marker"></i> Khon Kaen</span>
      <time class="time">{{ time }}<span class="sec">:{{ seconds.padStart(2, '0') }}</span></time>
      <span class="tz font-mono">{{ day }} · ICT</span>
      <span class="presence font-mono">
        <svg class="sky" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true">
          <template v-for="(row, y) in skyIcon" :key="y">
            <template v-for="(ch, x) in row" :key="x">
              <rect v-if="ch !== '.'" :x="x" :y="y" width="1" height="1" />
            </template>
          </template>
        </svg>
        {{ status }}
      </span>
    </article>

    <router-link to="/books" class="card tile reading">
      <img v-fade-img :src="reading.coverArt" :alt="reading.title" referrerpolicy="no-referrer" loading="lazy" />
      <div>
        <span class="eyebrow font-mono">Now reading</span>
        <span class="r-title">{{ reading.title }}</span>
        <span class="r-author">{{ reading.author }}</span>
        <span class="r-more font-mono">{{ books.length }} books on the shelf →</span>
      </div>
    </router-link>

    <article class="card tile award">
      <span class="eyebrow font-mono">Latest award · {{ latest.year }}</span>
      <span class="a-result">{{ latest.result }}</span>
      <span class="a-title">{{ latest.title }}</span>
      <div class="a-links font-mono">
        <router-link to="/about">All {{ awards.length }} awards →</router-link>
        <a v-if="latest.press" :href="latest.press.url" target="_blank" rel="noopener noreferrer">
          News · {{ latest.press.source }} <i class="pi pi-arrow-up-right"></i>
        </a>
      </div>
    </article>
  </section>
</template>

<style scoped>
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(150px, auto);
  gap: 1rem;
  margin-bottom: 4.5rem;
}

.tile {
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
  overflow: hidden;
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-text);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* focus: 2 × 2 */
.focus {
  grid-column: span 2;
  grid-row: span 2;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1.8rem;
  background:
    radial-gradient(120% 90% at 100% 0%, var(--accent-soft), transparent 60%),
    var(--card);
}

.focus h2 {
  font-size: clamp(1.35rem, 2.6vw, 1.9rem);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin: 0;
}

.focus p {
  margin: 0;
  color: var(--ink-3);
  font-size: 0.92rem;
  line-height: 1.65;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

/* stats */
.stat {
  justify-content: space-between;
}

.stat-value {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.viz {
  margin: auto 0 0.6rem;
}

/* timeline */
.timeline {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  top: calc(0.2rem + 4px);
  height: 1px;
  background: var(--line);
}

.tl-dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid var(--muted);
  background: var(--bg);
}

.tl-dot.on {
  border-color: var(--accent);
  background: var(--accent);
}

.tl-cap {
  position: absolute;
  left: 0;
  right: 0;
  top: 1.1rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted);
}

.timeline {
  margin-bottom: 1.6rem;
}

/* bars */
.bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 44px;
}

.bar-col {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 3px;
}

.bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--accent);
  opacity: 0.85;
}

.bar-year {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1;
}

/* podium */
.podium {
  width: 66px;
  height: auto;
  image-rendering: pixelated;
}

.podium .p1,
.podium .p3 {
  fill: color-mix(in srgb, var(--ink) 18%, transparent);
}

.podium .p2 {
  fill: var(--accent);
}

.podium .num {
  fill: var(--bg);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.5;
}

/* clock */
.clock {
  justify-content: space-between;
}

.time {
  font-size: 2.3rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.sec {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 600;
  margin-left: 2px;
}

.tz,
.presence {
  font-size: 0.75rem;
  color: var(--muted);
}

.presence {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.sky {
  width: 11px;
  height: 11px;
  fill: var(--accent);
}

/* reading: 2 × 1 */
.reading {
  grid-column: span 2;
  flex-direction: row;
  align-items: center;
  gap: 1.1rem;
}

.reading img {
  width: 64px;
  height: 94px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 8px 18px var(--shadow);
  flex-shrink: 0;
  background: var(--placeholder);
}

.reading div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.r-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.25;
}

.r-author {
  font-size: 0.82rem;
  color: var(--muted);
}

.r-more {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
  transition: color 0.2s;
}

.reading:hover .r-more {
  color: var(--accent-text);
}

.a-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.1rem;
  margin-top: 0.7rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.a-links a:hover {
  color: var(--accent-text);
}

/* award: 2 × 1 */
.award {
  grid-column: span 2;
  position: relative;
  justify-content: center;
}

.a-result {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.a-title {
  color: var(--ink-3);
  font-size: 0.9rem;
}

.corner {
  position: absolute;
  top: 1.3rem;
  right: 1.3rem;
  font-size: 0.75rem;
  color: var(--muted);
  transition: transform 0.3s var(--ease), color 0.3s;
}

.award:hover .corner {
  color: var(--accent-text);
  transform: translate(2px, -2px);
}

@media (max-width: 900px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .bento {
    grid-auto-rows: minmax(124px, auto);
    gap: 0.75rem;
  }
  .tile {
    padding: 1.1rem;
  }
  .stat-value,
  .time {
    font-size: 2rem;
  }
  .focus {
    grid-row: span 1;
  }
}

</style>
