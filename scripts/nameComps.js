// Propone (y opcionalmente aplica) nombres taxonómicos para src/data/presetComps.
//
//   node scripts/nameComps.js              informe completo, no toca nada
//   node scripts/nameComps.js --changed    solo las comps que cambiarían de nombre
//   node scripts/nameComps.js --warnings   solo lo que hay que revisar a mano
//   node scripts/nameComps.js --json       volcado legible por máquina
//   node scripts/nameComps.js --apply      reescribe teamName, renombra ficheros
//                                          y regenera el index
//
// La lógica vive en src/utils/compNaming.js y el vocabulario en
// src/data/compTaxonomy.js; aquí solo hay entrada/salida.

const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');
const COMPS_DIR = path.join(ROOT, 'src', 'data', 'presetComps');
const EOL = String.fromCharCode(10);

// --- Cargar módulos ESM de src/ desde Node (CRA no expone un runtime aquí) ---
const esmCache = new Map();
const loadEsm = (filePath) => {
  const abs = path.resolve(filePath);
  if (esmCache.has(abs)) return esmCache.get(abs);

  const { code } = babel.transformFileSync(abs, {
    babelrc: false,
    configFile: false,
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]]
  });

  const mod = new Module(abs, null);
  mod.filename = abs;
  mod.paths = Module._nodeModulePaths(path.dirname(abs));
  esmCache.set(abs, mod.exports);

  const localRequire = (spec) => {
    if (!spec.startsWith('.')) return require(spec);
    let target = path.resolve(path.dirname(abs), spec);
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      for (const ext of ['.js', '.jsx', '.json', '/index.js']) {
        if (fs.existsSync(target + ext)) { target += ext; break; }
      }
    }
    if (target.endsWith('.json')) return JSON.parse(fs.readFileSync(target, 'utf8'));
    return loadEsm(target);
  };

  const run = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
  run(mod.exports, localRequire, mod, abs, path.dirname(abs));
  esmCache.set(abs, mod.exports);
  return mod.exports;
};

const { assignCompNames, longestName } = loadEsm(path.join(ROOT, 'src', 'utils', 'compNaming.js'));

// --- Entrada ---
const readComps = () =>
  fs
    .readdirSync(COMPS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({ file, ...JSON.parse(fs.readFileSync(path.join(COMPS_DIR, file), 'utf8')) }));

/** "Dark Ritual: Allure" -> "Dark_Ritual__Allure.json" (Windows no admite ":"). */
const toFileName = (name) =>
  `${name
    .replace(/:\s*/g, '__')
    .replace(/\s+/g, '_')
    .replace(/[<>"/\\|?*]/g, '')
    .replace(/_+$/, '')}.json`;

// --- Informe ---
const pad = (s, n) => String(s).padEnd(n);

const report = (records, mode) => {
  const groups = new Map();
  records.forEach((r) => {
    if (!groups.has(r.family.name)) groups.set(r.family.name, []);
    groups.get(r.family.name).push(r);
  });

  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  if (mode !== 'warnings') {
    for (const [family, members] of sorted) {
      const shown = mode === 'changed' ? members.filter((r) => r.changed) : members;
      if (!shown.length) continue;
      const derived = members[0].family.source === 'signature' ? '' : `  [${members[0].family.source}]`;
      console.log(`\n### ${family}  (${members.length})${derived}`);
      shown
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((r) => {
          const arrow = r.changed ? '->' : '  ';
          console.log(`  ${pad(r.originalName, 32)} ${arrow} ${pad(r.name, 30)} ${r.tags.slice(0, 5).join(' ')}`);
        });
    }
  }

  // --- Avisos: lo que conviene mirar a mano ---
  const warnings = [];
  const byName = new Map();
  records.forEach((r) => {
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name).push(r);
  });
  byName.forEach((rs, name) => {
    if (rs.length > 1) warnings.push(`COLISION  "${name}" <- ${rs.map((r) => r.file).join(', ')}`);
  });

  const rosterKey = (r) => [...r.analysis.classes].sort().join('|');
  const byRoster = new Map();
  records.forEach((r) => {
    const k = rosterKey(r);
    if (!byRoster.has(k)) byRoster.set(k, []);
    byRoster.get(k).push(r);
  });
  byRoster.forEach((rs) => {
    if (rs.length > 1) warnings.push(`MISMO ROSTER  ${rs.map((r) => r.originalName).join('  |  ')}`);
  });

  records
    .filter((r) => r.family.source !== 'signature')
    .forEach((r) =>
      warnings.push(`SIN FIRMA  ${pad(r.originalName, 30)} -> ${r.name}  (familia deducida de la mecanica)`)
    );

  records
    .filter((r) => r.name.length > 34)
    .forEach((r) => warnings.push(`LARGO ${r.name.length}  ${r.name}`));

  if (warnings.length) {
    console.log(`\n\n=== A REVISAR (${warnings.length}) ===`);
    warnings.forEach((w) => console.log('  ' + w));
  }

  const changed = records.filter((r) => r.changed).length;
  console.log(
    `\n=== RESUMEN ===\n  comps: ${records.length}\n  familias: ${groups.size}` +
      `\n  cambian de nombre: ${changed}\n  nombre mas largo: ${longestName(records)} caracteres`
  );
};

// --- Aplicar ---
const apply = (records) => {
  // Varios renombrados apuntan a un fichero que hoy ocupa OTRA comp
  // (Stun_Control__Money, Marked_Prey__Blight...). Renombrar de uno en uno
  // se comeria esos casos, asi que va en dos fases con nombres temporales.
  const plan = records.map((r) => ({ record: r, from: r.file, to: toFileName(r.name) }));

  const clashes = new Map();
  plan.forEach((p) => clashes.set(p.to, [...(clashes.get(p.to) || []), p.record.name]));
  const collided = [...clashes.entries()].filter(([, names]) => names.length > 1);
  if (collided.length) {
    console.error('Abortado: dos comps quieren el mismo fichero:');
    collided.forEach(([file, names]) => console.error(`  ${file} <- ${names.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  // 1. Contenido: teamName nuevo y alias con el nombre de autor si lo habia.
  plan.forEach(({ record, from }) => {
    const body = { teamName: record.name };
    if (record.alias) body.alias = record.alias;
    body.location = record.comp.location;
    body.heroes = record.comp.heroes;
    fs.writeFileSync(path.join(COMPS_DIR, from), JSON.stringify(body, null, 2) + EOL, 'utf8');
  });

  // 2. Renombrado en dos fases.
  const moves = plan.filter((p) => p.from !== p.to);
  moves.forEach((p, i) => {
    p.tmp = `.rename-${i}.tmp`;
    fs.renameSync(path.join(COMPS_DIR, p.from), path.join(COMPS_DIR, p.tmp));
  });
  moves.forEach((p) => fs.renameSync(path.join(COMPS_DIR, p.tmp), path.join(COMPS_DIR, p.to)));

  const manifest = plan.map(({ record, from, to }) => ({
    from,
    to,
    was: record.originalName,
    now: record.name,
    alias: record.alias || null
  }));
  fs.writeFileSync(
    path.join(ROOT, 'scripts', 'nameComps.manifest.json'),
    JSON.stringify(manifest, null, 2) + EOL,
    'utf8'
  );

  console.log(`Reescritas ${plan.length} comps, ${moves.length} ficheros renombrados.`);
  console.log('Manifiesto (para deshacer) en scripts/nameComps.manifest.json');
  require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'generatePresetCompsIndex.js')], {
    stdio: 'inherit'
  });
};

// --- Main ---
const args = process.argv.slice(2);
const comps = readComps();
const records = assignCompNames(comps).map((r, i) => ({ ...r, file: comps[i].file }));

if (args.includes('--json')) {
  console.log(
    JSON.stringify(
      records.map((r) => ({
        file: r.file,
        was: r.originalName,
        now: r.name,
        family: r.family.name,
        familySource: r.family.source,
        variant: r.variant,
        alias: r.alias || null,
        tags: r.tags
      })),
      null,
      2
    )
  );
} else if (args.includes('--apply')) {
  apply(records);
} else {
  report(records, args.includes('--changed') ? 'changed' : args.includes('--warnings') ? 'warnings' : 'full');
}
