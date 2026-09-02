/**
 * Whether a hero can actually use the skills you gave them, from where they
 * are standing.
 *
 * This is the one question a party planner exists to answer, and the app could
 * not answer it — a Leper in rank 4 with four melee-only skills was reported
 * as **"Ready!"**. The data was never the problem: `skillEffects.js` has
 * carried `launch` (the ranks a skill can be used from) and `target` (the ranks
 * it reaches) for all 140 vanilla skills since it was generated, and
 * `moddedEffects.js` mirrors it. Until now the only consumer was one line of
 * hover subtitle.
 *
 * Both fields are written **rank 1 first**, matching `heroes[0] = rank 1`
 * everywhere else in the app.
 *
 * Three shapes appear in `target`, and they mean different things:
 *
 * | written | means |
 * | --- | --- |
 * | `1·2·3` | enemy ranks, counted from the enemy front |
 * | `ally 1·2·3·4`, `ally 1·2·3·4 / self` | your own party's ranks |
 * | `Self` | only the caster |
 *
 * Only the first kind counts towards party coverage: "nobody can hit rank 4"
 * is a statement about the enemy back line, and a heal that reaches ally 4
 * does nothing to answer it.
 *
 * Everything here is advisory. A skill this app has no entry for — an
 * uncovered modded class — is reported as `unknown`, never as a fault: silence
 * is the right answer when you do not know.
 */

import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { PARTY_CONFIG } from '../constants';

export const ALL_RANKS = [1, 2, 3, 4];

/** "1·2·3" -> [1,2,3]. Any separator the data might use, digits 1-4 only. */
export const parseRanks = (spec) => {
  if (typeof spec !== 'string') return [];
  const found = spec.match(/[1-4]/g);
  return found ? [...new Set(found.map(Number))].sort() : [];
};

const targetKind = (spec) => {
  if (typeof spec !== 'string') return 'none';
  const lower = spec.toLowerCase();
  if (lower.includes('ally')) return 'ally';
  if (lower.includes('self')) return 'self';
  return parseRanks(spec).length ? 'enemy' : 'none';
};

/**
 * What one skill can do, or null when this app has never heard of it.
 * @returns {{launch: number[], target: number[], kind: 'enemy'|'ally'|'self'|'none'}|null}
 */
export const getSkillRanks = (heroClass, skillName) => {
  const entry = getSkillEffect(skillName, heroClass) || getModdedSkillEffect(skillName, heroClass);
  if (!entry || entry.kind === 'camp' || !entry.launch) return null;
  return {
    launch: parseRanks(entry.launch),
    target: parseRanks(entry.target),
    kind: targetKind(entry.target)
  };
};

/** Can this hero use this skill while standing at `rank`? */
export const isSkillUsableAt = (heroClass, skillName, rank) => {
  const ranks = getSkillRanks(heroClass, skillName);
  if (!ranks) return null;
  return ranks.launch.includes(rank);
};

/**
 * One hero's skills sorted into what works where they stand and what does not.
 * `rank` is 1-4, front to back.
 */
export const heroRankReport = (hero, rank) => {
  const empty = { rank, usable: [], unusable: [], unknown: [], reaches: [] };
  if (!hero?.heroClass || !Array.isArray(hero.activeSkills)) return empty;

  const report = { ...empty, usable: [], unusable: [], unknown: [], reaches: [] };
  const reaches = new Set();

  hero.activeSkills.forEach((skillName) => {
    const ranks = getSkillRanks(hero.heroClass, skillName);
    if (!ranks) {
      report.unknown.push(skillName);
      return;
    }
    if (ranks.launch.includes(rank)) {
      report.usable.push(skillName);
      // Only offensive reach counts; a heal on ally 4 is not enemy coverage.
      if (ranks.kind === 'enemy') ranks.target.forEach((r) => reaches.add(r));
    } else {
      report.unusable.push({ name: skillName, launch: ranks.launch });
    }
  });

  report.reaches = [...reaches].sort();
  return report;
};

/**
 * The party's answer to "can we even reach them?".
 *
 * `heroes` is the array in build order, so index 0 is rank 1. Empty slots are
 * skipped rather than counted as a hero with no skills.
 */
export const partyRankReport = (heroes) => {
  const list = Array.isArray(heroes) ? heroes : [];
  const perHero = list.slice(0, PARTY_CONFIG.MAX_HEROES).map((hero, index) => ({
    index,
    heroClass: hero?.heroClass || '',
    ...heroRankReport(hero, index + 1)
  }));

  const filled = perHero.filter((entry) => entry.heroClass);
  const reachable = new Set();
  filled.forEach((entry) => entry.reaches.forEach((r) => reachable.add(r)));

  return {
    perHero,
    // A hero with nothing usable is the loudest signal: they will stand there
    // passing while the party fights.
    strandedHeroes: filled.filter((entry) => entry.usable.length === 0 && entry.unknown.length === 0),
    unusableCount: filled.reduce((total, entry) => total + entry.unusable.length, 0),
    reachable: [...reachable].sort(),
    // Only meaningful once the party is full; a half-built party is missing
    // coverage by construction, not by mistake.
    unreachable:
      filled.length === PARTY_CONFIG.MAX_HEROES
        ? ALL_RANKS.filter((rank) => !reachable.has(rank))
        : []
  };
};

/** One short line per problem, ready to render. Empty means nothing to say. */
export const rankWarnings = (heroes) => {
  const report = partyRankReport(heroes);
  const warnings = [];

  report.perHero.forEach((entry) => {
    if (!entry.heroClass || !entry.unusable.length) return;
    const total = entry.usable.length + entry.unusable.length + entry.unknown.length;
    warnings.push({
      kind: entry.usable.length === 0 ? 'stranded' : 'unusable',
      index: entry.index,
      heroClass: entry.heroClass,
      rank: entry.rank,
      text:
        entry.usable.length === 0
          ? `${entry.heroClass} can use none of their ${total} skills from rank ${entry.rank}.`
          : `${entry.heroClass}: ${entry.unusable.length} of ${total} skills unusable from rank ${entry.rank}.`
    });
  });

  if (report.unreachable.length) {
    warnings.push({
      kind: 'coverage',
      index: null,
      text: `Nobody can hit enemy rank ${report.unreachable.join(' or ')}.`
    });
  }

  return warnings;
};
