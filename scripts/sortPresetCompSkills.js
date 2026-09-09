// Pone las skills y camp skills de cada comp en el orden que declara su clase,
// que es el orden en que salen en el juego.
//
//   node scripts/sortPresetCompSkills.js           informe, no toca nada
//   node scripts/sortPresetCompSkills.js --apply   reescribe los JSON
//
// El orden en que estaban guardadas era el orden en que se escribieron: una
// comp copiada de una partida trae el orden de la pantalla de equipar, otra
// escrita a mano el que se le ocurriera a quien la escribio, y una generada por
// la app el de la frecuencia con que aparece cada skill. Ninguno significa
// nada para quien la lee, y hace imposible comparar dos comps de un vistazo.
//
// Solo cambia el ORDEN. Un nombre que la clase no declara (una skill modded,
// una grafia vieja como `Snakeskin`) se queda donde estaba, al final: ordenar
// no puede perder una seleccion. La comparacion es por `nameKey`, asi que esas
// grafias viejas si encuentran su sitio en el kit.
//
// La misma regla la aplica la app a lo que genera (`sortHeroSelections` en
// src/utils/heroHelper.js); esto es la pasada de una vez sobre lo ya escrito.

const fs = require('fs');
const path = require('path');
const { ROOT, loadDataModule } = require('./lib/appData');
const { nameKey } = require('./lib/names');

const COMPS_DIR = path.join(ROOT, 'src', 'data', 'presetComps');
const APPLY = process.argv.includes('--apply');

const HERO_CLASSES = loadDataModule('src/data/heroes.js', {
  HERO_SPECIFIC_TRINKETS: loadDataModule('src/data/hero_specific_trinkets.js').HERO_SPECIFIC_TRINKETS
}).HERO_CLASSES;
const MODDED_HERO_CLASSES = loadDataModule('src/data/modded_heroes.js').MODDED_HERO_CLASSES;

const kitOf = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

/** Mismo criterio que `sortToRoster`: por posicion en el kit, lo desconocido al final. */
const sortToKit = (selected, kit) => {
  const order = new Map((kit || []).map((name, i) => [nameKey(name), i]));
  const rank = (name) => {
    const found = order.get(nameKey(name));
    return found === undefined ? Number.MAX_SAFE_INTEGER : found;
  };
  return [...(selected || [])].sort((a, b) => rank(a) - rank(b));
};

const files = fs.readdirSync(COMPS_DIR).filter((f) => f.endsWith('.json')).sort();

let changedFiles = 0;
let changedSlots = 0;
const unknown = new Map();

for (const file of files) {
  const full = path.join(COMPS_DIR, file);
  const raw = fs.readFileSync(full, 'utf8');
  const comp = JSON.parse(raw);
  let touched = false;

  (comp.heroes || []).forEach((hero, index) => {
    const kit = kitOf(hero.heroClass);
    if (!kit) return;

    const skills = sortToKit(hero.activeSkills, kit.skills);
    const camp = sortToKit(hero.activeCampSkills, kit.campSkills);

    // Lo que la clase no declara, para poder mirarlo: ordenar lo deja pasar,
    // pero merece salir en el informe.
    [...(hero.activeSkills || [])].forEach((name) => {
      if (!(kit.skills || []).some((k) => nameKey(k) === nameKey(name))) {
        unknown.set(`${hero.heroClass} :: ${name}`, (unknown.get(`${hero.heroClass} :: ${name}`) || 0) + 1);
      }
    });
    [...(hero.activeCampSkills || [])].forEach((name) => {
      if (!(kit.campSkills || []).some((k) => nameKey(k) === nameKey(name))) {
        unknown.set(`${hero.heroClass} :: ${name}`, (unknown.get(`${hero.heroClass} :: ${name}`) || 0) + 1);
      }
    });

    const skillsMoved = JSON.stringify(skills) !== JSON.stringify(hero.activeSkills || []);
    const campMoved = JSON.stringify(camp) !== JSON.stringify(hero.activeCampSkills || []);
    if (!skillsMoved && !campMoved) return;

    if (!touched) {
      touched = true;
      console.log(`\n${file}`);
    }
    console.log(`  rank ${index + 1}  ${hero.heroClass}`);
    if (skillsMoved) console.log(`     skills: ${(hero.activeSkills || []).join(', ')}\n          -> ${skills.join(', ')}`);
    if (campMoved) console.log(`     camp:   ${(hero.activeCampSkills || []).join(', ')}\n          -> ${camp.join(', ')}`);

    if (hero.activeSkills) hero.activeSkills = skills;
    if (hero.activeCampSkills) hero.activeCampSkills = camp;
    changedSlots += 1;
  });

  if (!touched) continue;
  changedFiles += 1;
  // Con el salto final que tuviera: la mayoria de los ficheros no lo llevan y
  // uno si, y esto solo viene a ordenar skills, no a repartir saltos de linea.
  if (APPLY) fs.writeFileSync(full, JSON.stringify(comp, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
}

console.log(`\n${changedSlots} hero slots reordered across ${changedFiles} of ${files.length} comps.`);

if (unknown.size) {
  console.log(`\nNames the class does not declare (left in place, at the end):`);
  [...unknown.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([name, n]) => console.log(`  ${String(n).padStart(3)}x  ${name}`));
}

if (!APPLY && changedFiles) console.log('\nNothing written. Re-run with --apply.');
