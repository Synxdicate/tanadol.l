<script setup lang="ts">
// "At a glance" bento: focus, headline numbers, a live Khon Kaen clock,
// what's on the reading list and the latest award.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { awards, stats } from '../data/profile'
import { books } from '../data/books'
import CountUp from './CountUp.vue'

const reading = books.find((b) => b.status === 'Reading') ?? books[0]
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

    <article v-for="s in stats" :key="s.label" class="card tile stat">
      <span class="stat-value"><CountUp :value="s.value" /></span>
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

    <article class="card tile reading">
      <img :src="reading.coverArt" :alt="reading.title" referrerpolicy="no-referrer" loading="lazy" />
      <div>
        <span class="eyebrow font-mono">Now reading</span>
        <span class="r-title">{{ reading.title }}</span>
        <span class="r-author">{{ reading.author }}</span>
      </div>
    </article>

    <router-link to="/about" class="card tile award">
      <span class="eyebrow font-mono">Latest award · {{ latest.year }}</span>
      <span class="a-result">{{ latest.result }}</span>
      <span class="a-title">{{ latest.title }}</span>
      <i class="pi pi-arrow-up-right corner"></i>
    </router-link>
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
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
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

.stat-label {
  font-size: 0.66rem;
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
  font-size: 0.66rem;
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
  color: var(--accent);
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
