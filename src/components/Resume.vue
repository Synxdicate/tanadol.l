<script setup lang="ts">
// Resume: a readable web version built from src/data/profile.ts (works on every phone,
// prints cleanly, indexable), with a switch to the original PDF.
import { ref } from 'vue'
import { awards, certifications, education, leadership, profile, projects, skills } from '../data/profile'

const view = ref<'web' | 'pdf'>('pdf') // the original PDF first; the web version is one tap away
const featured = projects.filter((p) => p.featured)
const topAwards = awards.slice(0, 8)
const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
</script>

<template>
  <div class="page resume">
    <header class="page-header no-print">
      <h1 class="page-title">Resume</h1>
      <p class="page-subtitle">My CV as a PDF, or switch to the web version for easier reading on a phone.</p>
    </header>

    <div class="bar no-print">
      <div class="switch" role="tablist" aria-label="Resume format">
        <button role="tab" :aria-selected="view === 'pdf'" :class="{ active: view === 'pdf' }" @click="view = 'pdf'">
          <i class="pi pi-file-pdf"></i> PDF
        </button>
        <button role="tab" :aria-selected="view === 'web'" :class="{ active: view === 'web' }" @click="view = 'web'">
          <i class="pi pi-align-left"></i> Web
        </button>
      </div>
      <a :href="profile.resumePdf" download="Tanadol_Langputeh_CV.pdf" class="btn btn-primary">
        <i class="pi pi-download"></i> Download PDF
      </a>
    </div>

    <!-- ---------- web version ---------- -->
    <article v-if="view === 'web'" class="cv card">
      <header class="cv-head">
        <div>
          <h2 class="cv-name">{{ profile.name }}</h2>
          <p class="cv-role">{{ profile.role }}</p>
        </div>
        <ul class="cv-contact font-mono">
          <li><i class="pi pi-map-marker"></i> {{ profile.location }}</li>
          <li><i class="pi pi-envelope"></i> <a :href="`mailto:${profile.email}`">{{ profile.email }}</a></li>
          <li>
            <i class="pi pi-github"></i>
            <a :href="profile.links.github" target="_blank" rel="noopener noreferrer">{{ host(profile.links.github) }}</a>
          </li>
          <li>
            <i class="pi pi-linkedin"></i>
            <a :href="profile.links.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
        </ul>
      </header>

      <p class="cv-summary">{{ profile.summary }}</p>

      <section class="cv-sec">
        <h3>Education</h3>
        <div v-for="e in education" :key="e.school" class="item">
          <div class="item-top">
            <strong>{{ e.school }}</strong>
            <span class="when font-mono">{{ e.period }}</span>
          </div>
          <div class="item-sub">{{ e.degree }} · GPA {{ e.gpa }}</div>
          <p class="item-note">{{ e.note }}</p>
        </div>
      </section>

      <section class="cv-sec">
        <h3>Technical skills</h3>
        <dl class="skills">
          <template v-for="s in skills" :key="s.group">
            <dt>{{ s.group }}</dt>
            <dd>{{ s.items.join(' · ') }}</dd>
          </template>
        </dl>
      </section>

      <section class="cv-sec">
        <h3>Competitions</h3>
        <ul class="awards">
          <li v-for="a in topAwards" :key="a.title">
            <span class="when font-mono">{{ a.year }}</span>
            <span class="a-title">{{ a.title }}</span>
            <span class="a-result">{{ a.result }}</span>
          </li>
        </ul>
        <router-link v-if="awards.length > topAwards.length" to="/about" class="more font-mono no-print">
          All {{ awards.length }} results →
        </router-link>
      </section>

      <section class="cv-sec">
        <h3>Projects</h3>
        <div v-for="p in featured" :key="p.name" class="item">
          <div class="item-top">
            <strong>{{ p.name }}</strong>
            <span class="when font-mono">{{ p.stack.join(' · ') }}</span>
          </div>
          <div class="item-sub">{{ p.kind }}</div>
          <ul class="points">
            <li v-for="h in p.highlights ?? [p.desc]" :key="h">{{ h }}</li>
          </ul>
        </div>
      </section>

      <section class="cv-sec">
        <h3>Leadership</h3>
        <div v-for="l in leadership" :key="l.title" class="item">
          <div class="item-top">
            <strong>{{ l.title }}</strong>
            <span class="when font-mono">{{ l.year }}</span>
          </div>
          <div class="item-sub">{{ l.role }}</div>
          <ul class="points">
            <li v-for="pt in l.points" :key="pt">{{ pt }}</li>
          </ul>
        </div>
      </section>

      <section class="cv-sec">
        <h3>Certifications</h3>
        <ul class="certs">
          <li v-for="c in certifications" :key="c.name">
            <span class="when font-mono">{{ c.year }}</span>
            <span>{{ c.name }} <span class="muted">— {{ c.issuer }}</span></span>
          </li>
        </ul>
      </section>
    </article>

    <!-- ---------- original PDF ---------- -->
    <div v-else class="pdf-frame">
      <object
        :data="`${profile.resumePdf}#toolbar=0&view=FitH`"
        type="application/pdf"
        class="pdf"
        aria-label="Tanadol Langputeh CV (PDF)"
        title="Tanadol Langputeh CV (PDF)"
      >
        <div class="fallback">
          <p>This browser can't show PDFs inside the page.</p>
          <div class="fb-actions">
            <a :href="profile.resumePdf" target="_blank" rel="noopener" class="btn btn-primary">Open the PDF</a>
            <button class="btn btn-ghost" @click="view = 'web'">Read the web version</button>
          </div>
        </div>
      </object>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
}

.switch button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  background: none;
  border: none;
  border-radius: 999px;
  padding: 0.4rem 0.95rem;
  transition: color 0.2s, background 0.25s var(--ease);
}

.switch button.active {
  background: var(--ink);
  color: var(--bg);
}

/* ---------- the CV sheet ---------- */
.cv {
  padding: clamp(1.25rem, 4vw, 2.75rem);
}

.cv-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.25rem 2rem;
  flex-wrap: wrap;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid var(--ink);
}

.cv-name {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  letter-spacing: -0.02em;
}

.cv-role {
  margin: 0.3rem 0 0;
  color: var(--accent-text);
  font-weight: 600;
}

.cv-contact {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--ink-3);
}

.cv-contact .pi {
  width: 1rem;
  font-size: 0.7rem;
  color: var(--muted);
}

.cv-contact a:hover {
  color: var(--accent-text);
}

.cv-summary {
  margin: 1.25rem 0 0;
  line-height: 1.75;
  color: var(--ink-2);
}

.cv-sec {
  margin-top: 1.75rem;
}

.cv-sec h3 {
  margin: 0 0 0.9rem;
  font-family: var(--font-pixel);
  font-size: 0.8rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-text);
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--line);
}

.item + .item {
  margin-top: 1rem;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem 1rem;
  flex-wrap: wrap;
}

.when {
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
}

.item-sub {
  font-size: 0.85rem;
  color: var(--ink-3);
  margin-top: 0.15rem;
}

.item-note {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-3);
  line-height: 1.6;
}

.points {
  margin: 0.4rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.86rem;
  line-height: 1.65;
  color: var(--ink-2);
}

.points li::marker {
  color: var(--accent-text);
}

.skills {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.45rem 1.25rem;
  margin: 0;
  font-size: 0.86rem;
}

.skills dt {
  font-weight: 700;
}

.skills dd {
  margin: 0;
  color: var(--ink-2);
}

.awards,
.certs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
  font-size: 0.86rem;
}

.awards li {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  gap: 0.75rem;
  align-items: baseline;
}

.a-result {
  font-weight: 700;
  color: var(--accent-text);
  text-align: right;
}

.certs li {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 0.75rem;
}

.muted {
  color: var(--muted);
}

.more {
  display: inline-block;
  margin-top: 0.6rem;
  font-size: 0.72rem;
  color: var(--muted);
}

.more:hover {
  color: var(--accent-text);
}

/* ---------- PDF ---------- */
.pdf-frame {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: 0 40px 80px -20px var(--shadow);
}

.pdf {
  width: 100%;
  height: 1100px;
  display: block;
}

.fallback {
  padding: 4rem 1.5rem;
  text-align: center;
  color: #444;
}

.fb-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.fallback .btn-ghost {
  color: #333;
  border-color: #ccc;
  background: #fff;
}

@media (max-width: 640px) {
  .skills {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
  .skills dd {
    margin-bottom: 0.5rem;
  }
  .awards li {
    grid-template-columns: 2.6rem 1fr;
  }
  .a-result {
    grid-column: 2;
    text-align: left;
  }
  .pdf {
    height: 75vh;
  }
}

/* printing the web version gives a clean paper CV */
@media print {
  .cv {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
</style>
