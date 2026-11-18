<script setup lang="ts">
// Animates the leading number of a value like "8+" or "2nd" when it scrolls into view.
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{ value: string; duration?: number }>(), { duration: 1600 })

// ordinals ("2nd") are shown as-is: counting up would flash "0nd", "1nd"
const parts = computed(() => {
  const m = props.value.match(/^(\d+)(.*)$/)
  if (!m || /^(st|nd|rd|th)$/i.test(m[2])) return null
  return { n: Number(m[1]), suffix: m[2] }
})

const el = ref<HTMLElement | null>(null)
const shown = ref(parts.value ? '0' : props.value)
let raf = 0
let io: IntersectionObserver | null = null

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

const run = () => {
  const p = parts.value
  if (!p) return
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / props.duration)
    shown.value = String(Math.round(easeOutExpo(t) * p.n))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!parts.value || reduce || !('IntersectionObserver' in window)) {
    shown.value = parts.value ? String(parts.value.n) : props.value
    return
  }
  io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        run()
        io?.disconnect()
      }
    },
    { threshold: 0.6 },
  )
  if (el.value) io.observe(el.value)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  io?.disconnect()
})
</script>

<template>
  <span ref="el" class="count-up">
    <span class="sr-only">{{ value }}</span>
    <span aria-hidden="true">{{ shown }}{{ parts?.suffix }}</span>
  </span>
</template>

<style scoped>
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
