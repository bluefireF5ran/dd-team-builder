/**
 * Cargar modulos ESM de `src/` desde un script CommonJS.
 *
 * `scripts/lib/appData.js` ya hace esto para los ficheros de datos planos,
 * reescribiendo `export const` y evaluando: barato y suficiente mientras el
 * fichero no tenga imports de verdad. `compNaming.js` o `bisIndex.js` si los
 * tienen, y ademas logica, asi que hay que transpilar de verdad.
 *
 * El cache se guarda ANTES de ejecutar el modulo, no despues: `bisIndex` y
 * `compIdentity` se leen el uno al otro y sin esa linea la ida y vuelta no
 * termina nunca.
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const cache = new Map();

const loadEsm = (filePath) => {
  const abs = path.resolve(filePath);
  if (cache.has(abs)) return cache.get(abs);

  const { code } = babel.transformFileSync(abs, {
    babelrc: false,
    configFile: false,
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]]
  });

  const mod = new Module(abs, null);
  mod.filename = abs;
  mod.paths = Module._nodeModulePaths(path.dirname(abs));
  cache.set(abs, mod.exports);

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
  cache.set(abs, mod.exports);
  return mod.exports;
};

module.exports = { loadEsm };
