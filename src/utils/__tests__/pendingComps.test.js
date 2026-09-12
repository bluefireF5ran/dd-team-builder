import {
  pendingCompKeys,
  pendingCompsRevision,
  rememberPendingComp,
  prunePendingComps,
  clearPendingComps
} from '../pendingComps';
import { compClassKey, knownCompKeys, isKnownComp, resetCompIdentityCache } from '../compIdentity';
import { HERO_CLASSES } from '../../data/heroes';

beforeEach(() => {
  localStorage.clear();
  clearPendingComps();
  resetCompIdentityCache();
});

describe('pendingComps', () => {
  it('remembers a comp and survives a reload', () => {
    const key = compClassKey(['Vestal', 'Crusader', 'Highwayman', 'Jester']);
    expect(rememberPendingComp(key)).toBe(true);
    expect(pendingCompKeys().has(key)).toBe(true);
    // Lo que ve la siguiente carga de la pagina.
    expect(JSON.parse(localStorage.getItem('dd_pending_comp_keys_v1'))).toContain(key);
  });

  it('does not count the same comp twice', () => {
    const key = compClassKey(['Vestal', 'Crusader', 'Highwayman', 'Jester']);
    rememberPendingComp(key);
    const revision = pendingCompsRevision();
    expect(rememberPendingComp(key)).toBe(false);
    expect(pendingCompsRevision()).toBe(revision);
    expect(pendingCompKeys().size).toBe(1);
  });

  it('ignores a comp with no classes', () => {
    expect(rememberPendingComp('')).toBe(false);
    expect(pendingCompKeys().size).toBe(0);
  });

  it('forgets the ones that have reached the bundle', () => {
    const arrived = compClassKey(['Vestal', 'Crusader', 'Highwayman', 'Jester']);
    const waiting = compClassKey(['Leper', 'Hellion', 'Occultist', 'Arbalest']);
    rememberPendingComp(arrived);
    rememberPendingComp(waiting);

    expect(prunePendingComps(new Set([arrived]))).toBe(1);
    expect(pendingCompKeys().has(arrived)).toBe(false);
    expect(pendingCompKeys().has(waiting)).toBe(true);
  });

  it('shrugs off a broken localStorage entry instead of throwing', () => {
    localStorage.setItem('dd_pending_comp_keys_v1', 'no soy JSON');
    // El modulo ya tiene la lista en memoria, asi que se comprueba lo que hace
    // el parseo: una lista vacia y ningun error.
    expect(() => JSON.parse(localStorage.getItem('dd_pending_comp_keys_v1'))).toThrow();
    expect(() => pendingCompKeys()).not.toThrow();
  });
});

/**
 * Cuatro clases que la libreria NO tiene, y su reparto.
 *
 * Se busca en vez de escribirlo: la libreria crece cada semana, asi que un
 * cuarteto libre hoy puede estar escrito el mes que viene y el test se caeria
 * sin que nada estuviera roto. Con 20 clases vanilla hay 4845 cuartetos y menos
 * de 300 comps, asi que siempre queda alguno.
 */
const unwrittenQuartet = () => {
  const bundle = knownCompKeys();
  const names = Object.keys(HERO_CLASSES);
  for (let a = 0; a < names.length; a += 1) {
    for (let b = a + 1; b < names.length; b += 1) {
      for (let c = b + 1; c < names.length; c += 1) {
        for (let d = c + 1; d < names.length; d += 1) {
          const quartet = [names[a], names[b], names[c], names[d]];
          if (!bundle.has(compClassKey(quartet))) return quartet;
        }
      }
    }
  }
  throw new Error('la libreria cubre TODOS los cuartetos vanilla');
};

describe('knownCompKeys with pending comps', () => {
  it('treats a comp you just saved as already written', () => {
    const quartet = unwrittenQuartet();
    const key = compClassKey(quartet);
    expect(isKnownComp(quartet)).toBe(false);

    rememberPendingComp(key);

    expect(knownCompKeys().has(key)).toBe(true);
    expect(isKnownComp(quartet)).toBe(true);
  });

  it('still carries the whole bundle', () => {
    const before = knownCompKeys().size;
    rememberPendingComp(compClassKey(unwrittenQuartet()));
    expect(knownCompKeys().size).toBe(before + 1);
    // Una comp del bundle sigue siendo conocida.
    expect(isKnownComp(['Arbalest', 'Musketeer', 'Houndmaster', 'Leper'])).toBe(true);
  });

  it('goes back to the bundle set once the list is emptied', () => {
    const before = knownCompKeys().size;
    rememberPendingComp(compClassKey(unwrittenQuartet()));
    clearPendingComps();
    expect(knownCompKeys().size).toBe(before);
  });
});
