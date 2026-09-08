import { getQuirkEffect } from '../data/quirkEffects';
import { isCrimsonCourtDisease } from '../data/diseases';

/**
 * What colour a quirk is drawn in, everywhere it is drawn.
 *
 * Six tones rather than the two the app used to have. The extra four are not
 * decoration: a hero sheet mixes quirks from four different sources, and the
 * colour is the only thing that says which one you are looking at without
 * reading the name. Diseases are green, the Crimson Curse red, and the two
 * Color of Madness sets keep the game's own identity - prismatic blue, corvid
 * purple.
 *
 * Every class string is written out in full. Tailwind scans source text for
 * class names, so a template-built one (`bg-${colour}-900/40`) is never
 * emitted into the stylesheet.
 */
export const QUIRK_TONES = {
  positive: {
    label: 'Positive',
    slot: 'bg-yellow-900/40 border-yellow-700/50 hover:border-yellow-600',
    chip: 'bg-yellow-900/50 border-yellow-700/50 text-yellow-300',
    card: 'border-yellow-800/50 bg-yellow-900/20 hover:border-yellow-600',
    text: 'text-yellow-300',
    heading: 'text-yellow-400'
  },
  negative: {
    label: 'Negative',
    slot: 'bg-red-900/40 border-red-700/50 hover:border-red-600',
    chip: 'bg-red-900/50 border-red-700/50 text-red-300',
    card: 'border-red-800/50 bg-red-900/20 hover:border-red-600',
    text: 'text-red-300',
    heading: 'text-red-400'
  },
  disease: {
    label: 'Disease',
    slot: 'bg-green-900/40 border-green-700/50 hover:border-green-600',
    chip: 'bg-green-900/50 border-green-700/50 text-green-300',
    card: 'border-green-800/50 bg-green-900/20 hover:border-green-600',
    text: 'text-green-300',
    heading: 'text-green-400'
  },
  // Red like a negative quirk, but a heavier one: the Crimson Curse is a
  // disease you plan a whole party around, not a bad roll on a recruit.
  crimson: {
    label: 'Crimson Court',
    slot: 'bg-red-800/50 border-red-500/70 hover:border-red-400',
    chip: 'bg-red-800/60 border-red-500/70 text-red-200',
    card: 'border-red-600/60 bg-red-800/25 hover:border-red-400',
    text: 'text-red-200',
    heading: 'text-red-300'
  },
  prismatic: {
    label: 'Prismatic',
    slot: 'bg-sky-900/40 border-sky-700/50 hover:border-sky-500',
    chip: 'bg-sky-900/50 border-sky-700/50 text-sky-300',
    card: 'border-sky-800/50 bg-sky-900/20 hover:border-sky-500',
    text: 'text-sky-300',
    heading: 'text-sky-400'
  },
  corvid: {
    label: 'Corvid',
    slot: 'bg-purple-900/40 border-purple-700/50 hover:border-purple-500',
    chip: 'bg-purple-900/50 border-purple-700/50 text-purple-300',
    card: 'border-purple-800/50 bg-purple-900/20 hover:border-purple-500',
    text: 'text-purple-300',
    heading: 'text-purple-400'
  }
};

/**
 * The tone for one quirk name. `fallback` is the tone of the list it came out
 * of, so a modded or misspelt name the taxonomy has never heard of still draws
 * as the positive or negative quirk it is sitting in rather than vanishing into
 * a default colour.
 */
export const quirkTone = (name, fallback = 'positive') => {
  // The roster is checked before the effect table: it is what the DLC toggle
  // reads, so the two can never disagree about what counts as Crimson Court.
  if (isCrimsonCourtDisease(name)) return 'crimson';

  const entry = getQuirkEffect(name);
  if (!entry) return fallback;
  if (entry.flavour && QUIRK_TONES[entry.flavour]) return entry.flavour;
  return QUIRK_TONES[entry.kind] ? entry.kind : fallback;
};

export const toneClasses = (tone) => QUIRK_TONES[tone] || QUIRK_TONES.positive;

/** Shorthand for the common case: name in, class bundle out. */
export const quirkClasses = (name, fallback) => toneClasses(quirkTone(name, fallback));
