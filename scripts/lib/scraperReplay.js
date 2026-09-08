/**
 * Replay the old scraper's skill ordering, to find out which skill each name
 * already in `modded_heroes.js` was written for.
 *
 * The scraper listed a class's skills by walking `localization/*.xml` and taking
 * every `combat_skill_name_<hero>_*` entry in file order, cleaned, duplicates
 * dropped. Replaying that rule reproduces 503 of the 616 verifiable classes
 * byte-for-byte, which is what makes this a mapping rather than a guess - and
 * for the mods that ship no english, it yields the same order the hand-written
 * english in the app was typed against, so each of those names can be moved
 * onto the right skill id instead of being lost to a re-import.
 *
 * Shared by the importer, which uses it to name skills, and the asset exporter,
 * which needs the very same names to file the pictures under.
 */
const fs = require('fs');
const path = require('path');
const scan = require('./modScan');

const OTHER_LANGS = ['brazilian', 'czech', 'french', 'german', 'italian', 'japanese', 'koreana',
  'polish', 'russian', 'schinese', 'spanish', 'tchinese', 'portuguese', 'chinese', 'korean',
  'dutch', 'turkish'];

function replayScraperOrder(modDir, heroId, anyLanguage) {
  const locDir = path.join(modDir, 'localization');
  if (!fs.existsSync(locDir)) return [];
  const out = [];
  const seen = new Set();
  let files;
  try { files = fs.readdirSync(locDir).filter((f) => f.toLowerCase().endsWith('.xml')).sort(); }
  catch (e) { return []; }
  for (const f of files) {
    const stem = f.replace(/\.xml$/i, '').toLowerCase();
    if (!stem.includes('string_table')) continue;
    const force = stem.includes(heroId.toLowerCase());
    if (!force && OTHER_LANGS.some((l) => stem.includes(l))) continue;
    // One entry per id, in first-appearance order, holding the last text seen -
    // the scraper collected into a dict and that is what a dict does.
    const entries = new Map();
    const pairs = anyLanguage
      ? scan.allStrings(path.join(locDir, f))
      : scan.englishStrings(path.join(locDir, f));
    for (const [k, v] of pairs) entries.set(k, v);
    const pat = 'combat_skill_name_' + heroId.toLowerCase() + '_';
    for (const [k, v] of entries) {
      const at = k.toLowerCase().indexOf(pat);
      if (at < 0) continue;
      const id = k.slice(at + pat.length);
      if (id.toLowerCase() === 'move' || !v) continue;
      if (/^https?:\/\//.test(v)) continue;
      const clean = v.replace(/\{colour_start\|[^}]+\}/g, '').replace(/\{colour_end\}/g, '')
        .replace(/¤+/g, '').replace(/\s+/g, ' ').trim();
      if (!clean || seen.has(clean)) continue;
      seen.add(clean);
      out.push(id);
    }
  }
  return out;
}

/**
 * Which skill id each name already in the app was written for.
 *
 * Only when the replay produces exactly as many skills as the app lists: a
 * shorter or longer replay means the positions do not line up, and pairing them
 * anyway would move a name onto the wrong skill - worse than losing it.
 *
 * The english pass runs first. When a mod's english block is empty - the usual
 * shape of the chinese-only ones - the scraper's XML parse failed and its regex
 * fallback read every language block instead, which is where the names now in
 * the app came from, so that pass has to be replayed too.
 */
function pairAppNames(modDir, heroId, appSkills) {
  if (!appSkills || !appSkills.length) return { map: new Map(), paired: false };
  for (const anyLanguage of [false, true]) {
    const ids = replayScraperOrder(modDir, heroId, anyLanguage);
    if (ids.length !== appSkills.length) continue;
    const map = new Map();
    ids.forEach((id, i) => { if (!map.has(id)) map.set(id, appSkills[i]); });
    return { map, paired: true, anyLanguage };
  }
  return { map: new Map(), paired: false };
}

module.exports = { replayScraperOrder, pairAppNames, OTHER_LANGS };
