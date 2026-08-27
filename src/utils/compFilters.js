// Indice de busqueda de la libreria de comps.
//
// El nombre de una comp solo lleva dos ranuras ("Familia: Variante"); TODO lo
// demas que la taxonomia sabe vive en tags (ver compNaming.js). Este modulo es
// quien convierte esos tags en algo con lo que se puede filtrar, ordenar y
// buscar sin volver a analizar la comp en cada render.
//
// Reparto: aqui solo funciones puras sobre comps ya normalizadas. El indice
// memoizado de la libreria del bundle esta en src/data/compIndex.js.

import { analyzeComp, parseCompName, heroAka } from './compNaming';
import { isModdedHero } from './imageHelper';
import { HERO_TOKENS } from '../data/compTaxonomy';
import { LOCATIONS, getLocationTheme } from '../data/locations';

/** Curacion de vida: si nadie la lleva, la comp merece el aviso `no-heal`. */
const HEAL_SKILLS = new Set([
  'Divine Grace', 'Divine Comfort', 'Battle Heal', 'Wyrd Reconstruction', 'Battlefield Medicine',
  'Battlefield Bandage', 'Lick Wounds', 'Reclaim', 'Redeem', 'Patch Up', 'Hand of Light',
  'Incision', 'Emboldening Vapours'
]);

/** Curacion de estres, el otro recurso que decide si una comp aguanta un pasillo. */
const STRESS_HEAL_SKILLS = new Set([
  'Inspiring Cry', 'Inspiring Tune', 'Solo', 'Rallying Flare', 'Cry Havoc', 'Bellow',
  'Battle Ballad', 'Illumination', 'Suffer', 'Redeem'
]);

const STACK_LABELS = { 2: 'twin', 3: 'trio', 4: 'quartet' };

/** Etiquetas de un solo bit, las que se filtran con un chip de si/no. */
export const FLAG_TAGS = [
  { id: 'dupe', label: 'Duplicates', hint: '2+ of the same class' },
  { id: 'twin', label: 'Twin', hint: 'exactly 2 of a class' },
  { id: 'trio', label: 'Trio', hint: '3 of a class' },
  { id: 'quartet', label: 'Quartet', hint: '4 of a class' },
  { id: 'modded', label: 'Modded', hint: 'uses a modded hero class' },
  { id: 'no-heal', label: 'No healer', hint: 'nobody heals HP' },
  { id: 'no-stress-heal', label: 'No stress heal', hint: 'nobody heals stress' },
  { id: 'incomplete', label: 'Incomplete', hint: 'fewer than 4 heroes' }
];

const heroToken = (heroClass) => (HERO_TOKENS[heroClass] || {}).token || heroClass;

const REGION_ORDER = new Map(LOCATIONS.map((loc, i) => [loc, i]));

const regionRank = (location) => (REGION_ORDER.has(location) ? REGION_ORDER.get(location) : 99);

/**
 * Enriquece una comp con todo lo que la rejilla necesita saber, una sola vez.
 * El campo `search` es el unico que se toca al teclear: un blob en minusculas
 * con nombre, alias, clases, apodos, tags, skills y baratijas, para que buscar
 * "warlock ritual" o "focus ring" acierte sin logica especial por campo.
 */
export const buildCompEntry = (comp) => {
  const heroes = comp.heroes || [];
  const filled = heroes.filter((h) => h && h.heroClass);
  const analysis = analyzeComp(comp);
  const parsed = parseCompName(comp.name || comp.teamName || '');

  // `heroClasses` es POSICIONAL: el indice es la ranura, no el n-esimo heroe que
  // haya. Si una comp tiene un hueco en medio, compactarla correria a los de
  // detras y el orden por rango mentiria.
  const heroClasses = heroes.map((h) => (h && h.heroClass) || '');
  const uniqueClasses = [...new Set(heroClasses.filter(Boolean))];
  const skills = filled.flatMap((h) => h.activeSkills || []).filter(Boolean);
  const campSkills = filled.flatMap((h) => h.activeCampSkills || []).filter(Boolean);
  const trinkets = filled.flatMap((h) => [h.trinket1, h.trinket2]).filter(Boolean);

  const biggestStack = analysis.stacks.length ? analysis.stacks[0].count : 1;
  const flags = [];
  if (biggestStack >= 2) flags.push('dupe', STACK_LABELS[Math.min(biggestStack, 4)]);
  if (uniqueClasses.some(isModdedHero)) flags.push('modded');
  if (!skills.some((s) => HEAL_SKILLS.has(s))) flags.push('no-heal');
  if (!skills.some((s) => STRESS_HEAL_SKILLS.has(s))) flags.push('no-stress-heal');
  if (filled.length < 4) flags.push('incomplete');

  const tags = [...analysis.tags, ...flags.map((f) => `flag:${f}`)];
  const theme = getLocationTheme(comp.location);

  const search = [
    comp.name || comp.teamName || '',
    comp.alias || '',
    comp.description || '',
    parsed.family,
    parsed.variant,
    comp.location || '',
    theme.short,
    ...uniqueClasses,
    ...uniqueClasses.map(heroToken),
    // Los sinonimos retirados del nombre ("hex", "musket", "chop") siguen siendo
    // como mucha gente llama a la clase: no dan nombre, pero tienen que buscar.
    ...uniqueClasses.flatMap(heroAka),
    ...analysis.mechanics.map((m) => m.label),
    ...analysis.campTerms.map((t) => t.label),
    ...skills,
    ...campSkills,
    ...trinkets,
    ...tags,
    ...flags
  ]
    .join(' ')
    .toLowerCase();

  return {
    ...comp,
    family: parsed.family,
    variant: parsed.variant,
    heroClasses,
    uniqueClasses,
    size: filled.length,
    heroTokens: uniqueClasses.map(heroToken),
    mechanics: analysis.mechanics.map((m) => ({ tag: m.tag, label: m.label })),
    campTerms: analysis.campTerms.map((t) => ({ tag: t.tag, label: t.label })),
    stacks: analysis.stacks,
    flags,
    tags,
    theme,
    search
  };
};

/**
 * Un equipo guardado usa `teamName`; la libreria usa `name`. Se iguala aqui para
 * que las dos pestanas compartan tarjeta, filtros y orden sin ramas por pestana.
 */
export const normalizeSavedTeam = (team) => ({
  id: `saved:${team.teamName}`,
  name: team.teamName || '',
  alias: '',
  description: null,
  location: team.location || '',
  heroes: team.heroes || [],
  savedAt: team.savedAt || '',
  source: 'saved'
});

const byText = (a, b) => String(a || '').localeCompare(String(b || ''));

// El array va de vanguardia a retaguardia: heroes[0] es el rango 1 y heroes[3]
// el rango 4, igual que en PartyComposition (que lo invierte al pintar para
// dejar la retaguardia a la izquierda). Todo lo que hable de rangos parte de aqui.
const RANK_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3 };

/** Clase en un rango concreto. Un hueco ordena al final, no al principio. */
const rankClass = (entry, rank) => entry.heroClasses[RANK_TO_INDEX[rank]] || '￿';

/** Compara rango a rango en el orden dado: el primero de la lista es el que manda. */
const byRanks = (ranks) => (a, b) => {
  for (const rank of ranks) {
    const diff = byText(rankClass(a, rank), rankClass(b, rank));
    if (diff !== 0) return diff;
  }
  return byText(a.name, b.name);
};

export const SORT_OPTIONS = [
  { id: 'name', label: 'Name A-Z', compare: (a, b) => byText(a.name, b.name) },
  { id: 'name-desc', label: 'Name Z-A', compare: (a, b) => byText(b.name, a.name) },
  { id: 'family', label: 'Family', compare: (a, b) => byText(a.family, b.family) || byText(a.variant, b.variant) },
  // Retaguardia primero: manda el rango 4 y se resuelve con el 3, el 2 y el 1.
  { id: 'backline', label: 'Class (rank 4 first)', compare: byRanks([4, 3, 2, 1]) },
  // Y al reves: decide la vanguardia y se resuelve hacia atras.
  { id: 'frontline', label: 'Class (rank 1 first)', compare: byRanks([1, 2, 3, 4]) },
  { id: 'region', label: 'Region', compare: (a, b) => regionRank(a.location) - regionRank(b.location) || byText(a.name, b.name) },
  { id: 'size', label: 'Party size', compare: (a, b) => b.size - a.size || byText(a.name, b.name) },
  {
    id: 'recent',
    label: 'Recently saved',
    savedOnly: true,
    compare: (a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')) || byText(a.name, b.name)
  }
];

const SORT_BY_ID = new Map(SORT_OPTIONS.map((o) => [o.id, o]));

export const sortComps = (entries, sortId) => {
  const option = SORT_BY_ID.get(sortId) || SORT_BY_ID.get('name');
  return [...entries].sort(option.compare);
};

/** Trocea la consulta en terminos; todos deben aparecer (AND), no uno cualquiera. */
export const parseQuery = (query) =>
  String(query || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

export const matchesQuery = (entry, terms) => terms.every((t) => entry.search.includes(t));

/**
 * Filtro compuesto. Dentro de una faceta las opciones son OR ("Ruins o Cove");
 * entre facetas son AND, que es como se lee un filtro sin tener que explicarlo.
 * Los heroes son la excepcion: varios heroes significa "los lleva todos", que es
 * lo que uno quiere al buscar una pareja concreta.
 */
export const filterComps = (entries, { query = '', heroes = [], regions = [], families = [], flags = [] } = {}) => {
  const terms = parseQuery(query);
  const heroSet = heroes.length ? new Set(heroes) : null;
  const regionSet = regions.length ? new Set(regions) : null;
  const familySet = families.length ? new Set(families) : null;

  return entries.filter((entry) => {
    if (terms.length && !matchesQuery(entry, terms)) return false;
    if (regionSet && !regionSet.has(entry.location)) return false;
    if (familySet && !familySet.has(entry.family)) return false;
    if (heroSet) {
      const own = new Set(entry.uniqueClasses);
      for (const h of heroSet) if (!own.has(h)) return false;
    }
    if (flags.length && !flags.every((f) => entry.flags.includes(f))) return false;
    return true;
  });
};

/** Cuenta cuantas comps caen en cada opcion, para que un chip vacio se note. */
export const buildFacets = (entries) => {
  const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
  const heroes = new Map();
  const regions = new Map();
  const families = new Map();
  const flags = new Map();

  entries.forEach((entry) => {
    entry.uniqueClasses.forEach((c) => bump(heroes, c));
    bump(regions, entry.location);
    if (entry.family) bump(families, entry.family);
    entry.flags.forEach((f) => bump(flags, f));
  });

  const toList = (map) => [...map.entries()].map(([id, count]) => ({ id, count }));

  return {
    heroes: toList(heroes).sort((a, b) => byText(a.id, b.id)),
    regions: toList(regions).sort((a, b) => regionRank(a.id) - regionRank(b.id)),
    families: toList(families).sort((a, b) => b.count - a.count || byText(a.id, b.id)),
    flags: FLAG_TAGS.filter((f) => flags.has(f.id)).map((f) => ({ ...f, count: flags.get(f.id) }))
  };
};
