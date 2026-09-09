// Ranking "generalista": que usa de verdad la libreria de comps.
//
// El ranker por parejas pregunta que te gusta MAS. Esto responde otra cosa:
// que se lleva mas, contado sobre las comps del bundle. Son dos ejes distintos
// y por eso conviven.
//
// El problema de contar apariciones a pelo es que la libreria no es un censo
// neutral: el Houndmaster sale en 97 ranuras y el Runaway en 10, asi que TODAS
// las skills del Houndmaster salen por delante de las de cualquier otro sin que
// eso diga nada de las skills. Aqui se corrige con dos palancas:
//
//   1. `alpha` (aplanado). Cada item tiene `picks` (veces que se cogio) y
//      `opportunities` (ranuras en las que se PODIA coger, o sea apariciones de
//      las clases que lo tienen). La nota es
//
//          score = picks^(1-alpha) * rate^alpha        con rate = picks/opportunities
//
//      que es lo mismo que picks/opportunities^alpha, escrito de forma que se
//      lea: alpha=0 es popularidad pura, alpha=1 es tasa de adopcion pura (la
//      popularidad del heroe se cancela porque esta arriba y abajo), y en medio
//      se interpola en escala logaritmica.
//
//   2. `unit` (que cuenta como una observacion). Contar ranuras da mucho peso a
//      las familias con muchas variantes: "Waiting Blade" son 17 comps de 183.
//      Contando familias distintas, esas 17 valen 1.
//
// La tasa cruda tiene el defecto clasico de los ratios: 5/5 = 100% empata con
// 50/50. Se suaviza hacia la media global con un prior de `priorStrength`
// observaciones, asi que una muestra pequena no se dispara al primer puesto.

import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import { HERO_SPECIFIC_TRINKETS } from '../data/hero_specific_trinkets';

export const USAGE_CATEGORIES = [
  {
    id: 'heroes',
    label: 'Heroes',
    blurb: 'Share of the party slots in the whole library.'
  },
  {
    id: 'skills',
    label: 'Skills',
    blurb: 'Of the heroes that could take it, how many did.'
  },
  {
    id: 'campSkills',
    label: 'Camp Skills',
    blurb: 'Same, over every class that owns the camp skill.'
  },
  {
    id: 'trinkets',
    label: 'Trinkets',
    blurb: 'Universal trinkets compete for every slot; class trinkets only for their own.'
  }
];

/** Presets del deslizador de aplanado. `alpha` es el exponente de la formula. */
export const FLATTEN_PRESETS = [
  {
    id: 'usage',
    alpha: 0,
    label: 'Raw usage',
    blurb: 'Straight count. The most-played classes drag their whole kit up with them.'
  },
  {
    id: 'balanced',
    alpha: 0.5,
    label: 'Balanced',
    blurb: 'Geometric middle. Count and adoption rate weigh the same.'
  },
  {
    id: 'adoption',
    alpha: 1,
    label: 'Adoption rate',
    blurb: 'How often it is taken when it can be taken. Class popularity cancels out.'
  }
];

export const COUNT_UNITS = [
  {
    id: 'slots',
    label: 'Per hero slot',
    blurb: 'Every hero in every comp is one observation.'
  },
  {
    id: 'families',
    label: 'Per comp family',
    blurb: 'All variants of one family count once, so a family with 24 of them stops shouting.'
  }
];

const heroDefinition = (name) => HERO_CLASSES[name] || MODDED_HERO_CLASSES[name] || null;

/** trinket -> clases que lo pueden llevar. Lo que no esta aqui es universal. */
const TRINKET_OWNERS = (() => {
  const map = new Map();
  Object.entries(HERO_SPECIFIC_TRINKETS).forEach(([heroClass, list]) => {
    (list || []).forEach((trinket) => {
      if (!map.has(trinket)) map.set(trinket, new Set());
      map.get(trinket).add(heroClass);
    });
  });
  return map;
})();

const newBucket = () => ({ slots: 0, families: new Set() });

const bucketFor = (map, key) => {
  let bucket = map.get(key);
  if (!bucket) {
    bucket = newBucket();
    map.set(key, bucket);
  }
  return bucket;
};

const recordItem = (map, name, heroClass, family) => {
  if (!name) return;
  let item = map.get(name);
  if (!item) {
    item = { name, slots: 0, families: new Set(), byClass: new Map() };
    map.set(name, item);
  }
  item.slots += 1;
  item.families.add(family);
  const bucket = bucketFor(item.byClass, heroClass);
  bucket.slots += 1;
  bucket.families.add(family);
};

const compFamily = (comp) => comp.family || comp.name || comp.id || 'unknown';

/**
 * Barre la libreria una vez y deja todo lo que hace falta para puntuar despues
 * con cualquier alpha, unidad o filtro de heroe sin releer las comps.
 *
 * @param {Array} comps Comps normalizadas (compLibrary / compIndex).
 */
export const buildUsageStats = (comps) => {
  const classUsage = new Map(); // clase -> bucket
  const library = newBucket(); // todas las ranuras ocupadas
  const heroExtras = new Map(); // clase -> rangos, regiones, companeros
  const skills = new Map();
  const campSkills = new Map();
  const trinkets = new Map();
  const allFamilies = new Set();

  let compCount = 0;

  (comps || []).forEach((comp) => {
    compCount += 1;
    const family = compFamily(comp);
    allFamilies.add(family);

    const slotsInComp = (comp.heroes || [])
      .map((hero, index) => ({ hero, rank: index + 1 }))
      .filter(({ hero }) => hero && hero.heroClass);

    const classesInComp = slotsInComp.map(({ hero }) => hero.heroClass);

    slotsInComp.forEach(({ hero, rank }) => {
      const heroClass = hero.heroClass;

      const classBucket = bucketFor(classUsage, heroClass);
      classBucket.slots += 1;
      classBucket.families.add(family);
      library.slots += 1;
      library.families.add(family);

      let extras = heroExtras.get(heroClass);
      if (!extras) {
        extras = {
          rankCounts: [0, 0, 0, 0],
          regions: new Map(),
          partners: new Map(),
          comps: new Set()
        };
        heroExtras.set(heroClass, extras);
      }
      extras.rankCounts[Math.min(Math.max(rank, 1), 4) - 1] += 1;
      extras.comps.add(comp.id || comp.name);
      const region = comp.location || 'Unknown';
      extras.regions.set(region, (extras.regions.get(region) || 0) + 1);
      classesInComp.forEach((other) => {
        if (other === heroClass) return;
        extras.partners.set(other, (extras.partners.get(other) || 0) + 1);
      });

      // Dedup por ranura: una ficha que repite un nombre no vale doble.
      new Set(hero.activeSkills || []).forEach((name) => recordItem(skills, name, heroClass, family));
      new Set(hero.activeCampSkills || []).forEach((name) =>
        recordItem(campSkills, name, heroClass, family)
      );
      new Set([hero.trinket1, hero.trinket2].filter(Boolean)).forEach((name) =>
        recordItem(trinkets, name, heroClass, family)
      );
    });
  });

  const knownClasses = [...classUsage.keys()];

  const availability = (owners) => {
    // owners vacio = universal: disponible en cada ranura de la libreria.
    if (!owners.length) return { slots: library.slots, families: library.families.size };
    let slots = 0;
    const families = new Set();
    owners.forEach((heroClass) => {
      const bucket = classUsage.get(heroClass);
      if (!bucket) return;
      slots += bucket.slots;
      bucket.families.forEach((f) => families.add(f));
    });
    return { slots, families: families.size };
  };

  const finalize = (map, ownersFor, kind) =>
    [...map.entries()].map(([name, item]) => {
      const owners = ownersFor(name, item);
      const universal = owners.length === 0;
      const opp = availability(owners);
      const byClass = {};
      item.byClass.forEach((bucket, heroClass) => {
        byClass[heroClass] = { slots: bucket.slots, families: bucket.families.size };
      });
      return {
        id: kind + ':' + name,
        kind,
        name,
        universal,
        owners: universal ? knownClasses : owners,
        picks: { slots: item.slots, families: item.families.size },
        // Un dato mal puesto (baratija de clase equipada en otra) no puede dejar
        // las oportunidades por debajo de las veces que se cogio.
        opportunities: {
          slots: Math.max(opp.slots, item.slots),
          families: Math.max(opp.families, item.families.size)
        },
        byClass
      };
    });

  const ownersFromDefinition = (listKey) => (name, item) => {
    const owners = new Set();
    knownClasses.forEach((heroClass) => {
      const def = heroDefinition(heroClass);
      if (def && (def[listKey] || []).includes(name)) owners.add(heroClass);
    });
    // Lo que sale en una comp cuenta como disponible aunque la ficha de la clase
    // no lo liste (heroes modeados, skills de transformacion, datos viejos).
    item.byClass.forEach((_, heroClass) => owners.add(heroClass));
    return [...owners];
  };

  const trinketOwners = (name, item) => {
    const declared = TRINKET_OWNERS.get(name);
    if (!declared) return []; // universal
    const owners = new Set(declared);
    item.byClass.forEach((_, heroClass) => owners.add(heroClass));
    return [...owners].filter((heroClass) => classUsage.has(heroClass));
  };

  const heroItems = knownClasses.map((heroClass) => {
    const bucket = classUsage.get(heroClass);
    const extras = heroExtras.get(heroClass);
    return {
      id: 'hero:' + heroClass,
      kind: 'heroes',
      name: heroClass,
      universal: true,
      owners: [heroClass],
      picks: { slots: bucket.slots, families: bucket.families.size },
      opportunities: { slots: library.slots, families: library.families.size },
      byClass: { [heroClass]: { slots: bucket.slots, families: bucket.families.size } },
      comps: extras.comps.size,
      rankCounts: extras.rankCounts,
      regions: [...extras.regions.entries()].sort((a, b) => b[1] - a[1]),
      partners: [...extras.partners.entries()].sort((a, b) => b[1] - a[1])
    };
  });

  return {
    compCount,
    familyCount: allFamilies.size,
    slotCount: library.slots,
    classes: knownClasses.slice().sort((a, b) => a.localeCompare(b)),
    classUsage: knownClasses.reduce((acc, heroClass) => {
      const bucket = classUsage.get(heroClass);
      acc[heroClass] = { slots: bucket.slots, families: bucket.families.size };
      return acc;
    }, {}),
    items: {
      heroes: heroItems,
      skills: finalize(skills, ownersFromDefinition('skills'), 'skills'),
      campSkills: finalize(campSkills, ownersFromDefinition('campSkills'), 'campSkills'),
      trinkets: finalize(trinkets, trinketOwners, 'trinkets')
    }
  };
};

/** Prior de suavizado: ~5% de las observaciones disponibles, minimo 2. */
export const defaultPriorStrength = (stats, unit) => {
  const total = unit === 'families' ? stats.familyCount : stats.compCount;
  return Math.max(2, Math.round(total * 0.05));
};

/**
 * Puntua y ordena una categoria.
 *
 * @param {Array}  items                 stats.items[category]
 * @param {Object} opts
 * @param {number} opts.alpha            0 = uso bruto, 1 = tasa de adopcion
 * @param {'slots'|'families'} opts.unit
 * @param {string} [opts.heroClass]      restringe todo a las ranuras de una clase
 * @param {Object} [opts.classUsage]     obligatorio si hay heroClass
 * @param {number} [opts.priorStrength]
 */
export const scoreItems = (items, opts = {}) => {
  const {
    alpha = 0.5,
    unit = 'slots',
    heroClass = null,
    classUsage = null,
    priorStrength = 8
  } = opts;

  const heroSlots =
    heroClass && classUsage && classUsage[heroClass] ? classUsage[heroClass][unit] : 0;

  const pool = (items || [])
    .filter((item) => !heroClass || item.universal || item.owners.includes(heroClass))
    .map((item) => {
      const mine = heroClass ? item.byClass[heroClass] : null;
      const picks = heroClass ? (mine ? mine[unit] : 0) : item.picks[unit];
      const opportunities = heroClass ? heroSlots : item.opportunities[unit];
      return { item, picks, opportunities: Math.max(opportunities, picks) };
    })
    .filter((row) => !heroClass || row.picks > 0);

  const totalPicks = pool.reduce((sum, row) => sum + row.picks, 0);
  const totalOpportunities = pool.reduce((sum, row) => sum + row.opportunities, 0);
  const baseRate = totalOpportunities > 0 ? totalPicks / totalOpportunities : 0;

  const scored = pool.map(({ item, picks, opportunities }) => {
    const rate = opportunities > 0 ? picks / opportunities : 0;
    const smoothed =
      opportunities > 0 ? (picks + priorStrength * baseRate) / (opportunities + priorStrength) : 0;
    const score = picks > 0 ? Math.pow(picks, 1 - alpha) * Math.pow(smoothed, alpha) : 0;
    return { ...item, picks, opportunities, rate, smoothed, score };
  });

  scored.sort((a, b) => b.score - a.score || b.picks - a.picks || a.name.localeCompare(b.name));

  const best = scored.length ? scored[0].score : 0;
  return scored.map((row, index) => ({
    ...row,
    rank: index + 1,
    relative: best > 0 ? row.score / best : 0
  }));
};

/**
 * Cuantos puestos gana o pierde cada item al llevar alpha de 0 a 1. Es la
 * medida directa del sesgo de popularidad que el aplanado esta corrigiendo:
 * positivo = sube al aplanar, negativo = solo estaba arriba por el heroe.
 */
export const flattenSwing = (items, opts = {}) => {
  const raw = scoreItems(items, { ...opts, alpha: 0 });
  const flat = scoreItems(items, { ...opts, alpha: 1 });
  const flatRank = new Map(flat.map((row) => [row.id, row.rank]));
  return new Map(raw.map((row) => [row.id, row.rank - (flatRank.get(row.id) || row.rank)]));
};
