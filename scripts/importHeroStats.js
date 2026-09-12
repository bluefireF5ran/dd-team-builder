#!/usr/bin/env node
/**
 * Lo que un heroe ES, no lo que hace.
 *
 *   node scripts/importHeroStats.js --game "D:/…/common/DarkestDungeon"
 *   node scripts/importHeroStats.js --game … --workshop "D:/…/workshop/content/262060"
 *   node scripts/importHeroStats.js --game … --check     informe, no escribe
 *   node scripts/importHeroStats.js --game … --json      volcado para maquina
 *
 * Escribe `src/data/heroStats.js`.
 *
 * ## Por que faltaba
 *
 * La app sabia decir que un trinket da `+15% DODGE` y no sabia cuanta esquiva
 * tiene el heroe, asi que nunca podia enseñar el numero entre el que de verdad
 * eliges. `heroes.js` lleva skills, camp skills, arte y trinkets: ni una sola
 * estadistica. Esto lo lee de los mismos ficheros que el juego.
 *
 * ## De donde sale cada cosa
 *
 * Todo de `<hero>.info.darkest`, que es donde el juego lo lee:
 *
 * | dato | linea |
 * | --- | --- |
 * | HP, DODGE, PROT | `armour:` (`.hp`, `.def`, `.prot`) |
 * | DMG, CRIT | `weapon:` (`.dmg min max`, `.crit`) |
 * | SPD | la suma de `weapon.spd` + `armour.spd` |
 * | resistencias | `resistances:`, ocho, una sola linea |
 *
 * **Las cinco filas son el RANGO DEL EQUIPO, no el nivel de resolucion.** Es lo
 * que el fichero tiene -- `weapon_0`..`weapon_4` y lo mismo de armadura-- y son
 * dos cosas distintas aunque vayan juntas: la resolucion llega a 6 y el equipo
 * a 4, y subir de resolucion no sube el equipo, solo te deja pagarlo. Llamarlo
 * "nivel" aqui seria inventar una correspondencia que el fichero no afirma.
 *
 * **ACC no se emite.** `weapon.atk` es `0%` en las veinte clases: la progresion
 * de puntería vive en la skill (`.atk 85%` -> `105%`), no en el arma, y
 * `skillEffects.js` ya la lleva. Emitir un `acc: 0` invitaria a sumarlo.
 *
 * **Las resistencias son las de base y se emiten tal cual.** El juego las sube
 * con el nivel de resolucion, y ese incremento **no esta en ningun fichero** --
 * se ha buscado en `campaign/`, `shared/` y en todo el arbol. Vive en el motor.
 * Inventar aqui un +10% por nivel seria exactamente la clase de numero
 * confiado-y-equivocado que el resto de este repo se niega a escribir, asi que
 * se emite la base y el consumidor la etiqueta como tal.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const R = require('./lib/effectRender');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/heroStats.js');
const MANIFEST = path.join(ROOT, 'scripts/importModdedHeroes.manifest.json');
const EOL = '\n';

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const JSON_OUT = argv.includes('--json');
const GAME = opt('--game') || process.env.DD_GAME_DIR;
const WORKSHOP = opt('--workshop') || process.env.DD_WORKSHOP_DIR;

if (!GAME || !fs.existsSync(GAME)) {
  console.error('Falta --game <steamapps/common/DarkestDungeon>');
  process.exit(1);
}

// El juego escribe `.poison`; la app y el jugador dicen Blight.
const RESIST_KEYS = [
  ['stun', 'stun'], ['poison', 'blight'], ['bleed', 'bleed'], ['disease', 'disease'],
  ['move', 'move'], ['debuff', 'debuff'], ['death_blow', 'death'], ['trap', 'trap'],
];

const pct = (v) => {
  const n = R.num(String(v == null ? '' : v));
  return n === null ? null : n;
};

/** Las estadisticas que un `<hero>.info.darkest` declara, o null si no declara. */
function readStats(infoFile) {
  if (!fs.existsSync(infoFile)) return null;

  const res = R.readDarkest(infoFile, 'resistances')[0] || null;
  const weapons = R.readDarkest(infoFile, 'weapon');
  const armours = R.readDarkest(infoFile, 'armour');
  if (!weapons.length || !armours.length) return null;

  const resistances = {};
  if (res) {
    for (const [from, to] of RESIST_KEYS) {
      const v = pct(res[from]);
      if (v !== null) resistances[to] = v;
    }
  }

  // Se emparejan por posicion, que es como el juego las sube: arma 2 con
  // armadura 2. Si un mod trae distinto numero de filas, manda la mas corta --
  // una fila a medias describiria un heroe que no existe.
  const rows = Math.min(weapons.length, armours.length);
  const gear = [];
  for (let i = 0; i < rows; i += 1) {
    const w = weapons[i];
    const a = armours[i];
    const dmg = [].concat(w.dmg || []);
    gear.push({
      hp: pct(a.hp),
      dodge: pct(a.def),
      prot: pct(a.prot),
      // La velocidad es la suma de las dos piezas: ninguna de las dos es "la"
      // velocidad del heroe por si sola.
      spd: (pct(w.spd) || 0) + (pct(a.spd) || 0),
      crit: pct(w.crit),
      dmgMin: pct(dmg[0]),
      dmgMax: pct(dmg[1]),
    });
  }
  return { resistances, gear };
}

// ===================================================== vanilla

const heroesModule = loadEsm(path.join(ROOT, 'src/data/heroes.js'), {
  HERO_SPECIFIC_TRINKETS: loadEsm(path.join(ROOT, 'src/data/hero_specific_trinkets.js')).HERO_SPECIFIC_TRINKETS,
});
const VANILLA_CLASSES = Object.keys(heroesModule.HERO_CLASSES);

/**
 * Donde vive cada `<hero>.info.darkest` del juego, por id de carpeta.
 * Se barre `heroes/` y `dlc/` porque las cinco clases de DLC (Musketeer,
 * Flagellant, Shieldbreaker, Duelist, Runaway) no estan en la primera.
 */
const infoByHeroId = new Map();
for (const dir of ['heroes', 'dlc']) {
  R.walk(path.join(GAME, dir), (p) => {
    const m = /([^/\\]+)\.info\.darkest$/.exec(p);
    if (m && /[/\\]heroes[/\\]/.test(p) && !infoByHeroId.has(m[1])) infoByHeroId.set(m[1], p);
  });
}

/** `Man-at-Arms` -> `man_at_arms`, que es como se llama la carpeta. */
const folderId = (cls) => cls.toLowerCase().replace(/[^a-z0-9]+/g, '_');

const vanilla = {};
const missingVanilla = [];
for (const cls of VANILLA_CLASSES) {
  const file = infoByHeroId.get(folderId(cls));
  const stats = file && readStats(file);
  if (!stats) { missingVanilla.push(cls); continue; }
  vanilla[cls] = stats;
}

// ===================================================== modded

const modded = {};
const moddedReport = { covered: [], notInstalled: [], noStats: [] };

if (WORKSHOP && fs.existsSync(WORKSHOP)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const appClasses = new Set(Object.keys(
    loadEsm(path.join(ROOT, 'src/data/modded_heroes.js')).MODDED_HERO_CLASSES || {}
  ));
  const installed = new Set(
    fs.readdirSync(WORKSHOP, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  );

  for (const [cls, entry] of Object.entries(manifest)) {
    if (!appClasses.has(cls)) continue;
    const modId = String(entry.modId || '');
    if (!installed.has(modId)) { moddedReport.notInstalled.push(cls); continue; }
    const file = path.join(WORKSHOP, modId, 'heroes', entry.heroId, entry.heroId + '.info.darkest');
    const stats = readStats(file);
    if (!stats || !stats.gear.length) { moddedReport.noStats.push(cls); continue; }
    modded[cls] = stats;
    moddedReport.covered.push(cls);
  }
}

// Lo que ya habia, para no borrar una clase cuyo mod no esta instalado hoy.
// Misma regla que `importModdedEffects.js`, y por el mismo motivo.
let carried = 0;
if (fs.existsSync(OUT)) {
  try {
    const prev = loadEsm(OUT).MODDED_HERO_STATS || {};
    const unverifiable = new Set([...moddedReport.notInstalled, ...moddedReport.noStats]);
    for (const [cls, stats] of Object.entries(prev)) {
      if (!modded[cls] && unverifiable.has(cls)) { modded[cls] = stats; carried += 1; }
    }
  } catch (e) { /* la pasada anterior no se puede leer: se reescribe entera */ }
}

// ===================================================== salida

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const numOrNull = (v) => (v === null || v === undefined ? 'null' : String(v));

const gearLine = (g) => `{ hp: ${numOrNull(g.hp)}, dodge: ${numOrNull(g.dodge)}, prot: ${numOrNull(g.prot)}, `
  + `spd: ${numOrNull(g.spd)}, crit: ${numOrNull(g.crit)}, dmgMin: ${numOrNull(g.dmgMin)}, dmgMax: ${numOrNull(g.dmgMax)} }`;

const resistLine = (r) => '{ '
  + RESIST_KEYS.map(([, to]) => to).filter((k) => r[k] !== undefined)
    .map((k) => `${k}: ${r[k]}`).join(', ')
  + ' }';

const block = (name, store) => {
  const out = [`export const ${name} = {`];
  for (const cls of Object.keys(store).sort((a, b) => a.localeCompare(b))) {
    const s = store[cls];
    out.push(`  ${q(cls)}: {`);
    out.push(`    resistances: ${resistLine(s.resistances)},`);
    out.push('    gear: [');
    for (const g of s.gear) out.push(`      ${gearLine(g)},`);
    out.push('    ],');
    out.push('  },');
  }
  out.push('};');
  return out.join(EOL);
};

const lines = [];
lines.push('/**');
lines.push(' * GENERADO - no editar a mano. Lo reescribe:');
lines.push(' *   node scripts/importHeroStats.js --game <DarkestDungeon> [--workshop <262060>]');
lines.push(' *');
lines.push(' * Lo que un heroe ES: vida, esquiva, armadura, velocidad, critico y daño por');
lines.push(' * rango de equipo, mas sus ocho resistencias. Leido de `<hero>.info.darkest`,');
lines.push(' * que es de donde lo lee el juego.');
lines.push(' *');
lines.push(' * `gear` va indexado por RANGO DE EQUIPO (0..4), que no es el nivel de');
lines.push(' * resolucion: la resolucion llega a 6, el equipo a 4, y subir de resolucion no');
lines.push(' * sube el equipo, solo permite pagarlo.');
lines.push(' *');
lines.push(' * `resistances` son las de BASE. El juego las sube con la resolucion y ese');
lines.push(' * incremento no esta en ningun fichero del juego, asi que no se inventa aqui.');
lines.push(' *');
lines.push(' * No hay ACC: `weapon.atk` es 0% en las veinte clases y la puntería vive en la');
lines.push(' * skill, donde `skillEffects.js` ya la lleva.');
lines.push(' */');
lines.push('');
lines.push('/** Las veinte clases del juego base y sus DLC. */');
lines.push(block('HERO_STATS', vanilla));
lines.push('');
lines.push('/** Las modded que el workshop instalado dejo leer. Crece al instalar mas. */');
lines.push(block('MODDED_HERO_STATS', modded));
lines.push('');
lines.push('/** El rango de equipo mas alto que los ficheros describen. */');
lines.push('export const MAX_GEAR_RANK = 4;');
lines.push('');
lines.push('/**');
lines.push(' * Las estadisticas de una clase, vanilla o modded, o null.');
lines.push(' *');
lines.push(' * Null y no un objeto a cero: una clase modded sin datos es una que NO SE SABE,');
lines.push(' * y dibujar ceros diria que el heroe no tiene vida.');
lines.push(' */');
lines.push('export const getHeroStats = (heroClass) =>');
lines.push('  (heroClass && (HERO_STATS[heroClass] || MODDED_HERO_STATS[heroClass])) || null;');
lines.push('');
lines.push('/**');
lines.push(' * Las estadisticas de una clase a un rango de equipo, o null.');
lines.push(' *');
lines.push(' * El rango se recorta al ultimo que la clase describe en vez de fallar: un mod');
lines.push(' * puede traer menos de cinco filas, y ahi la ultima es su tope real.');
lines.push(' */');
lines.push('export const getGearStats = (heroClass, rank = MAX_GEAR_RANK) => {');
lines.push('  const stats = getHeroStats(heroClass);');
lines.push('  if (!stats || !stats.gear.length) return null;');
lines.push('  const i = Math.max(0, Math.min(Number(rank) || 0, stats.gear.length - 1));');
lines.push('  return stats.gear[i];');
lines.push('};');
lines.push('');

const text = lines.join(EOL);

if (JSON_OUT) {
  console.log(JSON.stringify({ vanilla, modded, missingVanilla, moddedReport }, null, 2));
  process.exit(0);
}

console.log('');
console.log(`clases vanilla ${Object.keys(vanilla).length} de ${VANILLA_CLASSES.length}`);
if (missingVanilla.length) console.log('  SIN DATOS: ' + missingVanilla.join(', '));
console.log(`clases modded ${Object.keys(modded).length}` + (carried ? ` (${carried} arrastradas)` : ''));
if (moddedReport.notInstalled.length) console.log(`  mod no instalado ${moddedReport.notInstalled.length}`);
if (moddedReport.noStats.length) {
  console.log(`  instalado pero sin weapon/armour ${moddedReport.noStats.length}`);
  console.log('    ' + moddedReport.noStats.slice(0, 10).join(', '));
}

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const same = current.replace(/\r\n/g, '\n') === text;
  console.log(same ? 'AL DIA' : 'DESACTUALIZADO - corre sin --check para reescribir');
  process.exit(same ? 0 : 1);
}

fs.writeFileSync(OUT, text, 'utf8');
console.log(`escrito ${path.relative(ROOT, OUT)}`);
