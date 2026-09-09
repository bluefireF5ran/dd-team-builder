// Recalcula los best-in-slot y dice que se ha movido.
//
//   node scripts/reportBis.js            que ha cambiado desde la ultima foto
//   node scripts/reportBis.js --all      la tabla entera, 4 rangos por clase
//   node scripts/reportBis.js --thin     solo las celdas con pocas muestras
//   node scripts/reportBis.js --save     guarda la foto nueva como referencia
//   node scripts/reportBis.js --modded   incluye tambien los heroes de mods
//   node scripts/reportBis.js --json     volcado legible por maquina
//
// No hay nada que "regenerar": `src/data/bisIndex.js` no es un fichero de datos,
// deriva la respuesta en caliente de la libreria de comps + modelUsage.json + la
// legalidad de rango. O sea que cada comp que entra puede mover un BIS sin que
// nadie toque una linea, y eso es justo lo que aqui se ve: la foto anterior
// contra la de ahora.
const fs = require('fs');
const path = require('path');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.join(__dirname, '..');
const SNAPSHOT = path.join(__dirname, 'bis.snapshot.json');
const SNAPSHOT_MODDED = path.join(__dirname, 'bis.snapshot.modded.json');
const EOL = String.fromCharCode(10);

const { bisLoadout, MIN_LIBRARY_SAMPLES } = loadEsm(path.join(ROOT, 'src', 'data', 'bisIndex.js'));
const { HERO_CLASSES } = loadEsm(path.join(ROOT, 'src', 'data', 'heroes.js'));
const { MODDED_HERO_CLASSES } = loadEsm(path.join(ROOT, 'src', 'data', 'modded_heroes.js'));

const RANKS = [1, 2, 3, 4];

// Vanilla por defecto. Los modded son cientos, ninguno tiene muestras en la
// libreria y sus datos de rango vienen del mod, asi que meterlos aqui entierra
// las 80 celdas que de verdad se leen bajo 2.500 que no dicen nada. `--modded`
// para cuando la pregunta sea justo sobre ellos.
const withModded = process.argv.slice(2).includes('--modded');
const classes = [
  ...Object.keys(HERO_CLASSES),
  ...(withModded ? Object.keys(MODDED_HERO_CLASSES) : [])
].sort();

/** Una celda es una clase EN UN RANGO: 20 clases x 4 = las 80 de las que habla bisIndex. */
const sweep = () => {
  const cells = {};
  classes.forEach((heroClass) => {
    RANKS.forEach((rank) => {
      const build = bisLoadout(heroClass, rank);
      if (!build) return;
      cells[`${heroClass}|${rank}`] = {
        heroClass,
        rank,
        skills: build.activeSkills,
        camp: build.activeCampSkills,
        trinkets: [build.trinket1, build.trinket2].filter(Boolean),
        source: build.source,
        samples: build.samples,
        rankLegal: build.rankLegal
      };
    });
  });
  return cells;
};

const snapshotFile = () => (withModded ? SNAPSHOT_MODDED : SNAPSHOT);

const readSnapshot = () => {
  if (!fs.existsSync(snapshotFile())) return null;
  try {
    return JSON.parse(fs.readFileSync(snapshotFile(), 'utf8')).cells || null;
  } catch (err) {
    console.log(`No se pudo leer la foto anterior (${err.message}); se trata como si no hubiera.`);
    return null;
  }
};

const line = (cell) =>
  `  ${cell.heroClass.padEnd(16)} r${cell.rank}  ${String(cell.source).padEnd(8)}` +
  ` n=${String(cell.samples).padEnd(4)}${cell.rankLegal ? '   ' : ' !!'} ${cell.skills.join(', ')}`;

const listChanged = (before, after) => {
  const changed = [];
  Object.keys(after).forEach((key) => {
    const now = after[key];
    const then = before[key];
    if (!then) {
      changed.push({ key, kind: 'NUEVA', now, then: null });
      return;
    }
    const moved =
      then.skills.join(',') !== now.skills.join(',') ||
      then.camp.join(',') !== now.camp.join(',') ||
      then.trinkets.join(',') !== now.trinkets.join(',');
    if (moved) changed.push({ key, kind: 'CAMBIA', now, then });
  });
  Object.keys(before).forEach((key) => {
    if (!after[key]) changed.push({ key, kind: 'SE VA', now: null, then: before[key] });
  });
  return changed;
};

const summarise = (cells) => {
  const all = Object.values(cells);
  const bySource = {};
  all.forEach((c) => { bySource[c.source] = (bySource[c.source] || 0) + 1; });
  const thin = all.filter((c) => c.samples < MIN_LIBRARY_SAMPLES);
  const illegal = all.filter((c) => !c.rankLegal);
  return { all, bySource, thin, illegal };
};

const args = process.argv.slice(2);
const after = sweep();
const { all, bySource, thin, illegal } = summarise(after);

if (args.includes('--json')) {
  console.log(JSON.stringify({ cells: after }, null, 2));
  process.exit(0);
}

if (args.includes('--all')) {
  console.log('=== TABLA COMPLETA ===');
  all.forEach((cell) => console.log(line(cell)));
  console.log('');
}

if (args.includes('--thin')) {
  console.log(`=== CELDAS FLACAS (menos de ${MIN_LIBRARY_SAMPLES} muestras en la libreria) ===`);
  console.log('Estas no salen de comps de verdad: las cubre modelUsage o las reglas.');
  thin.forEach((cell) => console.log(line(cell)));
  console.log('');
}

const before = readSnapshot();
if (!before) {
  console.log('No hay foto anterior con la que comparar. Se guarda esta como referencia.');
} else if (!args.includes('--all') && !args.includes('--thin')) {
  const changed = listChanged(before, after);
  console.log(`=== CAMBIOS DESDE LA ULTIMA FOTO (${changed.length}) ===`);
  if (!changed.length) {
    console.log('  Ninguno: las comps nuevas no han movido ningun best-in-slot.');
  }
  changed.forEach((c) => {
    const cell = c.now || c.then;
    console.log(`  [${c.kind}] ${cell.heroClass} r${cell.rank}`);
    if (c.then) console.log(`      antes:  ${c.then.skills.join(', ')}`);
    if (c.now) console.log(`      ahora:  ${c.now.skills.join(', ')}`);
    if (c.then && c.now && c.then.samples !== c.now.samples) {
      console.log(`      muestras: ${c.then.samples} -> ${c.now.samples}`);
    }
  });
  console.log('');
}

console.log('=== RESUMEN ===');
console.log(`  celdas: ${all.length}  (${classes.length} clases x ${RANKS.length} rangos)`);
console.log(`  por fuente: ${Object.entries(bySource).map(([k, v]) => `${k}=${v}`).join('  ')}`);
console.log(`  con menos de ${MIN_LIBRARY_SAMPLES} muestras: ${thin.length}`);
console.log(`  sin 3 de 4 skills lanzables desde su rango: ${illegal.length}`);

if (args.includes('--save') || !before) {
  fs.writeFileSync(
    snapshotFile(),
    JSON.stringify({ takenAt: new Date().toISOString(), cells: after }, null, 2) + EOL,
    'utf8'
  );
  console.log('');
  console.log(`Foto guardada en ${path.relative(ROOT, snapshotFile())}`);
}
