import { createEmptyHero, resetHeroConfiguration, hasHeroConfiguration, cloneHero } from '../heroHelper';
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
