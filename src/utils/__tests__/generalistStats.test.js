import {
  buildUsageStats,
  defaultPriorStrength,
  flattenSwing,
  scoreItems
} from '../generalistStats';

// Libreria de juguete con el sesgo que el aplanado tiene que corregir: el
// Houndmaster sale seis veces y el Leper dos, en dos familias con distinto
// numero de variantes.
const hero = (heroClass, skills, campSkills = [], trinket1 = null, trinket2 = null) => ({
  heroClass,
  activeSkills: skills,
  activeCampSkills: campSkills,
  trinket1,
  trinket2
});

const comp = (id, family, heroes, location = 'The Ruins') => ({ id, name: id, family, location, heroes });

const LIBRARY = [
  // Familia "Hound Pack": cuatro variantes, todas con Houndmaster.
  comp('a', 'Hound Pack', [
    hero('Houndmaster', ["Hound's Rush", 'Cry Havoc'], ['Therapy Dog'], "Ancestor's Map"),
    hero('Crusader', ['Smite'], ['Encourage'], 'Signed Conscription')
  ]),
  comp('b', 'Hound Pack', [
    hero('Houndmaster', ["Hound's Rush", 'Cry Havoc'], ['Therapy Dog'], "Ancestor's Map")
  ]),
  comp('c', 'Hound Pack', [
    hero('Houndmaster', ["Hound's Rush", 'Cry Havoc'], ['Therapy Dog'], "Ancestor's Map")
  ]),
  comp('d', 'Hound Pack', [
    hero('Houndmaster', ["Hound's Rush", 'Blackjack'], ['Therapy Dog'])
  ]),
  // Dos comps mas de Houndmaster en otra familia.
  comp('e', 'Marked Prey', [
    hero('Houndmaster', ["Hound's Rush", 'Blackjack'], ['Therapy Dog']),
    hero('Crusader', ['Smite'], ['Encourage'], 'Signed Conscription')
  ]),
  comp('f', 'Marked Prey', [hero('Houndmaster', ["Hound's Rush", 'Blackjack'], ['Therapy Dog'])]),
  // El Leper apenas sale, pero cuando sale siempre lleva Chop.
  comp('g', 'Iron Shackles', [hero('Leper', ['Chop'], ['Encourage'], "Ancestor's Map")]),
  comp('h', 'Iron Shackles', [hero('Leper', ['Chop'], ['Encourage'])])
];

const stats = buildUsageStats(LIBRARY);

const byName = (rows, name) => rows.find((row) => row.name === name);

describe('buildUsageStats', () => {
  it('counts comps, families and filled slots', () => {
    expect(stats.compCount).toBe(8);
    expect(stats.familyCount).toBe(3);
    expect(stats.slotCount).toBe(10);
  });

  it('counts a class once per family and once per slot', () => {
    expect(stats.classUsage.Houndmaster).toEqual({ slots: 6, families: 2 });
    expect(stats.classUsage.Leper).toEqual({ slots: 2, families: 1 });
  });

  it('gives a skill the appearances of every class that owns it as opportunities', () => {
    const rush = byName(stats.items.skills, "Hound's Rush");
    expect(rush.picks.slots).toBe(6);
    expect(rush.opportunities.slots).toBe(6); // solo el Houndmaster la tiene
    expect(rush.owners).toEqual(['Houndmaster']);

    const havoc = byName(stats.items.skills, 'Cry Havoc');
    expect(havoc.picks.slots).toBe(3);
    expect(havoc.opportunities.slots).toBe(6);
  });

  it('spreads a shared camp skill over every owning class', () => {
    const encourage = byName(stats.items.campSkills, 'Encourage');
    expect(encourage.picks.slots).toBe(4); // 2 Crusader + 2 Leper
    // Encourage la tienen casi todas las clases, asi que las oportunidades son
    // las ranuras de todas las que aparecen menos las que no la tienen.
    expect(encourage.opportunities.slots).toBe(stats.slotCount);
  });

  it('treats a universal trinket as available in every slot and a class trinket only in its own', () => {
    const map = byName(stats.items.trinkets, "Ancestor's Map");
    expect(map.universal).toBe(true);
    expect(map.opportunities.slots).toBe(stats.slotCount);

    const conscription = byName(stats.items.trinkets, 'Signed Conscription');
    expect(conscription.universal).toBe(false);
    expect(conscription.owners).toEqual(['Crusader']);
    expect(conscription.opportunities.slots).toBe(2);
  });
});

describe('scoreItems', () => {
  const options = { unit: 'slots', priorStrength: 2, classUsage: stats.classUsage };

  it('alpha 0 is pure popularity', () => {
    const ranked = scoreItems(stats.items.skills, { ...options, alpha: 0 });
    expect(ranked.map((row) => row.name).slice(0, 2)).toEqual(["Hound's Rush", 'Blackjack']);
    expect(byName(ranked, 'Cry Havoc').rank).toBeLessThan(byName(ranked, 'Chop').rank);
  });

  it('alpha 1 cancels class popularity out', () => {
    const ranked = scoreItems(stats.items.skills, { ...options, alpha: 1 });
    // Chop es 2 de 2 con el Leper; Cry Havoc 3 de 6 con el Houndmaster. Con la
    // popularidad fuera, la que siempre se coge adelanta a la que se coge mas.
    expect(byName(ranked, 'Chop').rank).toBeLessThan(byName(ranked, 'Cry Havoc').rank);
    expect(byName(ranked, 'Chop').rate).toBe(1);
    expect(byName(ranked, 'Cry Havoc').rate).toBe(0.5);
  });

  it('the smoothing prior keeps a tiny sample from beating a big one at the same rate', () => {
    const ranked = scoreItems(stats.items.skills, { ...options, alpha: 1 });
    const rush = byName(ranked, "Hound's Rush"); // 6/6
    const chop = byName(ranked, 'Chop'); // 2/2
    expect(rush.rate).toBe(chop.rate);
    expect(rush.rank).toBeLessThan(chop.rank);
  });

  it('counting families collapses the variants of one family', () => {
    const bySlot = scoreItems(stats.items.skills, { ...options, alpha: 0 });
    const byFamily = scoreItems(stats.items.skills, { ...options, alpha: 0, unit: 'families' });
    expect(byName(bySlot, "Hound's Rush").picks).toBe(6);
    expect(byName(byFamily, "Hound's Rush").picks).toBe(2);
    expect(byName(byFamily, 'Smite').picks).toBe(2);
    // A ranuras el Smite pierde 6 a 2; por familias empatan.
    expect(byName(byFamily, 'Smite').picks).toBe(byName(byFamily, "Hound's Rush").picks);
  });

  it('a class filter measures everything against that class only', () => {
    const ranked = scoreItems(stats.items.skills, {
      ...options,
      alpha: 0.5,
      heroClass: 'Houndmaster'
    });
    expect(ranked.map((row) => row.name)).toEqual(["Hound's Rush", 'Blackjack', 'Cry Havoc']);
    ranked.forEach((row) => expect(row.opportunities).toBe(6));
  });

  it('a class filter on trinkets keeps universal ones in the pool', () => {
    const ranked = scoreItems(stats.items.trinkets, {
      ...options,
      alpha: 0.5,
      heroClass: 'Leper'
    });
    expect(ranked.map((row) => row.name)).toEqual(["Ancestor's Map"]);
    expect(ranked[0].picks).toBe(1);
    expect(ranked[0].opportunities).toBe(2);
  });

  it('scores nothing when there is nothing to score', () => {
    expect(scoreItems([], { alpha: 0.5 })).toEqual([]);
    expect(scoreItems(undefined, { alpha: 0.5 })).toEqual([]);
  });
});

describe('flattenSwing', () => {
  it('is positive for what the flattening promotes and negative for what it demotes', () => {
    const swings = flattenSwing(stats.items.skills, {
      unit: 'slots',
      priorStrength: 2,
      classUsage: stats.classUsage
    });
    const chop = byName(stats.items.skills, 'Chop');
    const havoc = byName(stats.items.skills, 'Cry Havoc');
    expect(swings.get(chop.id)).toBeGreaterThan(0);
    expect(swings.get(havoc.id)).toBeLessThan(0);
  });
});

describe('defaultPriorStrength', () => {
  it('scales with how many observations the unit has, never below two', () => {
    expect(defaultPriorStrength({ compCount: 151, familyCount: 31 }, 'slots')).toBe(8);
    expect(defaultPriorStrength({ compCount: 151, familyCount: 31 }, 'families')).toBe(2);
    expect(defaultPriorStrength({ compCount: 4, familyCount: 2 }, 'slots')).toBe(2);
  });
});
