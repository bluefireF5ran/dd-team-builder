// Indice enriquecido de la libreria del bundle.
//
// Analizar 183 comps (clases, mecanicas, tags, blob de busqueda) cuesta poco,
// pero cuesta UNA vez, no en cada render ni en cada tecla del buscador. Y se
// construye la primera vez que alguien lo pide, no al importar: abrir la app
// sin abrir la libreria no deberia pagarlo.

import { COMP_LIBRARY } from './compLibrary';
import { PRESET_COMP_ENTRIES } from './presetComps/index';
import { buildCompEntry, buildFacets } from '../utils/compFilters';
import { buildNamer } from '../utils/compNaming2';

let entriesCache = null;
let facetsCache = null;
let namerCache = null;

/** Todas las comps del bundle, ya con familia, tags, flags y blob de busqueda. */
export const getCompEntries = () => {
  if (!entriesCache) entriesCache = COMP_LIBRARY.map(buildCompEntry);
  return entriesCache;
};

/** Recuento por heroe, region, familia y flag sobre la libreria entera. */
export const getCompFacets = () => {
  if (!facetsCache) facetsCache = buildFacets(getCompEntries());
  return facetsCache;
};

/**
 * Las comps del bundle TAL CUAL estan en disco ({teamName, alias, location, heroes}).
 * `getCompEntries` devuelve la version normalizada para la rejilla; el motor de
 * nombres necesita esta, porque nombrar una comp nueva es compararla con las que
 * ya hay y para eso hacen falta sus `teamName` reales.
 */
export const getRawComps = () => PRESET_COMP_ENTRIES.map(({ data }) => data);

/**
 * Los ficheros que la libreria tiene EN DISCO, sin el `.json`.
 *
 * Es lo que hace falta para no pisar ninguno al bajar una comp nueva. No se
 * recalcula que fichero le TOCARIA a cada comp: una que en su dia cedio su
 * peldaño sigue viviendo donde vive, y ese es el nombre que hay que esquivar.
 */
export const getCompFileKeys = () => PRESET_COMP_ENTRIES.map(({ key }) => key);

/**
 * El nombrador por ejes, ya calibrado contra la libreria entera.
 *
 * Memoizado como el resto del modulo, y por el mismo motivo con mas razon:
 * construirlo mide los 16 ejes de las 461 comps para saber que es raro AQUI.
 * Eso se paga una vez por sesion, no cada vez que se abre el guardado.
 */
export const getCompNamer = () => {
  if (!namerCache) namerCache = buildNamer(getRawComps());
  return namerCache;
};

export const COMP_COUNT = COMP_LIBRARY.length;
