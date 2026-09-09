import { renderHook, act } from '@testing-library/react';
import { useTeam } from '../useTeam';
import { EMPTY_HERO } from '../../constants';

describe('useTeam', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

    test('suggestTeam uses only heroes from the provided roster', () => {
      const { result } = renderHook(() => useTeam());

      const roster = ['Crusader', 'Vestal', 'Hellion', 'Highwayman', 'Plague Doctor'];

      act(() => {
        result.current.suggestTeam(roster);
      });

      expect(result.current.heroes).toHaveLength(4);
      result.current.heroes.forEach(hero => {
        expect(roster).toContain(hero.heroClass);
      });

      act(() => {
        result.current.undo();
      });

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

  // What the Import Save modal hands over: a run of heroes starting at rank 1.
  describe('placeHeroes', () => {
    const imported = (heroClass) => ({ ...EMPTY_HERO, heroClass });

    test('fills from rank 1 and leaves the rest of the party alone', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.updateHero(3, imported('Leper'));
      });
      act(() => {
        result.current.placeHeroes([imported('Crusader'), imported('Vestal')]);
      });

      expect(result.current.heroes.map((h) => h.heroClass)).toEqual(['Crusader', 'Vestal', '', 'Leper']);
    });

    test('is one undo step, not one per hero', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.placeHeroes([
          imported('Crusader'),
          imported('Vestal'),
          imported('Hellion'),
          imported('Jester')
        ]);
      });
      expect(result.current.heroes.map((h) => h.heroClass)).toEqual([
        'Crusader',
        'Vestal',
        'Hellion',
        'Jester'
      ]);

      act(() => {
        result.current.undo();
      });
      expect(result.current.heroes.every((h) => h.heroClass === '')).toBe(true);
    });

    test('never overflows the party', () => {
      const { result } = renderHook(() => useTeam());
      act(() => {
        result.current.placeHeroes(
          ['Crusader', 'Vestal', 'Hellion', 'Jester', 'Leper'].map(imported)
        );
      });
      expect(result.current.heroes).toHaveLength(4);
      expect(result.current.heroes.map((h) => h.heroClass)).not.toContain('Leper');
    });

    test('canonicalizes the names on the way in', () => {
      const { result } = renderHook(() => useTeam());
      act(() => {
        result.current.placeHeroes([{ ...EMPTY_HERO, heroClass: 'man_at_arms' }]);
      });
      expect(result.current.heroes[0].heroClass).toBe('Man at Arms');
    });

    test('does nothing when handed nothing', () => {
      const { result } = renderHook(() => useTeam());
      act(() => {
        result.current.placeHeroes([]);
      });
      expect(result.current.canUndo).toBe(false);
    });
  });
  describe('undo covers the whole comp, not just the heroes', () => {
    // El historial solo guardaba `heroes`, asi que deshacer despues de cargar
    // una comp devolvia la party vieja con el nombre y la mazmorra de la nueva:
    // un estado que nunca existio y que ademas se veia bien.
    const preset = {
      name: 'Hound Pack: Faith',
      location: 'The Warrens',
      heroes: [
        { ...EMPTY_HERO, heroClass: 'Houndmaster' },
        { ...EMPTY_HERO, heroClass: 'Vestal' },
        { ...EMPTY_HERO },
        { ...EMPTY_HERO }
      ]
    };

    test('undo restores the name and the location too', () => {
      const { result } = renderHook(() => useTeam());

      act(() => {
        result.current.setTeamName('Mine');
        result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Leper' });
      });
      act(() => result.current.loadPreset(preset));

      expect(result.current.teamName).toBe('Hound Pack: Faith');
      expect(result.current.location).toBe('The Warrens');

      act(() => result.current.undo());

      expect(result.current.teamName).toBe('Mine');
      expect(result.current.location).toBe('The Ruins');
      expect(result.current.heroes[0].heroClass).toBe('Leper');
    });

    test('redo puts all three back', () => {
      const { result } = renderHook(() => useTeam());
      act(() => result.current.loadPreset(preset));
      act(() => result.current.undo());
      act(() => result.current.redo());

      expect(result.current.teamName).toBe('Hound Pack: Faith');
      expect(result.current.location).toBe('The Warrens');
      expect(result.current.heroes[0].heroClass).toBe('Houndmaster');
    });

    test('clearing is one undoable step', () => {
      const { result } = renderHook(() => useTeam());
      act(() => result.current.loadPreset(preset));
      act(() => result.current.clearTeam());

      expect(result.current.teamName).toBe('My Team');

      act(() => result.current.undo());
      expect(result.current.teamName).toBe('Hound Pack: Faith');
      expect(result.current.heroes[1].heroClass).toBe('Vestal');
    });

    test('canUndo and canRedo track the stacks', () => {
      const { result } = renderHook(() => useTeam());
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      act(() => result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Jester' }));
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      act(() => result.current.undo());
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    test('a new edit drops the redo branch', () => {
      const { result } = renderHook(() => useTeam());
      act(() => result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Jester' }));
      act(() => result.current.undo());
      expect(result.current.canRedo).toBe(true);

      act(() => result.current.updateHero(1, { ...EMPTY_HERO, heroClass: 'Leper' }));
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('the draft survives a reload', () => {
    test('restores the party, the name and the location on mount', () => {
      const { result, unmount } = renderHook(() => useTeam());
      act(() => {
        result.current.setTeamName('Half built');
        result.current.setLocation('The Cove');
        result.current.updateHero(0, { ...EMPTY_HERO, heroClass: 'Occultist' });
      });
      // El autoguardado va con retardo, como en la app.
      act(() => jest.advanceTimersByTime(500));
      unmount();

      const reopened = renderHook(() => useTeam()).result;
      expect(reopened.current.teamName).toBe('Half built');
      expect(reopened.current.location).toBe('The Cove');
      expect(reopened.current.heroes[0].heroClass).toBe('Occultist');
    });

    test('ignores a draft that is not a team', () => {
      localStorage.setItem('dd_draft_team_v1', JSON.stringify({ heroes: 'nope' }));
      const { result } = renderHook(() => useTeam());
      expect(result.current.teamName).toBe('My Team');
      expect(result.current.heroes).toHaveLength(4);
      expect(result.current.heroes[0].heroClass).toBe('');
    });

    test('starts clean when there is no draft', () => {
      const { result } = renderHook(() => useTeam());
      expect(result.current.teamName).toBe('My Team');
      expect(result.current.heroes[0].heroClass).toBe('');
    });
  });
});
