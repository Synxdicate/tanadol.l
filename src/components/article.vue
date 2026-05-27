<script setup>
import { ref, computed } from 'vue'

const filteredProjects = ref([])
const selectedTag = ref('ALL')
const allTags = computed(() => {
  const tags = new Set(['ALL'])
  filteredProjects.value.forEach(p => {
    p.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags)
})

const filteredArticles = computed(() => {
  if (selectedTag.value === 'ALL') return filteredProjects.value
  return filteredProjects.value.filter(p => p.tags.includes(selectedTag.value))
})
</script>

<template>
  <div class="works-container">

    <header class="section-header">
      <h1 class="title-large monsieur-la-doulaise-regular">Article</h1>
      <p class="subtitle">Essays on philosophy, mathematical logic, and political theory.</p>
    </header>

    <div class="filter-wrapper">
      <div class="tag-filter">
        <button
          v-for="tag in allTags"
          :key="tag"
          :class="['filter-btn', { active: selectedTag === tag }]"
          @click="selectedTag = tag"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <TransitionGroup name="list" tag="div" class="articles-feed">
      <article class="article-row" v-for="p in filteredArticles" :key="p.name">
        
        <div class="article-visual">
          <img :src="p.img" :alt="p.name" class="article-img" />
          <div class="img-dimmer"></div>
        </div>

        <div class="article-content">
          <div class="meta-top">
            <span class="category-label font-mono">| {{ p.tags[0] }}</span>
            <span class="divider-dot">·</span>
            <span class="article-year font-mono">{{ p.year }}</span>
          </div>

          <h3 class="article-title">{{ p.name }}</h3>
          <p class="article-description">{{ p.desc }}</p>

          <div class="article-footer">
            <div class="hash-tags font-mono">
              <span v-for="t in p.tags" :key="t">#{{ t.toLowerCase() }}</span>
            </div>
            <a href="#" class="read-link">
              <span>Read Essay</span>
              <svg class="arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33334 8H12.6667" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 3.33331 L12.6667 7.99998 L8 12.6666" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

      </article>
    </TransitionGroup>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Monsieur+La+Doulaise&display=swap');

.works-container {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 920px;
  margin: 0 auto;
  padding: 1rem 1.5rem 6rem;
  color: #252422; 
  -webkit-font-smoothing: antialiased;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.monsieur-la-doulaise-regular {
  font-family: "Monsieur La Doulaise", cursive;
  font-weight: 400;
  font-style: normal;
  text-transform: none;
}

.section-header {
  margin-bottom: 2.5rem;
}

.title-large {
  font-size: clamp(3.5rem, 9vw, 5.5rem);
  color: #eb5e28; 
  margin: 0;
}

.subtitle {
  color: #475569;
  font-size: 0.88rem;
  margin-top: 0.3rem;
  letter-spacing: -0.01em;
}

.filter-wrapper {
  margin-bottom: 3.5rem;
  border-bottom: 1px solid rgba(37, 36, 34, 0.05);
}

.tag-filter {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  scrollbar-width: none; 
}

.tag-filter::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: none;
  border: none;
  color: #64748b; 
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  padding: 0 0 0.25rem 0;
  position: relative;
  letter-spacing: 0.12em;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover, .filter-btn.active {
  color: #eb5e28;
}

.filter-btn::after {
  content: "";
  position: absolute;
  bottom: -0.75rem;
  left: 0;
  width: 0%;
  height: 2px;
  background: #eb5e28;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-btn.active::after {
  width: 100%;
}

.articles-feed {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.article-row {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  align-items: center;
  padding-bottom: 3.5rem;
  border-bottom: 1px solid rgba(37, 36, 34, 0.05);
}

.article-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.article-visual {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #f4f1de;
}

.article-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%) contrast(1.02);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
}

.article-row:hover .article-img {
  transform: scale(1.04);
  filter: grayscale(0%) contrast(1);
}

.img-dimmer {
  position: absolute;
  inset: 0;
  background: rgba(37, 36, 34, 0.02);
  pointer-events: none;
}

.article-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.meta-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.72rem;
  margin-bottom: 0.5rem;
}

.category-label {
  color: #eb5e28;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divider-dot {
  opacity: 0.5;
}

.article-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #252422;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.article-row:hover .article-title {
  color: #eb5e28;
}

.article-description {
  color: #403d39;
  font-size: 0.9rem;
  line-height: 1.65;
  margin: 0 0 1.5rem 0;
}

.article-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.hash-tags {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
}

.read-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #252422;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  position: relative;
  padding-bottom: 2px;
}

.read-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.article-row:hover .read-link {
  color: #eb5e28;
}

.article-row:hover .read-link::after {
  transform: scaleX(1);
  transform-origin: left;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.article-row:hover .arrow-icon {
  transform: translateX(3px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

@media (max-width: 768px) {
  .article-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding-bottom: 2.5rem;
    margin-bottom: 0rem;
  }
  
  .article-visual {
    aspect-ratio: 16 / 9;
  }
}
</style>