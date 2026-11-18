// Scaffold a new essay:  npm run new-essay -- my-essay-name
// Creates src/content/articles/my-essay-name.md with the front matter filled in.
import { existsSync, writeFileSync } from 'node:fs'

const slug = (process.argv[2] || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
if (!slug) {
  console.error('Usage: npm run new-essay -- my-essay-name   (English letters, numbers, dashes)')
  process.exit(1)
}
const file = new URL(`../src/content/articles/${slug}.md`, import.meta.url)
if (existsSync(file)) {
  console.error(`Already exists: src/content/articles/${slug}.md`)
  process.exit(1)
}
const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  file,
  `---
title: ชื่อบทความ
enTitle: English title
date: ${today}
course: Philosophy
tags: Philosophy
abstract: คำโปรยสั้น ๆ 1–2 ประโยค
---

> ประโยคเปิดเรื่อง (ลบบรรทัดนี้ได้ถ้าไม่ต้องการ)

ย่อหน้าแรก เว้นบรรทัดว่างระหว่างย่อหน้า ใส่เชิงอรรถแบบนี้[^1]

## หัวข้อย่อย

ย่อหน้าถัดไป

## บรรณานุกรม

- หนังสือที่อ้างอิง

[^1]: ข้อความเชิงอรรถ, น. 1
`,
)
console.log(`Created src/content/articles/${slug}.md → /article/${slug}`)
console.log('Optional: add "cover:", "coverCredit:" and "pdf:" lines to the front matter (see README).')
