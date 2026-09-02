import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../data/modded_heroes';
import { TRINKETS } from '../data/trinkets';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../data/quirks';
import { EMPTY_HERO, PARTY_CONFIG, HERO_CONFIG } from '../constants';
import { PRESET_COMP_ENTRIES } from '../data/presetComps';
import {
  toRosterCounts,
  expandRoster,
  compFitsRoster,
  rosterSize
} from './rosterAvailability';
import { nameKey } from './nameNormalizer';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = (arr, count) => shuffle(arr).slice(0, count);

export const buildHeroFromClass = (heroClass, includeModded) => {
  const heroData = HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const allSkills = heroData?.skills || [];
  const allCampSkills = heroData?.campSkills || [];

  const activeSkills = isAlwaysActive ? allSkills : pickRandom(allSkills, HERO_CONFIG.MAX_SKILLS);
  const activeCampSkills = pickRandom(allCampSkills, HERO_CONFIG.MAX_CAMP_SKILLS);

  const classTrinkets = heroData?.classSpecificTrinkets || [];
  const allGenericTrinkets = [...TRINKETS, ...(includeModded ? MODDED_GENERAL_TRINKETS : [])];
  const trinketPool = [...classTrinkets, ...allGenericTrinkets];
  const pickedTrinkets = pickRandom(trinketPool, 2);

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
};

export const generateRandomTeam = (includeModded = false) => {
  const vanillaClasses = Object.keys(HERO_CLASSES);
  const moddedClasses = includeModded ? Object.keys(MODDED_HERO_CLASSES) : [];
  const allClasses = [...vanillaClasses, ...moddedClasses];

  const selectedClasses = pickRandom(allClasses, PARTY_CONFIG.MAX_HEROES);
  return selectedClasses.map((heroClass) => buildHeroFromClass(heroClass, includeModded));
};

/**
 * Los héroes de un preset, completados con los campos que el JSON pueda omitir.
 */
const formatPresetHeroes = (heroes) => {
  return heroes.map((h) => ({
    ...EMPTY_HERO,
    ...h,
    quirks: h.quirks || { positive: [], negative: [] },
    lockedQuirks: h.lockedQuirks || { positive: [], negative: [] }
  }));
};

/**
 * Which of your heroes should take a slot, when you own more than one of the
 * class. Ready before busy, then the more experienced, then the calmer one —
 * which is the order a player picks in anyway.
 */
const bySuitability = (a, b) => {
  const ready = (hero) => (!hero.activity && !hero.isMissing ? 0 : 1);
  return (
    ready(a) - ready(b) ||
    (b.resolveXp || 0) - (a.resolveXp || 0) ||
    (a.stress || 0) - (b.stress || 0)
  );
};

/**
 * Puts your actual heroes into a comp.
 *
 * The comp is the *build* — its skills and trinkets are the recommendation, and
 * they stay. What comes from the save is everything you cannot choose: the
 * quirks that hero is stuck with, the ones locked in, and any disease. Handing
 * back a Plague Doctor with blank quirks when yours has Kleptomaniac and the
 * Red Plague would be describing someone else's hero.
 */
const assignSaveHeroes = (heroes, saveHeroes) => {
  if (!Array.isArray(saveHeroes) || !saveHeroes.length) return { heroes, assigned: [] };

  const pool = new Map();
  [...saveHeroes].sort(bySuitability).forEach((hero) => {
    const key = nameKey(hero.heroClass);
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(hero);
  });

  const assigned = [];
  const merged = heroes.map((hero) => {
    // `shift` is what stops one hero filling two slots of a doubled comp.
    const mine = pool.get(nameKey(hero.heroClass))?.shift();
    if (!mine) return hero;
    assigned.push(mine.name || hero.heroClass);
    return {
      ...hero,
      quirks: {
        positive: [...(mine.quirks?.positive || [])],
        negative: [...(mine.quirks?.negative || [])]
      },
      lockedQuirks: {
        positive: [...(mine.lockedQuirks?.positive || [])],
        negative: [...(mine.lockedQuirks?.negative || [])]
      },
      diseases: [...(mine.diseases || [])]
    };
  });

  return { heroes: merged, assigned };
};

const trinketsOf = (comp) =>
  (comp?.heroes || []).flatMap((hero) => [hero.trinket1, hero.trinket2]).filter(Boolean);

/** The trinkets a comp calls for that are not in your inventory. */
const missingTrinketsFor = (comp, ownedKeys) => [
  ...new Set(trinketsOf(comp).filter((name) => !ownedKeys.has(nameKey(name))))
];

/**
 * Sugiere una composición de preset que el roster puede formar de verdad; si no
 * hay ninguna, genera una aleatoria como fallback.
 *
 * `roster` cuenta: una lista con repeticiones (o un mapa de cuentas) dice
 * cuántos tienes de cada clase, y una comp de cuatro Bufones sólo se ofrece si
 * tienes cuatro. Antes se comparaba contra un `Set`, así que un solo Anticuario
 * bastaba para que apareciera una comp que pedía cuatro.
 *
 * @param options.saveHeroes  héroes importados de la partida, para vestir la comp
 * @param options.ownedTrinkets  inventario; con `requireOwnedTrinkets` filtra
 * @param options.requireOwnedTrinkets  sólo comps que puedas equipar entera
 */
export const generateRandomTeamFromRoster = (roster = [], includeModded = false, options = {}) => {
  const { saveHeroes = null, ownedTrinkets = null, requireOwnedTrinkets = false } = options;
  const counts = toRosterCounts(roster);

  const allPresets = (PRESET_COMP_ENTRIES || []).map((entry) => entry.data);
  const fieldable = allPresets.filter((comp) => compFitsRoster(comp, counts));

  const ownedKeys = new Set((ownedTrinkets || []).map(nameKey));
  const wantsTrinketFilter = requireOwnedTrinkets && ownedKeys.size > 0;
  const fullyEquippable = wantsTrinketFilter
    ? fieldable.filter((comp) => missingTrinketsFor(comp, ownedKeys).length === 0)
    : fieldable;

  // Asking for comps you can fully equip and getting none is worth saying out
  // loud rather than silently ignoring: the answer is still the best comp your
  // roster can field, just not one you own every trinket for.
  const trinketWarning = wantsTrinketFilter && !fullyEquippable.length && fieldable.length
    ? 'No comp could be fully equipped from your trinkets — suggesting the best fit instead.'
    : '';
  const candidates = fullyEquippable.length ? fullyEquippable : fieldable;

  if (candidates.length > 0) {
    const chosenComp = pickRandom(candidates, 1)[0];
    const { heroes: dressed, assigned } = assignSaveHeroes(
      formatPresetHeroes(chosenComp.heroes),
      saveHeroes
    );
    const heroes = dressed;

    // Metadatos para useTeam (nombre y localización del preset)
    heroes.teamName = chosenComp.teamName || chosenComp.name || 'Suggested Preset';
    heroes.location = chosenComp.location || 'The Ruins';
    heroes.alias = chosenComp.alias || '';
    heroes.assignedHeroes = assigned;
    heroes.missingTrinkets = ownedKeys.size ? missingTrinketsFor(chosenComp, ownedKeys) : [];
    heroes.warning = trinketWarning;
    heroes.fromPreset = true;

    return heroes;
  }

  // Fallback aleatorio: se reparte sobre el roster expandido, así que sólo
  // repite una clase si de verdad tienes dos.
  const validNames = expandRoster(counts).filter(
    (name) => !!(HERO_CLASSES[name] || MODDED_HERO_CLASSES[name])
  );
  const pool = validNames.length >= PARTY_CONFIG.MAX_HEROES ? validNames : Object.keys(HERO_CLASSES);

  const selectedClasses = pickRandom(pool, PARTY_CONFIG.MAX_HEROES);
  const rolled = selectedClasses.map((heroClass) => buildHeroFromClass(heroClass, includeModded));
  const { heroes: dressed, assigned } = assignSaveHeroes(rolled, saveHeroes);

  dressed.assignedHeroes = assigned;
  dressed.missingTrinkets = [];
  dressed.warning = rosterSize(counts) >= PARTY_CONFIG.MAX_HEROES
    ? 'No bundled comp fits your roster — rolled a random party from it instead.'
    : '';
  dressed.fromPreset = false;
  return dressed;
};
