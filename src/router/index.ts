import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import About from '../components/about.vue'
import Project from '../components/Project.vue'
import Article from '../components/Article.vue'
import Resume from '../components/resume.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/project',
    name: 'Projects',
    component: Project
  },
  {
    path: '/article',
    name: 'Article',
    component: Article
  },
  {
    path: '/resume',
    name: 'Resume',
    component: Resume
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router