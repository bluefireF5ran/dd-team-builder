export const HERO_CONFIG = {
  MAX_SKILLS: 4,
  MAX_CAMP_SKILLS: 4,
  MAX_TRINKETS: 2,
  MAX_POSITIVE_QUIRKS: 5,
  MAX_NEGATIVE_QUIRKS: 5,
  MAX_LOCKED_QUIRKS: 3,
  // Diseases are their own three slots in the Sanitarium, not five more quirk
  // slots, so they cannot crowd out a negative quirk.
  MAX_DISEASES: 3
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
  lockedQuirks: { positive: [], negative: [] },
  diseases: []
};

// Nuevos tipos de contenido
export const CONTENT_TYPES = {
  VANILLA: 'vanilla',
  BACKER: 'backer',
  MODDED: 'modded'
};

// Cuantas comps por pagina ofrece la libreria; 0 es "todas". Vive aqui porque
// lo usan el modal y los ajustes, y las dos listas tienen que coincidir.
export const PAGE_SIZES = [12, 24, 48, 0];

// UI constants
export const UI_CONFIG = {
  IMAGE_TEST_BATCH_SIZE: 20,
  TOAST_DURATION_MS: 3000
};

// Data constants
export const COMMON_VANILLA_CAMP_SKILLS = ['Encourage', 'Wound Care', 'Pep Talk'];