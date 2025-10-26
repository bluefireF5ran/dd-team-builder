import { useState, useCallback } from 'react';
import { HERO_CONFIG } from '../constants';
import { hasHeroConfiguration, resetHeroConfiguration } from '../utils/heroHelper';

export const useHero = (initialHero, onUpdate) => {
  const [hero, setHero] = useState(initialHero);

  const updateHeroField = useCallback((field, value) => {
    const updatedHero = { ...hero, [field]: value };
    setHero(updatedHero);
    onUpdate(updatedHero);
  }, [hero, onUpdate]);

  const changeHeroClass = useCallback((newClass) => {
    if (hero.heroClass && hero.heroClass !== newClass && hasHeroConfiguration(hero)) {
      const confirmed = window.confirm(
        'Changing hero class will reset all configuration (skills, camp skills, trinkets, and quirks). Continue?'
      );
      if (!confirmed) return false;
    }

    const resetHero = {
      ...resetHeroConfiguration(),
      heroClass: newClass
    };
    setHero(resetHero);
    onUpdate(resetHero);
    return true;
  }, [hero, onUpdate]);

  const resetHero = useCallback(() => {
    const confirmed = window.confirm(
      'This will reset all configuration for this hero (skills, camp skills, trinkets, and quirks). Continue?'
    );
    if (confirmed) {
      const emptyHero = resetHeroConfiguration();
      setHero(emptyHero);
      onUpdate(emptyHero);
    }
  }, [onUpdate]);

  const toggleSkill = useCallback((skill) => {
    const activeSkills = hero.activeSkills || [];
    const newActive = activeSkills.includes(skill)
      ? activeSkills.filter(s => s !== skill)
      : activeSkills.length < HERO_CONFIG.MAX_SKILLS
      ? [...activeSkills, skill]
      : activeSkills;
    updateHeroField('activeSkills', newActive);
  }, [hero.activeSkills, updateHeroField]);

  const toggleCampSkill = useCallback((skill) => {
    const activeCamp = hero.activeCampSkills || [];
    const newActive = activeCamp.includes(skill)
      ? activeCamp.filter(s => s !== skill)
      : activeCamp.length < HERO_CONFIG.MAX_CAMP_SKILLS
      ? [...activeCamp, skill]
      : activeCamp;
    updateHeroField('activeCampSkills', newActive);
  }, [hero.activeCampSkills, updateHeroField]);

  return {
    hero,
    updateHeroField,
    changeHeroClass,
    resetHero,
    toggleSkill,
    toggleCampSkill
  };
};