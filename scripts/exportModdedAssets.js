#!/usr/bin/env node
/**
 * Build the modded image tree for `dd-team-builder-assets` from the mods on disk.
 *
 * Every file is named with the app's own `toImageFileName`, imported from
 * `src/utils/imageHelper.js` rather than reimplemented, because the bug this
 * replaces was exactly the two drifting apart: the old scraper had its own
 * `sanitize_filename`, and it also paired `skills[idx]` with
 * `<hero>.ability.<ordinal>.png` *by position* - so a class whose skill list was
 * out of order got every icon attached to the wrong name. Verified: the repo's
 * `2001406494_rupture.png` is byte-identical to `alchemist.ability.one.png`,
 * which that mod maps to `alch_putre`, Putrefaction.
 *
 * Here the icon comes from the same `<hero>.art.darkest` line as the skill id,
 * so the name and the picture cannot come apart.
 *
 *   skills       heroes/<id>/<id>.ability.<icon>.png
 *                  -> images/modded/skills/<modId>_<name>.png
 *   camp skills  raid/camping/skill_icons/camp_skill_<id>.png
 *                  -> images/modded/camp_skills/<modId>_<name>.png
 *   trinkets     panels/icons_equip/trinket/inv_trinket+<id>.png
 *                  -> images/modded/trinkets/class_specific/<modId>_<name>.png
 *                  (unclassed ones go to images/modded/trinkets/ instead)
 *   portraits    heroes/<id>/<id>_A/<id>_portrait_roster.png
 *                  -> images/modded/heroes/<image>
 *
 * Camp skills the base game defines are skipped: `imageHelper` draws those from
 * the vanilla folder, which is what `vanillaCampSkills` records.
 *
 * Usage:
 *   node scripts/exportModdedAssets.js --workshop "<…/content/262060>" --out "<dir>"
 *   node scripts/exportModdedAssets.js … --dry-run          count, copy nothing
 *   node scripts/exportModdedAssets.js … --only Sibyl       one class
 */
const fs = require('fs');
const path = require('path');
const scan = require('./lib/modScan');
const { nameKey } = require('./lib/names');
const { ROOT, loadDataModule } = require('./lib/appData');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const WORKSHOP = opt('--workshop') || process.env.DD_WORKSHOP_DIR
  || (GAME && path.resolve(GAME, '../../workshop/content/262060'));
const OUT = opt('--out');
const DRY = argv.includes('--dry-run');
const ONLY = opt('--only');

if (!WORKSHOP || !fs.existsSync(WORKSHOP)) {
  console.error('Need the Steam Workshop content folder for Darkest Dungeon (app 262060).');
  process.exit(1);
}
if (!OUT && !DRY) {
  console.error('Need --out <dir> (the images/ folder of dd-team-builder-assets), or --dry-run.');
  process.exit(1);
}

// The app's own filename rule, not a copy of it.
const { toImageFileName } = loadDataModule('src/utils/imageHelper.js', {
  BACKER_TRINKETS: [],
  MODDED_HERO_CLASSES: {},
  MODDED_GENERAL_TRINKETS: [],
  COMMON_VANILLA_CAMP_SKILLS: [],
  getAssetUrl: (p) => p,
});
const APP = loadDataModule('src/data/modded_heroes.js').MODDED_HERO_CLASSES;

// The manifest the importer wrote: internal id -> the display name the app now
// asks for, already paired. Nothing here re-derives a name, which is the whole
// point - the pipeline this replaces resolved names in one place and paired
// them with icons by position in another, and a class whose skill list came out
// in the wrong order got every icon filed under the wrong name.
const MANIFEST = path.join(ROOT, 'scripts/importModdedHeroes.manifest.json');
if (!fs.existsSync(MANIFEST)) {
  console.error('No scripts/importModdedHeroes.manifest.json - run importModdedHeroes.js first.');
  process.exit(1);
}
const PAIRS = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const stats = { skills: 0, camps: 0, trinkets: 0, general: 0, portraits: 0, fromGame: 0, missing: [], stale: [], classes: 0, noMod: 0 };

/**
 * The base game's art, by filename.
 *
 * Plenty of workshop entries are rebalances rather than new classes - one that
 * reworks the Antiquarian ships a single new ability icon and leaves the other
 * six to the game. The app resolves every skill of a modded class through the
 * modded path, so the vanilla picture has to be copied under the modded name or
 * six of her seven skills draw nothing.
 */
const gameArt = new Map();
if (GAME && fs.existsSync(GAME)) {
  scan.walk(GAME, (p) => {
    if (!p.endsWith('.png')) return;
    const base = path.basename(p);
    if (!gameArt.has(base)) gameArt.set(base, p);
  });
}

function take(src, relDest, kind, label) {
  let from = fs.existsSync(src) ? src : null;
  let borrowed = false;
  if (!from) {
    const vanilla = gameArt.get(path.basename(src));
    if (vanilla) { from = vanilla; borrowed = true; }
  }
  if (!from) { stats.missing.push({ kind, label, src: path.basename(src) }); return; }
  if (!DRY) {
    const dest = path.join(OUT, relDest);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(from, dest);
  }
  stats[kind]++;
  if (borrowed) stats.fromGame++;
}

const modCache = new Map();
function getMod(modId) {
  if (!modCache.has(modId)) {
    const dir = path.join(WORKSHOP, modId);
    modCache.set(modId, fs.existsSync(dir) ? scan.scanMod(dir, modId) : null);
  }
  return modCache.get(modId);
}

for (const [className, def] of Object.entries(APP)) {
  if (ONLY && nameKey(className) !== nameKey(ONLY)) continue;
  const modId = String(def.modId);
  const mod = getMod(modId);
  // Without a heroId the class was left untouched by the importer (its mod is
  // not installed, or the mod ships several heroes and none matched). Guessing
  // which folder to copy from is what produced the mislabeled icons.
  if (!mod || !def.heroId) { stats.noMod++; continue; }
  const hero = mod.heroes.find((h) => h.id === def.heroId);
  if (!hero) { stats.noMod++; continue; }
  stats.classes++;

  const pairs = PAIRS[className];
  if (!pairs) { stats.noMod++; stats.classes--; continue; }
  // A manifest older than the data file would file pictures under names the app
  // no longer asks for. Say so instead of copying 12,000 wrong ones.
  if (pairs.skills.map((p) => p[1]).join('|') !== (def.skills || []).join('|')) {
    stats.stale.push(className);
  }
  const skillPairs = pairs.skills.map(([id, name]) => ({ id, name }));
  const campPairs = pairs.camps.map(([id, name, vanilla]) => ({ id, name, vanilla }));
  const trinketPairs = pairs.trinkets.map(([id, name]) => ({ id, name }));

  // ---- combat skills
  const iconById = new Map();
  for (const a of scan.readDarkest(path.join(hero.dir, hero.id + '.art.darkest'), 'combat_skill')) {
    if (a.id && typeof a.icon === 'string') iconById.set(a.id, a.icon);
  }
  for (const { id, name } of skillPairs) {
    // The icon defaults to the skill id when art.darkest does not name one.
    const src = path.join(hero.dir, `${hero.id}.ability.${iconById.get(id) || id}.png`);
    take(src, `modded/skills/${modId}_${toImageFileName(name)}.png`, 'skills', `${className} / ${name}`);
  }

  // ---- camp skills, skipping the ones drawn from the vanilla folder
  for (const { id, name, vanilla } of campPairs) {
    if (vanilla) continue;
    const src = path.join(mod.dir, 'raid/camping/skill_icons', `camp_skill_${id}.png`);
    take(src, `modded/camp_skills/${modId}_${toImageFileName(name)}.png`, 'camps', `${className} / ${name}`);
  }

  // ---- class trinkets
  for (const { id, name } of trinketPairs) {
    const src = path.join(mod.dir, 'panels/icons_equip/trinket', `inv_trinket+${id}.png`);
    take(src, `modded/trinkets/class_specific/${modId}_${toImageFileName(name)}.png`, 'trinkets', `${className} / ${name}`);
  }

  // ---- portrait
  // The roster portrait, from the first appearance variant (`<hero>_A`, then
  // _B.._D). Not the guild header next to it: that is a wide banner, twenty
  // times the size and the wrong shape for a hero card.
  if (def.image) {
    let src = null;
    for (const v of ['A', 'B', 'C', 'D']) {
      const p = path.join(hero.dir, `${hero.id}_${v}`, `${hero.id}_portrait_roster.png`);
      if (fs.existsSync(p)) { src = p; break; }
    }
    take(src || path.join(hero.dir, `${hero.id}_portrait_roster.png`),
      `modded/heroes/${def.image}`, 'portraits', className);
  }
}

// ---------------------------------------------- general (unclassed) trinkets
// Not tied to a class, so they are copied once from the manifest's own list
// rather than per hero.
if (!ONLY) {
  for (const [modId, id, name] of PAIRS.__generalTrinkets || []) {
    const src = path.join(WORKSHOP, modId, 'panels/icons_equip/trinket', `inv_trinket+${id}.png`);
    take(src, `modded/trinkets/${modId}_${toImageFileName(name)}.png`, 'general', name);
  }
}

console.log(`  ${stats.classes} classes exported, ${stats.noMod} skipped (mod not installed or hero unpinned)`);
console.log(`  ${stats.skills} skill icons`);
console.log(`  ${stats.camps} camp skill icons`);
console.log(`  ${stats.trinkets} class trinket icons`);
console.log(`  ${stats.general} general trinket icons`);
console.log(`  ${stats.portraits} portraits`);
console.log(`  ${stats.fromGame} of those borrowed from the base game (rebalance mods that reuse vanilla art)`);
if (stats.stale.length) {
  // The data file no longer matches what the mods on disk say. Every picture
  // here is still correctly paired, but the app is asking for other names -
  // rerun importModdedHeroes.js first.
  console.log(`  ${stats.stale.length} classes where the manifest and modded_heroes.js disagree - rerun importModdedHeroes.js: ${stats.stale.slice(0, 6).join(', ')}`);
}
console.log(`  ${stats.missing.length} not found in the mod`);
const byKind = {};
for (const m of stats.missing) byKind[m.kind] = (byKind[m.kind] || 0) + 1;
if (stats.missing.length) {
  console.log('    ' + Object.entries(byKind).map(([k, v]) => `${k}: ${v}`).join(', '));
  for (const m of stats.missing.slice(0, 10)) console.log(`    ${m.kind.padEnd(9)} ${m.label} (${m.src})`);
  if (stats.missing.length > 10) console.log(`    …and ${stats.missing.length - 10} more`);
}
console.log(DRY ? '\n--dry-run: nothing copied.' : `\nWrote into ${OUT}`);
