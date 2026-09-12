#!/usr/bin/env node
/**
 * Regenerate `src/data/trinketEffects.js` from the game's own data.
 *
 * The game draws a trinket tooltip from three files, and so does this:
 *   trinkets/*.entries.trinkets.json   which buffs a trinket grants
 *   shared/buffs/*.buffs.json          what each buff actually does
 *   localization/*.string_table.xml    the English `buff_stat_tooltip_*` and
 *                                      `buff_rule_tooltip_*` templates
 * DLC folders are swept too, so Crimson Court, Color of Madness, Shieldbreaker
 * and Fire's Edge (Duelist / Runaway) come along.
 *
 * Butcher's Circus is the one gap: `arena.entries.trinkets.json` ships
 * encrypted, so those trinkets fall back to a wiki CSV export.
 *
 * Usage:
 *   node scripts/importTrinketEffects.js --game "<DarkestDungeon install>" [--csv "<Trinkets.csv>"]
 *   node scripts/importTrinketEffects.js --game ... --check    (report, write nothing)
 *
 * Both paths can also come from DD_GAME_DIR / DD_TRINKET_CSV.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/trinketEffects.js');

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function opt(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}
const CHECK = argv.includes('--check');
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const CSV = opt('--csv') || process.env.DD_TRINKET_CSV;

if (!GAME || !fs.existsSync(path.join(GAME, 'trinkets/base.entries.trinkets.json'))) {
  console.error('Need the Darkest Dungeon install directory.');
  console.error('  node scripts/importTrinketEffects.js --game "D:/.../common/DarkestDungeon"');
  process.exit(1);
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
for (const f of [
  path.join(GAME, 'localization/miscellaneous.string_table.xml'),
  path.join(GAME, 'localization/backertrinkets.string_table.xml'),
]) {
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
const ENTRIES = [];
const encrypted = [];
function loadBuffs(p) {
  try {
    for (const b of readJson(p).buffs || []) if (!BUFFS.has(b.id)) BUFFS.set(b.id, b);
  } catch (e) { encrypted.push(p); }
}
function loadEntries(p) {
  try {
    for (const t of readJson(p).entries || []) ENTRIES.push(t);
  } catch (e) { encrypted.push(p); }
}
loadBuffs(path.join(GAME, 'shared/buffs/base.buffs.json'));
loadBuffs(path.join(GAME, 'shared/buffs/non_exported.buffs.json'));
walk(path.join(GAME, 'dlc'), (p) => { if (p.endsWith('.buffs.json')) loadBuffs(p); });
loadEntries(path.join(GAME, 'trinkets/base.entries.trinkets.json'));
walk(path.join(GAME, 'dlc'), (p) => { if (/entries\.trinkets\.json$/.test(p)) loadEntries(p); });

// ---------------------------------------------------------------- sets
// A set's bonus applies only when both of its trinkets are equipped on the
// same hero. The `*.sets.trinkets.json` files list the buffs; membership is
// the `set_id` on each entry.
const SETS = [];
function loadSets(p) {
  try { for (const s of readJson(p).sets || []) SETS.push(s); } catch (e) { encrypted.push(p); }
}
walk(path.join(GAME, 'trinkets'), (p) => { if (/sets\.trinkets\.json$/.test(p)) loadSets(p); });
walk(path.join(GAME, 'dlc'), (p) => { if (/sets\.trinkets\.json$/.test(p)) loadSets(p); });

// -------------------------------------------------------------- buff -> text
const plain = (s) => (s || '')
  .replace(/\{colour_start\|[^}]*\}/g, '')
  .replace(/\{colour_end\}/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Amounts are 0-1 fractions everywhere except speed, which is a flat rating.
function scaled(buff) {
  const k = buff.stat_sub_type ? buff.stat_type + '_' + buff.stat_sub_type : buff.stat_type;
  return k === 'combat_stat_add_speed_rating' ? Math.round(buff.amount) : Math.round(buff.amount * 100);
}
function fillNumber(tpl, n) {
  const sign = n >= 0 ? '+' : '';
  return tpl
    .replace(/%\+d%%/g, sign + n + '%')
    .replace(/%\+d/g, sign + n)
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

  // The {?token} markers only say which argument fills the next specifier.
  // The stat text is the %s and the rule number the %d — except the `skill`
  // rule, which reads the other way round ("Revelation: -100% Stress").
  const order = rule === 'skill'
    ? [ruleDataText(data.string || ''), statText]
    : [statText, ruleDataText(data.string || '')];
  let i = 0;
  return plain(
    fillNumber(plain(tpl).replace(/\{\?[a-z0-9]+\}/g, ''), num)
      .replace(/%s/g, () => order[Math.min(i++, order.length - 1)])
  );
}
function renderBuff(id) {
  const b = BUFFS.get(id);
  if (!b) return null;
  const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
  const tpl = STR.get('buff_stat_tooltip_' + k);
  if (tpl === undefined) return null;
  return applyRule(b, plain(fillNumber(plain(tpl), scaled(b))));
}
// The game writes CRT; this app (and the wiki) write CRIT.
const house = (s) => s.replace(/\bCRT\b/g, 'CRIT').replace(/\s+/g, ' ').trim();

function renderEntry(entry) {
  const parts = [];
  for (const id of entry.buffs || []) {
    // damage_low and damage_high are one displayed line, as is any other pair
    // of buffs that render identically.
    const t = renderBuff(id);
    if (t === null) continue;
    const h = house(t);
    if (h && !parts.includes(h)) parts.push(h);
  }
  return parts;
}

// -------------------------------------------------------------- name lookup
const nameOf = (id) => STR.get('str_inventory_title_trinket' + id) || null;
const key = (s) => s.toLowerCase().replace(/[\u2019']/g, '').replace(/^the /, '').replace(/[^a-z0-9]+/g, '');

const byKey = new Map();
const byId = new Map();
for (const e of ENTRIES) {
  byId.set(e.id, e);
  const k = key(nameOf(e.id) || e.id);
  if (!byKey.has(k)) byKey.set(k, e);
}
// Two ids share a display name and one game name is a whole paragraph, so the
// roster spelling cannot reach them by name alone.
const BY_ID = {
  'Hope in Hand 2': 'hope_in_hand_2',
  'Papyrus Containing the Spell': 'papyrus_containing_the_spell',
  EdgeComb: 'edgecomb',
  'Edge Comb': 'edge_comb',
};
const lookup = (n) => (BY_ID[n] ? byId.get(BY_ID[n]) : byKey.get(key(n))) || null;

// --------------------------------------------------------------- wiki csv
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let cur = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}
// Some cells carry mojibake from an earlier latin-1 round trip ("vs<A0>Marked").
const clean = (s) => (s || '')
  .replace(/\u00c2\u00a0/g, ' ').replace(/\u00c2/g, '').replace(/\u00a0/g, ' ')
  .replace(/\s+/g, ' ').trim();

const csvByKey = new Map();
if (CSV && fs.existsSync(CSV)) {
  for (const r of parseCSV(fs.readFileSync(CSV, 'utf8')).slice(1)) {
    if (!r[0] || !r[0].trim()) continue;
    const k = key(clean(r[0]));
    if (!csvByKey.has(k)) csvByKey.set(k, { rarity: clean(r[1]), effects: clean(r[3]), set: clean(r[4]) });
  }
}
function fromCsv(name) {
  const row = csvByKey.get(key(name));
  if (!row) return null;
  const parts = [];
  for (const chunk of [row.effects, row.set]) {
    for (const p of (chunk || '').split('|')) {
      const t = house(clean(p));
      if (t && !parts.includes(t)) parts.push(t);
    }
  }
  return parts.length ? { parts, rarity: row.rarity } : null;
}

// ------------------------------------------------------------------- roster
function rosterNames(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const out = [];
  for (const line of src.split(/\r?\n/)) {
    const m = line.replace(/\/\/.*$/, '').match(/^\s*(['"])(.+?)\1\s*,?\s*$/);
    if (m) out.push(m[2].replace(/\\(['"])/g, '$1'));
  }
  return out;
}
const generic = rosterNames('src/data/trinkets.js');
const backer = rosterNames('src/data/backer_trinkets.js');

// hero trinkets keep their per-class sections
const heroGroups = [];
{
  const src = fs.readFileSync(path.join(ROOT, 'src/data/hero_specific_trinkets.js'), 'utf8');
  let cur = null;
  for (const line of src.split(/\r?\n/)) {
    const ex = line.match(/^export const ([A-Z0-9_]+)_TRINKETS = \[/);
    if (ex) { cur = { name: ex[1], list: [] }; heroGroups.push(cur); continue; }
    if (!cur) continue;
    if (/^\];/.test(line)) { cur = null; continue; }
    const m = line.replace(/\/\/.*$/, '').match(/^\s*(['"])(.+?)\1\s*,?\s*$/);
    if (m) cur.list.push(m[2].replace(/\\(['"])/g, '$1'));
  }
}

// ------------------------------------------------------- previous entries
const previous = new Map();
if (fs.existsSync(OUT)) {
  const src = fs.readFileSync(OUT, 'utf8');
  for (const m of src.matchAll(
    /^\s*"(.+?)":\s*\{\s*rarity:\s*(null|"[^"]*")\s*,(?:\s*limit:\s*(\d+)\s*,)?\s*effect:\s*"([^"]*)"\s*\}/gm
  )) {
    previous.set(m[1], {
      rarity: m[2] === 'null' ? null : m[2].slice(1, -1),
      limit: m[3] === undefined ? 0 : Number(m[3]),
      effect: m[4]
    });
  }
}

// ------------------------------------------------------------------ rarity
const GAME_RARITY = {
  very_common: 'Very Common', common: 'Common', uncommon: 'Uncommon',
  rare: 'Rare', very_rare: 'Very Rare', ancestral: 'Ancestral',
  ancestral_shambler: 'Shambler', crow: 'Crow', courtier: 'Courtier',
  collector: 'Collector', madman: 'Madman', darkest_dungeon: 'Darkest Dungeon',
  trophy: 'Trophy', kickstarter: 'Kickstarter', comet: 'Crystalline',
  crimson_court: 'Crimson Court', shieldbreaker: 'Shieldbreaker',
  thing: 'Thing', mildred: 'Keepsake', runaway: "Fire's Edge",
};
const CSV_RARITY = { Ringmaster: "Butcher's Circus" };

// Butcher's Circus trinkets the wiki export never listed either, so the
// hand-written text is all there is.
const KEPT = {
  "Wretch's Cloak": '+20% Stress Dealt | +10 ACC | +33% Horror Duration',
  'Glorious Standard': '+33% Healing | +30% Stress Skills | +30% Move Resist | -15% Stress',
  'Last Breath Collar': "+12% Death Blow Resist | +20 DODGE at Death's Door",
  'Pyro Accelerant': 'Attack debuffs + self burn',
  'Charcoal Effigy': 'Self heal when hit + progressive art',
};
// The Sunstone chain transforms rather than dropping at a tier.
const SUNSTONE = {
  'Inert Sunstone': 'Transforms into Heated Sunstone',
  'Heated Sunstone': 'Transforms into Scorching Sunstone',
  'Scorching Sunstone': 'Transforms into Searing Sunstone',
  'Searing Sunstone': 'Final form - perilous to bear',
};

// ---------------------------------------------------------------- assembly
const stats = { game: 0, csv: 0, kept: 0 };
const skipped = [];
const out = new Map();

function build(name) {
  const prev = previous.get(name);
  const entry = lookup(name);
  let parts = entry ? renderEntry(entry) : [];
  let rarity = prev ? prev.rarity : undefined;
  let source = null;

  if (parts.length) { source = 'game'; if (rarity === undefined) rarity = GAME_RARITY[entry.rarity] || entry.rarity; }
  if (!parts.length) {
    const row = fromCsv(name);
    if (row) { parts = row.parts; source = 'csv'; if (rarity === undefined) rarity = CSV_RARITY[row.rarity] || row.rarity; }
  }
  let effect = parts.join(' | ');
  if (!effect && KEPT[name]) { effect = KEPT[name]; source = 'kept'; }
  if (!effect && prev) { effect = prev.effect; source = 'kept'; }
  if (rarity === undefined && entry) rarity = GAME_RARITY[entry.rarity] || entry.rarity;
  if (rarity === undefined) rarity = null;

  if (SUNSTONE[name]) {
    rarity = null;
    effect = [effect, SUNSTONE[name]].filter(Boolean).join(' | ');
  }
  // No source describes it; an entry with blank text would render a stranded
  // "Very Rare - " where name-only is the correct fallback.
  if (!effect) { skipped.push(name); return null; }
  stats[source]++;
  // `limit` es cuantas copias deja tener el juego a la vez: 1 en las unicas,
  // 0 cuando no hay tope. Sale de la entrada aunque el TEXTO venga del CSV o
  // del fichero anterior, porque son cosas distintas y `lookup` ya se hizo.
  const limit = entry && Number.isFinite(entry.limit) ? entry.limit : (prev ? prev.limit || 0 : 0);
  return { rarity, limit, effect };
}

const q = (s) => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const lines = [];
function section(title, list) {
  const rows = [];
  for (const n of list) {
    if (out.has(n)) continue;
    const v = build(n);
    if (v) { out.set(n, v); rows.push(n); }
  }
  if (!rows.length) return;
  const width = Math.max(...rows.map((n) => q(n).length)) + 2;
  lines.push('');
  lines.push('  // ===== ' + title + ' =====');
  for (const n of rows) {
    const v = out.get(n);
    lines.push('  ' + (q(n) + ':').padEnd(width)
      + ' { rarity: ' + (v.rarity === null ? 'null' : q(v.rarity))
      + (v.limit ? ', limit: ' + v.limit : '')
      + ', effect: ' + q(v.effect) + ' },');
  }
}

const TITLE = {
  ABOMINATION: 'Abomination', ANTIQUARIAN: 'Antiquarian', ARBALEST: 'Arbalest',
  BOUNTY_HUNTER: 'Bounty Hunter', CRUSADER: 'Crusader', FLAGELLANT: 'Flagellant',
  GRAVE_ROBBER: 'Grave Robber', HELLION: 'Hellion', HIGHWAYMAN: 'Highwayman',
  HOUNDMASTER: 'Houndmaster', JESTER: 'Jester', LEPER: 'Leper',
  MAN_AT_ARMS: 'Man-at-Arms', MUSKETEER: 'Musketeer', OCCULTIST: 'Occultist',
  PLAGUE_DOCTOR: 'Plague Doctor', SHIELDBREAKER: 'Shieldbreaker', VESTAL: 'Vestal',
  DUELIST: 'Duelist', RUNAWAY: 'Runaway',
};
for (const g of heroGroups) section(TITLE[g.name] || g.name.replace(/_/g, ' '), g.list);
section('Generic trinkets', generic);
section('Backer trinkets', backer);

// --------------------------------------------------------------- set bonuses
const setLabel = (id) =>
  id.startsWith('cc_') ? 'Crimson Court Set'
  : id.startsWith('sb_') ? 'Shieldbreaker Set'
  : /^(rw_|duelist_)/.test(id) ? "Fire's Edge Set"
  : 'Trinket Set';

const setRows = [];
for (const s of SETS) {
  const members = [...new Set(
    ENTRIES.filter((e) => e.set_id === s.id).map((e) => nameOf(e.id)).filter(Boolean)
  )];
  if (members.length < 2) continue;
  const bonus = [];
  for (const id of s.buffs || []) {
    const t = renderBuff(id);
    if (t === null) continue;
    const h = house(t);
    if (h && !bonus.includes(h)) bonus.push(h);
  }
  if (!bonus.length) continue;
  setRows.push({ id: s.id, label: setLabel(s.id), members, bonus: bonus.join(' | ') });
}
setRows.sort((a, b) => a.id.localeCompare(b.id));

const setLines = setRows.map((s) =>
  '  ' + q(s.id) + ': { label: ' + q(s.label)
  + ', members: [' + s.members.map(q).join(', ') + ']'
  + ', bonus: ' + q(s.bonus) + ' },'
).join('\n');

// Butcher's Circus count: live when a CSV was supplied, otherwise recovered
// from the file we are about to rewrite so the header stays stable.
const csvCount = stats.csv
  || [...previous.values()].filter((v) => v.rarity === "Butcher's Circus").length;

const text = `/**
 * Trinket effects - what each trinket actually does.
 *
 * Keyed by exact trinket name, matching the name strings in
 * \`hero_specific_trinkets.js\`, \`trinkets.js\` and \`backer_trinkets.js\`.
 * The roster lives in those files; this one only answers "what does it do?".
 *
 * GENERATED - do not hand-edit. \`scripts/importTrinketEffects.js\` rebuilds it
 * from the game's own tables: which buffs a trinket grants, what each buff
 * does, and the English tooltip templates - the same three sources the game
 * reads to draw a trinket tooltip. Clauses are separated by " | " and kept in
 * the order the game lists them.
 *
 * Butcher's Circus is the exception: its entries file ships encrypted, so those
 * ${csvCount} trinkets come from a wiki CSV export passed with --csv, or are
 * carried over from the previous file when it is omitted.
 *
 * \`TRINKET_SETS\` at the bottom is the Crimson Court / Shieldbreaker / Fire's
 * Edge set bonuses: the extra effect that applies only when both member
 * trinkets are equipped on the same hero.
 *
 * \`rarity\` is the in-game tier or set, or \`null\` for the Runaway's Sunstone
 * chain, which transforms rather than dropping at a tier.
 *
 * \`limit\` is how many copies the game lets you hold at once, straight from
 * \`.entries.trinkets.json\`. **Absent means no limit.** It is 1 for the unique
 * ones -- ancestral, trophy, crystalline, Shrieker, Crimson Court, Thing,
 * Ringmaster, the Collector's heads, the backer trinkets and eleven very rares
 * -- 2 for the Rat Carcass and 3 for the Ancestor's Musket Ball. This is a
 * property of the trinket and not of its tier: eleven \`Very Rare\` entries are
 * unique and twenty-nine are not, so the rarity cannot stand in for it.
 *
 * Coverage is the whole roster - hero-specific, generic and backer - minus a
 * handful the game ships with no buffs at all; those have no entry, so the
 * tooltip falls back to the name. \`trinketEffects.test.js\` pins both
 * directions, so adding a trinket without its effect fails the suite.
 */

export const TRINKET_EFFECTS = {${lines.join('\n')}
};

/**
 * Look up a trinket's effect.
 * @param {string} name - Exact trinket name.
 * @returns {{ rarity: string|null, effect: string }|null} Null when unknown.
 */
export function getTrinketEffect(name) {
  if (!name) return null;
  return TRINKET_EFFECTS[name] || null;
}

/**
 * One-line summary for tooltips: "Rare \\u2014 +10% DMG | +3 SPD | -10% MAX HP".
 * @param {string} name - Exact trinket name.
 * @returns {string} Empty string when the trinket has no known effect.
 */
export function getTrinketEffectText(name) {
  const entry = getTrinketEffect(name);
  if (!entry) return '';
  return entry.rarity ? \`\${entry.rarity} \\u2014 \${entry.effect}\` : entry.effect;
}

/**
 * Cuantas copias de este trinket se pueden llevar a la vez, o \`Infinity\`.
 *
 * Es lo que hace que un equipo no pueda salir con dos Abominations llevando la
 * misma \`Broken Key\`: no hay dos. La regla es del OBJETO y no de su rareza --
 * hay once \`Very Rare\` unicos y veintinueve que no lo son-- asi que se lee del
 * dato y no se deduce de la etiqueta.
 *
 * Un trinket que esta app no conoce no tiene tope, que es la respuesta prudente:
 * inventarse un limite prohibiria equipar algo legal.
 *
 * @param {string} name - Exact trinket name.
 * @returns {number} 1 for the unique ones, \`Infinity\` when there is no cap.
 */
export function getTrinketLimit(name) {
  const entry = getTrinketEffect(name);
  return entry && entry.limit ? entry.limit : Infinity;
}

/**
 * Trinket set bonuses. A set's \`bonus\` applies only when both \`members\` are
 * equipped on the same hero. Keyed by the game's internal set id.
 * @type {Record<string, { label: string, members: string[], bonus: string }>}
 */
export const TRINKET_SETS = {
${setLines}
};

const TRINKET_TO_SET = {};
for (const [id, set] of Object.entries(TRINKET_SETS)) {
  for (const m of set.members) TRINKET_TO_SET[m] = { id, ...set };
}

/**
 * The set a single trinket belongs to, or null. Present regardless of what
 * else is equipped - the caller decides whether the bonus is active.
 * @param {string} name - Exact trinket name.
 */
export function getTrinketSet(name) {
  return (name && TRINKET_TO_SET[name]) || null;
}

/**
 * The set bonus for a pair of trinkets, plus whether it is active (both
 * members equipped). Returns null when neither trinket belongs to a set.
 * @param {string} a - First equipped trinket name.
 * @param {string} b - Second equipped trinket name.
 * @returns {{ id: string, label: string, members: string[], bonus: string, active: boolean }|null}
 */
export function getSetBonus(a, b) {
  const set = getTrinketSet(a) || getTrinketSet(b);
  if (!set) return null;
  const active = set.members.includes(a) && set.members.includes(b) && a !== b;
  return { ...set, active };
}
`;

// -------------------------------------------------------------------- report
const changed = [...out].filter(([n, v]) => previous.has(n) && previous.get(n).effect !== v.effect);
const added = [...out].filter(([n]) => !previous.has(n));
console.log(`game entries ${ENTRIES.length}, buffs ${BUFFS.size}, strings ${STR.size}`);
if (encrypted.length) console.log(`unreadable (encrypted) tables: ${encrypted.map((p) => path.basename(p)).join(', ')}`);
console.log(`entries ${out.size}  (game ${stats.game}, csv ${stats.csv}, kept ${stats.kept})`);
console.log(`sets ${setRows.length} of ${SETS.length}${SETS.length && !setRows.length ? ' (no buff text resolved)' : ''}`);
console.log(`added ${added.length}, text changed ${changed.length}, no data ${skipped.length}${skipped.length ? ': ' + skipped.join(', ') : ''}`);

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  console.log(current === text ? 'al dia' : 'DESACTUALIZADO - run without --check to rewrite');
  process.exit(current === text ? 0 : 1);
}
fs.writeFileSync(OUT, text, 'utf8');
console.log('wrote ' + path.relative(ROOT, OUT));
