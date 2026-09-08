/**
 * Diseases, the third thing a hero carries next to positive and negative quirks.
 *
 * They are a separate list on the hero rather than negative quirks that happen
 * to read differently: the game keeps them apart, they are cured in a different
 * building, and folding them into `quirks.negative` would mean three diseases
 * cost you three of the five negative quirk slots.
 *
 * Names are the game's own (`str_quirk_name_*`), same rule as the trinket and
 * quirk rosters. `src/data/quirkEffects.js` is the generated lookup that says
 * what each one does.
 */

/** Base game plus the two Color of Madness ones, which need no toggle. */
export const DISEASES = [
  'Bad Humours', 'Bulimic', 'Creeping Cough', 'Ennui', 'Grey Rot', 'Hemophilia',
  'Hysterical Blindness', 'Lethargy', 'Rabies', 'Scurvy', 'Sky Taint',
  'Spasm of the Entrails', 'Spotted Fever', 'Syphilis', 'Tapeworm', 'Tetanus',
  'The Ague', 'The Black Plague', 'The Fits', 'The Red Plague', 'The Runs',
  'The Worries', 'Vampiric Spirits', 'Vertigo', 'Wasting Sickness'
];

/**
 * The Crimson Curse and its three stages, behind their own toggle: a party
 * planned without the Crimson Court DLC can never meet them.
 */
export const CRIMSON_COURT_DISEASES = [
  'Crimson Curse',
  'Crimson Curse (craving)',
  'Crimson Curse (wasting)',
  'Crimson Curse (blood lust!)'
];

export const ALL_DISEASES = [...DISEASES, ...CRIMSON_COURT_DISEASES];

const CRIMSON_SET = new Set(CRIMSON_COURT_DISEASES);
const ALL_SET = new Set(ALL_DISEASES);

export const isDisease = (name) => ALL_SET.has(name);
export const isCrimsonCourtDisease = (name) => CRIMSON_SET.has(name);

/** The list to offer, which is the plain one until the DLC toggle is on. */
export const availableDiseases = (showCrimsonCourt) =>
  showCrimsonCourt ? ALL_DISEASES : DISEASES;
