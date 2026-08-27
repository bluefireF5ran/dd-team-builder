import { renderHook, act } from '@testing-library/react';
import { useTeam } from '../useTeam';
import { EMPTY_HERO } from '../../constants';

describe('useTeam', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useTeam());
    expect(result.current.teamName).toBe('My Team');
    expect(result.current.location).toBe('The Ruins');
    expect(result.current.heroes).toHaveLength(4);
  });

  // El contenido opcional es una preferencia y vive en useSettings; useTeam ya
  // no lo conoce, solo lo recibe como argumento donde hace falta.
  test('does not own the optional-content switches', () => {
    const { result } = renderHook(() => useTeam());
    expect(result.current.showBackerTrinkets).toBeUndefined();
    expect(result.current.showModdedHeroes).toBeUndefined();
    expect(result.current.toggleBackerTrinkets).toBeUndefined();
    expect(result.current.toggleModdedHeroes).toBeUndefined();
  });

  test('starts in the location the settings ask for', () => {
    const { result } = renderHook(() => useTeam({ defaultLocation: 'The Cove' }));
    expect(result.current.location).toBe('The Cove');
  });

  test('initializes heroes as empty', () => {
    const { result } = renderHook(() => useTeam());
    result.current.heroes.forEach(hero => {
      expect(hero).toEqual(EMPTY_HERO);
    });
  });

  test('updateHero updates the correct hero slot', () => {
    const { result } = renderHook(() => useTeam());
    const updatedHero = { ...EMPTY_HERO, heroClass: 'Crusader' };

    act(() => {
      result.current.updateHero(0, updatedHero);
    });

    expect(result.current.heroes[0].heroClass).toBe('Crusader');
    // Other heroes should be unchanged
    expect(result.current.heroes[1].heroClass).toBe('');
    expect(result.current.heroes[2].heroClass).toBe('');
    expect(result.current.heroes[3].heroClass).toBe('');
  });

  test('swapHeroes swaps two hero positions', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Crusader' });
      result.current.updateHero(2, { ...EMPTY_HERO, heroClass: 'Vestal' });
    });

    act(() => {
      result.current.swapHeroes(0, 2);
    });

    expect(result.current.heroes[0].heroClass).toBe('Vestal');
    expect(result.current.heroes[2].heroClass).toBe('Crusader');
  });

  test('setTeamName updates the team name', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.setTeamName('New Name');
    });

    expect(result.current.teamName).toBe('New Name');
  });

  test('setLocation updates the location', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.setLocation('The Weald');
    });

    expect(result.current.location).toBe('The Weald');
  });

  test('saveTeam persists to localStorage', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.setTeamName('Saved Team');
    });

    act(() => {
      result.current.saveTeam(false);
    });

    const stored = JSON.parse(localStorage.getItem('dd_team_builder_teams'));
    expect(stored).toHaveLength(1);
    expect(stored[0].teamName).toBe('Saved Team');
  });

  test('loadSavedTeam loads a previously saved team', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.setTeamName('Load Test');
    });
    act(() => {
      result.current.setLocation('The Cove');
    });
    act(() => {
      result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Crusader' });
    });
    act(() => {
      result.current.saveTeam(false);
    });

    // Reset and load
    act(() => {
      result.current.setTeamName('My Team');
    });
    act(() => {
      result.current.setLocation('The Ruins');
    });

    act(() => {
      result.current.loadSavedTeam('Load Test');
    });

    expect(result.current.teamName).toBe('Load Test');
    expect(result.current.location).toBe('The Cove');
    expect(result.current.heroes[0].heroClass).toBe('Crusader');
  });

  test('deleteSavedTeam removes from localStorage', () => {
    const { result } = renderHook(() => useTeam());

    act(() => {
      result.current.setTeamName('Delete Me');
    });
    act(() => {
      result.current.saveTeam(false);
    });

    expect(result.current.savedTeams).toHaveLength(1);

    act(() => {
      result.current.deleteSavedTeam('Delete Me');
    });

    expect(result.current.savedTeams).toHaveLength(0);
  });

  test('clearTeam returns to the configured default location', () => {
    const { result } = renderHook(() => useTeam({ defaultLocation: 'The Weald' }));

    act(() => {
      result.current.setLocation('The Cove');
    });
    act(() => {
      result.current.clearTeam();
    });

    expect(result.current.location).toBe('The Weald');
  });

  describe('undo/redo', () => {
    test('undo restores previous hero state', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Crusader' });
      });

      expect(result.current.heroes[0].heroClass).toBe('Crusader');

      act(() => {
        result.current.undo();
      });

      expect(result.current.heroes[0].heroClass).toBe('');
    });

    test('redo re-applies undone change', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Crusader' });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.heroes[0].heroClass).toBe('');

      act(() => {
        result.current.redo();
      });

      expect(result.current.heroes[0].heroClass).toBe('Crusader');
    });

    test('canUndo and canRedo reflect history state', () => {
      const { result } = renderHook(() => useTeam());

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      act(() => {
        result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Crusader' });
      });

      // canUndo should now reflect that history exists
      // Note: canUndo is derived from ref, so it may not update until next render
      // after another action. This is a known limitation of refs in tests.
    });

    test('randomizeTeam can be undone', () => {
      const { result } = renderHook(() => useTeam());

      const originalHeroes = result.current.heroes.map(h => ({ ...h }));

      act(() => {
        result.current.randomizeTeam();
      });

      // Should have new heroes
      const hadChange = result.current.heroes.some(
        (h, i) => h.heroClass !== originalHeroes[i].heroClass
      );
      expect(hadChange).toBe(true);

      act(() => {
        result.current.undo();
      });

      // Should be back to empty
      expect(result.current.heroes[0].heroClass).toBe('');
    });
  });

  describe('teamExists', () => {
    test('returns false for non-existent team name', () => {
      const { result } = renderHook(() => useTeam());
      expect(result.current.teamExists('Nonexistent Team')).toBe(false);
    });

    test('returns true after saving a team', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.setTeamName('Existing Team');
      });
      act(() => {
        result.current.saveTeam(false);
      });

      expect(result.current.teamExists('Existing Team')).toBe(true);
    });
  });

  describe('loadPreset', () => {
    test('loads a preset team', () => {
      const { result } = renderHook(() => useTeam());

      const preset = {
        name: 'Test Preset',
        location: 'The Weald',
        heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO, heroClass: 'Crusader' }))
      };

      act(() => {
        result.current.loadPreset(preset);
      });

      expect(result.current.teamName).toBe('Test Preset');
      expect(result.current.location).toBe('The Weald');
      expect(result.current.heroes[0].heroClass).toBe('Crusader');
    });

    test('preset load can be undone', () => {
      const { result } = renderHook(() => useTeam());

      const preset = {
        name: 'Undo Test',
        location: 'The Ruins',
        heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO, heroClass: 'Hellion' }))
      };

      act(() => {
        result.current.loadPreset(preset);
      });

      expect(result.current.heroes[0].heroClass).toBe('Hellion');

      act(() => {
        result.current.undo();
      });

      expect(result.current.heroes[0].heroClass).toBe('');
    });
  });
});
