// Regenerates public/sitemap.xml before every build: fixed pages + one URL per essay
// in src/content/articles/. Runs automatically via the "prebuild" npm script.
import { readdirSync, writeFileSync } from 'node:fs'

const SITE = 'https://tanadol-l.vercel.app'
const pages = ['', 'about', 'project', 'article', 'books', 'resume']
const essays = readdirSync(new URL('../src/content/articles/', import.meta.url))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `article/${f.replace(/\.md$/, '')}`)

const urls = [...pages, ...essays].map((p) => `  <url><loc>${SITE}/${p}</loc></url>`).join('\n')
writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`sitemap: ${pages.length + essays.length} urls`)
