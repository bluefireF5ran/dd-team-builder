/**
 * Los colores de lo que hace una skill: en el borde de su icono y en su texto.
 *
 * ## Del juego, donde el juego distingue
 *
 * `colours/base.colours.darkest` (lineas 9-36 del juego base) define
 * `{colour_start|stun}` y compania. Stun, blight, bleed, burn, stress y buff
 * conservan su color: un jugador ya asocia el ambar con el aturdimiento.
 *
 * ## Buscados, donde el juego no distingue
 *
 * El juego reusa colores para cosas distintas -- mark y bleed el mismo rojo,
 * guard y buff el mismo cian, moverte y mover al enemigo el mismo azul-- y el
 * resto de categorias (Block, Controlled Burn, los costes propios...) no tiene
 * color en el juego. Elegirlos a ojo dio pares que Fran no distinguia (stun y
 * torch a ΔE 8, el daño extra pegado a los dos), asi que salen de una busqueda:
 * los colores del juego fijos, y cada otra categoria elegida DENTRO de un rango
 * con sentido (la curacion verde, la marca rosa, la antorcha amarilla...) y con
 * saturacion contenida, lo mas lejos posible en CIEDE2000 de todo lo ya puesto
 * -- incluidas las variantes de resistencia de cada familia (-35% / +30%), que
 * tambien ocupan sitio: sin contarlas, "+X% Debuff Resist" caia a ΔE 5 del
 * coste propio y "-X% Stun Resist" a ΔE 5 del debuff. `skillColours.test` fija
 * los pares que Fran vio confundirse. Controlled Burn se oscurecio a mano
 * despues (ver su linea).
 *
 * ## Texto y borde son el mismo color
 *
 * `keywordColour` devuelve el color de la categoria, aclarado solo lo justo para
 * leerse como texto pequeño sobre gris-900 (`legible`). Asi "Block" en el hover
 * y el borde del icono de Serpent Sway se reconocen como lo mismo.
 */

/** Mezcla un color con negro (amount < 0) o blanco (amount > 0). */
export const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const mix = (c) => Math.round(c + (target - c) * t);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c((n >> 16) & 255) + 0.7152 * c((n >> 8) & 255) + 0.0722 * c(n & 255);
};
const BACKGROUND = luminance('#111827');
const contrast = (hex) => (luminance(hex) + 0.05) / (BACKGROUND + 0.05);

/** El mismo color, aclarado lo justo para leerse como texto (4.5:1). */
export const legible = (hex, min = 4.5) => {
  let out = hex;
  for (let i = 0; i < 20 && contrast(out) < min; i += 1) out = shade(out, 0.1);
  return out;
};

/**
 * Lo que una skill HACE, por color. No hay un color por estadistica (+DODGE,
 * +SPD, +PROT son todos `buff`): quince tonos no se recuerdan.
 */
export const EFFECT_COLOURS = {
  plain: '#7b8190',
  // Del juego.
  stun: '#d8ac55',
  blight: '#bdc241',
  bleed: '#e5483a',
  burn: '#ff7a1a',
  stressHeal: '#e0ddce',
  buff: '#5ec9d6',
  // Buscados.
  heal: '#43b171',
  mark: '#ef39b2',
  enemyMove: '#2b9dee',
  selfMove: '#35d4ba',
  debuff: '#a67359',
  torch: '#faf32e',
  bonus: '#dcbaee',
  guard: '#b3b9c7',
  block: '#9e69d3',
  stealth: '#9790df',
  bypass: '#c4eec4',
  riposte: '#ab7385',
  cleanse: '#bee0da',
  disease: '#506d3b',
  // Oscuro a proposito: comparte icono con la Burn corriente y tiene que
  // separarse de ella. La busqueda lo aclaraba para esquivar "-X% Burn Resist",
  // que ningun dato del juego usa (ver RESIST_FAMILY).
  controlledBurn: '#aa470e',
  burnBoost: '#f7c0a1',
  // Lo que la skill te cuesta.
  selfDebuff: '#746d63',
  selfBleed: '#884954',
};

/**
 * Las cosas que tienen resistencia en los datos, y el color de su familia.
 *
 * Sin `burn`: ninguna skill, trinket ni quirk dice "Burn Resist", y una familia
 * que no aparece solo ocupaba sitio en la paleta -- empujaba al Controlled Burn
 * hacia el naranja de la Burn corriente, con la que comparte icono.
 */
export const RESIST_FAMILY = {
  stun: EFFECT_COLOURS.stun,
  blight: EFFECT_COLOURS.blight,
  bleed: EFFECT_COLOURS.bleed,
  move: EFFECT_COLOURS.enemyMove,
  debuff: EFFECT_COLOURS.debuff,
  disease: EFFECT_COLOURS.disease,
};

/**
 * `resistDown:blight` / `resistUp:bleed` -> la familia mas oscura (se la quitas
 * al enemigo) o mas clara (se la das a los tuyos); el resto, de la tabla.
 */
export const effectColour = (category) => {
  const [kind, family] = category.split(':');
  if (family && RESIST_FAMILY[family]) {
    return kind === 'resistDown' ? shade(RESIST_FAMILY[family], -0.35) : shade(RESIST_FAMILY[family], 0.3);
  }
  return EFFECT_COLOURS[category] || EFFECT_COLOURS.plain;
};

/**
 * Las palabras clave del texto y su color. `game` es el valor del fichero del
 * juego cuando lo hay; `effect` es la categoria cuyo color comparten, para que
 * texto y borde digan lo mismo.
 */
export const KEYWORD_COLOURS = {
  stun: { game: '#c99c45', effect: 'stun' },
  move: { game: '#4c8ba2', effect: 'enemyMove' },
  selfMove: { game: '#4c8ba2', effect: 'selfMove' },
  blight: { game: '#bdc241', effect: 'blight' },
  bleed: { game: '#b10000', effect: 'bleed' },
  burn: { game: '#ff6a00', effect: 'burn' },
  controlledBurn: { game: null, effect: 'controlledBurn' },
  debuff: { game: '#c3630f', effect: 'debuff' },
  buff: { game: '#5ec9d6', effect: 'buff' },
  mark: { game: '#b10000', effect: 'mark' },
  deathdoor: { game: '#b10000', effect: 'bleed' },
  deathblow: { game: '#b10000', effect: 'bleed' },
  disease: { game: '#798d45', effect: 'disease' },
  stress: { game: '#e0ddce', effect: 'stressHeal' },
  virtue: { game: '#e0ddce', text: '#f3ecc8' },
  afflicted: { game: '#b11900', text: '#e0452a' },
  scouting: { game: '#55998b', text: '#6bb3a4' },
  surprised: { game: '#55998b', text: '#6bb3a4' },
  riposte: { game: '#c3630f', effect: 'riposte' },
  guard: { game: '#5ec9d6', effect: 'guard' },
  block: { game: null, effect: 'block' },
  bypass: { game: null, effect: 'bypass' },
  torch: { game: null, effect: 'torch' },
  trap: { game: '#8860b2', text: '#a17fcb' },
  healhp: { game: '#87c241', effect: 'heal' },
  stealth: { game: '#443f86', effect: 'stealth' },
};

/** El color de texto de una palabra clave, o null. */
export const keywordColour = (keyword) => {
  const entry = KEYWORD_COLOURS[keyword];
  if (!entry) return null;
  return legible(entry.text || effectColour(entry.effect));
};
