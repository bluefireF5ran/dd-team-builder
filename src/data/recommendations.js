import { COMP_LIBRARY } from './compLibrary';

const TOP_N_TRINKETS = 8;
// Five, and in usage order. A longer list stopped being a recommendation and
// became a second copy of the roster: the tail of a ten-item list is quirks one
// or two comps happened to carry, which reads as advice it is not.
const TOP_N_QUIRKS = 5;

const bumpCount = (map, key, name) => {
  if (!key || !name) return;
  if (!map.has(key)) map.set(key, new Map());
  const counts = map.get(key);
  counts.set(name, (counts.get(name) || 0) + 1);
};

const rankTop = (countsMap, topN) =>
  [...countsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name]) => name);

const buildRecommendations = () => {
  const trinketCounts = new Map(); // heroClass -> Map(trinketName -> count)
  const positiveQuirkCounts = new Map(); // heroClass -> Map(quirkName -> count)
  const negativeQuirkCounts = new Map();

  COMP_LIBRARY.forEach((comp) => {
    (comp.heroes || []).forEach((hero) => {
      const heroClass = hero?.heroClass;
      if (!heroClass) return;

      bumpCount(trinketCounts, heroClass, hero.trinket1);
      bumpCount(trinketCounts, heroClass, hero.trinket2);

      (hero.quirks?.positive || []).forEach((q) => bumpCount(positiveQuirkCounts, heroClass, q));
      (hero.quirks?.negative || []).forEach((q) => bumpCount(negativeQuirkCounts, heroClass, q));
    });
  });

  const trinketsByClass = {};
  trinketCounts.forEach((counts, heroClass) => {
    trinketsByClass[heroClass] = rankTop(counts, TOP_N_TRINKETS);
  });

  const quirksByClass = {};
  const heroClasses = new Set([...positiveQuirkCounts.keys(), ...negativeQuirkCounts.keys()]);
  heroClasses.forEach((heroClass) => {
    quirksByClass[heroClass] = {
      positive: positiveQuirkCounts.has(heroClass) ? rankTop(positiveQuirkCounts.get(heroClass), TOP_N_QUIRKS) : [],
      negative: negativeQuirkCounts.has(heroClass) ? rankTop(negativeQuirkCounts.get(heroClass), TOP_N_QUIRKS) : []
    };
  });

  return { trinketsByClass, quirksByClass };
};

// Un barrido de las 183 comps al arrancar la app, para algo que solo hace falta
// al abrir un selector de baratijas o de rarezas: se calcula la primera vez que
// se pregunta y se guarda.
let cache = null;
const recommendations = () => {
  if (!cache) cache = buildRecommendations();
  return cache;
};

export const getRecommendedTrinkets = (heroClass) => recommendations().trinketsByClass[heroClass] || [];

export const getRecommendedQuirks = (heroClass) =>
  recommendations().quirksByClass[heroClass] || { positive: [], negative: [] };
