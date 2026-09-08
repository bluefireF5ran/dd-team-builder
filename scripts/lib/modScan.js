/**
 * Read a Steam Workshop hero mod the way the game reads it.
 *
 * A workshop folder is a partial overlay of the game's own tree, so every file
 * this needs has a vanilla counterpart and the same parser handles both:
 *
 *   heroes/<id>/<id>.info.darkest   the kit - combat skills in display order,
 *                                   `skill_selection` (whether the player picks
 *                                   4 of 7 or fights with all of them) and
 *                                   `mode:` lines (stances)
 *   heroes/<id>/<id>.art.darkest    skill id -> icon ordinal ("one".."seven")
 *   raid/camping/*.camping_skills.json   camp skills granted to the class
 *   trinkets/*.entries.trinkets.json     class trinkets (hero_class_requirements)
 *   localization/*.string_table.xml      the display names for all of the above
 *
 * Names come from the string tables and nowhere else: a mod's internal id is
 * not its name (`banishment` is "Banish", `align` is "Alignment"), and guessing
 * one from the other is how a roster ends up with skills the mod never had.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, fn, depth = 12) {
  if (depth < 0 || !fs.existsSync(dir)) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn, depth - 1);
    else fn(p);
  }
}

function readJson(p) {
  const t = fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
  // Mod JSON is hand-written: trailing commas and // comments are common.
  return JSON.parse(t.replace(/^\s*\/\/[^\n\r]*/gm, '').replace(/,(\s*[}\]])/g, '$1'));
}

/**
 * English `<entry id>` pairs from a .string_table.xml, in file order.
 *
 * A table can carry the english block more than once - mods append a new
 * `<language id="english">…</language>` each time content is added rather than
 * editing the first one, and Dr. Livesey's table has fourteen of them. Reading
 * only the first drops everything appended since, which is how nine trinkets
 * whose names are right there in the file came back unnamed.
 */
function englishStrings(file) {
  let xml;
  try { xml = fs.readFileSync(file, 'utf8'); } catch (e) { return []; }
  const out = [];
  const entry = /<entry id="([^"]+)"\s*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/entry>/g;
  let from = 0;
  for (;;) {
    const start = xml.indexOf('<language id="english">', from);
    if (start < 0) break;
    const end = xml.indexOf('</language>', start);
    const block = xml.slice(start, end < 0 ? xml.length : end);
    entry.lastIndex = 0;
    let m;
    while ((m = entry.exec(block))) out.push([m[1], m[2]]);
    if (end < 0) break;
    from = end + 1;
  }
  return out;
}

/**
 * Every <entry> in a table, whatever language block it sits in, in file order.
 *
 * Only for replaying what the old scraper saw. Its XML parse failed often enough
 * that its regex fallback - which ignores language sections entirely - is how the
 * chinese-only mods got into the app in the first place.
 */
function allStrings(file) {
  let xml;
  try { xml = fs.readFileSync(file, 'utf8'); } catch (e) { return []; }
  const out = [];
  const re = /<entry\s+id="([^"]+)"[^>]*>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/entry>/g;
  let m;
  while ((m = re.exec(xml))) out.push([m[1], m[2]]);
  return out;
}

// Lines read `type: .key value .key value`. A value never starts with "." -
// that is how the next key is told apart from a value, since both may contain
// dots and digits.
const VAL = '(?:"[^"]*"|[~@+-]?[A-Za-z0-9_%][A-Za-z0-9_%+.~@-]*)';
function parseDarkest(body) {
  const out = {};
  const re = new RegExp('\\.([A-Za-z_]+)((?:\\s+' + VAL + ')*)', 'g');
  let m;
  while ((m = re.exec(body))) {
    const vals = [...m[2].matchAll(new RegExp('"([^"]*)"|([~@+-]?[A-Za-z0-9_%][A-Za-z0-9_%+.~@-]*)', 'g'))]
      .map((v) => (v[1] !== undefined ? v[1] : v[2]));
    out[m[1]] = vals.length === 0 ? true : (vals.length === 1 ? vals[0] : vals);
  }
  return out;
}

function readDarkestLines(file) {
  try { return fs.readFileSync(file, 'utf8').split(/\r?\n/); } catch (e) { return []; }
}
function readDarkest(file, type) {
  return readDarkestLines(file)
    .filter((l) => l.trim().startsWith(type + ':'))
    .map((l) => parseDarkest(l.slice(l.indexOf(':') + 1)));
}

const ICON_ORDINALS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];

const LANGS = ['english', 'brazilian', 'czech', 'french', 'german', 'italian', 'japanese',
  'koreana', 'koreanb', 'korean', 'polish', 'russian', 'schinese', 'tchinese', 'spanish'];

/**
 * How much a string table is trusted for english. Every localised sibling
 * carries an `<language id="english">` block as its untranslated fallback, and
 * those fall behind the real one - `acolyte_brazilian` sorts before
 * `acolyte_english` alphabetically, so first-wins on a plain walk picks the
 * wrong file and the names come back stale.
 */
function tableRank(file) {
  const base = path.basename(file).toLowerCase();
  if (base.includes('english')) return 0;
  return LANGS.some((l) => l !== 'english' && base.includes(l)) ? 2 : 1;
}

/** Every string table under a mod (or the game), merged best-source-first. */
function loadStrings(root) {
  const files = [];
  walk(root, (p) => { if (p.endsWith('.string_table.xml')) files.push(p); });
  files.sort((a, b) => tableRank(a) - tableRank(b) || a.localeCompare(b));
  const map = new Map();
  for (const p of files) {
    for (const [k, v] of englishStrings(p)) if (!map.has(k)) map.set(k, v);
  }
  return map;
}

/**
 * The heroes a mod folder defines. `<id>.info.darkest` is the marker: a folder
 * under heroes/ without one is art, or an override of somebody else's class.
 */
function findHeroes(modDir) {
  const heroesDir = path.join(modDir, 'heroes');
  if (!fs.existsSync(heroesDir)) return [];
  const out = [];
  let dirs;
  try { dirs = fs.readdirSync(heroesDir, { withFileTypes: true }); } catch (e) { return []; }
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const info = path.join(heroesDir, d.name, d.name + '.info.darkest');
    if (fs.existsSync(info)) out.push({ id: d.name, dir: path.join(heroesDir, d.name), info });
  }
  return out;
}

/** Combat skills in display order, plus the stance/selection facts around them. */
function readKit(hero) {
  const lines = readDarkestLines(hero.info);
  const order = [];
  const byId = new Map();
  for (const l of lines) {
    if (!l.trim().startsWith('combat_skill:')) continue;
    const s = parseDarkest(l.slice(l.indexOf(':') + 1));
    if (!s.id) continue;
    if (!byId.has(s.id)) { byId.set(s.id, []); order.push(s.id); }
    byId.get(s.id).push(s);
  }

  // `.art.darkest` numbers the icons. It normally agrees with info.darkest, but
  // when it does not the icon ordinal is what the player sees on the button.
  const artFile = path.join(hero.dir, hero.id + '.art.darkest');
  const icons = new Map();
  for (const a of readDarkest(artFile, 'combat_skill')) {
    if (a.id && typeof a.icon === 'string') icons.set(a.id, a.icon);
  }
  // The icon is the infix of `<hero>.ability.<icon>.png`, and the base game
  // spells it as a word while most mods use the digit. Both are the position on
  // the skill bar, so both order the kit.
  const iconRank = (id) => {
    const i = icons.get(id);
    if (i === undefined) return Number.MAX_SAFE_INTEGER;
    const word = ICON_ORDINALS.indexOf(String(i));
    if (word >= 0) return word;
    return /^\d+$/.test(String(i)) ? Number(i) : Number.MAX_SAFE_INTEGER;
  };
  const artOrder = order.some((id) => iconRank(id) !== Number.MAX_SAFE_INTEGER)
    ? [...order].sort((a, b) => iconRank(a) - iconRank(b) || order.indexOf(a) - order.indexOf(b))
    : null;

  const sel = readDarkest(hero.info, 'skill_selection')[0] || {};
  // A bare '.id' with no value parses as true, and a multi-word one as an
  // array; neither is a stance name.
  const modes = readDarkest(hero.info, 'mode').map((m) => m.id).filter((v) => typeof v === 'string' && v);
  const gen = readDarkest(hero.info, 'generation')[0] || {};

  // `.can_select_combat_skills false` is the game's own always-active flag: the
  // hero fights with the whole kit instead of four chosen skills.
  const canSelect = sel.can_select_combat_skills;
  const alwaysActive = String(canSelect).toLowerCase() === 'false';
  const maxSkills = Number(sel.number_of_selected_combat_skills_max)
    || Number(gen.number_of_random_combat_skills) || null;

  // A stance skill declares which modes it works in; the mode list itself is
  // what makes the class a stance class.
  const modeSkills = order.filter((id) => (byId.get(id) || []).some((s) => s.valid_modes));

  return { order, artOrder, byId, alwaysActive, canSelectRaw: canSelect, maxSkills, modes, modeSkills };
}

/** Camp skills the mod grants to each of its hero ids, in file order. */
function readCampSkills(modDir) {
  const byHero = new Map();
  walk(path.join(modDir, 'raid'), (p) => {
    if (!p.endsWith('.camping_skills.json')) return;
    let data;
    try { data = readJson(p); } catch (e) { return; }
    for (const s of data.skills || []) {
      for (const cls of s.classes || s.hero_classes || []) {
        if (!byHero.has(cls)) byHero.set(cls, []);
        const list = byHero.get(cls);
        if (!list.includes(s.id)) list.push(s.id);
      }
    }
  });
  return byHero;
}

/** Class trinkets the mod defines, keyed by the hero class that may wear them. */
function readTrinkets(modDir) {
  const byHero = new Map();
  const general = [];
  walk(path.join(modDir, 'trinkets'), (p) => {
    if (!p.endsWith('.entries.trinkets.json')) return;
    let data;
    try { data = readJson(p); } catch (e) { return; }
    for (const t of data.entries || []) {
      if (!t.id) continue;
      const reqs = t.hero_class_requirements || [];
      if (!reqs.length) { if (!general.includes(t.id)) general.push(t.id); continue; }
      for (const cls of reqs) {
        if (!byHero.has(cls)) byHero.set(cls, []);
        const list = byHero.get(cls);
        if (!list.includes(t.id)) list.push(t.id);
      }
    }
  });
  return { byHero, general };
}

// The localization keys the game draws these names from. A mod that ships no
// english block leaves them unresolved, which is a fact worth reporting - far
// better than inventing a name by title-casing the internal id.
//
// Combat skills have two entries and they disagree for 172 of the 5246 skills
// installed here. `combat_skill_name` is the one the player reads in combat and
// it wins: an `upgrade_tree_name` is often a leftover from whatever class the
// mod was cloned from (Alonne's "Elegant Strike" is filed as "Crusader Strike",
// and one is literally the raw id, "Puncture_armor"). The spare earns its place
// on the ~230 skills whose combat name is *dressed*, wrapped in colour tags and
// icon-font ornament with the real name on a second line - there the upgrade
// panel, which has no room for decoration, carries it plain.
const NAME_KEYS = {
  hero: (heroId) => ['hero_class_name_' + heroId],
  skill: (heroId, id) => ['combat_skill_name_' + heroId + '_' + id, 'upgrade_tree_name_' + heroId + '.' + id],
  camp: (heroId, id) => ['camping_skill_name_' + id],
  trinket: (heroId, id) => ['str_inventory_title_trinket' + id],
};

/** A name written with decoration around it, rather than as plain text. */
function isDressed(raw) {
  return !!raw && (/\r|\n/.test(raw) || raw.includes('{colour_start'));
}

const ORNAMENT = '[\u00a4\u00a6\u2022\u25c6\u25c7\u25cf\u25cb\u2666\u2665\u2663\u2660\u203b\u3010\u3011\u2500-\u257f\u2190-\u21ff|~=_*+#<>\\[\\]{}()\\\\/-]';

// Trimming the ends of a name uses a narrower list: a bracket or a slash is as
// likely to be part of the name ("Bulwark (Guard)") as decoration around it.
// Quotation marks are on it - a mod that ships its class as "Deep Sea Lover"
// means the name, not the punctuation - but the apostrophe is not, because a
// possessive plural ends in one ("Rogues'").
const EDGE_ORNAMENT = '[\u00a4\u00a6\u2022\u25c6\u25c7\u25cf\u25cb\u2666\u2665\u2663\u2660\u203b\u3010\u3011\u2500-\u257f\u2190-\u21ff|~=_*+#<>"\u00ab\u00bb\u201c\u201d\u300c\u300d\u300e\u300f-]';

/** Clean up a localized string: colour tags and stray nbsp are markup, not name. */
function plainText(s) {
  return (s || '')
    .replace(/\{colour_start\|[^}]*\}/g, '').replace(/\{colour_end\}/g, '')
    // A non-breaking space, and the latin-1 mojibake of one.
    .replace(/\u00c2\u00a0/g, ' ').replace(/\u00c2/g, '').replace(/\u00a0/g, ' ')
    // Zero-width characters. Mods pad a name with hundreds of them to push the
    // tooltip wider, and they survive every other clean-up because they are not
    // whitespace - Kuuga's "Chouhenshin" carries 700 of them.
    .replace(/[\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/\s+/g, ' ').trim();
}

/**
 * The name out of a string-table entry that may be dressed up.
 *
 * A decorated entry runs to several lines: ornament on one, the name on
 * another. The line that reads as a name is the one still holding letters once
 * the ornament is stripped, so the decoration rows drop out on their own.
 */
function nameText(raw) {
  if (!raw) return null;
  const lines = String(raw).split(/\r?\n/).map(plainText).filter(Boolean);
  const bare = new RegExp(ORNAMENT, 'gu');
  const worded = lines.filter((l) => /[\p{L}\p{N}]/u.test(l.replace(bare, '')));
  const pick = worded.length ? worded[worded.length - 1] : lines[lines.length - 1];
  if (!pick) return null;
  // Ornament also sits inline, either side of the name.
  // Square brackets wrapping the *whole* string are a note the author left in
  // the name field ("[only use for not the ancient ones]"), never part of a
  // name. Only the whole string, so "Bulwark (Guard)" keeps its parenthetical.
  const unwrapped = /^\[[^[\]]*\]$/.test(pick) ? pick.slice(1, -1) : pick;
  return unwrapped
    .replace(new RegExp('^(?:' + EDGE_ORNAMENT + '|\\s)+', 'u'), '')
    .replace(new RegExp('(?:' + EDGE_ORNAMENT + '|\\s)+$', 'u'), '')
    .trim() || null;
}

/** Everything one workshop folder defines, ready to diff against the app. */
function scanMod(modDir, modId, fallbackStrings) {
  const heroes = findHeroes(modDir);
  if (!heroes.length) return null;
  const strings = loadStrings(modDir);
  const camps = readCampSkills(modDir);
  const trinkets = readTrinkets(modDir);

  // Mod strings win; the game's own tables cover the vanilla ids a mod reuses
  // (`encourage`, `first_aid`) without redefining them.
  const raw = (key) => {
    const v = strings.get(key);
    if (v !== undefined) return v;
    const f = fallbackStrings && fallbackStrings.get(key);
    return f === undefined ? null : f;
  };
  // The first key that yields a plain name wins; a dressed one is only taken
  // when no later key has anything, so the decoration is undone rather than
  // preferred over a stale spare.
  const nameOf = (kind, heroId, id) => {
    let dressed = null;
    for (const k of NAME_KEYS[kind](heroId, id)) {
      const v = raw(k);
      if (!v) continue;
      const n = nameText(v);
      if (!n) continue;
      if (!isDressed(v)) return n;
      if (dressed === null) dressed = n;
    }
    return dressed;
  };
  const out = { modId, dir: modDir, strings, generalTrinkets: trinkets.general, heroes: [] };
  for (const h of heroes) {
    const kit = readKit(h);
    const order = kit.artOrder || kit.order;
    out.heroes.push({
      modId,
      id: h.id,
      dir: h.dir,
      name: nameOf('hero', h.id, h.id),
      kit,
      skillIds: order,
      skills: order.map((id) => ({ id, name: nameOf('skill', h.id, id) })),
      campIds: camps.get(h.id) || [],
      camps: (camps.get(h.id) || []).map((id) => ({ id, name: nameOf('camp', h.id, id) })),
      trinketIds: trinkets.byHero.get(h.id) || [],
      trinkets: (trinkets.byHero.get(h.id) || []).map((id) => ({ id, name: nameOf('trinket', h.id, id) })),
    });
  }
  return out;
}

module.exports = {
  walk, readJson, englishStrings, allStrings, parseDarkest, readDarkest, readDarkestLines,
  loadStrings, findHeroes, readKit, readCampSkills, readTrinkets, scanMod,
  ICON_ORDINALS, plainText, nameText, isDressed, NAME_KEYS,
};
