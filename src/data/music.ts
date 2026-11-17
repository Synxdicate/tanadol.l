// Pieces for the turntable. MIDI files live in public/music/midi/ (from the Mutopia Project);
// they are performed live on the sampled piano in src/audio/piano.ts.

export interface Piece {
  title: string
  composer: string
  midi: string
  license: string
  source: string
}

const MUTOPIA = 'https://www.mutopiaproject.org'

export const pieces: Piece[] = [
  {
    title: 'Prelude in C major, BWV 846',
    composer: 'J.S. Bach',
    midi: '/music/midi/bach-prelude-c.mid',
    license: 'Public Domain',
    source: MUTOPIA,
  },
  {
    title: 'Goldberg Variations: Aria, BWV 988',
    composer: 'J.S. Bach',
    midi: '/music/midi/bach-goldberg-aria.mid',
    license: 'CC BY-SA 3.0 (Mutopia Project)',
    source: MUTOPIA,
  },
  {
    title: 'Clair de Lune',
    composer: 'C. Debussy',
    midi: '/music/midi/debussy-clair-de-lune.mid',
    license: 'Public Domain',
    source: MUTOPIA,
  },
  {
    title: 'Nocturne Op. 9 No. 2',
    composer: 'F. Chopin',
    midi: '/music/midi/chopin-nocturne-op9-2.mid',
    license: 'CC BY-SA 3.0 (Mutopia Project)',
    source: MUTOPIA,
  },
  {
    title: 'Für Elise, WoO 59',
    composer: 'L. van Beethoven',
    midi: '/music/midi/beethoven-fur-elise.mid',
    license: 'Public Domain',
    source: MUTOPIA,
  },
  {
    title: 'Première Arabesque',
    composer: 'C. Debussy',
    midi: '/music/midi/debussy-arabesque-1.mid',
    license: 'Public Domain',
    source: MUTOPIA,
  },
]
