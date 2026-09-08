// ---------------------------------------------------------------------------
// Turns the active hero roster into the item pools the ranker compares.
// Adding a hero to the roster automatically contributes its skills and camp
// skills to the other two pools.
// ---------------------------------------------------------------------------

import { COMP_LIBRARY } from '../data/compLibrary';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import {
  getHeroImagePath,
  getSkillImagePath,
  getCampSkillImagePath
} from './imageHelper';

/** Every hero class the ranker can offer, vanilla first. */
export const getHeroDefinition = (name) => HERO_CLASSES[name] || MODDED_HERO_CLASSES[name] || null;

export const isVanillaHero = (name) => !!HERO_CLASSES[name];

export const VANILLA_HERO_NAMES = Object.keys(HERO_CLASSES).sort();
export const MODDED_HERO_NAMES = Object.keys(MODDED_HERO_CLASSES)
  .filter((name) => !HERO_CLASSES[name])
  .sort((a, b) => a.localeCompare(b));
export const ALL_HERO_NAMES = [...VANILLA_HERO_NAMES, ...MODDED_HERO_NAMES];

const heroItem = (name) => ({
  id: `hero:${name}`,
  name,
  image: getHeroImagePath(name),
  classes: [name],
  modded: !isVanillaHero(name),
  subtitle: isVanillaHero(name) ? 'Vanilla class' : 'Modded class'
});

// Skills and camp skills are deduped by name: several classes share camp
// skills like Encourage or Pep Talk, and ranking twenty identical copies of
// Encourage would be pointless. The owning classes are kept for context.
const buildNamedPool = (heroNames, listKey, imageFor, prefix) => {
  const byName = new Map();

  heroNames.forEach((heroName) => {
    const def = getHeroDefinition(heroName);
    if (!def) return;
    (def[listKey] || []).forEach((entryName) => {
      if (!entryName) return;
      const existing = byName.get(entryName);
      if (existing) {
        if (!existing.classes.includes(heroName)) existing.classes.push(heroName);
        return;
      }
      byName.set(entryName, {
        id: `${prefix}:${entryName}`,
        name: entryName,
        image: imageFor(entryName, heroName),
        classes: [heroName],
        modded: !isVanillaHero(heroName)
      });
    });
  });

  return [...byName.values()].map((item) => ({
    ...item,
    heroImage: getHeroImagePath(item.classes[0]),
    subtitle:
      item.classes.length === 1
        ? item.classes[0]
        : `Shared — ${item.classes.length} classes`
  }));
};

// ---------------------------------------------------------------------------
// Comps.
//
// A comp item carries its WHOLE loadout, not just a name: the point of ranking
// comps head-to-head is to judge the parties as built, and the saved JSON is
// meant to be read back outside this app, so the export has to carry what was
// actually compared.
//
// Scoped to one region, always. The library is ~160 comps and an exact pairwise
// sort of that is over a thousand picks; more importantly a comp is built FOR a
// region, so one global order would average four different questions together.
// ---------------------------------------------------------------------------

const compItem = (comp) => {
  const heroes = (comp.heroes || []).filter((hero) => hero && hero.heroClass);
  const classes = heroes.map((hero) => hero.heroClass);
  return {
    id: `comp:${comp.id}`,
    name: comp.name,
    // No single portrait stands for a party; the card draws the formation.
    image: null,
    heroImage: classes.length ? getHeroImagePath(classes[0]) : null,
    classes,
    modded: heroes.some((hero) => !isVanillaHero(hero.heroClass)),
    subtitle: comp.alias ? `${comp.location} — ${comp.alias}` : comp.location,
    location: comp.location,
    alias: comp.alias || '',
    source: comp.source,
    heroes
  };
};

export const compRegions = () =>
  [...new Set(COMP_LIBRARY.map((comp) => comp.location).filter(Boolean))].sort();

export const buildCompItems = (region) => {
  const wanted = COMP_LIBRARY.filter((comp) => !region || comp.location === region);
  return wanted
    // A one-hero or empty entry is not a party to judge; the library carries a
    // few, and they would only waste picks.
    .map(compItem)
    .filter((item) => item.heroes.length >= 2);
};

/**
 * @param {'heroes'|'skills'|'campSkills'|'comps'} category
 * @param {string[]} heroNames Active roster.
 * @param {{region?: string}} [options] Comp scope; ignored by the other pools.
 */
export const buildItems = (category, heroNames, options = {}) => {
  const roster = heroNames.filter((name) => !!getHeroDefinition(name));

  if (category === 'heroes') return roster.map(heroItem);
  if (category === 'skills') {
    return buildNamedPool(roster, 'skills', getSkillImagePath, 'skill');
  }
  if (category === 'campSkills') {
    return buildNamedPool(roster, 'campSkills', getCampSkillImagePath, 'camp');
  }
  if (category === 'comps') return buildCompItems(options.region);
  return [];
};
