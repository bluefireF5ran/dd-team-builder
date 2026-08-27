import {
  buildCompEntry,
  buildFacets,
  filterComps,
  normalizeSavedTeam,
  parseQuery,
  sortComps,
  SORT_OPTIONS
} from '../compFilters';

const hero = (heroClass, extra = {}) => ({
  heroClass,
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  ...extra
});

const comp = (name, location, classes, extra = {}) =>
  buildCompEntry({ id: name, name, location, heroes: classes.map((c) => hero(c)), ...extra });

describe('buildCompEntry', () => {
  it('splits a taxonomic name into family and variant', () => {
    const entry = comp('Dark Ritual: Ballad', 'The Ruins', ['Occultist', 'Plague Doctor', 'Jester', 'Crusader']);
    expect(entry.family).toBe('Dark Ritual');
    expect(entry.variant).toBe('Ballad');
  });

  it('leaves the variant empty for a free-form name', () => {
    const entry = comp('Ruins Speed Run', 'The Ruins', ['Crusader']);
    expect(entry.family).toBe('Ruins Speed Run');
    expect(entry.variant).toBe('');
  });

  it('flags duplicates by stack size', () => {
    expect(comp('a', 'The Ruins', ['Jester', 'Jester', 'Crusader', 'Vestal']).flags).toEqual(
      expect.arrayContaining(['dupe', 'twin'])
    );
    expect(comp('b', 'The Ruins', ['Jester', 'Jester', 'Jester', 'Vestal']).flags).toContain('trio');
    expect(comp('c', 'The Ruins', ['Jester', 'Jester', 'Jester', 'Jester']).flags).toContain('quartet');
    expect(comp('d', 'The Ruins', ['Jester', 'Crusader', 'Vestal', 'Leper']).flags).not.toContain('dupe');
  });

  it('flags a party with nobody healing HP', () => {
    const healed = buildCompEntry({
      id: 'h',
      name: 'Holy Hymn: Cross',
      location: 'The Ruins',
      heroes: [hero('Vestal', { activeSkills: ['Divine Grace'] }), hero('Crusader')]
    });
    expect(healed.flags).not.toContain('no-heal');
    expect(comp('x', 'The Ruins', ['Leper', 'Hellion']).flags).toContain('no-heal');
  });

  it('flags an under-strength party', () => {
    expect(comp('short', 'The Ruins', ['Leper']).flags).toContain('incomplete');
    expect(comp('full', 'The Ruins', ['Leper', 'Hellion', 'Vestal', 'Jester']).flags).not.toContain('incomplete');
  });

  it('carries the zone colour and short label', () => {
    expect(comp('x', 'The Cove', ['Leper']).theme.short).toBe('Cove');
    expect(comp('y', 'Nowhere', ['Leper']).theme.short).toBe('—');
  });

  it('indexes class, nickname, region, skill and trinket into one search blob', () => {
    const entry = buildCompEntry({
      id: 's',
      name: 'Dark Ritual: Volley',
      alias: 'Clown Fiesta',
      location: 'The Ruins',
      heroes: [hero('Occultist', { activeSkills: ['Vulnerability Hex'], trinket1: 'Focus Ring' })]
    });
    ['dark ritual', 'clown fiesta', 'occultist', 'warlock', 'ruins', 'vulnerability hex', 'focus ring']
      .forEach((term) => expect(entry.search).toContain(term));
  });
});

describe('filterComps', () => {
  const entries = [
    comp('Hound Pack: Volley', 'The Ruins', ['Arbalest', 'Houndmaster', 'Houndmaster', 'Crusader']),
    comp('Holy Hymn: Cross', 'The Cove', ['Vestal', 'Arbalest', 'Crusader', 'Leper']),
    comp('Dark Ritual: Beast', 'The Weald', ['Occultist', 'Plague Doctor', 'Abomination', 'Leper'])
  ];

  it('requires every search term (AND), in any field', () => {
    expect(filterComps(entries, { query: 'hound ruins' })).toHaveLength(1);
    expect(filterComps(entries, { query: 'hound cove' })).toHaveLength(0);
  });

  it('is case insensitive and ignores extra whitespace', () => {
    expect(filterComps(entries, { query: '  HOUND   ruins ' })).toHaveLength(1);
  });

  it('treats several regions as alternatives', () => {
    expect(filterComps(entries, { regions: ['The Ruins', 'The Cove'] })).toHaveLength(2);
  });

  it('treats several heroes as "carries all of them"', () => {
    expect(filterComps(entries, { heroes: ['Arbalest'] })).toHaveLength(2);
    expect(filterComps(entries, { heroes: ['Arbalest', 'Vestal'] })).toHaveLength(1);
    expect(filterComps(entries, { heroes: ['Vestal', 'Abomination'] })).toHaveLength(0);
  });

  it('crosses facets with AND', () => {
    expect(filterComps(entries, { heroes: ['Arbalest'], regions: ['The Cove'] })).toHaveLength(1);
  });

  it('filters by flag', () => {
    expect(filterComps(entries, { flags: ['dupe'] }).map((e) => e.name)).toEqual(['Hound Pack: Volley']);
  });

  it('returns everything when nothing is asked', () => {
    expect(filterComps(entries, {})).toHaveLength(3);
    expect(filterComps(entries)).toHaveLength(3);
  });
});

describe('sortComps', () => {
  // El array va de vanguardia a retaguardia: heroes[0] es el rango 1 y heroes[3]
  // el rango 4. Aqui el rango 4 es el ultimo de la lista de clases.
  const entries = [
    comp('Back', 'The Ruins', ['Leper', 'Crusader', 'Arbalest', 'Vestal']),
    comp('Mid', 'The Cove', ['Leper', 'Crusader', 'Arbalest', 'Occultist']),
    comp('Front', 'The Weald', ['Hellion', 'Crusader', 'Arbalest', 'Occultist'])
  ];

  it('sorts on the rank 4 hero first, resolving 3 then 2 then 1', () => {
    // Rango 4: Occultist (Mid, Front) antes que Vestal (Back). Mid vs Front se
    // resuelve bajando hasta el rango 1: Hellion antes que Leper.
    expect(sortComps(entries, 'backline').map((e) => e.name)).toEqual(['Front', 'Mid', 'Back']);
  });

  it('reads from the other end when sorting on rank 1', () => {
    // Rango 1: Hellion (Front) antes que Leper (Back, Mid). Back vs Mid se
    // resuelve subiendo hasta el rango 4: Occultist antes que Vestal.
    expect(sortComps(entries, 'frontline').map((e) => e.name)).toEqual(['Front', 'Mid', 'Back']);
    // Las mismas dos comps invertidas: cada orden mira un extremo distinto.
    const pair = [
      comp('AbomFront', 'The Ruins', ['Abomination', 'Crusader', 'Arbalest', 'Vestal']),
      comp('AbomBack', 'The Ruins', ['Vestal', 'Crusader', 'Arbalest', 'Abomination'])
    ];
    expect(sortComps(pair, 'frontline').map((e) => e.name)).toEqual(['AbomFront', 'AbomBack']);
    expect(sortComps(pair, 'backline').map((e) => e.name)).toEqual(['AbomBack', 'AbomFront']);
  });

  it('keeps ranks aligned when a comp has a hole in the middle', () => {
    // Compactar el array correria al Vestal del rango 4 al 2 y el orden mentiria.
    const holed = buildCompEntry({
      id: 'holed',
      name: 'Holed',
      location: 'The Ruins',
      heroes: [hero('Leper'), null, null, hero('Vestal')]
    });
    expect(holed.heroClasses).toEqual(['Leper', '', '', 'Vestal']);
    expect(holed.size).toBe(2);
    const full = comp('Full', 'The Ruins', ['Leper', 'Crusader', 'Arbalest', 'Abomination']);
    // Rango 4: Abomination antes que Vestal, pese al hueco.
    expect(sortComps([holed, full], 'backline').map((e) => e.name)).toEqual(['Full', 'Holed']);
  });

  it('puts empty slots last', () => {
    const short = comp('Short', 'The Ruins', ['Vestal']);
    const long = comp('Long', 'The Ruins', ['Vestal', 'Arbalest']);
    expect(sortComps([short, long], 'frontline').map((e) => e.name)).toEqual(['Long', 'Short']);
  });

  it('sorts regions in dungeon order, not alphabetically', () => {
    expect(sortComps(entries, 'region').map((e) => e.location)).toEqual(['The Ruins', 'The Weald', 'The Cove']);
  });

  it('sorts by name both ways and falls back to name for an unknown id', () => {
    expect(sortComps(entries, 'name').map((e) => e.name)).toEqual(['Back', 'Front', 'Mid']);
    expect(sortComps(entries, 'name-desc').map((e) => e.name)).toEqual(['Mid', 'Front', 'Back']);
    expect(sortComps(entries, 'nope').map((e) => e.name)).toEqual(['Back', 'Front', 'Mid']);
  });

  it('does not mutate the input', () => {
    const original = [...entries];
    sortComps(entries, 'name-desc');
    expect(entries).toEqual(original);
  });

  it('offers "recently saved" only on the saved tab', () => {
    expect(SORT_OPTIONS.find((o) => o.id === 'recent').savedOnly).toBe(true);
    expect(SORT_OPTIONS.filter((o) => o.savedOnly)).toHaveLength(1);
  });
});

describe('buildFacets', () => {
  const entries = [
    comp('A', 'The Ruins', ['Arbalest', 'Houndmaster', 'Houndmaster', 'Crusader']),
    comp('B: x', 'The Cove', ['Vestal', 'Arbalest', 'Crusader', 'Leper'])
  ];

  it('counts a class once per comp, not once per hero', () => {
    const hm = buildFacets(entries).heroes.find((h) => h.id === 'Houndmaster');
    expect(hm.count).toBe(1);
  });

  it('orders regions by dungeon progression', () => {
    expect(buildFacets(entries).regions.map((r) => r.id)).toEqual(['The Ruins', 'The Cove']);
  });

  it('only lists flags that some comp actually has', () => {
    const ids = buildFacets(entries).flags.map((f) => f.id);
    expect(ids).toContain('dupe');
    expect(ids).not.toContain('quartet');
  });
});

describe('normalizeSavedTeam', () => {
  it('maps a saved team onto the library shape', () => {
    const entry = normalizeSavedTeam({ teamName: 'My Team', location: 'The Cove', heroes: [], savedAt: '2026-01-01' });
    expect(entry).toMatchObject({ id: 'saved:My Team', name: 'My Team', source: 'saved', savedAt: '2026-01-01' });
  });

  it('survives a team with missing fields', () => {
    expect(normalizeSavedTeam({}).heroes).toEqual([]);
  });
});

describe('parseQuery', () => {
  it('splits on whitespace and drops empties', () => {
    expect(parseQuery('  Hound   Mark ')).toEqual(['hound', 'mark']);
    expect(parseQuery('')).toEqual([]);
    expect(parseQuery(null)).toEqual([]);
  });
});
