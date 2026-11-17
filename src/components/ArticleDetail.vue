<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { articles, findArticle } from '../data/articles'
import ArticleCover from './ArticleCover.vue'

const route = useRoute()
const article = computed(() => findArticle(String(route.params.slug)))
const others = computed(() => articles.filter((a) => a.slug !== article.value?.slug))

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// reading time: count base characters only (Thai vowel/tone marks don't add reading time),
// at roughly 900 characters per minute
const readMinutes = computed(() => {
  const chars =
    article.value?.blocks.reduce(
      (n, b) => n + b.text.replace(/<[^>]+>|[ัิ-ฺ็-๎\s]/g, '').length,
      0,
    ) ?? 0
  return Math.max(1, Math.round(chars / 900))
})

// footnote markers become links to the notes list (and back)
const linkNotes = (html: string) =>
  html.replace(/<sup>(\d+)<\/sup>/g, '<sup><a href="#fn-$1" id="ref-$1" class="fn-ref" aria-label="Note $1">$1</a></sup>')

watchEffect(() => {
  if (article.value) document.title = `${article.value.title} · Tanadol L.`
})

// reading progress bar
const progress = ref(0)
const onScroll = () => {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? Math.min(1, h.scrollTop / max) : 0
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div v-if="article" class="page reader">
    <div class="progress no-print" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></div>

    <div class="top-bar no-print">
      <router-link to="/article" class="back font-mono"><i class="pi pi-arrow-left"></i> All articles</router-link>
      <a :href="`/articles/${article.slug}.pdf`" :download="`${article.title}.pdf`" class="pdf-link font-mono">
        <i class="pi pi-download"></i> PDF
      </a>
    </div>

    <div class="hero-wrap">
      <ArticleCover :slug="article.slug" class="hero-cover" />
      <p v-if="article.coverCredit" class="credit font-mono">{{ article.coverCredit }}</p>
    </div>

    <header class="head">
      <div class="meta font-mono">
        <span class="course">{{ article.course }}</span>
        <span>·</span>
        <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        <span>·</span>
        <span>{{ readMinutes }} min read</span>
      </div>
      <h1 class="title" lang="th">{{ article.title }}</h1>
      <p class="en-title">{{ article.enTitle }}</p>
      <div class="chips">
        <span v-for="t in article.tags" :key="t" class="chip">{{ t }}</span>
      </div>
    </header>

    <article class="prose" lang="th">
      <template v-for="(b, i) in article.blocks" :key="i">
        <h2 v-if="b.type === 'h'" v-html="linkNotes(b.text)"></h2>
        <p v-else-if="b.type === 'lead'" class="lead" v-html="linkNotes(b.text)"></p>
        <p v-else v-html="linkNotes(b.text)"></p>
      </template>
    </article>

    <section class="notes" lang="th">
      <h2 class="section-label">/ เชิงอรรถ</h2>
      <ol>
        <li v-for="(n, i) in article.notes" :id="`fn-${i + 1}`" :key="i">
          {{ n }} <a :href="`#ref-${i + 1}`" class="fn-back" aria-label="Back to text">↩</a>
        </li>
      </ol>
    </section>

    <section v-if="article.bibliography.length" class="notes" lang="th">
      <h2 class="section-label">/ บรรณานุกรม</h2>
      <ul>
        <li v-for="b in article.bibliography" :key="b">{{ b }}</li>
      </ul>
    </section>

    <footer class="author">
      <span class="font-mono">Written by</span> ธนดล หลังปูเต๊ะ — Tanadol Langputeh
    </footer>

    <nav v-if="others.length" class="more no-print">
      <p class="section-label">/ Read next</p>
      <router-link v-for="o in others" :key="o.slug" :to="`/article/${o.slug}`" class="card next">
        <span class="next-title" lang="th">{{ o.title }}</span>
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </nav>
  </div>

  <div v-else class="page missing">
    <h1 class="page-title">Not found</h1>
    <p>This article doesn't exist.</p>
    <router-link to="/article" class="btn btn-primary">All articles</router-link>
  </div>
</template>

<style scoped>
.reader {
  max-width: 720px;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
  transform-origin: 0 50%;
  z-index: 150;
}

.hero-wrap {
  margin: 0 0 2.25rem;
}

.credit {
  margin: 0.5rem 0 0;
  font-size: 0.64rem;
  color: var(--muted);
  text-align: right;
}

@media (min-width: 900px) {
  /* let the cover break out a little wider than the text column */
  .hero-wrap {
    margin-left: -60px;
    margin-right: -60px;
  }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back,
.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.pdf-link {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-weight: 600;
}

.back:hover,
.pdf-link:hover {
  color: var(--accent);
  border-color: var(--accent);
}

@media print {
  .prose :deep(.fn-ref) {
    color: #000;
  }
  .prose .lead {
    border-color: #000;
  }
  .course {
    color: #000;
  }
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--muted);
  margin-bottom: 1rem;
}

.course {
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.title {
  font-family: var(--font-serif-th);
  font-size: clamp(1.7rem, 4.5vw, 2.4rem);
  line-height: 1.45;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.en-title {
  color: var(--ink-3);
  font-style: italic;
  margin: 0 0 1.25rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.head {
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--line);
}

.prose {
  font-family: var(--font-serif-th);
  font-size: 1.08rem;
  line-height: 2;
  color: var(--ink-2);
}

.prose p {
  margin: 0 0 1.4rem;
  text-indent: 2em;
}

.prose .lead {
  text-indent: 0;
  font-size: 1.3rem;
  line-height: 1.7;
  color: var(--ink);
  font-weight: 600;
  border-left: 3px solid var(--accent);
  padding-left: 1.25rem;
  margin: 0 0 2.25rem;
}

.prose h2 {
  font-family: var(--font-sans);
  font-size: 1.3rem;
  color: var(--ink);
  margin: 3rem 0 1.25rem;
}

.prose :deep(.fn-ref) {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.7em;
  font-weight: 600;
  padding: 0 0.1em;
  scroll-margin-top: 110px;
}

.prose :deep(sup) {
  line-height: 0;
}

.notes {
  margin-top: 3.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}

.notes ol,
.notes ul {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.86rem;
  line-height: 1.8;
  color: var(--ink-3);
}

.notes li {
  scroll-margin-top: 110px;
  padding: 0.1rem 0;
  border-radius: 4px;
  transition: background 0.4s;
}

.notes li:target {
  background: var(--accent-soft);
}

.notes li::marker {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.8em;
}

.fn-back {
  color: var(--accent);
  margin-left: 0.25rem;
}

.author {
  margin: 3rem 0;
  font-size: 0.9rem;
  color: var(--ink-3);
}

.author .font-mono {
  font-size: 0.72rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-right: 0.5rem;
}

.more .section-label {
  margin-bottom: 1rem;
}

.next {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.75rem;
}

.next-title {
  font-weight: 600;
  line-height: 1.6;
}

.next:hover .pi {
  color: var(--accent);
}

.missing {
  text-align: center;
  padding-top: 3rem;
}

.missing p {
  color: var(--muted);
  margin: 1rem 0 2rem;
}

@media (max-width: 640px) {
  .prose {
    font-size: 1rem;
    line-height: 1.9;
  }
}
</style>
