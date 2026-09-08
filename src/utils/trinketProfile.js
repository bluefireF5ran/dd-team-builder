/**
 * What a trinket is *for*, as a vector, so one can be swapped for another.
 *
 * A suggested comp names the trinkets it was built with. If you have imported a
 * save, you probably do not own them — and handing you a comp you cannot equip
 * is not advice. So the comp's trinkets become a **target profile** and the
 * suggester fields the closest thing in your inventory.
 *
 * ## Why a plain number does not work
 *
 * Trinket text mixes upside and downside in one line, and the sign alone does
 * not say which is which. `+10% Stress` on Grim Bandana is the *price* of its
 * damage; `-15% Stress` on Shameful Shroud is the *point* of it. Meanwhile
 * `+20% Stress Dealt` is stress inflicted on the enemy, which is a benefit
 * despite sharing a word. Across the 719-trinket corpus `Stress` runs +101/-110
 * — a genuine mix, not a convention.
 *
 * So every clause is turned into a **benefit**: the magnitude times the stat's
 * polarity. Benefit above zero is upside whichever way the sign ran.
 *
 * ## What gets matched
 *
 * Only the ideal's **upside** becomes the target. Its downsides are a cost the
 * comp accepted, not a goal — reproducing `+10% Stress` because the original
 * had it would be matching the bill instead of the meal. A candidate is then
 * scored on how much of that upside it actually delivers, minus a penalty for
 * the downside it drags along. Extra upside the comp never asked for is free:
 * an earlier version scored the angle between the vectors, which marked a
 * candidate down for being *better* than what it replaced.
 *
 * ## Units
 *
 * `+2 SPD` and `+25% MAX HP` are not comparable as numbers, so each stat is
 * divided by the median magnitude it takes across the corpus. That scale is
 * derived from the data rather than hand-tuned, so it stays right when the
 * generator is rerun against a new game patch.
 */

import { TRINKET_EFFECTS, getTrinketEffect } from '../data/trinketEffects';
import { getModdedTrinketEffect } from '../data/moddedEffects';
import { nameKey, canonicalizeTrinket } from './nameNormalizer';

/**
 * Stats where a bigger number is worse. Everything absent from this list reads
 * "more is better", which is correct for the overwhelming majority.
 *
 * The near-misses are the reason this is a list of exact base stats rather than
 * a keyword match: `Stress` is bad, `Stress Dealt` and `Stress Heal Received`
 * are good; `Chance Party Surprised` is bad, `Chance Monsters Surprised` is
 * good.
 */
export const LOWER_IS_BETTER = new Set([
  'stress',
  'food consumed',
  'chance party surprised',
  'torch burn rate',
  'hp dmg inflicted when starving',
  'armor upgrade cost',
  'weapon upgrade cost'
]);

// A clause that only applies sometimes is worth having but is not the same as
// one that always applies, so it counts for half.
const CONDITIONAL_WEIGHT = 0.5;
const CONDITION = / (?:if|vs|while|when|per|on|against) .*$/i;
// Melee/Ranged variants are the same stat narrowed to half a hero's skills.
const SKILL_SCOPE = / (?:Melee|Ranged) Skills$/i;

const clausesOf = (effectText) =>
  typeof effectText === 'string' ? effectText.split(' | ').map((c) => c.trim()).filter(Boolean) : [];

/**
 * One clause -> `{ base, amount, conditional }`, or null when it is prose.
 * Roughly a fifth of the corpus is prose ("Attacks usable in any position"),
 * and prose carries no vector: it is skipped rather than guessed at.
 */
export const parseClause = (clause) => {
  const match = /^([+-])([\d.]+)(%?)\s+(.+)$/.exec(clause);
  if (!match) return null;
  const [, sign, digits, , rest] = match;
  const amount = Number(digits);
  if (!Number.isFinite(amount)) return null;

  const conditional = CONDITION.test(rest);
  const base = rest.replace(CONDITION, '').replace(SKILL_SCOPE, '').trim().toLowerCase();
  if (!base) return null;

  return { base, amount: sign === '-' ? -amount : amount, conditional };
};

/** Signed magnitude -> benefit: positive is good, whichever way the sign ran. */
const benefitOf = ({ base, amount, conditional }) => {
  const polarity = LOWER_IS_BETTER.has(base) ? -1 : 1;
  return amount * polarity * (conditional ? CONDITIONAL_WEIGHT : 1);
};

/** `{ base -> benefit }` for any effect string, trinket or quirk alike. */
export const effectProfile = (effectText) => {
  const profile = new Map();
  clausesOf(effectText).forEach((clause) => {
    const parsed = parseClause(clause);
    if (!parsed) return;
    profile.set(parsed.base, (profile.get(parsed.base) || 0) + benefitOf(parsed));
  });
  return profile;
};

// --- per-stat scale --------------------------------------------------------

let scaleCache = null;

/**
 * The median magnitude each stat takes across every trinket, so `+2 SPD` and
 * `+25% MAX HP` can be compared. Built on first use: nothing pays for it until
 * a comp is actually suggested against an inventory.
 */
export const statScale = () => {
  if (scaleCache) return scaleCache;
  const samples = new Map();
  Object.values(TRINKET_EFFECTS).forEach((entry) => {
    clausesOf(entry?.effect).forEach((clause) => {
      const parsed = parseClause(clause);
      if (!parsed) return;
      if (!samples.has(parsed.base)) samples.set(parsed.base, []);
      samples.get(parsed.base).push(Math.abs(parsed.amount));
    });
  });

  scaleCache = new Map();
  samples.forEach((values, base) => {
    values.sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];
    scaleCache.set(base, median > 0 ? median : 1);
  });
  return scaleCache;
};

const normalised = (profile) => {
  const scale = statScale();
  const out = new Map();
  profile.forEach((benefit, base) => out.set(base, benefit / (scale.get(base) || 1)));
  return out;
};

const split = (profile) => {
  const up = new Map();
  const down = new Map();
  profile.forEach((benefit, base) => {
    if (benefit > 0) up.set(base, benefit);
    else if (benefit < 0) down.set(base, -benefit);
  });
  return { up, down };
};

const magnitude = (vector) =>
  Math.sqrt([...vector.values()].reduce((total, v) => total + v * v, 0));

// --- trinkets --------------------------------------------------------------

/**
 * The benefit vector of a named trinket, empty when its effect is unknown.
 *
 * The name is canonicalised first. The effect stores are keyed by exact string,
 * and a comp or a save can spell a trinket with a typographic apostrophe -
 * "Ancestor's Bottle" resolves, "Ancestor’s Bottle" does not, and an
 * unresolved name yields an empty profile that silently matches nothing.
 */
export const trinketProfile = (name) => {
  const canonical = canonicalizeTrinket(name);
  const entry =
    getTrinketEffect(canonical) ||
    getModdedTrinketEffect(canonical) ||
    getTrinketEffect(name) ||
    getModdedTrinketEffect(name);
  return effectProfile(entry?.effect);
};

/** How much of a candidate's own weight is downside. 0 is clean, 1 is all cost. */
export const downsideShare = (profile) => {
  const { up, down } = split(normalised(profile));
  const upWeight = magnitude(up);
  const downWeight = magnitude(down);
  const total = upWeight + downWeight;
  return total > 0 ? downWeight / total : 0;
};

/** A trinket's downsides are worth this much against matching the target. */
const DOWNSIDE_PENALTY = 0.35;

/**
 * How well `candidate` stands in for `target`, roughly -0.35 to 1.
 *
 * **Coverage, not similarity.** The first version scored the angle between the
 * two vectors, which punished a candidate for carrying stats the target had not
 * asked for - so Feather Crystal, which covers a wanted `+2 SPD` in full and
 * throws in dodge, scored 0.13 and was rejected. Extra upside is not a defect.
 *
 * So the score asks how much of what the comp wanted this actually delivers,
 * capped per stat so overshooting is not rewarded either, minus what the
 * candidate costs you elsewhere. Giving half the speed the comp wanted covers
 * half of it, which is the honest answer when half is all you own.
 */
export const profileMatch = (candidateProfile, targetUpside) => {
  if (!targetUpside.size) return 0;
  const { up, down } = split(normalised(candidateProfile));
  const target = normalised(targetUpside);

  let wanted = 0;
  let met = 0;
  target.forEach((amount, base) => {
    wanted += amount;
    met += Math.min(up.get(base) || 0, amount);
  });
  const coverage = wanted > 0 ? met / wanted : 0;

  const totalWeight = magnitude(up) + magnitude(down);
  const cost = totalWeight > 0 ? magnitude(down) / totalWeight : 0;
  return coverage - DOWNSIDE_PENALTY * cost;
};

/** What the comp is asking for: the upside of the trinkets it was built with. */
export const targetProfile = (trinketNames) => {
  const combined = new Map();
  (trinketNames || []).filter(Boolean).forEach((name) => {
    trinketProfile(name).forEach((benefit, base) => {
      combined.set(base, (combined.get(base) || 0) + benefit);
    });
  });
  return split(combined).up;
};

/** A short, readable account of what a profile is mostly doing. */
export const describeProfile = (profile, limit = 3) => {
  const scale = statScale();
  return [...split(profile).up.entries()]
    .sort((a, b) => b[1] / (scale.get(b[0]) || 1) - a[1] / (scale.get(a[0]) || 1))
    .slice(0, limit)
    .map(([base]) => base);
};

export const sameTrinket = (a, b) => !!a && !!b && nameKey(a) === nameKey(b);
