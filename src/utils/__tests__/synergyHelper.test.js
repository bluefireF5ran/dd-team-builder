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

  test('warns when nothing in the party can heal', () => {
    // Cuatro kits sin una sola curacion. El Crusader NO vale para esta prueba:
    // lleva Battle Heal, y la tabla vieja no lo sabia salvo que estuviera
    // seleccionada.
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Man at Arms';
    heroes[1].heroClass = 'Grave Robber';
    heroes[2].heroClass = 'Highwayman';
    heroes[3].heroClass = 'Bounty Hunter';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('heals HP'))).toBe(true);
  });

  test('a Crusader counts as a healer even before his skills are picked', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    heroes[1].heroClass = 'Grave Robber';
    heroes[2].heroClass = 'Highwayman';
    heroes[3].heroClass = 'Bounty Hunter';
    expect(analyzeSynergy(heroes).notes.some(n => n.includes('heals HP'))).toBe(false);
  });

  test('but not once he has chosen four skills that do not heal', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0] = {
      ...EMPTY_HERO,
      heroClass: 'Crusader',
      activeSkills: ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance']
    };
    heroes[1].heroClass = 'Grave Robber';
    heroes[2].heroClass = 'Highwayman';
    heroes[3].heroClass = 'Bounty Hunter';
    expect(analyzeSynergy(heroes).notes.some(n => n.includes('heals HP'))).toBe(true);
  });

  test('warns when three or more heroes heal', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Occultist';
    heroes[2].heroClass = 'Crusader';
    heroes[3].heroClass = 'Hellion';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('Three or more heroes heal'))).toBe(true);
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

  test('warns about no stress healing with a full team', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Grave Robber';
    heroes[3].heroClass = 'Plague Doctor';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('No stress healing'))).toBe(true);
  });

  test('counts the classes the old hardcoded table never knew', () => {
    // La tabla vieja era ['Jester', 'Crusader', 'Houndmaster', 'Leper'].
    // El Skeet Shot del Musketeer quita estres y no estaba en ninguna lista.
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Grave Robber';
    heroes[3] = { ...EMPTY_HERO, heroClass: 'Musketeer', activeSkills: ['Skeet Shot'] };
    expect(analyzeSynergy(heroes).notes.some(n => n.includes('No stress healing'))).toBe(false);
  });

  test('a camp stress heal answers the same question', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Vestal';
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Grave Robber';
    heroes[3] = { ...EMPTY_HERO, heroClass: 'Plague Doctor', activeCampSkills: ['Encourage'] };
    expect(analyzeSynergy(heroes).notes.some(n => n.includes('No stress healing'))).toBe(false);
  });

  test('says when a mark has nobody to cash it in', () => {
    // Ojo al elegir la party: la tabla vieja solo conocia tres clases que
    // aprovechan la marca, y en realidad son ocho -- el Thrown Dagger de la
    // Grave Robber y el Pistol Shot del Highwayman tambien cuentan.
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0] = { ...EMPTY_HERO, heroClass: 'Occultist', activeSkills: ['Vulnerability Hex'] };
    heroes[1].heroClass = 'Hellion';
    heroes[2].heroClass = 'Leper';
    heroes[3].heroClass = 'Vestal';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('nothing in the party hits harder'))).toBe(true);
  });

  test('finds the mark payoffs the old table did not list', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0] = { ...EMPTY_HERO, heroClass: 'Occultist', activeSkills: ['Vulnerability Hex'] };
    heroes[1] = { ...EMPTY_HERO, heroClass: 'Grave Robber', activeSkills: ['Thrown Dagger'] };
    heroes[2].heroClass = 'Hellion';
    heroes[3].heroClass = 'Vestal';
    const result = analyzeSynergy(heroes);
    expect(result.notes.some(n => n.includes('Mark synergy'))).toBe(true);
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
