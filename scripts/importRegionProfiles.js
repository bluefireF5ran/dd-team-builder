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
      text.split(/\r?\n/).forEach((line) => {
        if (!line.trimStart().startsWith('skill:')) return;
        const named = line.match(/\.effect\s+((?:"[^"]*"\s*)+)/);
        if (!named) return;
        (named[1].match(/"([^"]*)"/g) || []).forEach((quoted) =>
          effects.push(quoted.slice(1, -1))
        );
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
        marksHeroes: effects.some((name) => markEffects.applies.has(name))
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

      (zones[zone] ??= []);
      lines(file).forEach((line) => {
        const m = line.match(/^\s*(hall|room):\s*\.chance\s+(\d+)\s+\.types\s+(.+?)\s*$/);
        if (!m) return;
        zones[zone].push({
          kind: m[1],
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
function readResolveThresholds() {
  const file = path.join(GAME, 'campaign/progression/progression.json');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const json = JSON.parse(raw.replace(/\/\/[^\n\r]*/g, '').replace(/,(\s*[}\]])/g, '$1'));
  return json?.dungeon?.level_threshold_table || null;
}

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

const thresholds = readResolveThresholds();

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
console.log(`resolve thresholds: ${thresholds ? thresholds.join(', ') : 'NOT FOUND'}`);

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
 */
export const RESOLVE_THRESHOLDS = ${JSON.stringify(thresholds)};

/** The resolve level a hero with this much XP has reached. */
export const resolveLevel = (xp) => {
  if (typeof xp !== 'number' || Number.isNaN(xp)) return null;
  let level = 0;
  RESOLVE_THRESHOLDS.forEach((threshold, index) => {
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
  const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
  const fresh = read(OUT) === body && read(OUT_ENEMIES) === enemiesBody;
  console.log(fresh ? 'al dia' : 'DESACTUALIZADO - rerun without --check');
  process.exit(fresh ? 0 : 1);
}

fs.writeFileSync(OUT, body);
fs.writeFileSync(OUT_ENEMIES, enemiesBody);
console.log(`wrote ${path.relative(ROOT, OUT)} and ${path.relative(ROOT, OUT_ENEMIES)}`);
