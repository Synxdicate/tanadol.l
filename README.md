# tanadol-l.vercel.app

Personal portfolio of Tanadol Langputeh (synxdicate), built with Vue 3, TypeScript, and Vite. It's deployed on Vercel: every push to `main` goes live.

## คู่มือฉบับย่อ (ภาษาไทย)

### เริ่มใช้งานในเครื่อง

```bash
npm install      # ครั้งแรกครั้งเดียว
npm run dev      # เปิดดูเว็บที่ http://localhost:5173 (แก้ไฟล์แล้วหน้าเว็บอัปเดตเอง)
```

### เพิ่มหนังสือ

1. เปิดไฟล์ `src/data/books.ts`
2. เพิ่มหนึ่งบรรทัดในรายการ `books`

   ```ts
   { title: "Sapiens", category: "Mind & Learning", author: "Yuval Noah Harari", status: "Reading", coverArt: "https://ลิงก์รูปปก.jpg" },
   ```

   - `category` เลือกได้ 1 ใน: `Literature`, `Philosophy`, `Mind & Learning`, `Economics & Money`, `Epics`. ถ้าอยากเพิ่มหมวดใหม่ ให้เพิ่มชื่อหมวดในบรรทัด `CATEGORIES` ด้านบนของไฟล์เดียวกัน
   - `status` ใส่ `"Reading"` (กำลังอ่าน) หรือ `"Completed"` (อ่านจบแล้ว)
   - `coverArt` คือลิงก์รูปปก ถ้าลิงก์เสีย เว็บจะแสดงปกผ้าพร้อมชื่อเรื่องแทนให้เอง ถ้าไม่อยากพึ่งเว็บอื่น ให้วางรูปไว้ใน `public/books/` แล้วใส่ `"/books/ชื่อไฟล์.jpg"`
3. อ่านจบเมื่อไหร่ แค่เปลี่ยน `status` เป็น `"Completed"`

### เพิ่มบทความ

1. สร้างไฟล์บทความจากแม่แบบด้วยคำสั่ง

   ```bash
   npm run new-essay -- ชื่อไฟล์ภาษาอังกฤษ
   ```

   เช่น `npm run new-essay -- free-will` จะได้ไฟล์ `src/content/articles/free-will.md` และหน้าเว็บ `/article/free-will`
2. เปิดไฟล์นั้น แก้ส่วนหัว (ระหว่าง `---` สองเส้น): ชื่อเรื่อง ชื่ออังกฤษ วันที่ วิชา แท็ก และคำโปรย
3. เขียนเนื้อหาด้านล่าง
   - **ย่อหน้า:** เว้นบรรทัดว่างหนึ่งบรรทัดระหว่างย่อหน้า
   - **หัวข้อ:** ขึ้นต้นด้วย `## `
   - **ประโยคเปิดเรื่องตัวใหญ่:** ขึ้นต้นด้วย `> `
   - **เชิงอรรถ:** ใส่ `[^1]` ตรงจุดที่อ้าง แล้วเขียน `[^1]: ข้อความ` ไว้ท้ายไฟล์
   - **บรรณานุกรม:** หัวข้อ `## บรรณานุกรม` ตามด้วยรายการที่ขึ้นต้นด้วย `- `
   - **ตัวหนา:** `**แบบนี้**` และ **ตัวเอียง:** `*แบบนี้*`
4. (ไม่บังคับ) ภาพปกและไฟล์ PDF
   - วางรูปปกใน `public/articles/covers/` แล้วเพิ่มบรรทัด `cover: /articles/covers/ชื่อรูป.webp` และ `coverCredit: เครดิตภาพ` ในส่วนหัว
   - วาง PDF ใน `public/articles/` แล้วเพิ่ม `pdf: /articles/ชื่อไฟล์.pdf`
   - ถ้าไม่ใส่ภาพปก เว็บจะวาดลายให้เอง ถ้าไม่ใส่ PDF ปุ่มดาวน์โหลดจะซ่อนไป
5. บทความเรียงตามวันที่ ล่าสุดอยู่บนสุด ส่วน sitemap และ RSS feed (`/rss.xml`) อัปเดตเองตอน build

### แก้ข้อมูลอื่น ๆ

| อยากแก้ | ไฟล์ |
| --- | --- |
| ประวัติ ทักษะ รางวัล โปรเจกต์ ใบรับรอง ลิงก์ติดต่อ | `src/data/profile.ts` |
| CV (PDF) | แทนที่ไฟล์ `public/resumes/tanadol_langputeh-CV.pdf` |
| เพลงเปียโน | ไฟล์ MIDI ใน `public/music/midi/` แล้วเพิ่มชื่อเพลงใน `src/data/music.ts` |

### เผยแพร่ขึ้นเว็บ

```bash
npm run build                           # เช็คว่าไม่มี error ก่อน
git add -A
git commit -m "add essay: free will"    # ข้อความอธิบายสิ่งที่เปลี่ยน
git push                                # Vercel จะอัปเดตเว็บจริงให้เองภายในไม่กี่นาที
```

---

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sitemap + type-check + production build to dist/
```

## Updating content

You shouldn't need to touch the components for content changes:

| What | Where |
| --- | --- |
| Bio, links, education, skills, awards, projects, leadership, certifications | `src/data/profile.ts` |
| Books (home page strip + `/books` shelves) | `src/data/books.ts` |
| Essays | one Markdown file per essay in `src/content/articles/` |
| Essay PDFs and cover images | `public/articles/` and `public/articles/covers/` |
| CV PDF | replace `public/resumes/tanadol_langputeh-CV.pdf` |
| Background music | a MIDI file in `public/music/midi/`, listed in `src/data/music.ts`. Credits are in `public/music/CREDITS.txt` |

### Add a book

Add one line to the `books` list in `src/data/books.ts`:

```ts
{ title: "Sapiens", category: "Mind & Learning", author: "Yuval Noah Harari", status: "Reading", coverArt: "https://…/cover.jpg" },
```

- `category` must be one of `Literature`, `Philosophy`, `Mind & Learning`, `Economics & Money`, `Epics`. To add a new shelf, add its name to `CATEGORIES` at the top of the same file.
- `status` is `Reading` or `Completed`. When you finish a book, change it to `Completed`.
- `coverArt` is an image URL. If it ever fails to load, the site shows a cloth-bound cover with the title instead. For a cover that never breaks, put the image in `public/books/` and use `"/books/file.jpg"`.

### Add an essay

1. Run `npm run new-essay -- my-essay` to create `src/content/articles/my-essay.md` from a template (or create the file yourself). The file name becomes the address: `my-essay.md` → `/article/my-essay`. Use English letters, numbers and dashes.
2. Write it like this:

```md
---
title: ชื่อบทความภาษาไทย
enTitle: English title
date: 2026-12-01
course: Political Philosophy
tags: Philosophy, Political Theory
abstract: คำโปรยสั้น ๆ 1–2 ประโยค แสดงในหน้ารายการบทความ
cover: /articles/covers/my-essay.webp
coverCredit: Photo: someone / Pixabay
pdf: /articles/my-essay.pdf
---

> ประโยคเปิดเรื่อง (ตัวใหญ่ มีแถบสีส้ม) — optional

ย่อหน้าแรก เว้นบรรทัดว่างระหว่างย่อหน้า ใส่เชิงอรรถแบบนี้[^1] ตัวหนา **แบบนี้**

## หัวข้อย่อย

ย่อหน้าถัดไป[^2]

## บรรณานุกรม

- หนังสือเล่มที่หนึ่ง
- หนังสือเล่มที่สอง

[^1]: ข้อความเชิงอรรถที่ 1, น. 12
[^2]: ข้อความเชิงอรรถที่ 2
```

- `cover`, `coverCredit` and `pdf` are optional. Without `cover` the site draws a pattern; without `pdf` the PDF button is hidden.
- Put the cover image in `public/articles/covers/` and the PDF in `public/articles/`.
- Essays are listed newest first by `date`. The sitemap updates itself on build.

Then `npm run dev` to preview, and commit + push to publish.

`vercel.json` rewrites every path to `index.html`, so deep links such as `/about` keep working on refresh. It also sets basic security headers.
