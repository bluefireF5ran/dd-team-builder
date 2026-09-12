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

/**
 * El corchete de un riposte, que describe el contraataque y no al enemigo.
 *
 * `Riposte: [-20% DMG, +4% CRIT (3 rds)]` dice que el contraataque pega un 20%
 * menos, no que el objetivo quede debilitado. El Man at Arms lo escribe detras
 * de `Self:` y el Highwayman no, asi que el prefijo no basta para distinguirlos.
 */
const riposteSpans = () => /\briposte\s*:\s*\[[^\]]*\]/gi;

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
 * Los tipos de bicho que el juego usa para bonificar dano, y como se llaman en
 * `enemy_type` de los monstruos.
 *
 * Las skills dicen "Human" y los ficheros del juego `.id "man"`, asi que la
 * tabla no es decoracion: sin ella el `+35% DMG vs Human` del Bounty Hunter no
 * casaria con el 54% de `man` de la Guarida.
 */
const ENEMY_TYPES = {
  unholy: 'unholy',
  eldritch: 'eldritch',
  beast: 'beast',
  human: 'man',
  man: 'man'
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
  // `Mark Self` y `Self: Mark` son la misma cosa escrita al reves, y el Duelist
  // usa la segunda forma en `Feint` y en `Fleche`. Leyendo solo la primera, la
  // clase que mas se automarca del juego se quedaba sin la etiqueta -- y con
  // ella se decide si conviene llevarla a una region que pega mas fuerte a los
  // marcados. `\bmark\b` no pica en "Marked", asi que `vs Marked` no cuenta.
  if (/\bmark\s+self\b/i.test(applied) || (scope === 'self' && /\bmark\b/i.test(applied))) {
    out.add('markSelf');
  }
  if (/vs\s+marked/i.test(text)) out.add('markPayoff');

  // Bajarle al enemigo PROT, DODGE, ACC, SPD o DMG. Con el alcance por delante,
  // porque el `-4 SPD` del `Transform` del Abomination es el precio de
  // transformarse y no algo que le hagas a nadie. Y sin el corchete del
  // riposte: el `-15% DMG` del `Duelist's Advance` describe lo flojo que pega
  // SU contraataque, no una debilidad que le ponga al enemigo.
  const debuffable = applied.replace(riposteSpans(), ' ');
  if (scope === 'target' && /-\s*\d+\s*%?\s*(prot|dodge|acc|spd|dmg)\b/i.test(debuffable)) {
    out.add('debuff');
  }

  // `+35% DMG vs Unholy` solo vale si la region trae ese bicho, asi que el tipo
  // viaja EN la etiqueta. Solo los que el juego usa para bonificar: `vs Marked`
  // y `vs Stunned` son condiciones de combate, no censos de region -- y hay que
  // recorrerlas TODAS, porque el `Collect Bounty` del Bounty Hunter pone la
  // condicion de combate primero y el tipo de bicho detras.
  if (scope === 'target') {
    [...applied.matchAll(/\+\s*\d+\s*%?\s*DMG\s+vs\s+([A-Za-z]+)/gi)].forEach((match) => {
      const type = ENEMY_TYPES[match[1].toLowerCase()];
      if (type) out.add(`bonus:${type}`);
    });
  }

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

/** El analisis de verdad. Se llama una vez por skill; ver `skillProfile`. */
const computeSkillProfile = (heroClass, skillName) => {
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

const profileCache = new Map();

/**
 * Lo que se sabe de una skill, o `null` si esta app no la conoce.
 *
 * Memoizado, y no por adorno: analizar una skill es partir su `effect` por
 * `|`, pasarle una docena de regex a cada clausula y montar un Set. Cuesta
 * microsegundos, pero el generador de comps la llama cientos de miles de veces
 * por sugerencia -- `scoreParty` sola son ~80 llamadas, y se puntuan miles de
 * partys-- y ahi los microsegundos eran ocho segundos de reloj.
 *
 * La entrada es estatica (`skillEffects.js` y `moddedEffects.js` son datos
 * generados, no estado), asi que la misma pareja clase+skill da siempre la
 * misma respuesta. Se cachea tambien el `null`: una clase modded sin datos es
 * el caso que mas cuesta, porque falla en las dos tablas antes de rendirse, y
 * con 644 clases modded en el fichero es tambien el mas frecuente.
 *
 * El objeto se comparte entre todos los que lo piden, asi que **nadie puede
 * tocarlo**: `tags`, `launch` y `target` son de solo lectura para quien llama.
 * Hoy nadie los muta -- los consumidores solo leen-- y quien necesite una
 * copia que se la haga.
 *
 * @returns {{kind, type, launch:number[], target:number[], targetKind, aoe, tags:Set}|null}
 */
export const skillProfile = (heroClass, skillName) => {
  const key = `${heroClass}\u0000${skillName}`;
  const cached = profileCache.get(key);
  if (cached !== undefined) return cached;
  const result = computeSkillProfile(heroClass, skillName);
  profileCache.set(key, result);
  return result;
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
