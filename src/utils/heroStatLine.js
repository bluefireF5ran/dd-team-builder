/**
 * What a hero's numbers actually come out as, once you dress them.
 *
 * The app could already say a trinket grants `+15% DODGE`, and could never say
 * what the hero's dodge *was*, so the one number you are really choosing
 * between was the one thing never on screen. `heroStats.js` supplies the base;
 * this adds what the hero is wearing and what they are stuck with.
 *
 * ## Two kinds of number, and mixing them is the whole trap
 *
 * `+10 DODGE` adds ten points. `+15% MAX HP` multiplies the base. The game
 * writes both with the same shape and only the `%` tells them apart, which is
 * why `parseClause` now keeps that flag.
 *
 * And the `%` alone is not enough either: **PROT and CRIT are measured in
 * percent and still add as points.** A `+10% PROT` trinket on a 0 PROT hero
 * gives 10, not 0 × 1.1. `MULTIPLIES` is the short list of stats where a
 * percentage really is a multiplier - MAX HP and DMG - and everything else adds.
 *
 * ## What it deliberately leaves out
 *
 * - **Conditional clauses** (`+25% DMG if in position 4`, `vs Beast`). They are
 *   real and they are not always on; folding them into a flat number would
 *   state something false three quarters of the time. They are counted and
 *   reported separately so the UI can say "and 3 conditional".
 * - **Skill-scoped clauses** (`+18% DMG Melee Skills`), for the same reason:
 *   it is half a kit, not the hero.
 * - **ACC.** There is no base to add to - `weapon.atk` is 0% on all twenty
 *   classes and the accuracy progression lives in the skill. See
 *   `importHeroStats.js`.
 * - **Resistances beyond the base.** The game raises them with resolve level
 *   and that increment is in no game file, so the base is all anyone can
 *   honestly show.
 */

import { HERO_STATS, getHeroStats, getGearStats, MAX_GEAR_RANK } from '../data/heroStats';
import { parseClause } from './trinketProfile';
import { getTrinketEffect } from '../data/trinketEffects';
import { getModdedTrinketEffect } from '../data/moddedEffects';
import { getQuirkEffect } from '../data/quirkEffects';

/** The stats where a percentage is a multiplier rather than points. */
const MULTIPLIES = new Set(['max hp', 'dmg']);

/** Clause wording -> the stat it lands on. */
const STAT_OF = {
  'max hp': 'hp',
  dodge: 'dodge',
  prot: 'prot',
  spd: 'spd',
  crit: 'crit',
  dmg: 'dmg',
};

/** Resistance clauses, e.g. "stun resist". */
const RESIST_OF = {
  'stun resist': 'stun',
  'blight resist': 'blight',
  'bleed resist': 'bleed',
  'disease resist': 'disease',
  'move resist': 'move',
  'debuff resist': 'debuff',
  'death blow resist': 'death',
  'trap resist': 'trap',
};

const clausesOf = (text) =>
  typeof text === 'string' ? text.split(' | ').map((c) => c.trim()).filter(Boolean) : [];

const trinketEffectText = (name) => {
  const found = getTrinketEffect(name) || getModdedTrinketEffect(name);
  return found ? found.effect : '';
};

const quirkEffectText = (name) => {
  const found = getQuirkEffect(name);
  return found ? found.effect : '';
};

/**
 * Everything the hero is carrying that could move a number, as one list of
 * `{ source, name, clause }`. Keeping the source is what lets the UI say where
 * a number came from instead of presenting a total nobody can check.
 */
export const statSources = (hero) => {
  const h = hero || {};
  const out = [];
  const add = (source, name, text) => {
    if (!name) return;
    clausesOf(text).forEach((clause) => out.push({ source, name, clause }));
  };
  add('trinket', h.trinket1, trinketEffectText(h.trinket1));
  add('trinket', h.trinket2, trinketEffectText(h.trinket2));
  (h.quirks?.positive || []).forEach((q) => add('quirk', q, quirkEffectText(q)));
  (h.quirks?.negative || []).forEach((q) => add('quirk', q, quirkEffectText(q)));
  (h.diseases || []).forEach((d) => add('disease', d, quirkEffectText(d)));
  return out;
};

const round = (n) => Math.round(n * 10) / 10;

/**
 * A hero's numbers: the base, the modifiers, and the total.
 *
 * @param {object} hero  a hero slot ({heroClass, trinket1, trinket2, quirks, diseases})
 * @param {{rank?: number}} [options]  gear rank, 0..4; defaults to fully upgraded
 * @returns {null|{
 *   base: object, total: object, resistances: object,
 *   applied: Array, skipped: {conditional: number, scoped: number, unknown: number}
 * }}  null when the class has no stats at all - a modded hero nobody has
 *     imported is UNKNOWN, and drawing zeroes would say it has no health.
 */
export const heroStatLine = (hero, { rank = MAX_GEAR_RANK } = {}) => {
  const stats = getHeroStats(hero?.heroClass);
  const gear = getGearStats(hero?.heroClass, rank);
  if (!stats || !gear) return null;

  const base = {
    hp: gear.hp ?? 0,
    dodge: gear.dodge ?? 0,
    prot: gear.prot ?? 0,
    spd: gear.spd ?? 0,
    crit: gear.crit ?? 0,
    dmgMin: gear.dmgMin ?? 0,
    dmgMax: gear.dmgMax ?? 0,
  };

  // Puntos y multiplicadores se acumulan por separado y se aplican al final:
  // dos trinkets con +10% MAX HP dan +20% sobre la base, no un 10% sobre el
  // resultado del otro, que es como el juego los suma.
  const points = { hp: 0, dodge: 0, prot: 0, spd: 0, crit: 0, dmg: 0 };
  const scale = { hp: 0, dmg: 0 };
  const resistances = { ...stats.resistances };
  const applied = [];
  const skipped = { conditional: 0, scoped: 0, unknown: 0 };

  statSources(hero).forEach(({ source, name, clause }) => {
    const parsed = parseClause(clause);
    if (!parsed) { skipped.unknown += 1; return; }
    if (parsed.conditional) { skipped.conditional += 1; return; }
    if (parsed.scoped) { skipped.scoped += 1; return; }

    const resist = RESIST_OF[parsed.base];
    if (resist) {
      if (resistances[resist] !== undefined) resistances[resist] += parsed.amount;
      applied.push({ source, name, clause, stat: resist });
      return;
    }

    const stat = STAT_OF[parsed.base];
    if (!stat) { skipped.unknown += 1; return; }

    if (parsed.percent && MULTIPLIES.has(parsed.base)) scale[stat] += parsed.amount;
    else points[stat] += parsed.amount;
    applied.push({ source, name, clause, stat });
  });

  /**
   * **MAX HP y el daño del heroe se redondean HACIA ARRIBA**, no al entero mas
   * cercano. Es la regla del juego y no una preferencia: un Cruzado de 61 con
   * +25% tiene 77 de vida, no 76, y con -15% de daño pega 17 y no 16. Media
   * vida y un punto de daño por heroe es justo el tamaño de error que nadie ve
   * y que hace desconfiar de toda la ficha.
   *
   * Las demas son sumas de enteros y no necesitan regla; `round` esta por si
   * alguna clausula trae un decimal.
   */
  const total = {
    hp: Math.ceil(base.hp * (1 + scale.hp / 100) + points.hp),
    dodge: round(base.dodge + points.dodge),
    prot: round(base.prot + points.prot),
    spd: round(base.spd + points.spd),
    crit: round(base.crit + points.crit),
    dmgMin: Math.ceil(base.dmgMin * (1 + scale.dmg / 100) + points.dmg),
    dmgMax: Math.ceil(base.dmgMax * (1 + scale.dmg / 100) + points.dmg),
  };

  return { base, total, resistances, applied, skipped };
};

/** The stats a card shows, in the order a player reads them. */
export const STAT_ORDER = [
  { key: 'hp', label: 'HP' },
  { key: 'dodge', label: 'DODGE' },
  { key: 'prot', label: 'PROT', suffix: '%' },
  { key: 'spd', label: 'SPD' },
  { key: 'crit', label: 'CRIT', suffix: '%' },
];

/**
 * Donde cae cada estadistica dentro de lo que el roster ofrece.
 *
 * Un numero solo no dice nada a quien no se sabe el juego de memoria: 61 de
 * vida ¿es mucho? La respuesta esta en el propio roster, asi que el rango se
 * mide, no se inventa -- minimo y maximo de las veinte clases vanilla al mismo
 * rango de equipo.
 *
 * **Las clases modded no entran en la regla.** Un mod puede traer un heroe con
 * 200 de vida y aplastaria la escala entera, dejando a las veinte vanilla
 * amontonadas contra el cero. La vara de medir es el juego; un heroe modded se
 * dibuja contra ella y puede salirse por arriba, que es informacion y no un
 * error.
 */
const spreadCache = new Map();

export const statSpread = (rank = MAX_GEAR_RANK) => {
  const key = String(rank);
  if (spreadCache.has(key)) return spreadCache.get(key);

  const keys = ['hp', 'dodge', 'prot', 'spd', 'crit', 'dmgMin', 'dmgMax'];
  const out = {};
  keys.forEach((k) => { out[k] = { min: Infinity, max: -Infinity }; });

  Object.keys(HERO_STATS).forEach((cls) => {
    const gear = getGearStats(cls, rank);
    if (!gear) return;
    keys.forEach((k) => {
      const v = gear[k];
      if (typeof v !== 'number') return;
      if (v < out[k].min) out[k].min = v;
      if (v > out[k].max) out[k].max = v;
    });
  });

  keys.forEach((k) => {
    if (!Number.isFinite(out[k].min)) out[k] = { min: 0, max: 0 };
  });
  spreadCache.set(key, out);
  return out;
};

/**
 * 0..1 dentro del rango del roster, o null si no hay rango que comparar.
 *
 * Se recorta a los extremos: un heroe modded fuera de escala se dibuja lleno o
 * vacio en vez de desbordar la barra, y el numero de al lado sigue diciendo la
 * verdad.
 */
export const statPosition = (statKey, value, rank = MAX_GEAR_RANK) => {
  const range = statSpread(rank)[statKey];
  if (!range || typeof value !== 'number') return null;
  if (range.max === range.min) return null;
  return Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min)));
};

