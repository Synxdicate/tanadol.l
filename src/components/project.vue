<script setup>
const projects = [
  {
    name: "ihatenetwork",
    desc: "mini project create lab for CCNA",
    stack: ["Packet Tracer", "Networking"],
    github: "https://github.com/Synxdicate/ihatenetwork/",
  },
  {
    name: "Note",
    desc: "Just a second brain for my thoughts and research notes.",
    stack: ["Knowledge"],
    github: "https://github.com/Synxdicate/Note",
  },
  {
    name: "scanqr",
    desc: "created scanner by capture and result link.",
    stack: ["web"],
    github: "https://github.com/Synxdicate/scanqr",
  },
  {
    name: "IDWTLG",
    desc: "pomodoro still update.",
    stack: ["web"],
    github: "https://github.com/Synxdicate/IDWTLG",
  }
];
</script>

<template>
  <div class="project-container">

    <header class="section-header">
      <h1 class="title monsieur-la-doulaise-regular">Projects</h1>
      <p class="subtitle">Tools, experiments, and systems I've built.</p>
    </header>

    <div class="project-grid">

      <component
        v-for="p in projects"
        :key="p.name"
        :is="p.demo || p.github ? 'a' : 'div'"
        class="project-card"
        :href="p.demo || p.github"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="card-top">
          <h3 class="project-name">{{ p.name }}</h3>
          <p class="project-desc">{{ p.desc }}</p>
        </div>

        <div class="stack">
          <span v-for="s in p.stack" :key="s" class="font-mono">{{ s }}</span>
        </div>

        <div class="card-footer">
          <i class="pi pi-external-link footer-icon"></i>
        </div>

      </component>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Monsieur+La+Doulaise&display=swap');

.project-container {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 1.5rem 5rem;
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

.title {
  font-size: clamp(3.5rem, 9vw, 5.5rem);
  font-weight: 400;
  color: #eb5e28; 
  margin: 0;
}

.subtitle {
  color: #475569;
  font-size: 0.88rem;
  margin-top: 0.4rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.6); 
  border: 1px solid rgba(37, 36, 34, 0.06); 
  border-radius: 14px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover {
  transform: translateY(-5px);
  border-color: #eb5e28; 
  background: #ffffff;
  box-shadow: 0 15px 35px rgba(37, 36, 34, 0.04); 
}

.project-card:focus-visible {
  outline: 2px solid #eb5e28;
  outline-offset: 2px;
}

.project-name {
  font-size: 1.25rem;
  color: #252422; 
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.project-desc {
  font-size: 0.88rem;
  color: #403d39; 
  line-height: 1.6;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.stack span {
  font-size: 0.65rem;
  background: rgba(235, 94, 40, 0.06); 
  color: #eb5e28;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid rgba(235, 94, 40, 0.1);
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.footer-icon {
  font-size: 0.82rem;
  color: #475569;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.project-card:hover .footer-icon {
  color: #eb5e28; 
  opacity: 1;
  transform: translate(2px, -2px); 
}
</style>