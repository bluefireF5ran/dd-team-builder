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

// Nuevos tipos de contenido
export const CONTENT_TYPES = {
  VANILLA: 'vanilla',
  BACKER: 'backer',
  MODDED: 'modded'
};

// UI constants
export const UI_CONFIG = {
  IMAGE_TEST_BATCH_SIZE: 20,
  TOAST_DURATION_MS: 3000
};

// Data constants
export const COMMON_VANILLA_CAMP_SKILLS = ['Encourage', 'Wound Care', 'Pep Talk'];