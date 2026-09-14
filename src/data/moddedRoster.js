import { HERO_CLASSES } from './heroes';

/**
 * The modded roster, loaded on demand.
 *
 * `modded_heroes.js` is ~135 kB gzipped, a third of what the app shipped at
 * first paint, and `showModdedHeroes` is off by default: most visitors never
 * see a modded class. So nothing imports that file directly any more. Every
 * reader goes through the getters below, which hand back empty data until
 * `loadModdedRoster` has fetched it as its own chunk, together with the
 * generated effects that describe it (`moddedEffectsGenerated.js`, read through
 * `moddedEffects.js`).
 *
 * The rule that keeps this correct: **a modded hero never enters app state
 * before the roster is there.** Components memoize what they derive from a
 * party, and a memo built without the roster would stay wrong until the party
 * changed. So the boot waits for it when the settings, the draft party or a
 * shared link need it (`index.js`), and every way in for a comp from outside
 * goes through `afterModdedRosterFor`. See AGENTS.md, "The modded roster loads
 * on demand".
 *
 * Anything a module derives from the roster at import time would freeze the
 * empty version, so derived indexes and caches are built through
 * `memoByModdedRoster`, which rebuilds them once the roster arrives.
 */

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_LIST = Object.freeze([]);
const EMPTY_EFFECTS = Object.freeze({
  MODDED_COMBAT_SKILL_EFFECTS_GENERATED: EMPTY_OBJECT,
  MODDED_CAMP_SKILL_EFFECTS_GENERATED: EMPTY_OBJECT,
  MODDED_TRINKET_EFFECTS_GENERATED: EMPTY_OBJECT
});

let roster = null;
// The generated effects for workshop classes. They only describe modded content,
// so they travel with the roster: same chunk, same moment, same version.
let effects = null;
let pending = null;
let version = 0;
const listeners = new Set();

export const getModdedHeroClasses = () => (roster ? roster.MODDED_HERO_CLASSES : EMPTY_OBJECT);
export const getModdedGeneralTrinkets = () => (roster ? roster.MODDED_GENERAL_TRINKETS : EMPTY_LIST);
export const getModdedGeneralTrinketMods = () => (roster ? roster.MODDED_GENERAL_TRINKET_MODS : EMPTY_OBJECT);
export const getModdedEffectsGenerated = () => effects || EMPTY_EFFECTS;

export const isModdedRosterLoaded = () => roster !== null;

/** Bumps every time the roster changes, so caches and React can tell. */
export const getModdedRosterVersion = () => version;

export const subscribeModdedRoster = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => listeners.forEach((listener) => listener());

/**
 * Hands the roster, and the generated effects that describe it, over. The app
 * does it from `loadModdedRoster`; tests do it up front.
 */
export const installModdedRoster = (module, generatedEffects = null) => {
  if (roster === module && effects === generatedEffects) return;
  roster = module;
  effects = generatedEffects;
  version += 1;
  notify();
};

/** Fetches the roster once; every caller shares the same promise. */
export const loadModdedRoster = () => {
  if (roster) return Promise.resolve(roster);
  if (!pending) {
    // One chunk name for both, so webpack ships them as a single download.
    pending = Promise.all([
      import(/* webpackChunkName: "modded-heroes" */ './modded_heroes'),
      import(/* webpackChunkName: "modded-heroes" */ './moddedEffectsGenerated')
    ])
      .then(([module, generatedEffects]) => {
        installModdedRoster(module, generatedEffects);
        return module;
      })
      .catch((error) => {
        // A failed fetch (offline, a deploy swapped the chunk) must not stick:
        // the next caller gets to try again.
        pending = null;
        throw error;
      });
  }
  return pending;
};

/**
 * A value derived from the roster, rebuilt the first time it is asked for after
 * the roster changes. Use it for anything that used to be computed at import.
 */
export const memoByModdedRoster = (build) => {
  let builtAt = -1;
  let value;
  return () => {
    if (builtAt !== version) {
      value = build();
      builtAt = version;
    }
    return value;
  };
};

// Loose on purpose: `leper` or `Man-at-Arms` from an old file are still vanilla
// and should not cost a download, but anything else might be modded.
const looseKey = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
const VANILLA_KEYS = new Set(Object.keys(HERO_CLASSES).map(looseKey));

/** True when a class name is not one of the vanilla classes (empty is not a class). */
export const isPossiblyModdedClass = (heroClass) =>
  typeof heroClass === 'string' && heroClass.trim() !== '' && !VANILLA_KEYS.has(looseKey(heroClass));

/** True when any hero in the list names a class vanilla does not have. */
export const heroesNeedModdedRoster = (heroes) =>
  Array.isArray(heroes) && heroes.some((hero) => hero && isPossiblyModdedClass(hero.heroClass));

/**
 * Resolves once the roster these heroes need is there: at once for a vanilla
 * party, after the fetch for one naming anything else.
 */
export const ensureModdedRosterFor = (heroes) =>
  heroesNeedModdedRoster(heroes) ? loadModdedRoster() : Promise.resolve(roster);

/**
 * Runs `task` once the roster these heroes need is there. Straight away, and
 * synchronously, for a vanilla party or a roster already loaded, so the
 * ordinary path stays as immediate as it was; after the fetch otherwise. A
 * failed fetch still runs it: the names stay as written, which is what the app
 * already does with a mod it does not carry.
 */
export const afterModdedRosterFor = (heroes, task) => {
  if (roster || !heroesNeedModdedRoster(heroes)) return task();
  return loadModdedRoster()
    .catch(() => null)
    .then(() => task());
};

/** Tests only: back to the unloaded state. */
export const resetModdedRosterForTests = () => {
  roster = null;
  effects = null;
  pending = null;
  version += 1;
  notify();
};
