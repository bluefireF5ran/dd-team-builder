import { LOCATIONS } from './locations';

/**
 * El mapa de misiones del juego, para elegir zona como se elige en la pantalla
 * de Quest Select en vez de en un desplegable.
 *
 * Las coordenadas NO son inventadas: salen de los ficheros de layout que el
 * juego lee para dibujar esa pantalla, `.quest_map_pos X Y` dentro de cada
 * `quest_select_dungeon_layout_<zona>`. Tres fuentes, todas en el espacio de
 * 1920x1080 en el que estan hechos los fondos:
 *
 *   · Juego base   campaign/town/quest_select/quest_select.layout.darkest
 *   · DLC          dlc/580100_crimson_court/... (Courtyard)
 *                  dlc/735730_color_of_madness/... (Farmstead)
 *   · Mod          workshop 3447439638 "Merged Quest Map Screen for New
 *                  Dungeons", que recoloca las del juego base para hacer sitio
 *                  a las de mods y aporta Mountain, Pet Cemetery y Arena.
 *
 * Se usan las del mod porque son las que casan con SU fondo, que es el que
 * dibujamos: mezclar posiciones del juego base sobre el fondo fusionado dejaria
 * los nodos fuera de su isla.
 */

/** Tamaño en el que estan medidas las coordenadas de abajo. */
export const QUEST_MAP_SIZE = { width: 1920, height: 1080 };

/**
 * El fondo vive en el repo de assets como todo lo demas
 * (`dd-team-builder-assets/images/bg/quest_select.background.png`, el fondo que
 * el propio juego dibuja bajo esta pantalla). Si falta, el modal dibuja un
 * panel oscuro y los nodos siguen funcionando: la imagen es el decorado, no el
 * mando.
 */
export const QUEST_MAP_IMAGE = '/images/bg/quest_select.background.png';

/**
 * Un nodo por zona. `estimated` marca las dos que no tienen layout instalado
 * (sus mods no estan en el workshop local): la posicion es una plaza libre del
 * mapa, no un dato del juego, y el modal lo dice.
 */
export const QUEST_MAP_NODES = [
  // Juego base, recolocadas por el mod fusionado (fox.quest_select.layout).
  { location: 'The Ruins',               x: 1000, y: 280 },
  { location: 'The Warrens',             x: 825,  y: 430 },
  { location: 'The Weald',               x: 1000, y: 540 },
  { location: 'The Cove',                x: 1280, y: 435 },
  { location: 'The Hamlet',              x: 1220, y: 715 },

  // DLC.
  { location: 'The Courtyard',           x: 570,  y: 330 },
  { location: 'The Farmstead',           x: 600,  y: 575 },
  { location: 'Butcher Circus',          x: 570,  y: 175 },

  // Los cuatro Darkest comparten `.quest_map_pos 1250 150`: el juego los dibuja
  // en fila (`.quest_number_of_quests_in_row 4`) desde ese punto, y eso es justo
  // lo que se hace aqui para que no se apilen uno encima de otro.
  { location: 'The Darkest Dungeon I',   x: 1160, y: 150 },
  { location: 'The Darkest Dungeon II',  x: 1250, y: 150 },
  { location: 'The Darkest Dungeon III', x: 1340, y: 150 },
  { location: 'The Darkest Dungeon IV',  x: 1430, y: 150 },

  // Mods, del layout fusionado.
  { location: 'The Mountain',            x: 890,  y: 145 },
  { location: 'The Pet Cemetery',        x: 905,  y: 670 },
  { location: 'The Arena',               x: 980,  y: 15  },

  // Sin layout instalado: hueco libre del mapa, a la espera del mod.
  { location: 'Sunward Isles',           x: 700,  y: 860, estimated: true },
  { location: 'Dimensional Havoc',       x: 1430, y: 560, estimated: true }
];

const NODES_BY_LOCATION = new Map(QUEST_MAP_NODES.map((n) => [n.location, n]));

/** Nodo de una zona, o null si no esta en el mapa. */
export const getQuestMapNode = (location) => NODES_BY_LOCATION.get(location) || null;

/**
 * El nodo en porcentaje del contenedor, que es como se posiciona en CSS: el
 * mapa se escala con la ventana y las coordenadas del juego son absolutas.
 */
export const toMapPercent = ({ x, y }) => ({
  left: `${(x / QUEST_MAP_SIZE.width) * 100}%`,
  top: `${(y / QUEST_MAP_SIZE.height) * 100}%`
});

/** Zonas de `LOCATIONS` sin sitio en el mapa. Vacio si el mapa esta completo. */
export const locationsMissingFromMap = () =>
  LOCATIONS.filter((loc) => !NODES_BY_LOCATION.has(loc));
