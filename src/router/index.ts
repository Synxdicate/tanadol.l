import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/home.vue'
import About from '../components/about.vue'
import Project from '../components/project.vue'
import Article from '../components/article.vue'
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
    component: About
  },
  {
    path: '/project',
    component: Project
  },
  {
    path: '/article',
    component: Article
  },
  {
    path: '/resume',
    component: Resume
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router