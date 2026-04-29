import { generateRandomTeam } from '../randomTeam';
import { PARTY_CONFIG, HERO_CONFIG } from '../../constants';

describe('generateRandomTeam', () => {
  test('generates 4 heroes', () => {
    const team = generateRandomTeam(false);
    expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
  });

  test('each hero has a heroClass', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(hero.heroClass).toBeTruthy();
      expect(typeof hero.heroClass).toBe('string');
    });
  });

  test('each hero has activeSkills', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(Array.isArray(hero.activeSkills)).toBe(true);
      expect(hero.activeSkills.length).toBeGreaterThanOrEqual(HERO_CONFIG.MAX_SKILLS);
    });
  });

  test('each hero has activeCampSkills', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(Array.isArray(hero.activeCampSkills)).toBe(true);
      expect(hero.activeCampSkills.length).toBeGreaterThan(0);
    });
  });

  test('each hero has trinkets', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(typeof hero.trinket1).toBe('string');
      expect(typeof hero.trinket2).toBe('string');
    });
  });

  test('each hero has quirks', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(hero.quirks).toBeDefined();
      expect(Array.isArray(hero.quirks.positive)).toBe(true);
      expect(Array.isArray(hero.quirks.negative)).toBe(true);
    });
  });

  test('generates different teams on successive calls', () => {
    const team1 = generateRandomTeam(false);
    const team2 = generateRandomTeam(false);
    // Extremely unlikely to get the same team twice
    const classes1 = team1.map(h => h.heroClass).join(',');
    const classes2 = team2.map(h => h.heroClass).join(',');
    // They might be the same, but skills/trinkets should differ
    const skills1 = team1.map(h => h.activeSkills.join(',')).join(';');
    const skills2 = team2.map(h => h.activeSkills.join(',')).join(';');
    // At least one of these should differ
    const isDifferent = classes1 !== classes2 || skills1 !== skills2;
    expect(isDifferent).toBe(true);
  });
});
