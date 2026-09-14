/**
 * Lo que la Hacienda le suma a un heroe: los distritos, y la luz de antorcha tal
 * como la deja el Cartographer's Camp.
 *
 * Copiado a mano de los ficheros del juego (son pocas filas y no cambian):
 *
 * - `dlc/580100_crimson_court/features/districts/campaign/town/districts/districts_districts.json`
 *   y `.../shared/buffs/districts.buffs.json` -- los distritos de Crimson Court.
 * - `dlc/4964110_fires_edge/features/fires_edge/campaign/town/districts/runaway_duelist.districts.json`
 *   y `.../shared/buffs/runaway_duelist_districts.buffs.json` -- la Académie Duello.
 * - A quien toca cada distrito: `tag: .id "<distrito>"` en `<heroe>.info.darkest`.
 * - Los nombres: `str_<distrito>_title` en las string tables.
 *
 * Solo lo que mueve una barra de estadisticas. Lo demas existe y no se dibuja:
 * Training Ring da +4 ACC, Athenaeum +15% de probabilidad de blight y debuff,
 * Altar of the Light +10% de curacion, Yellow Hand +5% de exploracion,
 * Performance Hall -10% de estres recibido y +20% DMG a Finale, la Académie
 * +15% al daño de riposte.
 *
 * ## La dificultad
 *
 * Los numeros de la luz cambian con la dificultad (`modes/<modo>/...`). Fran
 * juega en **Darkest**, que es la linea base del juego y la de los ficheros sin
 * modo; las otras tres estan aqui para cuando haya un selector.
 */

export const DIFFICULTY = 'darkest';

/** `Man-at-Arms` -> `man_at_arms`: el id del juego a partir del nombre de la app. */
export const classId = (heroClass) =>
  String(heroClass || '').toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');

/**
 * `classes: null` es "todos los heroes" (`hero_type_tags: []` en el juego).
 * `amount` son puntos; `percent` multiplica la base (solo MAX HP aqui).
 */
export const DISTRICTS = [
  { id: 'conservatory_of_steel', name: 'Académie Duello', classes: null, buffs: [{ stat: 'dodge', amount: 3 }] },
  { id: 'conservatory_of_steel', name: 'Académie Duello', classes: ['duelist'], buffs: [{ stat: 'spd', amount: 1 }] },
  {
    id: 'house_of_the_yellow_hand',
    name: 'House of the Yellow Hand',
    classes: ['bounty_hunter', 'grave_robber', 'highwayman'],
    buffs: [{ stat: 'crit', amount: 4 }],
  },
  {
    id: 'altar_of_light',
    name: 'Altar of the Light',
    classes: ['crusader', 'vestal', 'flagellant'],
    buffs: [{ resist: 'stun', amount: 10 }],
  },
  {
    id: 'training_ring',
    name: 'Training Ring',
    classes: ['arbalest', 'houndmaster', 'man_at_arms', 'musketeer', 'shieldbreaker'],
    buffs: [{ stat: 'hp', percent: 10 }],
  },
  { id: 'theater', name: 'Performance Hall', classes: ['jester'], buffs: [{ stat: 'spd', amount: 2 }] },
];

/** Los distritos que tocan a esta clase. */
export const districtsFor = (heroClass) => {
  const id = classId(heroClass);
  return DISTRICTS.filter((d) => !d.classes || d.classes.includes(id));
};

/**
 * La tabla de oscuridad del Cartographer's Camp (`illuminators_guild`,
 * `DistrictLightBuffData`), solo las dos columnas que son del heroe:
 * `player_def_increase` (DODGE) y `player_crit_increase` (CRIT).
 *
 * Cada fila vale para una antorcha POR ENCIMA de `above` (el juego marca
 * `lowest_excluded`), que es lo mismo que dicen los trinkets: "if Torch above 75".
 */
export const CARTOGRAPHER_LIGHT = {
  darkest: [
    { above: 75, dodge: 7.5, crit: 1 },
    { above: 50, dodge: 0, crit: 1 },
    { above: 25, dodge: 0, crit: 2 },
    { above: 0, dodge: 0, crit: 3 },
    { above: -Infinity, dodge: 0, crit: 4 },
  ],
  radiant: [
    { above: 75, dodge: 10, crit: 1 },
    { above: 50, dodge: 2.5, crit: 1 },
    { above: 25, dodge: 0, crit: 2 },
    { above: 0, dodge: 0, crit: 3 },
    { above: -Infinity, dodge: 0, crit: 4 },
  ],
  stygian: [
    { above: 75, dodge: 7.5, crit: 1 },
    { above: 50, dodge: 0, crit: 1 },
    { above: 25, dodge: 0, crit: 2 },
    { above: 0, dodge: 0, crit: 3.5 },
    { above: -Infinity, dodge: 0, crit: 4 },
  ],
  bloodmoon: [
    { above: 75, dodge: 7.5, crit: 1 },
    { above: 50, dodge: 0, crit: 1 },
    { above: 25, dodge: 0, crit: 2 },
    { above: 0, dodge: 0, crit: 3.5 },
    { above: -Infinity, dodge: 0, crit: 4 },
  ],
};

export const CARTOGRAPHER_NAME = "Cartographer's Camp";

/** Lo que da la luz a esta antorcha, con el Cartographer's Camp construido. */
export const cartographerBonus = (torch, difficulty = DIFFICULTY) => {
  const table = CARTOGRAPHER_LIGHT[difficulty] || CARTOGRAPHER_LIGHT.darkest;
  return table.find((row) => torch > row.above) || table[table.length - 1];
};

/** El nombre de la banda de luz del medidor de antorcha. */
export const lightLabel = (torch) => {
  if (torch > 75) return 'Radiant';
  if (torch > 50) return 'Dim';
  if (torch > 25) return 'Shadowy';
  if (torch > 0) return 'Dark';
  return 'Pitch Black';
};
