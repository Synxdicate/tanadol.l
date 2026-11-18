import type { Directive } from 'vue'

// v-fade-img: the image fades in when it has loaded instead of painting in strips.
// Errors also count as "done" so fallbacks underneath (cloth covers) stay visible logic-wise.
const done = (el: HTMLImageElement) => el.classList.add('loaded')

export const fadeImg: Directive<HTMLImageElement> = {
  mounted(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('fade-img')
    if (el.complete && el.naturalWidth) return done(el)
    el.addEventListener('load', () => done(el), { once: true })
    el.addEventListener('error', () => done(el), { once: true })
  },
  updated(el) {
    // src changed (e.g. the reading desk shows another book): fade the new one in too
    if (!el.classList.contains('fade-img') || (el.complete && el.naturalWidth)) return
    el.classList.remove('loaded')
    el.addEventListener('load', () => done(el), { once: true })
  },
}
