#!/usr/bin/env node
/**
 * Regenerate `src/data/skillEffects.js`.
 *
 * Two sources, split by what each one actually knows:
 *
 *  - Combat skills come from a wiki CSV export (`--csv`), which already carries
 *    readable effect prose ("Blight (140% base) 5 pts/rd for 3 rds") that the
 *    game's own tables only encode structurally. 18 classes, 7 skills each.
 *  - Fire's Edge (Duelist, Runaway) is missing from that CSV, so those 14 come
 *    from the install: `<hero>.info.darkest` for the mechanics joined to
 *    `*.effects.darkest` and `shared/buffs/*.buffs.json` for the effect text.
 *  - Camp skills are not in the CSV at all, so all 80 come from
 *    `*.camping_skills.json` plus the `camping_skill_*` localization templates.
 *
 * Usage:
 *   node scripts/importSkillEffects.js --game "<DarkestDungeon install>" --csv "<Skills.csv>"
 *   node scripts/importSkillEffects.js --game … --csv … --check    (report, write nothing)
 *
 * Both paths can also come from DD_GAME_DIR / DD_SKILL_CSV.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/skillEffects.js');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const CSV = opt('--csv') || process.env.DD_SKILL_CSV;

if (!GAME || !fs.existsSync(path.join(GAME, 'heroes'))) {
  console.error('Need the Darkest Dungeon install directory.');
  console.error('  node scripts/importSkillEffects.js --game "D:/…/common/DarkestDungeon" --csv "…/Skills.csv"');
  process.exit(1);
}

// ============================================================ generic loaders
function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else fn(p);
  }
}
function readJson(p) {
  let t = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(t.replace(/\/\/[^\n\r]*/g, '').replace(/,(\s*[}\]])/g, '$1'));
}
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

const STR = new Map();
for (const f of [path.join(GAME, 'localization/miscellaneous.string_table.xml')]) {
  if (fs.existsSync(f)) for (const [k, v] of englishStrings(f)) if (!STR.has(k)) STR.set(k, v);
}
for (const dir of ['dlc', 'localization']) {
  walk(path.join(GAME, dir), (p) => {
    if (!p.endsWith('.string_table.xml')) return;
    try { for (const [k, v] of englishStrings(p)) if (!STR.has(k)) STR.set(k, v); } catch (e) { /* skip */ }
  });
}

const BUFFS = new Map();
function loadBuffs(p) {
  try { for (const b of readJson(p).buffs || []) if (!BUFFS.has(b.id)) BUFFS.set(b.id, b); } catch (e) { /* encrypted */ }
}
loadBuffs(path.join(GAME, 'shared/buffs/base.buffs.json'));
loadBuffs(path.join(GAME, 'shared/buffs/non_exported.buffs.json'));
walk(path.join(GAME, 'dlc'), (p) => { if (p.endsWith('.buffs.json')) loadBuffs(p); });

// ------------------------------------------------------------- .darkest files
// Lines read "type: .key value .key value". A value never starts with "." —
// that is how the next key is told apart from a value, since both may contain
// dots and digits.
const VAL = '(?:"[^"]*"|[~+-]?[A-Za-z0-9_%][A-Za-z0-9_%+.-]*)';
function parseDarkest(body) {
  const out = {};
  const re = new RegExp('\\.([A-Za-z_]+)((?:\\s+' + VAL + ')*)', 'g');
  let m;
  while ((m = re.exec(body))) {
    const vals = [...m[2].matchAll(new RegExp('"([^"]*)"|([~+-]?[A-Za-z0-9_%][A-Za-z0-9_%+.-]*)', 'g'))]
      .map((v) => (v[1] !== undefined ? v[1] : v[2]));
    out[m[1]] = vals.length === 0 ? true : (vals.length === 1 ? vals[0] : vals);
  }
  return out;
}
function readDarkest(file, type) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .filter((l) => l.trim().startsWith(type + ':'))
    .map((l) => parseDarkest(l.slice(l.indexOf(':') + 1)));
}

const EFFECTS = new Map();
walk(GAME, (p) => {
  if (!/\.effects\.darkest$/.test(p) && !/dd_effects\.darkest$/.test(p)) return;
  for (const e of readDarkest(p, 'effect')) if (e.name && !EFFECTS.has(e.name)) EFFECTS.set(e.name, e);
});

// ============================================================ text helpers
const plain = (s) => (s || '')
  .replace(/\{colour_start\|[^}]*\}/g, '').replace(/\{colour_end\}/g, '')
  // {?decimal1} and friends only mark which argument fills the next specifier.
  .replace(/\{\?[a-z0-9]+\}/gi, '')
  .replace(/\u00c2\u00a0/g, ' ').replace(/\u00c2/g, '').replace(/\u00a0/g, ' ')
  .replace(/\s+/g, ' ').trim();
const house = (s) => s.replace(/\bCRT\b/g, 'CRIT').replace(/\s+/g, ' ').trim();
const norm = (s) => s.toLowerCase().replace(/[\u2019']/g, '').replace(/[^a-z0-9]+/g, '');
const pct = (n) => (n >= 0 ? '+' : '') + n + '%';

// Buff text, shared with the trinket importer's renderer.
// Most amounts are 0-1 fractions; these few are already whole units.
const FLAT_STATS = /^(combat_stat_add_speed_rating|hp_dot_heal|hp_dot_burn|hp_dot_bleed|hp_dot_poison)$|_STRESS_AMOUNT$/;
function scaledBuff(b) {
  const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
  return FLAT_STATS.test(k) ? Math.round(b.amount) : Math.round(b.amount * 100);
}
function fillNumber(tpl, n) {
  const sign = n >= 0 ? '+' : '';
  return tpl.replace(/%\+d%%/g, sign + n + '%').replace(/%\+d/g, sign + n)
    .replace(/%d%%/g, n + '%').replace(/%d/g, String(n));
}
function ruleDataText(s) {
  return plain(STR.get('buff_rule_data_tooltip_' + s) || STR.get('enemy_type_name_' + s) || s.replace(/_/g, ' '));
}
function renderBuff(id) {
  const b = BUFFS.get(id);
  if (!b) return null;
  // A buff that carries its own description says what it does far better than
  // the generic stat template - "Attacks usable in any position" beats the
  // "+0 DODGE" its stat line would otherwise render as. The description still
  // takes the amount, so it goes through the same formatter.
  if (b.description_tooltip_id && STR.has(b.description_tooltip_id)) {
    return house(plain(fillNumber(plain(STR.get(b.description_tooltip_id)), scaledBuff(b))));
  }
  const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
  const tpl = STR.get('buff_stat_tooltip_' + k);
  if (tpl === undefined) return null;
  let text = plain(fillNumber(plain(tpl), scaledBuff(b)));
  const rule = b.rule_type || 'always';
  if (rule !== 'always' || b.is_false_rule) {
    let rt = STR.get('buff_rule_tooltip_' + rule + (b.is_false_rule ? '_false' : ''));
    if (rt === undefined && b.is_false_rule) rt = STR.get('buff_rule_tooltip_' + rule);
    if (rt !== undefined) {
      const d = b.rule_data || {};
      let num = d.float || 0;
      if (/^(target_)?in_rank$/.test(rule)) num += 1;
      else if (/^hp(above|below)$/.test(rule)) num = Math.round(num * 100);
      const order = rule === 'skill' ? [ruleDataText(d.string || ''), text] : [text, ruleDataText(d.string || '')];
      let i = 0;
      text = plain(fillNumber(plain(rt).replace(/\{\?[a-z0-9]+\}/g, ''), num)
        .replace(/%s/g, () => order[Math.min(i++, order.length - 1)]));
    }
  }
  return house(text);
}

// ============================================================ combat: the CSV
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

const csvSkills = [];
if (CSV && fs.existsSync(CSV)) {
  const rows = parseCSV(fs.readFileSync(CSV, 'utf8'));
  const head = rows[0].map(plain);
  for (const r of rows.slice(1)) {
    if (!r[1] || !r[1].trim()) continue;
    const o = {};
    head.forEach((h, i) => { o[h] = plain(r[i]); });
    csvSkills.push(o);
  }
}

// The CSV writes numbers the European way and pads a stray space before "%".
const num = (s) => {
  const t = (s || '').replace(/\s*%\s*$/, '').replace(',', '.').trim();
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};
// "Yes"/"No" columns, read rank 1 first so it matches the app's heroes[0] = rank 1.
function ranksFrom(row, keys) {
  const on = [];
  keys.forEach((k, i) => { if (/^yes$/i.test(row[k] || '')) on.push(i + 1); });
  return on;
}
const rankText = (list) => (list.length ? list.join('\u00b7') : null);

function fromCsvRow(row) {
  const launch = ranksFrom(row, ['From1', 'From2', 'From3', 'From4']);
  const enemy = ranksFrom(row, ['Enemy1', 'Enemy2', 'Enemy3', 'Enemy4']);
  const ally = ranksFrom(row, ['Ally1', 'Ally2', 'Ally3', 'Ally4']);
  const self = /^yes$/i.test(row['Target Self'] || '');

  const dmg = num(row['DMG MOD']);
  const acc = num(row.ACC);
  const crit = num(row['CritMOD%']);

  const effects = [];
  for (const [label, key] of [[null, 'Effect'], ['Self', 'Self Effect']]) {
    const raw = plain(row[key]);
    if (!raw) continue;
    // The CSV separates clauses with commas and marks alternatives with "|||".
    const text = house(raw.replace(/\s*\|\|\|\s*/g, ' / ').replace(/\s*,\s*(?=[^\d])/g, ', '));
    effects.push(label ? `${label}: ${text}` : text);
  }
  const heal = plain(row['Heal Effect']);
  if (heal) effects.push(`Heal ${heal}`);

  return {
    type: plain(row.Range) || null,
    launch: rankText(launch),
    target: self && !enemy.length && !ally.length ? 'Self'
      : [enemy.length ? rankText(enemy) : null, ally.length ? 'ally ' + rankText(ally) : null, self ? 'self' : null]
        .filter(Boolean).join(' / ') || null,
    aoe: /^yes$/i.test(row['Area of Effect'] || ''),
    dmg: dmg === null ? null : pct(dmg),
    acc: acc === null ? null : acc + '%',
    crit: crit === null ? null : pct(crit),
    effect: effects.join(' | ') || null,
  };
}

// =================================================== combat: Fire's Edge, game
const FE_HEROES = {
  Duelist: 'dlc/4964110_fires_edge/features/duelist/heroes/duelist/duelist.info.darkest',
  Runaway: 'dlc/4964110_fires_edge/features/runaway/heroes/runaway/runaway.info.darkest',
};

/**
 * Cuanto se mueve a si mismo el heroe al lanzar la skill, leido de `.move
 * <atras> <alante>` del install.
 *
 * Esto NO estaba y era la unica fuente de movimiento que tenia la app la prosa
 * del `effect`, que lo menciona cuando le apetece: de las 14 skills con `.move`
 * real, 10 lo dicen y 4 no. `Run and Hide` es una de las cuatro, lleva `.move 2
 * 0`, y sin ella `reachableRanks` daba por muerta a una Runaway de rango 1 --
 * justo la apertura que la manda al 3 con el sigilo puesto. Las otras tres son
 * `Disengage`, `The Boot` y `Ransack`.
 *
 * El signo es el de `parseSelfMove`: positivo atras, negativo alante.
 */
const HERO_DIRS = (() => {
  const byDir = new Map();
  const visit = (p) => {
    const m = /([^/\\]+)\.info\.darkest$/.exec(p);
    if (m && /[/\\]heroes[/\\]/.test(p)) byDir.set(m[1], p);
  };
  walk(path.join(GAME, 'heroes'), visit);
  walk(path.join(GAME, 'dlc'), visit);
  return byDir;
})();

const moveCache = {};
function movesFor(cls) {
  if (moveCache[cls]) return moveCache[cls];
  const out = new Map();
  const dir = cls.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const file = HERO_DIRS.get(dir);
  if (file) {
    for (const s of readDarkest(file, 'combat_skill').filter((r) => r.level === '4')) {
      const back = num(Array.isArray(s.move) ? s.move[0] : s.move);
      const fwd = Array.isArray(s.move) ? num(s.move[1]) : 0;
      if (!back && !fwd) continue;
      const name = plain(STR.get('combat_skill_name_' + dir + '_' + s.id) || '');
      if (name) out.set(name, back ? back : -fwd);
    }
  }
  moveCache[cls] = out;
  return out;
}
const TARGET_LABEL = {
  performer: 'Self', performer_group: 'Party', target: null, target_group: 'Enemies',
};
// Effect attributes that carry displayable meaning. Anything else is timing or
// bookkeeping (queue, apply_once, on_hit …) and never reaches the text.
function renderEffect(fx) {
  const bits = [];
  const chance = num(fx.chance);
  const dur = fx.duration ? ` (${fx.duration} rds)` : '';
  const at = chance !== null && chance !== 100 ? ` (${chance}% base)` : '';

  for (const [k, label] of [['dotBurn', 'Burn'], ['dotBleed', 'Bleed'], ['dotPoison', 'Blight'], ['dotStress', 'Stress']]) {
    if (fx[k]) bits.push(`${label} ${fx[k]} pts/rd${at}`);
  }
  if (fx.stun) bits.push(`Stun${at}`);
  if (fx.push) bits.push(`Knockback ${fx.push}${at}`);
  if (fx.pull) bits.push(`Pull ${fx.pull}${at}`);
  if (fx.tag) bits.push('Mark');
  if (fx.riposte) bits.push(`Riposte${dur}`);
  if (fx.unstealth) bits.push('Removes Stealth');
  if (fx.stealth) bits.push(`Stealth${dur}`);
  if (fx.set_mode) bits.push('Change to mode: ' + String(fx.set_mode).replace(/^stance_/, '').replace(/_/g, ' '));
  if (fx.torch_increase) bits.push(`+${fx.torch_increase} Torch`);
  if (fx.torch_decrease) bits.push(`-${fx.torch_decrease} Torch`);
  if (fx.kill_enemy_types) bits.push('Clears ' + String(fx.kill_enemy_types).replace(/_/g, ' ') + 's');
  if (fx.bonus_action_next_turn) bits.push('Bonus action next turn');
  if (fx.heal) bits.push(`Heal ${fx.heal}`);
  if (fx.controlled_burn_amount) bits.push(`Burn ${fx.controlled_burn_amount} pts/rd for ${fx.controlled_burn_duration || '?'} rds`);

  // Stat changes written straight onto the effect rather than via a buff id.
  // ACC, DODGE and SPD are flat ratings even though the file writes them with
  // a "%" sign; CRIT, PROT and DMG are genuine percentages.
  for (const [k, label, isPct] of [
    ['attack_rating_add', 'ACC', false], ['speed_rating_add', 'SPD', false],
    ['defense_rating_add', 'DODGE', false],
    ['crit_chance_add', 'CRIT', true], ['protection_rating_add', 'PROT', true],
    ['damage_low_multiply', 'DMG', true], ['damage_high_multiply', 'DMG', true],
  ]) {
    if (fx[k] === undefined) continue;
    const v = num(fx[k]);
    if (v === null) continue;
    const t = `${v >= 0 ? '+' : ''}${v}${isPct ? '%' : ''} ${label}`;
    if (!bits.includes(t + dur)) bits.push(t + dur);
  }
  for (const id of [].concat(fx.buff_ids || [])) {
    const t = renderBuff(id);
    if (t && !bits.some((b) => b.startsWith(t))) bits.push(t + dur);
  }
  if (!bits.length) return null;

  let text = [...new Set(bits)].join(', ');
  if (fx.keyStatus) text += ' vs ' + ruleDataText(fx.keyStatus);
  if (fx.requires_kill_target) text += ' on kill';
  const who = TARGET_LABEL[fx.target];
  return house(who ? `${who}: ${text}` : text);
}

function feSkills(hero) {
  const file = path.join(GAME, FE_HEROES[hero]);
  const rows = readDarkest(file, 'combat_skill').filter((s) => s.level === '4');
  const out = new Map();
  for (const s of rows) {
    const name = plain(STR.get('combat_skill_name_' + hero.toLowerCase() + '_' + s.id) || '');
    if (!name) continue;
    const launch = String(s.launch === true ? '' : s.launch || '').split('').filter(Boolean).sort();
    // Target syntax: "@" targets allies, "~" makes it an area attack, and the
    // digits are the ranks. "@~1234" is the whole party, "~1234" all enemies.
    const rawTarget = s.target === true ? '' : String(s.target || '');
    const ally = rawTarget.includes('@');
    const aoe = rawTarget.includes('~');
    const target = rawTarget.replace(/[@~]/g, '').split('').filter(Boolean).sort();

    const parts = [];
    for (const n of [].concat(s.effect || [], s.stance_defensive_effects || [], s.stance_aggressive_effects || [])) {
      const fx = EFFECTS.get(n);
      if (!fx) continue;
      const t = renderEffect(fx);
      if (t && !parts.includes(t)) parts.push(t);
    }
    if (s.dmg_per_burn_stack) parts.push(`+${Math.round(num(s.dmg_per_burn_stack) * 100)}% DMG per Burn stack`);
    if (s.copy_burn_behind) parts.push('Copies Burn to the target behind');
    if (s.ignore_protection) parts.unshift('Ignores PROT');
    if (s.ignore_guard) parts.unshift('Ignores Guard');
    if (s.ignore_stealth) parts.unshift('Ignores Stealth');
    if (s.requires_burning) parts.unshift('Requires Burning');
    if (s.per_battle_limit) parts.push(`${s.per_battle_limit} uses per battle`);
    if (s.valid_modes) {
      const modes = [].concat(s.valid_modes).map((m) => m.replace(/^stance_/, ''));
      parts.unshift('Stance: ' + modes.join('/'));
    }

    // A skill with no attack roll is a self/support skill; its 0% DMG and ACC
    // are placeholders in the file, not something to show.
    const attacks = num(s.atk) !== null && num(s.atk) !== 0;
    out.set(name, {
      type: s.type ? s.type[0].toUpperCase() + s.type.slice(1) : null,
      launch: launch.length ? launch.join('\u00b7') : null,
      target: target.length ? (ally ? 'ally ' : '') + target.join('\u00b7') : 'Self',
      aoe,
      dmg: attacks && s.dmg ? pct(num(s.dmg)) : null,
      acc: attacks ? num(s.atk) + '%' : null,
      crit: attacks && s.crit ? pct(num(s.crit)) : null,
      effect: parts.join(' | ') || null,
    });
  }
  return out;
}

// ============================================================== camp skills
const CAMP = new Map();
walk(GAME, (p) => {
  if (!/\.camping_skills\.json$/.test(p)) return;
  let d;
  try { d = readJson(p); } catch (e) { return; }
  for (const s of d.skills || []) {
    const prev = CAMP.get(s.id);
    if (!prev || Number(s.level) >= Number(prev.level)) CAMP.set(s.id, s);
  }
});

const SELECTION = {
  individual: 'One hero', party: 'Party', party_other: 'Other heroes', self: 'Self',
};

// Camp skills that hand out loot name a loot table, not an item. Summarise the
// table by what it can actually drop rather than printing its internal code.
const LOOT = new Map();
walk(GAME, (p) => {
  // The base table is plain "loot/loot.json"; DLC ones are "<name>.loot.json".
  if (!/(^|[.\\/])loot\.json$/.test(p)) return;
  let d;
  try { d = readJson(p); } catch (e) { return; }
  for (const t of d.loot_tables || []) if (!LOOT.has(t.id)) LOOT.set(t.id, t);
});
function lootSummary(id) {
  const t = LOOT.get(id);
  if (!t) return null;
  const kinds = new Set();
  for (const e of t.entries || []) {
    if (!e.chances) continue;
    if (e.type === 'trinket') kinds.add('a trinket');
    else if (e.type === 'jewellery') kinds.add('jewellery');
    else if (e.type === 'heirloom') kinds.add('an heirloom');
    else if (e.type === 'gold' || e.type === 'currency') kinds.add('gold');
    else if (e.type === 'item') {
      const name = plain(STR.get('str_inventory_title_' + (e.data && e.data.type) + (e.data && e.data.id)) || '');
      kinds.add(name || String((e.data && e.data.id) || 'an item').replace(/_/g, ' '));
    }
  }
  return kinds.size ? [...kinds].join(' / ') : null;
}
function renderCampEffect(e) {
  const base = e.type;
  let text = null;

  if (base === 'buff') {
    // The generic "Buff +%d%%" template does not say what is buffed; the
    // sub_type is the buff id, so render that instead.
    text = renderBuff(e.sub_type);
    if (!text) return null;
  } else if (base === 'loot') {
    const what = lootSummary(e.sub_type);
    const tpl = STR.get('camping_skill_effect_item');
    if (!what || !tpl) return null;
    text = plain(tpl).replace(/%s/g, what);
  } else {
    const tpl = STR.get('camping_skill_effect_' + base);
    if (tpl === undefined) return null;
    let amount = Number(e.amount) || 0;
    // Percent templates carry a 0-1 fraction; flat ones carry the number.
    if (/%d%%/.test(tpl)) amount = Math.round(amount * 100);
    else amount = Math.round(amount);
    text = plain(fillNumber(plain(tpl), amount));
  }

  const chance = e.chance && typeof e.chance.amount === 'number' ? e.chance.amount : 1;
  if (chance < 1) {
    const tpl = STR.get('camping_skill_chance_effect_format');
    text = tpl ? plain(tpl).replace(/%d%%/g, Math.round(chance * 100) + '%').replace(/%s/g, text)
      : `${Math.round(chance * 100)}% chance: ${text}`;
  }
  // A requirement is usually a bare string ("religious"), occasionally an
  // object carrying data ("has_quirk").
  for (const r of e.requirements || []) {
    const type = typeof r === 'string' ? r : r.type;
    const rt = STR.get('camping_skill_requirement_' + type + (r && r.is_false ? '_false' : ''));
    if (rt) text += ' (' + plain(rt).replace(/%s/g, String((r && r.data) || '').replace(/_/g, ' ')).trim() + ')';
  }
  const who = SELECTION[e.selection];
  return house(who && who !== 'One hero' ? `${who}: ${text}` : text);
}

function campEntry(id) {
  const s = CAMP.get(id);
  if (!s) return null;
  const parts = [];
  for (const e of s.effects || []) {
    const t = renderCampEffect(e);
    if (t && !parts.includes(t)) parts.push(t);
  }
  if (!parts.length) return null;
  return { cost: Number(s.cost) || null, effect: parts.join(' | ') };
}

// ================================================================= app roster
const heroSrc = fs.readFileSync(path.join(ROOT, 'src/data/heroes.js'), 'utf8');
const roster = [];
{
  let cls = null;
  for (const line of heroSrc.split(/\r?\n/)) {
    const c = line.match(/^\s*'([^']+)':\s*\{/);
    if (c) { cls = c[1]; continue; }
    const sk = line.match(/^\s*(skills|campSkills):\s*\[(.*)\],?\s*$/);
    if (sk && cls) {
      roster.push({
        cls,
        kind: sk[1],
        list: [...sk[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\(.)/g, '$1')),
      });
    }
  }
}

// The CSV spells two classes and two skills differently from the game (and the
// app follows the game): "Man-at-Arms", "Poison Dart", "Sacrifical Stab".
const CLASS_ALIAS = { 'Man at Arms': 'Man-at-Arms' };
const csvByKey = new Map();
for (const s of csvSkills) csvByKey.set(s.Hero + '|' + norm(s.Name), s);
const SKILL_ALIAS = {
  'Grave Robber|Poison Darts': 'Grave Robber|poisondart',
  'Occultist|Sacrificial Stab': 'Occultist|sacrificalstab',
};
function csvFor(cls, name) {
  const hero = CLASS_ALIAS[cls] || cls;
  const alias = SKILL_ALIAS[cls + '|' + name];
  return csvByKey.get(alias ? alias.replace(/^[^|]+/, hero) : hero + '|' + norm(name)) || null;
}

const campByName = new Map();
for (const id of CAMP.keys()) {
  const n = plain(STR.get('camping_skill_name_' + id) || '');
  if (n && !campByName.has(norm(n))) campByName.set(norm(n), id);
}
// The Duelist's sheet calls Wound Care "First Aid"; it is the same game skill.
campByName.set(norm('First Aid'), 'first_aid');

// ================================================================== assembly
const feCache = {};
const combat = new Map();   // class -> Map(name -> entry)
const camp = new Map();     // name -> entry
const stats = { csv: 0, game: 0 };
const missing = { combat: [], camp: [] };

for (const r of roster) {
  if (r.kind === 'skills') {
    const bucket = combat.get(r.cls) || new Map();
    combat.set(r.cls, bucket);
    for (const name of r.list) {
      if (bucket.has(name)) continue;
      const row = csvFor(r.cls, name);
      if (row) { bucket.set(name, fromCsvRow(row)); stats.csv++; continue; }
      if (FE_HEROES[r.cls]) {
        feCache[r.cls] = feCache[r.cls] || feSkills(r.cls);
        const e = feCache[r.cls].get(name);
        if (e) { bucket.set(name, e); stats.game++; continue; }
      }
      missing.combat.push(`${r.cls}: ${name}`);
    }
    // El movimiento sale SIEMPRE del install, venga la skill del CSV o de ahi:
    // el CSV no trae la columna y la prosa no es de fiar.
    const mv = movesFor(r.cls);
    for (const [name, entry] of bucket) {
      const d = mv.get(name);
      if (d) entry.move = d;
    }
  } else {
    for (const name of r.list) {
      if (camp.has(name)) continue;
      const id = campByName.get(norm(name));
      const e = id ? campEntry(id) : null;
      if (e) camp.set(name, e);
      else missing.camp.push(`${r.cls}: ${name}`);
    }
  }
}

// ===================================================================== emit
const q = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const field = (k, v) => (v === null || v === undefined || v === false ? null : `${k}: ${typeof v === 'number' || v === true ? v : q(v)}`);
function objectText(o, keys) {
  return '{ ' + keys.map((k) => field(k, o[k])).filter(Boolean).join(', ') + ' }';
}

const COMBAT_KEYS = ['type', 'launch', 'target', 'aoe', 'move', 'dmg', 'acc', 'crit', 'effect'];
const lines = [];
lines.push('export const COMBAT_SKILL_EFFECTS = {');
for (const [cls, bucket] of combat) {
  if (!bucket.size) continue;
  lines.push(`  ${q(cls)}: {`);
  const w = Math.max(...[...bucket.keys()].map((n) => q(n).length)) + 2;
  for (const [name, e] of bucket) lines.push(`    ${(q(name) + ':').padEnd(w)} ${objectText(e, COMBAT_KEYS)},`);
  lines.push('  },');
}
lines.push('};');
lines.push('');
lines.push('export const CAMP_SKILL_EFFECTS = {');
{
  const w = Math.max(...[...camp.keys()].map((n) => q(n).length)) + 2;
  for (const [name, e] of camp) lines.push(`  ${(q(name) + ':').padEnd(w)} ${objectText(e, ['cost', 'effect'])},`);
}
lines.push('};');

const text = `/**
 * Skill effects - what each combat and camp skill actually does.
 *
 * GENERATED - do not hand-edit. \`scripts/importSkillEffects.js\` rebuilds it.
 *
 * Combat skills come from a wiki CSV export, which already carries readable
 * effect prose the game only encodes structurally. Fire's Edge (Duelist,
 * Runaway) is missing from that CSV, so those 14 are rendered from the install:
 * \`<hero>.info.darkest\` for the mechanics, \`*.effects.darkest\` and the buff
 * tables for the text. Camp skills are not in the CSV at all - all ${camp.size} come
 * from \`*.camping_skills.json\` plus the \`camping_skill_*\` templates.
 *
 * Combat entries are keyed by class then skill name, because a skill name only
 * means something next to its class. Camp entries are keyed by name alone:
 * Encourage is shared by 16 classes and does the same thing for each.
 *
 * \`launch\` is the ranks the hero can use it from and \`target\` the ranks it
 * reaches, both written rank 1 first to match the \`heroes[0] = rank 1\`
 * convention the rest of the app uses. Combat numbers are the level 5 values.
 *
 * \`skillEffects.test.js\` pins this against \`heroes.js\`, so adding a skill
 * without its effect fails the suite rather than showing a bare name on hover.
 */

${lines.join('\n')}

/**
 * Look up a skill, combat first then camp.
 * @param {string} name - Exact skill name.
 * @param {string} [heroClass] - Needed for combat skills; camp skills are global.
 * @returns {object|null} Null when unknown.
 */
export function getSkillEffect(name, heroClass) {
  if (!name) return null;
  const byClass = heroClass && COMBAT_SKILL_EFFECTS[heroClass];
  if (byClass && byClass[name]) return { kind: 'combat', ...byClass[name] };
  if (CAMP_SKILL_EFFECTS[name]) return { kind: 'camp', ...CAMP_SKILL_EFFECTS[name] };
  return null;
}

/**
 * One-line summary for tooltips, e.g.
 * "Melee - from 2\\u00b71 - hits 1\\u00b72 - DMG -50% - ACC 115% - CRIT +7% - Stun (130% base)".
 * @param {string} name - Exact skill name.
 * @param {string} [heroClass] - Needed for combat skills.
 * @returns {string} Empty string when the skill has no known effect.
 */
export function getSkillEffectText(name, heroClass) {
  const e = getSkillEffect(name, heroClass);
  if (!e) return '';
  const bits = [];
  if (e.kind === 'camp') {
    if (e.cost) bits.push(\`\${e.cost} time\`);
  } else {
    if (e.type) bits.push(e.type);
    if (e.launch) bits.push(\`from \${e.launch}\`);
    if (e.target) bits.push(e.target === 'Self' ? 'self' : \`hits \${e.target}\`);
    if (e.aoe) bits.push('AoE');
    if (e.dmg) bits.push(\`DMG \${e.dmg}\`);
    if (e.acc) bits.push(\`ACC \${e.acc}\`);
    if (e.crit) bits.push(\`CRIT \${e.crit}\`);
  }
  if (e.effect) bits.push(e.effect);
  return bits.join(' \\u00b7 ');
}
`;

const prevText = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
const total = [...combat.values()].reduce((a, m) => a + m.size, 0);
console.log(`combat skills ${total} (csv ${stats.csv}, game ${stats.game}) across ${combat.size} classes`);
console.log(`camp skills ${camp.size}`);
if (missing.combat.length) console.log('MISSING combat:', missing.combat.join(' | '));
if (missing.camp.length) console.log('MISSING camp:', missing.camp.join(' | '));

if (CHECK) {
  console.log(prevText === text ? 'al dia' : 'DESACTUALIZADO - run without --check to rewrite');
  process.exit(prevText === text ? 0 : 1);
}
fs.writeFileSync(OUT, text, 'utf8');
console.log('wrote ' + path.relative(ROOT, OUT));
