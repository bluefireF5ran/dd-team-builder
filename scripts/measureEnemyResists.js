#!/usr/bin/env node
/**
 * Measure what a champion party's effects have to beat, for
 * `src/data/enemyResists.js`.
 *
 *   node scripts/measureEnemyResists.js --game "<…/common/DarkestDungeon>"
 *   node scripts/measureEnemyResists.js --game … --check   (report, compare, write nothing)
 *
 * Reads the champion mash tables - `<zone>.5.mash.darkest`, and the Darkest
 * Dungeon's `.6` - for the enemies a maximum-level party actually meets, then
 * each of those monsters' own `stats:` line for its resistances. Enemies are
 * weighted by how often a mash row lists them, and the four main regions count
 * fully while everywhere else counts a fifth: the same weighting the dodge-tank
 * bar was measured with, and Fran's own instruction for the bars.
 *
 * Prints the deciles to paste into `CHAMPION_RESIST_DECILES`, with the check
 * that they answer the same as the full population.
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opt = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const GAME = opt('--game') || process.env.DD_GAME_DIR;
if (!GAME || !fs.existsSync(GAME)) {
  console.error('Need the Darkest Dungeon install: --game "<…/common/DarkestDungeon>"');
  process.exit(1);
}

const KEYS = {
  blight: 'poison_resist',
  debuff: 'debuff_resist',
  stun: 'stun_resist',
  bleed: 'bleed_resist',
  move: 'move_resist',
};
/** The regions a campaign spends its time in; the rest count a fifth. */
const MAIN = ['crypts', 'warrens', 'weald', 'cove'];
const OTHER_WEIGHT = 0.2;

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full.split(path.sep).join('/'));
  });
  return out;
};
const all = walk(GAME);

// Every monster's resistances, by the id a mash row names (variant included:
// `swinetaur_C` is the champion swinetaur, and the champion is the point).
const resistOf = new Map();
all
  .filter((f) => f.endsWith('.info.darkest') && /\/monsters\//.test(f))
  .forEach((file) => {
    const id = path.basename(file, '.info.darkest');
    if (resistOf.has(id)) return;
    const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.trimStart().startsWith('stats:'));
    if (!line) return;
    const row = {};
    Object.entries(KEYS).forEach(([kind, key]) => {
      const match = line.match(new RegExp('[.]' + key + '\\s+(-?[0-9.]+)%'));
      row[kind] = match ? Number(match[1]) : null;
    });
    resistOf.set(id, row);
  });

const weightFor = (file) =>
  (MAIN.some((region) => path.basename(file).startsWith(region + '.')) ? 1 : OTHER_WEIGHT);

const seen = new Map();
all.filter((f) => /\.(5|6)\.mash\.darkest$/.test(f)).forEach((file) => {
  const weight = weightFor(file);
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const types = line.match(/\.types\s+(.+)$/);
    if (!types) return;
    types[1].trim().split(/\s+/).forEach((id) => {
      if (/^[a-z0-9_]+_[A-D]$/i.test(id)) seen.set(id, (seen.get(id) || 0) + weight);
    });
  });
});

const rows = [];
seen.forEach((weight, id) => {
  const resists = resistOf.get(id);
  if (resists) rows.push({ id, weight, ...resists });
});
if (!rows.length) {
  console.error('No champion enemies matched - is this the game install?');
  process.exit(1);
}

const deciles = {};
Object.keys(KEYS).forEach((kind) => {
  const vals = rows.filter((r) => typeof r[kind] === 'number').sort((a, b) => a[kind] - b[kind]);
  const total = vals.reduce((t, r) => t + r.weight, 0);
  const out = [];
  for (let i = 0; i < 10; i += 1) {
    const quantile = (i + 0.5) / 10;
    let acc = 0;
    for (const row of vals) {
      acc += row.weight;
      if (acc >= total * quantile) {
        out.push(row[kind]);
        break;
      }
    }
  }
  deciles[kind] = out;
});

const apply = (chance, resist) => Math.max(0, Math.min(1, (chance - resist) / 100));
const landFull = (kind, chance) => {
  const vals = rows.filter((r) => typeof r[kind] === 'number');
  const total = vals.reduce((t, r) => t + r.weight, 0);
  return vals.reduce((t, r) => t + r.weight * apply(chance, r[kind]), 0) / total;
};
const landDeciles = (kind, chance) =>
  deciles[kind].reduce((t, r) => t + apply(chance, r), 0) / deciles[kind].length;

console.log(rows.length + ' champion enemies, ' +
  [...seen.values()].reduce((a, b) => a + b, 0).toFixed(0) + ' weighted appearances\n');
console.log('export const CHAMPION_RESIST_DECILES = {');
Object.entries(deciles).forEach(([kind, list]) => console.log('  ' + kind + ': [' + list.join(', ') + '],'));
console.log('};\n');
console.log('landing rate at a given chance, full population vs these deciles:');
Object.keys(KEYS).forEach((kind) => {
  const at = [140, 155, 175, 195]
    .map((c) => c + '%: ' + (landFull(kind, c) * 100).toFixed(1) + '/' + (landDeciles(kind, c) * 100).toFixed(1))
    .join('   ');
  console.log('  ' + kind.padEnd(7) + at);
});
