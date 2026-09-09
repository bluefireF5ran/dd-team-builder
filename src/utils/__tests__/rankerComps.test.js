// The comp ranking exists because scoring comps with the RL policy that trained
// on them measures how well the model knows them, not how good they are. This
// pool is the human ruler, so what it carries has to survive leaving the app.
import { buildItems, buildCompItems } from '../rankerItems';
import { COMP_LIBRARY } from '../../data/compLibrary';
import { COMP_REGIONS } from '../../config/rankerRoster';
import { compRegions, MIN_COMPS_TO_RANK } from '../rankerItems';
import { LOCATIONS } from '../../data/locations';

describe('comp ranking pool', () => {
  it('is scoped to one region, because a comp is BUILT for a region', () => {
    COMP_REGIONS.forEach((region) => {
      const items = buildCompItems(region);
      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => expect(item.location).toBe(region));
    });
  });

  it('carries the whole loadout, not just a name', () => {
    const [item] = buildCompItems(COMP_REGIONS[0]);
    expect(item.heroes.length).toBeGreaterThanOrEqual(2);
    item.heroes.forEach((hero) => {
      expect(typeof hero.heroClass).toBe('string');
      expect(Array.isArray(hero.activeSkills)).toBe(true);
    });
    // Rank order IS the comp -- position is the index -- so the array order
    // must be preserved rather than sorted or deduped anywhere on the way in.
    const source = COMP_LIBRARY.find((comp) => `comp:${comp.id}` === item.id);
    expect(item.heroes.map((h) => h.heroClass)).toEqual(
      source.heroes.filter((h) => h && h.heroClass).map((h) => h.heroClass)
    );
  });

  it('drops entries that are not a party to judge', () => {
    buildCompItems(null).forEach((item) => expect(item.heroes.length).toBeGreaterThanOrEqual(2));
  });

  it('gives every comp a stable, unique id', () => {
    const ids = buildCompItems(null).map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is reachable through buildItems like every other category', () => {
    const viaCategory = buildItems('comps', [], { region: COMP_REGIONS[0] });
    expect(viaCategory).toEqual(buildCompItems(COMP_REGIONS[0]));
    // The roster gates heroes/skills/campSkills; it must NOT gate comps, whose
    // pool is the comp library and nothing else.
    expect(buildItems('comps', [], {}).length).toBeGreaterThan(viaCategory.length);
  });
});

describe('COMP_REGIONS is derived, not written down', () => {
  it('offers exactly the regions with enough comps to sort', () => {
    // Ni una region vacia ni una con una sola comp: un orden por parejas de
    // una comp no es un orden.
    COMP_REGIONS.forEach((region) => {
      expect(buildCompItems(region).length).toBeGreaterThanOrEqual(MIN_COMPS_TO_RANK - 1);
    });
  });

  it('leaves out the regions the library barely touches', () => {
    // Darkest Dungeon II tiene 2 comps y Farmstead 1.
    expect(COMP_REGIONS).not.toContain('The Farmstead');
    expect(COMP_REGIONS).not.toContain('The Darkest Dungeon II');
  });

  it('picks a region up on its own once it has comps', () => {
    // Con el umbral en 1 aparecen todas las que la libreria toca: la lista se
    // deriva de los datos, asi que escribir comps para el Courtyard basta.
    const everything = compRegions(1);
    expect(everything.length).toBeGreaterThan(COMP_REGIONS.length);
    COMP_REGIONS.forEach((region) => expect(everything).toContain(region));
  });

  it('keeps them in map order, like the rest of the app', () => {
    const positions = COMP_REGIONS.map((name) => LOCATIONS.indexOf(name));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
