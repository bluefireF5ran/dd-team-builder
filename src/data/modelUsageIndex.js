// Lo que el modelo ENTRENADO juega, puntuado con el mismo baremo que la
// libreria de comps.
//
// generalistIndex.js barre las comps del bundle. Esto no barre nada: el fichero
// lo emite `tools/model_preference.py` del proyecto SIM ya con la forma que
// devuelve buildUsageStats, precisamente para que scoreItems lo consuma sin
// cambiar una sola linea. El acoplamiento es la forma del JSON, y por eso hay
// un test que la comprueba.
//
// picks/opportunities NO cuenta lo mismo en las dos fuentes, y conviene tenerlo
// delante al leer la tabla:
//
//   libreria  de las ranuras que PODIAN llevarla, cuantas la llevan
//   modelo    de las decisiones en que la skill era LEGAL, en cuantas se cogio
//
// Es la misma pregunta ("de las veces que se podia, cuantas se hizo") sobre dos
// poblaciones distintas, y por eso los dos rankings se pueden comparar puesto a
// puesto. Lo que NO se puede es leer un 0% como una condena: una skill que casi
// nunca es legal apenas tiene denominador, y las de nicho son raras por diseno.
//
// Un detalle que se hereda de scoreItems: al filtrar por clase, el denominador
// deja de ser `opportunities` del item y pasa a ser `classUsage[clase]`, que
// aqui son los TURNOS de esa clase. Con filtro de clase la columna es "de sus
// turnos, cuantos gasto en esto"; sin filtro es "de las veces que pudo".
// `offeredByClass` va en el JSON para quien quiera la tasa por clase de verdad.

import MODEL_USAGE from './modelUsage.json';

export const getModelUsageStats = () => MODEL_USAGE;

export const MODEL_PROVENANCE = MODEL_USAGE.provenance || {};

/** El modelo solo elige skills de combate: ni campamento ni baratijas. */
export const MODEL_CATEGORIES = ['heroes', 'skills'];

export const hasModelUsage = () => ((MODEL_USAGE.items?.skills || []).length > 0);

export const USAGE_SOURCES = [
  {
    id: 'library',
    label: 'Comp library',
    blurb: 'What the comps in the bundle equip.'
  },
  {
    id: 'model',
    label: 'Trained model',
    blurb: 'What the policy actually plays, out of what was legal that turn.'
  }
];
