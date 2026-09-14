/**
 * What a hero wants from a trinket, read from its kit and its stats.
 *
 * Not a table per class. The skills say what a hero does (`skillProfile` tags:
 * heal, stun, blight, bleed, debuff, self-mark, riposte, moves), and the gear
 * stats say where it stands among the twenty classes. The rules that turn that
 * into a valuation are Fran's, recorded in AGENTS.md under "What a trinket is
 * worth on a hero": lean into strengths instead of patching weaknesses, effect
 * chance only where the hero lives on that effect, ACC and scouting stop paying
 * past a point, CRIT is worth more on a wide damage roll.
 *
 * The one list that is not derived is `DODGE_TANK_CLASSES`: which classes play
 * as dodge tanks is Fran's call, and the kit alone does not say it.
 */
import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { HERO_CLASSES } from '../data/heroes';
import { getModdedHeroClasses } from '../data/moddedRoster';
import { getGearStats, MAX_GEAR_RANK } from '../data/heroStats';
import { districtEffects } from '../data/estate';
import { effectPointWorth } from '../data/enemyResists';
import { skillProfile, splitClauses, scopeOf } from './skillProfile';
import { statPosition } from './heroStatLine';
import { statBreakdown } from './statBreakdown';

/**
 * DODGE at which a hero is a dodge tank, and at which dodge alone is extreme
 * sustain. Measured on champion enemies (2026-09-14): attacks cluster at 102.5%
 * and 112.5% ACC, and a hit lands at ACC + 5 - DODGE, so 85 puts the bulk under
 * a quarter and 95 does the same for the most accurate tenth. The four main
 * regions weigh fully and Courtyard, Darkest Dungeon and Farmstead a fifth.
 */
export const DODGE_TANK_BAR = 85;
export const DODGE_EXTREME_BAR = 95;

/**
 * Champion enemy DODGE by the rank the enemy stands in, measured from the mash
 * tables of the four main regions, whose rows list a group in rank order:
 * ranks 1-2 average 25, ranks 3-4 average 30.
 *
 * The hero dossiers say the same in words. Occultist "wants ACC investments
 * since his skills target all kinds of enemies, including backline enemies with
 * high DODGE", and the Crusader (Holy Lance), Houndmaster, Arbalest and Vestal
 * entries all say it too.
 */
export const FRONT_ENEMY_DODGE = 25;
export const BACK_ENEMY_DODGE = 30;

/**
 * A riposte's own accuracy. It is fixed and does not scale with the skill level
 * (Highwayman 85, Man at Arms 90), but trinkets, quirks and buffs do raise it,
 * which is why the Highwayman dossier says he "strongly wants solid +ACC
 * investments". The lower of the two is used for every riposte hero.
 */
export const RIPOSTE_ACC = 85;

/** Classes Fran plays as dodge tanks (2026-09-14). */
export const DODGE_TANK_CLASSES = new Set([
  'Jester',
  'Houndmaster',
  'Man at Arms',
  'Antiquarian',
  'Duelist',
  'Grave Robber',
  'Bounty Hunter'
]);

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const classData = (heroClass) => HERO_CLASSES[heroClass] || getModdedHeroClasses()[heroClass] || null;
const entryOf = (heroClass, name) => getSkillEffect(name, heroClass) || getModdedSkillEffect(name, heroClass);
const percentOf = (value) => {
  const match = /(-?\d+(?:\.\d+)?)\s*%/.exec(String(value ?? ''));
  return match ? Number(match[1]) : null;
};

// "Blight (140% base),7 pts/rd for 3 rds" and the hand-written "Blight 5/turn (3 rds)".
//
// `pts?` because two skills write it singular, and both are ones that matter:
// the Antiquarian's Festering Vapours ("4 pt/rd") and the Occultist's Wyrd
// Reconstruction ("3 pt/rd"), which is the bleed his heal puts on the ally.
const DOT_PATTERNS = [
  /\b(blight|bleed)\b[^|]*?(\d+(?:\.\d+)?)\s*pts?\/rd\s+for\s+(\d+)\s*rds?/gi,
  /\b(blight|bleed)\s+(\d+(?:\.\d+)?)\s*\/\s*turn\s*\((\d+)\s*rds?\)/gi
];

/** Total damage over time a skill's effect deals, by kind. */
export const dotTotals = (effect) => {
  const totals = { blight: 0, bleed: 0 };
  if (typeof effect !== 'string') return totals;
  DOT_PATTERNS.forEach((pattern) => {
    [...effect.matchAll(pattern)].forEach((match) => {
      totals[match[1].toLowerCase()] += Number(match[2]) * Number(match[3]);
    });
  });
  return totals;
};

/** Expected non-crit damage of one skill at max gear, 0 for a skill that does not hit. */
const skillDamage = (heroClass, gear, name) => {
  const entry = entryOf(heroClass, name);
  const profile = skillProfile(heroClass, name);
  if (!entry || !profile || !profile.tags.has('damage')) return 0;
  const modifier = percentOf(entry.dmg) ?? 0;
  return Math.max(0, ((gear.dmgMin + gear.dmgMax) / 2) * (1 + modifier / 100));
};

/** A hero's damage output: the mean of its two hardest-hitting skills. */
const outputOf = (heroClass, gear, names) => {
  const hits = names.map((name) => skillDamage(heroClass, gear, name)).sort((a, b) => b - a);
  return hits.length ? (hits[0] + (hits[1] || 0)) / 2 : 0;
};

let strongestOutput = null;
/** The best output any vanilla class reaches with its whole kit: the 1.0 of `damage`. */
const topOutput = () => {
  if (strongestOutput === null) {
    strongestOutput = Math.max(
      1,
      ...Object.keys(HERO_CLASSES).map((heroClass) => {
        const gear = getGearStats(heroClass, MAX_GEAR_RANK);
        return gear ? outputOf(heroClass, gear, HERO_CLASSES[heroClass].skills || []) : 0;
      })
    );
  }
  return strongestOutput;
};

/**
 * @param {object} hero  a party slot: `heroClass`, `activeSkills`, trinkets
 * @param {{party?: object[], heroIndex?: number, estate?: boolean|string[]}} [options]
 * @returns {null|object} the hero's needs; see the fields below
 */
export const heroNeeds = (hero, { party = null, heroIndex = -1, estate = true } = {}) => {
  const heroClass = hero?.heroClass;
  const data = classData(heroClass);
  const gear = getGearStats(heroClass, MAX_GEAR_RANK);
  if (!data || !gear) return null;

  const chosen = (hero.activeSkills || []).filter(Boolean);
  const names = chosen.length ? chosen : data.skills || [];
  const skills = names
    .map((name) => ({ name, profile: skillProfile(heroClass, name), entry: entryOf(heroClass, name) }))
    .filter((skill) => skill.profile && skill.entry);
  const count = (test) => skills.filter(test).length;
  const tagged = (tag) => (skill) => skill.profile.tags.has(tag);

  const damaging = skills.filter(tagged('damage'));
  // Every attack against the enemies it can actually reach: a skill that only
  // hits the front two faces DODGE 25, one that reaches the backline 30. A skill
  // that cannot miss writes 1000% and says nothing about accuracy.
  const attacks = damaging
    .map(({ profile, entry }) => ({ acc: percentOf(entry.acc), target: profile.target || [] }))
    .filter((attack) => attack.acc !== null && attack.acc < 500)
    .map(({ acc: value, target }) => ({
      acc: value,
      dodge: target.some((rank) => rank >= 3) ? BACK_ENEMY_DODGE : FRONT_ENEMY_DODGE
    }));
  // A riposte is an attack too, and a poor one: fixed accuracy that trinkets fix.
  if (count(tagged('riposte'))) attacks.push({ acc: RIPOSTE_ACC, dodge: FRONT_ENEMY_DODGE });

  const acc = attacks.length ? attacks.reduce((total, a) => total + a.acc, 0) / attacks.length : null;
  // The estate answers part of the question before the trinkets do. Training
  // Ring's +4 ACC is why the Arbalest dossier says she "doesn't desperately need
  // ACC investments", and it lifts a riposte too, whose own accuracy is fixed.
  const district = districtEffects(heroClass, estate, data.district || null);
  // 0 where an attack already lands 95% of the time, 1 at 80% or less.
  const needOf = ({ acc: value, dodge }) => clamp01((95 - (value + (district.acc || 0) + 5 - dodge)) / 15);
  const accNeed = attacks.length
    ? attacks.reduce((total, attack) => total + needOf(attack), 0) / attacks.length
    : 0;
  /**
   * How often the hero connects at all. Every effect chance sits behind it:
   * Fran's rule is that the blight, stun or debuff rolls only AFTER the attack
   * has hit, so a hero who misses a third of the time gets a third less out of
   * any chance clause. A displayed 95% is a guaranteed hit; 5% is the floor.
   */
  const hitOf = ({ acc: value, dodge }) => {
    const shown = value + (district.acc || 0) + 5 - dodge;
    return shown >= 95 ? 1 : Math.max(0.05, Math.min(1, shown / 100));
  };
  const hitRate = attacks.length
    ? attacks.reduce((total, attack) => total + hitOf(attack), 0) / attacks.length
    : 1;

  // A DoT is what the hero's trinkets are for when it deals at least as much as
  // the hits that carry it (Noxious Blast yes, Hound's Rush no) AND rides on at
  // least half of the hero's damaging skills. Open Vein is real damage, but one
  // skill of four: the Highwayman still wants DMG, CRIT and SPD over bleed chance.
  const dot = { blight: 0, bleed: 0 };
  const dotCarrier = { blight: 0, bleed: 0 };
  const carriers = { blight: 0, bleed: 0 };
  skills.forEach(({ name, entry, profile }) => {
    const totals = dotTotals(entry.effect);
    ['blight', 'bleed'].forEach((kind) => {
      if (totals[kind] <= 0) return;
      dot[kind] += totals[kind];
      dotCarrier[kind] += skillDamage(heroClass, gear, name);
      if (profile.tags.has('damage')) carriers[kind] += 1;
    });
  });
  const dodgeTank = DODGE_TANK_CLASSES.has(heroClass);
  /**
   * A DoT is what the hero's trinkets are for when it deals at least as much as
   * the hits that carry it AND rides on half the kit - and when the hero is not
   * a dodge tank. Fran: blight chance is for "primary DoT dealers (Plague
   * Doctor, Flagellant), not heroes that merely happen to apply one
   * (Houndmaster, Antiquarian: she is a dodge-reliant support, so blight chance
   * is filler)". Both of those are dodge tanks, and a dodge tank's trinkets go
   * to staying alive whatever else the kit does.
   */
  const dotPrimary = (kind) =>
    !dodgeTank && dot[kind] > 0 && dot[kind] >= dotCarrier[kind] &&
    carriers[kind] * 2 >= Math.max(1, damaging.length);

  /**
   * What one more point of a chance is worth to this hero.
   *
   * `Blight (140% base)` is the skill's own roll; the estate adds to it before
   * any trinket does. Against the champion resists (`enemyResists.js`) a point
   * only changes an outcome where the hero is not already guaranteed, so the
   * Athenaeum's 15% is not just 15 more points - it moves the Plague Doctor
   * from a point being worth ~1.0 to ~0.7, and a Blasphemous Vial on top takes
   * it to ~0.4, which is the dossier's "more than enough". Then the hit gate.
   */
  const BASE_CHANCE = /\((\d+(?:\.\d+)?)%\s*base/gi;
  const baseChanceFor = (tag) => {
    let best = null;
    skills.forEach(({ entry, profile }) => {
      if (!profile.tags.has(tag)) return;
      // Only what is rolled at the enemy. The Flagellant's Reclaim reads
      // `Self: Bleed (160% base)`, and that one rolls against HIS OWN bleed
      // resist (Fran), which is a different question from what an enemy-facing
      // chance clause buys - and the reason +Bleed Resist earns a slot on him,
      // handled as `selfDot` below. The fallback scope is `skillProfile`'s own:
      // a clause with no prefix belongs to whatever the skill targets.
      const fallback = profile.targetKind === 'ally' ? 'ally' : profile.targetKind === 'self' ? 'self' : 'target';
      splitClauses(entry.effect).forEach((clause) => {
        if (scopeOf(clause, fallback) !== 'target') return;
        [...clause.matchAll(BASE_CHANCE)].forEach((match) => {
          const value = Number(match[1]);
          if (Number.isFinite(value) && (best === null || value > best)) best = value;
        });
      });
    });
    return best;
  };
  // kind as `enemyResists` names it, the `skillProfile` tag, the district effect.
  const CHANCE_KINDS = [
    ['blight', 'blight', 'blightChance'],
    ['bleed', 'bleed', null],
    ['stun', 'stun', null],
    ['debuff', 'debuff', 'debuffChance'],
    ['move', 'enemyMove', null]
  ];
  const chanceWorth = {};
  CHANCE_KINDS.forEach(([kind, tag, districtKey]) => {
    const base = baseChanceFor(tag);
    // No carrier for it in this kit: there is nothing to be worth anything.
    if (base === null) return;
    chanceWorth[kind] = effectPointWorth(kind, base + (districtKey ? district[districtKey] || 0 : 0)) * hitRate;
  });

  /**
   * A DoT the hero puts on his OWN side, and on whom.
   *
   * Both roll against the resist of the hero who takes them (Fran, 2026-09-14),
   * which is what makes +Bleed Resist a real pick rather than filler: the
   * Flagellant's Reclaim bleeds HIM for 5 a round, and the Occultist's Wyrd
   * Reconstruction bleeds the ALLY it heals. One is paid by the hero wearing
   * the trinket, the other by whoever he heals, so they are kept apart.
   */
  const selfDot = { blight: false, bleed: false };
  const allyDot = { blight: false, bleed: false };
  skills.forEach(({ entry, profile }) => {
    const fallback = profile.targetKind === 'ally' ? 'ally' : profile.targetKind === 'self' ? 'self' : 'target';
    splitClauses(entry.effect).forEach((clause) => {
      const scope = scopeOf(clause, fallback);
      if (scope !== 'self' && scope !== 'ally') return;
      const totals = dotTotals(clause);
      ['blight', 'bleed'].forEach((kind) => {
        if (totals[kind] <= 0) return;
        if (scope === 'self') selfDot[kind] = true;
        else allyDot[kind] = true;
      });
    });
  });

  const allyHeal = count((s) => s.profile.tags.has('heal') && s.profile.targetKind === 'ally');
  const selfHeal = count((s) => s.profile.tags.has('heal') && s.profile.targetKind === 'self');
  const stun = count(tagged('stun'));
  const debuff = count(tagged('debuff'));
  const position = {
    hp: statPosition('hp', gear.hp) ?? 0.5,
    dodge: statPosition('dodge', gear.dodge) ?? 0.5,
    spd: statPosition('spd', gear.spd) ?? 0.5,
    dmg: statPosition('dmgMax', gear.dmgMax) ?? 0.5
  };
  const damage = clamp01(outputOf(heroClass, gear, names) / topOutput());

  // How much of the hero's damage a "Melee Skills" or "Ranged Skills" clause covers.
  const typeShare = (type) =>
    damaging.length ? damaging.filter(({ entry }) => entry.type === type).length / damaging.length : 0;

  const selfHealSustain = selfHeal >= 2 || (selfHeal >= 1 && position.hp >= 0.9);
  const partyHealSustain = allyHeal >= 2;

  const roles = {
    attacker: damaging.length > 0,
    damageDealer: damage >= 0.55,
    allyHeal,
    selfHeal,
    stun,
    debuff,
    blightPrimary: dotPrimary('blight'),
    bleedPrimary: dotPrimary('bleed'),
    blightAny: dot.blight > 0,
    bleedAny: dot.bleed > 0,
    enemyMove: count(tagged('enemyMove')) > 0,
    stressHeal: count(tagged('stressHeal')) > 0,
    markSelf: count(tagged('markSelf')) > 0,
    stealth: count(tagged('stealth')) > 0,
    selfBlight: selfDot.blight,
    selfBleed: selfDot.bleed,
    allyBlight: allyDot.blight,
    allyBleed: allyDot.bleed,
    riposte: count(tagged('riposte')) > 0,
    // Guarding someone ("Guard Ally"), not being guarded ("Force Guard by Ally"
    // on Protect Me) and not ignoring guard ("Bypass Guard").
    guardAlly: count((s) => /\bguard ally\b/i.test(s.entry.effect || '')) > 0,
    dancer: count(tagged('selfMove')) >= 2,
    // A frontline that wants HP and PROT: high HP or marking itself (Fran).
    // Guard is not a test: Protect Me tags the Antiquarian, who is the one being
    // guarded. Riposte is not one either: it made a Highwayman value +20% PROT
    // over his own trinkets. And a dodge tank is not one even when it marks
    // itself: it lives on DODGE, not on HP.
    tank: !dodgeTank && (position.hp >= 0.7 || count(tagged('markSelf')) > 0),
    support: allyHeal > 0 || count(tagged('stressHeal')) > 0 ||
      count((s) => s.profile.targetKind === 'ally' && !s.profile.tags.has('heal')) > 0,
    dodgeTank,
    selfHealSustain,
    partyHealSustain
  };

  // How many different jobs the kit does. Man at Arms stuns, guards, buffs,
  // debuffs and ripostes, and the dossier says he "craves +SPD, even more so
  // than most other heroes": every one of those wants the first turn.
  roles.utilityBreadth = [
    roles.stun > 0,
    roles.debuff > 0,
    roles.guardAlly,
    roles.riposte,
    roles.enemyMove,
    roles.support
  ].filter(Boolean).length;

  // Fran's build goals, highest first. A hero can have several.
  const goals = [];
  if (dodgeTank) goals.push('dodge sustain');
  if (selfHealSustain) goals.push('self-heal sustain');
  if (partyHealSustain) goals.push('party-heal sustain');
  // Occultist lives on two debuffs; Leper's one (Intimidate) counts because he
  // also has to land it.
  if (roles.blightPrimary || roles.bleedPrimary || stun >= 2 || debuff >= 2 || (debuff >= 1 && accNeed >= 0.4)) {
    goals.push('thresholds');
  }
  if (roles.damageDealer) goals.push('damage');

  // Where DODGE gets without trinkets: base, estate, light and the party's own
  // buffs, which is what the trinkets have to top up to reach a bar.
  const bare = { ...hero, trinket1: '', trinket2: '' };
  const team = Array.isArray(party) ? party.map((member, i) => (i === heroIndex ? bare : member)) : null;
  const line = statBreakdown(bare, { party: team, heroIndex, estate });
  const reachableDodge = line ? line.stats.dodge.total + line.stats.dodge.potential : gear.dodge;

  return {
    heroClass,
    rank: heroIndex >= 0 ? heroIndex + 1 : null,
    skills: names,
    skillCount: skills.length,
    gear,
    position,
    acc,
    accNeed,
    hitRate,
    chanceWorth,
    district,
    damage,
    damageShare: { melee: typeShare('Melee'), ranged: typeShare('Ranged') },
    rollWidth: gear.dmgMax > 0 ? (gear.dmgMax - gear.dmgMin) / gear.dmgMax : 0,
    usableAt: [1, 2, 3, 4].map((rank) => count((s) => s.profile.launch.includes(rank))),
    reachableDodge,
    roles,
    goals,
    classTrinkets: new Set(data.classSpecificTrinkets || [])
  };
};
