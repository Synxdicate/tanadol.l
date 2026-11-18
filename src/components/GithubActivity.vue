<script setup lang="ts">
// "Recently pushed": the latest public repos from the GitHub API, fetched in the browser.
// Cached for 30 minutes in sessionStorage (the unauthenticated API allows 60 calls/hour),
// and the section quietly hides itself if GitHub can't be reached.
import { onMounted, ref } from 'vue'
import { profile } from '../data/profile'

interface Repo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  pushed_at: string
  stargazers_count: number
  fork: boolean
}

const USER = 'Synxdicate'
const CACHE_KEY = 'gh-recent'
const SKIP = new Set(['test', 'Synxdicate', 'synxdicate.github.io'])

const repos = ref<Repo[]>([])
const state = ref<'loading' | 'ready' | 'failed'>('loading')

// GitHub's language colours for the ones used here
const LANG: Record<string, string> = {
  Vue: '#41b883',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  PHP: '#4F5D95',
  'Jupyter Notebook': '#DA5B0B',
}

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [sec, name] of units) {
    const n = Math.floor(s / sec)
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

onMounted(async () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.t < 30 * 60 * 1000) {
      repos.value = cached.repos
      state.value = 'ready'
      return
    }
  } catch {
    /* no cache */
  }
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) throw new Error(String(res.status))
    const all = (await res.json()) as Repo[]
    repos.value = all.filter((r) => !r.fork && !SKIP.has(r.name)).slice(0, 4)
    state.value = repos.value.length ? 'ready' : 'failed'
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos: repos.value }))
    } catch {
      /* ignore */
    }
  } catch {
    state.value = 'failed'
  }
})
</script>

<template>
  <section v-if="state !== 'failed'" class="gh" aria-label="Recently pushed on GitHub">
    <div class="section-head">
      <h2 class="section-label">/ Recently pushed</h2>
    </div>
    <ul class="list" :aria-busy="state === 'loading'">
      <template v-if="state === 'loading'">
        <li v-for="i in 4" :key="i" class="card row skeleton" aria-hidden="true"><span></span><span></span></li>
      </template>
      <li v-for="r in repos" v-else :key="r.name">
        <a :href="r.html_url" target="_blank" rel="noopener noreferrer" class="card row">
          <span class="name">
            <i class="pi pi-github"></i>
            {{ r.name }}
          </span>
          <span class="desc">{{ r.description || 'No description yet' }}</span>
          <span class="meta font-mono">
            <span v-if="r.language" class="lang">
              <span class="dot" :style="{ background: LANG[r.language] ?? 'var(--muted)' }"></span>
              {{ r.language }}
            </span>
            <span v-if="r.stargazers_count" class="stars"><i class="pi pi-star"></i> {{ r.stargazers_count }}</span>
            <time :datetime="r.pushed_at">{{ ago(r.pushed_at) }}</time>
          </span>
        </a>
      </li>
    </ul>
    <a :href="profile.links.github" target="_blank" rel="noopener noreferrer" class="more-link font-mono">
      All repositories on GitHub →
    </a>
  </section>
</template>

<style scoped>
.gh {
  margin-bottom: 4.5rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  height: 100%;
  padding: 1.1rem 1.25rem;
}

.name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--ink);
}

.name .pi {
  font-size: 0.85rem;
  color: var(--muted);
}

.row:hover .name {
  color: var(--accent-text);
}

.desc {
  font-size: 0.85rem;
  color: var(--ink-3);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  margin-top: auto;
  padding-top: 0.35rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.lang,
.stars {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.skeleton {
  min-height: 104px;
  gap: 0.6rem;
}

.skeleton span {
  display: block;
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--line), color-mix(in srgb, var(--ink) 10%, transparent), var(--line));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.skeleton span:first-child {
  width: 40%;
}

.skeleton span:last-child {
  width: 75%;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.more-link {
  display: inline-block;
  margin-top: 1.1rem;
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.more-link:hover {
  color: var(--accent-text);
}

@media (max-width: 640px) {
  .list {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton span {
    animation: none;
  }
}
</style>
