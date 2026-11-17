<script setup lang="ts">
import { computed, ref } from 'vue'
import { profile, education, skills, awards, leadership, certifications } from '../data/profile'

const awardFilter = ref<'All' | 'Cybersecurity' | 'Hackathon'>('All')
const shownAwards = computed(() =>
  awardFilter.value === 'All' ? awards : awards.filter((a) => a.category === awardFilter.value),
)

const connect = [
  { icon: 'pi-github', title: 'GitHub', text: 'Synxdicate', href: profile.links.github },
  { icon: 'pi-linkedin', title: 'LinkedIn', text: 'Tanadol Langputeh', href: profile.links.linkedin },
  { icon: 'pi-flag', title: 'Hack The Box', text: 'HTB profile', href: profile.links.htb },
  { icon: 'pi-flag-fill', title: 'TryHackMe', text: 'Harmonic66', href: profile.links.thm },
  { icon: 'pi-facebook', title: 'Facebook', text: 'synxdicate', href: profile.links.facebook },
  { icon: 'pi-envelope', title: 'Email', text: profile.email, href: `mailto:${profile.email}` },
]
</script>

<template>
  <div class="page">
    <h1 class="page-title">About</h1>

    <!-- Bio -->
    <section class="bio">
      <div class="photo-wrap">
        <img src="../assets/a.webp" :alt="profile.name" class="photo-img" width="373" height="372" />
        <div class="accent-line"></div>
      </div>
      <div class="bio-text">
        <div class="badge font-mono">{{ profile.role }}</div>
        <h2 class="name">{{ profile.name }}</h2>
        <p>
          Third-year <strong>Cybersecurity</strong> student at Khon Kaen University pursuing
          <strong>Offensive Security Engineering</strong>, with 3+ years of CTF experience and hands-on web/API and
          network pentesting.
        </p>
        <p>
          I built a cross-platform C2 framework (Python/Go) and an internal PKI platform, and have won or placed in
          8+ national competitions. Outside of security I read philosophy, mathematics, and literature.
        </p>
        <p class="meta font-mono"><i class="pi pi-map-marker"></i> {{ profile.location }}</p>
      </div>
    </section>

    <!-- Skills -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Skills & Tools</h2></div>
      <div class="skills">
        <div v-for="s in skills" :key="s.group" class="skill-row">
          <span class="skill-group">{{ s.group }}</span>
          <div class="chips"><span v-for="i in s.items" :key="i" class="chip">{{ i }}</span></div>
        </div>
      </div>
    </section>

    <!-- Practice platforms -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Practice</h2></div>
      <div class="practice">
        <a :href="profile.links.thm" target="_blank" rel="noopener noreferrer" class="card thm">
          <img :src="profile.links.thmBadge" alt="TryHackMe profile badge for Harmonic66: top 2%" width="400" height="171" loading="lazy" />
        </a>
        <a :href="profile.links.htb" target="_blank" rel="noopener noreferrer" class="card htb">
          <span class="p-eyebrow font-mono">Hack The Box</span>
          <span class="p-title">Machines, challenges &amp; pro labs</span>
          <span class="p-link font-mono">View profile <i class="pi pi-arrow-up-right"></i></span>
        </a>
      </div>
    </section>

    <!-- Awards -->
    <section v-reveal class="block">
      <div class="section-head"><h2 class="section-label">/ Competitions & Awards</h2></div>
      <div class="filters" role="tablist">
        <button
          v-for="f in (['All', 'Cybersecurity', 'Hackathon'] as const)"
          :key="f"
          role="tab"
          :aria-selected="awardFilter === f"
          :class="['filter-btn', { active: awardFilter === f }]"
          @click="awardFilter = f"
        >
          {{ f }}
        </button>
      </div>
      <TransitionGroup tag="ul" name="list" class="award-list">
        <li v-for="a in shownAwards" :key="a.title" class="award">
          <span class="award-year font-mono">{{ a.year }}</span>
          <span class="award-title">
            {{ a.title }}
            <a v-if="a.press" :href="a.press.url" target="_blank" rel="noopener noreferrer" class="press font-mono" :title="`News: ${a.press.source}`">news <i class="pi pi-arrow-up-right"></i></a>
          </span>
          <span class="award-result">{{ a.result }}</span>
        </li>
      </TransitionGroup>
    </section>

    <!-- Education / Leadership / Certs / Connect -->
    <section v-reveal class="grid">
      <div>
        <h2 class="section-label">/ Education</h2>
        <div class="track">
          <div v-for="e in education" :key="e.school" class="entry">
            <div class="entry-title">{{ e.school }}</div>
            <div class="entry-sub">{{ e.degree }}</div>
            <div class="entry-meta font-mono">{{ e.period }} · GPA {{ e.gpa }}</div>
            <div class="entry-note">{{ e.note }}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="section-label">/ Leadership</h2>
        <div class="track">
          <div v-for="l in leadership" :key="l.title" class="entry">
            <div class="entry-title">{{ l.title }}</div>
            <div class="entry-sub">{{ l.role }}</div>
            <div class="entry-meta font-mono">{{ l.year }}</div>
            <ul class="entry-points">
              <li v-for="p in l.points" :key="p">{{ p }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 class="section-label">/ Certifications</h2>
        <div class="stack-list">
          <component
            :is="c.url ? 'a' : 'div'"
            v-for="c in certifications"
            :key="c.name"
            :href="c.url"
            :target="c.url ? '_blank' : undefined"
            :rel="c.url ? 'noopener' : undefined"
            class="card cert-card"
          >
            <img v-if="c.badge" :src="c.badge" :alt="`${c.name} badge`" class="cert-badge" width="56" height="56" loading="lazy" />
            <div class="cert-body">
              <div class="entry-title">{{ c.name }}</div>
              <div class="entry-meta font-mono">{{ c.issuer }} · {{ c.year }}</div>
              <div v-if="c.id || c.note" class="cert-id font-mono">{{ c.id ? `ID ${c.id}` : c.note }}</div>
              <span v-if="c.url" class="cert-view font-mono">
                {{ c.url.includes('credly') ? 'Verify on Credly' : 'View certificate' }} <i class="pi pi-arrow-up-right"></i>
              </span>
            </div>
          </component>
        </div>
      </div>

      <div>
        <h2 class="section-label">/ Connect</h2>
        <div class="stack-list">
          <a
            v-for="c in connect"
            :key="c.title"
            :href="c.href"
            :target="c.href.startsWith('http') ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="card link-row"
          >
            <i :class="['pi', c.icon]"></i>
            <div class="link-inner">
              <span class="link-title">{{ c.title }}</span>
              <span class="link-text font-mono">{{ c.text }}</span>
            </div>
            <i class="pi pi-arrow-up-right arrow-icon"></i>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
}

.bio {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 3rem;
  align-items: start;
  margin-bottom: 4rem;
}

.photo-wrap {
  position: relative;
}

.photo-img {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1.1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--line);
}

.accent-line {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 55%;
  height: 55%;
  border-right: 2px solid rgba(235, 94, 40, 0.5);
  border-bottom: 2px solid rgba(235, 94, 40, 0.5);
  border-radius: 0 0 12px 0;
  pointer-events: none;
}

.badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.name {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 1.25rem;
}

.bio-text p {
  line-height: 1.8;
  color: var(--ink-2);
  margin: 0 0 1rem;
}

.bio-text strong {
  color: var(--ink);
}

.bio-text .meta {
  font-size: 0.78rem;
  color: var(--muted);
}

.block {
  margin-bottom: 4rem;
}

.skills {
  display: flex;
  flex-direction: column;
}

.skill-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
}

.skill-group {
  font-weight: 700;
  font-size: 0.88rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.practice {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1rem;
}

.thm {
  padding: 0;
  overflow: hidden;
  display: block;
}

.thm img {
  display: block;
  width: 100%;
  height: auto;
}

.htb {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.45rem;
}

.p-eyebrow {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  font-weight: 600;
}

.p-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
}

.p-link {
  font-size: 0.72rem;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.htb:hover .p-link {
  color: var(--accent);
}

@media (max-width: 640px) {
  .practice {
    grid-template-columns: 1fr;
  }
}

.filters {
  display: flex;
  gap: 1.75rem;
  margin-bottom: 1rem;
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
  padding: 0 0 0.35rem;
  border-bottom: 2px solid transparent;
  transition: color 0.3s, border-color 0.3s;
}

.filter-btn:hover,
.filter-btn.active {
  color: var(--accent);
}

.filter-btn.active {
  border-color: var(--accent);
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
  padding: 0.85rem 0;
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
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--muted);
  vertical-align: middle;
  transition: color 0.2s, border-color 0.2s;
}

.press .pi {
  font-size: 0.5rem;
}

.press:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.award-title {
  font-weight: 600;
  font-size: 0.93rem;
}

.award-result {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
  text-align: right;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s var(--ease);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.list-leave-active {
  position: absolute;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.track {
  border-left: 2px solid rgba(235, 94, 40, 0.3);
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.entry-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.entry-sub {
  font-size: 0.82rem;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.entry-meta {
  font-size: 0.72rem;
  color: var(--muted);
}

.entry-note {
  font-size: 0.82rem;
  color: var(--ink-3);
  line-height: 1.6;
  margin-top: 0.4rem;
}

.entry-points {
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  font-size: 0.82rem;
  color: var(--ink-3);
  line-height: 1.6;
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cert-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
}

.cert-badge {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  object-fit: contain;
}

.cert-body {
  min-width: 0;
}

.cert-id {
  font-size: 0.66rem;
  color: var(--muted);
  margin-top: 0.3rem;
}

.cert-view {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent);
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
}

.link-row > .pi:first-child {
  font-size: 1.05rem;
  color: var(--muted);
}

.link-row:hover > .pi:first-child {
  color: var(--accent);
}

.link-inner {
  flex: 1;
  min-width: 0;
}

.link-title {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
}

.link-text {
  display: block;
  font-size: 0.72rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 0.75rem;
  color: var(--accent);
  opacity: 0;
  transition: opacity 0.2s;
}

.link-row:hover .arrow-icon {
  opacity: 1;
}

@media (max-width: 768px) {
  .bio {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .photo-wrap {
    max-width: 160px;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .skill-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .award {
    grid-template-columns: 3rem 1fr;
  }
  .award-result {
    grid-column: 2;
    text-align: left;
  }
}
</style>
