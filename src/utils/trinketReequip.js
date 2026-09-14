/**
 * Dress a party from the trinkets you own, in Fran's order.
 *
 *   1. the comp's own trinkets              (what the comp was built with)
 *   2. the character's best-in-slot         (`bisLoadout` for class and rank)
 *   3. other trinkets the class uses        (the head of its BiS queue and of its library usage)
 *   4. useful trinkets like the comp's      (`profileMatch` against tier 1, or tier 2)
 *   5. generically useful on this hero      (`trinketValue` >= USEFUL_VALUE)
 *   6. net positive, if less useful         (`trinketValue` > NET_POSITIVE_VALUE)
 *   >>> an empty slot
 *   and never a trinket that is net negative on the hero wearing it.
 *
 * One trinket at a time, best first across the whole party: the lowest tier
 * wins, and within a tier the highest value. That is also how two heroes share
 * one Ancestor's Map. The loser falls through to the next thing on its own
 * list, a worse DODGE trinket or the next BiS, which are Fran's two routes.
 * Values are recomputed after every pick, because a pick changes the party: the
 * second scouting trinket is worth little, a set partner is worth more, and a
 * dodge tank one trinket closer to its bar values the next point differently.
 */
import { bisLoadout } from '../data/bisIndex';
import { getRecommendedTrinkets } from '../data/recommendations';
import { canEquip } from './trinketSubstitution';
import { trinketProfile, targetProfile, profileMatch } from './trinketProfile';
import { nameKey } from './nameNormalizer';
import { skillProfile } from './skillProfile';
import { statBreakdown } from './statBreakdown';
import { heroNeeds } from './heroNeeds';
import { trinketValue, scoutingOf, USEFUL_VALUE, NET_POSITIVE_VALUE } from './trinketValue';

export const TIER_LABELS = {
  1: 'comp trinket',
  2: 'character BiS',
  3: 'class usage',
  4: 'like the BiS',
  5: 'generically useful',
  6: 'net positive'
};

const SIMILAR_MIN = 0.15;
/** The character's BiS is taken unless it actively hurts this hero. */
const NOT_BAD = -0.05;
/**
 * Tiers 3 and 4 still have to be worth wearing on this hero. On Fran's save a
 * trinket the class uses but that does little here (Steady Bracer on an
 * Occultist, 0.29) and a faint echo of the BiS (Steady Bracer on a Highwayman,
 * 0.09) were beating trinkets worth ten times more one tier down. So class usage
 * needs a modest value, and "like the BiS" means a useful trinket that also
 * resembles it.
 */
const USAGE_FLOOR = 0.3;
/**
 * How far down a class's lists "trinkets it uses" reaches. The whole library
 * list is every trinket any comp ever put on the class, and taking all of it
 * let a Blight Charm (worth nothing on a Musketeer) outrank useful trinkets.
 */
const QUEUE_DEPTH = 4;
const USAGE_DEPTH = 5;
const SLOTS = ['trinket1', 'trinket2'];

/**
 * @param {object[]} heroes party in rank order; `trinket1`/`trinket2` are the
 *   comp's own trinkets (tier 1), empty for a party with none
 * @param {string[]} owned every trinket you own
 * @param {{lowTorch?: boolean}} [options]
 * @returns {{heroes: object[], picks: object[], unfilled: number}}
 */
export const reequipParty = (heroes, owned, { lowTorch = false } = {}) => {
  const party = Array.isArray(heroes) ? heroes : [];
  const pool = new Map();
  (owned || []).filter(Boolean).forEach((name) => {
    if (!pool.has(nameKey(name))) pool.set(nameKey(name), name);
  });

  const next = party.map((hero) => (hero ? { ...hero, trinket1: '', trinket2: '' } : hero));

  const partyTags = new Set();
  party.forEach((hero) =>
    (hero?.activeSkills || []).forEach((skill) =>
      skillProfile(hero.heroClass, skill)?.tags.forEach((tag) => partyTags.add(tag))
    )
  );

  const lists = party.map((hero, index) => {
    if (!hero?.heroClass) return null;
    const comp = SLOTS.map((slot) => hero[slot]).filter(Boolean);
    const bis = bisLoadout(hero.heroClass, index + 1);
    const character = bis ? [bis.trinket1, bis.trinket2].filter(Boolean) : [];
    const usage = [
      ...(bis?.trinketOptions || []).slice(character.length, character.length + QUEUE_DEPTH),
      ...getRecommendedTrinkets(hero.heroClass).slice(0, USAGE_DEPTH)
    ];
    const keys = (names) => new Set(names.map(nameKey));
    return {
      comp: keys(comp),
      character: keys(character),
      usage: keys(usage),
      target: targetProfile(comp.length ? comp : character)
    };
  });

  const picks = [];
  let partyScouting = 0;
  const openSlots = next.reduce((total, hero) => total + (hero?.heroClass ? SLOTS.length : 0), 0);

  const bestFor = (hero, index, scoutingSoFar) => {
    const slot = SLOTS.find((s) => !hero[s]);
    if (!slot) return null;
    const needs = heroNeeds(hero, { party: next, heroIndex: index });
    if (!needs) return null;
    const worn = statBreakdown(hero, { party: next, heroIndex: index });
    const currentDodge = worn ? worn.stats.dodge.total + worn.stats.dodge.potential : needs.reachableDodge;
    const other = SLOTS.map((s) => hero[s]).find(Boolean) || '';
    const list = lists[index];

    let best = null;
    pool.forEach((name, key) => {
      if (!canEquip(name, hero.heroClass) || nameKey(other) === key) return;
      const { value, reasons } = trinketValue(name, needs, {
        lowTorch,
        partyScouting: scoutingSoFar,
        partyTags,
        currentDodge,
        otherTrinket: other,
        available: (partner) => pool.has(nameKey(partner))
      });

      let tier = null;
      if (list.comp.has(key)) tier = 1;
      else if (list.character.has(key)) tier = value >= NOT_BAD ? 2 : null;
      else if (value <= NET_POSITIVE_VALUE) tier = null;
      else if (list.usage.has(key) && value >= USAGE_FLOOR) tier = 3;
      else if (value >= USEFUL_VALUE && list.target.size &&
        profileMatch(trinketProfile(name), list.target) >= SIMILAR_MIN) tier = 4;
      else if (value >= USEFUL_VALUE) tier = 5;
      else tier = 6;
      if (!tier) return;

      if (!best || tier < best.tier || (tier === best.tier && value > best.value)) {
        best = { index, slot, key, name, tier, value, reasons, heroClass: hero.heroClass };
      }
    });
    return best;
  };

  for (let step = 0; step < openSlots; step += 1) {
    const scoutingSoFar = partyScouting;
    const best = next.reduce((winner, hero, index) => {
      if (!hero?.heroClass) return winner;
      const candidate = bestFor(hero, index, scoutingSoFar);
      if (!candidate) return winner;
      if (!winner || candidate.tier < winner.tier || (candidate.tier === winner.tier && candidate.value > winner.value)) {
        return candidate;
      }
      return winner;
    }, null);

    if (!best) break;
    next[best.index][best.slot] = best.name;
    pool.delete(best.key);
    partyScouting += scoutingOf(best.name);
    picks.push({ ...best, tierLabel: TIER_LABELS[best.tier] });
  }

  return { heroes: next, picks, unfilled: openSlots - picks.length };
};
