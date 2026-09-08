/**
 * Las zonas del juego, en el orden en que se leen en el mapa de misiones. Las
 * primeras doce son las del juego base y sus DLC; las cinco ultimas vienen de
 * mods (ver `src/data/questMap.js`, que las coloca en el mapa). El orden de
 * este array es el que usa `regionRank` para ordenar la libreria de comps.
 */
export const LOCATIONS = [
  'The Ruins',
  'The Warrens',
  'The Weald',
  'The Cove',
  'The Hamlet',
  'The Courtyard',
  'The Farmstead',
  'The Darkest Dungeon I',
  'The Darkest Dungeon II',
  'The Darkest Dungeon III',
  'The Darkest Dungeon IV',
  'Butcher Circus',
  // Zonas de mods, en el mismo orden en que aparecen en el mapa fusionado.
  'Sunward Isles',
  'The Pet Cemetery',
  'The Mountain',
  'The Arena',
  'Dimensional Havoc'
];

/** Las cinco de arriba que no existen sin mods. La UI las puede marcar. */
export const MODDED_LOCATIONS = [
  'Sunward Isles',
  'The Pet Cemetery',
  'The Mountain',
  'The Arena',
  'Dimensional Havoc'
];

/**
 * Color de cada zona. `accent` es el color de la region (borde/etiqueta) y
 * `short` la abreviatura que cabe en una tarjeta. Se usa para que la libreria de
 * comps se lea de un vistazo: el color dice la mazmorra antes que el texto.
 *
 * La paleta la fija el usuario, no la captura de pantalla: Ruinas gris, Cala
 * azul oscuro, Guarida marron rosado, Espesura verde amarillento, Granja cian,
 * Patio rojo puro, Darkest rojo oscuro, Aldea naranja terroso, y las de mods
 * rosa / purpura / blanco / rojo claro / negro.
 *
 * Los cuatro Darkest Dungeon comparten color a proposito: son la misma mazmorra
 * y el numero ya los separa en `short`.
 */
export const LOCATION_THEME = {
  'The Ruins':               { short: 'Ruins',    accent: '#9AA0A6' },
  'The Warrens':             { short: 'Warrens',  accent: '#B0705F' },
  'The Weald':               { short: 'Weald',    accent: '#9FB63C' },
  'The Cove':                { short: 'Cove',     accent: '#2C5AA8' },
  'The Hamlet':              { short: 'Hamlet',   accent: '#C9822E' },
  'The Courtyard':           { short: 'Court',    accent: '#E01B1B' },
  'The Farmstead':           { short: 'Farm',     accent: '#22C7D6' },
  'The Darkest Dungeon':     { short: 'Darkest',  accent: '#7A1420' },
  'The Darkest Dungeon I':   { short: 'DD I',     accent: '#7A1420' },
  'The Darkest Dungeon II':  { short: 'DD II',    accent: '#7A1420' },
  'The Darkest Dungeon III': { short: 'DD III',   accent: '#7A1420' },
  'The Darkest Dungeon IV':  { short: 'DD IV',    accent: '#7A1420' },
  'Butcher Circus':          { short: 'Circus',   accent: '#D2542A' },
  'Sunward Isles':           { short: 'Sunward',  accent: '#F06AB0' },
  'The Pet Cemetery':        { short: 'Cemetery', accent: '#A03A78' },
  'The Mountain':            { short: 'Mountain', accent: '#EDEFF2' },
  'The Arena':               { short: 'Arena',    accent: '#F2695C' },
  'Dimensional Havoc':       { short: 'Havoc',    accent: '#0D0D12' }
};

const UNKNOWN_LOCATION = { short: '—', accent: '#6B7280' };

const DARK_INK = '#12100e';
const LIGHT_INK = '#F3F4F6';

/**
 * Tinta legible sobre `accent` cuando el color se usa de fondo (los chips de
 * region). La paleta va de blanco (Mountain) a negro (Dimensional Havoc), asi
 * que un color de texto fijo deja uno de los dos extremos ilegible.
 */
const inkFor = (accent) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(accent || '');
  if (!hex) return DARK_INK;
  const n = parseInt(hex[1], 16);
  // Luminancia relativa aproximada (sRGB ponderado), suficiente para elegir tinta.
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luma > 0.55 ? DARK_INK : LIGHT_INK;
};

const themeCache = new Map();

/** Tema de una zona, con reserva gris para localizaciones desconocidas o vacias. */
export const getLocationTheme = (location) => {
  const base = LOCATION_THEME[location] || UNKNOWN_LOCATION;
  if (!themeCache.has(base)) themeCache.set(base, { ...base, ink: inkFor(base.accent) });
  return themeCache.get(base);
};
