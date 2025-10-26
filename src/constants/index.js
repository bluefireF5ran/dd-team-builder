export const HERO_CONFIG = {
  MAX_SKILLS: 4,
  MAX_CAMP_SKILLS: 4,
  MAX_TRINKETS: 2,
  MAX_POSITIVE_QUIRKS: 5,
  MAX_NEGATIVE_QUIRKS: 5,
  MAX_LOCKED_QUIRKS: 3
};

export const PARTY_CONFIG = {
  MAX_HEROES: 4,
  POSITIONS: [1, 2, 3, 4]
};

export const EMPTY_HERO = {
  heroClass: '',
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] }
};