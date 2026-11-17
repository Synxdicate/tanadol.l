<script setup lang="ts">
// A shell prompt that types and erases a rotating set of commands.
// With reduced motion it simply shows the first command.
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{ prompt?: string; lines: string[] }>(), {
  prompt: 'synxdicate@kku:~$',
})

const text = ref(props.lines[0] ?? '')
let timer = 0
let alive = true

const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)))

const cycle = async () => {
  let i = 0
  text.value = ''
  await wait(900) // let the hero intro settle first
  while (alive) {
    const line = props.lines[i % props.lines.length]
    for (let c = 1; c <= line.length && alive; c++) {
      text.value = line.slice(0, c)
      await wait(38 + Math.random() * 55) // uneven, like real typing
    }
    await wait(2200)
    for (let c = line.length; c >= 0 && alive; c--) {
      text.value = line.slice(0, c)
      await wait(16)
    }
    await wait(350)
    i++
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  cycle()
})

onUnmounted(() => {
  alive = false
  clearTimeout(timer)
})
</script>

<template>
  <p class="terminal font-mono" :aria-label="lines.join('; ')">
    <span class="prompt" aria-hidden="true">{{ prompt }}</span>
    <span class="cmd" aria-hidden="true">{{ text }}</span><span class="caret" aria-hidden="true"></span>
  </p>
</template>

<style scoped>
.terminal {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 100%;
  margin: 0;
  padding: 0.55rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--card);
  font-size: 0.8rem;
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
}

.prompt {
  color: var(--accent);
  font-weight: 600;
}

.cmd {
  overflow: hidden;
  text-overflow: clip;
}

.caret {
  width: 0.55em;
  height: 1.1em;
  margin-left: -0.45rem;
  background: var(--accent);
  animation: blink 1.05s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .terminal {
    font-size: 0.7rem;
  }
  .prompt {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
