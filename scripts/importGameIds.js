#!/usr/bin/env node
/**
 * Genera `src/data/gameIdNames.js`: el nombre de juego de cada id interno que
 * una partida guarda y que no se parece a su nombre.
 *
 *   node scripts/importGameIds.js --game "<DarkestDungeon>"           reescribe
 *   node scripts/importGameIds.js --game "<DarkestDungeon>" --check   informa
 *
 * ## Por que existe
 *
 * Una partida guarda todo por id interno, y la mayoria de ids son el nombre con
 * guiones bajos, asi que `saveParser` los casa solo. Pero el juego RENOMBRO
 * muchas cosas despues de sacarlas y conservo el id viejo en las partidas:
 * `target_tag` es Mark for Death, `heroic_end` es Finale, `accurate` es Deadly,
 * `collector_1` es Dismas' Head. Importar una partida de Fran sin mods dejaba 74
 * de esos fuera, y la tabla a mano de `gameIds.js` tenia cinco.
 *
 * Ninguna regla puede adivinar un renombrado, pero el juego ya dice la
 * respuesta: sus string tables emparejan cada id con su nombre en ingles.
 *
 *   skills        combat_skill_name_<heroe>_<id>   (el id solo es unico dentro de su clase)
 *   camp skills   camping_skill_name_<id>
 *   quirks        str_quirk_name_<id>
 *   trinkets      str_inventory_title_trinket<id>
 *
 * Solo se escriben los ids que `nameKey` NO casa ya con su nombre -- los mismos
 * dos intentos que hace `saveParser` (la clave y la clave sin espacios) --, asi
 * que el fichero es la lista de renombrados y nada mas.
 */
const fs = require('fs');
const path = require('path');
const R = require('./lib/effectRender');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/gameIdNames.js');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const GAME = opt('--game') || process.env.DD_GAME_DIR;
if (!GAME || !fs.existsSync(GAME)) {
  console.error('Usage: node scripts/importGameIds.js --game "D:/.../common/DarkestDungeon" [--check]');
  process.exit(1);
}

const { nameKey } = loadEsm(path.join(ROOT, 'src/utils/nameNormalizer.js'));
// Lector ancho: 749 plantillas del juego base viven en <entry> con atributos.
const STR = R.loadGameContext(GAME, { wideStrings: true }).strings;

const squash = (key) => key.replace(/ /g, '');
/** true cuando `saveParser` no casaria el id con este nombre por si solo. */
const isRename = (id, name) => {
  const a = nameKey(id);
  const b = nameKey(name);
  return !!b && a !== b && squash(a) !== squash(b);
};
const text = (value) => R.plain(value || '');

// ---------------------------------------------------------------- skills
// El id de skill solo es unico dentro de su clase (`focus` es del Leper), asi
// que se indexa por el id de clase que guarda la partida (`data.heroClass`).
const heroInfos = new Map();
const visit = (p) => {
  const m = /([^/\\]+)\.info\.darkest$/.exec(p);
  if (m && /[/\\]heroes[/\\]/.test(p) && !heroInfos.has(m[1])) heroInfos.set(m[1], p);
};
R.walk(path.join(GAME, 'heroes'), visit);
R.walk(path.join(GAME, 'dlc'), visit);

const skills = {};
[...heroInfos.keys()].sort().forEach((heroId) => {
  const ids = [...new Set(R.readDarkest(heroInfos.get(heroId), 'combat_skill').map((s) => s.id).filter(Boolean))].sort();
  ids.forEach((id) => {
    const name = text(STR.get(`combat_skill_name_${heroId}_${id}`));
    if (name && isRename(id, name)) (skills[heroId] = skills[heroId] || {})[id] = name;
  });
});

// ------------------------------------------------- camp skills, quirks, trinkets
const byPrefix = (prefix) => {
  const out = {};
  [...STR.keys()].filter((key) => key.startsWith(prefix)).sort().forEach((key) => {
    const id = key.slice(prefix.length);
    const name = text(STR.get(key));
    if (id && name && isRename(id, name)) out[id] = name;
  });
  return out;
};
const campSkills = byPrefix('camping_skill_name_');
const quirks = byPrefix('str_quirk_name_');
const trinkets = byPrefix('str_inventory_title_trinket');

// ------------------------------------------------------------------- emit
const q = (s) => JSON.stringify(s);
const block = (obj, indent = '  ') =>
  Object.keys(obj).sort().map((k) => `${indent}${q(k)}: ${typeof obj[k] === 'object'
    ? `{\n${block(obj[k], indent + '  ')}\n${indent}}`
    : q(obj[k])},`).join('\n');

const count = (obj) => Object.values(obj).reduce((n, v) => n + (typeof v === 'object' ? count(v) : 1), 0);

const output = `/**
 * GENERADO - no editar a mano. Lo reescribe:
 *   node scripts/importGameIds.js --game <DarkestDungeon>
 *
 * El nombre de juego de cada id interno que una partida guarda y que no se
 * parece a su nombre: lo que el juego renombro despues de sacarlo y conservo con
 * el id viejo. Leido de las string tables del install; \`saveParser\` lo consulta
 * cuando el id no casa por si solo. Ver el porque en el script.
 */

/** Skills de combate por id de clase de la partida (\`data.heroClass\`). */
export const SKILL_NAMES_BY_HERO = {
${block(skills)}
};

export const CAMP_SKILL_NAMES = {
${block(campSkills)}
};

export const QUIRK_NAMES = {
${block(quirks)}
};

export const TRINKET_NAMES = {
${block(trinkets)}
};
`;

console.log(`renames: ${count(skills)} skills over ${Object.keys(skills).length} classes, ${count(campSkills)} camp skills, ${count(quirks)} quirks, ${count(trinkets)} trinkets`);
const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
if (CHECK) {
  console.log(previous === output ? 'al dia' : 'DESACTUALIZADO - run without --check to rewrite');
  process.exit(previous === output ? 0 : 1);
}
fs.writeFileSync(OUT, output, 'utf8');
console.log('wrote ' + path.relative(ROOT, OUT));
