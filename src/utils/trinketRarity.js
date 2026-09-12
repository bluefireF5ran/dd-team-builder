import { getTrinketEffect } from '../data/trinketEffects';
import { getModdedTrinketEffect } from '../data/moddedEffects';

/**
 * What colour a trinket's border is drawn in, everywhere it is drawn.
 *
 * A trinket's tier is the first thing a player reads in the game and the app
 * was throwing it away: every trinket had the same amber border in the party
 * card and the same grey one in the picker, so a Very Common and an Ancestral
 * looked identical until you read the tooltip.
 *
 * The palette follows the game where the game has an answer, which is the
 * six drop tiers plus the sets and event drops players already recognise.
 * It is **not** colour-only information: every one of these also opens a
 * `HoverCard`, which already names the rarity in words, and the picker offers
 * the same tiers as labelled filter chips. The border is a second channel.
 *
 * Hex rather than Tailwind classes because these are inline `borderColor`
 * values - 24 tiers x border/tint/text would be 70-odd literal class strings,
 * and Tailwind only emits classes it can find as text in the source.
 */
export const RARITY_TONES = {
  // ---- the six drop tiers, which have to be unmistakable from each other
  'Very Common': { label: 'Very Common', colour: '#8A8F98' },
  Common: { label: 'Common', colour: '#F1F1F1' },
  Uncommon: { label: 'Uncommon', colour: '#3FA45B' },
  Rare: { label: 'Rare', colour: '#2F6FED' },
  'Very Rare': { label: 'Very Rare', colour: '#F0A020' },
  Ancestral: { label: 'Ancestral', colour: '#E0552B' },

  // ---- DLC sets, each in its own DLC's identity
  'CC Set': { label: 'Crimson Court', colour: '#D01B3C' },
  Courtier: { label: 'Courtier', colour: '#E8455C' },
  'SB Set': { label: 'Shieldbreaker', colour: '#B08D2E' },
  Set: { label: "Fire's Edge", colour: '#F26B5B' },
  "Fire's Edge": { label: "Fire's Edge", colour: '#F26B5B' },
  Crystalline: { label: 'Crystalline', colour: '#2AD4E8' },
  Thing: { label: 'Thing', colour: '#0E8F84' },

  // ---- Butcher's Circus. `Ringmaster` is the same shop, one shade brighter,
  // because it is the only one of the ~104 that is not a plain arena drop.
  "Butcher's Circus": { label: "Butcher's Circus", colour: '#B4470A' },
  Ringmaster: { label: 'Ringmaster', colour: '#E2680F' },

  // ---- the rest, each a hue nothing above is using so they cannot be
  // mistaken for a tier. The game gives no colour for these.
  Trophy: { label: 'Trophy', colour: '#E9C213' },
  'Darkest Dungeon': { label: 'Darkest Dungeon', colour: '#FF2D2D' },
  Kickstarter: { label: 'Kickstarter', colour: '#CBE06A' },
  Shambler: { label: 'Shambler', colour: '#8B5CF6' },
  Crow: { label: 'Crow', colour: '#D96FE0' },
  Madman: { label: 'Madman', colour: '#9A6B3F' },
  Collector: { label: 'Collector', colour: '#5B7FA6' },
  Keepsake: { label: 'Keepsake', colour: '#F0A8C0' },
};

// The neutral the app used before, for a trinket with no tier at all. The
// Sunstone chain is the real case: it transforms rather than dropping at a
// tier, so `rarity` is null and inventing a colour for it would be a lie.
export const NO_RARITY = { label: null, colour: '#B45309' };

/** `#RRGGBB` plus an alpha, for a tint of the same colour. */
export const withAlpha = (hex, alpha) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  if (!m) return `rgba(180, 83, 9, ${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** The rarity string for a trinket, modded ones included, or null. */
export const trinketRarity = (name) => {
  const found = getTrinketEffect(name) || getModdedTrinketEffect(name);
  return found?.rarity || null;
};

/** The tone for a rarity string. Unknown tiers fall back rather than vanish. */
export const rarityTone = (rarity) => RARITY_TONES[rarity] || NO_RARITY;

/** The tone for a trinket name. */
export const trinketTone = (name) => rarityTone(trinketRarity(name));

/**
 * Inline style for a trinket's border.
 *
 * `tint` adds a wash of the same colour behind it, which is what makes the
 * border read as a rarity rather than as an outline the theme happened to
 * pick. Off by default: the party card draws trinkets over their own art.
 */
export const rarityBorderStyle = (name, { tint = 0 } = {}) => {
  const { colour } = trinketTone(name);
  return tint
    ? { borderColor: colour, backgroundColor: withAlpha(colour, tint) }
    : { borderColor: colour };
};
