/**
 * De que color es una skill: lo que HACE, leido de su texto, como una lista
 * ordenada de categorias y el degradado que las pinta en el borde del icono.
 *
 * Antes todas las skills de combate tenian el mismo borde verde, asi que un
 * `Nervous Stab` sin efecto y un `Festering Vapours` que envenena y rebaja la
 * resistencia a la plaga se veian iguales hasta pasar el raton. Fran pidio que
 * el borde lo diga:
 *
 *   Nervous Stab         gris              golpe sin efecto
 *   Festering Vapours    plaga · plaga oscura (70/30)   aplica blight y quita blight resist
 *   Get Down!            moverse tu · buff                no el azul de mover al enemigo
 *   Flashpowder          debuff · bypass                  quitar sigilo no es el sigilo propio
 *   Fortifying Vapours   cura · bleed resist+ · blight resist+
 *   Invigorating Vapours buff
 *   Protect Me           guard · buff
 *
 * Y en la segunda ronda: los costes propios TAMBIEN llevan color -- Finale,
 * Barbaric YAWP! y Redeem se bajan estadisticas (`selfDebuff`), Reclaim se
 * sangra (`selfBleed`) --, el Block de la Shieldbreaker, el Controlled Burn, lo
 * que potencia la quemadura (Burn Decay, Burn Skill Amount) y el daño extra por
 * pila de quemadura.
 *
 * ## El alcance de cada clausula manda
 *
 * `Mark Target` en `Protect Me` marca a TU heroe para que le peguen a el; en
 * `Mark for Death` marca al enemigo. Por eso esto no puede leer las etiquetas de
 * `skillProfile` tal cual, y tampoco puede anadirlas alli: el generador de comps,
 * `partyCoverage` y la taxonomia leen ese vocabulario. Usa sus piezas --
 * prefijos, limpiezas, riposte -- y entiende dos prefijos mas que ella no
 * necesita: `Party:` (todos los tuyos) y `Enemies:`.
 *
 * ## Lo que no se colorea
 *
 * No hay un color por estadistica: +DODGE, +SPD y +PROT son todos `buff`. Quince
 * tonos no se recuerdan, y el hover ya dice cual.
 */
import {
  skillProfile, splitClauses, scopeOf, stripPrefix, cleanseSpans, riposteSpans, applies, stressKinds,
} from './skillProfile';
import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';
import { effectColour, EFFECT_COLOURS, RESIST_FAMILY } from '../data/gameColours';

/**
 * El orden en que se eligen los colores. Lo que le hace la skill al enemigo va
 * primero -- es por lo que se elige una skill ofensiva--, luego lo que da a los
 * tuyos, luego lo accesorio, y al final lo que cuesta: un precio se ve cuando la
 * skill hace poco mas, que es cuando importa. Solo caben tres; el resto lo
 * cuenta el hover.
 */
const FAMILIES = Object.keys(RESIST_FAMILY);
export const CATEGORY_ORDER = [
  'stun', 'blight', 'bleed', 'burn', 'controlledBurn', 'mark', 'enemyMove', 'disease', 'debuff', 'bypass', 'burnBoost',
  ...FAMILIES.map((f) => `resistDown:${f}`),
  'heal', 'stressHeal', 'guard', 'block', 'selfMove', 'buff',
  ...FAMILIES.map((f) => `resistUp:${f}`),
  'riposte', 'stealth', 'cleanse', 'torch', 'bonus',
  'selfDebuff', 'selfBleed',
];
const MAX_STOPS = 3;

/** `Party:` y `Enemies:`, que `skillProfile` no distingue y aqui si importan. */
const LOCAL_PREFIX = /^\s*(party|enemies)\s*:\s*/i;

/** El alcance de una clausula, entendiendo tambien `Party:` y `Enemies:`. */
export const scopeFor = (clause, fallback) => {
  const m = LOCAL_PREFIX.exec(clause);
  if (m) return m[1].toLowerCase() === 'party' ? 'ally' : 'target';
  return scopeOf(clause, fallback);
};

const RESIST_RE = /([+-])\s*\d+(?:\.\d+)?\s*%\s*(\([^)]*\)|[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*Resist/gi;

const resistChanges = (text) =>
  [...text.matchAll(RESIST_RE)].flatMap(([, sign, what]) =>
    what
      .replace(/[()]/g, '')
      .split(/[,/]/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => RESIST_FAMILY[w])
      .map((family) => ({ sign, family }))
  );

// Lo que rodea a la palabra "burn" sin ser aplicar quemadura.
const NOT_APPLYING_BURN = /\bcontrolled\s+burn\b|\bburn\s+(?:decay|skill\s+(?:amount|chance)|resist)\b|\bper\s+burn\s+stack\b/gi;
// Un enemigo no se mueve hacia delante: `Forward 1` sin prefijo sigue siendo tuyo.
const OWN_MOVE = /\b(?:forward|back)\s+\d/i;
const STAT_DOWN = /-\s*\d+(?:\.\d+)?\s*%?\s*(?:prot|dodge|acc|spd|dmg|crit|healing\s+skills|healing\s+received)\b/i;

export const classifyClause = (clause, scope, out) => {
  const text = stripPrefix(clause.replace(LOCAL_PREFIX, ''));

  // Atravesar defensas: quitar o ignorar sigilo, romper o ignorar guard, perforar
  // PROT. Se aparta antes de las limpiezas, que cazarian "Remove Stealth".
  const bypass =
    /\b(?:bypass|remove|removes|ignores?)\b[^,|]*\bstealth\b/i.test(text) ||
    /\b(?:armou?r\s+piercing|ignores?\s+prot)\b/i.test(text) ||
    /\b(?:bypass|break|ignores?)\s+guard\b|\bcan'?t\s+be\s+guarded\b/i.test(text);
  const cleansed = (text.match(cleanseSpans()) || []).filter((span) => !/stealth|guard/i.test(span));
  const applied = text.replace(cleanseSpans(), ' ');
  const body = applied.replace(riposteSpans(), ' ').replace(/cannot\s+be\s+stealthed[^,|]*/gi, ' ');

  resistChanges(body).forEach(({ sign, family }) => {
    if (scope === 'target' && sign === '-') out.add(`resistDown:${family}`);
    else if (scope !== 'target' && sign === '+') out.add(`resistUp:${family}`);
    else if (scope !== 'target' && sign === '-') out.add('selfDebuff');
  });

  // En cualquier alcance.
  if (/\btorch\s*[+-]\s*\d|[+-]\s*\d+\s+torch\b/i.test(body)) out.add('torch');
  if (/\+\s*\d+(?:\.\d+)?\s*%?\s*(?:dmg|crit|acc)\s+(?:vs|per)\b/i.test(body)) out.add('bonus');
  if (OWN_MOVE.test(body)) out.add('selfMove');
  if (/\bcontrolled\s+burn\b/i.test(body)) out.add('controlledBurn');
  if (/\bburn\s+(?:decay|skill\s+(?:amount|chance))\b/i.test(body)) out.add('burnBoost');
  // Un riposte es siempre de quien lanza la skill, aunque la clausula vaya al
  // enemigo: el "Activates Riposte" del Duelist's Advance del Highwayman.
  if (/\briposte\b/i.test(body)) out.add('riposte');

  if (scope === 'target') {
    if (cleansed.length) out.add('cleanse');
    if (bypass) out.add('bypass');
    if (applies(body, 'stun')) out.add('stun');
    if (applies(body, 'blight')) out.add('blight');
    if (applies(body, 'bleed')) out.add('bleed');
    if (applies(body.replace(NOT_APPLYING_BURN, ' '), 'burn')) out.add('burn');
    if (applies(body, 'disease')) out.add('disease');
    if (/\bmark\s+target\b/i.test(body)) out.add('mark');
    if (/\b(?:knockback|pull)\s*\d/i.test(body) || /\bshuffle\b/i.test(body)) out.add('enemyMove');
    if (
      STAT_DOWN.test(body) ||
      /\+\s*\d+\s*%\s*dmg\s+taken/i.test(body) ||
      /\+\s*\d+\s*%\s*crits?\s+received/i.test(body)
    ) {
      out.add('debuff');
    }
    return;
  }

  // Aliados y uno mismo.
  if (cleansed.length) out.add('cleanse');
  if (bypass) out.add('bypass');
  if (/\bheal\b(?!ing)/i.test(body)) out.add('heal');
  const stress = stressKinds(body);
  if (stress.has('heal') || stress.has('resist')) out.add('stressHeal');
  if (stress.has('cost')) out.add('selfDebuff');
  if (/\bguard\b/i.test(body)) out.add('guard');
  if (/\b(?:damage\s+)?block\b|\baegis\b/i.test(body)) out.add('block');
  if (/\briposte\b/i.test(body)) out.add('riposte');
  if (/\bstealth\b/i.test(body) && !bypass) out.add('stealth');
  if (/\b(?:knockback|pull)\s*\d/i.test(body)) out.add('selfMove');

  // Lo que la skill te cuesta: marcarte, sangrarte, bajarte algo.
  if (scope === 'self' && (/\bmark\s+self\b/i.test(body) || /(?:^|,)\s*mark\b(?!\s+target)/i.test(body))) {
    out.add('selfDebuff');
  }
  if (applies(body, 'bleed')) out.add('selfBleed');
  if (applies(body, 'blight') || STAT_DOWN.test(body)) out.add('selfDebuff');

  if (
    /\+\s*\d+(?:\.\d+)?\s*%?\s*(?:prot|dodge|acc|spd|dmg|crit|virtue)\b(?!\s+(?:vs|per)\b)/i.test(body) ||
    /\+\s*\d+(?:\.\d+)?\s*%\s*healing\s+received/i.test(body) ||
    /\+\s*\d+(?:\.\d+)?\s*%\s*[a-z]+\s+skill\s+chance/i.test(body) ||
    /\+\s*\d+(?:\.\d+)?\s*%\s*death\s*blow\s+resist/i.test(body) ||
    /\bbonus\s+action\b|\battacks\s+(?:usable|can\s+target)\s+(?:in\s+)?any\s+position/i.test(body)
  ) {
    out.add('buff');
  }
};

/**
 * Background CSS para el marco: un color liso, o un degradado diagonal con
 * cortes duros-suaves, 70/30 con dos colores y 50/25/25 con tres.
 */
export const frameBackground = (colours) => {
  const [a, b, c] = colours;
  if (!a) return EFFECT_COLOURS.plain;
  if (!b) return a;
  if (!c) return `linear-gradient(135deg, ${a} 0%, ${a} 62%, ${b} 78%, ${b} 100%)`;
  return `linear-gradient(135deg, ${a} 0%, ${a} 42%, ${b} 54%, ${b} 70%, ${c} 80%, ${c} 100%)`;
};

const cache = new Map();

/**
 * @returns {{ categories: string[], colours: string[], background: string }}
 *   `categories` completas y ordenadas; `colours` son las (hasta tres) que se
 *   pintan. Una skill sin efecto, o que esta app no conoce, es `plain`.
 */
export const skillFrame = (heroClass, skill) => {
  const key = `${heroClass}|${skill}`;
  if (cache.has(key)) return cache.get(key);

  const entry = getSkillEffect(skill, heroClass) || getModdedSkillEffect(skill, heroClass);
  const found = new Set();
  if (entry) {
    const profile = skillProfile(heroClass, skill);
    const fallback =
      entry.kind === 'camp' || profile?.targetKind === 'ally'
        ? 'ally'
        : profile?.targetKind === 'self'
          ? 'self'
          : 'target';
    splitClauses(entry.effect).forEach((clause) => classifyClause(clause, scopeFor(clause, fallback), found));
  }

  const categories = CATEGORY_ORDER.filter((c) => found.has(c));
  const shown = categories.length ? categories.slice(0, MAX_STOPS) : ['plain'];
  const colours = shown.map(effectColour);
  const result = { categories: categories.length ? categories : ['plain'], colours, background: frameBackground(colours) };
  cache.set(key, result);
  return result;
};
