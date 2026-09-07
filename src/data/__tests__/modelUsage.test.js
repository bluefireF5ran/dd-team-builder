import { scoreItems, defaultPriorStrength } from '../../utils/generalistStats';
import { getModelUsageStats, hasModelUsage, MODEL_CATEGORIES } from '../modelUsageIndex';

// modelUsage.json lo emite `tools/model_preference.py` del proyecto SIM, que
// vive en otro repositorio y no puede romper el build de este. Lo que los une
// es la FORMA: se escribe con la misma que devuelve buildUsageStats para que
// scoreItems lo puntue sin una linea de diferencia. Ese acoplamiento es un
// contrato con algo de fuera, igual que el de rankerExport.js, y por eso se
// comprueba aqui y sin montar ningun componente.
//
// Si esto se pone rojo, lo que ha pasado casi seguro es que el generador
// cambio de forma. Regenerarlo:
//
//   DDSIM_MOD_DIRS="<los roots del entrenamiento>" \
//     python tools/model_preference.py --model models/<ckpt>.zip \
//       --episodes 4 --json src/data/modelUsage.json

const stats = getModelUsageStats();

describe('modelUsage.json', () => {
  it('carries the provenance needed to know what was measured', () => {
    expect(hasModelUsage()).toBe(true);
    const p = stats.provenance;
    expect(typeof p.model).toBe('string');
    expect(p.episodes).toBeGreaterThan(0);
    expect(p.comps).toBeGreaterThan(0);
    expect(p.decisions).toBeGreaterThan(0);
    // Un checkpoint entrenado con mods medido sobre una tienda sin ellos da un
    // resultado plausible y equivocado, sin error por ninguna parte. Que el
    // numero de roots viaje en el fichero es lo que permite verlo despues.
    expect(p.modRoots).toBeGreaterThan(0);
    expect(p.classes).toBe(stats.classes.length);
  });

  it('has the top-level shape buildUsageStats returns', () => {
    expect(stats.compCount).toBeGreaterThan(0);
    expect(stats.familyCount).toBeGreaterThan(0);
    expect(stats.slotCount).toBeGreaterThan(0);
    expect(Array.isArray(stats.classes)).toBe(true);
    MODEL_CATEGORIES.forEach((category) => {
      expect(Array.isArray(stats.items[category])).toBe(true);
      expect(stats.items[category].length).toBeGreaterThan(0);
    });
  });

  it('gives every class a classUsage bucket, which is the per-class denominator', () => {
    stats.classes.forEach((name) => {
      expect(stats.classUsage[name]).toBeDefined();
      expect(stats.classUsage[name].slots).toBeGreaterThan(0);
    });
  });

  MODEL_CATEGORIES.forEach((category) => {
    it(`keeps picks <= opportunities for every ${category} entry`, () => {
      // Sin esto una tasa puede salir por encima del 100% y la tabla lo pinta
      // sin quejarse. Es la invariante de la que cuelga todo lo demas.
      const broken = stats.items[category].filter(
        (item) =>
          item.picks.slots > item.opportunities.slots ||
          item.picks.families > item.opportunities.families
      );
      expect(broken.map((i) => i.id)).toEqual([]);
    });

    it(`names an owner scoreItems can filter by, for every ${category} entry`, () => {
      const known = new Set(stats.classes);
      const orphans = stats.items[category].filter(
        (item) => !item.universal && !(item.owners || []).some((o) => known.has(o))
      );
      expect(orphans.map((i) => i.id)).toEqual([]);
    });
  });

  it('scores through the library scorer, unchanged', () => {
    const ranked = scoreItems(stats.items.skills, {
      alpha: 0.5,
      unit: 'slots',
      priorStrength: defaultPriorStrength(stats, 'slots')
    });
    expect(ranked.length).toBe(stats.items.skills.length);
    expect(ranked[0].rank).toBe(1);
    ranked.forEach((row) => {
      expect(row.rate).toBeGreaterThanOrEqual(0);
      expect(row.rate).toBeLessThanOrEqual(1);
      expect(Number.isFinite(row.score)).toBe(true);
    });
  });

  it('gives every hero the detail the model view renders instead of rank counts', () => {
    stats.items.heroes.forEach((item) => {
      const d = item.detail;
      expect(d).toBeDefined();
      // La amplitud se mide contra lo que se le OFRECIO, no contra las siete
      // del movepool: una comp equipa cuatro, asi que 3 de 7 puede ser juego
      // perfecto y no dice nada de la politica.
      expect(d.skillsUsed).toBeLessThanOrEqual(d.skillsOffered);
      expect(d.runScore).toBeGreaterThanOrEqual(0);
      expect(d.runScoreSe).toBeGreaterThanOrEqual(0);
      expect(d.comps).toBeGreaterThan(0);
    });
  });

  it('says which classes the app has no entry for instead of dropping them', () => {
    // Que un nombre no case NO es un fallo del export: es una clase real que el
    // modelo jugo de verdad y para la que este repositorio no tiene ficha, asi
    // que se exporta igual y sin contraparte de libreria que comparar. Lo que
    // seria un fallo es que desapareciera en silencio.
    expect(Array.isArray(stats.noAppEntry)).toBe(true);
    expect(stats.appKeysRead).toBeGreaterThan(0);
    const exported = new Set(stats.items.heroes.map((h) => h.name));
    stats.noAppEntry.forEach((name) => expect(exported.has(name)).toBe(true));
  });
});
