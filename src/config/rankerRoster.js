// ---------------------------------------------------------------------------
// DD Ranker — roster configuration
//
// This is the master list of heroes the ranking engine knows about.
// Adding a hero here also adds ALL of its skills and camp skills to the
// "Skills" and "Camp Skills" rankings automatically.
//
// - DEFAULT_ACTIVE_HEROES: turned on out of the box (the 20 vanilla classes).
// - EXTRA_HEROES: hand-added classes (usually modded ones). Any name that
//   exists in src/data/modded_heroes.js or src/data/heroes.js works here.
//
// The in-app Roster panel edits the same list and stores it in localStorage
// under ROSTER_STORAGE_KEY; use its "Copy as config" button to paste the
// result back into this file so it becomes the new permanent default.
// ---------------------------------------------------------------------------

export const DEFAULT_ACTIVE_HEROES = [
  'Abomination',
  'Antiquarian',
  'Arbalest',
  'Bounty Hunter',
  'Crusader',
  'Duelist',
  'Flagellant',
  'Grave Robber',
  'Hellion',
  'Highwayman',
  'Houndmaster',
  'Jester',
  'Leper',
  'Man at Arms',
  'Musketeer',
  'Occultist',
  'Plague Doctor',
  'Runaway',
  'Shieldbreaker',
  'Vestal'
];

// Add modded / extra hero class names here, e.g. 'War', 'Alchemist'.
// They start inactive unless listed in DEFAULT_ACTIVE_HEROES too.
export const EXTRA_HEROES = [];

export const ROSTER_STORAGE_KEY = 'dd_ranker_roster_v1';
export const SESSION_STORAGE_KEY = 'dd_ranker_session_v1';
export const RESULTS_STORAGE_KEY = 'dd_ranker_results_v1';
export const GENERALIST_STORAGE_KEY = 'dd_ranker_generalist_v1';
// Which region the comp ranking is scoped to. Comps are ranked per region
// because a comp IS built for a region -- the enemy pool, the DoT resistances
// and the corpse/size mix all differ -- so a single global comp order would be
// averaging four different questions into one.
export const COMP_REGION_STORAGE_KEY = 'dd_ranker_comp_region_v1';

export const RANKING_CATEGORIES = [
  {
    id: 'heroes',
    label: 'Heroes',
    blurb: 'Which hero would you rather bring?',
    icon: 'shield'
  },
  {
    id: 'skills',
    label: 'Skills',
    blurb: 'Which combat skill is stronger?',
    icon: 'swords'
  },
  {
    id: 'campSkills',
    label: 'Camp Skills',
    blurb: 'Which camp skill would you rather use?',
    icon: 'flame'
  },
  {
    id: 'comps',
    label: 'Comps',
    blurb: 'Which party would you rather take in?',
    icon: 'users'
  }
];

// The whole library is ~160 comps, and an exact pairwise sort of that many is
// well over a thousand picks. Scoping to one region is what makes the run
// finishable, and it is also the right question: a comp is built FOR a region.
export const COMP_REGIONS = [
  'The Ruins',
  'The Warrens',
  'The Weald',
  'The Cove'
];
