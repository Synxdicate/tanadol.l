// Essays are Markdown files in src/content/articles/ — one file per essay, the file name
// is the URL (src/content/articles/my-essay.md → /article/my-essay). Drop a new file in
// that folder and it appears on the site; see parseArticle.ts for the supported syntax.
import { parseArticle, type Article } from './parseArticle'

export type { Article, ArticleBlock } from './parseArticle'

const files = import.meta.glob('../content/articles/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

export const articles: Article[] = Object.entries(files)
  .map(([path, source]) => parseArticle(path.split('/').pop()!.replace(/\.md$/, ''), source))
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'th'))

export const findArticle = (slug: string) => articles.find((a) => a.slug === slug)
