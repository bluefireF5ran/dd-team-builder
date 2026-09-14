/**
 * De donde sale cada numero de un heroe, por capas, de lo mas fijo a lo mas
 * pasajero: base, Hacienda, luz, trinkets, quirks -- y, aparte, lo que las
 * skills de la party PUEDEN darle.
 *
 * `heroStatLine` contesta "¿cuanto tiene?". Esto contesta "¿de donde sale?", que
 * es lo que Fran pidio dibujar: una barra que se llena hasta la base y sigue
 * empujando con cada fuente en su color, y a rayas lo que es potencial. Su
 * ejemplo es el test:
 *
 *   Jester DODGE  35 base + 3 Académie Duello + 7.5 luz radiante (Cartographer's Camp)
 *                 + 15 Ancestor's Coat + 15 Camouflage Cloak (antorcha > 75)
 *                 + 6 Corvids Grace + 5 Luminous + 5 Evasive  = 91.5
 *                 + 30 a rayas: Solo
 *
 * ## La luz es de la party, no del heroe
 *
 * Una party corre con la antorcha alta salvo que algo pida lo contrario. Si
 * algun heroe lleva un trinket con "if Torch below N", la party va por debajo
 * de N, y entonces ni el +7.5 DODGE del Cartographer's Camp ni el +15 del
 * Camouflage Cloak cuentan -- pero si los "below" y el CRIT de la oscuridad.
 * Solo trinkets: es la regla que dio Fran, y un quirk no decide como se juega.
 *
 * ## Supuestos, dichos
 *
 * - Hacienda completa: todos los distritos construidos.
 * - Dificultad Darkest (`estate.js`).
 * - Equipo al maximo.
 * - Las condiciones que no son de luz (`vs Marked`, `in rank 1`) no se cuentan
 *   y se informan, como en `heroStatLine`.
 * - El potencial de skills es eso, potencial: la suma de lo que TODAS las skills
 *   elegidas de la party pueden dar a este heroe, sin mirar turnos ni rangos. La
 *   misma skill en dos heroes cuenta una vez: es el mismo buff.
 */
import { HERO_STATS, getHeroStats, getGearStats, MAX_GEAR_RANK } from '../data/heroStats';
import { TRINKET_EFFECTS, getTrinketEffect } from '../data/trinketEffects';
import { getModdedTrinketEffect, getModdedSkillEffect } from '../data/moddedEffects';
import { memoByModdedRoster } from '../data/moddedRoster';
import { QUIRK_EFFECTS, getQuirkEffect } from '../data/quirkEffects';
import { HERO_SPECIFIC_TRINKETS, ALL_HERO_SPECIFIC_TRINKETS } from '../data/hero_specific_trinkets';
import { getSkillEffect } from '../data/skillEffects';
import { HERO_CLASSES } from '../data/heroes';
import {
  DIFFICULTY, districtsFor, lightBonus, lightLabel, CARTOGRAPHER_NAME,
} from '../data/estate';
import { parseClause } from './trinketProfile';
import { skillProfile, splitClauses, scopeOf, stripPrefix } from './skillProfile';
import { statColor, statPosition } from './heroStatLine';

export const BAR_STATS = [
  { key: 'hp', label: 'HP', suffix: '' },
  { key: 'dodge', label: 'DODGE', suffix: '' },
  { key: 'prot', label: 'PROT', suffix: '%' },
  { key: 'spd', label: 'SPD', suffix: '' },
  { key: 'crit', label: 'CRIT', suffix: '%' },
  { key: 'dmg', label: 'DMG', suffix: '' },
];
const KEYS = BAR_STATS.map((s) => s.key);
const LABEL = Object.fromEntries(BAR_STATS.map((s) => [s.key, s.label]));

/** Las capas fijas, en el orden en que se apilan. */
export const LAYERS = ['estate', 'light', 'trinket', 'quirk'];

export const GROUP_LABELS = {
  base: 'Base',
  estate: 'Estate',
  light: 'Light',
  trinket: 'Trinkets',
  quirk: 'Quirks',
  skill: 'Skills in this party',
};

/**
 * Un color por fuente, fuera de la rampa rojo-verde que usa la base, para que
 * donde acaba la base se vea. Las skills van en el cian de `buff` de
 * `gameColours.js`: el mismo que el borde de una skill que da buffs.
 */
export const GROUP_COLOURS = {
  estate: '#9aa7b8',
  light: '#fff0b3',
  trinket: '#4f9dff',
  quirk: '#b48cff',
  skill: '#5ec9d6',
  loss: '#b91c1c',
};

const STAT_OF = { 'max hp': 'hp', dodge: 'dodge', prot: 'prot', spd: 'spd', crit: 'crit', dmg: 'dmg' };
const RESIST_OF = {
  'stun resist': 'stun', 'blight resist': 'blight', 'bleed resist': 'bleed', 'disease resist': 'disease',
  'move resist': 'move', 'debuff resist': 'debuff', 'death blow resist': 'death', 'trap resist': 'trap',
};
/** Donde un porcentaje multiplica la base en vez de sumar puntos. */
const MULTIPLIES = new Set(['hp', 'dmg']);

const round1 = (n) => Math.round(n * 10) / 10;
/** `ceil` sin que `20 * 0.85 = 17.000000000000004` suba a 18. */
const ceilClean = (n) => Math.ceil(Math.round(n * 1e6) / 1e6);
const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

const clausesOf = (text) =>
  typeof text === 'string' ? text.split(' | ').map((c) => c.trim()).filter(Boolean) : [];
const trinketText = (name) => (getTrinketEffect(name) || getModdedTrinketEffect(name))?.effect || '';
const quirkText = (name) => getQuirkEffect(name)?.effect || '';

const TORCH_RE = /\s+if\s+torch\s+(above|below)\s+(\d+)\s*$/i;
/** "if Shard Dust in inventory": llevarlo es decision tuya, asi que cuenta. */
const INVENTORY_RE = /\s+if\s+.+?\s+in\s+inventory\s*$/i;
const POSITION_RE = /\s+if\s+in\s+position\s+(\d)\s*$/i;

/**
 * Una clausula a esta antorcha y en este rango: `{ stat, amount, percent }`,
 * `{ resist, amount }` o `{ skipped }`.
 *
 * - La luz se EVALUA contra la de la party.
 * - "in inventory" se da por activo siempre (Smoking Skull: +35 DODGE si llevas
 *   Shard Dust, que es cosa de hacer la mochila).
 * - "if in position N" se evalua contra el rango del heroe cuando se sabe
 *   (`rank`), o se da por activo al medir la barra (`'any'`).
 * - Cualquier otra condicion (vs Marked, HP below 25%, on First Round) se salta
 *   y se cuenta.
 */
const readClause = (clause, torch, rank = null) => {
  let text = clause.trim();
  const light = TORCH_RE.exec(text);
  if (light) {
    const value = Number(light[2]);
    const holds = light[1].toLowerCase() === 'above' ? torch > value : torch < value;
    if (!holds) return { skipped: 'light' };
    text = text.replace(TORCH_RE, '');
  }
  text = text.replace(INVENTORY_RE, '');
  const position = POSITION_RE.exec(text);
  if (position) {
    if (rank === null) return { skipped: 'conditional' };
    if (rank !== 'any' && rank !== Number(position[1])) return { skipped: 'position' };
    text = text.replace(POSITION_RE, '');
  }
  const parsed = parseClause(text);
  if (!parsed) return { skipped: 'unknown' };
  if (parsed.conditional) return { skipped: 'conditional' };
  if (parsed.scoped) return { skipped: 'scoped' };
  if (RESIST_OF[parsed.base]) return { resist: RESIST_OF[parsed.base], amount: parsed.amount };
  const stat = STAT_OF[parsed.base];
  if (!stat) return { skipped: 'unknown' };
  return { stat, amount: parsed.amount, percent: parsed.percent };
};

/**
 * La luz con la que corre una party: radiante, salvo que un trinket pida la
 * antorcha por debajo de algo. Se toma el "below" mas exigente, y la antorcha
 * justo debajo de el (below 26 -> 25, below 75 -> 74).
 */
export const partyLight = (party) => {
  let lowest = null;
  let source = null;
  (party || []).forEach((hero) => {
    [hero?.trinket1, hero?.trinket2].filter(Boolean).forEach((trinket) => {
      clausesOf(trinketText(trinket)).forEach((clause) => {
        const m = TORCH_RE.exec(clause);
        if (!m || m[1].toLowerCase() !== 'below') return;
        const value = Number(m[2]);
        if (lowest === null || value < lowest) {
          lowest = value;
          source = trinket;
        }
      });
    });
  });
  const torch = lowest === null ? 100 : Math.max(0, lowest - 1);
  return { torch, label: lightLabel(torch), below: lowest, source };
};

const BUFF_PIECE = /^\+\s*(\d+(?:\.\d+)?)\s*(%?)\s*(max hp|dodge|prot|spd|crit|dmg)\b(.*)$/i;
const OTHER_HEROES = /^other\s+heroes?\s*:/i;
const PARTY_PREFIX = /^\s*party\s*:\s*/i;
/** Parte por comas que no esten dentro de un parentesis: "(140% base, 3 rds)". */
const piecesOf = (text) =>
  text
    .split(/,(?![^(]*\))/)
    .map((piece) => piece.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean);

/**
 * Los buffs a estadisticas de barra que da una skill, y a quien llegan: `self`
 * al que la lanza, `others` a los demas. Lo leen el potencial de la party y la
 * vara de la barra, que tienen que contar lo mismo.
 *
 * `Self:` es solo para quien la lanza; `Other Heroes:` solo para los demas; sin
 * prefijo en una skill de apoyo, para el aliado elegido -- y para uno mismo si
 * el objetivo dice `/ self`. Un `Finale: +75% DMG` no entra: es un buff a otra
 * skill, no al heroe.
 */
// Por version del roster modded: los efectos generados de las clases del
// workshop llegan con el, y una respuesta calculada sin ellos no puede quedarse.
const buffCache = memoByModdedRoster(() => new Map());

export const skillBuffs = (heroClass, skill) => {
  const cacheKey = `${heroClass} ${skill}`;
  if (buffCache().has(cacheKey)) return buffCache().get(cacheKey);

  const out = [];
  const entry = getSkillEffect(skill, heroClass) || getModdedSkillEffect(skill, heroClass);
  if (entry && entry.kind !== 'camp') {
    const profile = skillProfile(heroClass, skill);
    const fallback = profile?.targetKind === 'ally' ? 'ally' : profile?.targetKind === 'self' ? 'self' : 'target';
    const reachesSelf = /self/i.test(entry.target || '');
    splitClauses(entry.effect).forEach((clause) => {
      // `Party:` (el Hearthlight del Runaway) es toda la party, incluido quien lo lanza.
      const party = PARTY_PREFIX.test(clause);
      const scope = party ? 'ally' : scopeOf(clause, fallback);
      let self = false;
      let others = false;
      if (scope === 'self') self = true;
      else if (scope === 'ally') {
        others = true;
        self = party || (!OTHER_HEROES.test(clause) && reachesSelf);
      }
      if (!self && !others) return;
      piecesOf(stripPrefix(clause.replace(PARTY_PREFIX, ''))).forEach((piece) => {
        const m = BUFF_PIECE.exec(piece);
        if (!m || m[4].trim()) return;
        out.push({ stat: STAT_OF[m[3].toLowerCase()], amount: Number(m[1]), percent: m[2] === '%', text: piece, self, others });
      });
    });
  }

  buffCache().set(cacheKey, out);
  return out;
};

/**
 * El desglose de un heroe.
 *
 * @param {object} hero  slot de heroe; basta `{ heroClass }`
 * @param {{ party?: object[], heroIndex?: number, rank?: number, difficulty?: string }} [options]
 * @returns {null|{
 *   light, stats: Object<string, {key, base, baseColour, parts, total, potential, potentialPercent, potentialSources}>,
 *   total: {hp, dodge, prot, spd, crit, dmgMin, dmgMax, dmgBase, dmgPercent, dmgPoints},
 *   resistances, sources, skipped
 * }}
 */
export const statBreakdown = (
  hero,
  { party = null, heroIndex = -1, rank = MAX_GEAR_RANK, difficulty = DIFFICULTY, estate = true } = {}
) => {
  const heroClass = hero?.heroClass;
  const stats = getHeroStats(heroClass);
  const gear = getGearStats(heroClass, rank);
  if (!stats || !gear) return null;

  const team = party && party.length ? party : [hero];
  const light = partyLight(team);

  const acc = Object.fromEntries(
    KEYS.map((k) => [
      k,
      { points: Object.fromEntries(LAYERS.map((l) => [l, 0])), percent: Object.fromEntries(LAYERS.map((l) => [l, 0])) },
    ])
  );
  const resistances = { ...stats.resistances };
  const sources = [];
  const skipped = { conditional: 0, scoped: 0, unknown: 0, light: 0, position: 0 };
  // El rango en la party (1-4), no el de equipo (`rank`): lo que miran los
  // trinkets con "if in position N".
  const partyRank = heroIndex >= 0 ? heroIndex + 1 : null;

  const push = (group, stat, amount, percent) => {
    if (percent && MULTIPLIES.has(stat)) acc[stat].percent[group] += amount;
    else acc[stat].points[group] += amount;
  };

  // `estate`: true (todo construido), false (nada) o la lista de distritos que
  // una partida importada tiene construidos de verdad.
  const built = (districtId) => (Array.isArray(estate) ? estate.includes(districtId) : !!estate);
  districtsFor(heroClass).filter((district) => built(district.id)).forEach((district) => {
    district.buffs.forEach((buff) => {
      if (buff.resist) {
        if (resistances[buff.resist] !== undefined) resistances[buff.resist] += buff.amount;
        sources.push({ group: 'estate', name: district.name, text: `+${buff.amount}% ${buff.resist} resist` });
        return;
      }
      const percent = buff.percent !== undefined;
      push('estate', buff.stat, percent ? buff.percent : buff.amount, percent);
      sources.push({
        group: 'estate',
        name: district.name,
        stat: buff.stat,
        text: percent ? `+${buff.percent}% ${LABEL[buff.stat]}` : `+${buff.amount} ${LABEL[buff.stat]}`,
      });
    });
  });

  // Cartographer's Camp REEMPLAZA la tabla de oscuridad del juego; sin estate
  // cuenta la del juego base, que tambien da algo (ver `BASE_LIGHT`).
  const cartographer = built('illuminators_guild');
  const fromLight = lightBonus(light.torch, difficulty, cartographer);
  const lightSource = cartographer ? CARTOGRAPHER_NAME : 'torchlight';
  if (fromLight.dodge) {
    push('light', 'dodge', fromLight.dodge, false);
    sources.push({ group: 'light', name: `${light.label} light`, stat: 'dodge', text: `+${fromLight.dodge} DODGE (${lightSource})` });
  }
  if (fromLight.crit) {
    push('light', 'crit', fromLight.crit, false);
    sources.push({ group: 'light', name: `${light.label} light`, stat: 'crit', text: `+${fromLight.crit}% CRIT (${lightSource})` });
  }

  const feed = (group, name, text) => {
    clausesOf(text).forEach((clause) => {
      const read = readClause(clause, light.torch, partyRank);
      if (read.skipped) {
        skipped[read.skipped] += 1;
        return;
      }
      if (read.resist) {
        if (resistances[read.resist] !== undefined) resistances[read.resist] += read.amount;
        sources.push({ group, name, text: clause });
        return;
      }
      push(group, read.stat, read.amount, read.percent);
      sources.push({ group, name, stat: read.stat, text: clause });
    });
  };
  feed('trinket', hero.trinket1, hero.trinket1 && trinketText(hero.trinket1));
  feed('trinket', hero.trinket2, hero.trinket2 && trinketText(hero.trinket2));
  [...(hero.quirks?.positive || []), ...(hero.quirks?.negative || []), ...(hero.diseases || [])]
    .filter(Boolean)
    .forEach((quirk) => feed('quirk', quirk, quirkText(quirk)));

  const baseOf = { hp: gear.hp, dodge: gear.dodge, prot: gear.prot, spd: gear.spd, crit: gear.crit, dmg: gear.dmgMax };
  const out = {};
  KEYS.forEach((key) => {
    const base = baseOf[key] ?? 0;
    const { points, percent } = acc[key];
    const parts = LAYERS
      .map((group) => ({ group, amount: round1((base * percent[group]) / 100 + points[group]) }))
      .filter((p) => p.amount !== 0);
    const total = MULTIPLIES.has(key)
      ? ceilClean(base * (1 + sum(percent) / 100) + sum(points))
      : round1(base + sum(points));
    const position = statPosition(key === 'dmg' ? 'dmgMax' : key, base);
    out[key] = {
      key,
      base,
      baseColour: position === null ? '#8a8f98' : statColor(position),
      parts,
      total,
      potential: 0,
      potentialPercent: 0,
      potentialSources: [],
    };
  });

  const dmg = acc.dmg;
  const total = {
    hp: out.hp.total,
    dodge: out.dodge.total,
    prot: out.prot.total,
    spd: out.spd.total,
    crit: out.crit.total,
    dmgMin: ceilClean(gear.dmgMin * (1 + sum(dmg.percent) / 100) + sum(dmg.points)),
    dmgMax: out.dmg.total,
    // Lo que la tirada de una skill necesita por separado. El +% DMG del heroe
    // se SUMA al modificador de la skill, no se multiplica sobre el daño ya
    // subido (Fran, 2026-09-14): +10% de trinket en una skill a -50% es un -40%.
    // Trinkets, quirks y distritos son el mismo buff en el juego
    // (`combat_stat_multiply`), asi que cuentan todos igual. Ver `skillHover`.
    dmgBase: { min: gear.dmgMin, max: gear.dmgMax },
    dmgPercent: round1(sum(dmg.percent)),
    dmgPoints: sum(dmg.points),
  };

  if (party && heroIndex >= 0) {
    const seen = new Set();
    party.forEach((member, j) => {
      if (!member?.heroClass) return;
      (member.activeSkills || []).filter(Boolean).forEach((skill) => {
        skillBuffs(member.heroClass, skill).forEach((buff) => {
          if (!(j === heroIndex ? buff.self : buff.others)) return;
          const isPercent = buff.percent && MULTIPLIES.has(buff.stat);
          const key = `${skill}|${buff.stat}|${buff.percent}|${buff.amount}`;
          if (seen.has(key)) return;
          seen.add(key);
          const row = out[buff.stat];
          row.potential = round1(row.potential + (isPercent ? (row.base * buff.amount) / 100 : buff.amount));
          if (isPercent) row.potentialPercent += buff.amount;
          row.potentialSources.push({ heroClass: member.heroClass, skill, text: buff.text, self: j === heroIndex });
        });
      });
    });
  }

  return { light, stats: out, total, resistances, sources, skipped, difficulty, estate };
};

/**
 * Hasta donde llega la barra: lo mejor que una clase base puede tener vestida.
 *
 * No el maximo de las clases desnudas: con esa vara un Jester con Ancestor's
 * Coat y Camouflage Cloak se sale de la barra, y justo ese es el heroe que
 * tiene que verse lleno. Por clase: base + Hacienda + luz radiante + sus dos
 * mejores trinkets para esa estadistica (genericos y los suyos) + sus cinco
 * mejores quirks positivos + el mejor buff que se da a si misma + el mejor que
 * un companero del roster da a otro; y la vara es el mayor de las veinte.
 *
 * Los dos buffs son el hueco para las rayas: sin ellos el Jester vestido ya
 * llena la barra y el +30 de Solo no tiene donde dibujarse.
 *
 * La barra empieza en 0: las capas son cantidades, y apiladas solo se leen
 * bien si la longitud es proporcional. Lo "alto o bajo para su clase" lo dice
 * el color de la base.
 */
const scaleCache = new Map();

export const statScale = (difficulty = DIFFICULTY, estate = true) => {
  const cacheKey = `${difficulty}|${Array.isArray(estate) ? [...estate].sort().join(',') : estate}`;
  if (scaleCache.has(cacheKey)) return scaleCache.get(cacheKey);

  const specific = new Set(ALL_HERO_SPECIFIC_TRINKETS);
  const reads = (text) => clausesOf(text).map((c) => readClause(c, 100, 'any')).filter((r) => r.stat);
  const universal = Object.keys(TRINKET_EFFECTS).filter((n) => !specific.has(n)).map((n) => reads(TRINKET_EFFECTS[n].effect));
  const quirks = Object.values(QUIRK_EFFECTS).filter((q) => q.kind === 'positive').map((q) => reads(q.effect));

  // Lo que cada clase se puede dar a si misma con su kit, y lo mejor que
  // cualquier companero del roster puede dar a otro.
  const kits = Object.fromEntries(
    Object.keys(HERO_STATS).map((heroClass) => [
      heroClass,
      (HERO_CLASSES[heroClass]?.skills || []).flatMap((skill) => skillBuffs(heroClass, skill)),
    ])
  );
  const allBuffs = Object.values(kits).flat();

  const max = Object.fromEntries(KEYS.map((k) => [k, 0]));
  Object.keys(HERO_STATS).forEach((heroClass) => {
    const kitted = statBreakdown({ heroClass }, { difficulty, estate });
    if (!kitted) return;
    const own = (HERO_SPECIFIC_TRINKETS[heroClass] || []).map((n) => reads(getTrinketEffect(n)?.effect));
    KEYS.forEach((key) => {
      const base = kitted.stats[key].base;
      const pointsOf = (r) => (r.percent && MULTIPLIES.has(key) ? (base * r.amount) / 100 : r.amount);
      const valueOf = (list) => list.reduce((acc, r) => (r.stat !== key ? acc : acc + pointsOf(r)), 0);
      const best = (lists, n) =>
        lists.map(valueOf).filter((v) => v > 0).sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0);
      const bestBuff = (buffs) => Math.max(0, ...buffs.filter((b) => b.stat === key).map(pointsOf));
      const headroom = bestBuff(kits[heroClass].filter((b) => b.self)) + bestBuff(allBuffs.filter((b) => b.others));
      const value = kitted.stats[key].total + best([...universal, ...own], 2) + best(quirks, 5) + headroom;
      if (value > max[key]) max[key] = round1(value);
    });
  });

  scaleCache.set(cacheKey, max);
  return max;
};

/**
 * La geometria de una barra, en % de su ancho: los tramos apilados (base y
 * capas positivas), lo que restan las capas negativas, y el potencial a rayas.
 */
export const barGeometry = (row, max) => {
  const scale = max > 0 ? max : 1;
  const pct = (v) => Math.max(0, Math.min(100, (v / scale) * 100));
  const layers = [{ group: 'base', amount: row.base }, ...row.parts];

  let end = 0;
  const segments = [];
  layers.forEach(({ group, amount }) => {
    if (amount <= 0) return;
    segments.push({ group, from: pct(end), to: pct(end + amount) });
    end += amount;
  });
  const lost = layers.reduce((acc, { amount }) => (amount < 0 ? acc - amount : acc), 0);

  return {
    segments,
    positiveEnd: pct(end),
    totalEnd: pct(Math.max(0, end - lost)),
    potentialEnd: pct(end + row.potential),
  };
};

/**
 * El degradado de los tramos, dentro del relleno (0-100% de SU ancho), con una
 * transicion corta entre colores en vez de un corte: lo que Fran pidio, "un
 * degradado como el de las skills" y no bloques.
 */
export const segmentGradient = (segments, baseColour, positiveEnd) => {
  if (!segments.length || positiveEnd <= 0) return 'transparent';
  const colourOf = (group) => (group === 'base' ? baseColour : GROUP_COLOURS[group]);
  if (segments.length === 1) return colourOf(segments[0].group);
  const rel = (v) => Math.round((v / positiveEnd) * 1000) / 10;
  const blend = 2;
  const stops = [];
  segments.forEach((seg, i) => {
    const colour = colourOf(seg.group);
    const from = i === 0 ? 0 : Math.min(rel(seg.from) + blend, rel(seg.to));
    const to = i === segments.length - 1 ? 100 : Math.max(rel(seg.to) - blend, from);
    stops.push(`${colour} ${from}%`, `${colour} ${to}%`);
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
};
