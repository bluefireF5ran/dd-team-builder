/**
 * What one trinket is worth on one hero, with the reasons that say why.
 *
 * Each clause becomes `units x weight x condition`:
 *
 * - **units**: the clause's size over the median size that stat takes across
 *   the trinket corpus (`statScale`), so +10 DODGE and +20% MAX HP compare.
 *   A downside is negative units: `LOWER_IS_BETTER` knows `+10% Stress` is bad.
 *   A "Melee Skills" or "Ranged Skills" clause counts for the share of the
 *   hero's damaging skills of that type.
 * - **weight**: what that stat is worth on THIS hero (`heroNeeds`), scaled by
 *   the build goal it serves, in Fran's order: sustain > reaching thresholds >
 *   synergy > damage > everything else.
 * - **condition**: how often the clause is actually on. Torch-above counts, as
 *   the stat bars do (a party runs radiant). Inventory conditions count. A
 *   position clause counts as far as the hero stays there. "vs Beast" and
 *   friends sit below the generic stats, as Fran asked.
 *
 * Downsides use the same weights, which is what makes Focus Ring the worst
 * thing to hand an Antiquarian (-8 DODGE on a dodge tank) and a fine one for a
 * Hellion (the ACC and CRIT pay for the dodge she loses).
 */
import { getTrinketEffect } from '../data/trinketEffects';
import { getModdedTrinketEffect, getTrinketSet } from '../data/moddedEffects';
import { LOWER_IS_BETTER, statScale } from './trinketProfile';
import { canonicalizeTrinket, nameKey } from './nameNormalizer';
import { DODGE_TANK_BAR, DODGE_EXTREME_BAR } from './heroNeeds';

/** Build-goal multipliers: Fran's priority order. */
const SUSTAIN = 1.4;
const THRESHOLD = 1.25;
const SYNERGY = 1.15;
const GENERAL = 0.8;

/** At or above this a trinket is "generically useful" (tier 5). */
export const USEFUL_VALUE = 0.6;
/** Above this, and below useful, a trinket is "net positive" (tier 6). */
export const NET_POSITIVE_VALUE = 0.05;
/** A party with this much scouting from trinkets has its map. */
export const SCOUTING_SERVED = 20;

const CONDITION = / (?:if|vs|while|when|per|on|against) .*$/i;
const SKILL_SCOPE = / (Melee|Ranged) Skills$/i;
const MAX_UNITS = 3;

const effectOf = (name) => {
  const canonical = canonicalizeTrinket(name);
  return (
    getTrinketEffect(canonical) || getModdedTrinketEffect(canonical) ||
    getTrinketEffect(name) || getModdedTrinketEffect(name) || null
  );
};

/** `+10 ACC Ranged Skills if Torch above 75` -> { base, amount, condition, scope }. */
const readClause = (clause) => {
  const match = /^([+-])([\d.]+)(%?)\s+(.+)$/.exec(clause);
  if (!match) return null;
  const [, sign, digits, , rest] = match;
  const amount = Number(digits);
  if (!Number.isFinite(amount)) return null;
  const condition = (rest.match(CONDITION) || [''])[0].trim();
  const bare = rest.replace(CONDITION, '');
  const scopeMatch = SKILL_SCOPE.exec(bare);
  const base = bare.replace(SKILL_SCOPE, '').trim().toLowerCase();
  return base
    ? { base, amount: sign === '-' ? -amount : amount, condition, scope: scopeMatch ? scopeMatch[1].toLowerCase() : null }
    : null;
};

const clausesOf = (text) =>
  typeof text === 'string' ? text.split(' | ').map((c) => c.trim()).filter(Boolean) : [];

/** Total scouting chance a trinket gives, for the party-level cap. */
export const scoutingOf = (name) =>
  clausesOf(effectOf(name)?.effect)
    .map(readClause)
    .filter((c) => c && c.base === 'scouting chance' && !c.condition)
    .reduce((total, c) => total + c.amount, 0);

/** How much of the time a "if in position N" clause is on for this hero. */
const positionFactor = (needs, wanted) => {
  const usable = needs.usableAt[wanted - 1] || 0;
  if (usable < Math.min(3, needs.skillCount)) {
    return { factor: 0.2, note: `few of its skills work from rank ${wanted}` };
  }
  if (needs.rank && needs.rank !== wanted) return { factor: 0.25, note: `it sits in rank ${needs.rank}` };
  if (needs.roles.dancer) return { factor: 0.5, note: `it moves, so rank ${wanted} only half the time` };
  return { factor: 1 };
};

const PARTY_STATES = { marked: 'mark', stunned: 'stun', bleeding: 'bleed', blighted: 'blight', stealthed: 'stealth' };

const conditionFactor = (condition, needs, context) => {
  if (!condition) return { factor: 1 };
  const text = condition.toLowerCase();
  if (/in inventory/.test(text)) return { factor: 1 };
  if (/torch above/.test(text)) return context.lowTorch ? { factor: 0.3, note: 'torch kept low' } : { factor: 1 };
  if (/torch below/.test(text)) return context.lowTorch ? { factor: 1 } : { factor: 0.25, note: 'only in low light' };
  const position = /in position (\d)/.exec(text);
  if (position) return positionFactor(needs, Number(position[1]));
  if (/while marked/.test(text)) {
    return needs.roles.markSelf ? { factor: 0.8 } : { factor: 0.3, note: 'only while marked' };
  }
  if (/stealth/.test(text)) {
    return needs.roles.stealth ? { factor: 0.7 } : { factor: 0.15, note: 'only in stealth' };
  }
  const state = /vs (marked|stunned|bleeding|blighted|stealthed)/.exec(text);
  if (state) {
    return context.partyTags?.has(PARTY_STATES[state[1]])
      ? { factor: 0.5, note: `vs ${state[1]}, which the party sets up` }
      : { factor: 0.15, note: `only vs ${state[1]}` };
  }
  return { factor: /^vs /.test(text) ? 0.3 : 0.35, note: `only ${text}` };
};

const dotWeight = (kind, needs) => {
  const { roles } = needs;
  if (roles[`${kind}Primary`]) {
    // A dodge tank that also blights spends its trinkets on staying alive.
    return { weight: 1.1 * THRESHOLD * (roles.dodgeTank ? 0.4 : 1), goal: `${kind} damage` };
  }
  return { weight: roles[`${kind}Any`] ? 0.15 : 0 };
};

/** What one unit of `base` is worth on this hero. */
const weightOf = (base, needs, context) => {
  const { roles } = needs;
  const afterFirst = / after first round$/.exec(base);
  if (afterFirst) {
    const inner = weightOf(base.replace(/ after first round$/, ''), needs, context);
    return { ...inner, weight: inner.weight * 0.8 };
  }
  if (/ at death's door$/.test(base)) return { weight: 0.1 };

  switch (base) {
    case 'dodge':
      if (roles.dodgeTank) return { weight: 1.3 * SUSTAIN, goal: 'dodge sustain' };
      // A riposte hero wants to stay up to riposte (Fran): DODGE or HP.
      if (roles.riposte) return { weight: 0.7, goal: 'riposte sustain' };
      return { weight: needs.position.dodge >= 0.6 ? 0.7 : 0.35 };
    case 'max hp':
    case 'prot':
      if (roles.tank) {
        return { weight: 0.9 * (roles.selfHealSustain ? SUSTAIN : 1), goal: roles.selfHealSustain ? 'self-heal sustain' : 'frontline' };
      }
      if (roles.riposte) return { weight: 0.5, goal: 'riposte sustain' };
      return { weight: 0.2 * GENERAL };
    case 'acc': {
      const threshold = needs.accNeed >= 0.4 && (roles.debuff || roles.stun);
      return {
        weight: (0.2 + 0.9 * needs.accNeed) * (roles.attacker ? 1 : 0.3) * (threshold ? THRESHOLD : 1),
        goal: needs.accNeed >= 0.4 ? 'accuracy' : null
      };
    }
    case 'crit': {
      const weight = 0.3 + 0.8 * needs.damage * (0.5 + needs.rollWidth);
      // A riposte can crit.
      if (roles.riposte) return { weight: weight + 0.3, goal: 'riposte' };
      return { weight, goal: needs.damage >= 0.55 ? 'damage' : null };
    }
    case 'dmg':
      // A riposte hits with the hero's damage bonus, so it is worth DMG even
      // when the hero's own skills are not the hardest hitters.
      if (roles.riposte) return { weight: Math.max(1.1 * needs.damage, 0.8), goal: 'riposte' };
      return { weight: 1.1 * needs.damage, goal: needs.damage >= 0.55 ? 'damage' : null };
    case 'spd': {
      // A kit that does many jobs wants to act first more than most: Man at Arms
      // "craves +SPD, especially given his middling base value" (dossier), with
      // stuns, guards, buffs, debuffs and ripostes all wanting the first turn.
      const threshold = roles.stun >= 2 || roles.blightPrimary || roles.utilityBreadth >= 3;
      // Supports and stunners act before the enemy; a riposte hero sets the
      // riposte up before the enemy starts hitting.
      const early = roles.support || roles.stun || roles.riposte || roles.guardAlly;
      return {
        weight: (early ? 0.8 : 0.45) * (threshold ? THRESHOLD : 1),
        goal: roles.utilityBreadth >= 3 ? 'a kit that wants to go first' : roles.riposte ? 'riposte first' : null
      };
    }
    case 'stun skill chance':
    case 'stun/daze skill chance':
      return roles.stun
        ? { weight: (0.5 + 0.3 * Math.min(roles.stun, 2)) * (roles.stun >= 2 ? THRESHOLD : 1) * (roles.dodgeTank ? 0.6 : 1), goal: 'stun' }
        : { weight: 0 };
    case 'blight skill chance':
      return dotWeight('blight', needs);
    case 'bleed skill chance':
      return dotWeight('bleed', needs);
    case 'debuff skill chance':
      return roles.debuff ? { weight: 0.5 + 0.35 * Math.min(roles.debuff, 2), goal: 'debuffs' } : { weight: 0 };
    case 'move skill chance':
      return { weight: roles.enemyMove ? 0.35 : 0 };
    case 'healing skills':
    case 'healing':
      if (roles.partyHealSustain) return { weight: 1.1 * SUSTAIN, goal: 'party-heal sustain' };
      return { weight: roles.allyHeal || roles.selfHeal ? 0.45 : 0 };
    case 'stress skills':
      return { weight: roles.stressHeal ? 0.5 : 0 };
    case 'stress':
      // Reactive: good, but never good enough to lead with.
      return { weight: 0.3 };
    case 'stress heal received':
      return { weight: 0.15 };
    case 'stress dealt':
      return { weight: 0.1 };
    case 'virtue chance':
    case 'death blow resist':
      return { weight: 0.12 };
    case 'healing received':
      return { weight: roles.tank || roles.selfHeal ? 0.4 : 0.3 };
    case 'scouting chance':
      // Really good, but to a point: one strong scouting trinket serves the party.
      return context.partyScouting >= SCOUTING_SERVED
        ? { weight: 0.05, note: 'the party already scouts' }
        : { weight: 0.45, goal: 'scouting' };
    case 'chance monsters surprised':
    case 'chance party surprised':
      return context.partyScouting >= SCOUTING_SERVED ? { weight: 0.05 } : { weight: 0.35 };
    case 'stun resist':
      // A stunned guard stops guarding and a stunned riposte stops riposting.
      if (roles.guardAlly || roles.riposte) return { weight: 0.5, goal: roles.guardAlly ? 'keeps guarding' : 'keeps riposting' };
      return { weight: 0.12 };
    case 'blight resist':
    case 'bleed resist':
    case 'disease resist':
    case 'debuff resist':
    case 'move resist':
      return { weight: 0.12 };
    case 'trap disarm chance':
      return { weight: 0.08 };
    case 'guard duration':
      return { weight: roles.guardAlly ? 0.4 : 0.05 };
    case 'burn skill amount':
      return { weight: 0.5 };
    case 'blight duration':
      return { weight: roles.blightPrimary ? 0.5 : 0 };
    case 'food consumed':
      return { weight: 0.03 };
    case 'resolve xp':
    case 'shards given':
      return { weight: 0.02 };
    default:
      return { weight: 0.1 };
  }
};

const round2 = (n) => Math.round(n * 100) / 100;

/** What a clause's melee/ranged scope leaves of it on this hero. */
const scopeShare = (needs, scope) => {
  if (!scope) return 1;
  const share = needs.damageShare?.[scope];
  return typeof share === 'number' ? share : 0.7;
};

/**
 * @param {string} name  trinket
 * @param {object} needs `heroNeeds` of the hero wearing it
 * @param {{lowTorch?: boolean, partyScouting?: number, partyTags?: Set<string>,
 *   currentDodge?: number, otherTrinket?: string, available?: (name: string) => boolean}} [context]
 * @returns {{name: string, value: number, reasons: string[], known: boolean}}
 */
export const trinketValue = (name, needs, context = {}) => {
  const entry = effectOf(name);
  if (!entry || !needs) return { name, value: 0, reasons: [], known: false };
  const scale = statScale();

  const parts = [];
  let dodgeGain = 0;
  clausesOf(entry.effect).forEach((clause) => {
    const read = readClause(clause);
    if (!read) return;
    const polarity = LOWER_IS_BETTER.has(read.base) ? -1 : 1;
    const units = Math.min(MAX_UNITS, Math.abs(read.amount) / (scale.get(read.base) || 1)) *
      Math.sign(read.amount) * polarity * scopeShare(needs, read.scope);
    const { weight, goal, note: weightNote } = weightOf(read.base, needs, context);
    const { factor, note } = conditionFactor(read.condition, needs, context);
    const contribution = units * weight * factor;
    if (read.base === 'dodge' && !read.scope) dodgeGain += read.amount * factor;
    if (contribution !== 0) {
      parts.push({ clause, contribution, why: goal || note || weightNote || null });
    }
  });

  // Crossing a DODGE bar is worth more than the points themselves.
  if (needs.roles.dodgeTank && dodgeGain > 0 && typeof context.currentDodge === 'number') {
    const before = context.currentDodge;
    const after = before + dodgeGain;
    [[DODGE_TANK_BAR, 'dodge tank'], [DODGE_EXTREME_BAR, 'extreme dodge']].forEach(([bar, label]) => {
      if (before < bar && after >= bar) {
        parts.push({ clause: `reaches DODGE ${bar}`, contribution: 0.6, why: label });
      }
    });
  }

  let value = parts.reduce((total, part) => total + part.contribution, 0);

  // A class trinket is the synergy tier of Fran's order.
  if (needs.classTrinkets.has(name) && value > 0) {
    value *= SYNERGY;
    parts.push({ clause: 'class trinket', contribution: 0, why: 'synergy' });
  }

  // A set bonus counts when its partner is on, and half when the partner is
  // still there to take: it has to beat what the partner slot would otherwise hold.
  const set = getTrinketSet(name);
  if (set) {
    const partner = set.members.find((member) => nameKey(member) !== nameKey(name));
    const bonus = clausesOf(set.bonus).map(readClause).filter(Boolean).reduce((total, read) => {
      const polarity = LOWER_IS_BETTER.has(read.base) ? -1 : 1;
      const units = Math.min(MAX_UNITS, Math.abs(read.amount) / (scale.get(read.base) || 1)) *
        Math.sign(read.amount) * polarity * scopeShare(needs, read.scope);
      return total + units * weightOf(read.base, needs, context).weight * conditionFactor(read.condition, needs, context).factor;
    }, 0);
    if (bonus > 0 && partner) {
      if (nameKey(context.otherTrinket) === nameKey(partner)) {
        value += bonus;
        parts.push({ clause: `${set.label} with ${partner}`, contribution: bonus, why: 'set bonus' });
      } else if (!context.otherTrinket && context.available?.(partner)) {
        value += bonus / 2;
        parts.push({ clause: `${set.label} if paired with ${partner}`, contribution: bonus / 2, why: 'set bonus' });
      }
    }
  }

  const reasons = [...parts]
    .filter((part) => Math.abs(part.contribution) >= 0.05 || part.contribution === 0)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3)
    .map((part) => {
      const amount = part.contribution ? ` ${part.contribution > 0 ? '+' : ''}${round2(part.contribution)}` : '';
      return `${part.clause}${part.why ? ` (${part.why})` : ''}${amount}`;
    });

  return { name, value: round2(value), reasons, known: true };
};
