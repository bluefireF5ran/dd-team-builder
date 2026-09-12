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
 * heroe. La cuarta se gasta a proposito en cubrir un empujon o una sorpresa,
 * porque de nada sirve la mejor skill del kit si al descolocarte te quedas
 * mirando -- pero cubrir no es gratis y compite con el uso: ver `REACH_WEIGHT`.
 *
 * El automovimiento entra en esa misma puja y **se lo tiene que ganar**. Cuenta
 * como cobertura entera --te devuelve a tu sitio desde cualquiera-- pero no
 * tiene ranura reservada: reservarsela a las clases bailarinas era darle la
 * exencion a la clase por su nombre, que es justo lo que aqui no se hace. Una
 * Shieldbreaker sale con movimiento porque seis de sus siete skills lo son, no
 * porque sea Shieldbreaker.
 */
import { HERO_CLASSES } from './heroes';
import { MODDED_HERO_CLASSES } from './modded_heroes';
import { getRawComps } from './compIndex';
import { getModelUsageStats } from './modelUsageIndex';
import { getRecommendedTrinkets, getRecommendedQuirks } from './recommendations';
import { skillProfile } from '../utils/skillProfile';
import { sortToRoster } from '../utils/heroHelper';
import { PARTY_CONFIG, HERO_CONFIG } from '../constants';

/** Por debajo de esto la celda no opina: manda el modelo y las reglas. */
export const MIN_LIBRARY_SAMPLES = 4;

const loadoutCache = new Map();

const classData = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

// ---------------------------------------------------------------- la libreria

let libraryCache = null;
let campCache = null;

/**
 * Dos indices del mismo barrido:
 *
 *   - `libraryCache`: clase -> rango -> { n, skills:Map, trinkets:Map }
 *   - `campCache`:    clase -> { n, campSkills:Map }
 *
 * Las camp skills no se guardan por rango, y no es un descuido: **acampar no
 * tiene rangos**. `Encourage` hace lo mismo en el 1 que en el 4, asi que partir
 * las muestras por una columna que no cambia la respuesta solo sirve para dejar
 * celdas flacas donde habia evidencia de sobra. El Flagelante tiene 60 fichas
 * repartidas en 43/12/3/2, y las dos ultimas no llegan al minimo aunque la
 * clase sea de las mas jugadas de la libreria.
 *
 * Se construye la primera vez que se pregunta, como `compIndex` y
 * `generalistIndex`: quien no abra una recomendacion no paga el barrido.
 */
const buildLibrary = () => {
  const byClass = new Map();
  const campByClass = new Map();

  getRawComps().forEach((comp) => {
    (comp.heroes || []).forEach((hero, index) => {
      if (!hero || !hero.heroClass) return;
      const rank = index + 1;
      if (rank > PARTY_CONFIG.MAX_HEROES) return;

      if (!byClass.has(hero.heroClass)) byClass.set(hero.heroClass, new Map());
      const byRank = byClass.get(hero.heroClass);
      if (!byRank.has(rank)) {
        byRank.set(rank, { n: 0, skills: new Map(), trinkets: new Map() });
      }
      const cell = byRank.get(rank);
      cell.n += 1;

      if (!campByClass.has(hero.heroClass)) {
        campByClass.set(hero.heroClass, { n: 0, campSkills: new Map() });
      }
      const camp = campByClass.get(hero.heroClass);
      camp.n += 1;

      const bump = (map, name) => {
        if (name) map.set(name, (map.get(name) || 0) + 1);
      };
      // Dedup por ranura, igual que `buildUsageStats`: una ficha que repite un
      // nombre no cuenta dos veces.
      new Set(hero.activeSkills || []).forEach((name) => bump(cell.skills, name));
      new Set(hero.activeCampSkills || []).forEach((name) => bump(camp.campSkills, name));
      new Set([hero.trinket1, hero.trinket2].filter(Boolean)).forEach((name) =>
        bump(cell.trinkets, name)
      );
    });
  });

  libraryCache = byClass;
  campCache = campByClass;
};

const libraryIndex = () => {
  if (!libraryCache) buildLibrary();
  return libraryCache;
};

const campIndex = () => {
  if (!campCache) buildLibrary();
  return campCache;
};

const libraryCell = (heroClass, rank) =>
  libraryIndex().get(heroClass)?.get(rank) || { n: 0, skills: new Map(), trinkets: new Map() };

const campCell = (heroClass) => campIndex().get(heroClass) || { n: 0, campSkills: new Map() };

let homeCache = null;

/** clase -> [desvio en r1..r4], ver `rankHomeMiss`. */
const homeIndex = () => {
  if (homeCache) return homeCache;
  homeCache = new Map();
  libraryIndex().forEach((byRank, heroClass) => {
    let best = 0;
    byRank.forEach((cell) => {
      if (cell.n > best) best = cell.n;
    });
    const miss = [];
    for (let rank = 1; rank <= PARTY_CONFIG.MAX_HEROES; rank += 1) {
      miss.push(best ? 1 - (byRank.get(rank)?.n || 0) / best : 0);
    }
    homeCache.set(heroClass, miss);
  });
  return homeCache;
};

/**
 * Cuanto se aleja `rank` del sitio donde la libreria pone a esta clase: 0 si es
 * SU sitio, 1 si ahi no la pone nadie.
 *
 * `bisLoadout` contesta "que lleva esta clase AQUI", nunca "donde deberia
 * estar", y esa segunda pregunta no la contestaba nadie. `scoreParty` mide
 * cobertura y legalidad de rango, y entre la Arbalest en el 4 con la Musketeer
 * en el 3 y al reves las dos miden casi igual --las dos lanzan su kit entero
 * desde el 3 y desde el 4-- asi que el reparto lo acababa decidiendo el orden
 * del barajado. La libreria si tiene opinion: 110 de las 120 Arbalest estan en
 * el 4 y solo 8 en el 3, mientras que la Musketeer baja al 3 en 14 de 71.
 *
 * Es un DESVIO respecto a la propia clase, no una nota: se compara con el rango
 * favorito de esa clase y nunca con otra clase. Una sin fichas --toda modded--
 * devuelve 0 en los cuatro rangos, asi que ni se la penaliza en ninguno ni sale
 * perdiendo frente a una vanilla que si tenga sitio de siempre.
 */
export const rankHomeMiss = (heroClass, rank) => {
  const miss = homeIndex().get(heroClass);
  if (!miss) return 0;
  const slot = Math.min(Math.max(rank || 1, 1), PARTY_CONFIG.MAX_HEROES);
  return miss[slot - 1];
};

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
 * De donde sale la recomendacion de esta CELDA.
 *
 * Antes se etiquetaba con la fuente de la primera skill del kit, que solo
 * acierta por casualidad: cuando la libreria no llega al minimo, cada skill
 * cae en el modelo o en las reglas por su cuenta, y la primera del kit no
 * habla por las demas. Con precedencia se dice lo que de verdad decidio.
 */
const sourceOf = (entries) => {
  if (entries.some((entry) => entry.source === 'library')) return 'library';
  if (entries.some((entry) => entry.source === 'model')) return 'model';
  return 'rules';
};

/**
 * Lo que vale llegar a OTROS rangos, en la misma escala que el uso.
 *
 * La cuarta ranura se ordenaba solo por alcance, con el uso de simple
 * desempate, y eso deja fuera skills que la libreria juega casi siempre. El
 * Leper en rango 1 es el caso claro: `Purge` sale en 16 de 24 fichas y se
 * lanza solo desde el 1, asi que quedaba en el ULTIMO lugar de la cola --
 * `elsewhere` cero-- y la ranura se la llevaba `Revenge`, que esta en 5 de 24
 * pero alcanza los cuatro. Lo mismo con `Invigorating Vapours`, 10 de 11 en el
 * rango 4 del Antiquarian y descartada por lanzarse solo desde [3,4].
 *
 * Cubrir el empujon sigue valiendo, pero no a cualquier precio: se suma al uso
 * en vez de mandar sobre el, asi que una skill que nadie juega y llega a todas
 * partes pierde contra una que juega la mayoria y no se mueve.
 *
 * En una celda sin muestras todas las notas son iguales y vuelve a decidir el
 * alcance, que es justo lo que se quiere cuando no hay nada que mirar.
 *
 * ## Por que se diluye cuando SI hay muestras
 *
 * Esto es un PRIOR: lo que se cree antes de mirar. Sumarlo entero encima de una
 * celda de 110 fichas es contar dos veces, porque quien escribio esas 110 ya
 * pago el precio de la flexibilidad y decidio. Y como el bono vale 0.35 mientras
 * que las diferencias reales de la libreria son de centesimas, acababa
 * decidiendo el prior casi siempre: la Arbalest de rango 4 salia con `Rallying
 * Flare` --54 de 110-- en vez de `Suppressing Fire` --57 de 110-- solo porque
 * la primera alcanza los cuatro rangos. Bajar el peso a secas no arregla eso
 * sin apagarlo: haria falta menos de 0.03, y con eso el Leper vuelve a perder
 * `Purge`.
 *
 * Asi que pesa entero donde no hay libreria que mirar --las celdas del modelo y
 * las de las reglas, que es para lo que se invento-- y se encoge segun la celda
 * junta fichas. Puesto en fichas en vez de en decimales queda mas claro: como
 * la nota es `cuenta / n` y el peso es `0.35 * 4 / n`, el prior vale
 * **1.4 comps, sea cual sea `n`**. Le da la vuelta a un empate a una ficha y a
 * nada mas ancho.
 */
export const REACH_WEIGHT = 0.35;

const priorWeight = (samples) =>
  REACH_WEIGHT * (MIN_LIBRARY_SAMPLES / Math.max(samples, MIN_LIBRARY_SAMPLES));

/**
 * Cuanto cubre esta skill si te descolocan, de 0 a 1.
 *
 * Se cuenta desde cuantos sitios AJENOS al suyo se puede lanzar, y volver a su
 * sitio cuenta como uno mas: una skill de automovimiento no solo te deja actuar
 * desde donde has caido, te saca de ahi. El maximo, 1, es lanzarla desde los
 * cuatro rangos Y volver.
 *
 * El automovimiento suma, no sustituye al alcance. Darle cobertura entera por
 * el hecho de mover ponia a la Shieldbreaker de rango 3 `Impale` --que solo se
 * lanza desde el 1-- por delante de `Serpent Sway`, que se lanza desde el 1, el
 * 2 y el 3: las dos te devuelven a tu sitio, pero una lo hace desde tres sitios
 * y la otra desde uno.
 *
 * Antes de esto habia una rama aparte que RESERVABA una ranura a la mejor skill
 * de automovimiento de las clases bailarinas, y reservar no es ganarse nada: al
 * Antiquarian le colaba `Get Down!` --8 de 38 fichas en el rango 3-- por delante
 * de `Protect Me`, que esta en 29, y al Cruzado de rango 1 `Holy Lance`, que ni
 * siquiera se puede lanzar desde ahi. Compitiendo con las demas, la
 * Shieldbreaker sigue saliendo con movimiento (seis de sus siete skills lo son)
 * y el Cruzado ya no.
 */
const coverShare = (heroClass, entry) => {
  const moves = skillProfile(heroClass, entry.name)?.tags.has('selfMove') ? 1 : 0;
  return (entry.elsewhere + moves) / PARTY_CONFIG.MAX_HEROES;
};

const coverValue = (heroClass, entry, weight) =>
  entry.score + weight * coverShare(heroClass, entry);

/**
 * Cuatro skills para este rango, o el kit entero si la clase no elige.
 */
const chooseSkills = (heroClass, rank, scored, samples) => {
  const data = classData(heroClass);
  // Las clases de postura llevan las siete siempre: no hay nada que elegir, y
  // `HeroConfiguration` ya las marca todas.
  if (data?.alwaysActive) return scored.map((entry) => entry.name);

  const max = HERO_CONFIG.MAX_SKILLS;
  const onRank = scored.filter((entry) => entry.onRank).sort(byScore);
  const offRank = scored.filter((entry) => !entry.onRank).sort(byScore);
  const weight = priorWeight(samples);

  const chosen = [];
  const take = (entry) => {
    if (entry && !chosen.includes(entry)) chosen.push(entry);
  };

  // Tres de cuatro desde su sitio.
  const onRankQuota = Math.min(max - 1, onRank.length);
  onRank.forEach((entry) => {
    if (chosen.length < onRankQuota) take(entry);
  });

  // Lo que quede despues de la cuota es para cuando NO estas en tu sitio, asi
  // que se ordena por lo mismo: alcance y uso juntos, ver `coverValue`. Suele
  // ser una sola ranura; son mas cuando la clase no tiene tres skills lanzables
  // desde ese rango --el Leper en el 3, la Musketeer en el 1-- y ahi el criterio
  // vale todavia mas, porque el heroe ya esta donde no deberia.
  [...onRank, ...offRank]
    .filter((entry) => !chosen.includes(entry))
    .sort(
      (a, b) =>
        coverValue(heroClass, b, weight) - coverValue(heroClass, a, weight) || byScore(a, b)
    )
    .forEach((entry) => {
      if (chosen.length < max) take(entry);
    });

  return chosen.slice(0, max).map((entry) => entry.name);
};

/**
 * Lo minimo que tiene que jugar la libreria para que una camp skill entre.
 *
 * Rellenar hasta cuatro siempre era lo mismo que recomendar quirks negativos:
 * la ficha tiene la ranura, pero tenerla no obliga a llenarla. El Flagelante es
 * el caso que lo destapa -- solo tiene CUATRO camp skills, asi que el relleno
 * se las ponia todas, `Lash's Anger` incluida, que esta en 14 de sus 60 fichas.
 *
 * Con la mayoria como listón cambia exactamente una clase de las veinte: el
 * Flagelante baja a tres. En las otras diecinueve las cuatro primeras van del
 * 54% al 100%, o sea que la regla no recorta nada que la libreria juegue.
 */
export const CAMP_ADOPTION_FLOOR = 0.5;

/**
 * Las camp skills que la libreria le pone de verdad a esta clase.
 *
 * Sin fichas suficientes no hay nada que respetar y se devuelve lo que declara
 * la clase, que es lo unico que se puede decir. Ver `buildLibrary` sobre por
 * que estas no se cuentan por rango.
 */
const chooseCampSkills = (heroClass, data) => {
  const kit = data.campSkills || [];
  const cell = campCell(heroClass);
  if (cell.n < MIN_LIBRARY_SAMPLES) return kit.slice(0, HERO_CONFIG.MAX_CAMP_SKILLS);

  return [...cell.campSkills.entries()]
    .filter(([, count]) => count / cell.n > CAMP_ADOPTION_FLOOR)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, HERO_CONFIG.MAX_CAMP_SKILLS)
    .map(([name]) => name);
};

/**
 * La cola entera, de mejor a peor: lo que la libreria pone en esta celda y
 * detras lo recomendado a mano para rellenar.
 *
 * Hace falta la COLA y no solo la cabeza porque los trinkets unicos no se
 * pueden repartir: si dos heroes quieren el mismo `Ancestor's Map` --que es un
 * objeto del que solo hay uno-- el segundo tiene que poder bajar al siguiente
 * que si pueda llevar. Ver `resolveTrinketClashes`.
 */
const rankedFrom = (map, fallback = []) => {
  const ranked = [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
  fallback.forEach((name) => {
    if (name && !ranked.includes(name)) ranked.push(name);
  });
  return ranked;
};


/**
 * La loadout recomendada de `heroClass` en `rank` (1-4, frente a fondo).
 *
 * @returns {{heroClass, rank, activeSkills, activeCampSkills, trinket1, trinket2,
 *            trinketOptions, quirks, source, samples, rankLegal}|null}
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
  const cell = libraryCell(heroClass, slot);
  // Elegidas por nota y por legalidad de rango, presentadas en el orden del
  // juego: el orden en que se eligen no significa nada para quien las lee.
  const activeSkills = sortToRoster(
    chooseSkills(heroClass, slot, scored, cell.n),
    data.skills || []
  );

  const camp = sortToRoster(chooseCampSkills(heroClass, data), data.campSkills || []);
  const trinketOptions = rankedFrom(cell.trinkets, getRecommendedTrinkets(heroClass));
  const trinkets = trinketOptions.slice(0, HERO_CONFIG.MAX_TRINKETS);
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
    // La cola completa, para quien tenga que ceder un unico y bajar al
    // siguiente. Se comparte, como el resto del build: no se toca.
    trinketOptions,
    quirks: { positive: quirks.positive.slice(0, 3), negative: [] },
    // De donde sale la recomendacion, para poder decirlo en la UI en vez de
    // presentar una celda de dos muestras como si fuera consenso.
    source: scored.length ? sourceOf(scored) : 'rules',
    samples: cell.n,
    rankLegal: onRankCount >= HERO_CONFIG.MAX_SKILLS - 1
  };

  loadoutCache.set(cacheKey, build);
  return build;
};

/** Solo para los tests: olvida los barridos memoizados. */
export const resetBisCaches = () => {
  libraryCache = null;
  campCache = null;
  homeCache = null;
  modelCache = null;
  loadoutCache.clear();
};
