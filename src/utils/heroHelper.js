import { EMPTY_HERO } from '../constants';

export const createEmptyHero = () => ({ ...EMPTY_HERO });

export const resetHeroConfiguration = () => createEmptyHero();

export const hasHeroConfiguration = (hero) => {
  return (
    (hero.activeSkills && hero.activeSkills.length > 0) ||
    (hero.activeCampSkills && hero.activeCampSkills.length > 0) ||
    hero.trinket1 ||
    hero.trinket2 ||
    (hero.quirks?.positive && hero.quirks.positive.length > 0) ||
    (hero.quirks?.negative && hero.quirks.negative.length > 0)
  );
};

export const cloneHero = (hero) => {
  return {
    ...hero,
    activeSkills: [...(hero.activeSkills || [])],
    activeCampSkills: [...(hero.activeCampSkills || [])],
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