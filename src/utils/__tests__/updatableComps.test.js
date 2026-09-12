import { updatableComps, compClassKey, resetCompIdentityCache } from '../compIdentity';
import { getCompFiles } from '../../data/compIndex';

/**
 * Que comp de la libreria reescribe esta, en vez de duplicarla.
 *
 * La regla es region + las cuatro clases, y la parte interesante es la
 * DIFERENCIA con `compClassKey`, que a proposito ignora la region. Son dos
 * preguntas distintas y los dos tests de abajo la fijan en las dos direcciones.
 */

const library = getCompFiles();
// Una comp real de la libreria con sus cuatro ranuras llenas: es la unica forma
// de probar esto contra datos que existen de verdad.
const sample = library.find(({ data }) => (data.heroes || []).every((h) => h.heroClass));

beforeEach(() => resetCompIdentityCache());

describe('finding the comp a save would replace', () => {
  it('finds the comp it came from', () => {
    const found = updatableComps({ location: sample.data.location, heroes: sample.data.heroes });
    expect(found.map((f) => f.key)).toContain(sample.key);
  });

  it('hands back the file, the name and the alias, not just a flag', () => {
    const [first] = updatableComps({ location: sample.data.location, heroes: sample.data.heroes });
    expect(first).toEqual(expect.objectContaining({
      key: expect.any(String),
      teamName: expect.any(String),
      location: sample.data.location,
    }));
    // El fichero es la identidad: sin el no se puede reescribir en su sitio.
    expect(first.key).not.toMatch(/\.json$/);
  });

  /**
   * Mover un heroe de ranura es la misma party mal puesta, y arreglarlo es
   * justo lo que se quiere guardar ENCIMA de la anterior.
   */
  it('still matches when the ranks are shuffled', () => {
    const reversed = [...sample.data.heroes].reverse();
    const found = updatableComps({ location: sample.data.location, heroes: reversed });
    expect(found.map((f) => f.key)).toContain(sample.key);
  });

  /**
   * La region SI cuenta aqui, y es la unica diferencia con `compClassKey`:
   * "si ya tengo una comp para las Ruinas, puedo hacer una parecida para los
   * Warrens" describe dos comps, no una, y sustituir una por la otra perderia
   * la primera.
   */
  it('offers nothing when only the region changed', () => {
    const elsewhere = sample.data.location === 'The Cove' ? 'The Warrens' : 'The Cove';
    const found = updatableComps({ location: elsewhere, heroes: sample.data.heroes });
    expect(found.map((f) => f.key)).not.toContain(sample.key);
  });

  it('agrees with compClassKey about the classes, and disagrees about the region', () => {
    const elsewhere = sample.data.location === 'The Cove' ? 'The Warrens' : 'The Cove';
    const moved = { location: elsewhere, heroes: sample.data.heroes };
    // misma idea...
    expect(compClassKey(moved)).toBe(compClassKey(sample.data));
    // ...y aun asi, otro fichero.
    expect(updatableComps(moved).map((f) => f.key)).not.toContain(sample.key);
  });

  it('offers nothing for a roster the library does not have', () => {
    const odd = { location: 'The Ruins', heroes: [{ heroClass: 'Not A Hero' }, { heroClass: 'Nor This' }] };
    expect(updatableComps(odd)).toEqual([]);
  });

  it('offers nothing for an empty party', () => {
    expect(updatableComps({ location: 'The Ruins', heroes: [] })).toEqual([]);
    expect(updatableComps({})).toEqual([]);
  });

  // Todo lo que ofrece tiene que ser reescribible de verdad: mismo fichero,
  // misma region, mismas clases.
  it('never offers a comp whose classes or region differ', () => {
    const wrong = [];
    library.slice(0, 60).forEach(({ data }) => {
      updatableComps({ location: data.location, heroes: data.heroes }).forEach((u) => {
        if (compClassKey(u.heroes) !== compClassKey(data)) wrong.push(`${u.key}: classes`);
        if (u.location !== data.location) wrong.push(`${u.key}: region`);
      });
    });
    expect(wrong).toEqual([]);
  });
});
