import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../data/modded_heroes';
import { TRINKETS } from '../data/trinkets';

import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../data/quirks';
import { EMPTY_HERO, PARTY_CONFIG, HERO_CONFIG } from '../constants';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = (arr, count) => shuffle(arr).slice(0, count);

export const generateRandomTeam = (includeModded = false) => {
  const vanillaClasses = Object.keys(HERO_CLASSES);
  const moddedClasses = includeModded ? Object.keys(MODDED_HERO_CLASSES) : [];
  const allClasses = [...vanillaClasses, ...moddedClasses];

  // Pick 4 unique hero classes
  const selectedClasses = pickRandom(allClasses, PARTY_CONFIG.MAX_HEROES);

  const heroes = selectedClasses.map((heroClass) => {
    const heroData = HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];
    const isAlwaysActive = heroData?.alwaysActive || false;
    const allSkills = heroData?.skills || [];
    const allCampSkills = heroData?.campSkills || [];

    // For alwaysActive heroes, use all skills; otherwise pick 4
    const activeSkills = isAlwaysActive ? allSkills : pickRandom(allSkills, HERO_CONFIG.MAX_SKILLS);
    const activeCampSkills = pickRandom(allCampSkills, HERO_CONFIG.MAX_CAMP_SKILLS);

    // Pick trinkets: try hero-specific first, then generic
    const classTrinkets = heroData?.classSpecificTrinkets || [];
    const allGenericTrinkets = [...TRINKETS, ...(includeModded ? MODDED_GENERAL_TRINKETS : [])];
    const trinketPool = [...classTrinkets, ...allGenericTrinkets];
    const pickedTrinkets = pickRandom(trinketPool, 2);

    // Pick random quirks (2-3 positive, 1-2 negative)
    const positiveCount = 2 + Math.floor(Math.random() * 2);
    const negativeCount = 1 + Math.floor(Math.random() * 2);
    const positiveQuirks = pickRandom(POSITIVE_QUIRKS, positiveCount);
    const negativeQuirks = pickRandom(NEGATIVE_QUIRKS, negativeCount);

    return {
      ...EMPTY_HERO,
      heroClass,
      activeSkills,
      activeCampSkills,
      trinket1: pickedTrinkets[0] || '',
      trinket2: pickedTrinkets[1] || '',
      quirks: { positive: positiveQuirks, negative: negativeQuirks },
      lockedQuirks: { positive: [], negative: [] }
    };
  });

  return heroes;
};
