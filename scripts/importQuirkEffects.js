#!/usr/bin/env node
/**
 * Regenerate `src/data/quirkEffects.js` from the game's own data.
 *
 * Same three sources the game reads to draw a quirk tooltip, and the same ones
 * `importTrinketEffects.js` already walks:
 *   shared/quirk/quirk_library.json    which buffs a quirk grants, and whether
 *                                      it is positive, negative or a disease
 *   shared/buffs/*.buffs.json          what each buff does
 *   localization/*.string_table.xml    the English `str_quirk_name_*`,
 *                                      `str_quirk_description_*` and the
 *                                      `buff_stat_tooltip_*` templates
 * The Crimson Court and Color of Madness libraries are swept too, which is
 * where the four Crimson Curse stages and the prismatic / corvid quirks live.
 *
 * A third of the quirks grant no buff at all - they change what a hero does in
 * town or at a curio (Kleptomaniac, Dipsomania, Faithless). Those carry the
 * game's own flavour description instead, which for them IS the mechanic:
 * "Prone to stealing items."
 *
 * Usage:
 *   node scripts/importQuirkEffects.js --game "<DarkestDungeon install>"
 *   node scripts/importQuirkEffects.js --game ... --check   (report, write nothing)
 *
 * The path can also come from DD_GAME_DIR.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/quirkEffects.js');

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function opt(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}
const CHECK = argv.includes('--check');
const GAME = opt('--game') || process.env.DD_GAME_DIR;

if (!GAME || !fs.existsSync(path.join(GAME, 'shared/quirk/quirk_library.json'))) {
  console.error('Need the Darkest Dungeon install directory.');
  console.error('  node scripts/importQuirkEffects.js --game "D:/.../common/DarkestDungeon"');
  process.exit(1);
}

// The three quirk libraries, and the flavour each one contributes. `alien_*`
// and `corvids_*` share the Color of Madness library but colour differently in
// the UI, so the flavour is decided per id, not per file.
const LIBRARIES = [
  { file: 'shared/quirk/quirk_library.json', dlc: null },
  {
    file: 'dlc/580100_crimson_court/features/crimson_court/shared/quirk/crimson_court.quirk_library.json',
    dlc: 'crimson_court'
  },
  { file: 'dlc/735730_color_of_madness/shared/quirk/com.quirk_library.json', dlc: 'color_of_madness' }
];

function flavourOf(id, dlc) {
  if (dlc === 'crimson_court') return 'crimson';
  if (/^alien_/.test(id)) return 'prismatic';
  if (/^corvids_/.test(id)) return 'corvid';
  return null;
}

// -------------------------------------------------------------- localization
function englishStrings(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const start = xml.indexOf('<language id="english">');
  if (start < 0) return [];
  const end = xml.indexOf('</language>', start);
  const block = xml.slice(start, end < 0 ? xml.length : end);
  const out = [];
  const re = /<entry id="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/entry>/g;
  let m;
  while ((m = re.exec(block))) out.push([m[1], m[2]]);
  return out;
}
function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

const STR = new Map();
// miscellaneous first: it holds the tooltip templates every other table reuses.
{
  const f = path.join(GAME, 'localization/miscellaneous.string_table.xml');
  if (fs.existsSync(f)) for (const [k, v] of englishStrings(f)) if (!STR.has(k)) STR.set(k, v);
}
for (const dir of ['dlc', 'localization']) {
  walk(path.join(GAME, dir), (p) => {
    if (!p.endsWith('.string_table.xml')) return;
    try {
      for (const [k, v] of englishStrings(p)) if (!STR.has(k)) STR.set(k, v);
    } catch (e) { /* unreadable table */ }
  });
}

// --------------------------------------------------------------- game tables
function readJson(p) {
  let t = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  t = t.replace(/\/\/[^\n\r]*/g, '').replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(t);
}
const BUFFS = new Map();
function loadBuffs(p) {
  try {
    for (const b of readJson(p).buffs || []) if (!BUFFS.has(b.id)) BUFFS.set(b.id, b);
  } catch (e) { /* encrypted or malformed */ }
}
loadBuffs(path.join(GAME, 'shared/buffs/base.buffs.json'));
loadBuffs(path.join(GAME, 'shared/buffs/non_exported.buffs.json'));
walk(path.join(GAME, 'dlc'), (p) => { if (p.endsWith('.buffs.json')) loadBuffs(p); });

// -------------------------------------------------------------- buff -> text
const plain = (s) => (s || '')
  .replace(/\{colour_start\|[^}]*\}/g, '')
  .replace(/\{colour_end\}/g, '')
  // {?token} markers only name which argument fills the next specifier.
  .replace(/\{\?[a-z0-9_]+\}/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Amounts are 0-1 fractions everywhere except speed and the stress amounts,
// which are flat ratings.
const FLAT_STATS = /^combat_stat_add_speed_rating$|_STRESS_AMOUNT$/;
function scaled(buff) {
  const k = buff.stat_sub_type ? buff.stat_type + '_' + buff.stat_sub_type : buff.stat_type;
  return FLAT_STATS.test(k) ? Math.round(buff.amount) : Math.round(buff.amount * 100);
}
function fillNumber(tpl, n) {
  const sign = n >= 0 ? '+' : '';
  // `%-d` is the fourth spelling the game uses, and the only one that was
  // missing: it writes the number as a saving, so a -15 amount reads "-15%
  // Armor Upgrade Cost". Without this branch the two Tinker quirks shipped
  // their template raw, as "%-d%% Armor Upgrade Cost".
  const minus = n <= 0 ? '' : '-';
  return tpl
    .replace(/%\+d%%/g, sign + n + '%')
    .replace(/%\+d/g, sign + n)
    .replace(/%-d%%/g, minus + n + '%')
    .replace(/%-d/g, minus + n)
    .replace(/%d%%/g, n + '%')
    .replace(/%d/g, String(n));
}
function ruleDataText(s) {
  return plain(STR.get('buff_rule_data_tooltip_' + s) || STR.get('enemy_type_name_' + s) || s.replace(/_/g, ' '));
}
function applyRule(buff, statText) {
  const rule = buff.rule_type || 'always';
  if (rule === 'always' && !buff.is_false_rule) return statText;
  let tpl = STR.get('buff_rule_tooltip_' + rule + (buff.is_false_rule ? '_false' : ''));
  if (tpl === undefined && buff.is_false_rule) tpl = STR.get('buff_rule_tooltip_' + rule);
  if (tpl === undefined) return null;

  const data = buff.rule_data || {};
  let num = data.float || 0;
  if (/^(target_)?in_rank$/.test(rule)) num += 1;          // stored 0-based
  else if (/^hp(above|below)$/.test(rule)) num = Math.round(num * 100);

  // The stat text is the %s and the rule number the %d - except the `skill`
  // rule, which reads the other way round ("Revelation: -100% Stress").
  const order = rule === 'skill'
    ? [ruleDataText(data.string || ''), statText]
    : [statText, ruleDataText(data.string || '')];
  let i = 0;
  return plain(
    fillNumber(plain(tpl), num).replace(/%s/g, () => order[Math.min(i++, order.length - 1)])
  );
}
function renderBuff(id) {
  const b = BUFFS.get(id);
  if (!b) return null;
  // A buff carrying its own description uses that instead of the stat template
  // it would otherwise render as - the description is the readable half.
  if (b.description_tooltip_id && STR.has(b.description_tooltip_id)) {
    return plain(fillNumber(plain(STR.get(b.description_tooltip_id)), scaled(b)));
  }
  // Most templates are keyed by stat_type + sub_type, but the stress ones drop
  // the sub_type (`stress_on_miss`, not `stress_on_miss_STRESS_AMOUNT`), so a
  // miss falls back to the bare stat before giving up.
  const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
  const tpl = STR.get('buff_stat_tooltip_' + k) ?? STR.get('buff_stat_tooltip_' + b.stat_type);
  if (tpl === undefined) return null;
  return applyRule(b, plain(fillNumber(plain(tpl), scaled(b))));
}
// The game writes CRT; this app (and the wiki) write CRIT.
const house = (s) => s.replace(/\bCRT\b/g, 'CRIT').replace(/\s+/g, ' ').trim();

/** The "40% chance of interacting with Treasure curios" line. */
function curioTagText(q) {
  if (!q.curio_tag) return null;
  const tpl = STR.get('quirk_curio_tag_explicit_format');
  if (!tpl) return null;
  const pct = Math.round((q.curio_tag_chance || 0) * 100);
  const tag = q.curio_tag === 'All' ? 'any' : q.curio_tag;
  return plain(fillNumber(plain(tpl), pct).replace(/%s/, tag));
}

function renderQuirk(q) {
  const parts = [];
  if (q.show_explicit_buff_description !== false) {
    for (const id of q.buffs || []) {
      const t = renderBuff(id);
      if (t === null) continue;
      const h = house(t);
      if (h && !parts.includes(h)) parts.push(h);
    }
  }
  // The town and curio quirks grant nothing; their flavour line IS the rule
  // ("Prone to stealing items."). Where a quirk already rendered real stats the
  // same line is only atmosphere - the Crimson Curse's "M-madness...in my
  // veins!" says nothing a party planner can use - so it is dropped.
  if (q.show_flavor_description && !parts.length) {
    const desc = plain(STR.get('str_quirk_description_' + q.id) || '');
    if (desc) parts.push(desc);
  }
  if (q.show_explicit_curio_tag_description) {
    const tag = curioTagText(q);
    if (tag && !parts.includes(tag)) parts.push(tag);
  }
  return parts;
}

// ------------------------------------------------------------------ collect
const nameOf = (id) => STR.get('str_quirk_name_' + id) || null;

const entries = [];
const seen = new Set();
for (const lib of LIBRARIES) {
  const file = path.join(GAME, lib.file);
  if (!fs.existsSync(file)) continue;
  for (const q of readJson(file).quirks || []) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    const name = nameOf(q.id);
    if (!name) continue;
    entries.push({
      id: q.id,
      name,
      kind: q.is_disease ? 'disease' : q.is_positive ? 'positive' : 'negative',
      classification: q.classification || '',
      flavour: flavourOf(q.id, lib.dlc),
      dlc: lib.dlc,
      parts: renderQuirk(q)
    });
  }
}

// ------------------------------------------------------------------- roster
/** Pull the string literals out of one `export const NAME = [...]` block. */
function rosterNames(file, constName) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lines = src.split(/\r?\n/);
  const out = [];
  let inside = false;
  for (const line of lines) {
    if (!inside) {
      if (line.startsWith(`export const ${constName} = [`)) inside = true;
      else continue;
    }
    for (const m of line.matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)) {
      out.push(m[2].replace(/\\(['"])/g, '$1'));
    }
    if (/\];/.test(line)) break;
  }
  return out;
}

const key = (s) => String(s)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['\u2018\u2019]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const roster = [
  ...rosterNames('src/data/quirks.js', 'POSITIVE_QUIRKS'),
  ...rosterNames('src/data/quirks.js', 'NEGATIVE_QUIRKS')
];
if (fs.existsSync(path.join(ROOT, 'src/data/diseases.js'))) {
  roster.push(
    ...rosterNames('src/data/diseases.js', 'DISEASES'),
    ...rosterNames('src/data/diseases.js', 'CRIMSON_COURT_DISEASES')
  );
}
const rosterByKey = new Map();
for (const n of roster) if (!rosterByKey.has(key(n))) rosterByKey.set(key(n), n);

// The roster's spelling wins: it is what every saved comp on disk already
// says, and `nameKey` in the app matches it apostrophe-insensitively anyway.
for (const e of entries) {
  e.display = rosterByKey.get(key(e.name)) || e.name;
}

// ------------------------------------------------------------------- output
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const byKind = { positive: [], negative: [], disease: [] };
for (const e of entries) byKind[e.kind].push(e);
for (const list of Object.values(byKind)) list.sort((a, b) => a.display.localeCompare(b.display));

const SECTION = {
  positive: 'Positive quirks',
  negative: 'Negative quirks',
  disease: 'Diseases, including the four Crimson Curse stages'
};

let body = '';
for (const kind of ['positive', 'negative', 'disease']) {
  body += `\n  // ----- ${SECTION[kind]} -----\n`;
  for (const e of byKind[kind]) {
    const fields = [
      `kind: "${e.kind}"`,
      `classification: ${e.classification ? `"${e.classification}"` : 'null'}`,
      `flavour: ${e.flavour ? `"${e.flavour}"` : 'null'}`,
      `effect: "${esc(e.parts.join(' | '))}"`
    ];
    body += `  "${esc(e.display)}": { ${fields.join(', ')} },\n`;
  }
}

const file = `// GENERATED by scripts/importQuirkEffects.js - do not hand-edit.
//
// Rendered from the Darkest Dungeon install: the quirk libraries say which
// buffs a quirk grants, shared/buffs says what each buff does, and the English
// string tables supply the templates. Rerun the script to pick up a game patch.
//
// \`kind\` is the game's own is_positive / is_disease split, \`classification\`
// its physical / mental tag (null for the town and curio quirks, which have
// neither), and \`flavour\` marks the sets the UI colours apart: prismatic and
// corvid from Color of Madness, crimson from the Crimson Court.
//
// The roster lives in src/data/quirks.js and src/data/diseases.js - those are
// arrays of names, and plenty of code iterates them as strings. This is the
// separate lookup answering "what does it do?", keyed by exact name.

export const QUIRK_EFFECTS = {${body}};

/** The full record, or null when nothing describes the quirk. */
export const getQuirkEffect = (name) => (name && QUIRK_EFFECTS[name]) || null;

/** Just the effect line, or '' so callers can fall back to the name alone. */
export const getQuirkEffectText = (name) => getQuirkEffect(name)?.effect || '';
`;

// ------------------------------------------------------------------- report
const blank = entries.filter((e) => !e.parts.length);
const missingFromRoster = entries.filter((e) => !rosterByKey.has(key(e.name)));
const rosterOnly = roster.filter((n) => !entries.some((e) => key(e.name) === key(n)));

console.log(
  `quirks ${entries.length} ` +
  `(positive ${byKind.positive.length}, negative ${byKind.negative.length}, disease ${byKind.disease.length})`
);
console.log(
  `  diseases: base ${byKind.disease.filter((e) => !e.dlc).length}, ` +
  `color of madness ${byKind.disease.filter((e) => e.dlc === 'color_of_madness').length}, ` +
  `crimson court ${byKind.disease.filter((e) => e.dlc === 'crimson_court').length}`
);
if (blank.length) console.log(`  no effect text ${blank.length}: ${blank.map((e) => e.display).join(', ')}`);
if (missingFromRoster.length) {
  console.log(`  in the game, not on the app roster ${missingFromRoster.length}:`);
  for (const e of missingFromRoster) console.log(`    ${e.kind.padEnd(8)} ${e.display}${e.dlc ? `  (${e.dlc})` : ''}`);
}
if (rosterOnly.length) {
  console.log(`  on the app roster, not in the game ${rosterOnly.length}: ${rosterOnly.join(', ')}`);
}

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  console.log(current === file ? 'al dia' : 'DESACTUALIZADO - rerun without --check');
  process.exit(current === file ? 0 : 1);
}

fs.writeFileSync(OUT, file);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
