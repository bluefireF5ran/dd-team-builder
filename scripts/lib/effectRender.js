/**
 * Turning the game's own data into the sentence a player reads.
 *
 * This is the renderer half of `importSkillEffects.js`, lifted out so a Steam
 * Workshop mod can go through **exactly the same code** as the base game. The
 * two halves of that sentence both matter:
 *
 *   · A mod is an overlay of the game's tree. Its `.info.darkest`, its
 *     `*.effects.darkest` and its `*.buffs.json` are the same formats, read by
 *     the same game, so rendering them a second way would be inventing a second
 *     answer to a question that already has one.
 *   · The alternative was hand-writing the effects, and `moddedEffects.js` is
 *     the evidence for how that ends: one class covered out of 644, because
 *     nobody finishes a list like that by hand.
 *
 * **Duplication here is the specific bug this repo has been bitten by before.**
 * `importModdedHeroes.js` documents the icon mix-up at length: the old scraper
 * resolved names in one place and paired them with icons in another, and the
 * two drifted. Same reason `exportModdedAssets.js` takes `toImageFileName` from
 * `imageHelper.js` rather than reimplementing it. So there is one renderer, and
 * both importers call it.
 *
 * ## The context is the only thing that differs
 *
 * `makeRenderer` takes the three lookups the game itself consults to draw a
 * tooltip - the English string templates, the buff table and the effect table -
 * and returns the renderers bound to them. For the base game that context is
 * the install. For a mod it is **the mod's own files first, the install behind
 * them**, which is how a mod that reuses `encourage` without redefining it
 * still renders: the fallback finds it.
 *
 * Every map here is first-wins, like the loaders it came from, so "load the
 * winner first" is the whole precedence mechanism.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------- small helpers

/**
 * Strip the markup a localized string carries so only the sentence is left.
 *
 * `{?decimal1}` and friends only mark which argument fills the next specifier,
 * so they are markup too. The `Â` pair is the latin-1 mojibake of a
 * non-breaking space, which turns up in tables saved with the wrong encoding.
 */
const plain = (s) => (s || '')
  .replace(/\{colour_start\|[^}]*\}/g, '').replace(/\{colour_end\}/g, '')
  .replace(/\{\?[a-z0-9]+\}/gi, '')
  .replace(/Â /g, ' ').replace(/Â/g, '').replace(/ /g, ' ')
  .replace(/\s+/g, ' ').trim();

/** House style: the game's internal `CRT` is written `CRIT` everywhere here. */
const house = (s) => s.replace(/\bCRT\b/g, 'CRIT').replace(/\s+/g, ' ').trim();

const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '');

/** Numbers are written the European way in places, with a stray space before `%`. */
const num = (s) => {
  const t = (s || '').replace(/\s*%\s*$/, '').replace(',', '.').trim();
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

const pct = (n) => (n >= 0 ? '+' : '') + n + '%';

/**
 * Most buff amounts are 0-1 fractions that render as a percentage; these few
 * are already whole units, and scaling one prints `200%` where the game says
 * `2`. Shared with `importTrinketEffects.js` for the same reason.
 */
const FLAT_STATS = /^(combat_stat_add_speed_rating|hp_dot_heal|hp_dot_burn|hp_dot_bleed|hp_dot_poison)$|_STRESS_AMOUNT$/;

function fillNumber(tpl, n) {
  const sign = n >= 0 ? '+' : '';
  return tpl.replace(/%\+d%%/g, sign + n + '%').replace(/%\+d/g, sign + n)
    .replace(/%d%%/g, n + '%').replace(/%d/g, String(n));
}

// --------------------------------------------------------------- file access

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

function readJson(p) {
  const t = fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
  // Mod JSON is hand-written: trailing commas and // comments are common.
  return JSON.parse(t.replace(/\/\/[^\n\r]*/g, '').replace(/,(\s*[}\]])/g, '$1'));
}

/**
 * English `<entry>` pairs from a string table.
 *
 * Note this reads only the FIRST `<language id="english">` block, which is what
 * the base game ships and what `importSkillEffects.js` has always done.
 * `modScan.loadStrings` is the one that handles a mod appending fourteen of
 * them - so a mod context should be built from `modScan`, not from here.
 */
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

/**
 * Every English `<entry>`, including those carrying attributes besides `id`.
 *
 * The narrow form above requires `id="..."` to be followed immediately by `>`,
 * and that hides 749 strings in the base game: the arena tables write
 * `arena_priority="1"` on 10,920 entries, and among the casualties was the one
 * stat template the Rescuer's Rucksack needs. `importTrinketEffects.js` reads
 * them; `importSkillEffects.js` does not, and its output is byte-identical
 * either way, which is why both forms live here.
 *
 * The third element flags an arena string. It is a FALLBACK, never a winner:
 * `arena_priority` marks the Butcher's Circus phrasing of a string that often
 * also exists for the campaign, and letting it win rewrote `+50% Blight
 * duration when applied` as the terser `+50% Blight duration`.
 */
function englishStringsWide(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const start = xml.indexOf('<language id="english">');
  if (start < 0) return [];
  const end = xml.indexOf('</language>', start);
  const block = xml.slice(start, end < 0 ? xml.length : end);
  const out = [];
  const re = /<entry id="([^"]+)"([^>]*)>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/entry>/g;
  let m;
  while ((m = re.exec(block))) out.push([m[1], m[3], /\barena_priority\s*=/.test(m[2])]);
  return out;
}

// Lines read `type: .key value .key value`. A value never starts with "." -
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

// ------------------------------------------------------------------- context

const emptyContext = () => ({
  strings: new Map(), buffs: new Map(), effects: new Map(), camps: new Map(), loot: new Map(),
});

/**
 * Campaign strings first, arena strings only onto keys nothing else filled.
 * Needs both passes over the same file list, so it takes the list rather than
 * one file at a time.
 */
const addStringsWideAll = (ctx, files) => {
  for (const arenaPass of [false, true]) {
    for (const file of files) {
      let rows;
      try { rows = englishStringsWide(file); } catch (e) { continue; }
      for (const [k, v, isArena] of rows) {
        if (isArena !== arenaPass) continue;
        if (!ctx.strings.has(k)) ctx.strings.set(k, v);
      }
    }
  }
};

const addStrings = (ctx, file) => {
  try { for (const [k, v] of englishStrings(file)) if (!ctx.strings.has(k)) ctx.strings.set(k, v); } catch (e) { /* skip */ }
};
// An encrypted table (Butcher's Circus) simply throws; there is nothing to read
// and nothing to report.
const addBuffs = (ctx, file) => {
  try { for (const b of readJson(file).buffs || []) if (!ctx.buffs.has(b.id)) ctx.buffs.set(b.id, b); } catch (e) { /* skip */ }
};
const addEffects = (ctx, file) => {
  for (const e of readDarkest(file, 'effect')) if (e.name && !ctx.effects.has(e.name)) ctx.effects.set(e.name, e);
};
const addCamps = (ctx, file) => {
  let d;
  try { d = readJson(file); } catch (e) { return; }
  // Highest level wins: a camp skill is described at the rank it is used at.
  for (const s of d.skills || []) {
    const prev = ctx.camps.get(s.id);
    if (!prev || Number(s.level) >= Number(prev.level)) ctx.camps.set(s.id, s);
  }
};
const addLoot = (ctx, file) => {
  let d;
  try { d = readJson(file); } catch (e) { return; }
  for (const t of d.loot_tables || []) if (!ctx.loot.has(t.id)) ctx.loot.set(t.id, t);
};

/**
 * The install's own context.
 *
 * **The load order here is not incidental and must not be "tidied" into one
 * walk.** It reproduces `importSkillEffects.js` exactly, because that script's
 * committed output is the thing this refactor may not change:
 *
 *   · `miscellaneous.string_table.xml` is read FIRST. It holds the generic stat
 *     and rule templates, and every map here is first-wins, so a DLC table that
 *     repeats one of those keys must not get in ahead of it.
 *   · Strings then come from `dlc/` and `localization/` ONLY. Widening that to
 *     the whole install would pull in tables nothing consulted before and let
 *     them answer keys they never used to.
 *   · Buffs come from the two `shared/buffs` tables and then `dlc/`.
 *   · Effects, camp skills and loot tables really are swept from the whole tree.
 */
function loadGameContext(gameDir, { wideStrings = false } = {}) {
  const ctx = emptyContext();
  if (!gameDir || !fs.existsSync(gameDir)) return ctx;

  if (wideStrings) {
    // miscellaneous first (the shared templates), then backertrinkets, then
    // the rest: within a pass the file order decides ties.
    const tables = [];
    for (const f of ['localization/miscellaneous.string_table.xml',
      'localization/backertrinkets.string_table.xml']) {
      const full = path.join(gameDir, f);
      if (fs.existsSync(full)) tables.push(full);
    }
    for (const dir of ['dlc', 'localization']) {
      walk(path.join(gameDir, dir), (p) => { if (p.endsWith('.string_table.xml')) tables.push(p); });
    }
    addStringsWideAll(ctx, tables);
  } else {
    // The narrow reader, with backertrinkets left out of the list, is exactly
    // what `importSkillEffects.js` does - so the default reproduces it.
    const misc = path.join(gameDir, 'localization/miscellaneous.string_table.xml');
    if (fs.existsSync(misc)) addStrings(ctx, misc);
    for (const dir of ['dlc', 'localization']) {
      walk(path.join(gameDir, dir), (p) => { if (p.endsWith('.string_table.xml')) addStrings(ctx, p); });
    }
  }

  addBuffs(ctx, path.join(gameDir, 'shared/buffs/base.buffs.json'));
  addBuffs(ctx, path.join(gameDir, 'shared/buffs/non_exported.buffs.json'));
  walk(path.join(gameDir, 'dlc'), (p) => { if (p.endsWith('.buffs.json')) addBuffs(ctx, p); });

  walk(gameDir, (p) => {
    if (/\.effects\.darkest$/.test(p) || /dd_effects\.darkest$/.test(p)) addEffects(ctx, p);
    else if (/\.camping_skills\.json$/.test(p)) addCamps(ctx, p);
    // The base table is plain "loot/loot.json"; DLC ones are "<name>.loot.json".
    else if (/(^|[.\\/])loot\.json$/.test(p)) addLoot(ctx, p);
  });
  return ctx;
}

/**
 * A mod's context, layered OVER the install's.
 *
 * A workshop folder is a partial overlay, so a mod that reuses `encourage`
 * without redefining it still has to render - the install behind it is what
 * supplies that. Maps are first-wins, so the mod is loaded into a fresh context
 * first and the game's entries are copied in behind only where nothing is
 * there: the mod always wins its own ids, and never loses the ones it borrows.
 *
 * One broad walk is right here, unlike the install: a mod tree is small, its
 * layout is the author's business rather than the game's, and there is no
 * committed output whose load order has to be preserved.
 */
function loadModContext(modDir, gameCtx, { wideStrings = false } = {}) {
  const ctx = emptyContext();
  const tables = [];
  walk(modDir, (p) => {
    if (p.endsWith('.string_table.xml')) { if (wideStrings) tables.push(p); else addStrings(ctx, p); }
    else if (p.endsWith('.buffs.json')) addBuffs(ctx, p);
    else if (/\.effects\.darkest$/.test(p) || /dd_effects\.darkest$/.test(p)) addEffects(ctx, p);
    else if (/\.camping_skills\.json$/.test(p)) addCamps(ctx, p);
    else if (/(^|[.\\/])loot\.json$/.test(p)) addLoot(ctx, p);
  });
  if (wideStrings) addStringsWideAll(ctx, tables);
  if (gameCtx) {
    for (const key of ['strings', 'buffs', 'effects', 'camps', 'loot']) {
      for (const [k, v] of gameCtx[key]) if (!ctx[key].has(k)) ctx[key].set(k, v);
    }
  }
  return ctx;
}

// ----------------------------------------------------------------- renderers

const TARGET_LABEL = {
  performer: 'Self', performer_group: 'Party', target: null, target_group: 'Enemies',
};

const SELECTION = {
  individual: 'One hero', party: 'Party', party_other: 'Other heroes', self: 'Self',
};

/**
 * Keys that a skill may state more than once, and that stack rather than replace.
 * Everything else is a scalar and the first statement of it wins.
 */
/**
 * Three things mod text leaks that the base game's never does.
 *
 * `%%` is printf's escape for a literal percent sign. `fillNumber` only consumes
 * it as part of `%d%%`, so a template writing `%%` on its own comes out doubled,
 * as in `(140%% base)`.
 *
 * Zero-width characters are padding: mods widen a tooltip with hundreds of them
 * and they survive every other clean-up precisely because they are not
 * whitespace. Kuuga's "Chouhenshin" carries 700 of them. `modScan.plainText`
 * already strips them out of names; effect text needs the same treatment.
 *
 * `Self: Self:` is a mod writing the target into its own buff description, which
 * then gets the effect's target put in front of it again. Where the inner half
 * says nothing at all the whole stranded prefix goes, rather than leaving
 * `Self: Self: (3 rds)` on the card.
 */
function tidy(s) {
  return s
    .replace(/%%/g, '%')
    .replace(/[\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/\b(Self|Party|Enemies|Other heroes):\s*\1:\s*/g, '$1: ')
    .replace(/\b(Self|Party|Enemies|Other heroes):\s*(?=[,|]|$)/g, '')
    .replace(/\s+([,|])/g, '$1')
    .replace(/\|\s*\|/g, '|')
    .replace(/\s+/g, ' ')
    .replace(/^[\s|,]+|[\s|,]+$/g, '')
    .trim();
}

/**
 * How a stance is written on a card.
 *
 * The base game names one `stance_aggressive`; a mod names it whatever it likes
 * and usually prefixes the hero's own id, so `Kuuga_G1` and `vz_ironclad_fiend`
 * are internal ids leaking into text a player reads. Stripping the prefix is
 * what turns those into `G1` and `fiend`.
 *
 * Both `valid_modes` ("usable in") and `set_mode` ("changes to") go through
 * here, because a stance spelled two ways on one card reads as two stances.
 */
function modeLabel(mode, prefix) {
  let t = String(mode).replace(/^stance_/, '');
  // El prefijo es un id de heroe (letras, digitos y guion bajo), asi que no
  // hace falta escapar nada: lo que no sea eso se descarta y no se usa.
  const safe = prefix ? String(prefix).replace(/[^A-Za-z0-9_]/g, '') : '';
  if (safe) t = t.replace(new RegExp('^' + safe + '[_-]?', 'i'), '');
  return t.replace(/_/g, ' ').trim() || String(mode);
}

const ACCUMULATE = ['effect', 'valid_modes', 'stance_defensive_effects', 'stance_aggressive_effects'];

/**
 * One record per skill id, out of the several lines that may describe it.
 *
 * **A `combat_skill:` line is not a whole skill.** The base game writes one
 * complete line per upgrade rank, so reading a single line works there and
 * `importSkillEffects.js` has always done exactly that. Plenty of mods do not:
 * they split one skill across several lines at the SAME rank, one per group of
 * attributes - `.target` on one, `.effect` on the next, a `.valid_modes` line
 * per stance after that. The game merges them; reading one line and discarding
 * the rest keeps whichever fragment happened to come last.
 *
 * That is what made 79 of 270 modded skills render as nothing but a stance
 * label, and eight classes - Kuuga, Forlorn, Legion, Satyr, Uncrowneds - render
 * as *only* stance labels, their whole kit thrown away. Kuuga states one skill
 * across five lines.
 *
 * Merging is off for the base game, whose committed output must not move.
 */
function mergeRows(allRows, chosen, level) {
  const keep = new Set(chosen.map((s) => s.id));
  const byId = new Map();
  for (const s of allRows) {
    if (!s.id || !keep.has(s.id)) continue;
    // Only the rank being described; a lower rank's numbers must not leak in.
    if (level !== 'max') { if (s.level !== level) continue; } else {
      const top = chosen.find((c) => c.id === s.id);
      if (top && String(s.level) !== String(top.level)) continue;
    }
    if (!byId.has(s.id)) byId.set(s.id, { id: s.id });
    const acc = byId.get(s.id);
    for (const [k, v] of Object.entries(s)) {
      if (v === undefined) continue;
      if (ACCUMULATE.includes(k)) {
        const had = acc[k] === undefined ? [] : [].concat(acc[k]);
        for (const one of [].concat(v)) if (!had.includes(one)) had.push(one);
        acc[k] = had;
      } else if (acc[k] === undefined) {
        acc[k] = v;
      }
    }
  }
  return [...byId.values()];
}

/**
 * A trinket's `*_additional_effects` fields, and the label each reads as.
 *
 * `buffs` is only the passive half of a trinket. The other half hangs off these
 * triggers, and reading only `buffs` left 20 base-game trinkets with an
 * incomplete tooltip - the Rescuer's Rucksack showed its MAX HP and CRIT and
 * said nothing about healing the party, and Flickering Lamplight had no entry
 * at all because everything it does hangs off a trigger. The label matters
 * because an effect on its own ("Stress +25") does not say when.
 *
 * Modded trinkets lean on this harder than the base game does: the Ironclad's
 * Burning Blood ships an empty `buffs` array and one kill trigger.
 */
const TRIGGERS = [
  ['attack_skill_additional_effects', 'On Attack'],
  ['friendly_skill_additional_effects', 'On Friendly Skill'],
  ['riposte_skill_additional_effects', 'On Riposte'],
  ['riposte_crit_additional_effects', 'On Riposte CRIT'],
  ['riposte_kill_additional_effects', 'On Riposte Kill'],
  ['was_hit_additional_effects', 'When Hit'],
  ['on_dodge_additional_effects', 'On Dodge'],
  ['kill_performer_additional_effects', 'On Monster Kill'],
  ['kill_all_monsters_additional_effects', 'On Battle Won'],
  ['turn_end_additional_effects', 'On Turn End'],
  ['round_end_additional_effects', 'On Round End'],
  ['was_killed_additional_effects', 'On Death'],
  ['was_killed_all_heroes_additional_effects', 'Hero Killed'],
  ['battle_finished_successfully_additional_effects', 'After Battle'],
  ['on_quest_complete_additional_effects', 'On Quest Complete'],
];

const EFFECT_TARGET = {
  performer: 'Self',
  performer_group: 'Party',
  performer_group_other: 'Other Heroes',
  target_group: 'Enemies',
  target_enemy_random: 'A random enemy',
  this_trinket: 'This trinket',
};

// Two triggers where a bare `target` is not the thing you hit, and saying
// nothing would mislead rather than merely be terse.
const TARGET_BY_TRIGGER = {
  was_killed_all_heroes_additional_effects: 'Party',
  kill_performer_additional_effects: 'Self',
};

// A buff reached through an effect carries its own lifetime, and it is the half
// the round count does not cover: the Coat's kill buffs last `combat_end` x2
// ("2 battles") and Miller's Pipe's death debuffs last `quest_end`.
const DURATION_WORD = {
  quest_end: () => 'quest',
  quest_complete: () => 'quest',
  activity_end: () => 'activity',
  before_turn: () => 'next turn',
  idle_start_town_visit: () => 'town visit',
  combat_end: (n) => `${n} ${n === 1 ? 'battle' : 'battles'}`,
};


/**
 * `extended` widens the renderer for MOD data, and is off for the base game.
 *
 * Not a feature flag for its own sake - the two trees genuinely differ, and the
 * gate is about which output can be verified:
 *
 *   · The base game's committed files (`skillEffects.js`, `trinketEffects.js`)
 *     are the contract. `skillEffects.js` cannot even be regenerated without the
 *     wiki CSV its combat half comes from, so a change here that shifts it is a
 *     change nobody can check today.
 *   · A modded class has no committed output to protect. The alternative to
 *     rendering it is not older text, it is no text at all.
 */
function makeRenderer(ctx, { extended = false } = {}) {
  const STR = ctx.strings;
  const BUFFS = ctx.buffs;
  const EFFECTS = ctx.effects;
  const CAMP = ctx.camps;
  const LOOT = ctx.loot;

  /**
   * A buff's number, as a whole unit.
   *
   * The base game writes a percentage stat as a 0-1 fraction, so `×100` is the
   * whole rule there and 2511 of its 2519 such buffs obey it. **Mods do not.**
   * Plenty write `-99` meaning -99%, and scaling that prints `-9900% CRIT` -
   * over half the modded skills rendered one absurd number before this.
   *
   * So under `extended` the scale is read off the value: at or under 1 it is a
   * fraction, above 1 it is already whole. Nobody writes a +2500% crit buff,
   * and the eight vanilla buffs that break the rule are town and meta stats
   * (`food_consumption_percent`, the gambler chances) - which is exactly why
   * this stays behind the gate rather than applying to the base game, where one
   * of those eight sits on a trinket.
   */
  const scaledBuff = (b) => {
    const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
    if (FLAT_STATS.test(k)) return Math.round(b.amount);
    if (extended && Math.abs(b.amount) > 1) return Math.round(b.amount);
    return Math.round(b.amount * 100);
  };

  const ruleDataText = (s) =>
    plain(STR.get('buff_rule_data_tooltip_' + s) || STR.get('enemy_type_name_' + s) || s.replace(/_/g, ' '));

  /**
   * Beyond this, a buff's number is a sentinel rather than a quantity.
   *
   * Some mods write `10000000` for "always" the same way others write
   * `.chance 2000%`, and it renders as `+1000000000% Bleed Skill Chance`. The
   * clause is dropped rather than printed: the rest of the trinket still reads,
   * and a figure nine digits long is not something a player can act on. The
   * base game never comes close - its largest is in the hundreds.
   */
  const ABSURD = 10000;

  function renderBuff(id) {
    const b = BUFFS.get(id);
    if (!b) return null;
    if (extended && typeof b.amount === 'number' && Math.abs(scaledBuff(b)) >= ABSURD) return null;
    // A buff carrying its own description says what it does far better than the
    // generic stat template - "Attacks usable in any position" beats the
    // "+0 DODGE" its stat line would render as. It still takes the amount, so
    // it goes through the same formatter.
    // Una descripcion propia dice mejor lo que hace un buff que la plantilla
    // generica. Tambien es donde un mod escribe lo que le da la gana, asi que
    // es el texto que mas necesita `tidy`.
    if (b.description_tooltip_id && STR.has(b.description_tooltip_id)) {
      const own = house(plain(fillNumber(plain(STR.get(b.description_tooltip_id)), scaledBuff(b))));
      return extended ? tidy(own) : own;
    }
    const k = b.stat_sub_type ? b.stat_type + '_' + b.stat_sub_type : b.stat_type;
    // A sub-type usually has its own template, but not always: the Man-at-Arms'
    // Mirror Shield is `damage_reflect_percent` + `reflected_dmg` and only the
    // unqualified template exists, so its `30% Damage Reflection` was dropped
    // rather than rendered. `importTrinketEffects.js` already falls back for
    // exactly this; the skill importer does not, and its committed output was
    // written without it - hence the gate.
    let tpl = STR.get('buff_stat_tooltip_' + k);
    if (tpl === undefined && extended && b.stat_sub_type) {
      tpl = STR.get('buff_stat_tooltip_' + b.stat_type);
    }
    if (tpl === undefined) return null;
    let text = plain(fillNumber(plain(tpl), scaledBuff(b)));
    const rule = b.rule_type || 'always';
    if (rule !== 'always' || b.is_false_rule) {
      let rt = STR.get('buff_rule_tooltip_' + rule + (b.is_false_rule ? '_false' : ''));
      if (rt === undefined && b.is_false_rule) rt = STR.get('buff_rule_tooltip_' + rule);
      if (rt !== undefined) {
        const d = b.rule_data || {};
        let n = d.float || 0;
        if (/^(target_)?in_rank$/.test(rule)) n += 1;
        else if (/^hp(above|below)$/.test(rule)) n = Math.round(n * 100);
        const order = rule === 'skill' ? [ruleDataText(d.string || ''), text] : [text, ruleDataText(d.string || '')];
        let i = 0;
        text = plain(fillNumber(plain(rt).replace(/\{\?[a-z0-9]+\}/g, ''), n)
          .replace(/%s/g, () => order[Math.min(i++, order.length - 1)]));
      }
    }
    const done = house(text);
    return extended ? tidy(done) : done;
  }

  /**
   * One effect as one clause. Only attributes that carry displayable meaning
   * appear; anything else is timing or bookkeeping (queue, apply_once, on_hit)
   * and never reaches the text.
   */
  function renderEffect(fx, modePrefix = null) {
    const bits = [];
    const chance = num(fx.chance);
    const dur = fx.duration ? ` (${fx.duration} rds)` : '';
    // A base chance is a real number the player wants - 140% base is ordinary,
    // and the highest the base game writes is 500%. Mods also use the field as a
    // SENTINEL for "always", writing 1000%, 2000% or a negative, and printing
    // `Bleed 1 pts/rd (-1000% base)` reads as a broken number rather than as a
    // certainty. Above what the game itself ever writes, the figure says nothing
    // and is dropped; under `extended` only, so vanilla keeps all 500 of them.
    const sentinel = extended && chance !== null && (chance < 0 || chance > 500);
    const at = chance !== null && chance !== 100 && !sentinel ? ` (${chance}% base)` : '';

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
    if (fx.set_mode) bits.push('Change to mode: ' + modeLabel(fx.set_mode, modePrefix));
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
    /**
     * Attributes the base game uses that the original renderer never read.
     *
     * Off by default, and that is a statement about verification rather than
     * about value. Vanilla effects carry every one of these - 73 `healstress`,
     * 131 `stress`, 73 `summon_monsters` - so switching them on rewrites
     * `skillEffects.js`, and that file cannot be regenerated without the wiki
     * CSV its combat half comes from. Changing a generated file nobody can
     * re-derive today is how a silent wrong answer gets committed.
     *
     * The modded importer turns them on because there is no committed output to
     * protect there: the alternative is not "the old text", it is no text.
     *
     * Signs follow `src/utils/skillProfile.js`, which parses this prose back
     * into tags: `Stress -8` is a stress heal, `Stress +8` is stress dealt, and
     * the two are different things to a party planner.
     */
    if (extended) {
      // A bare `.healstress` with no value parses as boolean `true`, and `num`
      // takes a string - so coerce before asking. Mods write bare flags far
      // more often than the base game does.
      const n = (v) => (v === undefined || v === true || Array.isArray(v) ? null : num(String(v)));
      if (n(fx.healstress)) bits.push(`Stress -${Math.abs(n(fx.healstress))}`);
      if (n(fx.stress)) bits.push(`Stress +${Math.abs(n(fx.stress))}${at}`);
      // `health_damage`, `heal_percent` and the riposte chances are NOT here,
      // and that is the point. Mods write them on scales that cannot be told
      // apart from the value alone - `riposte_on_hit_chance_add 100` is 100%,
      // the same field elsewhere holds `1.0` for the same thing - so rendering
      // them produced `+10000% Riposte on hit` and `Suffer 900 DMG`. A confident
      // wrong number is worse than a missing clause: the player cannot tell it
      // is wrong. Silence beats a guess, the same call `regionProfiles.js` makes
      // for a zone whose tables do not describe how it works.
      if (fx.daze) bits.push(`Daze${at}`);
      if (fx.shuffletarget) bits.push(`Shuffle target${at}`);
      if (fx.dotShuffle) bits.push(`Shuffle ${fx.dotShuffle} pts/rd${at}`);
      if (fx.summon_monsters) {
        const who = [].concat(fx.summon_monsters).map((m) => String(m).replace(/_/g, ' '));
        const many = [].concat(fx.summon_count || [])[0];
        bits.push(`Summons ${many && Number(many) > 1 ? many + '× ' : ''}${[...new Set(who)].join(' / ')}`);
      }
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
    const out = house(who ? `${who}: ${text}` : text);
    return extended ? tidy(out) : out;
  }

  /**
   * Every combat skill in one `<hero>.info.darkest`, as the app's skill shape.
   *
   * `nameFor(id)` supplies the display name. The base game can build that key
   * itself; a mod cannot, which is the whole reason it is a callback - names in
   * a workshop mod come dressed in colour tags, padded with zero-width space,
   * or only in Chinese, and `modScan`/`chooseName` already know how to resolve
   * that. Re-deriving it here is the drift this module exists to avoid.
   *
   * `level` picks which upgrade rank to describe. The game writes one
   * `combat_skill:` row per rank and the app shows the maxed skill, so this is
   * `'4'` for vanilla. A mod is not obliged to have four ranks, so `'max'`
   * takes the highest row each skill actually has.
   */
  function renderSkills(infoFile, { nameFor, level = '4', merge = false, modePrefix = null } = {}) {
    const rows = readDarkest(infoFile, 'combat_skill');
    let chosen;
    if (level === 'max') {
      const best = new Map();
      for (const s of rows) {
        if (!s.id) continue;
        const prev = best.get(s.id);
        if (!prev || (Number(s.level) || 0) >= (Number(prev.level) || 0)) best.set(s.id, s);
      }
      chosen = [...best.values()];
    } else {
      chosen = rows.filter((s) => s.level === level);
    }

    if (merge) chosen = mergeRows(rows, chosen, level);

    const out = new Map();
    for (const s of chosen) {
      const name = nameFor ? nameFor(s.id) : null;
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
        const t = renderEffect(fx, modePrefix);
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
        // The base game names a mode `stance_aggressive`; a mod names it
        // whatever it likes, and `Kuuga_G1` on a hero card is an internal id
        // leaking into text a player reads. `modePrefix` strips the hero's own
        // id off the front where the mod prefixes it, which most do.
        const modes = [].concat(s.valid_modes).map((m) => modeLabel(m, modePrefix));
        parts.unshift('Stance: ' + [...new Set(modes)].join('/'));
      }

      // A skill with no attack roll is a self/support skill; its 0% DMG and ACC
      // are placeholders in the file, not something to show.
      const attacks = num(s.atk) !== null && num(s.atk) !== 0;
      out.set(name, {
        type: s.type ? s.type[0].toUpperCase() + s.type.slice(1) : null,
        launch: launch.length ? launch.join('·') : null,
        target: target.length ? (ally ? 'ally ' : '') + target.join('·') : 'Self',
        aoe,
        dmg: attacks && s.dmg ? pct(num(s.dmg)) : null,
        acc: attacks ? num(s.atk) + '%' : null,
        crit: attacks && s.crit ? pct(num(s.crit)) : null,
        effect: parts.join(' | ') || null,
      });
    }
    return out;
  }

  /**
   * A camp skill's loot table, summarised by what it can drop rather than
   * printed as its internal code - so `Trinket Scrounge` reads "Chance to
   * produce a trinket" instead of `T_ANTIQ_CAMP`.
   */
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

  // ------------------------------------------------------------ trinkets

  const buffHeld = (b) => {
    const word = DURATION_WORD[b && b.duration_type];
    if (!word) return '';
    const n = Number.isFinite(b.duration) ? b.duration : 1;
    return ` (${word(n)})`;
  };

  /**
   * One triggered effect as a clause, or null when nothing about it is worth
   * showing (the effect exists only to carry timing flags).
   *
   * Deliberately NOT `renderEffect`. A trinket clause reads differently from a
   * skill one - a dot writes `Bleed 3 pts/rd for 3 rds` where a skill writes
   * `Bleed 3 pts/rd`, the target vocabulary is wider, and the trigger label
   * supplies the "when" that a skill's own line already implies.
   */
  function renderTriggeredEffect(fx, trigger) {
    const bits = [];
    const chance = num(String(fx.chance == null ? '' : fx.chance));
    const rds = fx.duration ? `${fx.duration} ${Number(fx.duration) === 1 ? 'rd' : 'rds'}` : '';
    const dur = rds ? ` for ${rds}` : '';
    const held = rds ? ` (${rds})` : '';
    const sentinel = extended && chance !== null && (chance < 0 || chance > 500);
    const at = chance !== null && chance !== 100 && !sentinel ? ` (${chance}% base)` : '';

    for (const [k, label] of [
      ['dotBurn', 'Burn'], ['dotBleed', 'Bleed'],
      ['dotPoison', 'Blight'], ['dotHpHeal', 'Restoration'],
    ]) {
      if (fx[k]) bits.push(`${label} ${fx[k]} pts/rd${dur}${at}`);
    }
    if (fx.stun) bits.push(`Stun${at}`);
    if (fx.push) bits.push(`Knockback ${fx.push}${at}`);
    if (fx.pull) bits.push(`Pull ${fx.pull}${at}`);
    if (fx.shuffletarget) bits.push(`Shuffle target${at}`);
    if (fx.riposte) bits.push(`Riposte${held}`);
    if (fx.stealth) bits.push(`Stealth${held}`);
    if (fx.tag) bits.push('Mark');
    if (fx.daze) bits.push(`Daze${at}`);
    if (fx.heal) bits.push(`Heal ${fx.heal}`);
    if (fx.heal_percent) bits.push(`Heal ${num(String(fx.heal_percent))}% MAX HP`);
    if (fx.healstress) bits.push(`Stress -${fx.healstress}`);
    if (fx.stress) bits.push(`Stress +${fx.stress}${at}`);
    if (fx.health_damage) bits.push(`${fx.health_damage} DMG`);
    if (fx.destroy_trinket) bits.push('Destroys this trinket');
    if (fx.guaranteed_town_event) bits.push('Guaranteed town event');
    if (fx.gain_random_quirk_negative) bits.push('Gain a negative quirk');
    if (fx.gain_random_quirk_positive_percentage) {
      bits.push(`Gain a quirk (${num(String(fx.gain_random_quirk_positive_percentage))}% positive)`);
    }
    if (fx.gain_random_trinket) bits.push('Gain a random trinket');
    if (fx.gain_trinket) {
      const named = STR.get('str_inventory_title_trinket' + fx.gain_trinket);
      bits.push(`Gain ${plain(named) || String(fx.gain_trinket).replace(/_/g, ' ')}`);
    }
    const uses = fx.trigger_limit_maximum_increase || fx.trigger_limit_minimum_increase;
    if (uses) bits.push(`+${uses} uses`);
    for (const id of [].concat(fx.buff_ids || [])) {
      const t = renderBuff(id);
      // The effect's own round count wins; the buff's lifetime is the fallback.
      if (t && !bits.includes(t)) bits.push(t + (held || buffHeld(BUFFS.get(id))));
    }
    if (!bits.length) return null;

    let text = [...new Set(bits)].join(', ');
    // A rank condition is the whole point of some effects - Infernal
    // Coalstone has two that differ only by `clear_rank_target`.
    if (fx.clear_rank_target) text += ` if target in rank ${fx.clear_rank_target}`;
    const targets = [].concat(fx.target || []);
    const who = EFFECT_TARGET[targets[0]]
      || (targets[0] === 'target' ? TARGET_BY_TRIGGER[trigger] : undefined);
    const out = house(who ? `${who}: ${text}` : text);
    return extended ? tidy(out) : out;
  }

  /**
   * One trinket entry as its list of clauses: the passive buffs first, then
   * each triggered effect under the label for its trigger.
   *
   * `unresolved` collects effect names the entry points at that no effects file
   * defines. Reported, never swallowed - silence is what hid 20 incomplete
   * base-game tooltips until somebody counted.
   */
  function renderTrinket(entry, unresolved) {
    const parts = [];
    const add = (t) => {
      let h = t === null || t === undefined ? '' : house(t);
      if (h && extended) h = tidy(h);
      if (h && !parts.includes(h)) parts.push(h);
    };
    for (const id of entry.buffs || []) add(renderBuff(id));
    for (const [field, label] of TRIGGERS) {
      for (const name of [].concat(entry[field] || [])) {
        const fx = EFFECTS.get(name);
        if (!fx) { if (unresolved) unresolved.add(name); continue; }
        const text = renderTriggeredEffect(fx, field);
        if (text) add(`${label}: ${text}`);
      }
    }
    return parts;
  }

  return {
    strings: STR, buffs: BUFFS, effects: EFFECTS, camps: CAMP, loot: LOOT,
    renderBuff, renderEffect, renderSkills, renderCampEffect, campEntry, lootSummary,
    renderTrinket, renderTriggeredEffect,
  };
}

module.exports = {
  makeRenderer, loadGameContext, loadModContext, emptyContext,
  plain, house, norm, num, pct, fillNumber, FLAT_STATS,
  walk, readJson, englishStrings, parseDarkest, readDarkest,
  TARGET_LABEL, SELECTION, TRIGGERS, EFFECT_TARGET, DURATION_WORD,
};
