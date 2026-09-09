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
import { substituteTrinkets } from './trinketSubstitution';
import {
  bySuitability,
  STRESS_CONFIG,
  clampStress,
  compStressWeight,
  isStrained,
  restedCandidates,
  stressPool,
  stressWeightsFor,
  weightedPick,
  weightedSample
} from './heroStress';

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
 * Puts your actual heroes into a comp.
 *
 * The comp is the *build* — its skills and trinkets are the recommendation, and
 * they stay. What comes from the save is everything you cannot choose: the
 * quirks that hero is stuck with, the ones locked in, and any disease. Handing
 * back a Plague Doctor with blank quirks when yours has Kleptomaniac and the
 * Red Plague would be describing someone else's hero.
 *
 * Also reports back who came in strained, so the suggestion can say "this is
 * the comp, but Dismas is at 78" instead of letting the player find out in the
 * dungeon.
 */
const assignSaveHeroes = (heroes, saveHeroes) => {
  if (!Array.isArray(saveHeroes) || !saveHeroes.length) return { heroes, assigned: [], stressed: [] };

  const pool = new Map();
  [...saveHeroes].sort(bySuitability).forEach((hero) => {
    const key = nameKey(hero.heroClass);
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(hero);
  });

  const assigned = [];
  const stressed = [];
  const merged = heroes.map((hero) => {
    // `shift` is what stops one hero filling two slots of a doubled comp.
    const mine = pool.get(nameKey(hero.heroClass))?.shift();
    if (!mine) return hero;
    assigned.push(mine.name || hero.heroClass);
    if (isStrained(mine)) {
      stressed.push({ name: mine.name || hero.heroClass, stress: clampStress(mine.stress) });
    }
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

  return { heroes: merged, assigned, stressed };
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
 * El estrés también cuenta, cuando hay partida importada: una comp que tendría
 * que sacar a tus héroes más quemados sale sorteada menos veces (ver
 * utils/heroStress.js). Es un peso, no un filtro — con todo el roster al límite
 * sigue habiendo sugerencia, sólo que avisando de quién va cargado.
 *
 * @param options.saveHeroes  héroes importados de la partida, para vestir la comp
 * @param options.ownedTrinkets  inventario; con `requireOwnedTrinkets` filtra
 * @param options.requireOwnedTrinkets  sólo comps que puedas equipar entera
 * @param options.reequip  re-equipa la comp con TUS trinkets, buscando los que
 *   hacen el mismo trabajo que los ideales (ver utils/trinketProfile.js)
 * @param options.preferRested  sesga el sorteo hacia los héroes descansados
 */
export const generateRandomTeamFromRoster = (roster = [], includeModded = false, options = {}) => {
  const {
    saveHeroes = null,
    ownedTrinkets = null,
    requireOwnedTrinkets = false,
    reequip = false,
    preferRested = true
  } = options;
  const counts = toRosterCounts(roster);
  // Empty without a save, and an empty pool weighs everything at 1 — so the
  // draw below is the old uniform one until there is stress to know about.
  const stress = preferRested ? stressPool(saveHeroes) : new Map();

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
    // Two steps, because a weight alone is not enough: it only makes the tired
    // comp rarer, and rare still means "sometimes, for no visible reason". So
    // comps needing a strained hero are dropped outright while any comp your
    // rested heroes can field remains, and the weighting then orders what is
    // left — including the whole list, when nothing clean fits the roster.
    const rested = restedCandidates(candidates, stress);
    const chosenComp = stress.size
      ? weightedPick(rested, (comp) => compStressWeight(comp, stress))
      : pickRandom(candidates, 1)[0];
    const { heroes: dressed, assigned, stressed } = assignSaveHeroes(
      formatPresetHeroes(chosenComp.heroes),
      saveHeroes
    );

    // Re-equipping happens after the heroes are chosen, because a trinket that
    // is locked to a class can only be judged once we know who is wearing it.
    const reequipped = reequip && ownedTrinkets
      ? substituteTrinkets(dressed, ownedTrinkets)
      : null;
    const heroes = reequipped ? reequipped.heroes : dressed;

    // Metadatos para useTeam (nombre y localización del preset)
    heroes.teamName = chosenComp.teamName || chosenComp.name || 'Suggested Preset';
    heroes.location = chosenComp.location || 'The Ruins';
    heroes.alias = chosenComp.alias || '';
    heroes.assignedHeroes = assigned;
    heroes.stressedHeroes = stressed;
    heroes.missingTrinkets = ownedKeys.size ? missingTrinketsFor(chosenComp, ownedKeys) : [];
    heroes.trinketSwaps = reequipped ? reequipped.swaps : [];
    heroes.unequipped = reequipped ? reequipped.unfilled : 0;
    heroes.warning = trinketWarning;
    heroes.fromPreset = true;

    return heroes;
  }

  // Fallback aleatorio: se reparte sobre el roster expandido, así que sólo
  // repite una clase si de verdad tienes dos.
  const validNames = expandRoster(counts).filter(
    (name) => !!(HERO_CLASSES[name] || MODDED_HERO_CLASSES[name])
  );
  const namePool = validNames.length >= PARTY_CONFIG.MAX_HEROES ? validNames : Object.keys(HERO_CLASSES);

  // Same two steps on the fallback roll. `expandRoster` already listed your
  // second copy of a class separately, so the second draw of a class is judged
  // on your second hero — and the strained are set aside only while enough
  // rested heroes remain to fill a party without them.
  const weighed = stress.size ? stressWeightsFor(namePool, stress) : null;
  const restedNames = weighed
    ? weighed.filter((entry) => (entry.stress || 0) < STRESS_CONFIG.STRAINED)
    : null;
  const drawFrom = restedNames?.length >= PARTY_CONFIG.MAX_HEROES ? restedNames : weighed;
  const selectedClasses = drawFrom
    ? weightedSample(drawFrom, PARTY_CONFIG.MAX_HEROES, (entry) => entry.weight).map(
        (entry) => entry.heroClass
      )
    : pickRandom(namePool, PARTY_CONFIG.MAX_HEROES);
  const rolled = selectedClasses.map((heroClass) => buildHeroFromClass(heroClass, includeModded));
  const { heroes: withHeroes, assigned, stressed } = assignSaveHeroes(rolled, saveHeroes);
  const rolledReequipped = reequip && ownedTrinkets
    ? substituteTrinkets(withHeroes, ownedTrinkets)
    : null;
  const dressed = rolledReequipped ? rolledReequipped.heroes : withHeroes;

  dressed.assignedHeroes = assigned;
  dressed.stressedHeroes = stressed;
  dressed.missingTrinkets = [];
  dressed.trinketSwaps = rolledReequipped ? rolledReequipped.swaps : [];
  dressed.unequipped = rolledReequipped ? rolledReequipped.unfilled : 0;
  dressed.warning = rosterSize(counts) >= PARTY_CONFIG.MAX_HEROES
    ? 'No bundled comp fits your roster — rolled a random party from it instead.'
    : '';
  dressed.fromPreset = false;
  return dressed;
};
