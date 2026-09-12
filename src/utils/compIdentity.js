/**
 * Cuando dos comps son la misma comp.
 *
 * La respuesta de Fran, y es la unica que sobrevive al uso real: **las cuatro
 * clases, y nada mas**. Ni el orden ni la region cuentan.
 *
 *   - El orden no, porque colocar a los mismos cuatro heroes al reves no es
 *     otra party, es la misma mal puesta. `Marked_Prey__Royal_Snipe` y
 *     `Marked_Prey__Snipe_Back` llevan Leper/Houndmaster/Musketeer/Arbalest los
 *     dos; lo unico que cambia es cual de los dos tiradores va en el 3.
 *   - La region tampoco: *"si ya tengo una comp para las Ruinas, puedo hacer
 *     una parecida para los Warrens"*. Cambiar la etiqueta no inventa nada.
 *
 * Por eso esto no vive dentro de `compGenerator`: es la definicion de identidad
 * de una comp, y la usan tanto el generador (para no devolver lo que ya
 * tienes) como cualquiera que quiera saber si dos fichas son la misma.
 *
 * Las ranuras vacias no cuentan. `The_Old_Road` tiene dos a proposito -- es el
 * tutorial del juego-- y su clave son sus dos heroes, no dos huecos.
 */
import { nameKey } from './nameNormalizer';
import { getRawComps } from '../data/compIndex';
import { pendingCompKeys, pendingCompsRevision, prunePendingComps } from './pendingComps';

const classNamesOf = (comp) => {
  const list = Array.isArray(comp) ? comp : comp?.heroes || [];
  return list
    .map((entry) => (typeof entry === 'string' ? entry : entry?.heroClass) || '')
    .filter(Boolean);
};

/**
 * La clave de identidad: las clases canonicalizadas, ordenadas, unidas.
 *
 * `nameKey` y no el nombre crudo, porque "Man at Arms" y "Man-at-Arms" son el
 * mismo heroe y una comp importada puede traer cualquiera de las dos grafias.
 * Un multiconjunto, no un conjunto: dos Bufones no son un Bufon.
 *
 * @param {object|Array} comp  una comp `{heroes}`, una lista de heroes, o una
 *   lista de nombres de clase
 * @returns {string} vacio si no hay ninguna clase
 */
export const compClassKey = (comp) => classNamesOf(comp).map(nameKey).sort().join('|');

let knownCache = null;
let unionCache = null;
let unionRevision = -1;

/** Las claves de todas las comps del bundle. Se barre una vez. */
const bundleKeys = () => {
  if (!knownCache) {
    knownCache = new Set(getRawComps().map(compClassKey).filter(Boolean));
    // El index se regenera y las comps que estaban pendientes entran en el
    // bundle. Este es el momento de saberlo: la lista de pendientes solo debe
    // guardar lo que la app todavia no lleva dentro.
    prunePendingComps(knownCache);
  }
  return knownCache;
};

/**
 * Las claves que cuentan como "ya escrita": las del bundle mas las que has
 * guardado con la pagina abierta (ver `pendingComps`).
 *
 * Las dos partes se cachean por separado porque cambian a ritmos distintos: el
 * bundle es fijo hasta que se recarga la pagina y las pendientes crecen cada
 * vez que guardas una comp. La union se rehace solo cuando cambia la revision,
 * y no en cada llamada, porque el generador pregunta por aqui miles de veces
 * por sugerencia.
 */
export const knownCompKeys = () => {
  const bundle = bundleKeys();
  const pending = pendingCompKeys();
  if (!pending.size) return bundle;

  const revision = pendingCompsRevision();
  if (!unionCache || unionRevision !== revision) {
    unionCache = new Set(bundle);
    pending.forEach((key) => unionCache.add(key));
    unionRevision = revision;
  }
  return unionCache;
};

/**
 * ¿Estas cuatro clases ya estan escritas en la libreria, en el orden que sea y
 * para la region que sea?
 */
export const isKnownComp = (comp) => {
  const key = compClassKey(comp);
  return key ? knownCompKeys().has(key) : false;
};

/** Solo para los tests: olvida el barrido memoizado. */
export const resetCompIdentityCache = () => {
  knownCache = null;
  unionCache = null;
  unionRevision = -1;
};
