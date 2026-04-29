import { loadTeamFromFile, saveTeamToLocalStorage, loadTeamsFromLocalStorage, deleteTeamFromLocalStorage, saveAllTeamsToFile, importTeamsFromFile } from '../storageHelper';

describe('storageHelper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadTeamFromFile', () => {
    test('rejects with error for null file', async () => {
      await expect(loadTeamFromFile(null)).rejects.toThrow('No file provided');
    });

    test('rejects for invalid JSON', async () => {
      const file = new File(['not json'], 'test.json', { type: 'application/json' });
      await expect(loadTeamFromFile(file)).rejects.toThrow('Invalid team file format');
    });

    test('rejects for valid JSON but invalid schema', async () => {
      const data = JSON.stringify({ teamName: 123, heroes: 'wrong' });
      const file = new File([data], 'test.json', { type: 'application/json' });
      await expect(loadTeamFromFile(file)).rejects.toThrow('Invalid team file');
    });

    test('resolves for valid team JSON', async () => {
      const team = {
        teamName: 'Test Team',
        location: 'The Ruins',
        heroes: [
          { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
          { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
          { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
          { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } }
        ]
      };
      const file = new File([JSON.stringify(team)], 'test.json', { type: 'application/json' });
      const result = await loadTeamFromFile(file);
      expect(result.teamName).toBe('Test Team');
    });
  });

  describe('saveTeamToLocalStorage', () => {
    test('saves a new team', () => {
      const result = saveTeamToLocalStorage('Team A', 'The Ruins', []);
      expect(result).toBe(true);
      const teams = loadTeamsFromLocalStorage();
      expect(teams).toHaveLength(1);
      expect(teams[0].teamName).toBe('Team A');
    });

    test('updates existing team with same name', () => {
      saveTeamToLocalStorage('Team A', 'The Ruins', []);
      saveTeamToLocalStorage('Team A', 'The Warrens', []);
      const teams = loadTeamsFromLocalStorage();
      expect(teams).toHaveLength(1);
      expect(teams[0].location).toBe('The Warrens');
    });

    test('saves multiple teams with different names', () => {
      saveTeamToLocalStorage('Team A', 'The Ruins', []);
      saveTeamToLocalStorage('Team B', 'The Weald', []);
      const teams = loadTeamsFromLocalStorage();
      expect(teams).toHaveLength(2);
    });
  });

  describe('loadTeamsFromLocalStorage', () => {
    test('returns empty array when nothing stored', () => {
      expect(loadTeamsFromLocalStorage()).toEqual([]);
    });
  });

  describe('deleteTeamFromLocalStorage', () => {
    test('deletes the specified team', () => {
      saveTeamToLocalStorage('Team A', 'The Ruins', []);
      saveTeamToLocalStorage('Team B', 'The Weald', []);
      deleteTeamFromLocalStorage('Team A');
      const teams = loadTeamsFromLocalStorage();
      expect(teams).toHaveLength(1);
      expect(teams[0].teamName).toBe('Team B');
    });

    test('does nothing for non-existent team', () => {
      saveTeamToLocalStorage('Team A', 'The Ruins', []);
      deleteTeamFromLocalStorage('Team Z');
      const teams = loadTeamsFromLocalStorage();
      expect(teams).toHaveLength(1);
    });
  });

  describe('saveAllTeamsToFile', () => {
    test('returns false when no teams saved', () => {
      expect(saveAllTeamsToFile()).toBe(false);
    });

    test('returns true when teams exist', () => {
      saveTeamToLocalStorage('Team A', 'The Ruins', []);
      // We can't test actual file download in jsdom, but we verify it returns true
      expect(saveAllTeamsToFile()).toBe(true);
    });
  });

  describe('importTeamsFromFile', () => {
    const makeHero = () => ({
      heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '',
      quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }
    });

    test('rejects for null file', async () => {
      await expect(importTeamsFromFile(null)).rejects.toThrow('No file provided');
    });

    test('imports single team from file', async () => {
      const team = { teamName: 'Imported', location: 'The Ruins', heroes: Array(4).fill(null).map(makeHero) };
      const file = new File([JSON.stringify(team)], 'import.json', { type: 'application/json' });
      const result = await importTeamsFromFile(file);
      expect(result.total).toBe(1);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
    });

    test('imports multiple teams from wrapped format', async () => {
      const teams = [
        { teamName: 'Team 1', location: 'The Ruins', heroes: Array(4).fill(null).map(makeHero) },
        { teamName: 'Team 2', location: 'The Weald', heroes: Array(4).fill(null).map(makeHero) }
      ];
      const file = new File([JSON.stringify({ version: 1, teams })], 'backup.json', { type: 'application/json' });
      const result = await importTeamsFromFile(file);
      expect(result.total).toBe(2);
      expect(result.imported).toBe(2);
    });

    test('imports from array format', async () => {
      const teams = [
        { teamName: 'Team A', location: 'The Ruins', heroes: Array(4).fill(null).map(makeHero) }
      ];
      const file = new File([JSON.stringify(teams)], 'backup.json', { type: 'application/json' });
      const result = await importTeamsFromFile(file);
      expect(result.total).toBe(1);
      expect(result.imported).toBe(1);
    });

    test('skips duplicates by name', async () => {
      saveTeamToLocalStorage('Existing', 'The Ruins', []);
      const teams = [
        { teamName: 'Existing', location: 'The Ruins', heroes: Array(4).fill(null).map(makeHero) },
        { teamName: 'New', location: 'The Weald', heroes: Array(4).fill(null).map(makeHero) }
      ];
      const file = new File([JSON.stringify(teams)], 'backup.json', { type: 'application/json' });
      const result = await importTeamsFromFile(file);
      expect(result.total).toBe(2);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
    });

    test('rejects when no valid teams found', async () => {
      const file = new File([JSON.stringify({ foo: 'bar' })], 'bad.json', { type: 'application/json' });
      await expect(importTeamsFromFile(file)).rejects.toThrow('No valid teams found');
    });

    test('rejects invalid JSON', async () => {
      const file = new File(['not json'], 'bad.json', { type: 'application/json' });
      await expect(importTeamsFromFile(file)).rejects.toThrow('Invalid backup file format');
    });
  });
});
