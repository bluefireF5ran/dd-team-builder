import { regionFit, regionFitBreakdown, bestRegionFor, resetRegionFitCache } from '../regionFit';
import { bisLoadout, resetBisCaches } from '../../data/bisIndex';
import { REGION_PROFILES } from '../../data/regionProfiles';
import { skillProfile } from '../skillProfile';

beforeEach(() => {
  resetBisCaches();
  resetRegionFitCache();
});

/** Una party montada con la loadout recomendada de cada rango. */
const party = (names) =>
  names.map((heroClass, index) => {
    const build = bisLoadout(heroClass, index + 1);
    return {
      heroClass,
      activeSkills: build.activeSkills,
      activeCampSkills: build.activeCampSkills
    };
  });

const BLEED = ['Hellion', 'Highwayman', 'Bounty Hunter', 'Houndmaster'];

describe('regionFit', () => {
  it('says nothing about a region it has no profile for', () => {
    // La Granja y la Darkest Dungeon no tienen perfil a proposito. Callarse es
    // la respuesta, no una nota inventada.
    expect(regionFit(party(BLEED), 'The Farmstead')).toBe(0);
    expect(regionFitBreakdown(party(BLEED), 'The Darkest Dungeon I')).toEqual([]);
  });

  it('adds up to exactly what the breakdown says', () => {
    const heroes = party(BLEED);
    const total = regionFitBreakdown(heroes, 'The Warrens').reduce((sum, row) => sum + row.points, 0);
    expect(regionFit(heroes, 'The Warrens')).toBeCloseTo(total, 10);
  });

  it('writes off bleed in the Ruins, where a skeleton resists 200%', () => {
    // La media de las Ruinas es 151, asi que `1 - 151/100` es negativo y se
    // corta en cero: no existe sangrar menos que nada.
    const rows = regionFitBreakdown(party(BLEED), 'The Ruins');
    const bleed = rows.find((row) => row.kind === 'bleed');
    expect(bleed.points).toBe(0);
  });

  it('sends a bleed party to the Warrens and not to the Ruins', () => {
    // 44% de resistencia contra 151%. Es la diferencia mas grande que hay entre
    // dos regiones en cualquier eje, y la que el sugeridor se estaba callando
    // cuando etiquetaba todo como "The Ruins".
    const heroes = party(BLEED);
    expect(bestRegionFor(heroes).location).toBe('The Warrens');
    expect(regionFit(heroes, 'The Warrens')).toBeGreaterThan(regionFit(heroes, 'The Ruins'));
  });

  it('charges a self-marking hero where the enemies punish marks', () => {
    // El Leper se automarca en `Withstand` y en `Intimidate`. En las Ruinas el
    // 27.5% de los bichos pega mas fuerte a un marcado y en la Cala el 11.1%,
    // asi que el mismo heroe cuesta mas alli.
    const heroes = party(['Leper', 'Abomination', 'Plague Doctor', 'Antiquarian']);
    const cost = (location) =>
      regionFitBreakdown(heroes, location).find((row) => row.kind === 'self-mark')?.points;

    expect(cost('The Ruins')).toBeLessThan(0);
    expect(cost('The Ruins')).toBeLessThan(cost('The Cove'));
  });

  it('charges nothing to a party that never marks itself', () => {
    const heroes = party(['Crusader', 'Man at Arms', 'Vestal', 'Arbalest']);
    const selfMark = regionFitBreakdown(heroes, 'The Warrens').find((row) => row.kind === 'self-mark');
    expect(selfMark).toBeUndefined();
  });

  it('pays the Crusader and the Vestal for the Ruins being 61% unholy', () => {
    const heroes = party(['Crusader', 'Man at Arms', 'Vestal', 'Arbalest']);
    const bonus = (location) =>
      regionFitBreakdown(heroes, location).find((row) => row.kind === 'vs unholy')?.points || 0;

    // 61% en las Ruinas contra 4.2% en la Guarida.
    expect(bonus('The Ruins')).toBeGreaterThan(bonus('The Warrens'));
    expect(regionFit(heroes, 'The Ruins')).toBeGreaterThan(regionFit(heroes, 'The Warrens'));
  });

  it('ignores a skill the hero cannot launch from where they stand', () => {
    // Misma regla que `enemyReach`: una skill que no puede usar no sangra a
    // nadie. La Arbalest en rango 1 no lanza casi nada, asi que no puede
    // aportar lo mismo que en el 4.
    const back = [{ heroClass: 'Houndmaster', activeSkills: ["Hound's Rush"] }];
    const usable = skillProfile('Houndmaster', "Hound's Rush").launch;
    expect(usable).not.toContain(1);

    const atRankOne = regionFitBreakdown(back, 'The Warrens');
    const atRankThree = regionFitBreakdown([null, null, back[0]], 'The Warrens');
    expect(atRankOne.find((row) => row.kind === 'bleed')).toBeUndefined();
    expect(atRankThree.find((row) => row.kind === 'bleed').points).toBeGreaterThan(0);
  });
});

describe('bestRegionFor', () => {
  it('only ever answers with a region that has a profile', () => {
    const heroes = party(BLEED);
    expect(REGION_PROFILES[bestRegionFor(heroes).location]).toBeDefined();
  });

  it('leaves out the Hamlet, which is a defence and not a destination', () => {
    // Tiene perfil --Vvulf es una pelea de verdad-- pero no es un sitio al que
    // se decida ir con una comp, y la libreria lo dice: una sola ficha. La
    // regla se deriva de eso, no de una lista escrita a mano.
    const seen = new Set();
    [
      BLEED,
      ['Leper', 'Abomination', 'Plague Doctor', 'Antiquarian'],
      ['Crusader', 'Man at Arms', 'Vestal', 'Arbalest'],
      ['Duelist', 'Leper', 'Occultist', 'Vestal']
    ].forEach((names) => seen.add(bestRegionFor(party(names)).location));

    expect(seen.has('The Hamlet')).toBe(false);
    expect(seen.size).toBeGreaterThan(1);
  });
});
