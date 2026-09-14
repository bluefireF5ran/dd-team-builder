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

// ============================================================ the game, read once
// The loaders and renderers live in `lib/effectRender.js`, shared with the
// modded importer, so the base game and a workshop mod go through the same
// code. Its defaults - the narrow string reader and no `extended` - reproduce
// what this script always wrote, byte for byte; that is the check.
const R = require('./lib/effectRender');
const { walk, readDarkest, plain, house, norm, num, pct } = R;
const ctx = R.loadGameContext(GAME);
const STR = ctx.strings;
const renderer = R.makeRenderer(ctx);

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

// `num` comes from effectRender: the CSV writes numbers the European way and
// pads a stray space before "%", and so do some game files.
// "Yes"/"No" columns, read rank 1 first so it matches the app's heroes[0] = rank 1.
function ranksFrom(row, keys) {
  const on = [];
  keys.forEach((k, i) => { if (/^yes$/i.test(row[k] || '')) on.push(i + 1); });
  return on;
}
const rankText = (list) => (list.length ? list.join('\u00b7') : null);

/**
 * Filas del CSV que la wiki exporto rotas, corregidas contra el juego.
 *
 * - Shieldbreaker / Serpent Sway: la celda traia un enlace de la wiki donde iba
 *   el efecto ("Forward 1,2 https://…/Status_effects#Aegis"). En
 *   `shieldbreaker.info.darkest`, `serpents_sway` es `.move 0 1` con los efectos
 *   "SB Aegis" (`health_damage_blocks 2`: +2 Block, los "Aegis tokens") y
 *   "SB Serpent Speed 5" (`speed_rating_add 4`).
 */
const CSV_CORRECTIONS = {
  Shieldbreaker: {
    'Serpent Sway': { effect: 'Self: Forward 1, +2 Block, +4 SPD (4 rds)' },
  },
};

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
// Fire's Edge is missing from the CSV, so its skills are rendered from the
// install by the shared renderer, at the rank the app shows (level 4 in the
// file, the game's level 5).
function feSkills(hero) {
  const prefix = 'combat_skill_name_' + hero.toLowerCase() + '_';
  return renderer.renderSkills(path.join(GAME, FE_HEROES[hero]), {
    nameFor: (id) => plain(STR.get(prefix + id) || ''),
  });
}

// ============================================================== camp skills
// Camp skills are not in the CSV at all: `renderer.campEntry` renders every one
// from `*.camping_skills.json` and the `camping_skill_*` templates.

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
for (const id of ctx.camps.keys()) {
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
      if (row) {
        const entry = fromCsvRow(row);
        Object.assign(entry, CSV_CORRECTIONS[r.cls]?.[name] || {});
        bucket.set(name, entry);
        stats.csv++;
        continue;
      }
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
      const e = id ? renderer.campEntry(id) : null;
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
// Line endings are git's business (autocrlf), not content.
const sameText = prevText.replace(/\r\n/g, '\n') === text;
const total = [...combat.values()].reduce((a, m) => a + m.size, 0);
console.log(`combat skills ${total} (csv ${stats.csv}, game ${stats.game}) across ${combat.size} classes`);
console.log(`camp skills ${camp.size}`);
if (missing.combat.length) console.log('MISSING combat:', missing.combat.join(' | '));
if (missing.camp.length) console.log('MISSING camp:', missing.camp.join(' | '));

if (CHECK) {
  console.log(sameText ? 'al dia' : 'DESACTUALIZADO - run without --check to rewrite');
  process.exit(sameText ? 0 : 1);
}
fs.writeFileSync(OUT, text, 'utf8');
console.log('wrote ' + path.relative(ROOT, OUT));
