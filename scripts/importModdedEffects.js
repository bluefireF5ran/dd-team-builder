#!/usr/bin/env node
/**
 * Lo que hace la skill de un heroe modded, leido del mod igual que el juego lo lee.
 *
 *   node scripts/importModdedEffects.js --workshop "D:/…/workshop/content/262060" --game "D:/…/common/DarkestDungeon"
 *   node scripts/importModdedEffects.js --workshop … --game … --check    informe, no escribe
 *   node scripts/importModdedEffects.js --workshop … --game … --json     volcado para maquina
 *   node scripts/importModdedEffects.js --workshop … --game … --prune    olvida lo que ya no se puede verificar
 *
 * Escribe `src/data/moddedEffectsGenerated.js`.
 *
 * ## Por que existe
 *
 * `skillEffects.js` cubre las 20 clases vanilla y sus tests lo fijan a ese
 * roster, asi que una clase modded no puede vivir ahi. La alternativa era
 * `moddedEffects.js`, escrito a mano, y ese fichero es la prueba de como acaba
 * eso: **una clase cubierta de 644**. Una carta de skills sin efectos no es un
 * hueco cosmetico -- es la diferencia entre elegir una skill y adivinarla, y es
 * lo que hace que un heroe modded se sienta de segunda al lado de uno vanilla.
 *
 * Un mod es una CAPA sobre el arbol del juego: mismos formatos, mismos ficheros,
 * leidos por el mismo motor. Asi que se renderiza con el mismo codigo
 * (`scripts/lib/effectRender.js`), no con una segunda respuesta a una pregunta
 * que ya tiene una.
 *
 * ## El join es el manifiesto, no el nombre
 *
 * La app direcciona una skill por su NOMBRE mostrado (`activeSkills` es una
 * lista de nombres), y el mod la guarda por su ID interno. Traducir de uno a
 * otro aqui seria re-derivar lo que `importModdedHeroes.js` ya decidio -- y
 * re-derivar nombres en un sitio y emparejarlos en otro es exactamente el bug
 * de los iconos que AGENTS.md documenta: el scraper viejo resolvia nombres en un
 * sitio y los pegaba a iconos por posicion en otro, y Rupture dibujaba
 * Putrefaction.
 *
 * `scripts/importModdedHeroes.manifest.json` es el registro de esa decision:
 * por clase, el id interno emparejado con el nombre que aquella pasada fijo.
 * `exportModdedAssets.js` ya copia arte a partir de el por la misma razon. Aqui
 * se lee igual y no se re-deriva nada.
 *
 * ## Aditivo por defecto
 *
 * Solo se puede renderizar una clase cuyo mod este instalado. Desuscribirse de
 * un mod una tarde no puede borrar sus efectos del fichero, asi que lo que no
 * se puede verificar en esta pasada **se arrastra de la pasada anterior** y se
 * reporta. `--prune` es lo que lo tira, y va apagado por defecto -- la misma
 * regla, y por el mismo motivo, que `importModdedHeroes.js --prune`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const R = require('./lib/effectRender');
const { loadEsm } = require('./lib/loadEsm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/moddedEffectsGenerated.js');
const MANIFEST = path.join(ROOT, 'scripts/importModdedHeroes.manifest.json');
const EOL = '\n';

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const CHECK = argv.includes('--check');
const JSON_OUT = argv.includes('--json');
const PRUNE = argv.includes('--prune');
const WORKSHOP = opt('--workshop') || process.env.DD_WORKSHOP_DIR;
const GAME = opt('--game') || process.env.DD_GAME_DIR;

if (!WORKSHOP || !fs.existsSync(WORKSHOP)) {
  console.error('Falta --workshop <steamapps/workshop/content/262060>');
  process.exit(1);
}

/**
 * Las entradas de trinket que define un mod, por id.
 *
 * Mismo fichero y mismo formato que el juego (`*.entries.trinkets.json`), asi
 * que el renderer no distingue. Se lee una vez por mod, no por clase: un mod
 * con seis heroes comparte la carpeta `trinkets/`.
 */
function readTrinketEntries(modDir) {
  const out = new Map();
  R.walk(path.join(modDir, 'trinkets'), (p) => {
    if (!p.endsWith('.entries.trinkets.json')) return;
    let d;
    try { d = R.readJson(p); } catch (e) { return; }
    for (const t of d.entries || []) if (t.id && !out.has(t.id)) out.set(t.id, t);
  });
  return out;
}

/**
 * El tier tal como lo escribe el juego. Un mod casi siempre reutiliza los ids
 * vanilla (`common`, `very_rare`); cuando se inventa uno, se muestra el suyo en
 * palabras en lugar de tirarlo -- `trinketRarity.js` pinta lo que no reconoce
 * como "sin tier", que es preferible a inventarle uno.
 */
const GAME_RARITY = {
  very_common: 'Very Common', common: 'Common', uncommon: 'Uncommon',
  rare: 'Rare', very_rare: 'Very Rare', ancestral: 'Ancestral',
  ancestral_shambler: 'Shambler', crow: 'Crow', courtier: 'Courtier',
  collector: 'Collector', madman: 'Madman', darkest_dungeon: 'Darkest Dungeon',
  trophy: 'Trophy', kickstarter: 'Kickstarter', comet: 'Crystalline',
  crimson_court: 'Crimson Court', shieldbreaker: 'Shieldbreaker',
  thing: 'Thing', mildred: 'Keepsake', runaway: "Fire's Edge",
};
const rarityOf = (raw) => {
  if (!raw) return null;
  const id = String(raw);
  if (GAME_RARITY[id]) return GAME_RARITY[id];
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// ============================================================ lo que ya hay

/** La pasada anterior, para arrastrar lo que este run no puede verificar. */
function previous() {
  if (!fs.existsSync(OUT)) return { combat: {}, camp: {}, trinkets: {} };
  try {
    const m = loadEsm(OUT);
    return {
      combat: m.MODDED_COMBAT_SKILL_EFFECTS_GENERATED || {},
      camp: m.MODDED_CAMP_SKILL_EFFECTS_GENERATED || {},
      trinkets: m.MODDED_TRINKET_EFFECTS_GENERATED || {},
    };
  } catch (e) {
    return { combat: {}, camp: {}, trinkets: {} };
  }
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

// Las clases del manifiesto que la app realmente lleva. Una clase que se cayo
// de `modded_heroes.js` no debe resucitar por el manifiesto.
const appClasses = new Set(Object.keys(
  loadEsm(path.join(ROOT, 'src/data/modded_heroes.js')).MODDED_HERO_CLASSES || {}
));

// ============================================================ el render

console.error('leyendo el juego...');
// `wideStrings`: 749 plantillas del juego viven en <entry> con atributos y el
// lector estrecho no las ve -- entre ellas las que necesitan los trinkets.
const gameCtx = R.loadGameContext(GAME, { wideStrings: true });
console.error(`  strings ${gameCtx.strings.size}  buffs ${gameCtx.buffs.size}  effects ${gameCtx.effects.size}  camps ${gameCtx.camps.size}`);

const installed = new Set(
  fs.readdirSync(WORKSHOP, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
);

// Por mod, no por clase: un mod con seis heroes se lee una vez.
const byMod = new Map();
for (const [cls, entry] of Object.entries(manifest)) {
  if (!appClasses.has(cls)) continue;
  const modId = String(entry.modId || '');
  if (!byMod.has(modId)) byMod.set(modId, []);
  byMod.get(modId).push([cls, entry]);
}

const combat = {};
const camp = {};
const trinkets = {};
const report = {
  classesCovered: [], skillsCovered: 0, campCovered: 0, trinketsCovered: 0,
  modNotInstalled: [], noInfoFile: [], noSkillRendered: [], partial: [],
  trinketNoEntry: [], unresolvedEffects: new Set(),
};

for (const [modId, classes] of [...byMod].sort((a, b) => a[0].localeCompare(b[0]))) {
  const modDir = path.join(WORKSHOP, modId);
  if (!installed.has(modId) || !fs.existsSync(modDir)) {
    for (const [cls] of classes) report.modNotInstalled.push(cls);
    continue;
  }

  let ctx = null;
  let render = null;
  let modTrinkets = new Map();

  for (const [cls, entry] of classes) {
    const heroId = entry.heroId;
    const info = path.join(modDir, 'heroes', heroId, heroId + '.info.darkest');
    if (!heroId || !fs.existsSync(info)) { report.noInfoFile.push(cls); continue; }

    // El contexto del mod se construye la primera vez que hace falta, no al
    // descartarlo: hay mods instalados que no aportan ninguna clase que la app
    // lleve, y leerlos entero seria tiempo tirado.
    if (!render) {
      ctx = R.loadModContext(modDir, gameCtx, { wideStrings: true });
      render = R.makeRenderer(ctx, { extended: true });
      modTrinkets = readTrinketEntries(modDir);
    }

    // El manifiesto manda: id -> el nombre que la app usa. Un id que no este
    // ahi no se inventa, se deja sin nombre y la skill no entra.
    const nameById = new Map((entry.skills || []).map(([id, name]) => [id, name]));
    const nameFor = (id) => nameById.get(id) || null;

    // 'max' y no '4': un mod no esta obligado a tener cuatro rangos de mejora,
    // y filtrar por level === '4' deja fuera la clase entera cuando no los hay.
    //
    // `merge` es lo que hace legibles a las clases de postura: muchos mods
    // reparten UNA skill en varias lineas `combat_skill:` del mismo rango, y
    // quedarse con una sola tira el resto. Ver `mergeRows` en effectRender.
    const rendered = render.renderSkills(info, {
      nameFor, level: 'max', merge: true, modePrefix: heroId,
    });

    const skills = {};
    for (const [name, v] of rendered) {
      // Una skill sin efecto legible no aporta nada sobre el nombre que ya se
      // ve en el boton, y mete una linea vacia en la carta.
      if (!v.effect && !v.dmg && !v.acc) continue;
      skills[name] = v;
    }

    const wanted = nameById.size;
    if (!Object.keys(skills).length) { report.noSkillRendered.push(cls); continue; }
    if (Object.keys(skills).length < wanted) {
      report.partial.push(`${cls} (${Object.keys(skills).length}/${wanted})`);
    }

    combat[cls] = skills;
    report.classesCovered.push(cls);
    report.skillsCovered += Object.keys(skills).length;

    // Las camp skills se indexan por nombre a secas, como en `skillEffects.js`:
    // una camp skill hace lo mismo para toda clase que la lleve. Las marcadas
    // como vanilla ya estan en CAMP_SKILL_EFFECTS y no se repiten aqui.
    for (const [id, name, isVanilla] of entry.camps || []) {
      if (isVanilla || !name || camp[name]) continue;
      const e = render.campEntry(id);
      if (e) { camp[name] = e; report.campCovered++; }
    }

    // Los trinkets de clase. El manifiesto vuelve a ser el join id -> nombre;
    // la entrada (buffs, triggers, rarity, limit) sale del JSON del mod.
    for (const [id, name] of entry.trinkets || []) {
      if (!name || trinkets[name]) continue;
      const item = modTrinkets.get(id);
      if (!item) { report.trinketNoEntry.push(`${cls}: ${name}`); continue; }
      const parts = render.renderTrinket(item, report.unresolvedEffects);
      if (!parts.length) continue;
      const out = { rarity: rarityOf(item.rarity), effect: parts.join(' | ') };
      // `limit` es cuantas copias deja llevar el juego, propiedad del objeto y
      // no de su tier. `resolveTrinketClashes` lo lee.
      if (item.limit !== undefined && item.limit !== null) out.limit = Number(item.limit);
      trinkets[name] = out;
      report.trinketsCovered++;
    }
  }
}

// ---------------------------------------------------------------- arrastre

const prev = previous();
let carried = 0;
if (!PRUNE) {
  const unverifiable = new Set([...report.modNotInstalled, ...report.noInfoFile]);
  for (const [cls, skills] of Object.entries(prev.combat)) {
    if (combat[cls] || !appClasses.has(cls) || !unverifiable.has(cls)) continue;
    combat[cls] = skills;
    carried++;
  }
  for (const [name, e] of Object.entries(prev.camp)) if (!camp[name]) camp[name] = e;
  for (const [name, e] of Object.entries(prev.trinkets || {})) if (!trinkets[name]) trinkets[name] = e;
}

// ================================================================= salida

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const sortedKeys = (o) => Object.keys(o).sort((a, b) => a.localeCompare(b));

function skillLine(name, v) {
  const bits = [];
  const put = (k, val) => { if (val !== null && val !== undefined && val !== false) bits.push(`${k}: ${typeof val === 'boolean' ? val : q(val)}`); };
  put('type', v.type);
  put('launch', v.launch);
  put('target', v.target);
  if (v.aoe) bits.push('aoe: true');
  put('dmg', v.dmg);
  put('acc', v.acc);
  put('crit', v.crit);
  put('effect', v.effect);
  return `    ${q(name)}: { ${bits.join(', ')} },`;
}

const lines = [];
lines.push('/**');
lines.push(' * GENERADO - no editar a mano. Lo reescribe:');
lines.push(' *   node scripts/importModdedEffects.js --workshop <262060> --game <DarkestDungeon>');
lines.push(' *');
lines.push(' * Que hacen las skills de las clases modded, leido de los ficheros del propio');
lines.push(' * mod con el MISMO renderer que usa el juego para dibujar el tooltip');
lines.push(' * (`scripts/lib/effectRender.js`). El emparejamiento id -> nombre mostrado sale');
lines.push(' * de `scripts/importModdedHeroes.manifest.json`, que es donde quedo registrado;');
lines.push(' * aqui no se re-deriva ningun nombre.');
lines.push(' *');
lines.push(' * Lo escrito a mano en `moddedEffects.js` GANA sobre esto: ese fichero fusiona');
lines.push(' * los dos y se queda con el suyo cuando hay conflicto.');
lines.push(' */');
lines.push('');
lines.push('/** Por clase, luego por nombre de skill: una skill solo significa algo junto a su clase. */');
lines.push('export const MODDED_COMBAT_SKILL_EFFECTS_GENERATED = {');
for (const cls of sortedKeys(combat)) {
  lines.push(`  ${q(cls)}: {`);
  for (const name of sortedKeys(combat[cls])) lines.push(skillLine(name, combat[cls][name]));
  lines.push('  },');
}
lines.push('};');
lines.push('');
lines.push('/** Por nombre a secas: una camp skill hace lo mismo para toda clase que la lleve. */');
lines.push('export const MODDED_CAMP_SKILL_EFFECTS_GENERATED = {');
for (const name of sortedKeys(camp)) {
  const e = camp[name];
  const cost = e.cost === null || e.cost === undefined ? 'null' : e.cost;
  lines.push(`  ${q(name)}: { cost: ${cost}, effect: ${q(e.effect)} },`);
}
lines.push('};');
lines.push('');
lines.push('/** Por nombre: un trinket de clase solo lo lleva su clase, y el nombre es unico. */');
lines.push('export const MODDED_TRINKET_EFFECTS_GENERATED = {');
for (const name of sortedKeys(trinkets)) {
  const t = trinkets[name];
  const bits = [`rarity: ${t.rarity === null ? 'null' : q(t.rarity)}`];
  if (t.limit !== undefined) bits.push(`limit: ${t.limit}`);
  bits.push(`effect: ${q(t.effect)}`);
  lines.push(`  ${q(name)}: { ${bits.join(', ')} },`);
}
lines.push('};');
lines.push('');

const text = lines.join(EOL);

// ================================================================= informe

const say = (label, list) => {
  if (!list.length) return;
  console.log(`${label} ${list.length}`);
  console.log('  ' + list.slice(0, 12).join(', ') + (list.length > 12 ? ` … (+${list.length - 12})` : ''));
};

if (JSON_OUT) {
  console.log(JSON.stringify({ combat, camp, trinkets, report: { ...report, unresolvedEffects: [...report.unresolvedEffects] } }, null, 2));
  process.exit(0);
}

console.log('');
console.log(`clases con efectos ${report.classesCovered.length} de ${appClasses.size}`);
console.log(`  skills ${report.skillsCovered}   camp skills ${report.campCovered}   trinkets ${report.trinketsCovered}`);
if (carried) console.log(`arrastradas de la pasada anterior ${carried} (su mod no esta instalado)`);
say('mod no instalado', report.modNotInstalled);
say('sin .info.darkest', report.noInfoFile);
say('instalado pero no renderiza ninguna skill', report.noSkillRendered);
say('parciales', report.partial);
say('trinket sin entrada en el mod', report.trinketNoEntry);
say('efectos nombrados y no definidos', [...report.unresolvedEffects]);

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  // Ojo en Windows: el fichero en disco viene con CRLF por el checkout de git y
  // esto genera LF, asi que se comparan normalizados. Es la misma nota que
  // lleva importTrinketEffects.js.
  const same = current.replace(/\r\n/g, '\n') === text;
  console.log(same ? 'AL DIA' : 'DESACTUALIZADO - corre sin --check para reescribir');
  process.exit(same ? 0 : 1);
}

fs.writeFileSync(OUT, text, 'utf8');
console.log(`escrito ${path.relative(ROOT, OUT)}`);
