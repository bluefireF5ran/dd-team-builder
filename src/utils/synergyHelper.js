/**
 * Notes about a party, in the panel under the composition.
 *
 * ## What this used to say, and why it was wrong
 *
 * Run the old version over the 177 preset comps in `data/presetComps` — comps
 * that are, by construction, teams that work — and 170 of them came back with
 * something to complain about. That is not a warning system, it is a light
 * that is always on:
 *
 * | fired on | note |
 * | --- | --- |
 * | 167 comps | "N of 4 skills unusable from rank R" |
 * | 107 comps | "Mark synergy detected!" |
 * | 50 comps | "Duplicate class: …" |
 * | 31 comps | "No stress healer — long dungeons may be risky" |
 * | 23 comps | "No dedicated healer" |
 * | 4 comps | "Multiple healers — team may lack damage" |
 *
 * Each one was wrong in its own way. The rank lines judged skills against the
 * rank a hero starts in, which is not where they fight — that is fixed at the
 * source, in `rankValidity`. The rest were heuristics over class names:
 *
 * - **Duplicate class** is a *strategy*. Ballad Quartet is four Jesters and
 *   Cross Quartet is four Crusaders, and the repetition is the whole point.
 * - **No dedicated healer** looked for a Vestal or an Occultist by name.
 *   Twenty-three presets bring neither and are fine; a Houndmaster's Lick
 *   Wounds, a Flagellant, or simply killing things faster are all answers.
 * - **Multiple healers — team may lack damage** is an opinion, and not a
 *   widely held one.
 * - **No stress healer** counted Leper as a stress healer (Solemnity only ever
 *   heals the Leper) and did not check that anyone had the skill equipped.
 * - **Mark synergy** fired whenever a marking *class* and a benefiting *class*
 *   were both present, equipped skills unread — a Bounty Hunter and an
 *   Arbalest who between them had neither Mark for Death nor Sniper Shot still
 *   got the congratulations.
 *
 * ## What it says now
 *
 * A **warning** has to be a fact about the build, not a preference about how
 * to play. Only one thing clears that bar: a hero who cannot use a single
 * skill from the rank they are standing in. They will pass their turn, and
 * keep passing until something moves them. That comes from `rankValidity`,
 * which reads the game's own launch data and accounts for the party shuffling
 * itself around. No preset comp trips it, and `synergyHelper.test.js` holds
 * that line.
 *
 * Everything else the panel has to say is an **insight**: something true and
 * good about the party, read off the skills that are actually equipped.
 */
import { rankWarnings } from './rankValidity';
import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { PARTY_CONFIG } from '../constants';

const skillEntry = (heroClass, skillName) =>
  getSkillEffect(skillName, heroClass) || getModdedSkillEffect(skillName, heroClass);

/**
 * Marks an enemy. Read from the effect prose rather than a list of class
 * names, so a DLC or workshop class that marks is picked up for free and the
 * two can never drift apart.
 *
 * The target check is what keeps the Antiquarian's Protect Me out: it says
 * "Mark Target" too, but its target is `ally 1·2·3·4` — it paints the ally it
 * is begging for cover, which is the opposite of an opening.
 */
const marksEnemy = (heroClass, skillName) => {
  const entry = skillEntry(heroClass, skillName);
  if (!entry || entry.kind === 'camp') return false;
  const hitsEnemies = typeof entry.target === 'string' && !/ally|self/i.test(entry.target);
  return hitsEnemies && /Mark Target/i.test(entry.effect || '');
};

/**
 * Hits a marked enemy harder. The `+` matters: the Duelist's Feint also says
 * "vs Marked", but it is `-10 ACC vs Marked` — a penalty the enemy takes for
 * swinging at the Duelist, who marked themselves as bait. That is a different
 * trick and not this one.
 */
const punishesMarked = (heroClass, skillName) => {
  const entry = skillEntry(heroClass, skillName);
  if (!entry || entry.kind === 'camp') return false;
  return /\+\s*\d+(\.\d+)?%\s*(DMG|CRIT)\s*vs\s*Marked/i.test(entry.effect || '');
};

const heroSkills = (hero) => (Array.isArray(hero?.activeSkills) ? hero.activeSkills : []);

/**
 * @returns {{level: 'good'|'danger', warnings: string[], insights: string[], notes: string[]}}
 */
export const analyzeSynergy = (heroes) => {
  const filled = (Array.isArray(heroes) ? heroes : [])
    .slice(0, PARTY_CONFIG.MAX_HEROES)
    .filter((hero) => hero && hero.heroClass);

  // Checked even for a party of one: a Leper dropped into rank 4 is already
  // wrong, and saying so while there is still an empty slot beside them is the
  // useful moment to say it.
  const warnings = rankWarnings(heroes).map((warning) => warning.text);
  const insights = [];

  const markers = new Set();
  const beneficiaries = new Set();
  filled.forEach((hero) => {
    if (heroSkills(hero).some((skill) => marksEnemy(hero.heroClass, skill))) markers.add(hero.heroClass);
    if (heroSkills(hero).some((skill) => punishesMarked(hero.heroClass, skill))) beneficiaries.add(hero.heroClass);
  });

  if (markers.size && beneficiaries.size) {
    insights.push(`Mark synergy: ${[...markers].join(', ')} sets up ${[...beneficiaries].join(', ')}.`);
  }

  return {
    level: warnings.length ? 'danger' : 'good',
    warnings,
    insights,
    notes: [...warnings, ...insights]
  };
};
