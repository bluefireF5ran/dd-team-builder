import { createEmptyHero, resetHeroConfiguration, hasHeroConfiguration, cloneHero, sortToRoster, sortHeroSelections } from '../heroHelper';
import { EMPTY_HERO } from '../../constants';

describe('createEmptyHero', () => {
  test('returns an object matching EMPTY_HERO shape', () => {
    const hero = createEmptyHero();
    expect(hero).toEqual(EMPTY_HERO);
  });

  test('returns a new object each time (not the same reference)', () => {
    const hero1 = createEmptyHero();
    const hero2 = createEmptyHero();
    expect(hero1).toEqual(hero2);
    expect(hero1).not.toBe(hero2);
  });
});

describe('resetHeroConfiguration', () => {
  test('returns empty hero', () => {
    const result = resetHeroConfiguration();
    expect(result).toEqual(EMPTY_HERO);
  });
});

describe('hasHeroConfiguration', () => {
  test('returns false for empty hero', () => {
    expect(hasHeroConfiguration(EMPTY_HERO)).toBe(false);
  });

  test('returns true for hero with active skills', () => {
    const hero = { ...EMPTY_HERO, activeSkills: ['Smite'] };
    expect(hasHeroConfiguration(hero)).toBe(true);
  });

  test('returns true for hero with camp skills', () => {
    const hero = { ...EMPTY_HERO, activeCampSkills: ['Encourage'] };
    expect(hasHeroConfiguration(hero)).toBe(true);
  });

  test('returns true for hero with trinket1', () => {
    const hero = { ...EMPTY_HERO, trinket1: 'Focus Ring' };
    expect(hasHeroConfiguration(hero)).toBeTruthy();
  });

  test('returns true for hero with positive quirks', () => {
    const hero = { ...EMPTY_HERO, quirks: { positive: ['Hard Noggin'], negative: [] } };
    expect(hasHeroConfiguration(hero)).toBe(true);
  });

  test('returns true for hero with negative quirks', () => {
    const hero = { ...EMPTY_HERO, quirks: { positive: [], negative: ['Kleptomaniac'] } };
    expect(hasHeroConfiguration(hero)).toBe(true);
  });
});

describe('cloneHero', () => {
  test('returns an equal but distinct object', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite'] };
    const clone = cloneHero(hero);
    expect(clone).toEqual(hero);
    expect(clone).not.toBe(hero);
  });

  test('deep clones activeSkills array', () => {
    const hero = { ...EMPTY_HERO, activeSkills: ['Smite', 'Stunning Blow'] };
    const clone = cloneHero(hero);
    clone.activeSkills.push('Holy Lance');
    expect(hero.activeSkills).toHaveLength(2);
    expect(clone.activeSkills).toHaveLength(3);
  });

  test('deep clones quirks', () => {
    const hero = { ...EMPTY_HERO, quirks: { positive: ['Hard Noggin'], negative: [] } };
    const clone = cloneHero(hero);
    clone.quirks.positive.push('Iron Skin');
    expect(hero.quirks.positive).toHaveLength(1);
  });

  test('deep clones lockedQuirks', () => {
    const hero = { ...EMPTY_HERO, lockedQuirks: { positive: ['Hard Noggin'], negative: [] } };
    const clone = cloneHero(hero);
    clone.lockedQuirks.positive.push('Iron Skin');
    expect(hero.lockedQuirks.positive).toHaveLength(1);
  });

  test('handles undefined quirks gracefully', () => {
    const hero = { ...EMPTY_HERO, quirks: undefined, lockedQuirks: undefined };
    const clone = cloneHero(hero);
    expect(clone.quirks).toEqual({ positive: [], negative: [] });
    expect(clone.lockedQuirks).toEqual({ positive: [], negative: [] });
  });
});

describe('sortToRoster', () => {
  const roster = ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance', 'Battle Heal'];

  test('puts a selection back into the order the class declares', () => {
    expect(sortToRoster(['Holy Lance', 'Smite', 'Stunning Blow'], roster))
      .toEqual(['Smite', 'Stunning Blow', 'Holy Lance']);
  });

  test('does not mutate the array it was handed', () => {
    const picked = ['Holy Lance', 'Smite'];
    sortToRoster(picked, roster);
    expect(picked).toEqual(['Holy Lance', 'Smite']);
  });

  test('keeps a name the roster has never heard of, at the end', () => {
    // Sorting must never lose a selection: a modded or renamed skill goes last
    // rather than being dropped or floated to the front.
    expect(sortToRoster(['Modded Strike', 'Holy Lance', 'Smite'], roster))
      .toEqual(['Smite', 'Holy Lance', 'Modded Strike']);
  });

  test('keeps unknown names in the order they were picked', () => {
    expect(sortToRoster(['Second Unknown', 'First Unknown'], roster))
      .toEqual(['Second Unknown', 'First Unknown']);
  });

  test('copes with an empty or missing roster', () => {
    expect(sortToRoster(['B', 'A'], [])).toEqual(['B', 'A']);
    expect(sortToRoster(['B', 'A'], undefined)).toEqual(['B', 'A']);
    expect(sortToRoster(undefined, roster)).toEqual([]);
  });

  test('finds a name the roster spells differently', () => {
    // A saved sheet can carry `Snakeskin` where the kit says `Snake Skin`, and
    // sorting by exact text would banish to the end the one skill that IS in
    // the kit.
    expect(sortToRoster(['Snakeskin', 'Encourage'], ['Encourage', 'Snake Skin', 'Sandstorm']))
      .toEqual(['Encourage', 'Snakeskin']);
  });
});

describe('sortHeroSelections', () => {
  test('puts both lists into the order the class declares them', () => {
    const hero = {
      heroClass: 'Crusader',
      activeSkills: ['Holy Lance', 'Smite', 'Bulwark of Faith'],
      activeCampSkills: ['Zealous Speech', 'Encourage']
    };
    const sorted = sortHeroSelections(hero);
    expect(sorted.activeSkills).toEqual(['Smite', 'Bulwark of Faith', 'Holy Lance']);
    expect(sorted.activeCampSkills[0]).toBe('Encourage');
  });

  test('does not mutate the hero it was handed', () => {
    const hero = { heroClass: 'Crusader', activeSkills: ['Holy Lance', 'Smite'], activeCampSkills: [] };
    sortHeroSelections(hero);
    expect(hero.activeSkills).toEqual(['Holy Lance', 'Smite']);
  });

  test('leaves a hero whose class it does not know exactly as it found them', () => {
    const hero = { heroClass: 'Not A Class', activeSkills: ['B', 'A'], activeCampSkills: [] };
    expect(sortHeroSelections(hero)).toBe(hero);
    expect(sortHeroSelections({}).activeSkills).toBeUndefined();
  });
});
