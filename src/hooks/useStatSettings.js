import { createContext, useContext } from 'react';

/**
 * Dificultad y Hacienda, para todo lo que calcula estadisticas.
 *
 * Son dos ajustes que cambian los numeros de la barra, del hover y de la
 * ventana de estadisticas a la vez, y esos tres viven en una docena de
 * componentes: pasarlos como props por cada nivel era mas cable que logica. Un
 * contexto los deja donde se leen. Sin proveedor valen la linea base con la que
 * se especificaron las barras: Darkest y el estate construido.
 *
 * `App` lo provee desde sus ajustes; el ranker, que es otra pagina, desde los
 * suyos (el mismo `localStorage`).
 *
 * `estate` es `true` (todo construido), `false` (nada) o la LISTA de distritos
 * construidos, que es lo que da una partida importada.
 */
export const DEFAULT_STAT_SETTINGS = { difficulty: 'darkest', estate: true, source: 'settings' };

export const StatSettingsContext = createContext(DEFAULT_STAT_SETTINGS);

export const useStatSettings = () => useContext(StatSettingsContext);

/**
 * De los ajustes -- y de la partida importada, si la hay -- al objeto que leen
 * `statBreakdown` y `skillHover`.
 *
 * **La partida gana a los ajustes.** Los ajustes dicen como juegas en general;
 * la partida dice que distritos tienes construidos DE VERDAD y en que dificultad
 * esta, que es la respuesta exacta. Cada mitad se toma por separado: una partida
 * importada antes de que se leyera `persist.town.json` trae la dificultad pero no
 * los distritos, y ahi los distritos siguen saliendo de los ajustes.
 */
export const statSettingsFrom = (settings, profile = null) => {
  const fromSaveDifficulty = typeof profile?.difficulty === 'string' ? profile.difficulty : null;
  const fromSaveDistricts = Array.isArray(profile?.districts) ? profile.districts : null;
  return {
    difficulty: fromSaveDifficulty || settings?.difficulty || DEFAULT_STAT_SETTINGS.difficulty,
    estate: fromSaveDistricts || settings?.estateBuilt !== false,
    source: fromSaveDifficulty || fromSaveDistricts ? 'save' : 'settings',
  };
};
