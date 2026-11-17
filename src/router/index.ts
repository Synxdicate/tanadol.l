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

export default router
