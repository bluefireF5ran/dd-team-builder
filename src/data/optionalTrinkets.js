/**
 * Contenido opcional: los trinkets que no todo el mundo tiene.
 *
 * **Los dos grupos estan APAGADOS por defecto** (Fran, 2026-09-14): "it should
 * only recommend backer trinkets or ringmaster ones if they are activated...
 * by default lets go with both off".
 *
 * - **Backer**: las 294 piezas de Kickstarter. Existen, pero una recomendacion
 *   que las nombra no la puede seguir casi nadie.
 * - **Butcher's Circus**: el DLC de PvP, 99 trinkets mas los 4 del Ringmaster,
 *   que el juego marca con su propia rareza. Son genericos y fuertes, asi que
 *   ganan cualquier comparacion: el dia que el best-in-slot empezo a elegir por
 *   valor salieron `Monkey's Paw`, `Pitfighter's Helm`, `Silver Syringe` y
 *   `Durable Armlet` recomendados en media docena de clases, y la Vestal acabo
 *   con dos del Ringmaster puestos.
 *
 * ## Se lee de la rareza, no de una lista aparte
 *
 * `trinketEffects.js` ya trae `rarity` en cada entrada, y es la fuente fiable:
 * las 294 de rareza `Kickstarter` son exactamente `BACKER_TRINKETS`, y las 99 de
 * `Butcher's Circus` son exactamente las que los ficheros de datos listan a
 * mano. Mantener una segunda lista era tener dos verdades que se separan -- y
 * ya lo hicieron: `Durable Armlet` estaba en el array normal de su clase con la
 * rareza correcta al lado, asi que un filtro por listas lo dejaba pasar.
 *
 * ## Por que un registro
 *
 * Quien pregunta esta lejos de los ajustes: `bisIndex` deriva una celda sin
 * saber nada de la UI. La app lo instala una vez desde sus ajustes -- el mismo
 * patron que el roster modded-- y `version` deja invalidar lo memoizado.
 */
import { TRINKET_EFFECTS } from './trinketEffects';
import { nameKey } from '../utils/nameNormalizer';

/** La rareza que el juego le pone a cada grupo. */
const BACKER_RARITY = new Set(['kickstarter']);
const CIRCUS_RARITY = new Set(["butcher's circus", 'ringmaster']);

/** Lo que el jugador dice tener. Ambos a false: ver la cabecera. */
let enabled = { backer: false, circus: false };
let version = 0;

let index = null;
const rarityIndex = () => {
  if (index) return index;
  index = new Map();
  Object.entries(TRINKET_EFFECTS).forEach(([name, entry]) => {
    const rarity = String(entry?.rarity || '').toLowerCase();
    if (BACKER_RARITY.has(rarity)) index.set(nameKey(name), 'backer');
    else if (CIRCUS_RARITY.has(rarity)) index.set(nameKey(name), 'circus');
  });
  return index;
};

/**
 * @param {{backer?: boolean, circus?: boolean}} next
 */
export const setOptionalTrinkets = (next = {}) => {
  const merged = {
    backer: !!(next.backer ?? enabled.backer),
    circus: !!(next.circus ?? enabled.circus)
  };
  if (merged.backer === enabled.backer && merged.circus === enabled.circus) return;
  enabled = merged;
  version += 1;
};

/** Sube con cada cambio, para invalidar caches derivadas. */
export const optionalTrinketsVersion = () => version;

export const optionalTrinketsEnabled = () => ({ ...enabled });

/** A que grupo opcional pertenece un trinket, o null si es de base. */
export const optionalTrinketGroup = (name) => (name ? rarityIndex().get(nameKey(name)) || null : null);

/**
 * Si este trinket se puede recomendar ahora mismo. Uno que no es de ninguno de
 * los dos grupos siempre vale, que es el caso de la inmensa mayoria.
 */
export const isTrinketAllowed = (name) => {
  if (!name) return false;
  const group = optionalTrinketGroup(name);
  return !group || enabled[group];
};

/** El mismo filtro sobre una lista, conservando el orden. */
export const allowedTrinkets = (names) => (names || []).filter(isTrinketAllowed);

/** Para los tests, que instalan un estado y tienen que poder devolverlo. */
export const resetOptionalTrinketsForTests = () => {
  enabled = { backer: false, circus: false };
  version += 1;
};
