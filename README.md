# tanadol-l.vercel.app

Personal portfolio of Tanadol Langputeh (synxdicate), built with Vue 3, TypeScript, and Vite. It's deployed on Vercel.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Updating content

You shouldn't need to touch the components for content changes:

| What | Where |
| --- | --- |
| Bio, links, education, skills, awards, projects, leadership, certifications | `src/data/profile.ts` |
| Bookshelf on the home page | `src/data/books.ts` |
| Essays (Thai, with footnotes) | `src/data/articles.ts` → rendered at `/article/:slug` |
| Essay PDFs | `public/articles/<slug>.pdf`: the original files, served as-is for download |
| CV PDF | replace `public/resumes/tanadol_langputeh-CV.pdf` |
| Background music | Add a MIDI file to `public/music/midi/` and list it in `src/data/music.ts`. It plays on the sampled piano in `public/piano/`. Credits are in `public/music/CREDITS.txt` |

`vercel.json` rewrites every path to `index.html`, so deep links such as `/about` keep working on refresh. It also sets basic security headers.
