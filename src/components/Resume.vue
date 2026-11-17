<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Resume</h1>
      <p class="page-subtitle font-mono">Latest version of my CV.</p>
    </header>

    <div class="meta-bar">
      <ul class="contact font-mono">
        <li><a :href="`mailto:${profile.email}`">Email</a></li>
        <li>{{ profile.location }}</li>
        <li><a :href="profile.links.github" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        <li><a :href="profile.links.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
      </ul>

      <div class="actions">
        <a :href="profile.resumePdf" target="_blank" rel="noopener" class="btn btn-ghost">
          <i class="pi pi-external-link"></i> Open
        </a>
        <a :href="profile.resumePdf" download="Tanadol_Langputeh_CV.pdf" class="btn btn-primary">
          <i class="pi pi-download"></i> Download
        </a>
      </div>
    </div>

    <div class="pdf-frame">
      <object :data="`${profile.resumePdf}#toolbar=0&view=FitH`" type="application/pdf" class="pdf">
        <div class="fallback">
          <p>Your browser can't preview PDFs inline.</p>
          <a :href="profile.resumePdf" target="_blank" rel="noopener" class="btn btn-primary">Open the PDF</a>
        </div>
      </object>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1rem;
}

.meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0 2rem;
  border-top: 1px solid var(--line);
}

.contact {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* separator lives on the item, so a wrapped line never starts with a stray "/" */
.contact li:not(:last-child)::after {
  content: '/';
  margin: 0 0.7rem;
  opacity: 0.3;
}

.contact a {
  color: var(--ink-2);
  font-weight: 700;
}

.contact a:hover {
  color: var(--accent);
}

.actions {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
}

.actions .btn {
  white-space: nowrap;
}

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
  color: var(--ink-3);
}

@media (max-width: 768px) {
  .meta-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .actions .btn {
    flex: 1;
    justify-content: center;
  }
  .pdf {
    height: 75vh;
  }
}
</style>
