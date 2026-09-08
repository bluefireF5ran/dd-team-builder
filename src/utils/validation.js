import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import { HERO_CONFIG, PARTY_CONFIG } from '../constants';

export const validateHero = (hero) => {
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];
  const quirks = hero.quirks || { positive: [], negative: [] };

  // Check both vanilla and modded heroes for alwaysActive
  const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const requiredSkills = isAlwaysActive ? (heroData.skills?.length || 7) : HERO_CONFIG.MAX_SKILLS;

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
    diseasesCount: (hero.diseases || []).length,
    isComplete: !!hero.heroClass && activeSkills.length === requiredSkills
  };
};

export const validateTeam = (heroes) => {
  const validations = heroes.map(validateHero);
  const filledPositions = heroes.filter(h => h.heroClass).length;

  return {
    heroes: validations,
    isComplete: validations.every(v => v.isComplete) && filledPositions === PARTY_CONFIG.MAX_HEROES,
    filledPositions,
    totalPositions: PARTY_CONFIG.MAX_HEROES
  };
};

/**
 * Comprueba un heroe suelto contra los limites de HERO_CONFIG. Los errores vienen
 * sin prefijo ("heroClass must be a string") para que sirvan tanto pegando un
 * heroe desde el portapapeles como dentro de un equipo, que solo les antepone su
 * indice. Un unico sitio donde viven los limites.
 */
export const validateHeroSchema = (hero) => {
  const errors = [];

  if (!hero || typeof hero !== 'object') {
    return { valid: false, errors: [NOT_AN_OBJECT] };
  }

  if (typeof hero.heroClass !== 'string') {
    errors.push('heroClass must be a string');
  }

  if (!Array.isArray(hero.activeSkills)) {
    errors.push('activeSkills must be an array');
  } else {
    const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
    // An unrecognised class gets a loose ceiling rather than the four-skill
    // cap. We cannot know what a mod we do not carry allows, and rejecting the
    // comp for it would lose content the rest of the app is careful to keep -
    // canonicalizeHeroClass deliberately hands back names it does not know.
    // An empty heroClass is an unconfigured slot, not a foreign mod: it keeps
    // the ordinary cap.
    const isForeignClass = !heroData && typeof hero.heroClass === 'string' && hero.heroClass !== '';
    const maxSkills = isForeignClass
      ? HERO_CONFIG.MAX_SKILLS_UNKNOWN_CLASS
      : heroData?.alwaysActive
      ? heroData.skills?.length || 7
      : HERO_CONFIG.MAX_SKILLS;
    if (hero.activeSkills.length > maxSkills) {
      errors.push(`activeSkills exceeds max of ${maxSkills}`);
    }
  }

  if (!Array.isArray(hero.activeCampSkills)) {
    errors.push('activeCampSkills must be an array');
  } else if (hero.activeCampSkills.length > HERO_CONFIG.MAX_CAMP_SKILLS) {
    errors.push(`activeCampSkills exceeds max of ${HERO_CONFIG.MAX_CAMP_SKILLS}`);
  }

  if (hero.trinket1 !== undefined && typeof hero.trinket1 !== 'string') {
    errors.push('trinket1 must be a string');
  }

  if (hero.trinket2 !== undefined && typeof hero.trinket2 !== 'string') {
    errors.push('trinket2 must be a string');
  }

  if (hero.quirks !== undefined) {
    if (typeof hero.quirks !== 'object' || hero.quirks === null) {
      errors.push('quirks must be an object');
    } else {
      if (!Array.isArray(hero.quirks.positive)) {
        errors.push('quirks.positive must be an array');
      } else if (hero.quirks.positive.length > HERO_CONFIG.MAX_POSITIVE_QUIRKS) {
        errors.push(`quirks.positive exceeds max of ${HERO_CONFIG.MAX_POSITIVE_QUIRKS}`);
      }
      if (!Array.isArray(hero.quirks.negative)) {
        errors.push('quirks.negative must be an array');
      } else if (hero.quirks.negative.length > HERO_CONFIG.MAX_NEGATIVE_QUIRKS) {
        errors.push(`quirks.negative exceeds max of ${HERO_CONFIG.MAX_NEGATIVE_QUIRKS}`);
      }
    }
  }

  if (hero.diseases !== undefined) {
    if (!Array.isArray(hero.diseases)) {
      errors.push('diseases must be an array');
    } else if (hero.diseases.length > HERO_CONFIG.MAX_DISEASES) {
      errors.push(`diseases exceeds max of ${HERO_CONFIG.MAX_DISEASES}`);
    }
  }

  if (hero.lockedQuirks !== undefined) {
    if (typeof hero.lockedQuirks !== 'object' || hero.lockedQuirks === null) {
      errors.push('lockedQuirks must be an object');
    } else {
      if (!Array.isArray(hero.lockedQuirks.positive)) {
        errors.push('lockedQuirks.positive must be an array');
      } else if (hero.lockedQuirks.positive.length > HERO_CONFIG.MAX_LOCKED_QUIRKS) {
        errors.push(`lockedQuirks.positive exceeds max of ${HERO_CONFIG.MAX_LOCKED_QUIRKS}`);
      }
      if (!Array.isArray(hero.lockedQuirks.negative)) {
        errors.push('lockedQuirks.negative must be an array');
      } else if (hero.lockedQuirks.negative.length > HERO_CONFIG.MAX_LOCKED_QUIRKS) {
        errors.push(`lockedQuirks.negative exceeds max of ${HERO_CONFIG.MAX_LOCKED_QUIRKS}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

const NOT_AN_OBJECT = 'hero must be an object';

/** Los errores de un heroe dentro de un equipo llevan su indice delante. */
const withHeroIndex = (idx, error) =>
  error === NOT_AN_OBJECT ? `hero[${idx}] must be an object` : `hero[${idx}].${error}`;

export const validateTeamSchema = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid file: not a valid object'] };
  }

  // teamName
  if (data.teamName !== undefined && typeof data.teamName !== 'string') {
    errors.push('teamName must be a string');
  }

  // location
  if (data.location !== undefined && typeof data.location !== 'string') {
    errors.push('location must be a string');
  }

  // heroes array
  if (!Array.isArray(data.heroes)) {
    errors.push('heroes must be an array');
  } else {
    if (data.heroes.length !== PARTY_CONFIG.MAX_HEROES) {
      errors.push(`heroes must have exactly ${PARTY_CONFIG.MAX_HEROES} entries`);
    }

    data.heroes.forEach((hero, idx) => {
      validateHeroSchema(hero).errors.forEach((e) => errors.push(withHeroIndex(idx, e)));
    });
  }

  return { valid: errors.length === 0, errors };
};