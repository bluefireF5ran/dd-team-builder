/**
 * What the base game install contributes to reading a mod.
 *
 * A workshop mod is an overlay: it lists vanilla ids it reuses (`encourage`,
 * `first_aid`) without redefining them, so their names and their art come from
 * the install. Both the importer and the asset exporter need the same picture
 * of it, and they must agree - a camp skill counted as vanilla in one and not
 * the other would be named from one folder and drawn from another.
 */
const fs = require('fs');
const path = require('path');
const scan = require('./modScan');
const { titleCase, nameKey } = require('./names');
const { loadDataModule } = require('./appData');

function loadGameContext(gameDir) {
  const gameStrings = new Map();
  const vanillaCampIds = new Set();
  if (gameDir && fs.existsSync(gameDir)) {
    for (const dir of ['localization', 'dlc']) {
      scan.walk(path.join(gameDir, dir), (p) => {
        if (!p.endsWith('.string_table.xml')) return;
        for (const [k, v] of scan.englishStrings(p)) if (!gameStrings.has(k)) gameStrings.set(k, v);
      });
    }
    scan.walk(gameDir, (p) => {
      if (!p.endsWith('.camping_skills.json')) return;
      try { for (const s of scan.readJson(p).skills || []) vanillaCampIds.add(s.id); } catch (e) { /* skip */ }
    });
  }

  const vanillaClasses = loadDataModule('src/data/heroes.js', {
    HERO_SPECIFIC_TRINKETS: loadDataModule('src/data/hero_specific_trinkets.js').HERO_SPECIFIC_TRINKETS,
  }).HERO_CLASSES;

  const vanillaCampNames = new Set();
  for (const c of Object.values(vanillaClasses)) for (const s of c.campSkills || []) vanillaCampNames.add(s);
  const byKey = new Map([...vanillaCampNames].map((n) => [nameKey(n), n]));

  // The app's own spelling wins over the game's where they differ ("Self
  // Medicate" for SELF-MEDICATE, "Snake Skin" for SNAKESKIN) - that is what the
  // art is filed under. `hobby` is the one vanilla camp skill no class uses, so
  // it keeps the game's name.
  const vanillaCampNameById = new Map();
  for (const id of vanillaCampIds) {
    const raw = gameStrings.get('camping_skill_name_' + id);
    const titled = raw ? titleCase(scan.nameText(raw) || '') : '';
    if (!titled) continue;
    vanillaCampNameById.set(id, byKey.get(nameKey(titled)) || titled);
  }

  return { gameStrings, vanillaCampIds, vanillaCampNames, vanillaCampNameById, vanillaClasses };
}

module.exports = { loadGameContext };
