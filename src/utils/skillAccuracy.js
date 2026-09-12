/**
 * What a skill's ACC actually is for the hero holding it, and when there is none.
 *
 * ## The skills that cannot miss
 *
 * Thirty-five of the 140 vanilla skills read `ACC 1000%`, and that is not a
 * number anybody should see. It is how the source writes *"this makes no attack
 * roll"* — every one of the 35 also carries `dmg -100%` and no CRIT, and they
 * are the heals, the buffs, the guards and the self-moves. Printing `1000%`
 * invites a player to compare it with the 105% next to it.
 *
 * **The game's own files agree and say it more plainly**: in
 * `<hero>.info.darkest` these same skills carry `.atk 0%`, and nothing in the
 * base game exceeds 500%. `effectRender.renderSkills` already reads that and
 * emits `acc: null`. The 1000% arrives only through the **wiki CSV** that the
 * combat half of `skillEffects.js` comes from, so it is a quirk of that source
 * rather than of the game — which is why the fix lives here, at the point of
 * reading, instead of in a generated file nobody can rebuild without the CSV.
 *
 * One skill is typed as support and is not one: the CSV files Musketeer's
 * `Aimed Shot` as `Ally/Team` while giving it `115%` and `+0% DMG`. The
 * threshold sidesteps it — reading the ACC rather than the type is what makes
 * the rule survive a mislabelled row.
 *
 * ## What the hero does to it
 *
 * A skill's printed ACC is its own; the hero's trinkets and quirks move it, and
 * before this nothing showed that. `+8 ACC` on a ring is the difference between
 * a 95% skill and a 103% one, and the card never said so.
 *
 * The same goes for the `... Skill Chance` clauses, which are the other half of
 * whether a skill lands: `+10% Stun Skill Chance` only matters on a skill that
 * stuns, and `skillProfile`'s tags are what say which ones do.
 */

import { parseClause } from './trinketProfile';
import { skillProfile } from './skillProfile';
import { statSources } from './heroStatLine';

/**
 * At or above this, the ACC is a sentinel rather than a number.
 *
 * 500 and not 1000 because one modded skill writes 500% for the same idea, and
 * because nothing in the base game's own files goes anywhere near it — the
 * highest real accuracy in the game is in the 120s.
 */
export const ALWAYS_HITS_AT = 500;

const asNumber = (value) => {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
};

/**
 * Does this skill roll to hit at all?
 *
 * Two ways to be told no, because the two sources say it differently: the
 * install writes no ACC at all (`renderSkills` emits null) and the wiki CSV
 * writes the sentinel.
 */
export const skillAlwaysHits = (entry) => {
  if (!entry || entry.kind === 'camp') return false;
  const acc = asNumber(entry.acc);
  return acc === null ? false : acc >= ALWAYS_HITS_AT;
};

// `+10 ACC Melee Skills` is half a kit. `parseClause` folds the scope away and
// only says THAT it was scoped, so the side is read off the raw clause.
const scopeOf = (clause) => {
  if (/melee/i.test(clause)) return 'Melee';
  if (/ranged/i.test(clause)) return 'Ranged';
  return null;
};

/**
 * The ACC a skill has in this hero's hands.
 *
 * @returns {null|{alwaysHits: boolean, base: number|null, delta: number,
 *   total: number|null, sources: Array<{name: string, amount: number, scope: string|null}>}}
 */
export const skillAccuracy = (entry, hero) => {
  if (!entry || entry.kind === 'camp') return null;
  if (skillAlwaysHits(entry)) return { alwaysHits: true, base: null, delta: 0, total: null, sources: [] };

  const base = asNumber(entry.acc);
  if (base === null) return null;

  const sources = [];
  let delta = 0;
  statSources(hero).forEach(({ name, clause }) => {
    const parsed = parseClause(clause);
    if (!parsed || parsed.base !== 'acc') return;
    // A conditional ACC clause is real and is not always on; it is left out of
    // the total for the same reason `heroStatLine` leaves them out.
    if (parsed.conditional) return;
    const scope = parsed.scoped ? scopeOf(clause) : null;
    // A melee bonus does nothing for a ranged skill.
    if (scope && entry.type && scope !== entry.type) return;
    delta += parsed.amount;
    sources.push({ name, amount: parsed.amount, scope });
  });

  return { alwaysHits: false, base, delta, total: base + delta, sources };
};

/**
 * `... Skill Chance` and `... Skill Amount` clauses, matched to the skill.
 *
 * Each one maps onto a tag `skillProfile` really emits — checked against the
 * vanilla roster, which produces `debuff`, `enemyMove`, `stun`, `bleed` and
 * `blight` among others.
 *
 * `move skill chance` deliberately matches `enemyMove` and not `selfMove`: the
 * chance is the roll against the target's move resist, and walking yourself
 * backwards does not roll against anything.
 *
 * **`burn skill amount` is the one still unmatched**, and it is the only one:
 * `skillProfile` has no `burn` tag, so the Runaway's burn skills cannot be
 * identified. Adding one means touching the tag vocabulary that `partyCoverage`
 * and `scoreParty` read, which would move comp generation as a side effect —
 * worth doing on purpose, not in passing.
 */
const CHANCE_TAGS = [
  [/^stun(\/daze)? skill (chance|amount)$/, 'stun', 'Stun'],
  [/^bleed skill (chance|amount)$/, 'bleed', 'Bleed'],
  [/^blight skill (chance|amount)$/, 'blight', 'Blight'],
  [/^move skill (chance|amount)$/, 'enemyMove', 'Move'],
  [/^debuff skill (chance|amount)$/, 'debuff', 'Debuff'],
];

/**
 * The chance bonuses that land on this particular skill.
 *
 * @returns {Array<{label: string, amount: number, sources: string[]}>}
 */
export const skillChanceBonuses = (entry, heroClass, skillName, hero) => {
  if (!entry || entry.kind === 'camp') return [];
  const profile = skillProfile(heroClass, skillName);
  if (!profile) return [];

  const byLabel = new Map();
  statSources(hero).forEach(({ name, clause }) => {
    const parsed = parseClause(clause);
    if (!parsed || parsed.conditional) return;
    const match = CHANCE_TAGS.find(([re]) => re.test(parsed.base));
    if (!match) return;
    const [, tag, label] = match;
    if (!profile.tags.has(tag)) return;
    const row = byLabel.get(label) || { label, amount: 0, sources: [] };
    row.amount += parsed.amount;
    if (!row.sources.includes(name)) row.sources.push(name);
    byLabel.set(label, row);
  });
  return [...byLabel.values()];
};
