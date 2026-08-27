// Estadisticas de uso de la libreria, memoizadas.
//
// Mismo trato que compIndex.js y recommendations.js: el barrido de las comps se
// hace la primera vez que alguien lo pide, no al importar. Abrir el Team
// Builder no deberia pagar el ranking generalista del ranker.
//
// Se construye sobre getCompEntries() y no sobre COMP_LIBRARY porque las
// entradas ya traen `family` (de la taxonomia del nombre), que es la unidad de
// conteo alternativa: contar familias en vez de comps quita el peso extra de
// las familias con muchas variantes.

import { getCompEntries } from './compIndex';
import { buildUsageStats } from '../utils/generalistStats';

let cache = null;

export const getUsageStats = () => {
  if (!cache) cache = buildUsageStats(getCompEntries());
  return cache;
};
