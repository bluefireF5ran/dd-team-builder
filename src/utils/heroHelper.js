import { EMPTY_HERO } from '../constants';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import { nameKey } from './nameNormalizer';

export const createEmptyHero = () => ({ ...EMPTY_HERO, quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }, diseases: [] });

export const resetHeroConfiguration = () => createEmptyHero();

export const hasHeroConfiguration = (hero) => {
  return (
    (hero.activeSkills && hero.activeSkills.length > 0) ||
    (hero.activeCampSkills && hero.activeCampSkills.length > 0) ||
    hero.trinket1 ||
    hero.trinket2 ||
    (hero.quirks?.positive && hero.quirks.positive.length > 0) ||
    (hero.quirks?.negative && hero.quirks.negative.length > 0) ||
    (hero.diseases && hero.diseases.length > 0)
  );
};

export const cloneHero = (hero) => {
  return {
    ...hero,
    activeSkills: [...(hero.activeSkills || [])],
    activeCampSkills: [...(hero.activeCampSkills || [])],
    diseases: [...(hero.diseases || [])],
    quirks: {
      positive: [...(hero.quirks?.positive || [])],
      negative: [...(hero.quirks?.negative || [])]
    },
    lockedQuirks: {
      positive: [...(hero.lockedQuirks?.positive || [])],
      negative: [...(hero.lockedQuirks?.negative || [])]
    }
  };
};

/**
 * Puts a selection back into the order the class declares its skills in.
 *
 * Only ever called when a slot actually changes, never on load: a comp built
 * with a deliberate reading order keeps it until you touch it. That is the
 * whole point of the auto-sort setting - it tidies what you edit and leaves
 * what you merely open alone.
 *
 * Anything the class does not declare (a modded skill, a renamed one) keeps
 * its relative order at the end rather than being dropped or floated to the
 * front, because sorting must never lose a selection.
 */
export const sortToRoster = (selected, roster) => {
  // Por `nameKey` y no por el nombre crudo: una ficha guardada puede traer
  // `Snakeskin` donde el kit dice `Snake Skin`, y ordenar por texto exacto
  // mandaria al final justo la skill que si esta en el kit.
  const order = new Map((roster || []).map((name, i) => [nameKey(name), i]));
  const rank = (name) => {
    const found = order.get(nameKey(name));
    return found === undefined ? Number.MAX_SAFE_INTEGER : found;
  };
  return [...(selected || [])].sort((a, b) => rank(a) - rank(b));
};

const kitOf = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

/**
 * Las skills y camp skills de un heroe, en el orden en que las declara su clase
 * -- que es el orden en que salen en el juego.
 *
 * Es lo que se aplica a **lo que genera la app**: una loadout recomendada sale
 * de contar frecuencias o de puntuar por rango, y ese orden no significa nada
 * para quien la lee; el del juego si. La preferencia `autoSortSkills` es otra
 * cosa y sigue mandando sobre lo que edita Fran a mano.
 *
 * Devuelve un objeto nuevo; no toca el que le pasan.
 */
export const sortHeroSelections = (hero) => {
  const data = kitOf(hero?.heroClass);
  if (!data) return hero;
  return {
    ...hero,
    activeSkills: sortToRoster(hero.activeSkills, data.skills),
    activeCampSkills: sortToRoster(hero.activeCampSkills, data.campSkills)
  };
};
