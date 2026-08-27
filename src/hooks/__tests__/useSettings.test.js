import { renderHook, act } from '@testing-library/react';
import { useSettings, DEFAULT_SETTINGS, THEMES } from '../useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts on the defaults with nothing stored', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('remembers a change across a remount', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.toggleSetting('showDiseases'));
    expect(result.current.settings.showDiseases).toBe(true);

    const { result: reopened } = renderHook(() => useSettings());
    expect(reopened.current.settings.showDiseases).toBe(true);
  });

  it('fills in a key added after the blob was written', () => {
    // Settings saved by an older build must not come back as undefined; that
    // is the whole reason the stored blob is merged over the defaults.
    localStorage.setItem('dd_settings', JSON.stringify({ theme: 'frost' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('frost');
    expect(result.current.settings.compSort).toBe(DEFAULT_SETTINGS.compSort);
    expect(result.current.settings.autoSortSkills).toBe(DEFAULT_SETTINGS.autoSortSkills);
  });

  it('picks up a theme set before settings existed', () => {
    // The theme shipped with its own key, so an existing user has one there.
    localStorage.setItem('dd_theme', 'bloodmoon');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('bloodmoon');
  });

  it('ignores the legacy key once settings carry a theme of their own', () => {
    localStorage.setItem('dd_theme', 'bloodmoon');
    localStorage.setItem('dd_settings', JSON.stringify({ theme: 'frost' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('frost');
  });

  it('falls back to the defaults on a corrupt blob rather than throwing', () => {
    localStorage.setItem('dd_settings', 'not json');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('cycles the theme through every one and back to the start', () => {
    const { result } = renderHook(() => useSettings());
    THEMES.slice(1).forEach((theme) => {
      act(() => result.current.cycleTheme());
      expect(result.current.settings.theme).toBe(theme.id);
    });
    act(() => result.current.cycleTheme());
    expect(result.current.settings.theme).toBe(THEMES[0].id);
  });

  it('sets a value without disturbing the rest', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.setSetting('compSort', 'region'));
    expect(result.current.settings).toEqual({ ...DEFAULT_SETTINGS, compSort: 'region' });
  });

  it('resets everything back to the defaults', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.setSetting('compSort', 'region'));
    act(() => result.current.toggleSetting('showModdedHeroes'));
    act(() => result.current.resetSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });
});
