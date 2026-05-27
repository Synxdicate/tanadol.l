<template>
  <div class="page">
    <h1 class="section-title monsieur-la-doulaise-regular">About</h1>

    <div class="bio">
      <div class="photo-wrap">
        <img src="../assets/a.png" alt="Tanadol L." class="photo-img" loading="lazy" />
        <div class="accent-line"></div>
      </div>
      <div class="bio-text">
        <div class="badge font-mono">Script kiddie</div>
        <h2 class="name">Tanadol L.</h2>
        <p>Driven by the intersection of <strong>cybersecurity</strong> and <strong>mathematical logic</strong>. My work focuses on building secure systems and exploring the deep structures of code.</p>
        <p>With a foundation in Computer Science, I spend my time researching cryptography, solving Hack The Box machines, and pondering philosophical arguments.</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="grid">
      <div>
        <p class="section-label font-mono">/ Education</p>
        <div class="edu-track">
          <div class="edu-entry">
            <div class="edu-school">Khon Kaen University</div>
            <div class="edu-deg">B.Sc. Computer Science</div>
            <div class="edu-year font-mono">2024 – Present</div>
            <div class="edu-note">Cybersecurity, cryptography &amp; network architecture.</div>
          </div>
          <div class="edu-entry">
            <div class="edu-school">Krabi Technical College</div>
            <div class="edu-deg">Vocational Cert. Electronics</div>
            <div class="edu-year font-mono">2021 – 2024</div>
            <div class="edu-note">Hands-on training for electronics technician roles.</div>
          </div>
          <div class="edu-entry">
            <div class="edu-school">Santiwitthaya School Krabi</div>
            <div class="edu-deg">Lower Secondary</div>
            <div class="edu-year font-mono">2019 – 2023</div>
          </div>
        </div>
      </div>

      <div>
        <p class="section-label font-mono">/ Certifications</p>
        <div class="cert-list">
          <div class="cert-card">
            <div class="cert-name">CC</div>
            <div class="cert-issuer font-mono">ISC2</div>
            <span class="cert-status font-mono">In progress</span>
          </div>
          <div class="cert-card">
            <div class="cert-name">CCNA</div>
            <div class="cert-issuer font-mono">Cisco</div>
            <span class="cert-status font-mono">In progress</span>
          </div>
        </div>
      </div>

      <div>
        <p class="section-label font-mono">/ Connect</p>
        <div class="links-list">
          <a href="https://github.com/synxdicate" target="_blank" class="link-row">
            <i class="pi pi-github"></i>
            <div class="link-inner">
              <span class="link-title-text">GitHub</span>
              <span class="link-url-text font-mono">synxdicate</span>
            </div>
            <i class="pi pi-arrow-up-right arrow-icon"></i>
          </a>
          <a href="https://linkedin.com/in/tanadol-langputeh-569a43323" target="_blank" class="link-row">
            <i class="pi pi-linkedin"></i>
            <div class="link-inner">
              <span class="link-title-text">LinkedIn</span>
              <span class="link-url-text font-mono">Tanadol Langputeh</span>
            </div>
            <i class="pi pi-arrow-up-right arrow-icon"></i>
          </a>
          <a href="https://web.facebook.com/synxdicate66/" target="_blank" class="link-row">
            <i class="pi pi-facebook"></i>
            <div class="link-inner">
              <span class="link-title-text">Facebook</span>
              <span class="link-url-text font-mono">synxdicate</span>
            </div>
            <i class="pi pi-arrow-up-right arrow-icon"></i>
          </a>
          <a href="mailto:tanadol.l@kkumail.com" class="link-row">
            <i class="pi pi-envelope"></i>
            <div class="link-inner">
              <span class="link-title-text">Email</span>
              <span class="link-url-text font-mono">tanadol.l@kkumail.com</span>
            </div>
            <i class="pi pi-arrow-up-right arrow-icon"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Monsieur+La+Doulaise&display=swap');

.page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1.5rem 6rem;
  color: #252422; 
  -webkit-font-smoothing: antialiased;
}

.monsieur-la-doulaise-regular {
  font-family: "Monsieur La Doulaise", cursive;
  font-weight: 400;
  font-style: normal;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.section-title {
  font-size: clamp(3.5rem, 9vw, 5.5rem); 
  color: #eb5e28;
  margin: 0 0 1rem;
  font-weight: 400;
  text-transform: none;
}

.bio {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 3rem;
  align-items: start;
  margin-bottom: 3rem;
}

.photo-wrap {
  position: relative;
}

.photo-img {
  width: 100%;
  aspect-ratio: 1 / 1.1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(37, 36, 34, 0.1);
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
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #eb5e28; 
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.name {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #252422;
  margin: 0 0 1.25rem;
}

.bio-text p {
  font-size: 1rem;
  line-height: 1.8;
  color: #403d39; 
  margin-bottom: 1rem;
}

.bio-text strong {
  font-weight: 700;
  color: #252422;
}

.divider {
  height: 1px;
  background: rgba(37, 36, 34, 0.1);
  margin: 2.5rem 0;
}

.grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.edu-track {
  border-left: 2px solid rgba(235, 94, 40, 0.3);
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.edu-school {
  font-size: 0.95rem;
  font-weight: 700;
  color: #252422;
  margin-bottom: 0.25rem;
}

.edu-deg {
  font-size: 0.82rem;
  color: #eb5e28;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.edu-year {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.edu-note {
  font-size: 0.82rem;
  color: #575551;
  line-height: 1.6;
  margin-top: 0.4rem;
}

.cert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cert-card {
  padding: 1rem 1.2rem;
  border: 1px dashed rgba(37, 36, 34, 0.18);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cert-card:hover {
  border-color: #eb5e28;
  background-color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 36, 34, 0.04);
}

.cert-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #252422;
  margin-bottom: 0.25rem;
}

.cert-issuer {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 500;
}

.cert-status {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #eb5e28; 
  margin-top: 0.5rem;
  display: block;
  font-weight: 600;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid rgba(37, 36, 34, 0.06);
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  text-decoration: none;
  color: #252422;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.link-row:hover {
  border-color: #eb5e28;
  background-color: #ffffff;
  transform: translateX(4px); 
  box-shadow: 0 8px 20px rgba(37, 36, 34, 0.04);
}

.link-row > .pi:first-child {
  font-size: 1.1rem;
  color: #64748b;
}

.link-row:hover > .pi:first-child {
  color: #eb5e28;
}

.link-inner {
  flex: 1;
}

.link-title-text {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
}

.link-url-text {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.arrow-icon {
  font-size: 0.75rem;
  color: #64748b;
  opacity: 0;
  transition: all 0.2s ease;
}

.link-row:hover .arrow-icon {
  opacity: 1;
  color: #eb5e28;
  transform: translate(1px, -1px);
}

.footer {
  padding-top: 3rem;
  border-top: 1px solid rgba(37, 36, 34, 0.1);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.email-link {
  font-size: clamp(1.2rem, 3.5vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #252422;
  text-decoration: none;
  transition: color 0.25s;
}

.email-link:hover {
  color: #eb5e28;
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

  .footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>