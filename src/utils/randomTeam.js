import { HERO_CLASSES } from '../data/heroes';
import { getModdedHeroClasses, getModdedGeneralTrinkets } from '../data/moddedRoster';
import { TRINKETS } from '../data/trinkets';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../data/quirks';
import { EMPTY_HERO, PARTY_CONFIG, HERO_CONFIG } from '../constants';
import { PRESET_COMP_ENTRIES } from '../data/presetComps';
import {
  toRosterCounts,
  expandRoster,
  compFitsRoster,
  heroClassOf,
  rosterSize
} from './rosterAvailability';
import { nameKey } from './nameNormalizer';
import {
  getMissionTier,
  heroFitsMission,
  heroesAllowedOn,
  heroesForMission,
  missionResolveLabel,
  underLevelCost
} from './missionLevel';
import { reequipParty } from './trinketReequip';
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
  const heroData = HERO_CLASSES[heroClass] || getModdedHeroClasses()[heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const allSkills = heroData?.skills || [];
  const allCampSkills = heroData?.campSkills || [];

  const activeSkills = isAlwaysActive ? allSkills : pickRandom(allSkills, HERO_CONFIG.MAX_SKILLS);
  const activeCampSkills = pickRandom(allCampSkills, HERO_CONFIG.MAX_CAMP_SKILLS);

  const classTrinkets = heroData?.classSpecificTrinkets || [];
  const allGenericTrinkets = [...TRINKETS, ...(includeModded ? getModdedGeneralTrinkets() : [])];
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
  const moddedClasses = includeModded ? Object.keys(getModdedHeroClasses()) : [];
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
 *
 * `order` is how the queue for a class is sorted, and it has to be the same one
 * `stressPool` was built with or the two disagree about who fills the second
 * slot. A mission passes one that puts its own Resolve band first.
 */
const assignSaveHeroes = (heroes, saveHeroes, order = bySuitability) => {
  if (!Array.isArray(saveHeroes) || !saveHeroes.length) {
    return { heroes, assigned: [], placed: [], stressed: [] };
  }

  const pool = new Map();
  [...saveHeroes].sort(order).forEach((hero) => {
    const key = nameKey(hero.heroClass);
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(hero);
  });

  const assigned = [];
  const placed = [];
  const stressed = [];
  const merged = heroes.map((hero) => {
    // `shift` is what stops one hero filling two slots of a doubled comp.
    const mine = pool.get(nameKey(hero.heroClass))?.shift();
    if (!mine) return hero;
    assigned.push(mine.name || hero.heroClass);
    placed.push(mine);
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

  return { heroes: merged, assigned, placed, stressed };
};

const trinketsOf = (comp) =>
  (comp?.heroes || []).flatMap((hero) => [hero.trinket1, hero.trinket2]).filter(Boolean);

/** The smaller of two counted rosters, class by class. */
const intersectCounts = (a, b) => {
  const both = new Map();
  a.forEach(({ name, count }, key) => {
    const have = b.get(key)?.count || 0;
    if (have) both.set(key, { name, count: Math.min(count, have) });
  });
  return both;
};

/**
 * How many of this comp's four slots your in-band heroes could fill.
 *
 * Counted like a roster, not like a set: a comp fielding two Highwaymen scores
 * two only if the band holds two of them. It is the number the mission ranks
 * comps by, so "mostly the band" has something to be mostly *about*.
 */
const bandDepth = (comp, bandCounts) => {
  const used = new Map();
  return (comp?.heroes || []).reduce((total, hero) => {
    const key = nameKey(heroClassOf(hero));
    const taken = used.get(key) || 0;
    if (!key || taken >= (bandCounts.get(key)?.count || 0)) return total;
    used.set(key, taken + 1);
    return total + 1;
  }, 0);
};

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
 * @param options.reequip  re-equipa la comp con TUS trinkets, en el orden de
 *   Fran: los de la comp, el BiS del personaje, lo que la clase usa, algo
 *   parecido, algo util, algo que sume -- y solo entonces un hueco
 *   (ver utils/trinketReequip.js)
 * @param options.estate  la Hacienda, como en `statBreakdown`: `true`, `false`
 *   o la lista de distritos construidos, que cambia lo que un heroe necesita
 * @param options.preferRested  sesga el sorteo hacia los héroes descansados
 * @param options.missionTier  la dificultad de la misión (`apprentice`,
 *   `veteran`, `champion`). La banda de Resolve manda: se prefieren las comps
 *   que puedan llenar MÁS huecos con tus héroes de ese nivel, y sólo entra
 *   alguien por debajo cuando no hay bastantes -- que es lo que el juego
 *   permite, porque el tope es un máximo (ver utils/missionLevel.js). Sin
 *   partida importada no hay niveles que mirar, así que no hace nada.
 * @param options.difficulty  la campaña de la partida (`darkest`, `radiant`,
 *   `stygian`): en Radiant se sube de nivel antes y se baja dos niveles más,
 *   así que el mismo XP no es el mismo nivel
 */
const SLOTS = ['trinket1', 'trinket2'];

/**
 * Viste la party con el inventario y cuenta que ha pasado.
 *
 * `reequipParty` llena TODOS los huecos en el orden de Fran, asi que hay dos
 * cosas distintas que contarle al jugador: donde no pudo darle a la comp lo que
 * pedia (`swaps`), y donde puso algo en un hueco que la comp dejaba vacio
 * (`filled`), que es justo lo que la sustitucion anterior no hacia.
 *
 * **Se compara por heroe, no por casilla.** Los dos trinkets de un heroe son un
 * conjunto: si la comp pedia A y B y vuelven puestos B y A, no ha cambiado
 * nada, y compararlos casilla a casilla inventaba dos cambios que nadie hizo.
 */
const reequipFrom = (party, owned, options) => {
  const result = reequipParty(party, owned, options);
  const byHero = new Map();
  result.picks.forEach((pick) => {
    if (!byHero.has(pick.index)) byHero.set(pick.index, []);
    byHero.get(pick.index).push(pick);
  });

  const swaps = [];
  let filled = 0;
  party.forEach((hero, index) => {
    if (!hero?.heroClass) return;
    const wanted = SLOTS.map((slot) => hero[slot]).filter(Boolean);
    const picks = byHero.get(index) || [];
    const kept = new Set(
      picks.filter((pick) => wanted.some((name) => nameKey(name) === pick.key)).map((pick) => pick.key)
    );
    const lost = wanted.filter((name) => !kept.has(nameKey(name)));
    const gained = picks.filter((pick) => !kept.has(pick.key));
    gained.forEach((pick, i) => {
      // Uno que entra sin que saliera nada es un hueco que la comp dejaba vacio.
      if (i >= lost.length) {
        filled += 1;
        return;
      }
      swaps.push({
        index,
        heroClass: hero.heroClass,
        wanted: lost[i],
        got: pick.name,
        tier: pick.tierLabel,
        why: pick.reasons[0] || ''
      });
    });
  });
  return { heroes: result.heroes, swaps, filled, unfilled: result.unfilled };
};

export const generateRandomTeamFromRoster = (roster = [], includeModded = false, options = {}) => {
  const {
    saveHeroes = null,
    ownedTrinkets = null,
    requireOwnedTrinkets = false,
    reequip = false,
    estate = true,
    preferRested = true,
    missionTier = null,
    difficulty = null
  } = options;
  const counts = toRosterCounts(roster);
  const mission = getMissionTier(missionTier);

  // The mission is applied before anything else looks at your heroes, because
  // it is the only hard rule here: the game refuses a hero two levels above the
  // quest outright. `missionHeroes` is everyone it would let embark, ordered so
  // the band the quest is FOR comes first — `byMission` below is what makes
  // that ordering bite, and both the stress pool and the assignment sort with
  // it so they queue the same hero for the same slot.
  const missionHeroes = heroesAllowedOn(saveHeroes, missionTier, difficulty);
  const onLevel = heroesForMission(saveHeroes, missionTier, difficulty);
  const byMission = mission
    ? (a, b) =>
        (heroFitsMission(a, missionTier, difficulty) ? 0 : 1) -
          (heroFitsMission(b, missionTier, difficulty) ? 0 : 1) || bySuitability(a, b)
    : bySuitability;

  /**
   * What the mission could not give you, in the words the player needs.
   *
   * Two different disappointments. A hero **below the band** is a real cost the
   * game charges — 20 stress on entering one level short, 30 at two, and a
   * quarter again on everything after — so they are named with it. A slot with
   * **nobody** in it kept the comp's own hero, which is what happens for any
   * class you do not own, but it is worth saying when the player asked for a
   * party of one level and part of it is not theirs.
   */
  const missionNote = (assigned, placed) => {
    if (!mission || !saveHeroes?.length) return '';
    const notes = [];
    const under = placed
      .map((hero) => ({ hero, cost: underLevelCost(hero, missionTier, difficulty) }))
      .filter((entry) => entry.cost && !heroFitsMission(entry.hero, missionTier, difficulty));
    if (under.length) {
      notes.push(
        `Not enough ${mission.label} heroes (${missionResolveLabel(mission)}), so ` +
          `${under
            .map(({ hero, cost }) => `${hero.name || hero.heroClass} starts at +${cost.stress} stress`)
            .join(' and ')}.`
      );
    }
    if (assigned.length < PARTY_CONFIG.MAX_HEROES) {
      notes.push(
        `Only ${assigned.length} of the four slots could be filled from your roster.`
      );
    }
    return notes.join(' ');
  };
  // Empty without a save, and an empty pool weighs everything at 1 — so the
  // draw below is the old uniform one until there is stress to know about.
  const stress = preferRested ? stressPool(missionHeroes, byMission) : new Map();

  const allPresets = (PRESET_COMP_ENTRIES || []).map((entry) => entry.data);
  const fieldable = allPresets.filter((comp) => compFitsRoster(comp, counts));

  // **The band first, as deep as it goes.** A hard filter is wrong here: with
  // three Veterans no comp is all-Veteran, and refusing to answer is not what a
  // player asked for. A weight is wrong too — it would hand back an all-recruit
  // party now and then with nothing to explain it. So comps are ranked by how
  // many slots your in-band heroes could actually fill and only the best rank
  // survives: four when the band can field a whole party, three when that is
  // all you have. Under-levelled heroes get in exactly as far as they must.
  // Counted against the roster, not just off the save: the roster is what the
  // player actually asked for, and owning two in-band Crusaders must not put
  // two Crusaders in a party when the roster lists one.
  const bandCounts = mission && onLevel.length
    ? intersectCounts(toRosterCounts(onLevel.map(heroClassOf)), counts)
    : null;
  const deepest = bandCounts
    ? fieldable.reduce((best, comp) => Math.max(best, bandDepth(comp, bandCounts)), 0)
    : 0;
  const onBand = bandCounts
    ? fieldable.filter((comp) => bandDepth(comp, bandCounts) === deepest)
    : fieldable;

  const ownedKeys = new Set((ownedTrinkets || []).map(nameKey));
  const wantsTrinketFilter = requireOwnedTrinkets && ownedKeys.size > 0;
  const fullyEquippable = wantsTrinketFilter
    ? onBand.filter((comp) => missingTrinketsFor(comp, ownedKeys).length === 0)
    : onBand;

  // Asking for comps you can fully equip and getting none is worth saying out
  // loud rather than silently ignoring: the answer is still the best comp your
  // roster can field, just not one you own every trinket for.
  const trinketWarning = wantsTrinketFilter && !fullyEquippable.length && onBand.length
    ? 'No comp could be fully equipped from your trinkets — suggesting the best fit instead.'
    : '';
  // **A comp that uses none of your in-band heroes is not an answer.** Asked
  // for a Veteran party and handed four Apprentices while two Veterans sit in
  // the Hamlet, the library was the wrong place to look: the roll below takes
  // the band first, so building one is better advice than looking one up.
  const bandIgnored = deepest === 0 && bandCounts?.size > 0;
  const candidates = bandIgnored ? [] : fullyEquippable.length ? fullyEquippable : onBand;

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
    const { heroes: dressed, assigned, placed, stressed } = assignSaveHeroes(
      formatPresetHeroes(chosenComp.heroes),
      missionHeroes,
      byMission
    );

    // Re-equipping happens after the heroes are chosen, because a trinket that
    // is locked to a class can only be judged once we know who is wearing it.
    const reequipped = reequip && ownedTrinkets
      ? reequipFrom(dressed, ownedTrinkets, { estate })
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
    heroes.trinketFills = reequipped ? reequipped.filled : 0;
    heroes.unequipped = reequipped ? reequipped.unfilled : 0;
    heroes.warning = trinketWarning;
    heroes.missionTier = missionTier || null;
    heroes.missionNote = missionNote(assigned, placed);
    heroes.fromPreset = true;

    return heroes;
  }

  // Fallback aleatorio: se reparte sobre el roster expandido, así que sólo
  // repite una clase si de verdad tienes dos.
  const known = (name) => !!(HERO_CLASSES[name] || getModdedHeroClasses()[name]);
  const validNames = expandRoster(counts).filter(known);
  const namePool = validNames.length >= PARTY_CONFIG.MAX_HEROES ? validNames : Object.keys(HERO_CLASSES);

  // The band is not drawn for, it is taken. Nothing bundled fits, so the party
  // is being built from scratch — and a mission that has three Veterans wants
  // all three of them in it, with the roll only deciding who comes along. Take
  // them off the pool so the roll cannot hand the slot to the same class again.
  const bandNames = bandCounts && validNames.length >= PARTY_CONFIG.MAX_HEROES
    ? expandRoster(bandCounts).filter(known).slice(0, PARTY_CONFIG.MAX_HEROES)
    : [];
  const rollPool = bandNames.reduce((pool, name) => {
    const at = pool.indexOf(name);
    return at < 0 ? pool : [...pool.slice(0, at), ...pool.slice(at + 1)];
  }, namePool);
  const rollFor = PARTY_CONFIG.MAX_HEROES - bandNames.length;

  // Same two steps on the fallback roll. `expandRoster` already listed your
  // second copy of a class separately, so the second draw of a class is judged
  // on your second hero — and the strained are set aside only while enough
  // rested heroes remain to fill a party without them.
  const weighed = stress.size ? stressWeightsFor(rollPool, stress) : null;
  const restedNames = weighed
    ? weighed.filter((entry) => (entry.stress || 0) < STRESS_CONFIG.STRAINED)
    : null;
  const drawFrom = restedNames?.length >= rollFor ? restedNames : weighed;
  const selectedClasses = [
    ...bandNames,
    ...(drawFrom
      ? weightedSample(drawFrom, rollFor, (entry) => entry.weight).map((entry) => entry.heroClass)
      : pickRandom(rollPool, rollFor))
  ];
  const rolled = selectedClasses.map((heroClass) => buildHeroFromClass(heroClass, includeModded));
  const { heroes: withHeroes, assigned, placed, stressed } = assignSaveHeroes(
    rolled,
    missionHeroes,
    byMission
  );
  const rolledReequipped = reequip && ownedTrinkets
    ? reequipFrom(withHeroes, ownedTrinkets, { estate })
    : null;
  const dressed = rolledReequipped ? rolledReequipped.heroes : withHeroes;

  dressed.assignedHeroes = assigned;
  dressed.stressedHeroes = stressed;
  dressed.missingTrinkets = [];
  dressed.trinketSwaps = rolledReequipped ? rolledReequipped.swaps : [];
  dressed.trinketFills = rolledReequipped ? rolledReequipped.filled : 0;
  dressed.unequipped = rolledReequipped ? rolledReequipped.unfilled : 0;
  dressed.warning = rosterSize(counts) < PARTY_CONFIG.MAX_HEROES
    ? ''
    : bandIgnored
    ? `No bundled comp uses your ${mission.label} heroes — built a party around them instead.`
    : `No bundled comp fits your ${mission ? `${mission.label} ` : ''}roster — rolled a random party from it instead.`;
  dressed.missionTier = missionTier || null;
  dressed.missionNote = missionNote(assigned, placed);
  dressed.fromPreset = false;
  return dressed;
};
