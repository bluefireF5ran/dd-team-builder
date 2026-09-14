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

/**
 * ## The other side of it: what a DEBUFF works against
 *
 * The same walk, one row per enemy rather than per attack, because a debuff is
 * put on the monster. DODGE is its `.def`, PROT its `.prot`, SPD its `.spd`.
 *
 * PROT is the situational one and the numbers say so plainly: 45 of the 119
 * champion enemies carry any at all, 35.4% of weighted appearances, averaging
 * 33.4% where it is there. Stripping armour off the other two thirds does
 * nothing, which is why `-20% PROT` cannot be priced like a `-20% DMG` that
 * always bites.
 */

/** Mean champion DODGE - low enough that a `-30 DODGE` erases the whole of it. */
export const CHAMPION_DODGE = 27.0;

/** Champion PROT by decile, lowest first. Six of ten are bare. */
export const CHAMPION_PROT_DECILES = [0, 0, 0, 0, 0, 0, 7, 25, 33, 50];

/** Champion SPD by decile, lowest first. */
export const CHAMPION_SPD_DECILES = [2, 3, 4, 5, 7, 7, 8, 9, 10, 12];

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

/**
 * ## What a debuff is actually worth
 *
 * The flat score this replaces could not tell the Leper's `-33% DMG (3 rds)`
 * from the Shieldbreaker's `-3 SPD`; both scored `0.5 + 0.35`. The five stats a
 * debuff can touch are five different questions and the game files answer four
 * of them outright (`occultist.info.darkest` and the effect tables):
 * `.damage_low_multiply` takes a share off everything the enemy deals,
 * `.protection_rating_add` and `.defense_rating_add` are flat points, and
 * `.speed_rating_add` moves who goes first.
 *
 * Everything below is in **champion-attack-damage equivalents**: one unit is
 * one average champion swing, 6.2 HP. Damage we avoid and damage we add are
 * counted alike, which is a choice rather than a measurement - the same 1:1 the
 * rest of `trinketValue` already makes when it prices DMG against DODGE.
 */

/** The party a debuff is measured on behalf of: mean champion gear, 20 classes. */
export const PARTY_DODGE = 25.8;
export const PARTY_SPD = 7.0;

/**
 * What winning initiative for one round is worth, as a share of an enemy swing.
 *
 * **The one hand-set number in the debuff model**, and it is set low on
 * purpose. Going first does not remove an attack by itself - it removes one
 * only when the action converts, by killing or stunning the thing that was
 * about to move - so a round of initiative is worth a fraction of a swing
 * rather than a swing. The SHAPE around it is entirely derived from the 1d8
 * rule; this is the only place a judgement enters, and the ordering of the
 * classes barely moves across 0.1 to 0.3.
 */
export const INITIATIVE_WORTH = 0.2;

/**
 * One round of one debuff, in champion-attack-damage equivalents.
 *
 * `amount` is what the prose writes: points for ACC, DODGE and SPD, percent for
 * PROT and DMG. `heroSpd` only matters to the SPD case, where how much there is
 * to win depends on how fast the hero already is.
 */
export const debuffRoundWorth = (stat, amount, heroSpd) => {
  const size = Math.abs(Number(amount) || 0);
  if (!size) return 0;
  switch (stat) {
    case 'dmg':
      // A share off everything it deals, on the swings that land anyway.
      return (size / 100) * hitRateAt(PARTY_DODGE) * CHAMPION_ATTACK_DAMAGE;
    case 'acc':
      // Fewer of its swings land. Taking N off its ACC is the same arithmetic
      // as putting N on our DODGE - the game rolls `ACC + 5 - DODGE` either way.
      return (hitRateAt(PARTY_DODGE) - hitRateAt(PARTY_DODGE + size)) * CHAMPION_ATTACK_DAMAGE;
    case 'dodge':
      // More of OURS land: every point is a point of hit chance, up to the
      // dodge it actually has. Champion DODGE averages 27, so a `-30 DODGE`
      // takes all of it and a `-60` is no better than a `-30`.
      return (Math.min(size, CHAMPION_DODGE) / 100) * CHAMPION_ATTACK_DAMAGE;
    case 'prot':
      /**
       * Ours land harder - where there is armour at all. Six champion enemies
       * in ten carry none, so two thirds of the time this clause does nothing,
       * and stripping 20 off an enemy holding 7 strips 7. That is the whole
       * reason PROT shred cannot be priced like a `-DMG` that always bites.
       */
      return (CHAMPION_PROT_DECILES.reduce(
        (total, prot) => total + Math.min(size, prot) / (100 - prot),
        0
      ) / CHAMPION_PROT_DECILES.length) * CHAMPION_ATTACK_DAMAGE;
    case 'spd':
      return spdDebuffWorth(Number.isFinite(heroSpd) ? heroSpd : PARTY_SPD, size) *
        INITIATIVE_WORTH * CHAMPION_ATTACK_DAMAGE;
    default:
      return 0;
  }
};

/**
 * ## Who goes first
 *
 * **Fran's rule** (2026-09-15): "SPD rolls are determined by SPD (base SPD +
 * modifiers) + 1d8", and "heroes will win SPD ties vs. enemies". Rank breaks
 * ties within a side, which does not come into a hero-against-enemy question.
 *
 * So a hero acts first when `heroSpd + h >= enemySpd + e`, both d8s - that is,
 * when `h - e` reaches `enemySpd - heroSpd`. The difference of two d8s is a
 * triangle over -7..7, which is the whole model, and it reproduces the rule of
 * thumb it came with: at 7 higher SPD the hero needs `h - e >= -7`, which is
 * every one of the 64 pairs.
 */
const D8 = 8;

/** How often `h - e` lands on exactly `k`, over the 64 pairs of two d8. */
const spdGapChance = (k) => {
  const step = Math.abs(Math.round(k));
  return step >= D8 ? 0 : (D8 - step) / (D8 * D8);
};

/** How often a hero at `heroSpd` acts before an enemy at `enemySpd`. */
export const actsFirstChance = (heroSpd, enemySpd) => {
  const need = Math.round((Number(enemySpd) || 0) - (Number(heroSpd) || 0));
  let total = 0;
  for (let k = Math.max(need, -(D8 - 1)); k <= D8 - 1; k += 1) total += spdGapChance(k);
  return Math.min(1, total);
};

/**
 * What ONE point off an enemy's SPD buys: the chance it flips who goes first.
 *
 * It is the triangle read at the point just crossed, so it peaks at 12.5% where
 * the enemy is a single point faster and falls to nothing once the gap is
 * already 8 - "having 7 higher SPD will let a hero always act before an enemy",
 * and an eighth point buys nothing at all. A slow hero gets more out of slowing
 * somebody than a fast one does, which is the same shape DODGE has.
 */
export const spdPointWorthAt = (heroSpd, enemySpd) =>
  spdGapChance((Number(enemySpd) || 0) - (Number(heroSpd) || 0) - 1);

/**
 * And what an `N`-point SPD debuff buys against the champion spread: how much
 * more often the hero gets to move first, averaged over the enemies he meets.
 */
export const spdDebuffWorth = (heroSpd, points) => {
  const drop = Math.max(0, Number(points) || 0);
  if (!drop) return 0;
  return CHAMPION_SPD_DECILES.reduce(
    (total, spd) => total + (actsFirstChance(heroSpd, spd - drop) - actsFirstChance(heroSpd, spd)),
    0
  ) / CHAMPION_SPD_DECILES.length;
};
