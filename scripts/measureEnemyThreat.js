#!/usr/bin/env node
/**
 * Measure what a champion party is hit by, for `src/data/enemyThreat.js`.
 *
 *   node scripts/measureEnemyThreat.js --game "<…/common/DarkestDungeon>"
 *
 * Every damaging skill of every enemy a champion mash table can throw, with the
 * accuracy it rolls and the damage it deals. An enemy's appearances are spread
 * over its own kit, since a monster with four attacks throws each about a
 * quarter of the time, and the four main regions count fully while everywhere
 * else counts a fifth - the same weighting as the resists and the dodge bar.
 *
 * This is what makes "is DODGE worth it on this hero" answerable without a list
 * of which classes are dodge tanks: a point of DODGE is worth the share of the
 * incoming damage it removes, and that depends on what is swinging.
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

const attacksOf = new Map();
all
  .filter((f) => f.endsWith('.info.darkest') && /\/monsters\//.test(f))
  .forEach((file) => {
    const id = path.basename(file, '.info.darkest');
    if (attacksOf.has(id)) return;
    const attacks = [];
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      if (!line.startsWith('skill:')) return;
      const acc = line.match(/[.]atk\s+(-?[0-9.]+)%/);
      const dmg = line.match(/[.]dmg\s+(-?[0-9.]+)\s+(-?[0-9.]+)/);
      // `.atk 0%` with no damage is the game's way of saying "no attack roll".
      if (!acc || !dmg || Number(dmg[2]) <= 0) return;
      attacks.push({ acc: Number(acc[1]), min: Number(dmg[1]), max: Number(dmg[2]) });
    });
    if (attacks.length) attacksOf.set(id, attacks);
  });

/**
 * And the champion's own defensive line, which is what a DEBUFF works against.
 * `.def` is DODGE in points, `.prot` a 0-1 fraction, `.spd` points of speed.
 */
const statOf = new Map();
all
  .filter((f) => f.endsWith('.info.darkest') && /\/monsters\//.test(f))
  .forEach((file) => {
    const id = path.basename(file, '.info.darkest');
    if (statOf.has(id)) return;
    const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.trimStart().startsWith('stats:'));
    if (!line) return;
    const dodge = line.match(/[.]def\s+(-?[0-9.]+)%/);
    const prot = line.match(/[.]prot\s+(-?[0-9.]+)/);
    const spd = line.match(/[.]spd\s+(-?[0-9.]+)/);
    statOf.set(id, {
      dodge: dodge ? Number(dodge[1]) : null,
      prot: prot ? Number(prot[1]) * 100 : null,
      spd: spd ? Number(spd[1]) : null,
    });
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
  const attacks = attacksOf.get(id);
  if (!attacks) return;
  attacks.forEach((attack) => rows.push({ weight: weight / attacks.length, ...attack }));
});
if (!rows.length) {
  console.error('No champion attacks matched - is this the game install?');
  process.exit(1);
}

const total = rows.reduce((t, r) => t + r.weight, 0);
const mid = (r) => (r.min + r.max) / 2;
const deciles = (pick) => {
  const sorted = [...rows].sort((a, b) => pick(a) - pick(b));
  const out = [];
  for (let i = 0; i < 10; i += 1) {
    const quantile = (i + 0.5) / 10;
    let acc = 0;
    for (const row of sorted) {
      acc += row.weight;
      if (acc >= total * quantile) {
        out.push(pick(row));
        break;
      }
    }
  }
  return out;
};

const accDeciles = deciles((r) => r.acc);
const meanDamage = rows.reduce((t, r) => t + r.weight * mid(r), 0) / total;

const hitAt = (acc, dodge) => {
  const shown = acc + 5 - dodge;
  return shown >= 95 ? 1 : Math.max(0.05, Math.min(1, shown / 100));
};
const hitFull = (dodge) => rows.reduce((t, r) => t + r.weight * hitAt(r.acc, dodge), 0) / total;
const hitDec = (dodge) => accDeciles.reduce((t, acc) => t + hitAt(acc, dodge), 0) / accDeciles.length;

console.log(rows.length + ' champion attacks from ' + seen.size + ' enemies\n');
console.log('export const CHAMPION_ATTACK_ACC = [' + accDeciles.join(', ') + '];');
console.log('export const CHAMPION_ATTACK_DAMAGE = ' + meanDamage.toFixed(1) + ';\n');
console.log('hit rate against a hero at that DODGE, full population vs these deciles:');
[0, 20, 40, 60, 80, 100].forEach((dodge) => {
  console.log('  DODGE ' + String(dodge).padStart(3) + '   ' +
    (hitFull(dodge) * 100).toFixed(1).padStart(5) + '%  vs  ' + (hitDec(dodge) * 100).toFixed(1).padStart(5) + '%');
});

// ============================================================ the defensive line
// One row per ENEMY here, not per attack: a debuff is put on the monster, so it
// is the monster that should be weighted by how often a mash row lists it.
const defenders = [];
seen.forEach((weight, id) => {
  const stats = statOf.get(id);
  if (stats) defenders.push({ weight, ...stats });
});
const defTotal = defenders.reduce((t, r) => t + r.weight, 0);
const defDeciles = (key) => {
  const vals = defenders.filter((r) => typeof r[key] === 'number').sort((a, b) => a[key] - b[key]);
  const tot = vals.reduce((t, r) => t + r.weight, 0);
  const out = [];
  for (let i = 0; i < 10; i += 1) {
    let acc = 0;
    for (const row of vals) {
      acc += row.weight;
      if (acc >= tot * ((i + 0.5) / 10)) {
        out.push(Number(row[key].toFixed(2)));
        break;
      }
    }
  }
  return out;
};
const defMean = (key) => {
  const vals = defenders.filter((r) => typeof r[key] === 'number');
  return vals.reduce((t, r) => t + r.weight * r[key], 0) / vals.reduce((t, r) => t + r.weight, 0);
};

console.log('');
console.log(defenders.length + ' champion enemies on the receiving end of a debuff\n');
console.log('export const CHAMPION_DODGE = ' + defMean('dodge').toFixed(1) + ';');
console.log('export const CHAMPION_PROT_DECILES = [' + defDeciles('prot').join(', ') + '];');
console.log('export const CHAMPION_SPD_DECILES = [' + defDeciles('spd').join(', ') + '];\n');
const armoured = defenders.filter((r) => r.prot > 0);
const armouredW = armoured.reduce((t, r) => t + r.weight, 0);
console.log('PROT is the situational one: ' + armoured.length + ' of ' + defenders.length +
  ' enemies carry any, ' + (100 * armouredW / defTotal).toFixed(1) + '% of weighted appearances, mean ' +
  (armoured.reduce((t, r) => t + r.weight * r.prot, 0) / armouredW).toFixed(1) + '% where present.');
console.log('mean SPD ' + defMean('spd').toFixed(1) + ', mean DODGE ' + defMean('dodge').toFixed(1) + '.');
