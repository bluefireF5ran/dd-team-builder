#!/usr/bin/env node
/**
 * Regenerate `src/data/regionProfiles.js`.
 *
 * What you actually fight in each region, and the resolve thresholds the save
 * importer needs to turn XP into a level.
 *
 * Same shape as every other importer here: it reads a game install at build
 * time and COMMITS its output, so nothing in `src/` ever needs the game. That
 * is the whole point -- the app has to work for someone who has never installed
 * Darkest Dungeon.
 *
 * Two sources, and it is the pairing that makes it a region profile rather than
 * a bestiary:
 *
 *  - `monsters/**\/*.info.darkest` (plus the DLC mirrors) for each enemy's
 *    stats: hp, prot, spd, the five resistances, `enemy_type`, how many ranks
 *    it takes up, and whether it leaves a corpse.
 *  - `dungeons/<zone>/*.mash.darkest` for the weighted tables of which enemies
 *    actually turn up together.
 *
 * Usage:
 *   node scripts/importRegionProfiles.js --game "<DarkestDungeon install>"
 *   node scripts/importRegionProfiles.js --game … --check   (report, write nothing)
 *
 * The path can also come from DD_GAME_DIR.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/regionProfiles.js');
// Las filas por bicho van en su PROPIO fichero, y nadie las importa a proposito.
// Son la procedencia -- con ellas se puede reajustar el resumen sin volver a
// tener el juego instalado, igual que el manifest de `importModdedHeroes`-- pero
// si vivieran en `regionProfiles.js` entrarian en el bundle detras de
// `REGION_PROFILES`, que si se usa. Separadas, cuestan cero en la web.
const OUT_ENEMIES = path.join(ROOT, 'src/data/regionEnemies.js');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const GAME = opt('--game') || process.env.DD_GAME_DIR;

if (!GAME || !fs.existsSync(path.join(GAME, 'monsters'))) {
  console.error('Need the Darkest Dungeon install directory.');
  console.error('  node scripts/importRegionProfiles.js --game "…/steamapps/common/DarkestDungeon"');
  process.exit(1);
}

// ============================================================ generic loaders
function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

/** The game ships CRLF; a stray \r turns the last monster of a line into junk. */
const lines = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/);

/**
 * Every file in the install, once.
 *
 * It used to look in `<GAME>/monsters` and `<dlc>/<id>/monsters`, and that
 * misses the Crimson Court entirely: its files do not hang off `<dlc>/<id>`,
 * they live under `<dlc>/580100_crimson_court/features/crimson_court/`. The
 * cost was 129 enemies and all 263 Courtyard mash rows going unseen, so `The
 * Courtyard` came out with no profile at all — which read as "a region whose
 * fights are scripted" and was really a wrong path.
 *
 * Walking the whole install and sorting by path takes about a tenth of a second
 * and does not care how any future DLC nests its folders.
 */
const eachFile = (fn) => walk(GAME, fn);

const isUnder = (file, folder) => file.includes(`${path.sep}${folder}${path.sep}`);

// =================================================================== effects
/**
 * Which of the game's named effects talk about the MARK.
 *
 * A monster's `skill:` line names its effects by id (`.effect "Damage Marked
 * Target"`), so the definitions have to be read to know what each one does
 * rather than guessed from the name — `Lifesteal Mark` sounds like punishment
 * and is the opposite, it *applies* the mark.
 *
 *   - **punishes**: `.keyStatus "tagged"` together with a damage
 *     `.combat_stat_buff`, i.e. "I hit a marked hero harder".
 *   - **applies**: `.tag 1`, i.e. "I mark you myself".
 */
function readMarkEffects() {
  const punishes = new Set();
  const applies = new Set();

  eachFile((file) => {
    if (!file.endsWith('.effects.darkest')) return;
    lines(file).forEach((line) => {
      const name = (line.match(/\.name\s+"([^"]+)"/) || [])[1];
      if (!name) return;
      const vsMarked =
        /\.keyStatus\s+"tagged"/.test(line) &&
        /\.combat_stat_buff\s+1/.test(line) &&
        /\.damage_(low|high)_multiply/.test(line);
      if (vsMarked) punishes.add(name);
      if (/\.tag\s+1(?!\d)/.test(line)) applies.add(name);
    });
  });

  return { punishes, applies };
}

// ================================================================== monsters
/**
 * One row per enemy. Keyed by the file's own id (`cultist_brawler_A`), which is
 * exactly what a mash table names, so nothing has to be matched by guesswork.
 */
function readMonsters(markEffects) {
  const monsters = {};

  eachFile((file) => {
      // Heroes ship `.info.darkest` too, so the folder is what tells them apart.
      if (!file.endsWith('.info.darkest') || !isUnder(file, 'monsters')) return;
      const id = path.basename(file, '.info.darkest');
      const text = fs.readFileSync(file, 'utf8');

      // Anchored to the `stats:` line: several of these keys also appear on
      // skill lines, and reading `.spd` off a skill would be nonsense.
      const statsLine = text.split(/\r?\n/).find((l) => l.trimStart().startsWith('stats:')) || '';
      const num = (line, re) => {
        const m = line.match(re);
        return m ? parseFloat(m[1]) : null;
      };

      const displayLine = text.split(/\r?\n/).find((l) => l.trimStart().startsWith('display:')) || '';
      const typeLine = text.split(/\r?\n/).find((l) => l.trimStart().startsWith('enemy_type:')) || '';

      // Los efectos que nombran sus skills, para cruzarlos con `readMarkEffects`.
  const effects = [];
      /**
       * Y lo que la skill AMENAZA, que es la mitad que no se leia.
       *
       * `.launch` son las posiciones desde las que el bicho puede usarla y
       * `.target` los rangos de heroe a los que llega, con `~` delante si es
       * area. Sin esto no se puede decir si una party alcanza al enemigo
       * peligroso, ni si el enemigo peligroso alcanza a tu rango 4.
       */
      const skills = [];
      const digitsOf = (v) => (v
        ? [...new Set(String(v).replace(/[^0-9]/g, '').split(''))].map(Number).sort((a, b) => a - b)
        : []);
      text.split(/\r?\n/).forEach((line) => {
        if (!line.trimStart().startsWith('skill:')) return;
        const named = line.match(/[.]effect\s+((?:"[^"]*"\s*)+)/);
        if (named) {
          (named[1].match(/"([^"]*)"/g) || []).forEach((quoted) => effects.push(quoted.slice(1, -1)));
        }
        const dmg = line.match(/[.]dmg\s+(\d+)\s+(\d+)/);
        const launch = line.match(/[.]launch\s+([0-9]+)/);
        const target = line.match(/[.]target\s+(~?@?[0-9]+)/);
        skills.push({
          id: (line.match(/[.]id\s+"([^"]*)"/) || [])[1] || null,
          dmgMin: dmg ? Number(dmg[1]) : null,
          dmgMax: dmg ? Number(dmg[2]) : null,
          launch: digitsOf(launch && launch[1]),
          hits: digitsOf(target && target[1]),
          aoe: !!(target && target[1].includes('~')),
        });
      });

      monsters[id] = {
        size: num(displayLine, /\.size\s+(\d+)/) || 1,
        type: (typeLine.match(/\.id\s+"?([a-z_]+)"?/) || [])[1] || null,
        hp: num(statsLine, /\.hp\s+(\d+)/),
        prot: num(statsLine, /\.prot\s+(-?[\d.]+)/),
        // `.def` is dodge. It was never read, and it is the one stat that says
        // whether an accuracy problem is the region's fault.
        dodge: num(statsLine, /\.def\s+(-?[\d.]+)%/),
        spd: num(statsLine, /\.spd\s+(-?\d+)/),
        stun: num(statsLine, /\.stun_resist\s+(-?[\d.]+)%/),
        blight: num(statsLine, /\.poison_resist\s+(-?[\d.]+)%/),
        bleed: num(statsLine, /\.bleed_resist\s+(-?[\d.]+)%/),
        debuff: num(statsLine, /\.debuff_resist\s+(-?[\d.]+)%/),
        move: num(statsLine, /\.move_resist\s+(-?[\d.]+)%/),
        // `death_class ... .type "corpse"` is what decides whether killing it
        // leaves a body in the way.
        corpse: /death_class:[^\n\r]*\.type\s+"corpse"/.test(text),
        // Hits a MARKED hero harder, and marks one itself. The first is what
        // makes a self-marking hero a liability; the second is a threat to the
        // whole party whatever it brings.
        punishesMark: effects.some((name) => markEffects.punishes.has(name)),
        marksHeroes: effects.some((name) => markEffects.applies.has(name)),
        // Dos acciones por ronda es la excepcion que marca la guia de
        // velocidad: contra eso no basta con ir 7 de SPD por delante.
        turns: num(
          text.split(/\r?\n/).find((l) => l.trimStart().startsWith('initiative:')) || '',
          /[.]number_of_turns_per_round\s+(\d+)/
        ) || 1,
        skills
      };
  });

  return monsters;
}

// ================================================================== dungeons
/**
 * Game folder -> the names this app uses in `LOCATIONS`.
 *
 * The four Darkest Dungeons share one enemy pool and one folder, so they share
 * one profile. `town` is the Hamlet defence (Vvulf), which is a real fight in a
 * real place, so it counts.
 */
const ZONE_TO_LOCATION = {
  crypts: ['The Ruins'],
  warrens: ['The Warrens'],
  weald: ['The Weald'],
  cove: ['The Cove'],
  courtyard: ['The Courtyard'],
  farm: ['The Farmstead'],
  town: ['The Hamlet'],
  darkestdungeon: [
    'The Darkest Dungeon I',
    'The Darkest Dungeon II',
    'The Darkest Dungeon III',
    'The Darkest Dungeon IV'
  ]
};

function readMashes() {
  const zones = {};

  eachFile((file) => {
      const base = path.basename(file);
      if (!base.endsWith('.mash.darkest')) return;
      // The Shieldbreaker DLC drops `flashback.<zone>.*` tables into the real
      // zone folders. Those are her own scripted dungeon, not the Warrens, and
      // folding them in would put her snakes in every region profile.
      if (base.startsWith('flashback.')) return;

      const zone = path.basename(path.dirname(file));
      if (!ZONE_TO_LOCATION[zone]) return;

      // `<zone>.<n>.mash.darkest`: the number is the dungeon difficulty and the
      // enemy variant follows it (`.1` draws `_A`, `.3` `_B`, `.5` `_C`). The
      // summary below pools every level on purpose - it is a profile of the
      // place - but a threat model has to know which fight is which.
      const level = Number((base.match(/[.](\d+)[.]mash[.]darkest$/) || [])[1]) || null;

      (zones[zone] ??= []);
      lines(file).forEach((line) => {
        const m = line.match(/^\s*(hall|room):\s*\.chance\s+(\d+)\s+\.types\s+(.+?)\s*$/);
        if (!m) return;
        zones[zone].push({
          kind: m[1],
          level,
          chance: Number(m[2]),
          types: m[3].split(/\s+/).filter(Boolean)
        });
      });
  });

  return zones;
}

// =================================================================== summary
const RESISTS = ['stun', 'blight', 'bleed', 'debuff', 'move'];

/**
 * The weighted picture of one zone.
 *
 * Every enemy is weighted by its party's `.chance`, so a table that comes up
 * twice as often counts twice -- an average over the raw list would let a rare
 * boss party drag the numbers.
 */
function summarise(rows, monsters, unknown) {
  let weight = 0;
  let partySize = 0;
  let corpses = 0;
  let bodies = 0;
  let ranks = 0;
  let prot = 0;
  let dodge = 0;
  let punishesMark = 0;
  let marksHeroes = 0;
  const resistTotals = Object.fromEntries(RESISTS.map((r) => [r, 0]));
  const resistWeight = Object.fromEntries(RESISTS.map((r) => [r, 0]));
  const types = {};

  rows.forEach((row) => {
    weight += row.chance;
    partySize += row.chance * row.types.length;

    row.types.forEach((id) => {
      const monster = monsters[id];
      if (!monster) {
        unknown.add(id);
        return;
      }
      bodies += row.chance;
      ranks += row.chance * (monster.size || 1);
      if (monster.corpse) corpses += row.chance;
      if (monster.punishesMark) punishesMark += row.chance;
      if (monster.marksHeroes) marksHeroes += row.chance;
      prot += row.chance * (monster.prot || 0);
      dodge += row.chance * (monster.dodge || 0);
      if (monster.type) types[monster.type] = (types[monster.type] || 0) + row.chance;
      RESISTS.forEach((key) => {
        if (monster[key] === null || monster[key] === undefined) return;
        resistTotals[key] += row.chance * monster[key];
        resistWeight[key] += row.chance;
      });
    });
  });

  if (!weight || !bodies) return null;

  const round = (n) => Math.round(n * 10) / 10;
  const typeMix = Object.fromEntries(
    Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => [name, round((n / bodies) * 100)])
  );

  return {
    tables: rows.length,
    enemies: new Set(rows.flatMap((r) => r.types)).size,
    avgPartySize: round(partySize / weight),
    avgRanksTaken: round(ranks / weight),
    corpseRate: round((corpses / bodies) * 100),
    // `.prot` ships as a fraction; as a percentage it reads like the game's own
    // tooltip.
    avgProt: round((prot / bodies) * 100),
    avgDodge: round(dodge / bodies),
    // Share of enemy bodies that hit a MARKED hero harder -- the cost of
    // fielding a self-marker here -- and the share that mark one themselves.
    markPunish: round((punishesMark / bodies) * 100),
    markThreat: round((marksHeroes / bodies) * 100),
    resist: Object.fromEntries(
      RESISTS.map((key) => [key, resistWeight[key] ? Math.round(resistTotals[key] / resistWeight[key]) : null])
    ),
    typeMix
  };
}

// ============================================================== progression
/** The game's JSON is hand-written: BOM, `//` comments and trailing commas. */
function readGameJson(relative) {
  const file = path.join(GAME, relative);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  return JSON.parse(raw.replace(/\/\/[^\n\r]*/g, '').replace(/,(\s*[}\]])/g, '$1'));
}

/**
 * A campaign mode's copy of a file, falling back to the base game's.
 *
 * This is how the game layers them: `modes/radiant/` holds only the files that
 * mode overrides, and everything it does not name is the root `campaign/` copy.
 * Stygian (`new_game_plus`) overrides neither of the two files read here, so it
 * levels heroes exactly like Darkest -- discovered, not assumed, because the
 * folder exists and could gain an override in a patch.
 */
function readModeJson(mode, relative) {
  return (mode === 'base' ? null : readGameJson(`modes/${mode}/${relative}`)) || readGameJson(relative);
}

/** Mode folder -> the difficulty name `saveParser` reads out of a save. */
const MODE_DIFFICULTY = { base: 'darkest', new_game_plus: 'stygian', radiant: 'radiant' };

const ROSTER_VARS = 'campaign/roster/roster.variables.json';
const QUEST_RESTRICTION = 'campaign/quest/quest.restriction.json';

/**
 * XP per resolve level, per mode, from the ROSTER's own table.
 *
 * **Not `progression.json`.** That file's `dungeon.level_threshold_table`
 * ([0, 2, 6, 10, 16, 22, 32, 42]) is the *dungeon* ladder, and this script read
 * it for months: eight entries for a hero who only has seven levels, each one
 * reached too early, so an imported save showed every hero above the level the
 * game showed -- a Resolve 2 hero read as 3 and walked into the Veteran band.
 * The hero table is `roster.variables.json`, seven entries for Resolve 0-6, and
 * Radiant really does level faster ([0,2,7,13,21,29,40] against [0,2,8,14,24,
 * 36,48]), so the mode a save was started in changes what its XP means.
 */
function readResolveThresholds(mode) {
  return readModeJson(mode, ROSTER_VARS)?.resolve_level_thresholds || null;
}

/**
 * The highest Resolve allowed on a quest of each dungeon level, per mode.
 *
 * The game's own restriction table, and the reason a levelled hero refuses a
 * low quest: index by dungeon level and Darkest caps Apprentice (1) at 2 and
 * Veteran (3) at 4, while Radiant relaxes both to 4 and 6. 99 is the game's way
 * of writing "no restriction", which is what Champion (5) has everywhere.
 *
 * The limit is a MAXIMUM, never a minimum: a recruit may walk into a Champion
 * dungeon and die there, which is why this is the boundary and not the
 * recommendation.
 */
function readQuestResolveCaps(mode) {
  const table = readModeJson(mode, QUEST_RESTRICTION)?.restriction?.difficulty
    ?.resolve_level_threshold_table;
  return Array.isArray(table) ? table : null;
}

/**
 * What going in under-levelled costs, by how many levels short you are.
 *
 * `shared/rules.json`, where the game calls it "effective difficulty": the
 * dungeon level minus the hero's resolve level. The starting stress is NOT the
 * flat 20-per-level the wiki rounds it to -- it is 0, 20, 30, 40, 50, 60, 70 --
 * and every level short also adds a quarter again to all stress taken.
 */
function readUnderLevelCosts() {
  const rules = readGameJson('shared/rules.json');
  const starting = rules?.effectiveDifficultyDungeonStartingStress;
  const taken = rules?.effectiveDifficultyStressDmgModifiers;
  return Array.isArray(starting) && Array.isArray(taken) ? { starting, stressTaken: taken } : null;
}

const byMode = (read) =>
  Object.fromEntries(
    Object.entries(MODE_DIFFICULTY).map(([mode, difficulty]) => [difficulty, read(mode)])
  );


// ===================================================================== write
const monsters = readMonsters(readMarkEffects());
const zones = readMashes();
const unknown = new Set();

/**
 * A zone whose mash tables do not describe how it actually works gets no
 * profile at all.
 *
 * The Darkest Dungeon ships one table with one enemy and the Farmstead two,
 * because neither place picks its fights this way -- both are scripted, and the
 * Farmstead's waves live in the endless-mode data. Emitting "The Darkest
 * Dungeon: average party size 1" would be a confident lie, and this app's rule
 * everywhere else is that silence beats a guess.
 */
const MIN_TABLES = 8;
const MIN_ENEMIES = 10;

const skipped = [];
const profiles = {};
Object.entries(zones).forEach(([zone, rows]) => {
  const summary = summarise(rows, monsters, unknown);
  if (!summary) return;
  if (summary.tables < MIN_TABLES || summary.enemies < MIN_ENEMIES) {
    skipped.push(`${zone} (${summary.tables} tables, ${summary.enemies} enemies)`);
    return;
  }
  ZONE_TO_LOCATION[zone].forEach((location) => {
    profiles[location] = { ...summary, zone };
  });
});

const thresholds = readResolveThresholds('base');
const questCaps = readQuestResolveCaps('base');
const thresholdsByMode = byMode(readResolveThresholds);
const capsByMode = byMode(readQuestResolveCaps);
const underLevel = readUnderLevelCosts();

console.log(`monsters ${Object.keys(monsters).length}`);
console.log(`zones    ${Object.keys(zones).length} -> ${Object.keys(profiles).length} locations`);
Object.entries(profiles).forEach(([name, p]) => {
  const mix = Object.entries(p.typeMix).slice(0, 2).map(([t, v]) => `${t} ${v}%`).join(' ');
  console.log(
    `  ${name.padEnd(24)} ${String(p.enemies).padStart(3)} enemies  party ${p.avgPartySize}` +
    `  stun/blight/bleed ${p.resist.stun}/${p.resist.blight}/${p.resist.bleed}%  ${mix}`
  );
});
if (skipped.length) {
  console.log(`\nno profile (their fights are scripted, not drawn from these tables):`);
  console.log('  ' + skipped.join(', '));
}
if (unknown.size) {
  console.log(`\n${unknown.size} enemy ids named by a table with no info file:`);
  console.log('  ' + [...unknown].sort().join(', '));
}
Object.entries(thresholdsByMode).forEach(([difficulty, table]) => {
  console.log(
    `${difficulty.padEnd(8)} resolve ${table ? table.join(', ') : 'NOT FOUND'}` +
    `  |  caps ${capsByMode[difficulty] ? capsByMode[difficulty].join(', ') : 'NOT FOUND'}`
  );
});
console.log(`under-level stress: ${underLevel ? underLevel.starting.join(', ') : 'NOT FOUND'}`);

const body = `/**
 * What you actually fight in each region, and the resolve level thresholds.
 *
 * GENERATED - do not hand-edit. \`scripts/importRegionProfiles.js\` rebuilds it
 * from a Darkest Dungeon install; nothing in \`src/\` needs the game.
 *
 * \`resist\` is the average of each enemy's resistance across the region's mash
 * tables, weighted by how often the table comes up, so a rare party cannot drag
 * the numbers. \`typeMix\` is the share of enemy bodies of each type, which is
 * what decides whether the Crusader's and Occultist's bonuses are live.
 * \`corpseRate\` is the share that leaves a body in the way.
 */

export const REGION_PROFILES = ${JSON.stringify(profiles, null, 2)};

/**
 * XP needed for each resolve level, 0-indexed. Lives in the game install, which
 * is why the save importer could only ever show raw XP.
 *
 * The roster's own table, not the dungeon ladder in \`progression.json\` - see
 * the script for the difference, and for what reading the wrong one did. This
 * is Darkest's; Radiant levels faster, so read \`RESOLVE_THRESHOLDS_BY_MODE\`
 * when you know which campaign the save is.
 */
export const RESOLVE_THRESHOLDS = ${JSON.stringify(thresholds)};

/** The same table per campaign mode, keyed as \`saveParser\` names them. */
export const RESOLVE_THRESHOLDS_BY_MODE = ${JSON.stringify(thresholdsByMode)};

/**
 * The highest Resolve the game lets on a quest, by dungeon level: Darkest caps
 * Apprentice (1) at 2 and Veteran (3) at 4, Radiant relaxes them to 4 and 6,
 * and 99 means no restriction at all. A MAXIMUM, not a band - the game stops a
 * levelled hero going down, never a recruit going up.
 */
export const QUEST_RESOLVE_CAPS = ${JSON.stringify(questCaps)};

/** The same caps per campaign mode. */
export const QUEST_RESOLVE_CAPS_BY_MODE = ${JSON.stringify(capsByMode)};

/**
 * What a hero pays for being under-levelled, indexed by how many levels short
 * of the dungeon they are: \`starting\` stress on entering, and \`stressTaken\`
 * as a share added to every stress hit after that.
 */
export const UNDER_LEVEL_COST = ${JSON.stringify(underLevel)};

/**
 * The resolve level a hero with this much XP has reached.
 *
 * \`difficulty\` is the campaign the save was started in (\`saveParser\` reads
 * it): the same XP is a different level in Radiant, which needs 7 for Resolve 2
 * where Darkest needs 8. Unknown modes fall back to Darkest rather than
 * guessing a table.
 */
export const resolveLevel = (xp, difficulty) => {
  if (typeof xp !== 'number' || Number.isNaN(xp)) return null;
  const thresholds = RESOLVE_THRESHOLDS_BY_MODE[difficulty] || RESOLVE_THRESHOLDS;
  let level = 0;
  thresholds.forEach((threshold, index) => {
    if (xp >= threshold) level = index;
  });
  return level;
};

export const getRegionProfile = (location) => REGION_PROFILES[location] || null;
`;

const enemiesBody = `/**
 * Every enemy the region tables can draw, with the stats the summary is built
 * from.
 *
 * GENERATED - do not hand-edit. \`scripts/importRegionProfiles.js\` writes it
 * beside \`regionProfiles.js\`.
 *
 * **Nothing in the app imports this, and that is deliberate.** It is provenance:
 * with these rows the region summary can be re-derived or re-weighted without
 * having the game installed, which is the same reason \`importModdedHeroes\`
 * keeps its manifest. Kept in its own file so it cannot be dragged into the
 * bundle behind \`REGION_PROFILES\`, which is imported.
 *
 * Resistances are the game's own percentages and they DO go above 100: a
 * skeleton ships \`bleed_resist 200%\`, which is why the Ruins average is over
 * 150 and why bleed comps are the wrong answer there.
 */

export const REGION_ENEMIES = ${JSON.stringify(monsters, null, 1)};
`;

if (CHECK) {
  // Line endings are normalised on both sides. Git checks these files out with
  // CRLF on Windows and this script writes LF, so a straight comparison says
  // DESACTUALIZADO on a tree where nothing has moved -- which is worse than
  // useless: it invites someone to "fix" it by committing whole-file churn.
  const lf = (text) => text.split('\r\n').join('\n');
  const read = (file) => (fs.existsSync(file) ? lf(fs.readFileSync(file, 'utf8')) : '');
  const fresh = read(OUT) === lf(body) && read(OUT_ENEMIES) === lf(enemiesBody);
  console.log(fresh ? 'al dia' : 'DESACTUALIZADO - rerun without --check');
  process.exit(fresh ? 0 : 1);
}

fs.writeFileSync(OUT, body);
fs.writeFileSync(OUT_ENEMIES, enemiesBody);
console.log(`wrote ${path.relative(ROOT, OUT)} and ${path.relative(ROOT, OUT_ENEMIES)}`);
