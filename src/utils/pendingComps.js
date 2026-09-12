/**
 * Las comps que ya has escrito pero que la app todavia no lleva dentro.
 *
 * `presetComps/index.js` se genera al arrancar (`prestart`) y se importa de
 * forma estatica, asi que la libreria que ve la app es la que habia cuando se
 * levanto el servidor. Guardar una comp descarga un `.json`: hasta que ese
 * fichero no cae en `src/data/presetComps/` y no se regenera el index, la comp
 * no existe para nadie -- y el generador, que solo promete comps NUEVAS, te la
 * vuelve a ofrecer. De ahi el bucle de escribir cinco comps y reiniciar el
 * servidor entero para poder seguir.
 *
 * Esto lo corta por el lado del navegador: al descargar el preset se apunta su
 * clave de identidad (`compClassKey`, o sea las cuatro clases) y
 * `knownCompKeys` la trata como si ya estuviera en la libreria.
 *
 * **No sustituye a regenerar el index.** La comp sigue sin salir en la
 * biblioteca, sin contar para los nombres taxonomicos y sin entrar en
 * `bisIndex`; para eso hace falta `npm run comps:index`, que el servidor de
 * desarrollo recoge solo. Lo que evita es lo unico que hacia dano de verdad:
 * que te ofrezcan otra vez lo que acabas de escribir.
 *
 * En localStorage y no en memoria porque el caso de uso es justamente
 * sobrevivir a un F5. Se limpia sola: en cuanto el index se regenera y la clave
 * aparece en el bundle, `prunePendingComps` la borra, asi que la lista no
 * engorda para siempre con comps que ya estan subidas.
 */

const STORAGE_KEY = 'dd_pending_comp_keys_v1';

let cache = null;
// Un contador, no una marca de tiempo: `knownCompKeys` memoiza la union de esto
// con el bundle y necesita saber si ha cambiado sin volver a comparar 250
// claves. Se llama miles de veces por sugerencia.
let revision = 0;

const read = () => {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    cache = new Set(Array.isArray(raw) ? raw.filter((key) => typeof key === 'string' && key) : []);
  } catch (err) {
    // localStorage capado o JSON de otra version: quedarse sin la lista es
    // volver al comportamiento de antes, no un motivo para caerse.
    cache = new Set();
  }
  return cache;
};

const write = (next) => {
  cache = next;
  revision += 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch (err) {
    // Modo privado o cuota llena. La lista sigue viva en memoria durante esta
    // sesion, que es donde mas falta hace.
  }
};

/** Las claves apuntadas. Solo lectura para quien llama. */
export const pendingCompKeys = () => read();

/** Cambia cada vez que la lista cambia. Para invalidar caches de fuera. */
export const pendingCompsRevision = () => revision;

/**
 * Apunta una comp como escrita.
 *
 * @param {string} key  `compClassKey` de la comp
 * @returns {boolean} si ha anadido algo (false si ya estaba o si no hay clave)
 */
export const rememberPendingComp = (key) => {
  if (!key) return false;
  const current = read();
  if (current.has(key)) return false;
  write(new Set(current).add(key));
  return true;
};

/**
 * Olvida las que ya esten en el bundle.
 *
 * El index se ha regenerado y la comp ya viaja dentro de la app: apuntarla
 * ademas aqui no cambia nada y solo sirve para que la lista crezca sin fin.
 *
 * @param {Set<string>} bundleKeys
 * @returns {number} cuantas se han quitado
 */
export const prunePendingComps = (bundleKeys) => {
  const current = read();
  if (!current.size || !bundleKeys?.size) return 0;
  const next = new Set([...current].filter((key) => !bundleKeys.has(key)));
  if (next.size === current.size) return 0;
  const removed = current.size - next.size;
  write(next);
  return removed;
};

/**
 * Vacia la lista.
 *
 * Hace falta una salida a mano porque el apunte se hace al DESCARGAR, y
 * descargar no es lo mismo que quedarse la comp: si el `.json` acaba en la
 * papelera, su clave se quedaria bloqueando esas cuatro clases para siempre y
 * sin que se vea. Por eso el contador se ensena en el modal de sugerencias.
 */
export const clearPendingComps = () => {
  if (!read().size) return;
  write(new Set());
};
