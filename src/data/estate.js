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
 * `buffs` es lo que mueve una barra de estadisticas. `effects` es el resto de
 * lo que da el distrito, que no se dibuja pero si cuenta para saber que quiere
 * un heroe de sus trinkets: Training Ring +4 ACC, Athenaeum +15% de blight y
 * de debuff, Altar of the Light +10% de curacion, Yellow Hand +5% de
 * exploracion, Performance Hall -10% de estres recibido y +20% DMG a Finale, y
 * la Académie +10 ACC al riposte A TODO EL MUNDO (`hero_type_tags: []`), no
 * solo a la Duelist, que lo unico suyo es el +1 SPD.
 *
 * El hotfix 27987 (16-09-2026) cambio ese +15% al daño de riposte por el +10
 * ACC (`conservatory_riposte_acc`, `attack_rating` +0.10 con `rule_type:
 * riposte`), que a diferencia del daño SI entra en el modelo: `heroNeeds` se
 * lo suma a la punteria fija del riposte.
 *
 * Granary (+15% a lo que cura la comida) y Outsiders Bonfire (+2 puntos de
 * descanso) no estan: no tocan a un heroe en combate.
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
  {
    id: 'conservatory_of_steel',
    name: 'Académie Duello',
    classes: null,
    buffs: [{ stat: 'dodge', amount: 3 }],
    effects: [{ kind: 'riposteAcc', amount: 10 }],
  },
  { id: 'conservatory_of_steel', name: 'Académie Duello', classes: ['duelist'], buffs: [{ stat: 'spd', amount: 1 }] },
  {
    id: 'house_of_the_yellow_hand',
    name: 'House of the Yellow Hand',
    classes: ['bounty_hunter', 'grave_robber', 'highwayman'],
    buffs: [{ stat: 'crit', amount: 4 }],
    effects: [{ kind: 'scouting', amount: 5 }],
  },
  {
    id: 'altar_of_light',
    name: 'Altar of the Light',
    classes: ['crusader', 'vestal', 'flagellant'],
    buffs: [{ resist: 'stun', amount: 10 }],
    effects: [{ kind: 'healingDealt', amount: 10 }],
  },
  {
    id: 'training_ring',
    name: 'Training Ring',
    classes: ['arbalest', 'houndmaster', 'man_at_arms', 'musketeer', 'shieldbreaker'],
    buffs: [{ stat: 'hp', percent: 10 }],
    effects: [{ kind: 'acc', amount: 4 }],
  },
  {
    id: 'library',
    name: 'Athenaeum',
    classes: ['antiquarian', 'occultist', 'plague_doctor'],
    buffs: [],
    effects: [{ kind: 'blightChance', amount: 15 }, { kind: 'debuffChance', amount: 15 }],
  },
  {
    id: 'theater',
    name: 'Performance Hall',
    classes: ['jester'],
    buffs: [{ stat: 'spd', amount: 2 }],
    effects: [{ kind: 'stressReceived', amount: -10 }, { kind: 'skillDamage', amount: 20, skill: 'heroic_end' }],
  },
];

/**
 * El nombre de cada distrito, de `str_<id>_title` en las string tables. Los ids
 * son los de `persist.town.json`, asi que esto es lo que traduce una partida
 * importada a algo legible. Ojo con los que no se parecen a su id:
 * `spire_of_hope` es The Red Hook y `buskers_corner` el Puppet Theatre.
 */
export const DISTRICT_NAMES = {
  the_mill: 'The Mill',
  geologic_studyhall: 'Geologic Studyhall',
  tainted_well: 'Tainted Well',
  miasmal_orchard: 'Miasmal Orchard',
  spire_of_hope: 'The Red Hook',
  bank: 'Bank',
  illuminators_guild: "Cartographer's Camp",
  granary: 'Granary',
  buskers_corner: 'Puppet Theatre',
  house_of_the_yellow_hand: 'House of the Yellow Hand',
  altar_of_light: 'Altar of the Light',
  training_ring: 'Training Ring',
  library: 'Athenaeum',
  theater: 'Performance Hall',
  outsiders_bonfire: 'Outsiders Bonfire',
  blood_bank: 'Sanguine Vintners',
  conservatory_of_steel: 'Académie Duello',
  craftworks: 'Craftworks',
  archaeologic_salon: 'Archaeological Base Camp',
};

/** El nombre de un distrito, o su id legible si no esta en la tabla. */
export const districtName = (id) => DISTRICT_NAMES[id] || String(id).replace(/_/g, ' ');

/**
 * Los distritos que tocan a esta clase.
 *
 * `districtId` es para las clases que la tabla no nombra: una modded declara su
 * distrito con el mismo `tag: .id` que las vanilla, y el importador lo guarda
 * como `district` en `modded_heroes.js`. Con el, una clase modded del Training
 * Ring cobra su +10% MAX HP y su +4 ACC como cualquier otra.
 */
export const districtsFor = (heroClass, districtId = null) => {
  const id = classId(heroClass);
  return DISTRICTS.filter((d) => !d.classes || d.classes.includes(id) || d.id === districtId);
};

/**
 * Lo que los distritos CONSTRUIDOS le dan a esta clase fuera de las barras,
 * sumado por tipo: `{ acc: 4 }` para quien tiene Training Ring. `estate` es
 * lo mismo que en `statBreakdown`: `true` (todo construido), `false` (nada)
 * o la lista de distritos de una partida importada.
 *
 * Un efecto con `skill` se guarda aparte (`skillDamage:heroic_end`): vale para
 * una habilidad, no para el heroe entero.
 */
export const districtEffects = (heroClass, estate = true, districtId = null) => {
  const out = {};
  districtEffectList(heroClass, estate, districtId).forEach((effect) => {
    const key = effect.skill ? `${effect.kind}:${effect.skill}` : effect.kind;
    out[key] = (out[key] || 0) + effect.amount;
  });
  return out;
};

/**
 * Lo mismo sin sumar: cada efecto con el distrito que lo da, que es lo que hace
 * falta para decir de DONDE sale un +4 ACC en la carta de una skill. Sumar un
 * numero sin nombre es lo que obliga al jugador a creerselo.
 */
export const districtEffectList = (heroClass, estate = true, districtId = null) => {
  const built = (id) => (Array.isArray(estate) ? estate.includes(id) : !!estate);
  return districtsFor(heroClass, districtId)
    .filter((district) => built(district.id))
    .flatMap((district) => (district.effects || []).map((effect) => ({ district: district.name, ...effect })));
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

/**
 * La tabla de oscuridad SIN Cartographer's Camp: la del juego base, bloque
 * `darkness` de `shared/rules.json` (y `modes/<modo>/shared/rules.json`;
 * Bloodmoon en `dlc/580100_crimson_court/features/crimson_court/modes/bloodmoon`).
 * El distrito la REEMPLAZA, no se suma a ella: con el estate construido cuenta
 * `CARTOGRAPHER_LIGHT` y sin el, esta.
 */
export const BASE_LIGHT = {
  darkest: [
    { above: 75, dodge: 4, crit: 0 },
    { above: 50, dodge: 2.5, crit: 0 },
    { above: 25, dodge: 0, crit: 1 },
    { above: 0, dodge: 0, crit: 2 },
    { above: -Infinity, dodge: 0, crit: 3 },
  ],
  radiant: [
    { above: 75, dodge: 7.5, crit: 0 },
    { above: 50, dodge: 4, crit: 0 },
    { above: 25, dodge: 0, crit: 1 },
    { above: 0, dodge: 0, crit: 2 },
    { above: -Infinity, dodge: 0, crit: 3 },
  ],
  stygian: [
    { above: 75, dodge: 2.5, crit: 0 },
    { above: 50, dodge: 0, crit: 0 },
    { above: 25, dodge: 0, crit: 1 },
    { above: 0, dodge: 0, crit: 2.5 },
    { above: -Infinity, dodge: 0, crit: 3 },
  ],
  bloodmoon: [
    { above: 75, dodge: 2.5, crit: 0 },
    { above: 50, dodge: 0, crit: 0 },
    { above: 25, dodge: 0, crit: 1 },
    { above: 0, dodge: 0, crit: 2.5 },
    { above: -Infinity, dodge: 0, crit: 3 },
  ],
};

/** Las cuatro dificultades, en el orden del juego. `stygian` es `new_game_plus` en los ficheros. */
export const DIFFICULTIES = [
  { id: 'radiant', label: 'Radiant' },
  { id: 'darkest', label: 'Darkest' },
  { id: 'stygian', label: 'Stygian' },
  { id: 'bloodmoon', label: 'Bloodmoon' },
];

/**
 * Lo que da la luz a esta antorcha: con Cartographer's Camp su tabla, sin el la
 * del juego base.
 */
export const lightBonus = (torch, difficulty = DIFFICULTY, cartographer = true) => {
  const tables = cartographer ? CARTOGRAPHER_LIGHT : BASE_LIGHT;
  const table = tables[difficulty] || tables.darkest;
  return table.find((row) => torch > row.above) || table[table.length - 1];
};

/** Lo que da la luz a esta antorcha, con el Cartographer's Camp construido. */
export const cartographerBonus = (torch, difficulty = DIFFICULTY) => lightBonus(torch, difficulty, true);

/** El nombre de la banda de luz del medidor de antorcha. */
export const lightLabel = (torch) => {
  if (torch > 75) return 'Radiant';
  if (torch > 50) return 'Dim';
  if (torch > 25) return 'Shadowy';
  if (torch > 0) return 'Dark';
  return 'Pitch Black';
};
