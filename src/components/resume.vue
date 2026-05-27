<template>
  <div class="resume-wrapper">
    
    <div class="resume-interface">
      <header class="resume-header">
        <h1 class="resume-title monsieur-la-doulaise-regular">Resume</h1>
        <p class="resume-subtitle font-mono">
          Downloadable version of my professional background.
        </p>
      </header>

      <div class="resume-meta-bar">
        <div class="contact-links font-mono">
          <a href="mailto:tanadol.l@kkumail.com">Email</a>
          <span class="sep">/</span>
          <span class="location-text">Khon Kaen, Thailand</span>
          <span class="sep">/</span>
          <a href="https://github.com/tanadol-l" target="_blank" rel="noopener noreferrer">Github</a>
        </div>

        <a href="/resumes/dummy.pdf" download class="btn-download">
          <svg class="download-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M12.6666 10V12.6667C12.6666 13.0348 12.3681 13.3333 12 13.3333H4.00002C3.63191 13.3333 3.33335 13.0348 3.33335 12.6667V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M8 2.66666V10.6667" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M11.3334 7.99999L8.00002 11.3333L4.66669 7.99999" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Download PDF</span>
        </a>
      </div>
    </div>

    <div class="pdf-container">
      <div class="pdf-frame">
        <iframe
          src="/resumes/dummy.pdf#toolbar=0"
          class="pdf-iframe"
        ></iframe>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Monsieur+La+Doulaise&display=swap');

.resume-wrapper {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #252422;
  padding: 1rem 1.5rem 6rem;
  max-width: 950px;
  margin: 0 auto;
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

.resume-interface {
  display: flex;
  flex-direction: column;
  margin-bottom: 2.5rem;
}

.resume-header {
  margin-bottom: 1rem;
}

.resume-title {
  font-size: clamp(3.5rem, 9vw, 5.5rem);
  font-weight: 400;
  color: #eb5e28; 
  margin: 0;
}

.resume-subtitle {
  color: #475569;
  font-size: 0.88rem;
  margin-top: 0.3rem;
}

.resume-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(37, 36, 34, 0.05);
}

.contact-links {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.contact-links a {
  color: #403d39;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.3s ease;
}

.contact-links a:hover {
  color: #eb5e28; 
}

.location-text {
  font-weight: 500;
  color: #475569;
}

.sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.btn-download {
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: #252422; 
  border: 1px solid #252422;
  border-radius: 6px;
  color: #fffcf2; 
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-download:hover {
  background: #eb5e28; 
  border-color: #eb5e28;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(235, 94, 40, 0.15);
}

.download-icon {
  transition: transform 0.3s ease;
}

.btn-download:hover .download-icon {
  transform: translateY(1px);
}

.pdf-container {
  width: 100%;
}

.pdf-frame {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 40px 80px -20px rgba(37, 36, 34, 0.04); 
  border: 1px solid rgba(37, 36, 34, 0.05);
}

.pdf-iframe {
  width: 100%;
  height: 1050px;
  display: block;
  background: white;
  border: none;
}

@media (max-width: 768px) {
  .resume-meta-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    padding-bottom: 0.5rem;
  }
  
  .btn-download {
    width: 100%;
    justify-content: center;
  }

  .pdf-iframe {
    height: 600px;
  }
}
</style>