import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home, meta: { title: 'Tanadol Langputeh — Offensive Security' } },
  { path: '/home', redirect: '/' },
  { path: '/about', name: 'About', component: () => import('../components/About.vue'), meta: { title: 'About' } },
  { path: '/project', name: 'Projects', component: () => import('../components/Project.vue'), meta: { title: 'Projects' } },
  { path: '/projects', redirect: '/project' },
  { path: '/article', name: 'Article', component: () => import('../components/Article.vue'), meta: { title: 'Articles' } },
  { path: '/article/:slug', name: 'ArticleDetail', component: () => import('../components/ArticleDetail.vue'), meta: { title: 'Article' } },
  { path: '/books', name: 'Books', component: () => import('../components/Books.vue'), meta: { title: 'Bookshelf' } },
  { path: '/resume', name: 'Resume', component: () => import('../components/Resume.vue'), meta: { title: 'Resume' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../components/NotFound.vue'), meta: { title: 'Not found' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 110, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
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

export default router
