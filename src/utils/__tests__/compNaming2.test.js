import { planPart, compFileRungs, toCompFileName2, buildNamer } from '../compNaming2';
import { getRawComps, getCompFileKeys, getCompNamer } from '../../data/compIndex';

/**
 * El fichero y el nombre son dos cosas distintas, y lo que se prueba aqui es
 * justo eso: que el nombre pueda repetirse sin que dos comps acaben en el mismo
 * .json. Es la garantia que sostiene el boton de guardar -- lo que baja el
 * navegador se suelta en src/data/presetComps y no debe pisar nada.
 */

const party = (classes, location = 'The Ruins') => ({
  teamName: '',
  location,
  heroes: classes.map((heroClass) => ({ heroClass, activeSkills: [], activeCampSkills: [] }))
});

describe('planPart', () => {
  it('turns the colon into the double underscore and the rest into single ones', () => {
    expect(planPart('Cinder Wake: Royal')).toBe('Cinder_Wake__Royal');
  });

  it('drops the ampersand, which is legal on Windows but a shell metacharacter', () => {
    expect(planPart('Dark Ritual: Cross & Volley')).toBe('Dark_Ritual__Cross_Volley');
  });
});

describe('compFileRungs', () => {
  const comp = party(['Crusader', 'Abomination', 'Antiquarian', 'Plague Doctor']);

  it('puts the plan in front of the roster on every rung', () => {
    compFileRungs(comp, 'Black Humours: Mercy')
      .forEach((rung) => expect(rung.startsWith('Black_Humours__Mercy__')).toBe(true));
  });

  it('climbs from the roster alone to rank order, region and camp skills', () => {
    const [sorted, ordered, withRegion, withCamp] = compFileRungs(comp, 'Black Humours');
    // Ordenado alfabeticamente primero: dos comps con las mismas clases en otro
    // orden comparten este peldaño, y el siguiente es el que las separa.
    expect(sorted).toBe('Black_Humours__Beast_Cross_Money_Plague');
    expect(ordered).toBe('Black_Humours__Cross_Beast_Money_Plague');
    expect(withRegion).toBe('Black_Humours__Cross_Beast_Money_Plague__Ruins');
    // Sin camp skills de proposito el ultimo peldaño no añade nada: no hay un
    // sufijo vacio colgando.
    expect(withCamp).toBe(withRegion);
  });
});

describe('toCompFileName2', () => {
  const comp = party(['Crusader', 'Abomination', 'Antiquarian', 'Plague Doctor']);

  it('takes the shortest rung when nothing holds it', () => {
    expect(toCompFileName2(comp, 'Black Humours', [])).toBe('Black_Humours__Beast_Cross_Money_Plague.json');
  });

  it('steps down a rung rather than overwrite a file that exists', () => {
    const taken = ['Black_Humours__Beast_Cross_Money_Plague'];
    expect(toCompFileName2(comp, 'Black Humours', taken))
      .toBe('Black_Humours__Cross_Beast_Money_Plague.json');
  });

  it('reads the .json off the names it is given, because the barrel keeps them bare', () => {
    const taken = ['Black_Humours__Beast_Cross_Money_Plague.json'];
    expect(toCompFileName2(comp, 'Black Humours', taken)).not.toBe(taken[0]);
  });

  it('falls back to a suffix only once the whole ladder is held', () => {
    const all = compFileRungs(comp, 'Black Humours');
    expect(toCompFileName2(comp, 'Black Humours', all))
      .toBe(`${all[all.length - 1]}_2.json`);
  });
});

describe('naming one comp against the real library', () => {
  it('never hands a new comp the file of one already on disk', () => {
    // La prueba de fuego del guardado: la MISMA comp que ya esta en la libreria.
    // Toda su escalera esta cogida, asi que tiene que ceder a un sufijo en vez
    // de proponer el fichero de la otra.
    const existing = getRawComps()[0];
    const keys = getCompFileKeys();
    const name = getCompNamer().nameFor(existing).name;
    expect(keys).not.toContain(toCompFileName2(existing, name, keys).replace(/\.json$/, ''));
  });

  it('separates the same roster by region, which is the rung after the order', () => {
    const existing = getRawComps().find((c) => c.location === 'The Ruins');
    const elsewhere = { ...existing, location: 'The Cove' };
    const name = getCompNamer().nameFor(elsewhere).name;
    expect(toCompFileName2(elsewhere, name, getCompFileKeys())).toMatch(/__Cove\.json$/);
  });

  it('names by the library it is given, not by a table', () => {
    // `buildNamer` es comparativo: la misma comp medida contra una libreria de
    // una sola comp no tiene con que ser rara, y el nombre lo dice.
    const one = getRawComps()[0];
    const { nameFor } = buildNamer([one]);
    expect(typeof nameFor(one).name).toBe('string');
  });
});
