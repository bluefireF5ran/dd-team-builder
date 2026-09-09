/**
 * Que HACE una skill, leido de los datos generados en vez de escrito a mano.
 *
 * `rankValidity` ya demostro el camino para las posiciones: `skillEffects.js`
 * lleva `launch` y `target` de las 140 skills de combate y de las 80 de
 * campamento, y durante mucho tiempo su unico consumidor fue una linea de
 * subtitulo. El resto del texto -- la prosa de `effect`-- sigue igual de
 * desaprovechada, y es donde estan Stun, Blight, Bleed, Mark, Heal y Stress.
 *
 * Lo que esto sustituye era una tabla a mano en `synergyHelper`: dos clases
 * "curadoras", cuatro con Mark, y un array literal de cuatro nombres para el
 * estres. No sabia nada del Duelist ni del Runaway, que llevan ya dos anos en
 * el juego, ni de una sola clase modded.
 *
 * ## El prefijo de la clausula manda
 *
 * Las clausulas van separadas por `|`, y el prefijo dice A QUIEN afecta:
 *
 *   `Self: Stress -10`        el Abomination se quita estres a si mismo
 *   `Other Heroes: Stress +8` el Abomination se lo MEDE a su propio equipo
 *   `Stun (130% base)`        sin prefijo: va al objetivo
 *
 * Confundirlos es el mismo error que `trinketSubstitution` documenta con
 * `+10% Stress`: el signo no dice si algo es bueno, y aqui el prefijo tampoco
 * es decoracion. `Transform` reparte las dos cosas en la misma linea.
 *
 * ## Lo que NO se marca
 *
 * Una resistencia no es la cosa (`+15% Bleed Resist` no sangra a nadie), una
 * bonificacion condicional no es la cosa (`+60% DMG vs Stunned` no aturde), y
 * limpiar no es aplicar (`Clear Stun`, `Remove Bleeding`). Los tres eran
 * falsos positivos faciles y cada uno tiene su test.
 *
 * Todo es advisory: una skill de la que esta app no tiene datos -- una clase
 * modded sin cubrir-- devuelve `null`, nunca una acusacion. Callarse es la
 * respuesta correcta cuando no se sabe.
 */

import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { parseRanks } from './rankValidity';

/** Las clausulas dirigidas a uno mismo o a los companeros, no al objetivo. */
const SELF_PREFIX = /^self\s*:/i;
const ALLY_PREFIX = /^other\s+heroes?\s*:/i;

const splitClauses = (effect) =>
  typeof effect === 'string' ? effect.split('|').map((c) => c.trim()).filter(Boolean) : [];

/**
 * A quien afecta una clausula.
 *
 * Sin prefijo NO significa "al enemigo": significa "a quien apunte la skill".
 * El `Inspiring Cry` del Crusader dice `Stress -8` a secas y su `target` es
 * `ally 1·2·3·4 / self`, asi que quita estres a los tuyos. Leer el prefijo sin
 * mirar el objetivo dejaba fuera justo a los curanderos de estres clasicos --
 * Jester, Crusader, Houndmaster-- y contaba su cura como algo hecho al enemigo.
 */
const scopeOf = (clause, fallback) => {
  if (SELF_PREFIX.test(clause)) return 'self';
  if (ALLY_PREFIX.test(clause)) return 'ally';
  return fallback;
};

const stripPrefix = (clause) => clause.replace(SELF_PREFIX, '').replace(ALLY_PREFIX, '').trim();

/**
 * Los verbos que QUITAN un estado, con lo que arrastran detras hasta el
 * siguiente separador.
 *
 * Un lookbehind no basta: `Cure Blight/Bleed` deja a `Bleed` precedido por una
 * barra, no por el verbo, asi que se colaba como "aplica sangrado". Se quita el
 * tramo entero antes de buscar nada, que ademas es mas facil de leer.
 * `Transfer` y `Receive` entran por el `Suffer` del Flagellant: mueve las DoT
 * de un aliado a si mismo, que no es aplicarselas a un enemigo.
 */
const cleanseSpans = () => /\b(?:clear|cure|remove|transfer|receive)\b[^,;\]|]*/gi;

// `Blight Resist` / `Bleed Resist` / `Blight Skill Chance` no aplican nada, y
// `vs Bleeding` / `vs Stunned` / `vs Marked` son bonificaciones condicionales.
const applies = (text, word) =>
  new RegExp(`\\b${word}\\b(?!\\s*(?:resist|skill chance))`, 'i').test(text) &&
  !new RegExp(`vs\\s+${word}`, 'i').test(text);

/**
 * El estres viene en dos formas y no son lo mismo.
 *
 *   `Stress -12`, `-15 Stress`   plano: cura estres ya acumulado
 *   `-20% Stress`, `-30% Stress` porcentaje: resistencia, se sufre menos
 *
 * `Inspiring Tune` lleva las dos en la misma linea (`Stress -12, -20% Stress`),
 * y una party "con curandero de estres" quiere decir la primera.
 */
const stressKinds = (text) => {
  const kinds = new Set();
  if (/stress\s*-\s*\d/i.test(text) || /-\s*\d+\s+stress/i.test(text)) kinds.add('heal');
  if (/-\s*\d+\s*%\s*stress/i.test(text)) kinds.add('resist');
  if (/stress\s*\+\s*\d/i.test(text) || /\+\s*\d+%?\s*stress/i.test(text)) kinds.add('cost');
  return kinds;
};

/**
 * Las etiquetas de una clausula ya desprefijada, dado su alcance.
 */
const tagsForClause = (clause, scope, out) => {
  const text = stripPrefix(clause);
  // Lo que queda despues de tachar lo que se limpia: sobre esto se pregunta
  // "¿aplica X?", para que curar un sangrado no cuente como causarlo.
  const applied = text.replace(cleanseSpans(), ' ');
  if (text !== applied) out.add('cleanse');

  if (applies(applied, 'stun')) out.add('stun');
  if (applies(applied, 'blight')) out.add('blight');
  if (applies(applied, 'bleed')) out.add('bleed');

  // `Mark Target` marca al enemigo; `Mark Self` es como el Man at Arms se
  // ofrece de senuelo, que es lo contrario de preparar el foco del equipo.
  if (/\bmark\s+target\b/i.test(applied)) out.add('mark');
  if (/\bmark\s+self\b/i.test(applied)) out.add('markSelf');
  if (/vs\s+marked/i.test(text)) out.add('markPayoff');

  // `Healing Received` es un buff a la curacion ajena, no una curacion.
  if (/\bheal\b(?!ing)/i.test(applied)) out.add('heal');

  const stress = stressKinds(applied);
  if (stress.has('heal')) out.add('stressHeal');
  if (stress.has('resist')) out.add('stressResist');
  if (stress.has('cost')) out.add('stressCost');

  if (/\bguard\b/i.test(applied)) out.add('guard');
  if (/\briposte\b/i.test(applied)) out.add('riposte');
  if (/\bstealth\b/i.test(applied) && !/bypass/i.test(applied)) out.add('stealth');

  // Moverse uno mismo frente a mover al enemigo: es la diferencia entre una
  // clase bailarina y una que descoloca la fila contraria.
  if (scope === 'self' && /\b(forward|back)\s*\d/i.test(applied)) out.add('selfMove');
  if (/\b(knockback|pull)\s*\d/i.test(applied) || /\bshuffle\b/i.test(applied)) {
    out.add(scope === 'self' ? 'selfMove' : 'enemyMove');
  }

  if (/\btorch\s*[+-]/i.test(applied)) out.add('torch');
};

const DAMAGE_TYPES = new Set(['Melee', 'Ranged']);

/**
 * Lo que se sabe de una skill, o `null` si esta app no la conoce.
 *
 * @returns {{kind, type, launch:number[], target:number[], targetKind, aoe, tags:Set}|null}
 */
export const skillProfile = (heroClass, skillName) => {
  const entry = getSkillEffect(skillName, heroClass) || getModdedSkillEffect(skillName, heroClass);
  if (!entry) return null;

  const isCamp = entry.kind === 'camp';
  const targetSpec = typeof entry.target === 'string' ? entry.target : '';
  const targetKind = /ally/i.test(targetSpec)
    ? 'ally'
    : /self/i.test(targetSpec)
      ? 'self'
      : parseRanks(targetSpec).length
        ? 'enemy'
        : 'none';

  // El alcance por defecto de una clausula sin prefijo lo fija el objetivo de
  // la skill, no el texto. Una skill de campamento siempre habla de los tuyos.
  const fallbackScope =
    isCamp || targetKind === 'ally' ? 'ally' : targetKind === 'self' ? 'self' : 'target';

  const tags = new Set();
  splitClauses(entry.effect).forEach((clause) =>
    tagsForClause(clause, scopeOf(clause, fallbackScope), tags)
  );

  if (DAMAGE_TYPES.has(entry.type) && entry.dmg !== '-100%' && !isCamp) tags.add('damage');
  if (entry.aoe) tags.add('aoe');

  return {
    kind: isCamp ? 'camp' : 'combat',
    type: entry.type || null,
    launch: isCamp ? [] : parseRanks(entry.launch),
    target: isCamp ? [] : parseRanks(entry.target),
    targetKind: isCamp ? 'none' : targetKind,
    aoe: !!entry.aoe,
    tags
  };
};

/** Atajo: `true` si la skill lleva esa etiqueta. `null` cuenta como no. */
export const skillHasTag = (heroClass, skillName, tag) => {
  const profile = skillProfile(heroClass, skillName);
  return !!profile && profile.tags.has(tag);
};

const classProfileCache = new Map();

/**
 * El perfil de una CLASE, no de una skill: de cuantas de sus skills dispone
 * desde cada rango, y si se mueve sola.
 *
 * `launchableByRank[r]` son las skills del kit completo que se pueden lanzar
 * desde el rango r -- no las que el heroe lleva equipadas--, porque la
 * pregunta que responde es "¿tiene sentido esta clase aqui?".
 */
export const classProfile = (heroClass, skillNames) => {
  const key = `${heroClass}|${(skillNames || []).join(',')}`;
  if (classProfileCache.has(key)) return classProfileCache.get(key);

  const profiles = (skillNames || [])
    .map((name) => ({ name, profile: skillProfile(heroClass, name) }))
    .filter((entry) => entry.profile && entry.profile.kind === 'combat');

  const launchableByRank = { 1: [], 2: [], 3: [], 4: [] };
  [1, 2, 3, 4].forEach((rank) => {
    launchableByRank[rank] = profiles
      .filter(({ profile }) => profile.launch.includes(rank))
      .map(({ name }) => name);
  });

  const result = {
    heroClass,
    known: profiles.length,
    launchableByRank,
    // Una clase bailarina se coloca sola, asi que juzgarla por donde empieza
    // la ronda es juzgarla por el sitio en el que menos tiempo pasa.
    isDancer: profiles.some(({ profile }) => profile.tags.has('selfMove'))
  };

  classProfileCache.set(key, result);
  return result;
};
