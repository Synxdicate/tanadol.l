<script setup lang="ts">
import { computed, ref } from 'vue'
import { PROJECT_AREAS, projects, type ProjectArea } from '../data/profile'
import ProjectArt from './ProjectArt.vue'

type AreaFilter = 'All' | ProjectArea
const area = ref<AreaFilter>('All')
const inArea = (a: AreaFilter) => (a === 'All' ? projects : projects.filter((p) => p.area === a))
const featured = computed(() => inArea(area.value).filter((p) => p.featured))
const others = computed(() => inArea(area.value).filter((p) => !p.featured))
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Projects</h1>
      <p class="page-subtitle">Security tooling, infrastructure, and things I've built along the way.</p>
    </header>

    <div class="chips-bar" role="tablist" aria-label="Filter projects">
      <button
        v-for="a in (['All', ...PROJECT_AREAS] as AreaFilter[])"
        :key="a"
        role="tab"
        :aria-selected="area === a"
        :class="['chip-btn', { active: area === a }]"
        @click="area = a"
      >
        {{ a }} <span class="count font-mono">{{ inArea(a).length }}</span>
      </button>
    </div>

    <section v-if="featured.length" class="featured">
      <article v-for="(p, i) in featured" :key="p.name" v-reveal="i * 80" class="card feature">
        <div class="feature-head">
          <span class="kind font-mono">{{ p.kind }}</span>
          <h2>{{ p.name }}</h2>
          <p class="desc">{{ p.desc }}</p>
        </div>
        <ProjectArt :name="p.name" class="art" />
        <ul v-if="p.highlights" class="highlights">
          <li v-for="h in p.highlights" :key="h">{{ h }}</li>
        </ul>
        <div class="feature-foot">
          <div class="chips"><span v-for="s in p.stack" :key="s" class="chip">{{ s }}</span></div>
          <div class="links">
            <a v-if="p.github" :href="p.github" target="_blank" rel="noopener noreferrer" class="link">
              <i class="pi pi-github"></i> Code
            </a>
            <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener noreferrer" class="link">
              <i class="pi pi-external-link"></i> Live
            </a>
          </div>
        </div>
      </article>
    </section>

    <div v-if="others.length" class="section-head">
      <h2 class="section-label">{{ featured.length ? '/ More' : `/ ${area}` }}</h2>
    </div>
    <section v-reveal class="grid">
      <a
        v-for="p in others"
        :key="p.name"
        :href="p.demo || p.github"
        target="_blank"
        rel="noopener noreferrer"
        class="card small"
      >
        <span class="kind font-mono">{{ p.kind }}</span>
        <h3>{{ p.name }}</h3>
        <p class="desc">{{ p.desc }}</p>
        <div class="chips"><span v-for="s in p.stack" :key="s" class="chip">{{ s }}</span></div>
        <i class="pi pi-arrow-up-right corner"></i>
      </a>
    </section>
  </div>
</template>

<style scoped>
.chips-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: -0.75rem 0 2rem;
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

.featured {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 4rem;
}

.feature {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'head art'
    'list art'
    'foot foot';
  gap: 1.5rem 2.5rem;
  padding: 2rem;
}

.feature:hover {
  border-color: rgba(235, 94, 40, 0.5);
  background: var(--card-hover);
}

.kind {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-text);
  font-weight: 600;
}

.feature h2,
.small h3 {
  margin: 0.35rem 0 0.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.feature h2 {
  font-size: 1.5rem;
}

.small h3 {
  font-size: 1.15rem;
}

.desc {
  color: var(--ink-2);
  font-size: 0.9rem;
  line-height: 1.65;
  margin: 0;
}

.feature-head {
  grid-area: head;
}

.art {
  grid-area: art;
  align-self: center;
}

.feature-foot {
  grid-area: foot;
}

.highlights {
  grid-area: list;
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.86rem;
  color: var(--ink-3);
  line-height: 1.7;
  align-self: start;
}

.highlights li::marker {
  color: var(--accent-text);
}

.feature-foot {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.links {
  display: flex;
  gap: 1.25rem;
}

.link {
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.link:hover {
  color: var(--accent-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.small {
  position: relative;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.small .kind {
  padding-right: 1.5rem; /* clear of the corner arrow */
}

.small .desc {
  font-size: 0.85rem;
  flex: 1;
  margin-bottom: 1rem;
}

.corner {
  position: absolute;
  top: 1.4rem;
  right: 1.4rem;
  font-size: 0.75rem;
  color: var(--muted);
  opacity: 0.4;
  transition: all 0.3s;
}

.small:hover .corner {
  color: var(--accent-text);
  opacity: 1;
}

@media (max-width: 768px) {
  .feature {
    grid-template-areas:
      'head'
      'art'
      'list'
      'foot';
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
}
</style>
