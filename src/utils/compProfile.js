/**
 * Que HACE una comp, en numeros, leido del kit equipado.
 *
 * `skillProfile` ya dice que hace cada SKILL. Esto lo suma por party y devuelve
 * la cuota de cada eje: que fraccion de las acciones de combate de la comp
 * sirven a cada cosa.
 *
 * **Cuota, no presencia**, y esa es toda la diferencia. En una libreria donde
 * cada comp es "cuatro heroes en su mejor sitio con su mejor kit", casi todas
 * tienen un mark y casi todas tienen una cura: preguntar "¿lleva mark?" devuelve
 * que si en media libreria y no separa nada -- con deteccion por presencia, una
 * sola etiqueta se llevaba 140 comps. Preguntar "¿cuanto de lo que hace es
 * mark?" si: el mark medio es el 18% de los turnos, y una comp al 44% es otra
 * cosa.
 *
 * Lo usa `compNaming2`, y sirve igual para ordenar o filtrar la libreria.
 */

import { skillProfile } from './skillProfile';
import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { ENGINES, AXIS_LIMITS } from '../data/compAxes';

const CLEANSE = /\b(?:clear|cure|remove|transfer|receive)\b[^,;\]|]*/gi;
const SELF = /^self\s*:/i;
const ALLY = /^other\s+heroes?\s*:/i;

const effectOf = (heroClass, skillName) =>
  getSkillEffect(skillName, heroClass) || getModdedSkillEffect(skillName, heroClass);

/**
 * ¿Esta skill le aplica esa DoT AL ENEMIGO?
 *
 * `skillProfile` marca `bleed`/`blight`/`stun` sin mirar el prefijo de la
 * clausula, y para lo que hace -- decir de que va una skill-- esta bien. Para
 * medir el plan de una comp no: el `Self: Bleed (160% base)` del `Reclaim` es el
 * Flagelante sangrandose a si mismo para curarse, y contarlo como ofensiva hacia
 * que una party que lo lleva de curandero se leyera como party de sangrado. Son
 * 324 usos en la libreria; quitarlos bajo el sangrado medio del 11.5% al 7.9%.
 * Lo mismo el `Wyrd Reconstruction` del Occultist, que sangra al ALIADO al que
 * cura, y por la misma razon: el alcance de una clausula sin prefijo lo fija el
 * objetivo de la skill, no el texto.
 *
 * `burn` viene por aqui tambien porque `skillProfile` nunca lo aprendio: detecta
 * bleed y blight con este mismo patron y esa se le paso.
 */
export const appliesToEnemy = (heroClass, skillName, word) => {
  const entry = effectOf(heroClass, skillName);
  if (!entry || !entry.effect) return false;
  const spec = typeof entry.target === 'string' ? entry.target : '';
  if (entry.kind === 'camp' || /ally/i.test(spec) || /^self$/i.test(spec.trim())) return false;

  // `Blight Resist` y `Blight Skill Chance` no envenenan a nadie, y `vs Burning`
  // es una condicion, no una aplicacion.
  const has = new RegExp(`\\b${word}\\b(?!\\s*(?:resist|skill chance))`, 'i');
  const vs = new RegExp(`vs\\s+${word}`, 'i');
  return entry.effect
    .split('|')
    .map((clause) => clause.trim())
    .some((clause) => {
      if (SELF.test(clause) || ALLY.test(clause)) return false;
      return has.test(clause.replace(CLEANSE, ' ')) && !vs.test(clause);
    });
};

/**
 * Los ejes, cada uno una pregunta sobre una sola skill ya analizada.
 *
 * `reach` y `front` son la GEOMETRIA DE RANGOS, que es medio Darkest Dungeon y
 * que ningun token de clase puede decir: el Lunge de la Grave Robber la lanza
 * desde 3-4 contra 1-2, y es esa figura -- no "hay una Grave Robber"-- la que
 * hace la comp. `skillProfile` ya trae los rangos y nadie los leia.
 */
const AXIS_TESTS = {
  bleed: (s) => s.dot.bleed,
  blight: (s) => s.dot.blight,
  burn: (s) => s.dot.burn,
  stun: (s) => s.dot.stun,
  mark: (s) => s.tags.has('mark') || s.tags.has('markPayoff'),
  riposte: (s) => s.tags.has('riposte'),
  guard: (s) => s.tags.has('guard'),
  heal: (s) => s.tags.has('heal'),
  stressHeal: (s) => s.tags.has('stressHeal'),
  debuff: (s) => s.tags.has('debuff'),
  enemyMove: (s) => s.tags.has('enemyMove'),
  evade: (s) => s.tags.has('stealth') || s.tags.has('selfMove'),
  aoe: (s) => s.tags.has('aoe'),
  reach: (s) => s.tags.has('damage') && s.target.some((r) => r >= 3),
  front: (s) => s.tags.has('damage') && s.target.length > 0 && s.target.every((r) => r <= 2)
};

/** Todos los ejes, motores primero. `crit` va aparte: es un numero, no una etiqueta. */
export const AXIS_KEYS = [...Object.keys(AXIS_TESTS), 'crit'];

const DOT_WORDS = ['bleed', 'blight', 'burn', 'stun'];

/**
 * El vector de una comp: `{ [eje]: cuota }` mas cuantas acciones se midieron.
 *
 * @param {object} comp  una comp `{heroes}` tal cual se guarda
 * @returns {{axes: object, actions: number}}
 */
export const compProfile = (comp) => {
  const slots = [];
  for (const hero of comp?.heroes || []) {
    for (const skillName of hero?.activeSkills || []) {
      const profile = skillProfile(hero.heroClass, skillName);
      if (!profile || profile.kind !== 'combat') continue;
      const dot = {};
      DOT_WORDS.forEach((w) => {
        dot[w] = profile.tags.has(w) || w === 'burn'
          ? appliesToEnemy(hero.heroClass, skillName, w)
          : false;
      });
      slots.push({ tags: profile.tags, target: profile.target, dot });
    }
  }

  const axes = {};
  Object.keys(AXIS_TESTS).forEach((key) => {
    axes[key] = slots.length ? slots.filter((s) => AXIS_TESTS[key](s)).length / slots.length : 0;
  });

  // `crit` vive en el campo `crit` de la skill, no en la prosa, asi que
  // `skillProfile` no lo mira. Y la comunidad habla de el mas que de casi nada:
  // 209 menciones en las guias de heroes, tercero tras dodge y stun.
  let keen = 0;
  let counted = 0;
  for (const hero of comp?.heroes || []) {
    for (const skillName of hero?.activeSkills || []) {
      const entry = effectOf(hero.heroClass, skillName);
      if (!entry) continue;
      counted += 1;
      const match = /([+-]?\d+)\s*%/.exec(entry.crit || '');
      if (match && Number(match[1]) >= AXIS_LIMITS.critBonus) keen += 1;
    }
  }
  axes.crit = counted ? keen / counted : 0;

  return { axes, actions: slots.length };
};

/** Los ejes que son motor, en el orden en que se declararon. */
export const engineKeys = () => ENGINES.filter((k) => AXIS_KEYS.includes(k));

/** Los ejes que son figura: todo lo que no es motor. */
export const shapeKeys = () => AXIS_KEYS.filter((k) => !ENGINES.includes(k));
