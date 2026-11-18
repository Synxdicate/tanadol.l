<script setup lang="ts">
// ⌘K / Ctrl+K command palette: jump to any page, essay, project or book, or run an action
// (theme, music, cat, copy email, CV). Also opens with "/" when not typing in a field.
// Actions talk to the rest of the app through window CustomEvents ("site:*").
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { articles } from '../data/articles'
import { books } from '../data/books'
import { profile, projects } from '../data/profile'

interface Item {
  group: 'Pages' | 'Actions' | 'Essays' | 'Projects' | 'Books'
  label: string
  hint?: string
  icon: string
  keywords?: string
  run: () => void
}

const open = ref(false)
const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const toast = ref('')
const router = useRouter()
let lastFocus: HTMLElement | null = null

const go = (path: string) => router.push(path)
const emit = (name: string) => window.dispatchEvent(new CustomEvent(name))
const external = (url: string) => window.open(url, '_blank', 'noopener')
const say = (msg: string) => {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 1800)
}

const items = computed<Item[]>(() => [
  { group: 'Pages', label: 'Home', icon: 'pi-home', run: () => go('/') },
  { group: 'Pages', label: 'About', icon: 'pi-user', keywords: 'skills awards education certifications', run: () => go('/about') },
  { group: 'Pages', label: 'Projects', icon: 'pi-code', run: () => go('/project') },
  { group: 'Pages', label: 'Articles', icon: 'pi-pencil', keywords: 'essays writing บทความ', run: () => go('/article') },
  { group: 'Pages', label: 'Bookshelf', icon: 'pi-book', keywords: 'books reading หนังสือ', run: () => go('/books') },
  { group: 'Pages', label: 'Resume', icon: 'pi-file', keywords: 'cv', run: () => go('/resume') },

  { group: 'Actions', label: 'Toggle dark / light theme', icon: 'pi-moon', keywords: 'theme dark light mode', run: () => emit('site:toggle-theme') },
  { group: 'Actions', label: 'Play / pause the piano', icon: 'pi-play', keywords: 'music bach sound', run: () => emit('site:toggle-music') },
  { group: 'Actions', label: 'Next piece', icon: 'pi-step-forward', keywords: 'music skip song', run: () => emit('site:next-music') },
  { group: 'Actions', label: 'Call the cat / send it home', icon: 'pi-home', keywords: 'cat แมว', run: () => emit('site:toggle-cat') },
  {
    group: 'Actions',
    label: 'Copy email address',
    hint: profile.email,
    icon: 'pi-copy',
    keywords: 'contact mail',
    run: () => navigator.clipboard?.writeText(profile.email).then(() => say('Email copied')),
  },
  { group: 'Actions', label: 'Download CV (PDF)', icon: 'pi-download', keywords: 'resume', run: () => external(profile.resumePdf) },
  { group: 'Actions', label: 'Open GitHub', hint: 'Synxdicate', icon: 'pi-github', run: () => external(profile.links.github) },

  ...articles.map<Item>((a) => ({
    group: 'Essays',
    label: a.title,
    hint: a.enTitle,
    icon: 'pi-align-left',
    keywords: a.tags.join(' ') + ' ' + a.course,
    run: () => go(`/article/${a.slug}`),
  })),
  ...projects.map<Item>((p) => ({
    group: 'Projects',
    label: p.name,
    hint: p.kind,
    icon: 'pi-box',
    keywords: p.stack.join(' ') + ' ' + p.desc,
    run: () => external(p.demo || p.github || profile.links.github),
  })),
  ...books.map<Item>((b) => ({
    group: 'Books',
    label: b.title,
    hint: b.author,
    icon: 'pi-bookmark',
    keywords: b.category + ' ' + b.status,
    run: () => go(`/books?book=${encodeURIComponent(b.title)}`),
  })),
])

// rank: label starts with query > label contains > keywords/hint contain
const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  const pool = items.value
  if (!q) return pool.filter((i) => i.group === 'Pages' || i.group === 'Actions')
  return pool
    .map((i) => {
      const l = i.label.toLowerCase()
      const extra = `${i.hint ?? ''} ${i.keywords ?? ''}`.toLowerCase()
      const score = l.startsWith(q) ? 3 : l.includes(q) ? 2 : extra.includes(q) ? 1 : 0
      return { i, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((r) => r.i)
})

// group headings in display order
const grouped = computed(() => {
  const order: Item['group'][] = ['Pages', 'Actions', 'Essays', 'Projects', 'Books']
  let n = 0
  return order
    .map((g) => ({ g, rows: results.value.filter((r) => r.group === g).map((item) => ({ item, index: n++ })) }))
    .filter((x) => x.rows.length)
})

watch(query, () => (active.value = 0))

const show = () => {
  lastFocus = document.activeElement as HTMLElement | null
  open.value = true
  query.value = ''
  active.value = 0
  nextTick(() => input.value?.focus())
}
const hide = () => {
  open.value = false
  lastFocus?.focus?.()
}
const run = (item?: Item) => {
  if (!item) return
  hide()
  item.run()
}

const onKey = (e: KeyboardEvent) => {
  const typing = (e.target as HTMLElement)?.closest('input, textarea, [contenteditable="true"]')
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    open.value ? hide() : show()
  } else if (e.key === '/' && !typing && !open.value) {
    e.preventDefault()
    show()
  }
}

const onListKey = (e: KeyboardEvent) => {
  const max = results.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = (active.value + 1) % Math.max(1, max)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = (active.value - 1 + max) % Math.max(1, max)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    run(results.value[active.value])
  } else if (e.key === 'Escape') {
    e.preventDefault()
    hide()
  }
  nextTick(() => list.value?.querySelector('.active')?.scrollIntoView({ block: 'nearest' }))
}

const onOpenRequest = () => show()
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('site:open-palette', onOpenRequest)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('site:open-palette', onOpenRequest)
})

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
defineExpose({ isMac })
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="open" class="overlay" @mousedown.self="hide">
        <div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
          <div class="search">
            <i class="pi pi-search"></i>
            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Search pages, essays, projects, books… or type an action"
              aria-label="Search"
              aria-controls="palette-list"
              :aria-activedescendant="`cmd-${active}`"
              @keydown="onListKey"
            />
            <kbd class="font-mono">esc</kbd>
          </div>

          <div id="palette-list" ref="list" class="results" role="listbox">
            <template v-for="grp in grouped" :key="grp.g">
              <div class="group font-mono">{{ grp.g }}</div>
              <button
                v-for="row in grp.rows"
                :id="`cmd-${row.index}`"
                :key="row.item.group + row.item.label"
                role="option"
                :aria-selected="row.index === active"
                :class="['row', { active: row.index === active }]"
                @mousemove="active = row.index"
                @click="run(row.item)"
              >
                <i :class="['pi', row.item.icon]"></i>
                <span class="label">{{ row.item.label }}</span>
                <span v-if="row.item.hint" class="hint">{{ row.item.hint }}</span>
                <i v-if="row.index === active" class="pi pi-arrow-right enter"></i>
              </button>
            </template>
            <p v-if="!results.length" class="empty">Nothing matches “{{ query }}”.</p>
          </div>

          <div class="foot font-mono">
            <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd>K</kbd> toggle</span>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="toast">
      <div v-if="toast" class="toast font-mono" role="status">{{ toast }}</div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: max(10vh, 60px) 16px 16px;
  background: color-mix(in srgb, var(--ink) 25%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.palette {
  width: min(600px, 100%);
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 30px 80px var(--shadow), 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent);
  overflow: hidden;
}

.search {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
}

.search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font: inherit;
  font-size: 1rem;
  color: var(--ink);
}

.search input::placeholder {
  color: var(--muted);
}

kbd {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  border: 1px solid var(--line);
  border-bottom-width: 2px;
  color: var(--ink-3);
  background: var(--card);
}

.results {
  overflow-y: auto;
  padding: 0.4rem;
  overscroll-behavior: contain;
}

.group {
  padding: 0.7rem 0.6rem 0.3rem;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.7rem;
  border: none;
  border-radius: 8px;
  background: none;
  text-align: left;
  font: inherit;
  color: var(--ink-2);
}

.row .pi:first-child {
  width: 1rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.row.active {
  background: var(--accent-soft);
  color: var(--ink);
}

.row.active .pi:first-child,
.enter {
  color: var(--accent);
}

.label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hint {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 45%;
}

.enter {
  font-size: 0.7rem;
  margin-left: 0.4rem;
}

.empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}

.foot {
  display: flex;
  gap: 1.1rem;
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--line);
  font-size: 0.66rem;
  color: var(--muted);
}

.foot kbd {
  margin-right: 0.2rem;
}

.toast {
  position: fixed;
  z-index: 310;
  left: 50%;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font-size: 0.75rem;
  box-shadow: 0 10px 30px var(--shadow);
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.2s ease;
}
.palette-enter-active .palette,
.palette-leave-active .palette {
  transition: transform 0.25s var(--ease), opacity 0.2s ease;
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}
.palette-enter-from .palette,
.palette-leave-to .palette {
  transform: translateY(-8px) scale(0.98);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.25s var(--ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@media (max-width: 640px) {
  .foot {
    display: none;
  }
  .overlay {
    padding-top: 70px;
  }
}
</style>
