// Generates public/rss.xml from the essays in src/content/articles/ (front matter only).
// Runs automatically before every build via the "prebuild" npm script.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://tanadol-l.vercel.app'
const dir = new URL('../src/content/articles/', import.meta.url)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const items = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const src = readFileSync(new URL(f, dir), 'utf8').replace(/\r\n?/g, '\n')
    const fm = {}
    const m = src.match(/^---\n([\s\S]*?)\n---/)
    for (const line of m ? m[1].split('\n') : []) {
      const i = line.indexOf(':')
      if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    return { slug: f.replace(/\.md$/, ''), ...fm }
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tanadol Langputeh — Essays</title>
    <link>${SITE}/article</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Essays on philosophy, mathematical logic and political theory, written in Thai.</description>
    <language>th</language>
${items
  .map(
    (a) => `    <item>
      <title>${esc(a.title || a.slug)}</title>
      <link>${SITE}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE}/article/${a.slug}</guid>
      ${a.date ? `<pubDate>${new Date(a.date + 'T00:00:00+07:00').toUTCString()}</pubDate>` : ''}
      <description>${esc(a.abstract || '')}</description>${(a.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => `\n      <category>${esc(t)}</category>`)
        .join('')}
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`
writeFileSync(new URL('../public/rss.xml', import.meta.url), xml)
console.log(`rss: ${items.length} essays`)
