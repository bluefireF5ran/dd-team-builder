import { HERO_CLASSES } from '../data/heroes';

export const validateHero = (hero) => {
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];
  const quirks = hero.quirks || { positive: [], negative: [] };
  
  // Verificar si el héroe tiene alwaysActive
  const heroData = HERO_CLASSES[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const requiredSkills = isAlwaysActive ? 7 : 4;

  return {
    hasClass: !!hero.heroClass,
    skillsComplete: activeSkills.length === requiredSkills,
    skillsCount: activeSkills.length,
    campSkillsCount: activeCampSkills.length,
    hasTrinket1: !!hero.trinket1,
    hasTrinket2: !!hero.trinket2,
    trinketCount: (hero.trinket1 ? 1 : 0) + (hero.trinket2 ? 1 : 0),
    positiveQuirksCount: quirks.positive.length,
    negativeQuirksCount: quirks.negative.length,
    isComplete: !!hero.heroClass && activeSkills.length === requiredSkills
  };
};

export const validateTeam = (heroes) => {
  const validations = heroes.map(validateHero);
  const filledPositions = heroes.filter(h => h.heroClass).length;
  
  return {
    heroes: validations,
    isComplete: validations.every(v => v.isComplete) && filledPositions === 4,
    filledPositions,
    totalPositions: 4
  };
};