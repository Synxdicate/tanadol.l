import { nextTick } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home, meta: { title: 'Tanadol Langputeh — Offensive Security', description: 'Tanadol Langputeh (synxdicate): cybersecurity student at Khon Kaen University working on offensive security, CTF and red-team tooling.' } },
  { path: '/home', redirect: '/' },
  { path: '/about', name: 'About', component: () => import('../components/About.vue'), meta: { title: 'About', description: 'Skills, competition results, education, certifications and practice profiles of Tanadol Langputeh.' } },
  { path: '/project', name: 'Projects', component: () => import('../components/Project.vue'), meta: { title: 'Projects', description: 'Red-team tooling, an internal PKI platform, IoT builds and web apps, with architecture diagrams and source code.' } },
  { path: '/projects', redirect: '/project' },
  { path: '/article', name: 'Article', component: () => import('../components/Article.vue'), meta: { title: 'Articles', description: 'Essays in Thai on philosophy, mathematical logic and political theory.' } },
  { path: '/article/:slug', name: 'ArticleDetail', component: () => import('../components/ArticleDetail.vue'), meta: { title: 'Article' } },
  { path: '/books', name: 'Books', component: () => import('../components/Books.vue'), meta: { title: 'Bookshelf', description: 'What Tanadol is reading: literature, philosophy, economics and books on learning, shelved by category.' } },
  { path: '/resume', name: 'Resume', component: () => import('../components/Resume.vue'), meta: { title: 'Resume', description: 'CV of Tanadol Langputeh: education, technical skills, competitions, projects and certifications.' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../components/NotFound.vue'), meta: { title: 'Not found' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    // in-page jumps (footnotes) glide; a new page starts at the top instantly — the
    // global `scroll-behavior: smooth` would otherwise scroll the new page up visibly
    if (to.hash && to.path === from.path) return { el: to.hash, top: 110, behavior: 'smooth' }
    if (saved) return { ...saved, behavior: 'instant' }
    if (to.hash) return { el: to.hash, top: 110, behavior: 'instant' }
    return { top: 0, behavior: 'instant' }
  },
})

// one meta description per page (essays set their own from the abstract)
export const setDescription = (text: string) => {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = 'description'
    document.head.appendChild(tag)
  }
  tag.content = text
}

router.afterEach((to) => {
  if (to.meta.description) setDescription(to.meta.description as string)
  if (to.name === 'ArticleDetail') return // that page sets its own title
  const title = to.meta.title as string | undefined
  document.title = !title || to.name === 'Home' ? title ?? 'Tanadol Langputeh' : `${title} · Tanadol L.`
})

// After a new deploy, a tab that was opened earlier still asks for the old page chunks
// (their file names change every build) and the lazy import fails. Recover by loading
// the destination fresh — once, so a genuinely broken page can't cause a reload loop.
const RELOAD_KEY = 'chunk-reload'
const isChunkError = (err: unknown) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk/i.test(
    String((err as Error)?.message ?? err),
  )
const reloadOnce = (path: string) => {
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === path) return false
    sessionStorage.setItem(RELOAD_KEY, path)
  } catch {
    /* storage blocked: still try once */
  }
  window.location.assign(path)
  return true
}

router.onError((err, to) => {
  if (isChunkError(err)) reloadOnce(to.fullPath)
})

// Vite also reports failed preloads of chunk dependencies. It fires before the router
// commits the navigation, so remember where the visitor was going and reload there.
let pendingPath: string | null = null
router.beforeEach((to) => {
  pendingPath = to.fullPath
})
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadOnce(pendingPath ?? window.location.pathname + window.location.search)
})

// a successful navigation clears the guard, so the next deploy can recover again
router.afterEach(() => {
  try {
    sessionStorage.removeItem(RELOAD_KEY)
  } catch {
    /* ignore */
  }
})

// ---------- smooth page changes ----------
// Where the browser supports View Transitions, the old and new page cross-fade with a
// small lift; the header, turntable and cat are named layers, so they stay still.
// (Hash-only jumps such as footnotes don't animate.)
type VT = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void> }
type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void>) => VT }
const vtDoc = document as VTDocument
const canTransition = () =>
  !!vtDoc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
let finishTransition: (() => void) | null = null

router.beforeResolve((to, from) => {
  if (!canTransition() || !from.matched.length || to.path === from.path) return
  return new Promise<void>((resolve) => {
    document.documentElement.classList.add('vt-route')
    const t = vtDoc.startViewTransition!(
      () =>
        new Promise<void>((done) => {
          finishTransition = done
          resolve() // let the navigation continue; the snapshot of the new page waits for done()
        }),
    )
    // a quick second click skips the running transition: that's expected, not an error
    t.ready.catch(() => {})
    t.updateCallbackDone.catch(() => {})
    t.finished.finally(() => document.documentElement.classList.remove('vt-route'))
  })
})

router.afterEach(() => {
  if (!finishTransition) return
  const done = finishTransition
  finishTransition = null
  // wait for the new page to render and the router to apply the scroll position.
  // (Not requestAnimationFrame: rendering is paused during a view transition, so rAF
  // would wait for the transition while the transition waits for us.)
  nextTick(() => setTimeout(done, 0))
})

// ---------- prefetch every page when the browser is idle ----------
// Page code is split per route; fetching it ahead makes menu clicks instant.
router.isReady().then(() => {
  const idle =
    (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ??
    ((cb: () => void) => setTimeout(cb, 1500))
  idle(() => {
    for (const r of routes) {
      if (typeof r.component === 'function') (r.component as () => Promise<unknown>)().catch(() => {})
    }
  })
})

export default router
