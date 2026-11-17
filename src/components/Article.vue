<script setup lang="ts">
import { ref, computed } from 'vue'
import { articles } from '../data/articles'
import { profile } from '../data/profile'
import ArticleCover from './ArticleCover.vue'

const selectedTag = ref('All')
const allTags = computed(() => ['All', ...new Set(articles.flatMap((a) => a.tags))])
const shown = computed(() =>
  selectedTag.value === 'All' ? articles : articles.filter((a) => a.tags.includes(selectedTag.value)),
)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Articles</h1>
      <p class="page-subtitle">Essays on philosophy, mathematical logic, and political theory — written in Thai.</p>
    </header>

    <div class="filters" role="tablist">
      <button
        v-for="tag in allTags"
        :key="tag"
        role="tab"
        :aria-selected="selectedTag === tag"
        :class="['filter-btn', { active: selectedTag === tag }]"
        @click="selectedTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <TransitionGroup name="list" tag="div" class="feed">
      <router-link v-for="a in shown" :key="a.slug" :to="`/article/${a.slug}`" class="row">
        <ArticleCover :slug="a.slug" compact class="thumb" />
        <div class="body">
          <div class="meta font-mono">
            <span class="cat">{{ a.course }}</span>
            <time :datetime="a.date">{{ formatDate(a.date) }}</time>
          </div>
          <h2 class="title" lang="th">{{ a.title }}</h2>
          <p class="en">{{ a.enTitle }}</p>
          <p class="abstract" lang="th">{{ a.abstract }}</p>
          <div class="foot">
            <div class="chips"><span v-for="t in a.tags" :key="t" class="chip">{{ t }}</span></div>
            <span class="read">อ่านบทความ <i class="pi pi-arrow-right"></i></span>
          </div>
        </div>
      </router-link>
    </TransitionGroup>

    <p class="blog-note">
      More notes on the
      <a :href="profile.links.blog" target="_blank" rel="noopener noreferrer">blog <i class="pi pi-arrow-up-right"></i></a>
    </p>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 1.75rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--line);
  scrollbar-width: none;
}

.filter-btn {
  font-family: var(--font-sans);
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 0 0 0.6rem;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color 0.3s, border-color 0.3s;
}

.filter-btn.active,
.filter-btn:hover {
  color: var(--accent);
}

.filter-btn.active {
  border-color: var(--accent);
}

.feed {
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
  padding: 2.25rem 0;
  border-bottom: 1px solid var(--line);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
  font-size: 0.72rem;
  color: var(--muted);
}

.meta time {
  white-space: nowrap;
}

.cat {
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title {
  font-family: var(--font-serif-th);
  font-size: 1.45rem;
  line-height: 1.55;
  margin: 0.5rem 0 0.25rem;
  transition: color 0.3s;
}

.en {
  font-style: italic;
  color: var(--ink-3);
  font-size: 0.88rem;
  margin: 0 0 0.9rem;
}

.abstract {
  color: var(--ink-2);
  font-size: 0.95rem;
  line-height: 1.85;
  margin: 0 0 1.25rem;
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.read {
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.3s;
}

.read .pi {
  font-size: 0.75rem;
  transition: transform 0.3s var(--ease);
}

.row:hover .title,
.row:hover .read {
  color: var(--accent);
}

.row:hover .read .pi {
  transform: translateX(4px);
}

.blog-note {
  margin-top: 2.5rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.blog-note a {
  color: var(--ink);
  font-weight: 700;
}

.blog-note a:hover {
  color: var(--accent);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.35s var(--ease);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.thumb {
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease);
}

.row:hover .thumb {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px var(--shadow);
}

@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

/* fade the right edge so it's clear the tag row scrolls sideways on phones */
@media (max-width: 640px) {
  .filters {
    mask-image: linear-gradient(to right, #000 85%, transparent);
    -webkit-mask-image: linear-gradient(to right, #000 85%, transparent);
    padding-right: 2rem;
  }
}
</style>
