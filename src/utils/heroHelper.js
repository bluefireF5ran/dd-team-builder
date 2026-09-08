import { EMPTY_HERO } from '../constants';

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
  const order = new Map((roster || []).map((name, i) => [name, i]));
  const rank = (name) => (order.has(name) ? order.get(name) : Number.MAX_SAFE_INTEGER);
  return [...(selected || [])].sort((a, b) => rank(a) - rank(b));
};
