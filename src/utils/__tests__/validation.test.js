import { validateHero, validateTeam, validateTeamSchema } from '../validation';
import { EMPTY_HERO } from '../../constants';

describe('validateHero', () => {
  test('returns hasClass false for empty hero', () => {
    const result = validateHero(EMPTY_HERO);
    expect(result.hasClass).toBe(false);
    expect(result.isComplete).toBe(false);
  });

  test('returns hasClass true when hero has a class', () => {
    const result = validateHero({ ...EMPTY_HERO, heroClass: 'Crusader' });
    expect(result.hasClass).toBe(true);
    expect(result.isComplete).toBe(false);
  });

  test('returns isComplete false with partial skills', () => {
    const result = validateHero({
      ...EMPTY_HERO,
      heroClass: 'Crusader',
      activeSkills: ['Smite']
    });
    expect(result.skillsComplete).toBe(false);
    expect(result.isComplete).toBe(false);
  });

  test('counts trinkets correctly', () => {
    const result = validateHero({
      ...EMPTY_HERO,
      heroClass: 'Crusader',
      trinket1: 'Focus Ring',
      trinket2: ''
    });
    expect(result.trinketCount).toBe(1);
    expect(result.hasTrinket1).toBe(true);
    expect(result.hasTrinket2).toBe(false);
  });

  test('validates modded hero with alwaysActive correctly', () => {
    // Abomination is a vanilla hero with alwaysActive and 7 skills
    const result = validateHero({
      ...EMPTY_HERO,
      heroClass: 'Abomination',
      activeSkills: ['Transform', 'Manacles', 'Beast\'s Bile', 'Absolution', 'Rake', 'Rage', 'Slam']
    });
    expect(result.hasClass).toBe(true);
    expect(result.skillsComplete).toBe(true);
    expect(result.isComplete).toBe(true);
  });

  test('validates modded hero with alwaysActive as incomplete when skills missing', () => {
    const result = validateHero({
      ...EMPTY_HERO,
      heroClass: 'Abomination',
      activeSkills: ['Transform', 'Manacles']
    });
    expect(result.skillsComplete).toBe(false);
    expect(result.isComplete).toBe(false);
  });
});

describe('validateTeam', () => {
  test('returns isComplete false with empty heroes', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    const result = validateTeam(heroes);
    expect(result.isComplete).toBe(false);
    expect(result.filledPositions).toBe(0);
  });

  test('returns filledPositions correctly', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    heroes[1].heroClass = 'Vestal';
    const result = validateTeam(heroes);
    expect(result.filledPositions).toBe(2);
    expect(result.isComplete).toBe(false);
  });

  test('returns totalPositions as 4', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    const result = validateTeam(heroes);
    expect(result.totalPositions).toBe(4);
  });
});

describe('validateTeamSchema', () => {
  test('rejects null input', () => {
    const result = validateTeamSchema(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('rejects non-object input', () => {
    const result = validateTeamSchema('not an object');
    expect(result.valid).toBe(false);
  });

  test('rejects missing heroes array', () => {
    const result = validateTeamSchema({ teamName: 'Test' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('heroes'))).toBe(true);
  });

  test('rejects heroes array with wrong length', () => {
    const result = validateTeamSchema({
      teamName: 'Test',
      heroes: [{ ...EMPTY_HERO }]
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('exactly 4'))).toBe(true);
  });

  test('accepts valid team data', () => {
    const validTeam = {
      teamName: 'My Team',
      location: 'The Ruins',
      heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO }))
    };
    const result = validateTeamSchema(validTeam);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects invalid teamName type', () => {
    const result = validateTeamSchema({
      teamName: 123,
      heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO }))
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('teamName'))).toBe(true);
  });

  test('rejects hero with non-string heroClass', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0] = { ...EMPTY_HERO, heroClass: 42 };
    const result = validateTeamSchema({ heroes });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('heroClass'))).toBe(true);
  });

  test('rejects hero with too many activeSkills', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0] = { ...EMPTY_HERO, activeSkills: ['a', 'b', 'c', 'd', 'e'] };
    const result = validateTeamSchema({ heroes });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds max'))).toBe(true);
  });

  test('accepts team without optional fields', () => {
    const result = validateTeamSchema({
      heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO }))
    });
    expect(result.valid).toBe(true);
  });
});
