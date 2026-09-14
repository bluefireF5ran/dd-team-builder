/**
 * What a champion party is hit by, and therefore what a point of DODGE, PROT or
 * MAX HP is actually worth to a given hero.
 *
 * **This replaces a hand-written list of which classes are dodge tanks**
 * (Fran, 2026-09-14): "i dont want to hand pick what is a dodge or not, this
 * should be modeled around what can the hero and all the tools available to him
 * reach... if dodge investment wont be worth, dont invest on it, same for prot
 * or +hp... we need to generalize if we want it to work as well on modded
 * heroes". A list cannot say that the Shieldbreaker's dodge is worth buying in
 * a party with an Antiquarian and not worth it alone; a curve can.
 *
 * ## Why dodge compounds
 *
 * A hit lands at `ACC + 5 - DODGE`, so one point of DODGE takes one point off
 * the hit chance - but what matters is the SHARE of the incoming damage that
 * removes, which is `1 / hit%`. At DODGE 40 a hero is hit 61% of the time and a
 * point removes 1.6% of the damage; at 80 he is hit 23% and a point removes
 * 4.4%. That is why stacking dodge works on the heroes it works on, and it
 * falls out of the arithmetic rather than out of a category.
 *
 * PROT is the same idea with a different denominator: it scales the damage that
 * does land, so a point removes `1 / (100 - PROT)` of it. MAX HP is linear -
 * a percent more pool is a percent longer alive, and nothing bends.
 *
 * ## Where the numbers come from
 *
 * `scripts/measureEnemyThreat.js`, over the champion mash tables
 * (`<zone>.5.mash.darkest`, and the Darkest Dungeon's `.6`): 259 damaging
 * skills across 121 enemies, each enemy's appearances spread over its own kit,
 * the four main regions counting fully and everywhere else a fifth. Ten buckets
 * answer within a point of the full population (61.0% vs 62.0% hit rate at
 * DODGE 40, 22.7% vs 23.3% at 80).
 */

/** Champion attack accuracy by decile, lowest first. */
export const CHAMPION_ATTACK_ACC = [62.5, 82.5, 92.5, 97.5, 97.5, 102.5, 102.5, 102.5, 107.5, 112.5];

/** Mean damage of one champion attack, before PROT. */
export const CHAMPION_ATTACK_DAMAGE = 6.2;

/** A displayed 95% always hits (`cutoffAlwaysHit`), and 5% is the floor. */
const hitAt = (acc, dodge) => {
  const shown = acc + 5 - dodge;
  return shown >= 95 ? 1 : Math.max(0.05, Math.min(1, shown / 100));
};

/** How often a champion attack lands on a hero sitting at this DODGE. */
export const hitRateAt = (dodge) => {
  const value = Number.isFinite(dodge) ? dodge : 0;
  return CHAMPION_ATTACK_ACC.reduce((total, acc) => total + hitAt(acc, value), 0) / CHAMPION_ATTACK_ACC.length;
};

/**
 * The share of incoming damage one more point of DODGE removes, at this DODGE.
 * Rises as the hero is hit less, and stops once the attacks are on their floor.
 */
export const dodgeWorthAt = (dodge) => {
  const here = hitRateAt(dodge);
  const next = hitRateAt(dodge + 1);
  return here <= 0 ? 0 : Math.max(0, (here - next) / here);
};

/**
 * The same for one point of PROT, which scales what lands rather than whether
 * it lands. Capped short of 100 because the game does not hand out immunity.
 */
export const protWorthAt = (prot) => {
  const value = Math.max(0, Math.min(95, Number.isFinite(prot) ? prot : 0));
  return 1 / (100 - value);
};

/**
 * And for MAX HP, which buys rounds in proportion: one more point of a 40 HP
 * pool is 2.5% longer alive, whatever anyone is rolling.
 */
export const hpWorthAt = (maxHp) => {
  const value = Number.isFinite(maxHp) && maxHp > 0 ? maxHp : 1;
  return 1 / value;
};
