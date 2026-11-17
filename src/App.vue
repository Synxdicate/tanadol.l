<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { profile } from './data/profile'
import CursorFx from './components/CursorFx.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import BackgroundFx from './components/BackgroundFx.vue'
import PixelCat from './components/PixelCat.vue'

const nav = [
  { to: '/about', label: 'About' },
  { to: '/project', label: 'Projects' },
  { to: '/article', label: 'Articles' },
  { to: '/books', label: 'Books' },
  { to: '/resume', label: 'Resume' },
]

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))
const year = new Date().getFullYear()

// header shadow once the page scrolls
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 8)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// theme: 'light' | 'dark', defaults to OS preference (set pre-paint in index.html)
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(
  document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : prefersDark(),
)
const applyTheme = () => {
  isDark.value = !isDark.value
  const t = isDark.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem('theme', t)
  } catch {
    /* storage blocked — theme still applies for this visit */
  }
}

// circular reveal from the toggle button where View Transitions are supported
const toggleTheme = (e: MouseEvent) => {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduce) return applyTheme()
  const x = e.clientX || window.innerWidth - 40
  const y = e.clientY || 30
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  doc.startViewTransition(applyTheme).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  })
}

// sliding highlight under the nav: sits on the active link, follows the hovered one
const menuEl = ref<HTMLElement | null>(null)
const indicator = ref({ x: 0, w: 0, visible: false })
const moveIndicator = (el: Element | null) => {
  if (!el || !menuEl.value) return (indicator.value = { ...indicator.value, visible: false })
  const a = el as HTMLElement
  indicator.value = { x: a.offsetLeft, w: a.offsetWidth, visible: true }
}
const toActive = () => moveIndicator(menuEl.value?.querySelector('.router-link-active') ?? null)
watch(
  () => route.path,
  () => nextTick(toActive),
)
onMounted(() => {
  nextTick(toActive)
  document.fonts?.ready.then(toActive)
  window.addEventListener('resize', toActive)
})
onUnmounted(() => window.removeEventListener('resize', toActive))
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip-link">Skip to content</a>
    <BackgroundFx />
    <CursorFx />
    <MusicPlayer />
    <PixelCat />
    <header :class="['header-glass', { scrolled }]">
      <nav class="nav-container" aria-label="Main">
        <router-link to="/" class="brand">{{ profile.shortName }}</router-link>

        <div class="nav-actions">
        <button class="icon-btn theme-toggle" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme">
          <i :class="['pi', isDark ? 'pi-sun' : 'pi-moon']"></i>
        </button>
        <button
          class="icon-btn menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="nav-menu"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <i :class="['pi', menuOpen ? 'pi-times' : 'pi-bars']"></i>
        </button>

        <div id="nav-menu" ref="menuEl" :class="['nav-menu', { open: menuOpen }]" @mouseleave="toActive">
          <span
            class="nav-indicator"
            :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px`, opacity: indicator.visible ? 1 : 0 }"
            aria-hidden="true"
          ></span>
          <router-link
            v-for="n in nav"
            :key="n.to"
            :to="n.to"
            class="nav-link"
            @mouseenter="(e: MouseEvent) => moveIndicator(e.currentTarget as Element)"
            @focus="(e: FocusEvent) => moveIndicator(e.currentTarget as Element)"
          >{{ n.label }}</router-link>
        </div>
        </div>
      </nav>
    </header>

    <main id="main" class="content-area" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="site-footer">
      <div class="footer-meta">
        <span class="font-mono">© {{ year }} {{ profile.name }}</span>
        <span class="credits font-mono">
          Music: MIDI from the
          <a href="https://www.mutopiaproject.org" target="_blank" rel="noopener noreferrer">Mutopia Project</a>
          (public domain / CC BY-SA), piano samples
          <a href="https://github.com/Tonejs/audio" target="_blank" rel="noopener noreferrer">Salamander Grand Piano</a>
          by Alexander Holm (CC BY 3.0)
        </span>
      </div>
      <div class="footer-links">
        <a :href="profile.links.github" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="pi pi-github"></i></a>
        <a :href="profile.links.linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="pi pi-linkedin"></i></a>
        <a :href="profile.links.htb" target="_blank" rel="noopener noreferrer" aria-label="Hack The Box profile"><i class="pi pi-flag"></i></a>
        <a :href="`mailto:${profile.email}`" aria-label="Email"><i class="pi pi-envelope"></i></a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-glass {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 100;
  background-color: var(--header-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.header-glass.scrolled {
  border-color: var(--line);
  box-shadow: 0 6px 24px var(--shadow);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  padding: calc(1.1rem + env(safe-area-inset-top, 0px)) max(1.5rem, env(safe-area-inset-right, 0px)) 1.1rem
    max(1.5rem, env(safe-area-inset-left, 0px));
}

.brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.3s var(--ease);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--accent);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-direction: row-reverse;
}

.icon-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--ink);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-grid;
  place-items: center;
  font-size: 0.95rem;
  transition: border-color 0.2s, color 0.2s;
}

.icon-btn:hover {
  border-color: var(--line);
  color: var(--accent);
}

.menu-toggle {
  display: none;
}

.skip-link {
  position: fixed;
  top: -100px;
  left: 1rem;
  z-index: 200;
  background: var(--ink);
  color: var(--bg);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.skip-link:focus {
  top: 1rem;
}

.nav-link {
  position: relative;
}

.nav-menu {
  position: relative;
}

/* one shared underline that glides between links */
.nav-indicator {
  position: absolute;
  left: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  pointer-events: none;
  transition: transform 0.45s var(--ease), width 0.45s var(--ease), opacity 0.3s;
}

/* View Transitions: the theme toggle animates a circular clip instead of a crossfade */
:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation: none;
  mix-blend-mode: normal;
}

.content-area:focus {
  outline: none;
}

.content-area {
  flex: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: calc(100px + env(safe-area-inset-top, 0px)) max(1.5rem, env(safe-area-inset-right, 0px)) 0
    max(1.5rem, env(safe-area-inset-left, 0px));
}

.site-footer {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 2.5rem;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  color: var(--muted);
}

.footer-links {
  display: flex;
  gap: 1.1rem;
}

.footer-links a:hover {
  color: var(--accent);
}

.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.credits {
  font-size: 0.62rem;
  opacity: 0.75;
  line-height: 1.6;
  max-width: 560px;
}

.credits a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.credits a:hover {
  color: var(--accent);
}

/* keep the footer icons clear of the floating vinyl button */
@media (max-width: 1100px) {
  .site-footer {
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .menu-toggle {
    display: inline-grid;
  }

  .nav-actions {
    gap: 0.25rem;
  }

  .nav-indicator {
    display: none;
  }

  .nav-link.router-link-active::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    display: none;
  }

  .nav-menu.open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--line);
  }
}
</style>
