/**
 * Whether a hero can actually use the skills you gave them, from where they
 * are standing — and from wherever their own skills will put them.
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
 * ## Heroes move
 *
 * The first version of this file judged `launch` against the rank the hero
 * starts in, and that is not how the game is played. A Jester in rank 4 with
 * Solo, Finale, Dirk Stab and Slice Off came back as three broken slots — but
 * Solo throws them Forward 3 into rank 1, Finale throws them Back 3 to rank 4,
 * and the whole build *is* that loop. A Highwayman is put in rank 4 with
 * Duelist's Advance precisely because it steps them forward into range of
 * their other three. Judged against the starting rank alone, the strategy
 * reads as a mistake.
 *
 * So the unit of judgement is **reachable ranks**: start where the hero
 * stands, follow every self-move they can launch from there, and repeat until
 * nothing new opens up. A skill is dead only when it can be launched from none
 * of them; one that waits for a step is `situational`, not a fault.
 *
 * Self-movement is written into the effect prose as `Forward N` / `Back N`
 * inside the caster's own clause. `Knockback` and `Pull` move the enemy and
 * are not it.
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
 * How far a skill moves the *caster*, as a signed rank delta: negative towards
 * the front line, positive towards the back, 0 for staying put.
 *
 * The prose puts the caster's own results behind a `Self:` label and separates
 * clauses with `|`, so when that label is present only its clause is read —
 * "Knockback 1 (140% base) | Self: Back 1" is Point Blank Shot shoving the
 * enemy away *and* stepping back, and only the second half is ours. A few
 * entries (Duelist's Advance) write the move with no label at all, and there
 * the whole string is fair game: nothing else in the data says `Forward N`,
 * and `Knockback`/`Pull` carry no capitalised `Back`/`Forward` to catch on.
 */
export const parseSelfMove = (effect) => {
  if (typeof effect !== 'string' || !effect) return 0;
  const selfClauses = effect.split('|').filter((clause) => /\bself\s*:/i.test(clause));
  const searchIn = selfClauses.length ? selfClauses.join(' ') : effect;
  const found = searchIn.match(/\b(Forward|Back)\s*(\d)/);
  if (!found) return 0;
  return found[1] === 'Forward' ? -Number(found[2]) : Number(found[2]);
};

const clampRank = (rank) => Math.min(4, Math.max(1, rank));

/**
 * What one skill can do, or null when this app has never heard of it.
 * @returns {{launch: number[], target: number[], kind: 'enemy'|'ally'|'self'|'none', move: number}|null}
 */
export const getSkillRanks = (heroClass, skillName) => {
  const entry = getSkillEffect(skillName, heroClass) || getModdedSkillEffect(skillName, heroClass);
  if (!entry || entry.kind === 'camp' || !entry.launch) return null;
  return {
    launch: parseRanks(entry.launch),
    target: parseRanks(entry.target),
    kind: targetKind(entry.target),
    move: parseSelfMove(entry.effect)
  };
};

/** Can this hero use this skill while standing at `rank`? */
export const isSkillUsableAt = (heroClass, skillName, rank) => {
  const ranks = getSkillRanks(heroClass, skillName);
  if (!ranks) return null;
  return ranks.launch.includes(rank);
};

/** The rank deltas this hero can apply to themselves while standing at `rank`. */
const selfMovesFrom = (hero, rank) => {
  const skills = Array.isArray(hero?.activeSkills) ? hero.activeSkills : [];
  const deltas = new Set();
  skills.forEach((skillName) => {
    const ranks = getSkillRanks(hero?.heroClass, skillName);
    if (ranks && ranks.move && ranks.launch.includes(rank)) deltas.add(ranks.move);
  });
  return [...deltas];
};

/**
 * Every rank this hero can end up in under their own power, starting from
 * `rank`. Walked to a fixed point, because one step unlocks the next: a Grave
 * Robber in rank 1 has only Shadow Fade (Back 2), which puts them in rank 3,
 * where Lunge (Forward 2) sends them back to the front.
 *
 * This is the lone-hero answer. Inside a party, `partyReachableRanks` is the
 * one to ask — heroes shove each other around.
 */
export const reachableRanks = (hero, rank) => {
  const start = clampRank(Number(rank) || 1);
  const seen = new Set([start]);
  const queue = [start];

  while (queue.length) {
    const here = queue.shift();
    selfMovesFrom(hero, here).forEach((delta) => {
      const next = clampRank(here + delta);
      if (seen.has(next)) return;
      seen.add(next);
      queue.push(next);
    });
  }

  return [...seen].sort();
};

/**
 * Where each hero can end up once the *party* is allowed to move, which is the
 * only version of the question the game actually asks.
 *
 * Nobody steps alone in Darkest Dungeon. A hero who moves two ranks back does
 * not swap with one neighbour, they slide out and back in, and everyone they
 * pass shifts one rank the other way. That is why a Hellion is written into
 * rank 2 holding Iron Swan, which launches from rank 1 only: the Grave Robber
 * in front of her opens with Shadow Fade, drops to rank 3, and the Hellion is
 * pulled to the front by the same movement. Judge her alone and the build is
 * broken; judge her beside her party and it is the plan.
 *
 * A party is at most four heroes, so the whole space of arrangements is 24
 * orderings at worst. Walking all of them reachable from the starting one is
 * cheaper than being clever about it.
 *
 * @returns {number[][]} ranks per slot, indexed the same as `heroes`
 */
export const partyReachableRanks = (heroes) => {
  const list = (Array.isArray(heroes) ? heroes : []).slice(0, PARTY_CONFIG.MAX_HEROES);
  // An arrangement is the slot indices in rank order, rank 1 first.
  const start = list.map((_, slot) => slot);
  const ranksBySlot = list.map((_, slot) => new Set([slot + 1]));
  const seen = new Set([start.join('')]);
  const queue = [start];

  while (queue.length) {
    const order = queue.shift();
    order.forEach((slot, index) => {
      const hero = list[slot];
      if (!hero?.heroClass) return;
      selfMovesFrom(hero, index + 1).forEach((delta) => {
        const next = order.filter((_, i) => i !== index);
        // Slide out and back in: everyone stepped over shifts one the other way.
        next.splice(Math.min(next.length, Math.max(0, index + delta)), 0, slot);
        const key = next.join('');
        if (seen.has(key)) return;
        seen.add(key);
        next.forEach((s, rank) => ranksBySlot[s].add(rank + 1));
        queue.push(next);
      });
    });
  }

  return ranksBySlot.map((ranks) => [...ranks].sort());
};

/**
 * One hero's skills sorted into what works where they stand, what works once
 * they have moved, and what works nowhere they can get to. `rank` is 1-4,
 * front to back.
 *
 * `reachable` is the hero's ranks as the party computes them; on its own this
 * falls back to what the hero can manage without help.
 */
export const heroRankReport = (hero, rank, reachable = null) => {
  const empty = { rank, reachable: [rank], usable: [], situational: [], unusable: [], unknown: [], reaches: [] };
  if (!hero?.heroClass || !Array.isArray(hero.activeSkills)) return empty;

  const reachableFrom = reachable || reachableRanks(hero, rank);
  const report = { rank, reachable: reachableFrom, usable: [], situational: [], unusable: [], unknown: [], reaches: [] };
  const reaches = new Set();

  hero.activeSkills.forEach((skillName) => {
    const ranks = getSkillRanks(hero.heroClass, skillName);
    if (!ranks) {
      report.unknown.push(skillName);
      return;
    }

    const here = ranks.launch.includes(rank);
    const anywhere = here || ranks.launch.some((r) => reachableFrom.includes(r));

    if (here) report.usable.push(skillName);
    else if (anywhere) report.situational.push({ name: skillName, launch: ranks.launch });
    else report.unusable.push({ name: skillName, launch: ranks.launch });

    // Only offensive reach counts; a heal on ally 4 is not enemy coverage.
    // Reach follows the hero: a Jester who will be standing in rank 1 by the
    // second round really does threaten what Finale threatens.
    if (anywhere && ranks.kind === 'enemy') ranks.target.forEach((r) => reaches.add(r));
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
  const party = list.slice(0, PARTY_CONFIG.MAX_HEROES);
  const reachable = partyReachableRanks(party);
  const perHero = party.map((hero, index) => ({
    index,
    heroClass: hero?.heroClass || '',
    ...heroRankReport(hero, index + 1, reachable[index])
  }));

  const filled = perHero.filter((entry) => entry.heroClass);
  const covered = new Set();
  filled.forEach((entry) => entry.reaches.forEach((r) => covered.add(r)));

  return {
    perHero,
    // A hero with nothing usable is the loudest signal: they will stand there
    // passing while the party fights. A hero with no skills chosen yet is a
    // half-finished build, not a broken one, and an uncovered modded class is
    // a gap in this app rather than in the party — neither counts.
    strandedHeroes: filled.filter(
      (entry) =>
        entry.usable.length === 0 &&
        entry.unknown.length === 0 &&
        entry.situational.length + entry.unusable.length > 0
    ),
    reachable: [...covered].sort(),
    // Only meaningful once the party is full; a half-built party is missing
    // coverage by construction, not by mistake.
    unreachable:
      filled.length === PARTY_CONFIG.MAX_HEROES
        ? ALL_RANKS.filter((rank) => !covered.has(rank))
        : []
  };
};

/**
 * One short line per problem, ready to render. Empty means nothing to say.
 *
 * Exactly one thing earns a line: a hero who cannot use a single skill from
 * the rank they are standing in. They pass their turn, and keep passing until
 * something shoves them somewhere useful. That is not a matter of taste, and
 * it is not a matter of tempo — it is a hero doing nothing.
 *
 * Two lines this used to carry are gone, because both were calling working
 * parties broken:
 *
 * - **"Nobody can hit enemy rank 4."** Front-loading is a strategy, not an
 *   oversight. A Lunge quartet kills the front rank and lets the back line
 *   walk forward into the knives.
 * - **"N of 4 skills unusable from rank R."** Even read against every rank the
 *   party can shuffle itself into, this still fired on 24 preset comps — and
 *   looking at them, it should. Four Crusaders all carrying Holy Lance is one
 *   loadout copied four times, and the one in front holds it for the round an
 *   enemy knocks them back. A skill kept for a position you do not start in is
 *   ordinary play, not a mistake, and the place to mention it is on the skill
 *   itself in the hero's own panel — where `heroRankReport` still reports it —
 *   rather than as a party-level alarm.
 */
export const rankWarnings = (heroes) => {
  const report = partyRankReport(heroes);

  return report.strandedHeroes.map((entry) => ({
    kind: 'stranded',
    index: entry.index,
    heroClass: entry.heroClass,
    rank: entry.rank,
    text: `${entry.heroClass} can use none of their ${
      entry.usable.length + entry.situational.length + entry.unusable.length
    } skills from rank ${entry.rank}.`
  }));
};
