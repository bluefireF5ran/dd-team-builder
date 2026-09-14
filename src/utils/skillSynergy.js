/**
 * Que skill de la party prepara a cual, y cual cobra lo que otra prepara.
 *
 * `synergyHelper` ya decia "Mark synergy: Bounty Hunter marks, Arbalest cashes
 * it in", pero en un panel aparte y solo para la marca. La pregunta que se hace
 * un jugador mirando una loadout es mas concreta: *esta* skill, ¿con que otra
 * de la party encaja? Eso es lo que se contesta aqui, skill por skill, para
 * poder decirlo donde se esta mirando -- en el hover de la skill.
 *
 * ## Las dos mitades
 *
 * - **enabler**: la skill APLICA la condicion. Se lee de `skillProfile`, que ya
 *   distingue aplicar de bonificar (`+60% DMG vs Stunned` no aturde).
 * - **payoff**: la skill pega mas o hace algo extra `vs <condicion>`. Se lee
 *   del texto de efecto, con la forma exacta que usan los datos.
 *
 * Solo cuatro condiciones, porque son las que tienen las dos mitades: el
 * payoff escrito (`vs Marked` 90 veces, `vs Bleeding` 34, `vs Stunned` 24,
 * `vs Blighted` 24) y el enabler etiquetado. `vs Burning` existe pero no hay
 * etiqueta `burn`, y anadirla cambiaria el vocabulario que leen el generador
 * de comps y `partyCoverage`.
 *
 * ## Solo lo elegido
 *
 * A diferencia de `synergyHelper`, un heroe sin skills elegidas NO se juzga por
 * su kit: esto describe la loadout que tienes delante, y "tu Arbalest cobra la
 * marca de una skill que el Bounty Hunter no lleva" seria falso.
 */
import { skillProfile } from './skillProfile';
import { getSkillEffect } from '../data/skillEffects';
import { getModdedSkillEffect } from '../data/moddedEffects';

export const SYNERGY_KEYWORDS = ['mark', 'stun', 'bleed', 'blight'];

const PAYOFF_PATTERN = {
  mark: /\bvs\.?\s+Marked?\b/i,
  stun: /\bvs\.?\s+Stunned\b/i,
  bleed: /\bvs\.?\s+Bleeding\b/i,
  blight: /\bvs\.?\s+Blighted\b/i,
};

const effectText = (heroClass, skill) => {
  const entry = getSkillEffect(skill, heroClass) || getModdedSkillEffect(skill, heroClass);
  return entry && entry.kind !== 'camp' ? entry.effect || '' : '';
};

/** Las condiciones que esta skill cobra. */
export const payoffsOf = (heroClass, skill) => {
  const text = effectText(heroClass, skill);
  return SYNERGY_KEYWORDS.filter((k) => PAYOFF_PATTERN[k].test(text));
};

/** Las condiciones que esta skill aplica. */
export const enablersOf = (heroClass, skill) => {
  const profile = skillProfile(heroClass, skill);
  if (!profile) return [];
  return SYNERGY_KEYWORDS.filter((k) => profile.tags.has(k));
};

const chosenSkills = (heroes) =>
  (heroes || []).flatMap((hero, heroIndex) =>
    hero && hero.heroClass
      ? (hero.activeSkills || []).filter(Boolean).map((skill) => ({ heroIndex, heroClass: hero.heroClass, skill }))
      : []
  );

/**
 * Las sinergias de UNA skill dentro de la party.
 *
 * @param {object[]} heroes     la party, en el orden de `useTeam` (indice 0 = rango 1)
 * @param {number}   heroIndex  el heroe que lleva la skill
 * @param {string}   skill
 * @returns {{ keyword: string, role: 'payoff'|'enabler', partners: {heroIndex:number, heroClass:string, skill:string, self:boolean}[] }[]}
 *   Solo las que tienen al menos un companero; una marca sin nadie que la cobre
 *   ya la avisa `synergyHelper`.
 */
export const skillSynergies = (heroes, heroIndex, skill) => {
  const hero = heroes?.[heroIndex];
  if (!hero?.heroClass || !skill) return [];

  const others = chosenSkills(heroes).filter((s) => !(s.heroIndex === heroIndex && s.skill === skill));
  const withSelf = (s) => ({ ...s, self: s.heroIndex === heroIndex });
  const out = [];

  payoffsOf(hero.heroClass, skill).forEach((keyword) => {
    const partners = others.filter((s) => enablersOf(s.heroClass, s.skill).includes(keyword)).map(withSelf);
    if (partners.length) out.push({ keyword, role: 'payoff', partners });
  });
  enablersOf(hero.heroClass, skill).forEach((keyword) => {
    const partners = others.filter((s) => payoffsOf(s.heroClass, s.skill).includes(keyword)).map(withSelf);
    if (partners.length) out.push({ keyword, role: 'enabler', partners });
  });
  return out;
};

const LABEL = { mark: 'Mark', stun: 'Stun', bleed: 'Bleed', blight: 'Blight' };

/**
 * Las sinergias como lineas de hover: "Mark → cashed in by Arbalest (Sniper Shot)".
 *
 * La palabra clave va delante para que `Keywords` la pinte del color del juego
 * y la linea se lea enlazada con la del efecto que tiene justo encima.
 */
export const synergyLines = (synergies) =>
  synergies.map(({ keyword, role, partners }) => {
    const who = partners
      .map((p) => (p.self ? `own ${p.skill}` : `${p.heroClass} (${p.skill})`))
      .join(', ');
    return role === 'payoff'
      ? `Synergy: ${LABEL[keyword]} set up by ${who}`
      : `Synergy: ${LABEL[keyword]} cashed in by ${who}`;
  });
