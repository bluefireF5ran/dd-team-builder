import {
  toRosterCounts,
  countOf,
  rosterSize,
  expandRoster,
  compClassCounts,
  compFitsRoster,
  missingForComp,
  isHeroAvailable,
  rosterFromHeroes
} from '../rosterAvailability';
import { PARTY_CONFIG } from '../../constants';

const comp = (...classes) => ({ heroes: classes.map((heroClass) => ({ heroClass })) });

const quartet = comp('Jester', 'Jester', 'Jester', 'Jester');
const pair = comp('Plague Doctor', 'Plague Doctor', 'Vestal', 'Crusader');
const singles = comp('Crusader', 'Vestal', 'Hellion', 'Jester');

describe('toRosterCounts', () => {
  it('counts repeats in a list', () => {
    const counts = toRosterCounts(['Jester', 'Jester', 'Crusader']);
    expect(countOf(counts, 'Jester')).toBe(2);
    expect(countOf(counts, 'Crusader')).toBe(1);
    expect(countOf(counts, 'Vestal')).toBe(0);
  });

  it('reads a roster written before counts existed as one of each', () => {
    // The pickers used to store a deduplicated list of names. That is exactly
    // "one of each", so an old saved roster keeps meaning what it meant.
    const counts = toRosterCounts(['Crusader', 'Vestal', 'Hellion']);
    expect(rosterSize(counts)).toBe(3);
    expect(countOf(counts, 'Crusader')).toBe(1);
  });

  it('accepts a count map or object too', () => {
    expect(countOf(toRosterCounts({ Antiquarian: 2 }), 'Antiquarian')).toBe(2);
    expect(countOf(toRosterCounts(new Map([['Antiquarian', 3]])), 'Antiquarian')).toBe(3);
  });

  it('matches on the same key the rest of the app uses', () => {
    const counts = toRosterCounts(['man_at_arms']);
    expect(countOf(counts, 'Man at Arms')).toBe(1);
  });

  it('ignores empty and non-positive entries', () => {
    const counts = toRosterCounts(['', '   ', null, undefined]);
    expect(rosterSize(counts)).toBe(0);
    expect(rosterSize(toRosterCounts({ Jester: 0, Vestal: -2 }))).toBe(0);
  });
});

describe('expandRoster', () => {
  it('puts the repeats back', () => {
    expect(expandRoster({ Jester: 2, Crusader: 1 }).sort()).toEqual(['Crusader', 'Jester', 'Jester']);
  });

  it('caps a class at the party size', () => {
    // Six Jesters cannot matter to four slots, and leaving the tail in would
    // bias a random draw towards whatever class you happen to hoard.
    expect(expandRoster({ Jester: 9 })).toHaveLength(PARTY_CONFIG.MAX_HEROES);
  });
});

describe('compFitsRoster', () => {
  it('refuses a four-of-a-kind comp to someone with one', () => {
    // The bug: a Set said "you have a Jester", and Ballad Quartet needs four.
    expect(compFitsRoster(quartet, toRosterCounts(['Jester', 'Crusader', 'Vestal', 'Hellion']))).toBe(
      false
    );
    expect(compFitsRoster(quartet, toRosterCounts({ Jester: 3 }))).toBe(false);
    expect(compFitsRoster(quartet, toRosterCounts({ Jester: 4 }))).toBe(true);
    expect(compFitsRoster(quartet, toRosterCounts({ Jester: 5 }))).toBe(true);
  });

  it('counts each class separately', () => {
    const counts = toRosterCounts(['Plague Doctor', 'Vestal', 'Crusader']);
    expect(compFitsRoster(pair, counts)).toBe(false);
    expect(compFitsRoster(pair, toRosterCounts(['Plague Doctor', 'Plague Doctor', 'Vestal', 'Crusader']))).toBe(
      true
    );
  });

  it('still accepts an ordinary four-different-classes comp', () => {
    expect(compFitsRoster(singles, toRosterCounts(['Crusader', 'Vestal', 'Hellion', 'Jester']))).toBe(
      true
    );
  });

  it('never fields a comp that is not a full party', () => {
    const counts = toRosterCounts(['Crusader', 'Vestal', 'Hellion', 'Jester']);
    expect(compFitsRoster(comp('Crusader', 'Vestal', 'Hellion'), counts)).toBe(false);
    expect(compFitsRoster({ heroes: [] }, counts)).toBe(false);
    expect(compFitsRoster(null, counts)).toBe(false);
  });
});

describe('missingForComp', () => {
  it('says how short you are, not just that you are short', () => {
    expect(missingForComp(quartet, toRosterCounts({ Jester: 1 }))).toEqual([
      { heroClass: 'Jester', need: 4, have: 1 }
    ]);
    expect(missingForComp(singles, toRosterCounts(['Crusader', 'Vestal', 'Hellion', 'Jester']))).toEqual([]);
  });
});

describe('rosterFromHeroes', () => {
  const heroes = [
    { heroClass: 'Crusader', activity: '', isMissing: false },
    { heroClass: 'Plague Doctor', activity: '', isMissing: false },
    { heroClass: 'Plague Doctor', activity: 'abbey', isMissing: false },
    { heroClass: 'Vestal', activity: '', isMissing: true }
  ];

  it('keeps duplicates, because two of a class is two heroes', () => {
    const counts = toRosterCounts(rosterFromHeroes(heroes, { includeBusy: true }));
    expect(countOf(counts, 'Plague Doctor')).toBe(2);
  });

  it('leaves out heroes who cannot go this week', () => {
    // Locked into a building, or missing after a town event.
    expect(isHeroAvailable(heroes[2])).toBe(false);
    expect(isHeroAvailable(heroes[3])).toBe(false);
    const counts = toRosterCounts(rosterFromHeroes(heroes));
    expect(countOf(counts, 'Plague Doctor')).toBe(1);
    expect(countOf(counts, 'Vestal')).toBe(0);
  });
});

describe('compClassCounts', () => {
  it('reads a comp the same way as a roster', () => {
    expect(countOf(compClassCounts(quartet), 'Jester')).toBe(4);
  });
});
