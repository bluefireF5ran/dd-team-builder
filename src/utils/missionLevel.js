/**
 * Which mission a hero is for.
 *
 * A quest in Darkest Dungeon is not just a place, it is a **difficulty**:
 * Apprentice, Veteran or Champion, and the game writes the dungeon level 1, 3
 * or 5 on it. Resolve decides who goes. So "what can my roster field?" is the
 * wrong question on its own — a save carries the Hamlet's whole history at
 * once, twenty heroes across every level, and a comp drawn from all of them is
 * a party that cannot actually embark.
 *
 * **Three numbers, and conflating them is what this module exists to prevent.**
 *
 * | mission | dungeon level | the band it is FOR | Darkest cap | Radiant cap |
 * | --- | --- | --- | --- | --- |
 * | Apprentice | 1 | Resolve 0-2 | 2 | 4 |
 * | Veteran | 3 | Resolve 3-4 | 4 | 6 |
 * | Champion | 5 | Resolve 5-6 | none | none |
 *
 * - **The band** is who the quest is *for*, and it is the recommendation.
 * - **The cap** (`QUEST_RESOLVE_CAPS`, the game's own `quest.restriction.json`)
 *   is a MAXIMUM, never a minimum. A Resolve 3 hero refuses an Apprentice
 *   quest; nothing stops a recruit walking into a Champion dungeon and dying
 *   there. Radiant relaxes both caps by two levels, which is why the mode a
 *   save was started in is part of the question.
 * - **The cost** is what going in short actually does: `UNDER_LEVEL_COST` is
 *   the game's own table — 20 stress on entering one level under, 30 at two,
 *   and a quarter again on every stress hit per level. It is why the band is
 *   preferred rather than merely tidy.
 *
 * So a mission's roster is the band, **widened only when the band cannot make a
 * party**. Four Veterans are a Veteran party; three Veterans and nobody else is
 * not an answer, so the heroes who may still embark come along — cheapest
 * first — and the suggestion still fields as many of the band as it can.
 *
 * Levels only exist once a save is imported — this is the one place in the app
 * that knows how far along a hero is — so everything here is inert without one.
 */

import {
  QUEST_RESOLVE_CAPS_BY_MODE,
  QUEST_RESOLVE_CAPS,
  UNDER_LEVEL_COST,
  resolveLevel
} from '../data/regionProfiles';
import { PARTY_CONFIG } from '../constants';

/** No band: the roster is every hero you own, which is what it always was. */
export const ANY_MISSION = 'any';

export const MISSION_TIERS = [
  { id: 'apprentice', label: 'Apprentice', dungeonLevel: 1, minLevel: 0, maxLevel: 2 },
  { id: 'veteran', label: 'Veteran', dungeonLevel: 3, minLevel: 3, maxLevel: 4 },
  { id: 'champion', label: 'Champion', dungeonLevel: 5, minLevel: 5, maxLevel: 6 }
];

/** The tier record behind an id, or `null` for `ANY_MISSION` and for junk. */
export const getMissionTier = (id) =>
  (typeof id === 'string' ? MISSION_TIERS.find((tier) => tier.id === id) : null) || null;

/** True for a stored value that still names a band we have. */
export const isMissionTier = (id) => id === ANY_MISSION || !!getMissionTier(id);

/** `Resolve 3-4`, for a tooltip that does not make the player remember the table. */
export const missionResolveLabel = (tier) =>
  tier ? `Resolve ${tier.minLevel}-${tier.maxLevel}` : '';

/**
 * The highest Resolve this mission will take, in this campaign.
 *
 * `Infinity` where the game's table says 99, which is its way of writing "no
 * restriction" — comparing against 99 would work today and break the day a mod
 * adds a level. An unknown mode (Crimson Court's `bloodmoon`, anything a patch
 * adds) falls back to Darkest's caps rather than inventing a rule.
 */
export const missionCap = (tier, difficulty) => {
  if (!tier) return Infinity;
  const table = QUEST_RESOLVE_CAPS_BY_MODE[difficulty] || QUEST_RESOLVE_CAPS || [];
  const cap = table[tier.dungeonLevel];
  return Number.isFinite(cap) && cap < 99 ? cap : Infinity;
};

/**
 * A save hero's resolve level, in the campaign the save was started in.
 *
 * `resolveLevel` hands back `null` for anything that is not a number, which a
 * profile stored by an older version of this app can be. Reading that as 0
 * matches what the parser itself defaults `resolveXp` to, and it keeps the hero
 * *somewhere*: falling through every band instead would make them vanish from
 * the roster the moment a mission is picked, with nothing on screen saying why.
 */
export const heroResolveLevel = (hero, difficulty) => {
  const level = resolveLevel(hero?.resolveXp, difficulty);
  return level === null ? 0 : level;
};

/**
 * The band a level sits in. Never `null`: the table has to place every hero.
 *
 * The top band catches anything above it, because the thresholds are read out
 * of the game install and a mod that raises the cap would otherwise leave a
 * Resolve 7 hero belonging to no mission at all.
 */
export const tierOfLevel = (level) => {
  const value = Number.isFinite(level) ? level : 0;
  const found = MISSION_TIERS.find((tier) => value >= tier.minLevel && value <= tier.maxLevel);
  if (found) return found;
  return value < MISSION_TIERS[0].minLevel ? MISSION_TIERS[0] : MISSION_TIERS[MISSION_TIERS.length - 1];
};

/** The band this hero belongs to. */
export const tierOfHero = (hero, difficulty) => tierOfLevel(heroResolveLevel(hero, difficulty));

/** True when this hero is who the mission is *for*. */
export const heroFitsMission = (hero, missionTier, difficulty) => {
  const tier = getMissionTier(missionTier);
  return !tier || tierOfHero(hero, difficulty).id === tier.id;
};

/** True when the game would let this hero embark at all. */
export const heroCanEmbark = (hero, missionTier, difficulty) => {
  const tier = getMissionTier(missionTier);
  return !tier || heroResolveLevel(hero, difficulty) <= missionCap(tier, difficulty);
};

/**
 * How far short of the quest a hero is, and what the game charges for it.
 *
 * Measured against the **dungeon level**, not the band's floor — that is what
 * the game calls effective difficulty, and it is why a Resolve 0 recruit pays
 * on an Apprentice run (dungeon level 1) even though Apprentice is their own
 * band. `null` when they are up to level, which is most of the time.
 */
export const underLevelCost = (hero, missionTier, difficulty) => {
  const tier = getMissionTier(missionTier);
  if (!tier) return null;
  const short = tier.dungeonLevel - heroResolveLevel(hero, difficulty);
  if (short <= 0) return null;
  const at = (table) => table?.[Math.min(short, (table?.length || 1) - 1)] ?? 0;
  return {
    levels: short,
    stress: at(UNDER_LEVEL_COST?.starting),
    stressTaken: at(UNDER_LEVEL_COST?.stressTaken)
  };
};

/** The heroes the mission is for. `ANY_MISSION` hands the list straight back. */
export const heroesForMission = (heroes, missionTier, difficulty) =>
  getMissionTier(missionTier)
    ? (heroes || []).filter((hero) => heroFitsMission(hero, missionTier, difficulty))
    : heroes || [];

/** The heroes the game would let on it, band or not. */
export const heroesAllowedOn = (heroes, missionTier, difficulty) =>
  getMissionTier(missionTier)
    ? (heroes || []).filter((hero) => heroCanEmbark(hero, missionTier, difficulty))
    : heroes || [];

/**
 * Who the mission can draw on: the band, widened when the band is too small.
 *
 * **Widened by hero count, not by how well the classes line up.** "Not enough
 * Veterans" is something a player can see on the tiles and argue with; "not
 * enough Veterans *who happen to match a written comp*" is a rule nobody can
 * predict, and it would pull the band open for a roster that was fine.
 *
 * The heroes who come along are ordered by what they cost — a hero one level
 * short before one two levels short — and the band is always first, so a caller
 * that takes the head of this list takes the band.
 */
export const missionRosterHeroes = (heroes, missionTier, options = {}) => {
  const { difficulty, partySize = PARTY_CONFIG.MAX_HEROES } = options;
  if (!getMissionTier(missionTier)) return heroes || [];

  const band = [];
  const backup = [];
  (heroes || []).forEach((hero) => {
    if (heroFitsMission(hero, missionTier, difficulty)) band.push(hero);
    else if (heroCanEmbark(hero, missionTier, difficulty)) backup.push(hero);
  });
  if (band.length >= partySize) return band;

  backup.sort(
    (a, b) =>
      heroResolveLevel(b, difficulty) - heroResolveLevel(a, difficulty) ||
      (a.name || '').localeCompare(b.name || '')
  );
  return [...band, ...backup];
};

/**
 * How many heroes each band holds, keyed by tier id.
 *
 * What the player needs to see before choosing: a Veteran run is not on the
 * table with two Veterans, and the number says so before the button is pressed.
 */
export const missionTierCounts = (heroes, difficulty) => {
  const counts = Object.fromEntries(MISSION_TIERS.map((tier) => [tier.id, 0]));
  (heroes || []).forEach((hero) => {
    counts[tierOfHero(hero, difficulty).id] += 1;
  });
  return counts;
};
