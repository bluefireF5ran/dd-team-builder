import { compClassKey, isKnownComp, knownCompKeys, resetCompIdentityCache } from '../compIdentity';

beforeEach(() => resetCompIdentityCache());

describe('compClassKey', () => {
  it('ignores the order the heroes stand in', () => {
    const a = compClassKey(['Leper', 'Houndmaster', 'Musketeer', 'Arbalest']);
    const b = compClassKey(['Arbalest', 'Musketeer', 'Houndmaster', 'Leper']);
    expect(a).toBe(b);
  });

  it('ignores the region, which is only a label', () => {
    const ruins = { location: 'The Ruins', heroes: [{ heroClass: 'Vestal' }, { heroClass: 'Crusader' }] };
    const warrens = { location: 'The Warrens', heroes: [{ heroClass: 'Crusader' }, { heroClass: 'Vestal' }] };
    expect(compClassKey(ruins)).toBe(compClassKey(warrens));
  });

  it('keeps a doubled class doubled', () => {
    // Un multiconjunto, no un conjunto: dos Bufones no son un Bufon.
    expect(compClassKey(['Jester', 'Jester', 'Vestal', 'Crusader']))
      .not.toBe(compClassKey(['Jester', 'Vestal', 'Crusader']));
  });

  it('reads the same comp written with either spelling', () => {
    expect(compClassKey(['Man at Arms'])).toBe(compClassKey(['Man-at-Arms']));
  });

  it('skips the empty slots rather than counting them', () => {
    // `The_Old_Road` lleva dos a proposito: es el tutorial del juego.
    const oldRoad = [{ heroClass: 'Crusader' }, { heroClass: 'Highwayman' }, { heroClass: '' }, {}];
    expect(compClassKey(oldRoad)).toBe(compClassKey(['Crusader', 'Highwayman']));
  });

  it('is empty when there is nothing to identify', () => {
    expect(compClassKey([])).toBe('');
    expect(compClassKey(undefined)).toBe('');
    expect(compClassKey({ heroes: [{ heroClass: '' }] })).toBe('');
  });
});

describe('isKnownComp', () => {
  it('recognises a comp from the library however it is written', () => {
    // `Marked_Prey__Royal_Snipe`, del reves y con otra region.
    expect(isKnownComp(['Arbalest', 'Musketeer', 'Houndmaster', 'Leper'])).toBe(true);
  });

  it('does not claim to know a line-up nobody wrote', () => {
    expect(isKnownComp(['Leper', 'Leper', 'Leper', 'Leper'])).toBe(false);
  });

  it('says nothing about an empty party', () => {
    expect(isKnownComp([])).toBe(false);
  });

  it('reads every comp in the bundle', () => {
    expect(knownCompKeys().size).toBeGreaterThan(150);
  });
});
