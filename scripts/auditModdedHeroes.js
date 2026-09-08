#!/usr/bin/env node
/**
 * Diff `src/data/modded_heroes.js` against the Steam Workshop mods on disk.
 *
 * Reports only - nothing is written. `importModdedHeroes.js` is the half that
 * rewrites the file; this one exists to say what is wrong and how wrong before
 * anything moves, and to name the mods whose heroes the app never picked up.
 *
 * Usage:
 *   node scripts/auditModdedHeroes.js --game "<install>" --workshop "<…/content/262060>"
 *   node scripts/auditModdedHeroes.js … --class Sibyl        one class in full
 *   node scripts/auditModdedHeroes.js … --json               machine-readable
 *   node scripts/auditModdedHeroes.js … --missing            only unclaimed mods
 */
const fs = require('fs');
const path = require('path');
const scan = require('./lib/modScan');
const { titleCase, nameKey } = require('./lib/names');
const { translationFor } = require('./lib/heroNames');
const { loadDataModule } = require('./lib/appData');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const WORKSHOP = opt('--workshop') || process.env.DD_WORKSHOP_DIR
  || (GAME && path.resolve(GAME, '../../workshop/content/262060'));
const ONLY = opt('--class');
const AS_JSON = argv.includes('--json');
const MISSING_ONLY = argv.includes('--missing');

if (!WORKSHOP || !fs.existsSync(WORKSHOP)) {
  console.error('Need the Steam Workshop content folder for Darkest Dungeon (app 262060).');
  console.error('  node scripts/auditModdedHeroes.js --workshop "D:/…/steamapps/workshop/content/262060"');
  process.exit(1);
}

// ------------------------------------------------------------ the game's own
// strings, so vanilla ids a mod reuses (`encourage`, `first_aid`) resolve.
const gameStrings = new Map();
if (GAME && fs.existsSync(GAME)) {
  for (const dir of ['localization', 'dlc']) {
    scan.walk(path.join(GAME, dir), (p) => {
      if (!p.endsWith('.string_table.xml')) return;
      for (const [k, v] of scan.englishStrings(p)) if (!gameStrings.has(k)) gameStrings.set(k, v);
    });
  }
}

// ------------------------------------------------------------------ app side
const app = loadDataModule('src/data/modded_heroes.js');
const APP_CLASSES = app.MODDED_HERO_CLASSES;

// ------------------------------------------------------------ workshop side
const mods = new Map();
for (const id of fs.readdirSync(WORKSHOP)) {
  const dir = path.join(WORKSHOP, id);
  let st;
  try { st = fs.statSync(dir); } catch (e) { continue; }
  if (!st.isDirectory()) continue;
  const m = scan.scanMod(dir, id, gameStrings);
  if (m) mods.set(id, m);
}

// ------------------------------------------------------------------ matching
// A mod folder can define several classes, so the modId alone does not identify
// a hero. `heroId` in the data file settles it where the importer has already
// been; name is the tiebreaker otherwise, and a mod with one hero needs neither.
function pickHero(mod, className, def) {
  if (!mod || !mod.heroes.length) return null;
  if (def && def.heroId) {
    const byId = mod.heroes.find((h) => h.id === def.heroId);
    if (byId) return byId;
  }
  if (mod.heroes.length === 1) return mod.heroes[0];
  const key = nameKey(className);
  // A chinese name has an empty nameKey, and every string contains the empty
  // string - an unguarded substring test matches the first CJK-named hero for
  // every class on the mod.
  const overlaps = (a, b) => a && b && a.length > 2 && b.length > 2 && (a.includes(b) || b.includes(a));
  return (key && mod.heroes.find((h) => nameKey(h.name) === key))
    || (key && mod.heroes.find((h) => nameKey(h.id) === key))
    || mod.heroes.find((h) => overlaps(key, nameKey(h.name)))
    || mod.heroes.find((h) => overlaps(key, nameKey(h.id)))
    || null;
}

const claimed = new Set();
const rows = [];
for (const [className, def] of Object.entries(APP_CLASSES)) {
  if (ONLY && nameKey(className) !== nameKey(ONLY)) continue;
  const mod = mods.get(String(def.modId));
  const hero = pickHero(mod, className, def);
  if (hero) claimed.add(def.modId + '/' + hero.id);

  rows.push({ className, def, mod, hero });
}

// ----------------------------------------------------------------- the diffs
// What the importer would call a thing, so a name the translation table covers
// does not read as a difference from the mod.
const shown = (name, id) => translationFor(name) || name || id;

const listEq = (a, b) => a.length === b.length && a.every((x, i) => nameKey(x) === nameKey(b[i]));
const setDiff = (a, b) => {
  const keys = new Set(b.map(nameKey));
  return a.filter((x) => !keys.has(nameKey(x)));
};

function diffHero({ className, def, mod, hero }) {
  const issues = [];
  if (!mod) return [{ kind: 'NO_MOD', detail: `mod ${def.modId} is not installed` }];
  if (!hero) return [{ kind: 'NO_HERO', detail: `mod ${def.modId} has ${mod.heroes.length} heroes, none matching "${className}"` }];

  if (hero.name && nameKey(hero.name) !== nameKey(className)) {
    issues.push({ kind: 'NAME', detail: `app "${className}" vs mod "${hero.name}"` });
  }

  const gameSkills = hero.skills.map((s) => shown(s.name, s.id));
  const appSkills = def.skills || [];
  const extra = setDiff(appSkills, gameSkills);
  const missing = setDiff(gameSkills, appSkills);
  if (extra.length || missing.length) {
    issues.push({ kind: 'SKILLS', detail: '', extra, missing, game: gameSkills, appList: appSkills });
  } else if (!listEq(appSkills, gameSkills)) {
    issues.push({ kind: 'SKILL_ORDER', detail: `${appSkills.join(' / ')}  ->  ${gameSkills.join(' / ')}`, game: gameSkills, appList: appSkills });
  }

  const gameCamps = hero.camps.map((c) => titleCase(shown(c.name, c.id)));
  const appCamps = def.campSkills || [];
  const cExtra = setDiff(appCamps, gameCamps);
  const cMissing = setDiff(gameCamps, appCamps);
  if (cExtra.length || cMissing.length) {
    issues.push({ kind: 'CAMP', detail: '', extra: cExtra, missing: cMissing, game: gameCamps, appList: appCamps });
  } else if (!listEq(appCamps, gameCamps)) {
    issues.push({ kind: 'CAMP_ORDER', detail: `${appCamps.join(' / ')}  ->  ${gameCamps.join(' / ')}`, game: gameCamps, appList: appCamps });
  }

  const appAlways = !!def.alwaysActive;
  if (appAlways !== hero.kit.alwaysActive) {
    issues.push({
      kind: 'ALWAYS_ACTIVE',
      detail: `app ${appAlways} vs game ${hero.kit.alwaysActive}` +
        (hero.kit.modes.length ? ` (stances: ${hero.kit.modes.join('/')})` : ''),
      game: hero.kit.alwaysActive,
    });
  }

  const gameTrinkets = hero.trinkets.map((t) => shown(t.name, t.id));
  const appTrinkets = def.classSpecificTrinkets || [];
  const tExtra = setDiff(appTrinkets, gameTrinkets);
  const tMissing = setDiff(gameTrinkets, appTrinkets);
  if (tExtra.length || tMissing.length) {
    issues.push({ kind: 'TRINKETS', detail: '', extra: tExtra, missing: tMissing, game: gameTrinkets, appList: appTrinkets });
  }

  const unnamed = [...hero.skills, ...hero.camps, ...hero.trinkets].filter((x) => !x.name);
  if (unnamed.length) {
    issues.push({ kind: 'NO_ENGLISH', detail: `${unnamed.length} id(s) with no english string: ${unnamed.slice(0, 6).map((x) => x.id).join(', ')}` });
  }

  return issues;
}

const report = rows.map((r) => ({ ...r, issues: diffHero(r) }));

// ------------------------------------------------------------ unclaimed mods
const unclaimed = [];
for (const mod of mods.values()) {
  for (const h of mod.heroes) {
    if (claimed.has(mod.modId + '/' + h.id)) continue;
    // A hero the app already carries under a different mod id is a duplicate
    // upload, not new content.
    unclaimed.push({ modId: mod.modId, id: h.id, name: h.name, skills: h.skills.length, trinkets: h.trinkets.length });
  }
}
const appNameKeys = new Set(Object.keys(APP_CLASSES).map(nameKey));
const trulyNew = unclaimed.filter((u) => u.name && !appNameKeys.has(nameKey(u.name)));

// ---------------------------------------------------------------- rendering
if (AS_JSON) {
  console.log(JSON.stringify({
    classes: report.map((r) => ({ className: r.className, modId: r.def.modId, heroId: r.hero && r.hero.id, issues: r.issues })),
    unclaimed, trulyNew,
  }, null, 1));
  process.exit(0);
}

const counts = {};
for (const r of report) for (const i of r.issues) counts[i.kind] = (counts[i.kind] || 0) + 1;

if (!MISSING_ONLY) {
  const withIssues = report.filter((r) => r.issues.length);
  if (ONLY || withIssues.length <= 40) {
    for (const r of withIssues) {
      console.log(`\n${r.className}  [${r.def.modId}${r.hero ? ' / ' + r.hero.id : ''}]`);
      for (const i of r.issues) {
        if (i.kind === 'SKILLS' || i.kind === 'CAMP' || i.kind === 'TRINKETS') {
          console.log(`  ${i.kind}`);
          if (i.missing.length) console.log(`    + missing from app: ${i.missing.join(', ')}`);
          if (i.extra.length) console.log(`    - not in the mod  : ${i.extra.join(', ')}`);
        } else {
          console.log(`  ${i.kind}: ${i.detail}`);
        }
      }
    }
  }

  console.log(`\n=== ${report.length} modded classes in the app ===`);
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(4)}  ${k}`);
  }
  console.log(`  ${String(report.filter((r) => !r.issues.length).length).padStart(4)}  CLEAN`);
}

console.log(`\n=== ${mods.size} hero mods installed, ${unclaimed.length} classes the app does not carry ===`);
console.log(`  ${trulyNew.length} of them under a name the app has never seen`);
if (MISSING_ONLY) {
  for (const u of trulyNew.sort((a, b) => (a.name || '').localeCompare(b.name || ''))) {
    console.log(`  ${(u.name || '?').padEnd(34)} ${u.modId.padEnd(12)} ${u.id.padEnd(28)} ${u.skills} skills, ${u.trinkets} trinkets`);
  }
}
