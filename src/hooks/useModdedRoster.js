import { useEffect, useSyncExternalStore } from 'react';
import {
  getModdedGeneralTrinkets,
  getModdedHeroClasses,
  getModdedRosterVersion,
  isModdedRosterLoaded,
  loadModdedRoster,
  subscribeModdedRoster
} from '../data/moddedRoster';

/**
 * Re-renders when the modded roster arrives, and asks for it when `wanted`.
 *
 * Hands back the registry's own objects rather than a version number: they keep
 * one identity until the roster changes, so they work as `useMemo` dependencies
 * that the memo actually reads, which is what the hooks lint rule wants.
 */
export const useModdedRoster = (wanted = false) => {
  const version = useSyncExternalStore(subscribeModdedRoster, getModdedRosterVersion, getModdedRosterVersion);

  useEffect(() => {
    if (!wanted) return;
    // A failed fetch leaves the roster empty and the next `wanted` retries;
    // there is nothing more useful to do with the error here.
    loadModdedRoster().catch(() => {});
  }, [wanted]);

  return {
    version,
    loaded: isModdedRosterLoaded(),
    heroClasses: getModdedHeroClasses(),
    generalTrinkets: getModdedGeneralTrinkets()
  };
};
