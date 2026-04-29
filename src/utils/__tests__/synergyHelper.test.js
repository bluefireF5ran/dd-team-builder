import { analyzeSynergy } from '../synergyHelper';
import { EMPTY_HERO } from '../../constants';

describe('analyzeSynergy', () => {
  test('returns good for empty team', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    const result = analyzeSynergy(heroes);
    expect(result.level).toBe('good');
    expect(result.notes).toHaveLength(0);
  });

  test('returns good for single hero', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    const result = analyzeSynergy(heroes);
    expect(result.level).toBe('good');
  });

  test('warns about duplicate classes', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    heroes[1].heroClass = 'Crusader';
    const result = analyzeSynergy(heroes);
    expect(result.level).toBe('warning');
    expect(result.notes.some(n => n.includes('Duplicate'))).toBe(true);
  });

  test('warns about no healer', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Grave Robber';
    heroes[3].heroClass = 'Bounty Hunter';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('healer'))).toBe(true);
  });

  test('warns about multiple healers', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Occultist';
    heroes[2].heroClass = 'Crusader';
    heroes[3].heroClass = 'Hellion';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('Multiple healers'))).toBe(true);
  });

  test('detects mark synergy', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Bounty Hunter';
    heroes[1].heroClass = 'Arbalest';
    heroes[2].heroClass = 'Vestal';
    heroes[3].heroClass = 'Man-at-Arms';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('Mark synergy'))).toBe(true);
  });

  test('warns about no stress healer with full team', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Grave Robber';
    heroes[3].heroClass = 'Plague Doctor';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('stress healer'))).toBe(true);
  });
});
