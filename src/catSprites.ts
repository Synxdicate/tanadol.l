// Hand-placed pixel sprites for the site cat (original artwork, cozy farm-game style:
// big head, chunky body, shiny eyes, three-tone fur). Facing right / front.
// Fill colours only; a dark outline is added automatically around every shape.
//   F fur · S fur shade · H fur highlight · D stripes · L cream · E eye · W eye shine
//   N nose · P inner ear · O dark line (mouth, closed eyes) · . empty

export const CAT_W = 24
export const CAT_H = 22

const SIT = [
  '.....F..........F',
  '....FPF........FPF',
  '....FPPF......FPPF',
  '....FFFFFFFFFFFFFF',
  '...FHFFFFDFFDFFFFFF',
  '...FHFFFFFDDFFFFFFF',
  '...FFEEFFFFFFFFEEFF',
  '...FFEWFFFFFFFFEWFF',
  'OO.FFEEFFLNNLFFEEFF.OO',
  'OO.SFFFFLLOOLLFFFFS.OO',
  '....SFFFFLLLLFFFFS',
  '.....SSFFFFFFFFSS',
  '.....FFFFLLLLFFFF',
  '....FFDFFLLLLFFDFF',
  '....FFDFFLLLLFFDFF.FF',
  '....FFFFFLLLLFFFFF.FFF',
  '....SFFFFLLLLFFFFS..FF',
  '....SFFLLFFFFLLFFS..FF',
  '.....SSLLSSSSLLSSFFFF',
]

const WALK0 = [
  '...............F...F',
  '..............FPF.FPF',
  '..............FFFFFFFF',
  '.F...........FFFFFEWFF',
  '.F...........FFFFFEEFFN',
  '.FF..FFFFFFFFFFFFFFFLL',
  '..FFFFDFFDFFDFFFFFFF',
  '....FFFFFFFFFFFFFFF',
  '....SFFLLLLLLLLLFFS',
  '....FF..FF....FF..FF',
  '....FF...FF..FF...FF',
]

const WALK1 = [
  '...............F...F',
  '..............FPF.FPF',
  '..............FFFFFFFF',
  'F............FFFFFEWFF',
  '.F...........FFFFFEEFFN',
  '.FF..FFFFFFFFFFFFFFFLL',
  '..FFFFDFFDFFDFFFFFFF',
  '....FFFFFFFFFFFFFFF',
  '....SFFLLLLLLLLLFFS',
  '.....FF.FF....FF.FF',
  '.....FF.FF....FF.FF',
]

const SLEEP = [
  '..............F...F',
  '.............FPF.FPF',
  '......FFFFFFFFFFFFFFF',
  '.....FFDFFDFFFFFFFFFFF',
  '....FHFFFFFFFOOFFFOOFF',
  '....FFFFFFFFFFFFLNNLFF',
  '...FFFFFFFFFFFFFFLLLLFF',
  '...SSFFFFFFFFFFFFFFFFSS',
  '....LLFFFFFFFFFFFFFLL',
]

type Grid = string[][]

/** Pad rows, bottom-align the art (every pose stands on the same ground line), add outline. */
export const make = (rows: string[], W = CAT_W, H = CAT_H): Grid => {
  const art = rows.map((r) => r.padEnd(W, '.').slice(0, W).split(''))
  while (art.length && art[art.length - 1].every((c) => c === '.')) art.pop()
  const top = H - 2 - art.length // one row for the bottom outline, one spare
  const g: Grid = Array.from({ length: H }, (_, y) =>
    y >= top && y < top + art.length ? [...art[y - top]] : Array(W).fill('.'),
  )
  const out = g.map((r) => [...r])
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g[y][x] !== '.') continue
      const n = [g[y - 1]?.[x], g[y + 1]?.[x], g[y][x - 1], g[y][x + 1]]
      if (n.some((c) => c && c !== '.' && c !== 'O')) out[y][x] = 'O' // hand-placed dark lines (whiskers) stay thin
    }
  return out
}

const variant = (rows: string[], edit: (g: string[][]) => void) => {
  const g = rows.map((r) => r.padEnd(CAT_W, '.').split(''))
  edit(g)
  return g.map((r) => r.join(''))
}

export type CatPose = 'sit' | 'blink' | 'groom' | 'walk0' | 'walk1' | 'sleep'

export const CAT_SPRITES: Record<CatPose, Grid> = {
  sit: make(SIT),
  // happy closed eyes ^ ^
  blink: make(
    variant(SIT, (g) => {
      for (const x of [5, 6, 15, 16]) g[6][x] = 'F'
      for (const x of [5, 6, 15, 16]) g[7][x] = 'O'
      for (const x of [5, 6, 15, 16]) g[8][x] = 'F'
    }),
  ),
  // paw raised to the mouth, eyes shut
  groom: make(
    variant(SIT, (g) => {
      for (const x of [5, 6, 15, 16]) g[6][x] = 'F'
      for (const x of [5, 6, 15, 16]) g[7][x] = 'O'
      for (const x of [5, 6, 15, 16]) g[8][x] = 'F'
      g[9][13] = 'L'
      g[9][14] = 'L'
      g[10][13] = 'L'
      g[10][14] = 'L'
      g[11][14] = 'L'
    }),
  ),
  walk0: make(WALK0),
  walk1: make(WALK1),
  sleep: make(SLEEP),
}

// black cat with golden eyes (E = iris, W = slit pupil)
export const CAT_PALETTE: Record<string, string> = {
  O: '#0d0a12',
  F: '#3a3040',
  S: '#262030',
  H: '#4b4052',
  D: '#2b2433',
  L: '#4a3f52',
  E: '#f2b705',
  W: '#120d16',
  N: '#7d5566',
  P: '#5b4a60',
}

// the cat's house (toggle button): roof, wall, round doorway
export const HOUSE_W = 18
export const HOUSE_H = 16
export const HOUSE = make(
  [
    '........R',
    '.......RRR',
    '......RRRRR',
    '.....RRRRRRR',
    '....RRRRRRRRR',
    '...RRRRRRRRRRR',
    '..RRRRRRRRRRRRR',
    '...WWWWWWWWWWW',
    '...WWWWDDDWWWW',
    '...WWWDDDDDWWW',
    '...WWWDDDDDWWW',
    '...WWWDDDDDWWW',
    '...WWWDDDDDWWW',
  ],
  HOUSE_W,
  HOUSE_H,
)

export const HOUSE_PALETTE: Record<string, string> = {
  O: '#3b2a21',
  R: '#d9572a',
  W: '#efd3a1',
  D: '#3b2a21',
}
