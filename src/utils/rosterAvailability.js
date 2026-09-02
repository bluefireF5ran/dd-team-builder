/**
 * How many of each class you have, and which comps that lets you field.
 *
 * **A roster is a multiset, not a set.** Fifty-one of the bundled comps run a
 * duplicated class — `Ballad Quartet` is four Jesters, `Bulwark Pack: Heist` is
 * three Men-at-Arms — and the suggester used to check membership with a `Set`,
 * so owning one Antiquarian was enough to be handed a comp needing four. That
 * is the bug this module exists to make impossible: availability is a
 * containment test between two counted collections.
 *
 * A roster arrives in whichever shape the caller has:
 *
 *   - an array with repeats — `['Crusader', 'Antiquarian', 'Antiquarian']`
 *   - a plain object or Map of counts — `{ Antiquarian: 2 }`
 *
 * The array form is what the pickers store, and it is also why a roster written
 * before this existed still reads correctly: a list of unique names is simply
 * one of each.
 */

import { nameKey } from './nameNormalizer';
import { PARTY_CONFIG } from '../constants';

const heroClassOf = (hero) => hero?.heroClass || hero?.name || '';

/** @returns Map keyed by `nameKey`, holding the display name and the count. */
export const toRosterCounts = (roster) => {
  const counts = new Map();

  const add = (rawName, amount) => {
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const key = nameKey(name);
    if (!key || !(amount > 0)) return;
    const entry = counts.get(key);
    if (entry) entry.count += amount;
    else counts.set(key, { name, count: amount });
  };

  // Unwrapping an entry means `toRosterCounts` of its own output is the same
  // map back, so callers can pass either a raw roster or an already-counted one
  // without a silent empty result.
  const addEntry = (name, value) =>
    typeof value === 'number' ? add(name, value) : add(value?.name || name, value?.count);

  if (Array.isArray(roster)) roster.forEach((name) => add(name, 1));
  else if (roster instanceof Map) roster.forEach((value, name) => addEntry(name, value));
  else if (roster && typeof roster === 'object') {
    Object.entries(roster).forEach(([name, value]) => addEntry(name, value));
  }

  return counts;
};

/** How many of `heroClass` a counted roster holds. */
export const countOf = (counts, heroClass) => counts.get(nameKey(heroClass))?.count || 0;

/** Total heroes, which is what "do I have enough for a party?" asks. */
export const rosterSize = (counts) => [...counts.values()].reduce((total, e) => total + e.count, 0);

/**
 * Back to a flat list, repeats and all.
 *
 * Capped per class at the party size: holding six Jesters cannot matter to a
 * four-slot party, and leaving the tail in would skew a random draw towards
 * whichever class you happen to be hoarding.
 */
export const expandRoster = (roster, perClassMax = PARTY_CONFIG.MAX_HEROES) => {
  const names = [];
  toRosterCounts(roster).forEach(({ name, count }) => {
    for (let i = 0; i < Math.min(count, perClassMax); i++) names.push(name);
  });
  return names;
};

/** What one comp asks of a roster, counted the same way. */
export const compClassCounts = (comp) => toRosterCounts((comp?.heroes || []).map(heroClassOf));

/**
 * True when the roster holds at least as many of every class as the comp needs.
 *
 * A comp has to be a full party of four *named* classes. `The_Old_Road` is the
 * game's tutorial pair with two empty slots, and an empty slot asks nothing of
 * a roster — so without the emptiness check it would fit every roster and get
 * suggested as a half party. The `Set` this replaced excluded it by accident,
 * because `''` was never a roster member.
 */
export const compFitsRoster = (comp, counts) => {
  if (!comp?.heroes || comp.heroes.length !== PARTY_CONFIG.MAX_HEROES) return false;
  if (comp.heroes.some((hero) => !heroClassOf(hero))) return false;
  const needed = compClassCounts(comp);
  if (!needed.size) return false;
  for (const [key, { count }] of needed) {
    if ((counts.get(key)?.count || 0) < count) return false;
  }
  return true;
};

/** What the roster is short of, for telling the player why a comp is out. */
export const missingForComp = (comp, counts) => {
  const short = [];
  compClassCounts(comp).forEach(({ name, count }, key) => {
    const have = counts.get(key)?.count || 0;
    if (have < count) short.push({ heroClass: name, need: count, have });
  });
  return short;
};

/**
 * A hero locked into an Abbey/Tavern/Sanitarium slot, or missing after a town
 * event, cannot go on a run this week — so "who can I field right now" is not
 * the same question as "who is on my roster".
 */
export const isHeroAvailable = (hero) => !hero?.activity && !hero?.isMissing;

/** The roster list an imported save implies, as class names with repeats. */
export const rosterFromHeroes = (heroes, { includeBusy = false } = {}) =>
  (heroes || [])
    .filter((hero) => includeBusy || isHeroAvailable(hero))
    .map((hero) => hero.heroClass)
    .filter(Boolean);
