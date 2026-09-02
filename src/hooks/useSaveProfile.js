import { useCallback, useMemo, useState } from 'react';
import { parseSaveFileList, REQUIRED_SAVE_FILE } from '../utils/saveParser';

/**
 * The player's imported Darkest Dungeon save, kept between visits.
 *
 * It lives beside `useSettings` rather than inside it for the same reason the
 * team does not: a save is *data you loaded*, not a preference, and clearing it
 * should not disturb anything else. It is separate from `useTeam` too — the
 * comp you are building changes constantly, the roster it is drawn from does
 * not.
 *
 * Only the parsed result is stored, never the save's bytes: a few kilobytes of
 * names instead of a whole profile folder, and nothing the app cannot read
 * back if the format ever changes under it.
 */
const STORAGE_KEY = 'dd_save_profile_v1';

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // A blob written by an older version could be missing the heroes array;
    // treat anything that is not a usable profile as no profile at all.
    return parsed && Array.isArray(parsed.heroes) ? parsed : null;
  } catch {
    return null;
  }
};

export const useSaveProfile = () => {
  const [profile, setProfile] = useState(read);

  const importFiles = useCallback(async (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length) throw new Error('No files selected.');

    const next = await parseSaveFileList(files);
    if (!next.heroes.length) {
      throw new Error(`No living heroes found in ${REQUIRED_SAVE_FILE}.`);
    }

    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Out of quota or blocked: the import still works for this session.
    }
    return next;
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do; the in-memory profile is already gone.
    }
  }, []);

  return useMemo(() => ({ profile, importFiles, clearProfile }), [profile, importFiles, clearProfile]);
};

export default useSaveProfile;
