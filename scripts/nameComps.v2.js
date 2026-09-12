#!/usr/bin/env node
/**
 * Propone nombres por EJES para src/data/presetComps.
 *
 *   node scripts/nameComps.v2.js            informe completo
 *   node scripts/nameComps.v2.js --changed  solo las que cambiarian de nombre
 *   node scripts/nameComps.v2.js --axes     el reparto de cada eje en la libreria
 *   node scripts/nameComps.v2.js --shared   los nombres que llevan 2+ comps
 *   node scripts/nameComps.v2.js --json     volcado legible por maquina
 *   node scripts/nameComps.v2.js --apply    reescribe teamName, renombra y
 *                                           regenera el index
 *   node scripts/nameComps.v2.js --undo     deshace el ultimo --apply
 *
 * La logica vive en `src/utils/compNaming2.js`, la medida en
 * `src/utils/compProfile.js` y el vocabulario en `src/data/compAxes.js`; aqui
 * solo hay entrada y salida.
 *
 * ## El fichero NO se llama como la comp
 *
 * Y esa es la diferencia de fondo con `nameComps.js`. Aqui el nombre es
 * compartido a proposito -- 100 de los 239 los llevan dos comps o mas-- asi que
 * no puede ser tambien el identificador: si el fichero siguiera al nombre
 * volverian los `... 2`, que es justo el sintoma que se venia a quitar.
 *
 * El fichero se llama por el REPARTO, que ya era la definicion de identidad del
 * proyecto (`compIdentity.js`) y es unico para 431 de las 460. Para el resto hay
 * una escalera: se añade el orden de rangos, luego la region, luego el
 * campamento -- cada peldaño es el siguiente hecho que de verdad las separa.
 * Lo que quede sin separar despues de todo eso son dos comps casi identicas, y
 * el informe las canta en vez de taparlas con un numero.
 *
 * Ventaja lateral: renombrar el plan ya no mueve el fichero. Cambiar el
 * vocabulario deja de ser un rename de 460 ficheros en el historial de git.
 */
const fs = require('fs');
const path = require('path');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.join(__dirname, '..');
const COMPS_DIR = path.join(ROOT, 'src', 'data', 'presetComps');
const EOL = String.fromCharCode(10);

const { buildNamer, compFileRungs } = loadEsm(path.join(ROOT, 'src', 'utils', 'compNaming2.js'));
const { HERO_TOKENS } = loadEsm(path.join(ROOT, 'src', 'data', 'compTaxonomy.js'));
const { PURPOSE_CAMP } = loadEsm(path.join(ROOT, 'src', 'data', 'compAxes.js'));

const MANIFEST = path.join(ROOT, 'scripts', 'nameComps.v2.manifest.json');
const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);

/** Reparte un nombre de fichero unico a cada comp, y dice quien no se dejo separar. */
const assignFiles = (list) => {
  const counts = [{}, {}, {}, {}];
  list.forEach((rec) => compFileRungs(rec.comp, rec.name)
    .forEach((r, i) => { counts[i][r] = (counts[i][r] || 0) + 1; }));
  list.forEach((rec) => {
    const rungs = compFileRungs(rec.comp, rec.name);
    const base = rungs.find((r, i) => counts[i][r] === 1);
    rec.base = base || rungs[rungs.length - 1];
    rec.rung = rungs.indexOf(rec.base);
    rec.stubborn = !base;
  });

  const taken = new Map();
  // El sufijo numerico solo cae entre comps que ya no se diferencian en nada
  // que un nombre pueda decir, y ahi el reparto es arbitrario: se queda quien
  // YA estaba. Sin esta primera vuelta las dos se van pasando el `_2` en cada
  // --apply, y el renombrado no converge nunca.
  list.forEach((rec) => {
    const mine = new RegExp("^" + rec.base + "(_[0-9]+)?[.]json$").test(rec.file);
    if (mine && !taken.has(rec.file)) {
      taken.set(rec.file, rec);
      rec.target = rec.file;
    }
  });

  list.filter((rec) => !rec.target).forEach((rec) => {
    let name = `${rec.base}.json`;
    let n = 2;
    while (taken.has(name)) { name = `${rec.base}_${n}.json`; n += 1; }
    taken.set(name, rec);
    rec.target = name;
  });

  return { stubborn: list.filter((rec) => rec.stubborn) };
};

// --undo va antes de leer nada: restaura el estado previo sin consultar la
// libreria, que es justo lo que hace falta si el --apply dejo algo torcido.
if (has('--undo')) {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`No hay ${path.relative(ROOT, MANIFEST)}: nada que deshacer.`);
    process.exit(1);
  }
  const saved = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  let back = 0;
  for (const row of saved.moves) {
    const now = path.join(COMPS_DIR, row.to);
    if (!fs.existsSync(now)) continue;
    const body = JSON.parse(fs.readFileSync(now, 'utf8'));
    body.teamName = row.wasName;
    const text = JSON.stringify(body, null, 2) + (row.hadEol === false ? '' : EOL);
    fs.writeFileSync(path.join(COMPS_DIR, row.from), text);
    if (row.to !== row.from) fs.unlinkSync(now);
    back += 1;
  }
  fs.unlinkSync(MANIFEST);
  console.log(`Restauradas ${back} de ${saved.moves.length} comps. Regenera el index:`);
  console.log('  node scripts/generatePresetCompsIndex.js');
  process.exit(0);
}

const comps = fs
  .readdirSync(COMPS_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => ({ file, ...JSON.parse(fs.readFileSync(path.join(COMPS_DIR, file), 'utf8')) }));

// Las comps exentas no entran ni a medir: `The_Old_Road` es el tutorial del
// juego, no una comp de la comunidad, y arrastraria las medias de dos heroes.
const library = comps.filter((c) => c.taxonomy !== false);
const { nameFor, axisStats } = buildNamer(library);
const records = library.map((c) => ({ ...nameFor(c), file: c.file, was: c.teamName, comp: c }));

const pad = (s, n) => String(s).padEnd(n);
const pctText = (x) => `${(x * 100).toFixed(1)}%`;

if (has('--json')) {
  console.log(JSON.stringify(records.map((r) => ({
    file: r.file, was: r.was, proposed: r.name, kind: r.kind,
    lead: r.lead && { axis: r.lead.key, share: r.lead.share, bits: r.lead.bits },
    roster: (r.comp.heroes || []).map((h) => h.heroClass)
  })), null, 2));
  process.exit(0);
}

if (has('--axes')) {
  console.log('eje          media      sd     max   papel');
  console.log('-'.repeat(52));
  axisStats()
    .sort((a, b) => Number(b.engine) - Number(a.engine) || b.mean - a.mean)
    .forEach((s) => console.log(
      pad(s.axis, 13) + pad(pctText(s.mean), 9) + pad(pctText(s.sd), 8)
      + pad(pctText(s.max), 8) + (s.engine ? 'motor' : 'figura')
    ));
  console.log(EOL + 'Una sd pequena quiere decir que todas las comps lo llevan por igual,');
  console.log('asi que ese eje no puede distinguir a ninguna.');
  process.exit(0);
}

const byName = new Map();
records.forEach((r) => {
  if (!byName.has(r.name)) byName.set(r.name, []);
  byName.get(r.name).push(r);
});

const { stubborn } = assignFiles(records);

if (has('--apply')) {
  const moves = records.map((r) => ({ from: r.file, to: r.target, wasName: r.was, name: r.name }));
  const clashes = moves.filter((m) => m.to !== m.from
    && records.every((r) => r.file !== m.to)
    && fs.existsSync(path.join(COMPS_DIR, m.to)));
  if (clashes.length) {
    console.error('Un destino pisaria un fichero que no es de la libreria. Nada escrito:');
    clashes.forEach((m) => console.error(`  ${m.from} -> ${m.to}`));
    process.exit(1);
  }

  // Primero a un nombre temporal y despues al definitivo: sin ese rodeo, dos
  // comps que se intercambian el nombre se pisan la una a la otra.
  const stamp = `.v2tmp${process.pid}`;
  moves.forEach((m) => fs.renameSync(
    path.join(COMPS_DIR, m.from), path.join(COMPS_DIR, m.from + stamp)
  ));
  moves.forEach((m) => {
    const temp = path.join(COMPS_DIR, m.from + stamp);
    const raw = fs.readFileSync(temp, 'utf8');
    // Se apunta si el original acababa en salto de linea. `--apply` normaliza
    // (es lo que hace tambien `nameComps.js`), pero un undo que no devuelve los
    // bytes exactos deja 259 ficheros "modificados" en git sin haber cambiado
    // nada, y entonces el undo no sirve para lo que existe.
    m.hadEol = /\n$/.test(raw);
    const body = JSON.parse(raw);
    body.teamName = m.name;
    fs.writeFileSync(path.join(COMPS_DIR, m.to), `${JSON.stringify(body, null, 2)}${EOL}`);
    fs.unlinkSync(temp);
  });
  fs.writeFileSync(MANIFEST, `${JSON.stringify({ at: new Date().toISOString(), moves }, null, 2)}${EOL}`);

  // Verificar despues de mover, como hace `nameComps.js`: que este todo lo
  // planeado y que no sobre nada.
  const onDisk = new Set(fs.readdirSync(COMPS_DIR).filter((f) => f.endsWith('.json')));
  const exempt = comps.filter((c) => c.taxonomy === false).map((c) => c.file);
  const missing = moves.filter((m) => !onDisk.has(m.to)).map((m) => m.to);
  const extra = [...onDisk].filter((f) => !moves.some((m) => m.to === f) && !exempt.includes(f));
  if (missing.length || extra.length) {
    console.error('El renombrado no cuadra. Deshaz con --undo y revisa:');
    missing.forEach((f) => console.error(`  falta   ${f}`));
    extra.forEach((f) => console.error(`  sobra   ${f}`));
    process.exit(1);
  }

  const renamed = moves.filter((m) => m.from !== m.to).length;
  console.log(`${moves.length} comps renombradas, ${renamed} ficheros movidos.`);
  console.log(`Undo en ${path.relative(ROOT, MANIFEST)} -- deshaz con --undo.`);
  require('child_process').execFileSync(
    process.execPath, [path.join(ROOT, 'scripts', 'generatePresetCompsIndex.js')],
    { stdio: 'inherit' }
  );
  process.exit(0);
}

if (has('--shared')) {
  const shared = [...byName.entries()].filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  console.log(`${shared.length} nombres los llevan dos comps o mas.`);
  console.log('Eso NO es una colision: el nombre describe el plan y la clave de');
  console.log(`reparto identifica la comp.${EOL}`);
  shared.forEach(([name, list]) => {
    console.log(`${name}  (${list.length})`);
    list.forEach((r) => console.log(`    ${pad(r.file.replace('.json', ''), 36)}${(r.comp.heroes || [])
      .map((h) => h.heroClass).join(' ')}`));
  });
  process.exit(0);
}

const changed = records.filter((r) => r.was !== r.name);
const shown = has('--changed') ? changed : records;
const width = Math.max(...shown.map((r) => String(r.was || r.file).length)) + 2;

console.log(pad('ACTUAL', width) + pad('PROPUESTO', 28) + 'REPARTO');
console.log('-'.repeat(width + 28 + 34));
shown
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name) || String(a.was).localeCompare(String(b.was)))
  .forEach((r) => console.log(
    pad(r.was || r.file, width) + pad(r.name, 28)
    + (r.comp.heroes || []).map((h) => (h.heroClass || '').slice(0, 9)).join(' ')
  ));

const kinds = records.reduce((acc, r) => { acc[r.kind] = (acc[r.kind] || 0) + 1; return acc; }, {});
const sizes = [...byName.values()].map((v) => v.length).sort((a, b) => b - a);
const keys = new Set(records.map((r) => r.key));

console.log(EOL + `${records.length} comps, ${byName.size} nombres distintos`);
console.log(`  grupo mayor ${sizes[0]}, mediana ${sizes[Math.floor(sizes.length / 2)]}, `
  + `${sizes.filter((n) => n === 1).length} con nombre propio`);
console.log(`  de donde sale la ranura 1: ${Object.entries(kinds)
  .sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`  claves de reparto distintas: ${keys.size}`);
console.log(`  cambiarian de nombre: ${changed.length}`);
if (comps.length !== library.length) {
  console.log(`  exentas (taxonomy:false): ${comps.length - library.length}`);
}

const RUNG_LABEL = ['reparto', '+ orden de rangos', '+ region', '+ campamento'];
const rungUse = records.reduce((acc, r) => { acc[r.rung] = (acc[r.rung] || 0) + 1; return acc; }, {});
console.log(`${EOL}ficheros, por lo que hizo falta para separarlos:`);
RUNG_LABEL.forEach((label, i) => {
  if (rungUse[i]) console.log(`  ${pad(label, 20)}${rungUse[i]}`);
});
console.log(`  ${pad('movidos', 20)}${records.filter((r) => r.file !== r.target).length}`);

if (stubborn.length) {
  console.log(`${EOL}${stubborn.length} comps que ni el reparto, ni el orden, ni la region, ni el`);
  console.log('campamento separan. Se van a un sufijo numerico, y eso quiere decir');
  console.log(`que son casi la misma comp -- merece la pena mirarlas:${EOL}`);
  stubborn.forEach((r) => console.log(`  ${pad(r.file.replace('.json', ''), 36)}-> ${r.target}`));
}
