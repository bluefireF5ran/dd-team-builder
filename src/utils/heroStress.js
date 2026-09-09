/**
 * Stress, and how it steers a suggestion.
 *
 * A comp is advice about *your* heroes, and a hero at 90 stress is one bad
 * afflicted turn from ruining the run — you would not take them, so the
 * suggester should not keep offering them. But stress is a soft fact, not a
 * hard one: a maxed-out roster still has to be given a party, and "everyone is
 * tired, here is nothing" is not an answer. So stress does not exclude anyone,
 * it only makes them **less likely to be drawn**.
 *
 * Two numbers do the whole job:
 *
 *   - `stressWeight` turns one hero's stress into a 0..1 weight, squared so
 *     that routine wear barely registers and a near-affliction hurts a lot.
 *   - `compStressWeight` multiplies those across the heroes a comp would
 *     actually field, so one exhausted hero is enough to push a comp down the
 *     list even when the other three are fresh.
 *
 * Multiplying, not averaging: an average lets three rested heroes hide the one
 * who is about to break, which is exactly the comp a player does not want.
 *
 * Stress only exists once a save is imported. With no save the weights are all
 * 1 and every draw is uniform, which is what the suggester did before.
 */

import { nameKey } from './nameNormalizer';
import { heroClassOf, isHeroAvailable } from './rosterAvailability';

export const STRESS_CONFIG = {
  // The game's resolve check fires at 100 — virtue or affliction — and a hero
  // sitting at 100 afflicted is as bad as this app needs to care about.
  MAX: 100,
  // Where a stress bar stops being background noise. Everyone comes back from
  // a dungeon with something on the meter; half a bar is where a player starts
  // thinking about the Abbey instead of another run.
  STRAINED: 50,
  // A floor, not a zero: with zero weight a roster of exhausted heroes would
  // suggest nothing at all, and the honest answer there is "this one, but mind
  // the stress" rather than silence.
  MIN_WEIGHT: 0.005
};

/** Stress as a usable number: absent, negative and over-max all fold to range. */
export const clampStress = (stress) => {
  const value = Number(stress);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, STRESS_CONFIG.MAX);
};

/** Half a bar is where a hero stops being routine and starts being a risk. */
export const isStrained = (hero) => clampStress(hero?.stress) >= STRESS_CONFIG.STRAINED;

/**
 * One hero's stress as a draw weight: 1 when rested, `MIN_WEIGHT` when spent.
 *
 * The curve has a **knee at `STRAINED`**, because a player does not read stress
 * on one scale. Below half a bar it is bookkeeping and the weight barely moves
 * (0 → 1, 25 → 0.94, 49 → 0.76). Above it, every point is a reason not to go,
 * so the weight decays geometrically the rest of the way: 60 → 0.30, 70 → 0.12,
 * 80 → 0.05, 90 → 0.02, 100 → the floor.
 *
 * A single curve did not do this. A squared falloff over the whole range left a
 * hero at 70 on half weight, which is nowhere near enough discouragement when
 * three of the four slots are uncontested — those comps kept coming up.
 */
export const stressWeight = (stress) => {
  const value = clampStress(stress);
  const { MAX, STRAINED, MIN_WEIGHT } = STRESS_CONFIG;

  // Gentle quarter-parabola up to the knee: 1 down to 0.75 across half the bar.
  if (value < STRAINED) return 1 - 0.25 * (value / STRAINED) ** 2;

  // And a geometric fall from that 0.75 to the floor across the rest of it.
  const past = (value - STRAINED) / (MAX - STRAINED);
  return Math.max(MIN_WEIGHT, 0.75 * (MIN_WEIGHT / 0.75) ** past);
};

/**
 * Which of your heroes should take a slot, when you own more than one of the
 * class. Ready before busy, then the calm before the strained, then the more
 * experienced, then the calmer one.
 *
 * The stress band sits *above* resolve XP on purpose: a Resolve 5 veteran at 95
 * stress is a worse pick than a Resolve 0 recruit at 0, and sorting on XP first
 * kept handing over the veteran. Below the band, experience still decides —
 * 10 stress and 30 stress are the same hero for this purpose.
 */
export const bySuitability = (a, b) =>
  (isHeroAvailable(a) ? 0 : 1) - (isHeroAvailable(b) ? 0 : 1) ||
  (isStrained(a) ? 1 : 0) - (isStrained(b) ? 1 : 0) ||
  (b?.resolveXp || 0) - (a?.resolveXp || 0) ||
  clampStress(a?.stress) - clampStress(b?.stress);

/**
 * The stress behind each class, in the order the slots would be filled.
 *
 * Keyed by class, holding a list because a comp that fields two Highwaymen
 * fields *your two* — the calm one and the wreck — and the second slot has to
 * be judged on the second hero. Sorted by `bySuitability` so this list is the
 * same queue `assignSaveHeroes` pulls from; weighing a comp against heroes it
 * would not actually field would be weighing the wrong thing.
 */
export const stressPool = (saveHeroes) => {
  const pool = new Map();
  [...(saveHeroes || [])].sort(bySuitability).forEach((hero) => {
    const key = nameKey(heroClassOf(hero));
    if (!key) return;
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(clampStress(hero?.stress));
  });
  return pool;
};

/**
 * Pairs each named slot with the hero who would fill it, and their weight.
 *
 * A class you own nobody of weighs 1: the comp's own hero fills that slot, and
 * a hero you do not have cannot be stressed. `stress` stays `null` there, which
 * is how callers tell "rested" from "unknown".
 */
export const stressWeightsFor = (heroClasses, pool) => {
  const used = new Map();
  return (heroClasses || []).map((heroClass) => {
    const key = nameKey(heroClass);
    const nth = used.get(key) || 0;
    used.set(key, nth + 1);
    const stress = pool?.get(key)?.[nth];
    return {
      heroClass,
      stress: stress === undefined ? null : stress,
      weight: stress === undefined ? 1 : stressWeight(stress)
    };
  });
};

/**
 * The worst stress among the heroes this comp would field.
 *
 * A comp is only as rested as its most frayed member, which is what makes this
 * the right thing to sort tiers on: three fresh heroes do not make the fourth
 * one at 78 any safer to take.
 */
export const compPeakStress = (comp, pool) =>
  stressWeightsFor((comp?.heroes || []).map(heroClassOf), pool).reduce(
    (worst, entry) => Math.max(worst, entry.stress || 0),
    0
  );

/**
 * The comps that ask nothing of a strained hero — or all of them, if there is
 * no such comp.
 *
 * This is the part a weight cannot do. However small you make it, a weight only
 * makes the tired comp *rarer*, and rare still means "sometimes, for no reason
 * the player can see". If a comp exists that your rested heroes can field, that
 * is simply the better advice, so the strained ones are not in the draw at all
 * and the weighting is left to order what remains. The fallback matters just as
 * much: a roster where everyone is at 60 has no clean comp, and it still has to
 * be given an answer.
 */
export const restedCandidates = (comps, pool) => {
  if (!pool?.size) return comps || [];
  const clean = (comps || []).filter(
    (comp) => compPeakStress(comp, pool) < STRESS_CONFIG.STRAINED
  );
  return clean.length ? clean : comps || [];
};

/** How willing we are to offer this comp, given who would be in it. */
export const compStressWeight = (comp, pool) => {
  if (!pool?.size) return 1;
  const weights = stressWeightsFor((comp?.heroes || []).map(heroClassOf), pool);
  const product = weights.reduce((total, entry) => total * entry.weight, 1);
  return Math.max(product, STRESS_CONFIG.MIN_WEIGHT);
};

/**
 * `count` items drawn without replacement, each in proportion to its weight.
 *
 * Efraimidis–Spirakis: give every item the key `u^(1/w)` for a fresh uniform
 * `u` and take the largest keys. One pass, no rejection loop, and the first
 * item out is drawn exactly in proportion to its weight — which is why
 * `weightedPick` is just this with `count` of 1.
 */
export const weightedSample = (items, count, weightOf) =>
  (items || [])
    .map((item) => ({
      item,
      key: Math.random() ** (1 / Math.max(weightOf(item) || 0, STRESS_CONFIG.MIN_WEIGHT))
    }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((entry) => entry.item);

export const weightedPick = (items, weightOf) => weightedSample(items, 1, weightOf)[0];
