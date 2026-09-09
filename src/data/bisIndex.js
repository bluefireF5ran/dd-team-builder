/**
 * La loadout recomendada de una clase EN UN RANGO.
 *
 * No es una por clase: una skill tiene posiciones desde las que se puede usar,
 * asi que la respuesta para el Leper en rango 1 y en rango 4 no puede ser la
 * misma. `launchableByRank` del Leper es 7/5/2/1 y el de la Arbalest 2/2/7/7 --
 * la misma pregunta con dos respuestas opuestas.
 *
 * ## Por que no vale contar y ya
 *
 * La libreria de comps no es un censo. El Houndmaster ocupa 97 de 704 ranuras y
 * el Duelist 9, y medida por clase Y rango la cosa es peor: **33 de las 80
 * celdas tienen menos de 3 muestras** y muchas tienen cero (Arbalest r1,
 * Musketeer r1, Plague Doctor r1, Leper r3, Occultist r4...). Recomendar solo
 * por frecuencia devuelve buenas respuestas donde ya habia comps y ninguna
 * donde hacen falta, que es justo el reproche a `suggestTeam`.
 *
 * Asi que hay tres fuentes, en orden, y ninguna es honesta sola:
 *
 *   1. **La libreria**, cuando la celda tiene muestras suficientes. Es lo que
 *      de verdad juega la gente.
 *   2. **`modelUsage.json`**, para las celdas flacas. Son 166.259 decisiones de
 *      una politica entrenada, cubre las 20 clases vanilla y -- lo importante--
 *      no comparte el sesgo de la libreria. No sabe de rangos, asi que solo
 *      dice QUE skills, nunca desde donde.
 *   3. **La legalidad de rango**, que no desempata: filtra. Sale de
 *      `skillProfile`, o sea de los datos del juego.
 *
 * ## La regla de Fran
 *
 * Al menos **3 de 4** skills tienen que poder lanzarse desde el rango del
 * heroe. La cuarta se gasta a proposito en cubrir un empujon o una sorpresa:
 * se elige la que mas rangos DISTINTOS al suyo alcanza, porque de nada sirve
 * la mejor skill del kit si al descolocarte te quedas mirando.
 *
 * Las clases bailarinas quedan exentas del 3 de 4, pero **se lo tienen que
 * ganar**: la exencion solo se aplica si la loadout lleva de verdad una skill
 * de automovimiento. Una Shieldbreaker sin `Serpent Sway` esta tan atrapada
 * como cualquiera, y darle la exencion por su clase seria volver a juzgar por
 * el nombre.
 */
import { HERO_CLASSES } from './heroes';
import { MODDED_HERO_CLASSES } from './modded_heroes';
import { getRawComps } from './compIndex';
import { getModelUsageStats } from './modelUsageIndex';
import { getRecommendedTrinkets, getRecommendedQuirks } from './recommendations';
import { skillProfile, classProfile } from '../utils/skillProfile';
import { PARTY_CONFIG, HERO_CONFIG } from '../constants';

/** Por debajo de esto la celda no opina: manda el modelo y las reglas. */
export const MIN_LIBRARY_SAMPLES = 4;

const loadoutCache = new Map();

const classData = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

// ---------------------------------------------------------------- la libreria

let libraryCache = null;

/**
 * clase -> rango -> { n, skills:Map, campSkills:Map, trinkets:Map }
 *
 * Se construye la primera vez que se pregunta, como `compIndex` y
 * `generalistIndex`: quien no abra una recomendacion no paga el barrido.
 */
const libraryIndex = () => {
  if (libraryCache) return libraryCache;

  const byClass = new Map();
  getRawComps().forEach((comp) => {
    (comp.heroes || []).forEach((hero, index) => {
      if (!hero || !hero.heroClass) return;
      const rank = index + 1;
      if (rank > PARTY_CONFIG.MAX_HEROES) return;

      if (!byClass.has(hero.heroClass)) byClass.set(hero.heroClass, new Map());
      const byRank = byClass.get(hero.heroClass);
      if (!byRank.has(rank)) {
        byRank.set(rank, { n: 0, skills: new Map(), campSkills: new Map(), trinkets: new Map() });
      }
      const cell = byRank.get(rank);
      cell.n += 1;

      const bump = (map, name) => {
        if (name) map.set(name, (map.get(name) || 0) + 1);
      };
      // Dedup por ranura, igual que `buildUsageStats`: una ficha que repite un
      // nombre no cuenta dos veces.
      new Set(hero.activeSkills || []).forEach((name) => bump(cell.skills, name));
      new Set(hero.activeCampSkills || []).forEach((name) => bump(cell.campSkills, name));
      new Set([hero.trinket1, hero.trinket2].filter(Boolean)).forEach((name) =>
        bump(cell.trinkets, name)
      );
    });
  });

  libraryCache = byClass;
  return libraryCache;
};

const libraryCell = (heroClass, rank) =>
  libraryIndex().get(heroClass)?.get(rank) || { n: 0, skills: new Map(), campSkills: new Map(), trinkets: new Map() };

// ---------------------------------------------------------------- el modelo

let modelCache = null;

/** clase -> Map(skill -> tasa de adopcion), de las decisiones de la politica. */
const modelIndex = () => {
  if (modelCache) return modelCache;

  const byClass = new Map();
  (getModelUsageStats().items?.skills || []).forEach((item) => {
    Object.entries(item.byClass || {}).forEach(([heroClass, picks]) => {
      const offered = item.offeredByClass?.[heroClass]?.slots || 0;
      if (!offered) return;
      if (!byClass.has(heroClass)) byClass.set(heroClass, new Map());
      byClass.get(heroClass).set(item.name, (picks.slots || 0) / offered);
    });
  });

  modelCache = byClass;
  return modelCache;
};

// ---------------------------------------------------------------- la eleccion

/**
 * La nota de cada skill del kit, y de donde sale.
 * @returns {{name, score, source, launch:number[], onRank:boolean, elsewhere:number}[]}
 */
const scoreSkills = (heroClass, rank) => {
  const data = classData(heroClass);
  const kit = data?.skills || [];
  const cell = libraryCell(heroClass, rank);
  const useLibrary = cell.n >= MIN_LIBRARY_SAMPLES;
  const modelRates = modelIndex().get(heroClass);

  return kit.map((name) => {
    const profile = skillProfile(heroClass, name);
    const launch = profile ? profile.launch : [];
    const fromLibrary = useLibrary ? (cell.skills.get(name) || 0) / cell.n : null;
    const fromModel = modelRates?.get(name) ?? null;

    // La libreria manda donde hay muestras; si no, el modelo; si tampoco, todo
    // empatado y decide la legalidad de rango.
    const score = fromLibrary !== null ? fromLibrary : fromModel !== null ? fromModel : 0;
    const source = fromLibrary !== null ? 'library' : fromModel !== null ? 'model' : 'rules';

    return {
      name,
      score,
      source,
      launch,
      onRank: launch.includes(rank),
      // Cuantos rangos DISTINTOS al suyo alcanza: lo que la cuarta ranura compra.
      elsewhere: launch.filter((r) => r !== rank).length
    };
  });
};

const byScore = (a, b) => b.score - a.score || a.name.localeCompare(b.name);

/**
 * Cuatro skills para este rango, o el kit entero si la clase no elige.
 */
const chooseSkills = (heroClass, rank, scored) => {
  const data = classData(heroClass);
  // Las clases de postura llevan las siete siempre: no hay nada que elegir, y
  // `HeroConfiguration` ya las marca todas.
  if (data?.alwaysActive) return scored.map((entry) => entry.name);

  const max = HERO_CONFIG.MAX_SKILLS;
  const onRank = scored.filter((entry) => entry.onRank).sort(byScore);
  const offRank = scored.filter((entry) => !entry.onRank).sort(byScore);
  const isDancer = classProfile(heroClass, data?.skills || []).isDancer;

  const chosen = [];
  const take = (entry) => {
    if (entry && !chosen.includes(entry)) chosen.push(entry);
  };

  // Una bailarina se gana la exencion llevando el movimiento, no teniendolo en
  // el kit: la mejor skill de automovimiento entra primero y el resto se juzga
  // igual que en cualquier otra clase.
  if (isDancer) {
    const mover = scored
      .filter((entry) => skillProfile(heroClass, entry.name)?.tags.has('selfMove'))
      .sort(byScore)[0];
    take(mover);
  }

  // Tres de cuatro desde su sitio.
  const onRankQuota = Math.min(max - 1, onRank.length);
  onRank.forEach((entry) => {
    if (chosen.filter((e) => e.onRank).length < onRankQuota) take(entry);
  });

  // La cuarta cubre el empujon: la que mas rangos distintos alcanza, con la
  // nota como desempate.
  if (chosen.length < max) {
    const rest = [...onRank, ...offRank]
      .filter((entry) => !chosen.includes(entry))
      .sort((a, b) => b.elsewhere - a.elsewhere || byScore(a, b));
    take(rest[0]);
  }

  // Y si aun falta (kits cortos, clases modded), se rellena por nota.
  [...onRank, ...offRank].sort(byScore).forEach((entry) => {
    if (chosen.length < max) take(entry);
  });

  return chosen.slice(0, max).map((entry) => entry.name);
};

const topFrom = (map, n, fallback = []) => {
  const ranked = [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const picks = ranked.slice(0, n).map(([name]) => name);
  fallback.forEach((name) => {
    if (picks.length < n && !picks.includes(name)) picks.push(name);
  });
  return picks;
};

/**
 * La loadout recomendada de `heroClass` en `rank` (1-4, frente a fondo).
 *
 * @returns {{heroClass, rank, activeSkills, activeCampSkills, trinket1, trinket2,
 *            quirks, source, samples, rankLegal}|null}
 */
export const bisLoadout = (heroClass, rank) => {
  const data = classData(heroClass);
  if (!data) return null;

  const slot = Math.min(Math.max(rank || 1, 1), PARTY_CONFIG.MAX_HEROES);
  // Memoizado porque el generador de comps pregunta por la misma celda muchas
  // veces en un solo intento, y la respuesta no depende de nada mas.
  const cacheKey = `${heroClass}|${slot}`;
  if (loadoutCache.has(cacheKey)) return loadoutCache.get(cacheKey);
  const scored = scoreSkills(heroClass, slot);
  const activeSkills = chooseSkills(heroClass, slot, scored);

  const cell = libraryCell(heroClass, slot);
  const camp = topFrom(cell.campSkills, HERO_CONFIG.MAX_CAMP_SKILLS, data.campSkills || []);
  const trinkets = topFrom(cell.trinkets, HERO_CONFIG.MAX_TRINKETS, getRecommendedTrinkets(heroClass));
  const quirks = getRecommendedQuirks(heroClass);

  const onRankCount = activeSkills.filter((name) =>
    scored.find((entry) => entry.name === name)?.onRank
  ).length;

  const build = {
    heroClass,
    rank: slot,
    activeSkills,
    activeCampSkills: camp,
    trinket1: trinkets[0] || '',
    trinket2: trinkets[1] || '',
    quirks: { positive: quirks.positive.slice(0, 3), negative: [] },
    // De donde sale la recomendacion, para poder decirlo en la UI en vez de
    // presentar una celda de dos muestras como si fuera consenso.
    source: scored.length ? scored[0].source : 'rules',
    samples: cell.n,
    rankLegal: onRankCount >= HERO_CONFIG.MAX_SKILLS - 1
  };

  loadoutCache.set(cacheKey, build);
  return build;
};

/** Solo para los tests: olvida los barridos memoizados. */
export const resetBisCaches = () => {
  libraryCache = null;
  modelCache = null;
  loadoutCache.clear();
};
