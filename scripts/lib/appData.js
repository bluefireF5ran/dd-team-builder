/**
 * Load the app's plain-data ES modules from a CommonJS script.
 *
 * `src/data/*.js` are ES modules that export nothing but literals, so a
 * transpiler is overkill: rewriting `export const` to `const` and evaluating
 * the file gives back exactly what the app imports. Anything with a real
 * `import` of its own is out of scope - this is for the flat roster files.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');

function loadDataModule(relPath, stubs = {}) {
  const file = path.join(ROOT, relPath);
  let src = fs.readFileSync(file, 'utf8');

  // Imports become lookups into the stubs the caller supplied. A data file that
  // pulls from another one (heroes.js reads HERO_SPECIFIC_TRINKETS) is fed the
  // already-loaded object rather than resolved recursively.
  src = src.replace(/^\s*import\s+\{([^}]*)\}\s+from\s+['"][^'"]+['"];?\s*$/gm, (m, names) => {
    return names.split(',').map((n) => {
      const id = n.trim().split(/\s+as\s+/).pop().trim();
      return `const ${id} = __stubs[${JSON.stringify(id)}] || {};`;
    }).join('\n');
  });

  const exported = [];
  src = src.replace(/^export\s+const\s+([A-Za-z0-9_$]+)/gm, (m, name) => {
    exported.push(name);
    return `const ${name}`;
  });
  // Exported helpers stay as ordinary declarations - only the keyword goes.
  src = src.replace(/^export\s+(function|class)\b/gm, '$1');
  src = src.replace(/^export\s+default\s+/gm, 'const __default = ');
  src = src.replace(/^export\s*\{[^}]*\};?\s*$/gm, '');
  src += `\n__out.value = { ${exported.join(', ')} };\n`;

  const sandbox = { __stubs: stubs, __out: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: file });
  return sandbox.__out.value;
}

module.exports = { ROOT, loadDataModule };
