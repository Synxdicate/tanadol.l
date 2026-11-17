// Pixel-art cursors (arrow + cat paw), built as crisp SVG data URIs at runtime so they can
// follow the theme. Real system cursors: no lag, unlike a JS-drawn follower.
// Only applied on devices with a fine pointer.

const ARROW = [
  'k',
  'kk',
  'kok',
  'kook',
  'koook',
  'kooook',
  'koooook',
  'kooooook',
  'koooooook',
  'kooooookkk',
  'kookook',
  'kok.kook',
  'kk..kook',
  'k....kook',
  '.....kook',
  '......kk',
]

const PAW = [
  '................',
  '.....kk..kk.....',
  '....kppkkppk....',
  '....kppkkppk....',
  '.kk..kk..kk..kk.',
  'kppk........kppk',
  'kppk.kkkkkk.kppk',
  '.kk.kooooook.kk.',
  '...kooooooook...',
  '..kooooooooook..',
  '..koooopoooook..',
  '..kooopppooook..',
  '...kooooooook...',
  '....kkkkkkkk....',
]

// 1.25× keeps the arrow about 20px tall, close to a normal system cursor
const SCALE = 1.25

const toSvg = (rows: string[], colors: Record<string, string>, scale = SCALE) => {
  const w = Math.max(...rows.map((r) => r.length))
  const h = rows.length
  let rects = ''
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (colors[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`
    }),
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const apply = () => {
  const root = document.documentElement
  const cs = getComputedStyle(root)
  const ink = cs.getPropertyValue('--ink').trim() || '#252422'
  const bg = cs.getPropertyValue('--bg').trim() || '#fffcf2'
  const accent = cs.getPropertyValue('--accent').trim() || '#eb5e28'
  // outline in ink, fill in page colour: reads on both themes because the fill is the bg
  root.style.setProperty('--cursor-default', `${toSvg(ARROW, { k: ink, o: bg })} 0 0, auto`)
  root.style.setProperty('--cursor-pointer', `${toSvg(PAW, { k: ink, o: bg, p: accent })} 10 3, pointer`)
}

export const installPixelCursor = () => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  apply()
  document.documentElement.classList.add('pixel-cursor')
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
}
