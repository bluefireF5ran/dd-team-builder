/**
 * Turn one mod hero into the `modded_heroes.js` entry for it.
 *
 * Shared by `importModdedHeroes.js`, which writes the names, and
 * `exportModdedAssets.js`, which copies the pictures. That is the point: the
 * pipeline this replaces resolved names in one script and paired them with
 * icons *by position* in another, so a class whose skill list came out in the
 * wrong order got every icon filed under the wrong name. Here the builder
 * returns `skillPairs` / `campPairs` / `trinketPairs` - the id and the name
 * already tied together - and the exporter copies from those, so the two cannot
 * drift again.
 */
const { titleCase, nameKey } = require('./names');
const { chooseName } = require('./heroNames');

/**
 * Drop repeats, keeping the first.
 *
 * The app addresses a skill, camp skill or trinket by its display name -
 * `activeSkills` is a list of names, `toggleSkill` matches on one and
 * `imageHelper` builds the filename from one - so two entries sharing a name
 * are the same thing to every part of it: picking one picks both. The source
 * really does repeat them (Mordekaiser has two "Mace of Spades", one per
 * stance; Abigail has ten camp slots all labelled "Do Not Select"), so this is
 * not defensive - it is the list the app can actually work with.
 */
function dedupePairs(pairs, onDrop) {
  const seen = new Set();
  const out = [];
  for (const p of pairs) {
    const key = nameKey(p.name);
    if (seen.has(key)) { if (onDrop) onDrop(p); continue; }
    seen.add(key);
    out.push(p);
  }
  return out;
}

/**
 * @param ctx.vanillaCampNameById  vanilla camp skill id -> the name the app and
 *   the vanilla art folder use for it
 * @param ctx.vanillaCampNames     every camp skill name the vanilla roster uses
 * @param ctx.pairAppNames         (modDir, heroId, appSkills) -> { map, paired }
 */
function makeBuilder(ctx) {
  const vanillaById = ctx.vanillaCampNameById || new Map();
  const vanillaNames = ctx.vanillaCampNames || new Set();
  const pairAppNames = ctx.pairAppNames || (() => ({ map: new Map(), paired: false }));

  return function buildEntry(className, def, mod, hero) {
    const { map: appBySkillId, paired } = pairAppNames(mod.dir, hero.id, (def && def.skills) || []);
    const invented = [];
    const dropped = [];

    const skillPairs = dedupePairs(hero.skills.map(({ id, name }) => {
      const picked = chooseName(id, name, paired ? appBySkillId.get(id) : null, titleCase);
      if (picked.from === 'id') invented.push('skill: ' + id);
      return { id, name: picked.name };
    }), (p) => dropped.push('skill: ' + p.name));

    const appCampByName = new Map(((def && def.campSkills) || []).map((n) => [nameKey(n), n]));
    const campPairs = dedupePairs(hero.camps.map(({ id, name }) => {
      // A camp skill the base game defines keeps the vanilla name even when the
      // mod relabels it: `getCampSkillImagePath` sends anything in
      // `vanillaCampSkills` to the vanilla art folder, which is keyed by that
      // name, so the mod's flavour there would be a skill with no picture.
      const vanillaName = vanillaById.get(id);
      if (vanillaName) return { id, name: vanillaName, vanilla: true };
      // The raw name goes in and the title-casing comes out. Camp skills ship
      // SHOUTED, but title-casing first would mangle the key the translation
      // table is looked up by - "…的PVP视频" becomes "…的Pvp视频" and misses.
      const picked = chooseName(id, name, appCampByName.get(nameKey(name || '')) || null, titleCase);
      if (picked.from === 'id') invented.push('camp: ' + id);
      const finalName = titleCase(picked.name);
      // A mod may also define one of its own under a vanilla name; the art
      // folder answers to the name, so that one is vanilla-drawn too.
      return { id, name: finalName, vanilla: vanillaNames.has(finalName) };
    }), (p) => dropped.push('camp: ' + p.name));

    const appTrinketByName = new Map(((def && def.classSpecificTrinkets) || []).map((n) => [nameKey(n), n]));
    const trinketPairs = dedupePairs(hero.trinkets.map(({ id, name }) => {
      const picked = chooseName(id, name, appTrinketByName.get(nameKey(name || '')) || null, titleCase);
      if (picked.from === 'id') invented.push('trinket: ' + id);
      return { id, name: picked.name };
    }), (p) => dropped.push('trinket: ' + p.name));

    // English the app carries that no skill claimed. It means the class could
    // not be paired - the old ordering does not replay, usually because the mod
    // ships several heroes or none of its strings are english - so the
    // hand-written names are stranded. Reported rather than guessed onto a
    // skill: pinning the class with an explicit `heroId` is what fixes it, and
    // `pickHero` reads that before anything else.
    const claimed = new Set(skillPairs.map((p) => nameKey(p.name)));
    const orphaned = ((def && def.skills) || [])
      .filter((n) => /[A-Za-z]/.test(n) && !claimed.has(nameKey(n)));

    const entry = {
      modId: String(mod.modId),
      heroId: hero.id,
      skills: skillPairs.map((p) => p.name),
      campSkills: campPairs.map((p) => p.name),
      vanillaCampSkills: campPairs.filter((p) => p.vanilla).map((p) => p.name),
      image: (def && def.image) || (nameKey(className) + '.png'),
      classSpecificTrinkets: trinketPairs.map((p) => p.name),
    };
    if (hero.kit.alwaysActive) entry.alwaysActive = true;
    // Two or more, because a single `mode:` is a flag the class sets on itself,
    // not a stance it switches between - there is nothing to switch to.
    if (hero.kit.modes.length > 1) {
      entry.stances = hero.kit.modes.map((m) => titleCase(m.replace(/_/g, ' ').toUpperCase()));
    }

    return { entry, skillPairs, campPairs, trinketPairs, invented, dropped, paired, orphaned };
  };
}

module.exports = { makeBuilder, dedupePairs };
