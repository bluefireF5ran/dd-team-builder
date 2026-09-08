import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../data/modded_heroes';
import { TRINKETS } from '../data/trinkets';
import { BACKER_TRINKETS } from '../data/backer_trinkets';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../data/quirks';
import { ALL_DISEASES } from '../data/diseases';
import { COMMON_VANILLA_CAMP_SKILLS } from '../constants';
import { NAME_ALIASES } from '../data/name_aliases';

// Todas las variantes de apóstrofe que aparecen en datos externos (JSON generados,
// copy/paste desde la wiki, editores que "embellecen" comillas, etc.)
const APOSTROPHES = /['\u2018\u2019\u201A\u201B\u02BC\u02B9\u2032\u00B4\u0060]/g;

/**
 * Clave de comparación insensible a apóstrofes, acentos, mayúsculas y
 * puntuación/espaciado. "Lash'S Anger", "Lash’s Anger" y "lashs anger"
 * producen la misma clave.
 */
export const nameKey = (name) => {
  if (typeof name !== 'string') return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(APOSTROPHES, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const buildIndex = (...lists) => {
  const index = new Map();
  lists.forEach((list) => {
    (list || []).forEach((name) => {
      const key = nameKey(name);
      if (key && !index.has(key)) index.set(key, name);
    });
  });
  return index;
};

// Grafías alternativas -> nombre canónico (p. ej. "Vvulf's Tassle" -> "Vvulf's Tassel").
const ALIAS_INDEX = new Map();
// Nombre canónico -> sus grafías alternativas, para buscar por cualquiera de ellas.
const ALIASES_BY_CANONICAL = new Map();

Object.entries(NAME_ALIASES).forEach(([canonical, aliases]) => {
  const canonicalKey = nameKey(canonical);
  if (canonicalKey) ALIASES_BY_CANONICAL.set(canonicalKey, aliases);
  aliases.forEach((alias) => {
    const key = nameKey(alias);
    if (key && !ALIAS_INDEX.has(key)) ALIAS_INDEX.set(key, canonical);
  });
});

/**
 * Grafías alternativas conocidas de un nombre (vacío si no tiene).
 */
export const getNameAliases = (name) => ALIASES_BY_CANONICAL.get(nameKey(name)) || [];

/**
 * Coincidencia de búsqueda que también mira los nombres alternativos, para que
 * "Vvulf's Tassle" encuentre "Vvulf's Tassel" y viceversa.
 */
export const nameMatchesSearch = (name, query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  if ((name || '').toLowerCase().includes(q)) return true;
  return getNameAliases(name).some((alias) => alias.toLowerCase().includes(q));
};

const getHeroData = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

const HERO_CLASS_INDEX = buildIndex(Object.keys(HERO_CLASSES), Object.keys(MODDED_HERO_CLASSES));

const ALL_CLASS_SPECIFIC_TRINKETS = [
  ...Object.values(HERO_CLASSES),
  ...Object.values(MODDED_HERO_CLASSES)
].flatMap((data) => data.classSpecificTrinkets || []);

// Índice global: se usa cuando el trinket no pertenece a la clase del héroe
// (por ejemplo comps importadas antes de cambiar de clase).
const TRINKET_INDEX = buildIndex(
  TRINKETS,
  ALL_CLASS_SPECIFIC_TRINKETS,
  MODDED_GENERAL_TRINKETS,
  BACKER_TRINKETS
);

const QUIRK_INDEX = {
  positive: buildIndex(POSITIVE_QUIRKS),
  negative: buildIndex(NEGATIVE_QUIRKS)
};

const DISEASE_INDEX = buildIndex(ALL_DISEASES);

// Índices por clase, construidos bajo demanda y cacheados.
const perClassCache = new Map();

const getClassIndexes = (heroClass) => {
  if (perClassCache.has(heroClass)) return perClassCache.get(heroClass);

  const heroData = getHeroData(heroClass);
  const indexes = {
    skills: buildIndex(heroData?.skills),
    campSkills: buildIndex(heroData?.campSkills, COMMON_VANILLA_CAMP_SKILLS),
    // Los trinkets de clase van primero: si un nombre coincide con uno de la
    // clase y con uno genérico, gana el de la clase (es el que se dibuja con
    // la ruta de asset correcta).
    trinkets: buildIndex(heroData?.classSpecificTrinkets)
  };

  perClassCache.set(heroClass, indexes);
  return indexes;
};

// Devuelve el nombre canónico si se reconoce; si no, conserva el original para
// no perder contenido de mods que el usuario todavía no ha activado.
const resolve = (name, ...indexes) => {
  if (typeof name !== 'string' || !name) return name;
  const key = nameKey(name);
  if (!key) return name;
  for (const index of indexes) {
    const canonical = index.get(key);
    if (canonical) return canonical;
  }
  // Grafías antiguas o alternativas guardadas en equipos previos.
  return ALIAS_INDEX.get(key) || name;
};

export const canonicalizeHeroClass = (heroClass) => resolve(heroClass, HERO_CLASS_INDEX);

export const canonicalizeTrinket = (trinketName, heroClass) =>
  resolve(trinketName, getClassIndexes(heroClass).trinkets, TRINKET_INDEX);

export const canonicalizeSkill = (skillName, heroClass) =>
  resolve(skillName, getClassIndexes(heroClass).skills);

export const canonicalizeCampSkill = (skillName, heroClass) =>
  resolve(skillName, getClassIndexes(heroClass).campSkills);

export const canonicalizeQuirk = (quirkName, isPositive) =>
  resolve(quirkName, isPositive ? QUIRK_INDEX.positive : QUIRK_INDEX.negative);

export const canonicalizeDisease = (diseaseName) => resolve(diseaseName, DISEASE_INDEX);

const canonicalizeQuirkGroup = (group) => {
  if (!group || typeof group !== 'object') return group;
  return {
    ...group,
    positive: Array.isArray(group.positive)
      ? group.positive.map((q) => canonicalizeQuirk(q, true))
      : group.positive,
    negative: Array.isArray(group.negative)
      ? group.negative.map((q) => canonicalizeQuirk(q, false))
      : group.negative
  };
};

/**
 * Normaliza los nombres de un héroe importado contra los datos de la app.
 * No valida ni elimina nada: sólo reescribe los nombres que se reconocen.
 */
export const canonicalizeHero = (hero) => {
  if (!hero || typeof hero !== 'object') return hero;

  const heroClass = canonicalizeHeroClass(hero.heroClass);
  const next = { ...hero, heroClass };

  if (Array.isArray(hero.activeSkills)) {
    next.activeSkills = hero.activeSkills.map((s) => canonicalizeSkill(s, heroClass));
  }
  if (Array.isArray(hero.activeCampSkills)) {
    next.activeCampSkills = hero.activeCampSkills.map((s) => canonicalizeCampSkill(s, heroClass));
  }
  if (hero.trinket1) next.trinket1 = canonicalizeTrinket(hero.trinket1, heroClass);
  if (hero.trinket2) next.trinket2 = canonicalizeTrinket(hero.trinket2, heroClass);
  if (Array.isArray(hero.diseases)) next.diseases = hero.diseases.map(canonicalizeDisease);
  if (hero.quirks) next.quirks = canonicalizeQuirkGroup(hero.quirks);
  if (hero.lockedQuirks) next.lockedQuirks = canonicalizeQuirkGroup(hero.lockedQuirks);

  return next;
};

/**
 * Normaliza un equipo completo tal y como viene de un JSON externo.
 */
export const canonicalizeTeam = (team) => {
  if (!team || typeof team !== 'object') return team;
  if (!Array.isArray(team.heroes)) return team;
  return { ...team, heroes: team.heroes.map(canonicalizeHero) };
};
