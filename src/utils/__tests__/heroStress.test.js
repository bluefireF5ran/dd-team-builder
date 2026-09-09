import {
  STRESS_CONFIG,
  bySuitability,
  clampStress,
  compPeakStress,
  compStressWeight,
  isStrained,
  restedCandidates,
  stressPool,
  stressWeight,
  stressWeightsFor,
  weightedPick,
  weightedSample
} from '../heroStress';

const hero = (overrides = {}) => ({
  name: 'Reynauld',
  heroClass: 'Crusader',
  resolveXp: 0,
  stress: 0,
  activity: '',
  isMissing: false,
  ...overrides
});

describe('clampStress', () => {
  test('missing, junk and negative stress all read as none', () => {
    [undefined, null, NaN, 'lots', -20].forEach((value) => expect(clampStress(value)).toBe(0));
  });

  test('caps at the resolve check, because past it a hero is just afflicted', () => {
    expect(clampStress(200)).toBe(STRESS_CONFIG.MAX);
  });
});

describe('stressWeight', () => {
  test('a rested hero is drawn at full weight', () => {
    expect(stressWeight(0)).toBe(1);
  });

  test('below the knee stress is bookkeeping', () => {
    expect(stressWeight(25)).toBeGreaterThan(0.9);
    expect(stressWeight(49)).toBeGreaterThan(0.7);
    expect(stressWeight(STRESS_CONFIG.STRAINED)).toBeCloseTo(0.75, 2);
  });

  test('past the knee it falls off a cliff', () => {
    // The complaint that produced this curve: at 70 the old squared falloff
    // still left half weight, and those comps kept being offered.
    expect(stressWeight(60)).toBeLessThan(0.35);
    expect(stressWeight(70)).toBeLessThan(0.12);
    expect(stressWeight(80)).toBeLessThan(0.06);
    expect(stressWeight(90)).toBeLessThan(0.03);
  });

  test('a hero at 70 is worth a fraction of one at 40', () => {
    expect(stressWeight(70)).toBeLessThan(stressWeight(40) / 8);
  });

  test('never reaches zero, so a spent roster still gets an answer', () => {
    expect(stressWeight(STRESS_CONFIG.MAX)).toBe(STRESS_CONFIG.MIN_WEIGHT);
    expect(stressWeight(999)).toBeGreaterThan(0);
  });

  test('falls the whole way down as stress rises', () => {
    const weights = [0, 20, 40, 60, 80, 100].map(stressWeight);
    weights.slice(1).forEach((w, i) => expect(w).toBeLessThan(weights[i]));
  });
});

describe('bySuitability', () => {
  const order = (heroes) => [...heroes].sort(bySuitability).map((h) => h.name);

  test('a hero busy in town goes last, however calm', () => {
    expect(
      order([
        hero({ name: 'Busy', activity: 'abbey', stress: 0 }),
        hero({ name: 'Free', stress: 40 })
      ])
    ).toEqual(['Free', 'Busy']);
  });

  test('a fresh recruit beats a veteran who is about to break', () => {
    // This is the ordering that changed: resolve XP used to win outright, so a
    // Resolve 5 hero at 95 stress kept being handed over.
    expect(
      order([
        hero({ name: 'Veteran', resolveXp: 5000, stress: 95 }),
        hero({ name: 'Recruit', resolveXp: 0, stress: 0 })
      ])
    ).toEqual(['Recruit', 'Veteran']);
  });

  test('below the strained line experience still decides', () => {
    expect(
      order([
        hero({ name: 'Green', resolveXp: 0, stress: 0 }),
        hero({ name: 'Seasoned', resolveXp: 900, stress: 30 })
      ])
    ).toEqual(['Seasoned', 'Green']);
  });

  test('and between two equals, the calmer one', () => {
    expect(
      order([
        hero({ name: 'Frayed', resolveXp: 100, stress: 45 }),
        hero({ name: 'Calm', resolveXp: 100, stress: 5 })
      ])
    ).toEqual(['Calm', 'Frayed']);
  });
});

describe('stressPool', () => {
  test('lists a class in the order its slots would be filled', () => {
    const pool = stressPool([
      hero({ name: 'A', heroClass: 'Highwayman', stress: 70 }),
      hero({ name: 'B', heroClass: 'Highwayman', stress: 10 }),
      hero({ name: 'C', heroClass: 'Vestal', stress: 30 })
    ]);
    expect(pool.get('highwayman')).toEqual([10, 70]);
    expect(pool.get('vestal')).toEqual([30]);
  });

  test('is empty without a save, which is what makes the draw uniform', () => {
    expect(stressPool(null).size).toBe(0);
    expect(stressPool([]).size).toBe(0);
  });
});

describe('compStressWeight', () => {
  const comp = (classes) => ({ heroes: classes.map((heroClass) => ({ heroClass })) });

  test('weighs a comp on the heroes it would actually field', () => {
    const pool = stressPool([
      hero({ name: 'Calm', heroClass: 'Crusader', stress: 0 }),
      hero({ name: 'Spent', heroClass: 'Hellion', stress: 95 })
    ]);
    expect(compStressWeight(comp(['Crusader']), pool)).toBe(1);
    expect(compStressWeight(comp(['Hellion']), pool)).toBeLessThan(0.2);
  });

  test('one exhausted hero sinks a comp of three rested ones', () => {
    // Multiplying, not averaging: an average would let the other three hide him.
    const pool = stressPool([
      hero({ name: 'A', heroClass: 'Crusader', stress: 0 }),
      hero({ name: 'B', heroClass: 'Vestal', stress: 0 }),
      hero({ name: 'C', heroClass: 'Jester', stress: 0 }),
      hero({ name: 'D', heroClass: 'Hellion', stress: 95 })
    ]);
    const rested = compStressWeight(comp(['Crusader', 'Vestal', 'Jester']), pool);
    const withSpent = compStressWeight(comp(['Crusader', 'Vestal', 'Jester', 'Hellion']), pool);
    expect(withSpent).toBeLessThan(rested / 5);
  });

  test('a doubled class is judged on your second hero too', () => {
    const pool = stressPool([
      hero({ name: 'Fresh', heroClass: 'Jester', stress: 0 }),
      hero({ name: 'Wrecked', heroClass: 'Jester', stress: 100 })
    ]);
    expect(compStressWeight(comp(['Jester']), pool)).toBe(1);
    expect(compStressWeight(comp(['Jester', 'Jester']), pool)).toBeLessThan(0.1);
  });

  test('a class you own nobody of is neutral, not stressed', () => {
    const pool = stressPool([hero({ heroClass: 'Crusader', stress: 0 })]);
    expect(compStressWeight(comp(['Leper', 'Leper']), pool)).toBe(1);
    expect(stressWeightsFor(['Leper'], pool)[0].stress).toBeNull();
  });

  test('with no save every comp weighs the same', () => {
    expect(compStressWeight(comp(['Leper']), new Map())).toBe(1);
  });

  test('never falls to zero, so the tiredest roster is still fieldable', () => {
    const pool = stressPool(
      ['Crusader', 'Vestal', 'Jester', 'Hellion'].map((heroClass) =>
        hero({ heroClass, stress: 100 })
      )
    );
    expect(compStressWeight(comp(['Crusader', 'Vestal', 'Jester', 'Hellion']), pool)).toBe(
      STRESS_CONFIG.MIN_WEIGHT
    );
  });
});

describe('restedCandidates', () => {
  const comp = (classes) => ({ heroes: classes.map((heroClass) => ({ heroClass })) });
  const pool = stressPool([
    hero({ name: 'Fresh', heroClass: 'Crusader', stress: 10 }),
    hero({ name: 'Fine', heroClass: 'Vestal', stress: 0 }),
    hero({ name: 'Frayed', heroClass: 'Hellion', stress: 70 }),
    hero({ name: 'Spent', heroClass: 'Leper', stress: 95 })
  ]);

  test('a comp is only as rested as its worst member', () => {
    expect(compPeakStress(comp(['Crusader', 'Vestal']), pool)).toBe(10);
    expect(compPeakStress(comp(['Crusader', 'Hellion']), pool)).toBe(70);
  });

  test('drops every comp that needs a strained hero while a clean one exists', () => {
    const clean = comp(['Crusader', 'Vestal']);
    const tired = comp(['Crusader', 'Hellion']);
    expect(restedCandidates([clean, tired], pool)).toEqual([clean]);
  });

  test('keeps them all when nothing clean fits — an answer beats silence', () => {
    const tired = comp(['Crusader', 'Hellion']);
    const worse = comp(['Leper']);
    expect(restedCandidates([tired, worse], pool)).toEqual([tired, worse]);
  });

  test('without a save every comp is a candidate', () => {
    const comps = [comp(['Leper']), comp(['Hellion'])];
    expect(restedCandidates(comps, new Map())).toEqual(comps);
  });
});

describe('weightedSample', () => {
  test('draws without replacement', () => {
    const drawn = weightedSample(['a', 'b', 'c', 'd'], 3, () => 1);
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn).size).toBe(3);
  });

  test('favours the heavy item without ever locking out the light one', () => {
    let heavy = 0;
    let light = 0;
    for (let i = 0; i < 400; i++) {
      const pick = weightedPick(['heavy', 'light'], (item) => (item === 'heavy' ? 1 : 0.05));
      if (pick === 'heavy') heavy++;
      else light++;
    }
    expect(heavy).toBeGreaterThan(light * 3);
    expect(light).toBeGreaterThan(0);
  });

  test('a zero weight is floored rather than made impossible', () => {
    expect(weightedPick(['only'], () => 0)).toBe('only');
  });
});

describe('isStrained', () => {
  test('half a bar is the line', () => {
    expect(isStrained({ stress: STRESS_CONFIG.STRAINED - 1 })).toBe(false);
    expect(isStrained({ stress: STRESS_CONFIG.STRAINED })).toBe(true);
    expect(isStrained(undefined)).toBe(false);
  });
});
