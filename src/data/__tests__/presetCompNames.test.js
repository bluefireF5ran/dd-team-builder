/**
 * Cada comp del bundle nombra cosas que la app reconoce.
 *
 * El fallo que este test habria cazado es mudo: una comp guardaba la camp
 * skill de la Shieldbreaker como `Snakeskin` (el roster la llama `Snake Skin`)
 * y la del Duelist como `Wound Care` (su clase la llama `First Aid`). La
 * tarjeta contaba el array y pintaba "Selected: 4/4" mientras ninguno de los
 * siete botones -- que iteran el roster -- se encendia. Nada fallaba, nada se
 * quejaba: solo no coincidia.
 *
 * Se comprueba DESPUES de canonicalizar, que es lo que hacen `loadPreset` y
 * `loadSavedTeam`, porque un alias conocido no es un fallo. Lo que no puede
 * pasar es que quede un nombre sin resolver.
 */
import fs from 'fs';
import path from 'path';
import { HERO_CLASSES } from '../heroes';
import { MODDED_HERO_CLASSES } from '../modded_heroes';
import { TRINKETS } from '../trinkets';
import { BACKER_TRINKETS } from '../backer_trinkets';
import { MODDED_GENERAL_TRINKETS } from '../modded_heroes';
import { canonicalizeHero } from '../../utils/nameNormalizer';

const DIR = path.join(__dirname, '..', 'presetComps');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

const comps = files.map((file) => ({
  file,
  comp: JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'))
}));

// Un slot vacio no pide nada (`The_Old_Road` es la pareja del tutorial y lleva
// dos), asi que solo se miran los heroes con clase.
const filledSlots = [];
comps.forEach(({ file, comp }) => {
  (comp.heroes || []).forEach((raw, index) => {
    if (!raw || !raw.heroClass) return;
    filledSlots.push({ where: `${file} rank ${index + 1}`, hero: canonicalizeHero(raw) });
  });
});

const GENERAL_TRINKETS = new Set([...TRINKETS, ...BACKER_TRINKETS, ...MODDED_GENERAL_TRINKETS]);

/**
 * Excepciones pendientes de decision, no reglas. Vacio, y asi tiene que
 * quedarse.
 *
 * Aqui vivio `Ballad_Quartet.json rank 1: Jester :: Cloak and Dagger`, un
 * trinket de Butcher's Circus del Grave Robber puesto a un Jester -- no una
 * grafia que arreglar, sino un trinket que esa clase no puede llevar, con lo
 * que la comp no se podia ni reproducir en la app. Con que sustituirlo era una
 * decision de build, y Fran la tomo en `dc6fbee`: ahora lleva Caution Cloak y
 * Camouflage Cloak. La lista se queda como el sitio donde anotar la siguiente,
 * en vez de relajar la comprobacion.
 */
const KNOWN_BAD_TRINKETS = [];

describe('preset comps only name things the app knows', () => {
  it('has comps to check', () => {
    expect(files.length).toBeGreaterThan(100);
    expect(filledSlots.length).toBeGreaterThan(400);
  });

  it('names a hero class the app carries', () => {
    const unknown = filledSlots
      .filter(({ hero }) => !HERO_CLASSES[hero.heroClass] && !MODDED_HERO_CLASSES[hero.heroClass])
      .map(({ where, hero }) => `${where}: ${hero.heroClass}`);
    expect(unknown).toEqual([]);
  });

  it('gives every hero combat skills their class actually has', () => {
    const bad = [];
    filledSlots.forEach(({ where, hero }) => {
      const data = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
      if (!data) return;
      (hero.activeSkills || []).forEach((skill) => {
        if (skill && !(data.skills || []).includes(skill)) bad.push(`${where}: ${hero.heroClass} :: ${skill}`);
      });
    });
    expect(bad).toEqual([]);
  });

  it('gives every hero camp skills their class actually has', () => {
    const bad = [];
    filledSlots.forEach(({ where, hero }) => {
      const data = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
      if (!data) return;
      (hero.activeCampSkills || []).forEach((skill) => {
        if (skill && !(data.campSkills || []).includes(skill)) {
          bad.push(`${where}: ${hero.heroClass} :: ${skill}`);
        }
      });
    });
    expect(bad).toEqual([]);
  });

  it('equips trinkets that are either general or belong to that class', () => {
    const bad = [];
    filledSlots.forEach(({ where, hero }) => {
      const data = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
      if (!data) return;
      const classTrinkets = new Set(data.classSpecificTrinkets || []);
      [hero.trinket1, hero.trinket2].forEach((name) => {
        if (!name) return;
        if (!GENERAL_TRINKETS.has(name) && !classTrinkets.has(name)) {
          bad.push(`${where}: ${hero.heroClass} :: ${name}`);
        }
      });
    });
    expect(bad).toEqual(KNOWN_BAD_TRINKETS);
  });
});
