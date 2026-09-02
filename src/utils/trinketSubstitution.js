/**
 * Re-equipping a suggested comp out of the trinkets you actually own.
 *
 * The comp names what it was built with. `trinketProfile` turns that into a
 * target — what those trinkets were *for* — and this walks the party handing
 * out the closest thing in your inventory.
 *
 * Three constraints, and all three bite:
 *
 * 1. **A class trinket only fits its class.** Handing the Crusader's Legendary
 *    Bracer to a Vestal is not a substitution, it is a comp you cannot field.
 * 2. **You own one of each.** A trinket is a physical item; two heroes cannot
 *    wear the same one. The pool is consumed as it is handed out, which also
 *    stops a hero being given the same trinket twice.
 * 3. **Order matters, so it is deliberate.** Slots are filled best-match-first
 *    across the whole party rather than hero by hero, so the one trinket that
 *    strongly matches somebody's target goes to the hero who needs it, not to
 *    whoever happens to be in rank 1.
 *
 * A trinket you already own that the comp asked for is kept as-is — an exact
 * match needs no scoring.
 */

import { HERO_SPECIFIC_TRINKETS } from '../data/hero_specific_trinkets';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import { nameKey } from './nameNormalizer';
import { targetProfile, trinketProfile, profileMatch, sameTrinket } from './trinketProfile';

/** Below this a candidate is not standing in for anything, it is just spare. */
const MIN_MATCH = 0.15;

let ownerCache = null;

/**
 * trinket key -> the one class that may equip it, for class-locked trinkets.
 *
 * **Vanilla wins.** `HERO_SPECIFIC_TRINKETS` is curated; the modded lists are
 * scraped from workshop mods and several of them copy vanilla class trinkets
 * wholesale — the Carbineer claims the Crusader's Holy Orders. Treating that as
 * a contested name and giving up on the restriction let Holy Orders onto a
 * Vestal. So modded classes may only claim what vanilla has not.
 */
const trinketOwners = () => {
  if (ownerCache) return ownerCache;
  ownerCache = new Map();

  const claim = (heroClass, list, authoritative) =>
    (list || []).forEach((name) => {
      const key = nameKey(name);
      if (!authoritative && ownerCache.has(key)) return;
      // Two vanilla classes claiming one name is not a lock in any useful sense.
      if (ownerCache.has(key) && ownerCache.get(key) !== heroClass) ownerCache.set(key, null);
      else ownerCache.set(key, heroClass);
    });

  Object.entries(HERO_SPECIFIC_TRINKETS).forEach(([c, list]) => claim(c, list, true));
  Object.entries(HERO_CLASSES).forEach(([c, data]) => claim(c, data.classSpecificTrinkets, true));
  Object.entries(MODDED_HERO_CLASSES).forEach(([c, data]) =>
    claim(c, data.classSpecificTrinkets, false)
  );
  return ownerCache;
};

/** True when `heroClass` is allowed to equip `trinket`. */
export const canEquip = (trinket, heroClass) => {
  const owner = trinketOwners().get(nameKey(trinket));
  return !owner || owner === heroClass;
};

/**
 * @param {Array} heroes party in build order, each with `heroClass` and the
 *   comp's own `trinket1` / `trinket2`
 * @param {string[]} owned every trinket the save says you have
 * @returns {{heroes: Array, swaps: Array, unfilled: number}}
 */
export const substituteTrinkets = (heroes, owned) => {
  const party = Array.isArray(heroes) ? heroes : [];
  const pool = new Map();
  (owned || []).filter(Boolean).forEach((name) => {
    const key = nameKey(name);
    pool.set(key, { name, count: (pool.get(key)?.count || 0) + 1 });
  });

  const next = party.map((hero) => ({ ...hero, trinket1: '', trinket2: '' }));
  const swaps = [];

  const take = (key) => {
    const entry = pool.get(key);
    if (!entry) return null;
    if (entry.count <= 1) pool.delete(key);
    else entry.count -= 1;
    return entry.name;
  };

  // Every slot the comp wanted filled, with what it wanted there.
  const slots = [];
  party.forEach((hero, index) => {
    if (!hero?.heroClass) return;
    ['trinket1', 'trinket2'].forEach((slot) => {
      if (hero[slot]) slots.push({ index, slot, ideal: hero[slot], heroClass: hero.heroClass });
    });
  });

  // Pass one: anything the comp asked for that you happen to own stays put.
  const remaining = [];
  slots.forEach((entry) => {
    const key = nameKey(entry.ideal);
    if (pool.has(key) && canEquip(entry.ideal, entry.heroClass)) {
      next[entry.index][entry.slot] = take(key);
    } else {
      remaining.push(entry);
    }
  });

  // Pass two: score every remaining slot against every trinket left, then hand
  // them out strongest match first. Doing it globally rather than per hero is
  // what stops rank 1 taking a trinket rank 3 needed more.
  const targets = new Map();
  remaining.forEach((entry) => {
    if (!targets.has(entry.ideal)) targets.set(entry.ideal, targetProfile([entry.ideal]));
  });

  const candidates = [];
  remaining.forEach((entry, slotId) => {
    const target = targets.get(entry.ideal);
    pool.forEach(({ name }, key) => {
      if (!canEquip(name, entry.heroClass)) return;
      const score = profileMatch(trinketProfile(name), target);
      if (score >= MIN_MATCH) candidates.push({ slotId, key, name, score, entry });
    });
  });
  candidates.sort((a, b) => b.score - a.score || a.slotId - b.slotId);

  const filled = new Set();
  candidates.forEach(({ slotId, key, entry, score }) => {
    if (filled.has(slotId) || !pool.has(key)) return;
    // Check the hero's other slot BEFORE consuming: taking first and bailing
    // out afterwards spent the trinket without equipping it, so it went
    // missing from the party and the inventory alike.
    const offered = pool.get(key).name;
    if (
      sameTrinket(offered, next[entry.index].trinket1) ||
      sameTrinket(offered, next[entry.index].trinket2)
    ) {
      return;
    }
    const taken = take(key);
    if (!taken) return;
    filled.add(slotId);
    next[entry.index][entry.slot] = taken;
    swaps.push({
      index: entry.index,
      heroClass: entry.heroClass,
      wanted: entry.ideal,
      got: taken,
      score: Number(score.toFixed(3))
    });
  });

  return {
    heroes: next,
    swaps,
    // Slots the comp wanted filled and the inventory could not answer. Left
    // empty rather than filled with the trinket you do not own: a comp you
    // cannot equip is not advice.
    unfilled: remaining.length - filled.size
  };
};
