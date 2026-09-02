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

  // The rank checks read the game's own launch/target data, so they outrank
  // the class-name heuristics around them.
  describe('rank problems', () => {
    const party = (...specs) =>
      specs.map(([heroClass, activeSkills]) => ({ ...EMPTY_HERO, heroClass, activeSkills }));

    test('a hero who cannot act makes the whole party danger', () => {
      const heroes = party(
        ['Crusader', ['Smite']],
        ['Hellion', ['Wicked Hack']],
        ['Vestal', ['Judgement']],
        ['Leper', ['Hew', 'Chop']]
      );
      const result = analyzeSynergy(heroes);
      expect(result.level).toBe('danger');
      expect(result.notes[0]).toContain('Leper can use none');
    });

    test('speaks up before the party is even half built', () => {
      // One misplaced hero is already wrong; waiting for a fourth to say so
      // would be waiting until it is harder to fix.
      const heroes = [
        { ...EMPTY_HERO },
        { ...EMPTY_HERO },
        { ...EMPTY_HERO },
        { ...EMPTY_HERO, heroClass: 'Leper', activeSkills: ['Hew'] }
      ];
      const result = analyzeSynergy(heroes);
      expect(result.level).toBe('danger');
      expect(result.notes.some((n) => n.includes('rank 4'))).toBe(true);
    });

    test('says nothing when everyone can reach something', () => {
      const heroes = party(
        ['Hellion', ['Wicked Hack', 'Iron Swan']],
        ['Crusader', ['Smite', 'Battle Heal']],
        ['Vestal', ['Dazzling Light', 'Divine Grace']],
        ['Arbalest', ['Sniper Shot', 'Suppressing Fire']]
      );
      expect(analyzeSynergy(heroes).notes.some((n) => n.includes('rank'))).toBe(false);
    });
  });
});
