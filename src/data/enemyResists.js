/**
 * What a blight, a stun or a debuff has to beat, and therefore what one more
 * point of chance is worth.
 *
 * **The rule is Fran's** (2026-09-14): an effect lands on `chance - resist`,
 * rolled only *after* the attack has already hit, and a DoT is all or nothing -
 * the full amount or none of it, with a crit making the amount bigger. So a
 * 140% blight against an 80% resist applies 60% of the time, on the hits.
 *
 * Two things follow, and both are arithmetic rather than judgement:
 *
 * - a point of chance changes nothing against an enemy already at `chance -
 *   resist >= 100`, so what a point is worth is exactly the share of the
 *   enemies you meet that are still below that line;
 * - and since the roll comes after the hit, everything here scales by how often
 *   the hero hits at all.
 *
 * ## Where the numbers come from
 *
 * Measured from the champion mash tables (`<zone>.5.mash.darkest`, and the
 * Darkest Dungeon's `.6`), which list the groups a region can throw at a
 * maximum-level party, against each monster's own `stats:` line
 * (`.poison_resist`, `.debuff_resist`, `.stun_resist`, `.bleed_resist`,
 * `.move_resist`). 119 champion enemies, each weighted by how often a mash row
 * lists it, the four main regions counting fully and everywhere else a fifth -
 * the same weighting the dodge-tank bar was measured with.
 *
 * Kept as ten buckets rather than 119 rows: the deciles answer the same
 * question to within a point or two (65.0% vs 65.0% landing at 140% blight,
 * 88.8% vs 89.0% at 175%) and are small enough to read.
 *
 * Rerun with `node scripts/measureEnemyResists.js --game "<install>"`.
 */

/** Champion resist by decile, lowest first. */
export const CHAMPION_RESIST_DECILES = {
  blight: [50, 50, 50, 60, 60, 70, 80, 90, 100, 140],
  debuff: [50, 50, 55, 55, 55, 60, 62.5, 75, 80, 100],
  stun: [50, 50, 50, 65, 65, 65, 80, 90, 90, 190],
  bleed: [50, 60, 60, 60, 60, 67.5, 80, 100, 240, 240],
  move: [40, 50, 50, 50, 65, 65, 65, 73, 90, 115],
};

/** An effect applies on `chance - resist`, and never more than always. */
const applyRate = (chance, resist) => Math.max(0, Math.min(1, (chance - resist) / 100));

/**
 * How often an effect at this chance lands, averaged over the enemies a
 * champion party meets. Before the hit roll: multiply by that separately.
 */
export const effectLandRate = (kind, chance) => {
  const resists = CHAMPION_RESIST_DECILES[kind];
  if (!resists || !Number.isFinite(chance)) return null;
  return resists.reduce((total, resist) => total + applyRate(chance, resist), 0) / resists.length;
};

/**
 * What one more point of chance buys at this chance: the share of enemies the
 * hero is not already guaranteed against. 1 at 140% (a maxed skill's own
 * chance, where almost every point still counts) and falling away above it -
 * 0.7 for blight once the Athenaeum has given its 15%, 0.4 by the time a
 * Blasphemous Vial is on top, which is the dossier's "more than enough".
 */
export const effectPointWorth = (kind, chance) => {
  const resists = CHAMPION_RESIST_DECILES[kind];
  if (!resists || !Number.isFinite(chance)) return 1;
  return resists.filter((resist) => resist > chance - 100).length / resists.length;
};
