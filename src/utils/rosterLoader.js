/**
 * Loads the list of hero classes a player has available, from either a plain
 * JSON list or a Darkest Dungeon save file.
 *
 * JSON files are expected to be either:
 *   - an array of hero names: ["Crusader", "Vestal", ...]
 *   - an object with a heroes or roster array: { "heroes": [...] }
 *
 * A `persist.roster.json` is not JSON despite the extension — it is the game's
 * binary format, and `saveParser` reads it structurally. **It used to be
 * scanned for printable strings instead, and that is what put heroes you had
 * buried back on the list**: a save spells `crusader` the same way whether the
 * Crusader is standing in the Hamlet, waiting in the Stage Coach, or named in
 * the campaign log of the run that killed him. Only the roster file's `heroes`
 * map means "yours, alive, right now", and only a real parse can see it.
 *
 * For everything a save knows beyond the class list — who those heroes are,
 * their quirks, skills and trinkets — use `saveParser` directly.
 */

import { isDsonBuffer, parseSaveProfile, SAVE_FILES } from './saveParser';
import { nameKey } from './nameNormalizer';

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });

const readFileAsArrayBuffer = (file) =>
  typeof file.arrayBuffer === 'function'
    ? file.arrayBuffer()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

const buildHeroNameLookup = (heroPool) => {
  const lookup = new Map();
  heroPool.forEach((canonical) => {
    const key = nameKey(canonical);
    if (!key) return;
    lookup.set(key, canonical);
    // Also allow no-space variants like "grave_robber" / "grave robber".
    lookup.set(key.replace(/\s/g, ''), canonical);
  });
  return lookup;
};

const parseJSONRoster = (text) => {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.heroes)) return parsed.heroes;
  if (Array.isArray(parsed.roster)) return parsed.roster;
  throw new Error('JSON must be an array of hero names or an object with a "heroes"/"roster" array.');
};

export const filterValidHeroes = (names, heroPool) => {
  const lookup = buildHeroNameLookup(heroPool);
  const seen = new Set();
  const valid = [];

  names.forEach((name) => {
    const raw = typeof name === 'string' ? name.trim() : '';
    if (!raw) return;
    const key = nameKey(raw);
    const canonical = lookup.get(key) || lookup.get(key.replace(/\s/g, ''));
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical);
      valid.push(canonical);
    }
  });

  return valid;
};

/**
 * The classes on offer, deduplicated. Two Plague Doctors on the roster are one
 * entry here — this feeds a set of class toggles. `parseSaveProfile` is what
 * to call when the individual heroes matter.
 */
export const parseRosterFile = async (file, heroPool = []) => {
  const buffer = await readFileAsArrayBuffer(file);

  if (isDsonBuffer(buffer)) {
    const profile = parseSaveProfile({ [file.name || SAVE_FILES.roster]: buffer });
    return filterValidHeroes(profile.heroClasses, heroPool);
  }

  const text = await readFileAsText(file);
  try {
    return filterValidHeroes(parseJSONRoster(text), heroPool);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `"${file.name}" is neither a hero list nor a Darkest Dungeon save. Pick persist.roster.json from a profile folder.`
      );
    }
    throw error;
  }
};
