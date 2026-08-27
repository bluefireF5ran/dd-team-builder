import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Every preference the app remembers between visits, in one place.
 *
 * They used to be scattered: the theme wrote its own `dd_theme` key, and the
 * modded / backer switches lived in `useTeam` where they were reset by every
 * reload because a team is not a preference. What content you play with, and
 * how the app behaves, outlive any one comp.
 *
 * Stored as a single JSON blob merged over the defaults, so a settings key
 * added later reads as its default on a save written before it existed rather
 * than as `undefined`.
 */
const STORAGE_KEY = 'dd_settings';
// The theme predates this hook and shipped with its own key.
const LEGACY_THEME_KEY = 'dd_theme';

export const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'bloodmoon', label: 'Bloodmoon' },
  { id: 'frost', label: 'Frost' }
];

export const DEFAULT_SETTINGS = {
  theme: 'default',

  // Optional content. Each one widens a picker; none of them change a comp
  // already built, so turning one off never destroys anything.
  showModdedHeroes: false,
  showBackerTrinkets: false,
  showDiseases: false,
  showCrimsonCourt: false,

  // Comp library
  compSort: 'name',
  compPageSize: 24,

  // Hero configuration
  autoSortSkills: false,
  defaultLocation: 'The Ruins'
};

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    const merged = { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
    // One-time pickup of the standalone theme key, for anyone who set a theme
    // before settings existed.
    if (!stored || stored.theme === undefined) {
      const legacy = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacy && THEMES.some((t) => t.id === legacy)) merged.theme = legacy;
    }
    return merged;
  } catch {
    // Private browsing, or a blob some other tab corrupted. Defaults still work.
    return { ...DEFAULT_SETTINGS };
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Out of quota or blocked: the session keeps working, it just forgets.
    }
  }, [settings]);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  /** Cycles Default -> Bloodmoon -> Frost, which is what the header button does. */
  const cycleTheme = useCallback(() => {
    setSettings((prev) => {
      const i = THEMES.findIndex((t) => t.id === prev.theme);
      return { ...prev, theme: THEMES[(i + 1) % THEMES.length].id };
    });
  }, []);

  return useMemo(
    () => ({ settings, setSetting, toggleSetting, resetSettings, cycleTheme }),
    [settings, setSetting, toggleSetting, resetSettings, cycleTheme]
  );
};
