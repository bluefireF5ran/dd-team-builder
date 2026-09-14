#!/usr/bin/env node
/**
 * Regenerate `src/data/modded_heroes.js` from the Steam Workshop mods on disk.
 *
 * The file this replaces was built by a scraper that never opened a hero's
 * `.info.darkest`: it listed a class's skills by sweeping the localization XML
 * for `combat_skill_name_*` entries in file order. That is not the kit and not
 * its order, which is why 141 classes were out of order, 116 had the wrong
 * `alwaysActive` (the game states it as `skill_selection: .can_select_combat_skills
 * false`, and almost every class that got it wrong is a stance class the sweep
 * could not see), and every skill icon shifted with the order it was paired to.
 *
 * What is read, and from where:
 *
 *   heroes/<id>/<id>.info.darkest   combat skills in kit order, skill_selection,
 *                                   mode: lines (stances), the estate district tag
 *   heroes/<id>/<id>.art.darkest    icon ordinal, which is the order the player
 *                                   sees on the skill buttons
 *   raid/camping/*.camping_skills.json   camp skills granted to the class
 *   trinkets/*.entries.trinkets.json     class trinkets, by hero_class_requirements
 *   localization/*.string_table.xml      the display names for all of it
 *
 * Names are reconciled rather than replaced. Several of the mods installed here
 * ship no english at all, and `modded_heroes.js` carries hand-written english
 * for them; that work survives because the old scraper's ordering rule can be
 * replayed exactly, which ties each name already in the app back to the skill id
 * it was written for. See `pairAppNames`.
 *
 * Usage:
 *   node scripts/importModdedHeroes.js --workshop "<…/steamapps/workshop/content/262060>"
 *   node scripts/importModdedHeroes.js --workshop … --game "<install>"   (resolve vanilla ids)
 *   node scripts/importModdedHeroes.js … --check                         (report, write nothing)
 *   node scripts/importModdedHeroes.js … --prune                         (drop what cannot be shown)
 *
 * A class whose mod was re-uploaded under a new id is pinned to the installed
 * one in `lib/modPins.js`; see there for why that is not guesswork.
 *   node scripts/importModdedHeroes.js … --report scripts/importModdedHeroes.report.json
 *
 * Both paths can also come from DD_WORKSHOP_DIR / DD_GAME_DIR.
 */
const fs = require('fs');
const path = require('path');
const scan = require('./lib/modScan');
const { titleCase, nameKey } = require('./lib/names');
const { isLatinName, translationFor } = require('./lib/heroNames');
const { makeBuilder } = require('./lib/moddedEntry');
const { pairAppNames } = require('./lib/scraperReplay');
const HERO_PINS = require('./lib/heroPins');
const MOD_PINS = require('./lib/modPins');
const { loadGameContext } = require('./lib/gameContext');
const { ROOT, loadDataModule } = require('./lib/appData');

const OUT = path.join(ROOT, 'src/data/modded_heroes.js');
// The id -> name mapping settled for each class, so the asset exporter can file
// each picture under the name the app will ask for without re-deriving it.
// Re-deriving is not idempotent: the names in the file feed the next run, and a
// class whose repeated names were deduped no longer replays to the same count.
// Merged across runs, because a run can only settle the mods it has on disk.
const MANIFEST = path.join(ROOT, 'scripts/importModdedHeroes.manifest.json');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const PRUNE = argv.includes('--prune');
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const WORKSHOP = opt('--workshop') || process.env.DD_WORKSHOP_DIR
  || (GAME && path.resolve(GAME, '../../workshop/content/262060'));
const REPORT = opt('--report');

if (!WORKSHOP || !fs.existsSync(WORKSHOP)) {
  console.error('Need the Steam Workshop content folder for Darkest Dungeon (app 262060).');
  console.error('  node scripts/importModdedHeroes.js --workshop "D:/…/steamapps/workshop/content/262060"');
  process.exit(1);
}

// ================================================ the base game, and the app
const { vanillaCampNames, vanillaCampNameById, gameStrings } = loadGameContext(GAME);
const app = loadDataModule('src/data/modded_heroes.js');
const APP_CLASSES = app.MODDED_HERO_CLASSES;
const VANILLA_CLASS_NAMES = new Set(Object.keys(loadDataModule('src/data/heroes.js', {
  HERO_SPECIFIC_TRINKETS: loadDataModule('src/data/hero_specific_trinkets.js').HERO_SPECIFIC_TRINKETS,
}).HERO_CLASSES));

// =============================================================== the workshop
const mods = new Map();
for (const id of fs.readdirSync(WORKSHOP)) {
  const dir = path.join(WORKSHOP, id);
  let st;
  try { st = fs.statSync(dir); } catch (e) { continue; }
  if (!st.isDirectory()) continue;
  const m = scan.scanMod(dir, id, gameStrings);
  if (m) mods.set(id, m);
}

// ======================================================== matching app to mod
/**
 * Which hero inside a mod folder an app class refers to.
 *
 * The mod id alone does not answer it - a mod can ship several classes, and the
 * app's name for one is often not the mod's ("Oni Swordsman" is `onikenshi`).
 * When the name settles nothing, the skills do: the class already lists them,
 * and only one hero in the folder will have them. Several app classes may land
 * on the same hero, which is expected - the old scraper left duplicates behind
 * ("Illusionist" and "Illusionist (3631649848)" are one class twice).
 */
function pickHero(mod, className, def) {
  if (!mod || !mod.heroes.length) return null;
  // A pin, then the id already in the data file. Both beat every heuristic:
  // they are the answer somebody worked out, not one this run guessed.
  const pinned = HERO_PINS[className] || (def && def.heroId);
  if (pinned) {
    const byId = mod.heroes.find((h) => h.id === pinned);
    if (byId) return byId;
  }
  if (mod.heroes.length === 1) return mod.heroes[0];
  const key = nameKey(className);
  // `nameKey` of a Chinese name is the empty string, and every string contains
  // the empty string - so an unguarded substring test matched the first
  // CJK-named hero in the folder for *every* class on the mod. One 21-hero mod
  // had eleven app classes all pointing at `exorcist` because of it.
  const overlaps = (a, b) => a && b && a.length > 2 && b.length > 2 && (a.includes(b) || b.includes(a));
  const byName = (key && mod.heroes.find((h) => nameKey(h.name) === key))
    || (key && mod.heroes.find((h) => nameKey(h.id) === key))
    || mod.heroes.find((h) => overlaps(key, nameKey(h.name)))
    || mod.heroes.find((h) => overlaps(key, nameKey(h.id)));
  if (byName) return byName;

  // Skills settle what the name could not. The mod's own name for a skill is
  // compared, and so is our translation of it - the classes that reach this
  // point are mostly the Chinese-only ones, where the app's english can only
  // line up with the mod through the translation table.
  const want = new Set(((def && def.skills) || []).map(nameKey).filter(Boolean));
  if (!want.size) return null;
  let best = null;
  for (const h of mod.heroes) {
    const hit = h.skills.filter((s) => {
      if (s.name && want.has(nameKey(s.name))) return true;
      const t = translationFor(s.name);
      return !!t && want.has(nameKey(t));
    }).length;
    if (hit && (!best || hit > best.hit)) best = { hit, hero: h };
  }
  // Half the class's skills is enough to be sure, and low enough to survive the
  // renames a re-import is fixing in the first place.
  return best && best.hit >= Math.ceil(want.size / 2) ? best.hero : null;
}

// ================================================================= rebuilding
const report = {
  kept: [], rebuilt: [], added: [], skippedNew: [], unresolved: [], orphaned: [], deduped: [], renamedNew: [],
  noMod: [], noHero: [], generalSkipped: [], pruned: [], mergedInto: [], unsuffixed: [], counts: {},
};

const buildEntry = makeBuilder({ vanillaCampNames, vanillaCampNameById, pairAppNames });

/** One class's id -> name pairs, in the order the entry lists them. */
function pairsOf(built, entry) {
  return {
    modId: entry.modId,
    heroId: entry.heroId,
    skills: built.skillPairs.map((p) => [p.id, p.name]),
    camps: built.campPairs.map((p) => [p.id, p.name, !!p.vanilla]),
    trinkets: built.trinketPairs.map((p) => [p.id, p.name]),
  };
}

const out = {};
const manifest = {};
const claimed = new Set();

for (const [className, def] of Object.entries(APP_CLASSES)) {
  // A pin re-points a class at the upload that is installed; without one the
  // class's own `modId` is the answer, as it is for all but a handful.
  const modId = MOD_PINS[className] || def.modId;
  const mod = mods.get(String(modId));
  const hero = pickHero(mod, className, def);
  if (!mod) { out[className] = def; report.noMod.push({ className, modId }); continue; }
  if (!hero) { out[className] = def; report.noHero.push({ className, modId: def.modId, heroes: mod.heroes.map((h) => h.id) }); continue; }

  // By the mod the hero was read from, which is what the new-class pass checks
  // against. A pinned class claims its installed upload, so that upload is no
  // longer a class nobody carries.
  claimed.add(mod.modId + '/' + hero.id);
  const built = buildEntry(className, def, mod, hero);
  const { entry, invented, paired, orphaned, dropped } = built;
  out[className] = entry;
  manifest[className] = pairsOf(built, entry);
  const changed = JSON.stringify({ ...def, heroId: undefined, stances: undefined })
    !== JSON.stringify({ ...entry, heroId: undefined, stances: undefined });
  (changed ? report.rebuilt : report.kept).push(className);
  if (invented.length) report.unresolved.push({ className, ids: invented, paired });
  if (orphaned.length) report.orphaned.push({ className, heroId: hero.id, names: orphaned });
  if (dropped.length) report.deduped.push({ className, dropped });
}

// ---------------------------------------------------------------- new classes
// A mod hero the app never picked up. **The skills decide**, not the class name:
// a class whose seven skills all read `jd_skill1` is content nobody can use, and
// inventing english for those would put words in the mod's mouth. A class the
// mod names only in Chinese but whose whole kit is in english is the opposite
// case and is worth having, so its folder id stands in for the missing name.
const appNameKeys = new Set(Object.keys(APP_CLASSES).map(nameKey));

/**
 * What makes two workshop entries the same class.
 *
 * The mod id does not: a popular class is uploaded again as a port, a
 * translation or a rebalance, under a new id and often a new title - the app's
 * `Illusionist` is `3631649848/Mesmer` while `3025352993/Mesmer` is the same
 * hero's original upload, and `Dragon Rider` has a second id too. The folder id
 * alone does not either, since two authors can both call a hero `Gabriel`. The
 * pair does: same internal id *and* the same set of skill ids is the same kit,
 * and adding it again would double the roster with copies.
 */
const kitSignature = (hero) => hero.id.toLowerCase() + '|' + [...hero.kit.order].sort().join(',');
const carriedKits = new Set();
for (const d of Object.values(out)) {
  const m = mods.get(String(d.modId));
  const h = m && d.heroId && m.heroes.find((x) => x.id === d.heroId);
  if (h) carriedKits.add(kitSignature(h));
}

for (const mod of mods.values()) {
  for (const hero of mod.heroes) {
    if (claimed.has(mod.modId + '/' + hero.id)) continue;
    const note = (why) => report.skippedNew.push({ modId: mod.modId, heroId: hero.id, name: hero.name, why });

    if (carriedKits.has(kitSignature(hero))) {
      note('another upload of a class already carried');
      continue;
    }

    // A skill counts as named if the mod names it in english *or* the
    // translation table covers its Chinese - otherwise a class whose whole kit
    // we can read would still be turned away.
    const named = hero.skills.filter((s) => isLatinName(s.name, s.id) || translationFor(s.name)).length;
    if (!hero.skills.length || named < Math.ceil(hero.skills.length / 2)) {
      note(`only ${named}/${hero.skills.length} skills named`);
      continue;
    }

    // The mod's own english, then our translation of its Chinese, then the
    // folder id read as words. A class whose name survives none of those is one
    // nothing can label.
    let className = hero.name;
    let namedFrom = 'mod';
    if (!isLatinName(className, hero.id)) {
      const translated = translationFor(hero.name);
      if (translated && isLatinName(translated, hero.id)) {
        className = translated;
        namedFrom = 'translated';
      } else {
        className = titleCase(String(hero.id).replace(/[_-]+/g, ' ').toUpperCase());
        namedFrom = 'id';
        if (!isLatinName(className, null)) { note('mod names neither the class nor enough of its kit'); continue; }
      }
    }

    if (VANILLA_CLASS_NAMES.has(className) || appNameKeys.has(nameKey(className))) {
      // A different kit under a name already taken. A rebalance of a vanilla
      // class calls itself "Crusader", and `HeroConfiguration` merges the two
      // rosters with the modded one last, so keeping that name would replace the
      // real Crusader the moment modded content is switched on. The mod id
      // suffix is the app's own convention for telling two classes with one name
      // apart.
      const suffixed = `${className} (${mod.modId})`;
      if (appNameKeys.has(nameKey(suffixed))) { note('name already in the app'); continue; }
      report.renamedNew.push({ from: className, to: suffixed, modId: mod.modId });
      className = suffixed;
    }

    const built = buildEntry(className, null, mod, hero);
    const { entry } = built;
    out[className] = entry;
    manifest[className] = pairsOf(built, entry);
    appNameKeys.add(nameKey(className));
    carriedKits.add(kitSignature(hero));
    report.added.push({ className, modId: mod.modId, heroId: hero.id, skills: entry.skills.length, namedFrom });
  }
}

// ===================================================================== pruning
// `--prune` drops what cannot be shown honestly. Off by default: unsubscribing a
// mod for an afternoon should not silently delete fifty classes from the app.
//
// Three things go, and each is a fact rather than a judgement:
//
//   * the mod is not installed, so nothing can be verified or drawn;
//   * another class already carries the same hero id and the same set of skill
//     ids - one class uploaded twice, which the old scraper kept as two;
//   * half or more of the kit has no name in any language, so the card would
//     read "Fydt Skill 1" all the way down.
//
// A duplicate group is collapsed onto the **best entry under the best name**,
// which are not always the same row: `Unicorn (Rework)` has the readable name
// and `Unicorn (Rework) (3611958999)` has the translated kit.
function namedCount(className) {
  const entry = out[className];
  const total = (entry.skills || []).length;
  const rec = report.unresolved.find((u) => u.className === className);
  const unnamed = rec ? rec.ids.filter((x) => x.startsWith('skill')).length : 0;
  return { named: total - unnamed, total, unnamed };
}

/**
 * Which of two names for one class to keep.
 *
 * The plain one. A trailing parenthetical is a disambiguator the old scraper
 * added - `(3397134362)`, `(CN)`, `(Legacy)` - and once the duplicate it was
 * disambiguating from is gone it is only noise; a lower-case name is a slip.
 * Beyond that the shorter name wins, which is a weak preference on purpose:
 * choosing between "Nin Robber" and "Assault Kunoichi" is taste, and a rule
 * that tries to have taste is the one that ends up keeping "Falconer (Legacy)"
 * over "Falconer" because the folder happens to be called `falconer`.
 */
function betterName(a, b) {
  const disambiguated = (n) => /\([^)]*\)\s*$/.test(n);
  const lowercase = (n) => !/[A-Z]/.test(n.charAt(0));
  const rank = (n) => (disambiguated(n) ? 2 : 0) + (lowercase(n) ? 1 : 0);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra < rb ? a : b;
  if (a.length !== b.length) return a.length < b.length ? a : b;
  return a.localeCompare(b, 'en') <= 0 ? a : b;
}

if (PRUNE) {
  for (const { className } of report.noMod) {
    delete out[className];
    delete manifest[className];
    report.pruned.push({ className, why: 'mod not installed' });
  }

  const groups = new Map();
  for (const [className, d] of Object.entries(out)) {
    const mod = mods.get(String(d.modId));
    const hero = mod && d.heroId && mod.heroes.find((h) => h.id === d.heroId);
    if (!hero) continue;
    const sig = hero.id.toLowerCase() + '|' + [...hero.kit.order].sort().join(',');
    if (!groups.has(sig)) groups.set(sig, { heroId: hero.id, members: [] });
    groups.get(sig).members.push(className);
  }

  for (const { members } of groups.values()) {
    if (members.length < 2) continue;
    let bestEntry = members[0];
    let bestName = members[0];
    for (const m of members.slice(1)) {
      if (namedCount(m).named > namedCount(bestEntry).named) bestEntry = m;
      bestName = betterName(bestName, m);
    }
    const entry = out[bestEntry];
    const pairs = manifest[bestEntry];
    for (const m of members) {
      if (m === bestName) continue;
      delete out[m];
      delete manifest[m];
      report.pruned.push({ className: m, why: 'same kit as ' + bestName });
    }
    out[bestName] = entry;
    if (pairs) manifest[bestName] = pairs;
    if (bestEntry !== bestName) report.mergedInto.push({ name: bestName, tookDataFrom: bestEntry });
  }

  for (const className of Object.keys(out)) {
    const { named, total } = namedCount(className);
    if (total && named / total > 0.5) continue;
    delete out[className];
    delete manifest[className];
    report.pruned.push({ className, why: `only ${named}/${total} skills named in any language` });
  }

  // A `(3611958999)` suffix exists to tell two classes apart. Once pruning has
  // removed the other one it is noise, so it comes off - unless the plain name
  // belongs to a vanilla class, where the suffix is the whole point.
  for (const className of Object.keys(out)) {
    const m = className.match(/^(.*?)\s*\(\d{6,}\)$/);
    if (!m) continue;
    const base = m[1].trim();
    if (!base || out[base] || VANILLA_CLASS_NAMES.has(base)) continue;
    out[base] = out[className];
    if (manifest[className]) manifest[base] = manifest[className];
    delete out[className];
    delete manifest[className];
    report.unsuffixed.push({ from: className, to: base });
  }
}

// ------------------------------------------------ general (unclassed) trinkets
// A trinket with an empty `hero_class_requirements` is worn by anybody, and 369
// of the ones the old data filed as class trinkets are exactly that - a mod's
// theming is not a restriction the game enforces. They belong in the general
// pool `TrinketPicker` already merges in, which until now was empty.
//
// A name that collides with a vanilla, backer or class trinket is left out:
// `getTrinketImagePath` tests the general list *before* falling through to the
// vanilla folder, so a modded "Ancestor's Bottle" would take the real one's
// picture. Same reason two mods shipping one name keep only the first.
const takenTrinketNames = new Set([
  ...loadDataModule('src/data/trinkets.js').TRINKETS,
  ...loadDataModule('src/data/backer_trinkets.js').BACKER_TRINKETS,
  ...Object.values(loadDataModule('src/data/hero_specific_trinkets.js').HERO_SPECIFIC_TRINKETS).flat(),
].map(nameKey));
for (const d of Object.values(out)) {
  for (const t of d.classSpecificTrinkets || []) takenTrinketNames.add(nameKey(t));
}

// What earlier runs settled, on machines with other mods installed. Both the
// general trinket list and the manifest are merged against it rather than
// replaced: a run sees only the mods on this disk, and on any one machine that
// is a fraction of what the app carries.
const priorManifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  : {};

const generalTrinkets = new Map();
for (const mod of mods.values()) {
  for (const id of mod.generalTrinkets) {
    const name = scan.nameText(mod.strings.get('str_inventory_title_trinket' + id));
    const skip = (why) => report.generalSkipped.push({ modId: mod.modId, id, name, why });
    if (!isLatinName(name, id)) { skip('no english name'); continue; }
    const key = nameKey(name);
    if (takenTrinketNames.has(key)) { skip('name already belongs to another trinket'); continue; }
    if (generalTrinkets.has(key)) { skip('another mod ships this name'); continue; }
    generalTrinkets.set(key, { name, modId: mod.modId, id });
  }
}
// A trinket the app carries whose mod is not on this disk is kept, exactly as
// its class would be: nothing here can verify it, and dropping it would delete
// it from the app. One whose mod IS installed and no longer ships it goes,
// because that is the mod's own answer.
const priorGeneralPairs = new Map(
  (priorManifest.__generalTrinkets || []).map(([modId, id, name]) => [nameKey(name), { modId, id, name }])
);
for (const name of app.MODDED_GENERAL_TRINKETS || []) {
  const key = nameKey(name);
  if (generalTrinkets.has(key)) continue;
  // The shadow rule applies to a carried name too. Pinning the Ringmaster and
  // the Aesthete to their installed uploads gave them an "Arena Helmet" and a
  // "Black Market Delicacies" of their own, and a general trinket of that name
  // would take the class trinket's picture.
  if (takenTrinketNames.has(key)) {
    report.generalSkipped.push({ modId: null, id: null, name, why: 'a class trinket now carries this name' });
    continue;
  }
  const known = priorGeneralPairs.get(key);
  const modId = String((app.MODDED_GENERAL_TRINKET_MODS || {})[name] || (known && known.modId) || '');
  if (mods.has(modId)) { report.generalSkipped.push({ modId, id: known && known.id, name, why: 'its mod no longer ships it' }); continue; }
  generalTrinkets.set(key, { name, modId, id: known ? known.id : null });
}

const generalSorted = [...generalTrinkets.values()]
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));
// Only the ones with an id: the pair exists so `exportModdedAssets` can find the
// picture, and a carried trinket whose id no run ever settled has none to find.
manifest.__generalTrinkets = generalSorted.filter((g) => g.id).map((g) => [g.modId, g.id, g.name]);

// =================================================================== emitting
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function arr(items, indent) {
  if (!items.length) return '[]';
  const pad = ' '.repeat(indent);
  return '[\n' + items.map((i) => pad + '  ' + q(i)).join(',\n') + '\n' + pad + ']';
}

function render(classes) {
  const names = Object.keys(classes).sort((a, b) => a.localeCompare(b, 'en'));
  const body = names.map((name) => {
    const d = classes[name];
    const lines = [
      `    modId: ${q(d.modId)},`,
      d.heroId ? `    heroId: ${q(d.heroId)},` : null,
      `    skills: ${arr(d.skills || [], 4)},`,
      `    campSkills: ${arr(d.campSkills || [], 4)},`,
      `    vanillaCampSkills: ${arr(d.vanillaCampSkills || [], 4)},`,
      d.alwaysActive ? '    alwaysActive: true,' : null,
      d.stances && d.stances.length ? `    stances: ${arr(d.stances, 4)},` : null,
      d.district ? `    district: ${q(d.district)},` : null,
      `    image: ${q(d.image)},`,
      `    classSpecificTrinkets: ${arr(d.classSpecificTrinkets || [], 4)},`,
    ].filter(Boolean);
    return `  ${q(name)}: {\n${lines.join('\n')}\n  }`;
  }).join(',\n');

  return `/**
 * Modded hero classes, generated by \`scripts/importModdedHeroes.js\` from the
 * Steam Workshop mods installed on disk - do not hand-edit.
 *
 * \`skills\` is the kit in the order the game draws the buttons, read from
 * \`<hero>.art.darkest\`'s icon ordinals over \`<hero>.info.darkest\`'s declaration
 * order. \`alwaysActive\` is the game's own \`.can_select_combat_skills false\`,
 * not a guess: those classes fight with the whole kit instead of four chosen
 * skills, which is why several of them carry more than seven. \`stances\` lists
 * the \`mode:\` ids such a class switches between, and is why the kit is that
 * size. \`district\` is the estate district the class tags itself with, the
 * same \`tag: .id\` line the vanilla heroes carry, and says what the town
 * already gives it. \`heroId\` is the mod's internal id for the class -
 * the link back to the workshop folder, and what
 * \`scripts/exportModdedAssets.js\` names images from.
 *
 * Rerun with:
 *   node scripts/importModdedHeroes.js --workshop "<…/workshop/content/262060>" --game "<install>"
 */
export const MODDED_HERO_CLASSES = {
${body}
};

/**
 * Trinkets a mod adds with no class requirement, so any hero may wear them.
 *
 * Read from \`hero_class_requirements: []\` in the mods' own
 * \`*.entries.trinkets.json\`. A lot of what reads as class kit is declared
 * unrestricted, and the game is the authority on that, not the theming.
 */
export const MODDED_GENERAL_TRINKETS = ${arr(generalSorted.map((g) => g.name), 0)};

/**
 * Which mod each of them came from, for \`getTrinketImagePath\`: the picture is
 * filed as \`<modId>_<name>.png\` like every other modded asset, because a name
 * on its own is not unique across 800 mods.
 */
export const MODDED_GENERAL_TRINKET_MODS = {
${generalSorted.map((g) => `  ${q(g.name)}: ${q(g.modId)},`).join('\n')}
};
`;
}

report.counts = {
  classesBefore: Object.keys(APP_CLASSES).length,
  classesAfter: Object.keys(out).length,
  rebuilt: report.rebuilt.length,
  unchanged: report.kept.length,
  added: report.added.length,
  skippedNew: report.skippedNew.length,
  modNotInstalled: report.noMod.length,
  heroNotFound: report.noHero.length,
  classesWithInventedNames: report.unresolved.length,
  classesWithOrphanedNames: report.orphaned.length,
  classesWithRepeatedNames: report.deduped.length,
  newClassesRenamedOffVanilla: report.renamedNew.length,
  alwaysActive: Object.values(out).filter((d) => d.alwaysActive).length,
  withStances: Object.values(out).filter((d) => d.stances && d.stances.length).length,
  generalTrinkets: generalSorted.length,
  pruned: report.pruned.length,
};

const text = render(out);

// The manifest is merged, not replaced, against the prior copy read above: a
// run settles only the classes whose mods are installed, and writing its
// answers alone would throw away what a machine with more mods worked out.
// A class that is gone from the data file goes from here too.
const mergedManifest = {};
for (const className of Object.keys(out)) {
  const settled = manifest[className] || priorManifest[className];
  if (settled) mergedManifest[className] = settled;
}
// Last, as it always was, so the classes read in the data file's own order.
mergedManifest.__generalTrinkets = manifest.__generalTrinkets;

if (!CHECK) {
  fs.writeFileSync(OUT, text, 'utf8');
  fs.writeFileSync(MANIFEST, JSON.stringify(mergedManifest, null, 1), 'utf8');
}
if (REPORT) fs.writeFileSync(path.resolve(REPORT), JSON.stringify(report, null, 1), 'utf8');

for (const [k, v] of Object.entries(report.counts)) console.log(`  ${String(v).padStart(5)}  ${k}`);
if (report.noMod.length) {
  console.log(`\n  kept as-is, mod not installed: ${report.noMod.map((r) => r.className).join(', ')}`);
}
if (report.noHero.length) {
  console.log(`  kept as-is, no matching hero in the mod: ${report.noHero.map((r) => r.className).join(', ')}`);
}
console.log(CHECK ? '\n--check: nothing written.' : `\nWrote ${path.relative(ROOT, OUT)}`);
