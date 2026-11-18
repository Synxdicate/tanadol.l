// Turns an essay written in Markdown (src/content/articles/*.md) into the Article shape
// the pages render. Supported syntax — deliberately small:
//
//   ---                         front matter, one `key: value` per line
//   title: …                    (title, enTitle, date, course, tags, abstract,
//   ---                          cover, coverCredit, pdf — see the README)
//
//   > opening line              a "lead" paragraph (big, with an accent bar)
//   ## Heading                  section heading
//   Plain paragraph[^1]         paragraphs are separated by a blank line;
//   **bold** and *italic*        [^n] marks footnote n
//   ## บรรณานุกรม / ## Bibliography   then "- item" lines → bibliography list
//   [^1]: the footnote text     footnote definitions, anywhere in the file

export interface ArticleBlock {
  type: 'p' | 'h' | 'lead'
  text: string // HTML-safe; footnote markers are <sup>n</sup>
}

export interface Article {
  slug: string
  title: string
  enTitle: string
  date: string
  course: string
  tags: string[]
  abstract: string
  blocks: ArticleBlock[]
  notes: string[]
  bibliography: string[]
  cover?: string
  coverCredit?: string
  pdf?: string
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const inline = (s: string) =>
  escape(s)
    .replace(/\[\^(\d+)\]/g, '<sup>$1</sup>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')

const BIBLIOGRAPHY = /^##\s+(บรรณานุกรม|bibliography|references)\s*$/i

export function parseArticle(slug: string, source: string): Article {
  const text = source.replace(/\r\n?/g, '\n')
  const fm: Record<string, string> = {}
  let body = text
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (m) {
    for (const line of m[1].split('\n')) {
      const i = line.indexOf(':')
      if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    body = text.slice(m[0].length)
  }

  // footnote definitions: "[^n]: text" (single line each)
  const notesByNumber = new Map<number, string>()
  body = body.replace(/^\[\^(\d+)\]:[ \t]*(.*)$/gm, (_, n: string, t: string) => {
    notesByNumber.set(Number(n), t.trim())
    return ''
  })
  const maxNote = Math.max(0, ...notesByNumber.keys())
  const notes = Array.from({ length: maxNote }, (_, i) => notesByNumber.get(i + 1) ?? '')

  const blocks: ArticleBlock[] = []
  const bibliography: string[] = []
  let inBibliography = false
  for (const raw of body.split(/\n{2,}/)) {
    const chunk = raw.trim()
    if (!chunk) continue
    if (BIBLIOGRAPHY.test(chunk.split('\n')[0])) {
      inBibliography = true
      const rest = chunk.split('\n').slice(1)
      bibliography.push(...rest.filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim()))
      continue
    }
    if (inBibliography && chunk.split('\n').every((l) => l.startsWith('- '))) {
      bibliography.push(...chunk.split('\n').map((l) => l.slice(2).trim()))
      continue
    }
    inBibliography = false
    const oneLine = chunk.replace(/\n+/g, ' ')
    if (oneLine.startsWith('## ')) blocks.push({ type: 'h', text: inline(oneLine.slice(3).trim()) })
    else if (oneLine.startsWith('> ')) blocks.push({ type: 'lead', text: inline(oneLine.slice(2).trim()) })
    else blocks.push({ type: 'p', text: inline(oneLine) })
  }

  return {
    slug,
    title: fm.title ?? slug,
    enTitle: fm.enTitle ?? '',
    date: fm.date ?? '',
    course: fm.course ?? '',
    tags: (fm.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    abstract: fm.abstract ?? '',
    blocks,
    notes,
    bibliography,
    cover: fm.cover || undefined,
    coverCredit: fm.coverCredit || undefined,
    pdf: fm.pdf || undefined,
  }
}
