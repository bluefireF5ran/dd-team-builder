/**
 * GENERADO - no editar a mano. Lo reescribe:
 *   node scripts/importHeroStats.js --game <DarkestDungeon> [--workshop <262060>]
 *
 * Lo que un heroe ES: vida, esquiva, armadura, velocidad, critico y daño por
 * rango de equipo, mas sus ocho resistencias. Leido de `<hero>.info.darkest`,
 * que es de donde lo lee el juego.
 *
 * `gear` va indexado por RANGO DE EQUIPO (0..4), que no es el nivel de
 * resolucion: la resolucion llega a 6, el equipo a 4, y subir de resolucion no
 * sube el equipo, solo permite pagarlo.
 *
 * `resistances` son las de BASE. El juego las sube con la resolucion y ese
 * incremento no esta en ningun fichero del juego, asi que no se inventa aqui.
 *
 * No hay ACC: `weapon.atk` es 0% en las veinte clases y la puntería vive en la
 * skill, donde `skillEffects.js` ya la lleva.
 */

/** Las veinte clases del juego base y sus DLC. */
export const HERO_STATS = {
  'Abomination': {
    resistances: { stun: 40, blight: 60, bleed: 30, disease: 20, move: 40, debuff: 20, death: 67, trap: 10 },
    gear: [
      { hp: 26, dodge: 7.5, prot: 0, spd: 7, crit: 2, dmgMin: 6, dmgMax: 11 },
      { hp: 31, dodge: 12.5, prot: 0, spd: 7, crit: 3, dmgMin: 7, dmgMax: 13 },
      { hp: 36, dodge: 17.5, prot: 0, spd: 8, crit: 4, dmgMin: 8, dmgMax: 15 },
      { hp: 41, dodge: 22.5, prot: 0, spd: 8, crit: 5, dmgMin: 10, dmgMax: 18 },
      { hp: 46, dodge: 27.5, prot: 0, spd: 9, crit: 6, dmgMin: 11, dmgMax: 20 },
    ],
  },
  'Antiquarian': {
    resistances: { stun: 20, blight: 20, bleed: 20, disease: 20, move: 20, debuff: 20, death: 67, trap: 10 },
    gear: [
      { hp: 17, dodge: 10, prot: 0, spd: 5, crit: 1, dmgMin: 3, dmgMax: 5 },
      { hp: 20, dodge: 15, prot: 0, spd: 5, crit: 2, dmgMin: 4, dmgMax: 6 },
      { hp: 23, dodge: 20, prot: 0, spd: 6, crit: 3, dmgMin: 4, dmgMax: 7 },
      { hp: 26, dodge: 25, prot: 0, spd: 6, crit: 4, dmgMin: 5, dmgMax: 8 },
      { hp: 29, dodge: 30, prot: 0, spd: 7, crit: 5, dmgMin: 5, dmgMax: 9 },
    ],
  },
  'Arbalest': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 27, dodge: 0, prot: 0, spd: 3, crit: 6, dmgMin: 4, dmgMax: 8 },
      { hp: 32, dodge: 5, prot: 0, spd: 3, crit: 7, dmgMin: 5, dmgMax: 10 },
      { hp: 37, dodge: 10, prot: 0, spd: 4, crit: 8, dmgMin: 6, dmgMax: 11 },
      { hp: 42, dodge: 15, prot: 0, spd: 4, crit: 9, dmgMin: 6, dmgMax: 13 },
      { hp: 47, dodge: 20, prot: 0, spd: 5, crit: 10, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Bounty Hunter': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 20, move: 40, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 25, dodge: 5, prot: 0, spd: 5, crit: 4, dmgMin: 5, dmgMax: 10 },
      { hp: 30, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 6, dmgMax: 12 },
      { hp: 35, dodge: 15, prot: 0, spd: 6, crit: 6, dmgMin: 7, dmgMax: 13 },
      { hp: 40, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 7, dmgMax: 15 },
      { hp: 45, dodge: 25, prot: 0, spd: 7, crit: 8, dmgMin: 8, dmgMax: 16 },
    ],
  },
  'Crusader': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 33, dodge: 5, prot: 0, spd: 1, crit: 3, dmgMin: 6, dmgMax: 12 },
      { hp: 40, dodge: 10, prot: 0, spd: 1, crit: 4, dmgMin: 7, dmgMax: 14 },
      { hp: 47, dodge: 15, prot: 0, spd: 2, crit: 5, dmgMin: 8, dmgMax: 16 },
      { hp: 54, dodge: 20, prot: 0, spd: 2, crit: 6, dmgMin: 9, dmgMax: 17 },
      { hp: 61, dodge: 25, prot: 0, spd: 3, crit: 7, dmgMin: 10, dmgMax: 19 },
    ],
  },
  'Duelist': {
    resistances: { stun: 30, blight: 30, bleed: 30, disease: 30, move: 30, debuff: 40, death: 67, trap: 10 },
    gear: [
      { hp: 20, dodge: 5, prot: 0, spd: 6, crit: 5, dmgMin: 5, dmgMax: 7 },
      { hp: 24, dodge: 10, prot: 0, spd: 6, crit: 6, dmgMin: 6, dmgMax: 8 },
      { hp: 28, dodge: 15, prot: 0, spd: 7, crit: 7, dmgMin: 7, dmgMax: 10 },
      { hp: 32, dodge: 20, prot: 0, spd: 7, crit: 8, dmgMin: 7, dmgMax: 11 },
      { hp: 36, dodge: 25, prot: 0, spd: 8, crit: 9, dmgMin: 8, dmgMax: 13 },
    ],
  },
  'Flagellant': {
    resistances: { stun: 50, blight: 30, bleed: 65, disease: 40, move: 50, debuff: 30, death: 73, trap: 0 },
    gear: [
      { hp: 22, dodge: 0, prot: 0, spd: 6, crit: 2, dmgMin: 3, dmgMax: 6 },
      { hp: 26, dodge: 5, prot: 0, spd: 6, crit: 3, dmgMin: 4, dmgMax: 7 },
      { hp: 30, dodge: 10, prot: 0, spd: 8, crit: 4, dmgMin: 4, dmgMax: 8 },
      { hp: 34, dodge: 15, prot: 0, spd: 8, crit: 5, dmgMin: 5, dmgMax: 10 },
      { hp: 38, dodge: 20, prot: 0, spd: 9, crit: 6, dmgMin: 5, dmgMax: 11 },
    ],
  },
  'Grave Robber': {
    resistances: { stun: 20, blight: 50, bleed: 30, disease: 30, move: 20, debuff: 30, death: 67, trap: 50 },
    gear: [
      { hp: 20, dodge: 10, prot: 0, spd: 8, crit: 6, dmgMin: 4, dmgMax: 8 },
      { hp: 24, dodge: 15, prot: 0, spd: 8, crit: 7, dmgMin: 5, dmgMax: 10 },
      { hp: 28, dodge: 20, prot: 0, spd: 9, crit: 8, dmgMin: 6, dmgMax: 11 },
      { hp: 32, dodge: 25, prot: 0, spd: 9, crit: 9, dmgMin: 6, dmgMax: 13 },
      { hp: 36, dodge: 30, prot: 0, spd: 10, crit: 10, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Hellion': {
    resistances: { stun: 40, blight: 40, bleed: 40, disease: 30, move: 40, debuff: 30, death: 67, trap: 20 },
    gear: [
      { hp: 26, dodge: 10, prot: 0, spd: 4, crit: 5, dmgMin: 6, dmgMax: 12 },
      { hp: 31, dodge: 15, prot: 0, spd: 4, crit: 6, dmgMin: 7, dmgMax: 14 },
      { hp: 36, dodge: 20, prot: 0, spd: 5, crit: 7, dmgMin: 8, dmgMax: 16 },
      { hp: 41, dodge: 25, prot: 0, spd: 5, crit: 8, dmgMin: 9, dmgMax: 17 },
      { hp: 46, dodge: 30, prot: 0, spd: 6, crit: 9, dmgMin: 10, dmgMax: 19 },
    ],
  },
  'Highwayman': {
    resistances: { stun: 30, blight: 30, bleed: 30, disease: 30, move: 30, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 23, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 5, dmgMax: 10 },
      { hp: 28, dodge: 15, prot: 0, spd: 5, crit: 6, dmgMin: 6, dmgMax: 12 },
      { hp: 33, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 7, dmgMax: 13 },
      { hp: 38, dodge: 25, prot: 0, spd: 6, crit: 8, dmgMin: 8, dmgMax: 15 },
      { hp: 43, dodge: 30, prot: 0, spd: 7, crit: 9, dmgMin: 9, dmgMax: 16 },
    ],
  },
  'Houndmaster': {
    resistances: { stun: 40, blight: 40, bleed: 40, disease: 30, move: 40, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 21, dodge: 10, prot: 0, spd: 5, crit: 4, dmgMin: 4, dmgMax: 7 },
      { hp: 25, dodge: 15, prot: 0, spd: 5, crit: 5, dmgMin: 5, dmgMax: 8 },
      { hp: 29, dodge: 20, prot: 0, spd: 6, crit: 6, dmgMin: 6, dmgMax: 10 },
      { hp: 33, dodge: 25, prot: 0, spd: 6, crit: 7, dmgMin: 6, dmgMax: 11 },
      { hp: 37, dodge: 30, prot: 0, spd: 7, crit: 8, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Jester': {
    resistances: { stun: 20, blight: 40, bleed: 30, disease: 20, move: 20, debuff: 40, death: 67, trap: 30 },
    gear: [
      { hp: 19, dodge: 15, prot: 0, spd: 7, crit: 4, dmgMin: 4, dmgMax: 7 },
      { hp: 23, dodge: 20, prot: 0, spd: 7, crit: 5, dmgMin: 5, dmgMax: 8 },
      { hp: 27, dodge: 25, prot: 0, spd: 8, crit: 6, dmgMin: 6, dmgMax: 10 },
      { hp: 31, dodge: 30, prot: 0, spd: 8, crit: 7, dmgMin: 6, dmgMax: 11 },
      { hp: 35, dodge: 35, prot: 0, spd: 9, crit: 8, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Leper': {
    resistances: { stun: 60, blight: 40, bleed: 10, disease: 20, move: 60, debuff: 40, death: 67, trap: 10 },
    gear: [
      { hp: 35, dodge: 0, prot: 0, spd: 2, crit: 1, dmgMin: 8, dmgMax: 16 },
      { hp: 42, dodge: 5, prot: 0, spd: 2, crit: 2, dmgMin: 9, dmgMax: 18 },
      { hp: 49, dodge: 10, prot: 0, spd: 3, crit: 3, dmgMin: 10, dmgMax: 21 },
      { hp: 56, dodge: 15, prot: 0, spd: 3, crit: 4, dmgMin: 12, dmgMax: 23 },
      { hp: 63, dodge: 20, prot: 0, spd: 4, crit: 5, dmgMin: 13, dmgMax: 26 },
    ],
  },
  'Man at Arms': {
    resistances: { stun: 40, blight: 30, bleed: 40, disease: 30, move: 40, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 31, dodge: 5, prot: 0, spd: 3, crit: 2, dmgMin: 5, dmgMax: 9 },
      { hp: 37, dodge: 10, prot: 0, spd: 3, crit: 3, dmgMin: 6, dmgMax: 10 },
      { hp: 43, dodge: 15, prot: 0, spd: 4, crit: 4, dmgMin: 7, dmgMax: 12 },
      { hp: 49, dodge: 20, prot: 0, spd: 4, crit: 5, dmgMin: 7, dmgMax: 13 },
      { hp: 55, dodge: 25, prot: 0, spd: 5, crit: 6, dmgMin: 8, dmgMax: 14 },
    ],
  },
  'Musketeer': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 27, dodge: 0, prot: 0, spd: 3, crit: 6, dmgMin: 4, dmgMax: 8 },
      { hp: 32, dodge: 5, prot: 0, spd: 3, crit: 7, dmgMin: 5, dmgMax: 10 },
      { hp: 37, dodge: 10, prot: 0, spd: 4, crit: 8, dmgMin: 6, dmgMax: 11 },
      { hp: 42, dodge: 15, prot: 0, spd: 4, crit: 9, dmgMin: 6, dmgMax: 13 },
      { hp: 47, dodge: 20, prot: 0, spd: 5, crit: 10, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Occultist': {
    resistances: { stun: 20, blight: 30, bleed: 40, disease: 40, move: 20, debuff: 60, death: 67, trap: 10 },
    gear: [
      { hp: 19, dodge: 10, prot: 0, spd: 6, crit: 6, dmgMin: 4, dmgMax: 7 },
      { hp: 23, dodge: 15, prot: 0, spd: 6, crit: 7, dmgMin: 5, dmgMax: 8 },
      { hp: 27, dodge: 20, prot: 0, spd: 7, crit: 8, dmgMin: 6, dmgMax: 10 },
      { hp: 31, dodge: 25, prot: 0, spd: 7, crit: 9, dmgMin: 6, dmgMax: 11 },
      { hp: 35, dodge: 30, prot: 0, spd: 8, crit: 10, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Plague Doctor': {
    resistances: { stun: 20, blight: 60, bleed: 20, disease: 50, move: 20, debuff: 50, death: 67, trap: 20 },
    gear: [
      { hp: 22, dodge: 0, prot: 0, spd: 7, crit: 2, dmgMin: 4, dmgMax: 7 },
      { hp: 26, dodge: 5, prot: 0, spd: 7, crit: 3, dmgMin: 5, dmgMax: 8 },
      { hp: 30, dodge: 10, prot: 0, spd: 8, crit: 4, dmgMin: 6, dmgMax: 10 },
      { hp: 34, dodge: 15, prot: 0, spd: 8, crit: 5, dmgMin: 6, dmgMax: 11 },
      { hp: 38, dodge: 20, prot: 0, spd: 9, crit: 6, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Runaway': {
    resistances: { stun: 20, blight: 40, bleed: 40, disease: 30, move: 30, debuff: 20, death: 67, trap: 30 },
    gear: [
      { hp: 23, dodge: 5, prot: 0, spd: 5, crit: 4, dmgMin: 4, dmgMax: 7 },
      { hp: 28, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 5, dmgMax: 8 },
      { hp: 33, dodge: 15, prot: 0, spd: 6, crit: 6, dmgMin: 6, dmgMax: 10 },
      { hp: 38, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 6, dmgMax: 11 },
      { hp: 43, dodge: 25, prot: 0, spd: 7, crit: 8, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Shieldbreaker': {
    resistances: { stun: 50, blight: 20, bleed: 30, disease: 30, move: 50, debuff: 30, death: 67, trap: 20 },
    gear: [
      { hp: 20, dodge: 8, prot: 0, spd: 5, crit: 6, dmgMin: 5, dmgMax: 10 },
      { hp: 24, dodge: 13, prot: 0, spd: 6, crit: 7, dmgMin: 6, dmgMax: 12 },
      { hp: 28, dodge: 18, prot: 0, spd: 8, crit: 8, dmgMin: 7, dmgMax: 14 },
      { hp: 32, dodge: 23, prot: 0, spd: 8, crit: 9, dmgMin: 8, dmgMax: 16 },
      { hp: 36, dodge: 28, prot: 0, spd: 9, crit: 10, dmgMin: 9, dmgMax: 18 },
    ],
  },
  'Vestal': {
    resistances: { stun: 30, blight: 30, bleed: 40, disease: 30, move: 30, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 24, dodge: 0, prot: 0, spd: 4, crit: 1, dmgMin: 4, dmgMax: 8 },
      { hp: 29, dodge: 5, prot: 0, spd: 4, crit: 2, dmgMin: 5, dmgMax: 10 },
      { hp: 34, dodge: 10, prot: 0, spd: 5, crit: 3, dmgMin: 6, dmgMax: 11 },
      { hp: 39, dodge: 15, prot: 0, spd: 5, crit: 4, dmgMin: 6, dmgMax: 13 },
      { hp: 44, dodge: 20, prot: 0, spd: 6, crit: 5, dmgMin: 7, dmgMax: 14 },
    ],
  },
};

/** Las modded que el workshop instalado dejo leer. Crece al instalar mas. */
export const MODDED_HERO_STATS = {
  'Arbiter': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 30, debuff: 30, death: 67, trap: 30 },
    gear: [
      { hp: 31, dodge: 5, prot: 0, spd: 3, crit: 4, dmgMin: 6, dmgMax: 12 },
      { hp: 37, dodge: 10, prot: 0, spd: 3, crit: 5, dmgMin: 7, dmgMax: 14 },
      { hp: 42, dodge: 15, prot: 0, spd: 4, crit: 6, dmgMin: 8, dmgMax: 16 },
      { hp: 46, dodge: 20, prot: 0, spd: 4, crit: 7, dmgMin: 9, dmgMax: 17 },
      { hp: 50, dodge: 25, prot: 0, spd: 5, crit: 8, dmgMin: 10, dmgMax: 19 },
    ],
  },
  'Bombard': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 30, death: 67, trap: 15 },
    gear: [
      { hp: 27, dodge: 0, prot: 0, spd: 2, crit: 4, dmgMin: 7, dmgMax: 9 },
      { hp: 32, dodge: 5, prot: 0, spd: 2, crit: 5, dmgMin: 8, dmgMax: 10 },
      { hp: 37, dodge: 10, prot: 0, spd: 3, crit: 6, dmgMin: 9, dmgMax: 11 },
      { hp: 42, dodge: 15, prot: 0, spd: 3, crit: 7, dmgMin: 10, dmgMax: 12 },
      { hp: 47, dodge: 20, prot: 0, spd: 4, crit: 8, dmgMin: 11, dmgMax: 13 },
    ],
  },
  'Bowman': {
    resistances: { stun: 30, blight: 30, bleed: 20, disease: 20, move: 40, debuff: 40, death: 67, trap: 50 },
    gear: [
      { hp: 20, dodge: 10, prot: 0, spd: 4, crit: 6, dmgMin: 4, dmgMax: 8 },
      { hp: 24, dodge: 15, prot: 0, spd: 4, crit: 7, dmgMin: 5, dmgMax: 10 },
      { hp: 28, dodge: 20, prot: 0, spd: 5, crit: 8, dmgMin: 6, dmgMax: 11 },
      { hp: 32, dodge: 25, prot: 0, spd: 5, crit: 9, dmgMin: 6, dmgMax: 13 },
      { hp: 36, dodge: 30, prot: 0, spd: 6, crit: 10, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Crystalline Herald': {
    resistances: { stun: 60, blight: 20, bleed: 50, disease: 0, move: 10, debuff: 20, death: 67, trap: 10 },
    gear: [
      { hp: 29, dodge: 5, prot: null, spd: 3, crit: 2, dmgMin: 3, dmgMax: 8 },
      { hp: 34, dodge: 10, prot: null, spd: 3, crit: 3, dmgMin: 4, dmgMax: 9 },
      { hp: 39, dodge: 15, prot: null, spd: 4, crit: 3, dmgMin: 5, dmgMax: 10 },
      { hp: 44, dodge: 20, prot: null, spd: 4, crit: 4, dmgMin: 6, dmgMax: 11 },
      { hp: 49, dodge: 25, prot: null, spd: 5, crit: 4, dmgMin: 7, dmgMax: 12 },
    ],
  },
  'Duchess (3325173032)': {
    resistances: { stun: 30, blight: 50, bleed: 0, disease: 25, move: 60, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 31, dodge: 0, prot: 0, spd: 4, crit: 4, dmgMin: 6, dmgMax: 10 },
      { hp: 38, dodge: 5, prot: 0, spd: 4, crit: 5, dmgMin: 7, dmgMax: 12 },
      { hp: 45, dodge: 10, prot: 0, spd: 5, crit: 6, dmgMin: 8, dmgMax: 14 },
      { hp: 52, dodge: 15, prot: 0, spd: 5, crit: 7, dmgMin: 9, dmgMax: 16 },
      { hp: 59, dodge: 20, prot: 0, spd: 6, crit: 8, dmgMin: 10, dmgMax: 18 },
    ],
  },
  'Forlorn': {
    resistances: { stun: 40, blight: 20, bleed: 30, disease: 50, move: 30, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 25, dodge: 5, prot: 0, spd: 5, crit: 3, dmgMin: 4, dmgMax: 8 },
      { hp: 30, dodge: 10, prot: 0, spd: 5, crit: 4, dmgMin: 5, dmgMax: 9 },
      { hp: 35, dodge: 15, prot: 0, spd: 6, crit: 5, dmgMin: 6, dmgMax: 10 },
      { hp: 40, dodge: 20, prot: 0, spd: 6, crit: 6, dmgMin: 7, dmgMax: 11 },
      { hp: 45, dodge: 25, prot: 0, spd: 7, crit: 7, dmgMin: 8, dmgMax: 12 },
    ],
  },
  'Fox of Calamity': {
    resistances: { stun: 50, blight: 30, bleed: 30, disease: 20, move: 20, debuff: 20, death: 67, trap: 40 },
    gear: [
      { hp: 22, dodge: 10, prot: 0, spd: 7, crit: 4, dmgMin: 5, dmgMax: 10 },
      { hp: 26, dodge: 15, prot: 0, spd: 7, crit: 5, dmgMin: 6, dmgMax: 11 },
      { hp: 30, dodge: 20, prot: 0, spd: 8, crit: 6, dmgMin: 7, dmgMax: 13 },
      { hp: 34, dodge: 25, prot: 0, spd: 8, crit: 7, dmgMin: 8, dmgMax: 15 },
      { hp: 38, dodge: 30, prot: 0, spd: 9, crit: 8, dmgMin: 9, dmgMax: 17 },
    ],
  },
  'Hedge Knight': {
    resistances: { stun: 40, blight: 20, bleed: 25, disease: 30, move: 45, debuff: 40, death: 67, trap: 10 },
    gear: [
      { hp: 31, dodge: 0, prot: 0, spd: 0, crit: 2, dmgMin: 6, dmgMax: 12 },
      { hp: 37, dodge: 5, prot: 0, spd: 0, crit: 3, dmgMin: 7, dmgMax: 14 },
      { hp: 43, dodge: 10, prot: 0, spd: 1, crit: 4, dmgMin: 8, dmgMax: 16 },
      { hp: 49, dodge: 15, prot: 0, spd: 1, crit: 5, dmgMin: 9, dmgMax: 17 },
      { hp: 55, dodge: 20, prot: 0, spd: 2, crit: 6, dmgMin: 10, dmgMax: 19 },
    ],
  },
  'Ironclad': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 30, death: 67, trap: 10 },
    gear: [
      { hp: 33, dodge: 5, prot: 0, spd: 3, crit: 2, dmgMin: 4, dmgMax: 8 },
      { hp: 40, dodge: 10, prot: 0, spd: 3, crit: 3, dmgMin: 5, dmgMax: 10 },
      { hp: 47, dodge: 15, prot: 0, spd: 4, crit: 4, dmgMin: 6, dmgMax: 11 },
      { hp: 54, dodge: 20, prot: 0, spd: 4, crit: 5, dmgMin: 7, dmgMax: 13 },
      { hp: 61, dodge: 25, prot: 0, spd: 5, crit: 6, dmgMin: 8, dmgMax: 14 },
    ],
  },
  'Judicator': {
    resistances: { stun: 20, blight: 30, bleed: 40, disease: 20, move: 30, debuff: 60, death: 67, trap: 10 },
    gear: [
      { hp: 30, dodge: 5, prot: 0, spd: 2, crit: 3, dmgMin: 5, dmgMax: 10 },
      { hp: 36, dodge: 10, prot: 0, spd: 2, crit: 4, dmgMin: 6, dmgMax: 12 },
      { hp: 42, dodge: 15, prot: 0, spd: 3, crit: 5, dmgMin: 7, dmgMax: 14 },
      { hp: 48, dodge: 20, prot: 0, spd: 3, crit: 6, dmgMin: 8, dmgMax: 16 },
      { hp: 54, dodge: 25, prot: 0, spd: 4, crit: 7, dmgMin: 9, dmgMax: 18 },
    ],
  },
  'Kuuga': {
    resistances: { stun: 50, blight: 50, bleed: 65, disease: 115, move: 50, debuff: 50, death: 87, trap: 10 },
    gear: [
      { hp: 35, dodge: 0, prot: 0, spd: 5, crit: 2, dmgMin: 6, dmgMax: 12 },
      { hp: 45, dodge: 5, prot: 0, spd: 5, crit: 3, dmgMin: 7, dmgMax: 14 },
      { hp: 55, dodge: 10, prot: 0, spd: 6, crit: 4, dmgMin: 8, dmgMax: 16 },
      { hp: 65, dodge: 15, prot: 0, spd: 6, crit: 5, dmgMin: 9, dmgMax: 18 },
      { hp: 75, dodge: 20, prot: 0, spd: 7, crit: 6, dmgMin: 10, dmgMax: 20 },
    ],
  },
  'Legion': {
    resistances: { stun: 50, blight: 30, bleed: 30, disease: 30, move: 50, debuff: 20, death: 67, trap: 10 },
    gear: [
      { hp: 31, dodge: 0, prot: 0, spd: 3, crit: 3, dmgMin: 5, dmgMax: 10 },
      { hp: 37, dodge: 5, prot: 0, spd: 3, crit: 4, dmgMin: 6, dmgMax: 12 },
      { hp: 43, dodge: 10, prot: 0, spd: 4, crit: 5, dmgMin: 7, dmgMax: 14 },
      { hp: 49, dodge: 15, prot: 0, spd: 4, crit: 6, dmgMin: 8, dmgMax: 16 },
      { hp: 55, dodge: 20, prot: 0, spd: 5, crit: 7, dmgMin: 9, dmgMax: 18 },
    ],
  },
  'Loot Hunter': {
    resistances: { stun: 20, blight: 50, bleed: 50, disease: 30, move: 50, debuff: 10, death: 67, trap: 10 },
    gear: [
      { hp: 35, dodge: 0, prot: 0, spd: 1, crit: 1, dmgMin: 6, dmgMax: 12 },
      { hp: 42, dodge: 5, prot: 0, spd: 1, crit: 2, dmgMin: 7, dmgMax: 14 },
      { hp: 49, dodge: 10, prot: 0, spd: 2, crit: 3, dmgMin: 8, dmgMax: 16 },
      { hp: 56, dodge: 15, prot: 0, spd: 2, crit: 4, dmgMin: 9, dmgMax: 17 },
      { hp: 63, dodge: 20, prot: 0, spd: 3, crit: 5, dmgMin: 10, dmgMax: 19 },
    ],
  },
  'Lunar Princess': {
    resistances: { stun: 30, blight: 40, bleed: 30, disease: 50, move: 20, debuff: 50, death: 67, trap: 20 },
    gear: [
      { hp: 16, dodge: 15, prot: 0, spd: 6, crit: 3, dmgMin: 5, dmgMax: 9 },
      { hp: 20, dodge: 20, prot: 0, spd: 6, crit: 4, dmgMin: 6, dmgMax: 10 },
      { hp: 24, dodge: 25, prot: 0, spd: 7, crit: 5, dmgMin: 7, dmgMax: 11 },
      { hp: 28, dodge: 30, prot: 0, spd: 7, crit: 6, dmgMin: 7, dmgMax: 13 },
      { hp: 32, dodge: 35, prot: 0, spd: 8, crit: 7, dmgMin: 8, dmgMax: 14 },
    ],
  },
  'Martial Saint': {
    resistances: { stun: 40, blight: 20, bleed: 50, disease: 30, move: 30, debuff: 20, death: 67, trap: 20 },
    gear: [
      { hp: 28, dodge: 10, prot: 0, spd: 1, crit: 5, dmgMin: 5, dmgMax: 11 },
      { hp: 33, dodge: 15, prot: 0, spd: 1, crit: 6, dmgMin: 6, dmgMax: 13 },
      { hp: 39, dodge: 20, prot: 0, spd: 2, crit: 7, dmgMin: 7, dmgMax: 15 },
      { hp: 44, dodge: 25, prot: 0, spd: 2, crit: 8, dmgMin: 8, dmgMax: 16 },
      { hp: 50, dodge: 30, prot: 0, spd: 3, crit: 9, dmgMin: 9, dmgMax: 18 },
    ],
  },
  'Matriarch': {
    resistances: { stun: 40, blight: 65, bleed: 20, disease: 40, move: 60, debuff: 10, death: 67, trap: 0 },
    gear: [
      { hp: 43, dodge: 0, prot: 0, spd: 1, crit: 1, dmgMin: 5, dmgMax: 10 },
      { hp: 48, dodge: 5, prot: 0, spd: 1, crit: 2, dmgMin: 6, dmgMax: 12 },
      { hp: 53, dodge: 10, prot: 0, spd: 2, crit: 3, dmgMin: 7, dmgMax: 13 },
      { hp: 58, dodge: 15, prot: 0, spd: 2, crit: 4, dmgMin: 7, dmgMax: 15 },
      { hp: 63, dodge: 20, prot: 0, spd: 3, crit: 5, dmgMin: 8, dmgMax: 16 },
    ],
  },
  'Messiah': {
    resistances: { stun: 20, blight: 20, bleed: 20, disease: 20, move: 30, debuff: 45, death: 67, trap: 30 },
    gear: [
      { hp: 18, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 4, dmgMax: 7 },
      { hp: 21, dodge: 15, prot: 0, spd: 6, crit: 6, dmgMin: 5, dmgMax: 8 },
      { hp: 24, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 6, dmgMax: 10 },
      { hp: 27, dodge: 25, prot: 0, spd: 7, crit: 8, dmgMin: 6, dmgMax: 12 },
      { hp: 30, dodge: 30, prot: 0, spd: 7, crit: 9, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Miscreant (3786371991)': {
    resistances: { stun: 20, blight: 40, bleed: 40, disease: 50, move: 20, debuff: 20, death: 67, trap: 20 },
    gear: [
      { hp: 19, dodge: 15, prot: 0, spd: 7, crit: 6, dmgMin: 5, dmgMax: 9 },
      { hp: 23, dodge: 20, prot: 0, spd: 7, crit: 7, dmgMin: 6, dmgMax: 10 },
      { hp: 27, dodge: 25, prot: 0, spd: 8, crit: 8, dmgMin: 7, dmgMax: 12 },
      { hp: 31, dodge: 30, prot: 0, spd: 8, crit: 9, dmgMin: 7, dmgMax: 13 },
      { hp: 35, dodge: 35, prot: 0, spd: 9, crit: 10, dmgMin: 8, dmgMax: 14 },
    ],
  },
  'Mordekaiser': {
    resistances: { stun: 200, blight: 200, bleed: 200, disease: 999, move: 200, debuff: 50, death: 67, trap: 50 },
    gear: [
      { hp: 56, dodge: 0, prot: 0.1, spd: 3, crit: 2, dmgMin: 10, dmgMax: 14 },
      { hp: 62, dodge: 0, prot: 0.15, spd: 3, crit: 4, dmgMin: 12, dmgMax: 16 },
      { hp: 68, dodge: 0, prot: 0.2, spd: 3, crit: 6, dmgMin: 14, dmgMax: 18 },
      { hp: 74, dodge: 0, prot: 0.25, spd: 3, crit: 8, dmgMin: 16, dmgMax: 20 },
      { hp: 80, dodge: 0, prot: 0.3, spd: 4, crit: 10, dmgMin: 18, dmgMax: 22 },
    ],
  },
  'Nurse': {
    resistances: { stun: 20, blight: 50, bleed: 30, disease: 50, move: 20, debuff: 40, death: 87, trap: 10 },
    gear: [
      { hp: 21, dodge: 6, prot: 0, spd: 7, crit: 5, dmgMin: 6, dmgMax: 11 },
      { hp: 25, dodge: 11, prot: 0, spd: 7, crit: 6, dmgMin: 7, dmgMax: 13 },
      { hp: 29, dodge: 16, prot: 0, spd: 8, crit: 7, dmgMin: 8, dmgMax: 15 },
      { hp: 33, dodge: 21, prot: 0, spd: 8, crit: 8, dmgMin: 9, dmgMax: 17 },
      { hp: 37, dodge: 26, prot: 0, spd: 9, crit: 9, dmgMin: 11, dmgMax: 20 },
    ],
  },
  'Oni': {
    resistances: { stun: 50, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 40, death: 67, trap: 10 },
    gear: [
      { hp: 28, dodge: 7.5, prot: 0, spd: 4, crit: 6, dmgMin: 7, dmgMax: 14 },
      { hp: 34, dodge: 12.5, prot: 0, spd: 4, crit: 7, dmgMin: 8, dmgMax: 16 },
      { hp: 40, dodge: 17.5, prot: 0, spd: 5, crit: 8, dmgMin: 9, dmgMax: 18 },
      { hp: 46, dodge: 22.5, prot: 0, spd: 5, crit: 9, dmgMin: 10, dmgMax: 20 },
      { hp: 52, dodge: 27.5, prot: 0, spd: 6, crit: 10, dmgMin: 11, dmgMax: 22 },
    ],
  },
  'Owlwing': {
    resistances: { stun: 30, blight: 30, bleed: 40, disease: 30, move: 30, debuff: 30, death: 67, trap: 50 },
    gear: [
      { hp: 23, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 5, dmgMax: 8 },
      { hp: 28, dodge: 15, prot: 0, spd: 5, crit: 6, dmgMin: 6, dmgMax: 10 },
      { hp: 33, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 7, dmgMax: 11 },
      { hp: 38, dodge: 25, prot: 0, spd: 6, crit: 8, dmgMin: 7, dmgMax: 12 },
      { hp: 42, dodge: 30, prot: 0, spd: 7, crit: 9, dmgMin: 8, dmgMax: 14 },
    ],
  },
  'Pelagic Idol': {
    resistances: { stun: 20, blight: 10, bleed: 50, disease: 50, move: 20, debuff: 60, death: 67, trap: 20 },
    gear: [
      { hp: 18, dodge: 15, prot: 0, spd: 6, crit: 5, dmgMin: 4, dmgMax: 7 },
      { hp: 22, dodge: 20, prot: 0, spd: 6, crit: 6, dmgMin: 5, dmgMax: 8 },
      { hp: 26, dodge: 25, prot: 0, spd: 7, crit: 7, dmgMin: 6, dmgMax: 9 },
      { hp: 30, dodge: 30, prot: 0, spd: 7, crit: 8, dmgMin: 7, dmgMax: 11 },
      { hp: 34, dodge: 35, prot: 0, spd: 8, crit: 9, dmgMin: 8, dmgMax: 13 },
    ],
  },
  'Reckoning': {
    resistances: { stun: 50, blight: 20, bleed: 20, disease: 40, move: 40, debuff: 30, death: 70, trap: 10 },
    gear: [
      { hp: 34, dodge: 5, prot: 0, spd: 1, crit: 1, dmgMin: 5, dmgMax: 12 },
      { hp: 41, dodge: 10, prot: 0, spd: 1, crit: 2, dmgMin: 6, dmgMax: 14 },
      { hp: 50, dodge: 15, prot: 0, spd: 2, crit: 3, dmgMin: 7, dmgMax: 16 },
      { hp: 55, dodge: 20, prot: 0, spd: 2, crit: 4, dmgMin: 8, dmgMax: 17 },
      { hp: 63, dodge: 25, prot: 0, spd: 3, crit: 5, dmgMin: 9, dmgMax: 19 },
    ],
  },
  'Salamander': {
    resistances: { stun: 20, blight: 20, bleed: 50, disease: 20, move: 20, debuff: 30, death: 67, trap: 20 },
    gear: [
      { hp: 22, dodge: 10, prot: 0, spd: 5, crit: 2, dmgMin: 4, dmgMax: 9 },
      { hp: 27, dodge: 15, prot: 0, spd: 5, crit: 3, dmgMin: 5, dmgMax: 10 },
      { hp: 32, dodge: 20, prot: 0, spd: 6, crit: 4, dmgMin: 6, dmgMax: 11 },
      { hp: 37, dodge: 25, prot: 0, spd: 6, crit: 0, dmgMin: 6, dmgMax: null },
      { hp: 42, dodge: 30, prot: 0, spd: 7, crit: 6, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Satyr': {
    resistances: { stun: 50, blight: 70, bleed: 20, disease: 40, move: 70, debuff: 0, death: 67, trap: 10 },
    gear: [
      { hp: 30, dodge: 0, prot: 0, spd: 4, crit: 3, dmgMin: 6, dmgMax: 11 },
      { hp: 36, dodge: 5, prot: 0, spd: 4, crit: 4, dmgMin: 7, dmgMax: 13 },
      { hp: 42, dodge: 10, prot: 0, spd: 5, crit: 5, dmgMin: 8, dmgMax: 15 },
      { hp: 48, dodge: 15, prot: 0, spd: 5, crit: 6, dmgMin: 9, dmgMax: 16 },
      { hp: 54, dodge: 20, prot: 0, spd: 6, crit: 7, dmgMin: 10, dmgMax: 18 },
    ],
  },
  'Saw Hunter': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 0, move: 20, debuff: 20, death: 67, trap: 40 },
    gear: [
      { hp: 20, dodge: 10, prot: 0, spd: 6, crit: 6, dmgMin: 5, dmgMax: 10 },
      { hp: 25, dodge: 15, prot: 0, spd: 6, crit: 7, dmgMin: 6, dmgMax: 12 },
      { hp: 30, dodge: 20, prot: 0, spd: 7, crit: 8, dmgMin: 7, dmgMax: 13 },
      { hp: 35, dodge: 25, prot: 0, spd: 7, crit: 9, dmgMin: 8, dmgMax: 14 },
      { hp: 40, dodge: 30, prot: 0, spd: 8, crit: 10, dmgMin: 9, dmgMax: 16 },
    ],
  },
  'Sibyl': {
    resistances: { stun: 20, blight: 40, bleed: 30, disease: 40, move: 20, debuff: 60, death: 67, trap: 20 },
    gear: [
      { hp: 19, dodge: 0, prot: 0, spd: 5, crit: 6, dmgMin: 3, dmgMax: 5 },
      { hp: 23, dodge: 5, prot: 0, spd: 5, crit: 7, dmgMin: 4, dmgMax: 6 },
      { hp: 27, dodge: 10, prot: 0, spd: 6, crit: 8, dmgMin: 4, dmgMax: 7 },
      { hp: 31, dodge: 15, prot: 0, spd: 6, crit: 9, dmgMin: 5, dmgMax: 8 },
      { hp: 35, dodge: 20, prot: 0, spd: 7, crit: 10, dmgMin: 5, dmgMax: 9 },
    ],
  },
  'Silent': {
    resistances: { stun: 50, blight: 50, bleed: 35, disease: 35, move: 10, debuff: 10, death: 67, trap: 25 },
    gear: [
      { hp: 18, dodge: 15, prot: 0, spd: 3, crit: 5, dmgMin: 3, dmgMax: 5 },
      { hp: 22, dodge: 20, prot: 0, spd: 3, crit: 6, dmgMin: 4, dmgMax: 6 },
      { hp: 28, dodge: 25, prot: 0, spd: 4, crit: 7, dmgMin: 5, dmgMax: 7 },
      { hp: 30, dodge: 30, prot: 0, spd: 4, crit: 8, dmgMin: 6, dmgMax: 8 },
      { hp: 34, dodge: 35, prot: 0, spd: 5, crit: 9, dmgMin: 7, dmgMax: 9 },
    ],
  },
  'Survivor': {
    resistances: { stun: 30, blight: 40, bleed: 30, disease: 30, move: 30, debuff: 30, death: 87, trap: 20 },
    gear: [
      { hp: 27, dodge: 6, prot: 0, spd: 5, crit: 3, dmgMin: 5, dmgMax: 9 },
      { hp: 32, dodge: 11, prot: 0, spd: 5, crit: 4, dmgMin: 6, dmgMax: 10 },
      { hp: 37, dodge: 16, prot: 0, spd: 6, crit: 5, dmgMin: 7, dmgMax: 12 },
      { hp: 42, dodge: 21, prot: 0, spd: 6, crit: 6, dmgMin: 7, dmgMax: 13 },
      { hp: 47, dodge: 26, prot: 0, spd: 7, crit: 7, dmgMin: 8, dmgMax: 15 },
    ],
  },
  'Tempest': {
    resistances: { stun: 30, blight: 10, bleed: 50, disease: 30, move: 10, debuff: 50, death: 67, trap: 40 },
    gear: [
      { hp: 19, dodge: 15, prot: 0, spd: 7, crit: 6, dmgMin: 4, dmgMax: 7 },
      { hp: 23, dodge: 20, prot: 0, spd: 7, crit: 7, dmgMin: 5, dmgMax: 8 },
      { hp: 27, dodge: 25, prot: 0, spd: 8, crit: 8, dmgMin: 6, dmgMax: 10 },
      { hp: 31, dodge: 30, prot: 0, spd: 8, crit: 9, dmgMin: 6, dmgMax: 11 },
      { hp: 35, dodge: 35, prot: 0, spd: 9, crit: 10, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Trapper': {
    resistances: { stun: 20, blight: 60, bleed: 20, disease: 30, move: 30, debuff: 30, death: 67, trap: 50 },
    gear: [
      { hp: 23, dodge: 5, prot: 0, spd: 7, crit: 4, dmgMin: 4, dmgMax: 8 },
      { hp: 28, dodge: 10, prot: 0, spd: 7, crit: 5, dmgMin: 5, dmgMax: 10 },
      { hp: 33, dodge: 15, prot: 0, spd: 8, crit: 6, dmgMin: 6, dmgMax: 11 },
      { hp: 38, dodge: 20, prot: 0, spd: 8, crit: 7, dmgMin: 6, dmgMax: 13 },
      { hp: 43, dodge: 25, prot: 0, spd: 9, crit: 8, dmgMin: 7, dmgMax: 14 },
    ],
  },
  'Twilight Knight': {
    resistances: { stun: 60, blight: 40, bleed: 10, disease: 20, move: 60, debuff: 40, death: 67, trap: 10 },
    gear: [
      { hp: 24, dodge: 10, prot: 0, spd: 3, crit: 4, dmgMin: 8, dmgMax: 12 },
      { hp: 30, dodge: 15, prot: 0, spd: 3, crit: 5, dmgMin: 9, dmgMax: 14 },
      { hp: 36, dodge: 20, prot: 0, spd: 4, crit: 6, dmgMin: 10, dmgMax: 15 },
      { hp: 42, dodge: 25, prot: 0, spd: 4, crit: 7, dmgMin: 11, dmgMax: 17 },
      { hp: 48, dodge: 30, prot: 0, spd: 5, crit: 8, dmgMin: 12, dmgMax: 18 },
    ],
  },
  'Uncrowneds': {
    resistances: { stun: 20, blight: 30, bleed: 30, disease: 20, move: 20, debuff: 30, death: 67, trap: 60 },
    gear: [
      { hp: 16, dodge: 15, prot: 0, spd: 7, crit: 4, dmgMin: 3, dmgMax: 6 },
      { hp: 20, dodge: 20, prot: 0, spd: 8, crit: 5, dmgMin: 4, dmgMax: 7 },
      { hp: 23, dodge: 25, prot: 0, spd: 8, crit: 6, dmgMin: 5, dmgMax: 9 },
      { hp: 26, dodge: 30, prot: 0, spd: 9, crit: 7, dmgMin: 5, dmgMax: 10 },
      { hp: 30, dodge: 35, prot: 0, spd: 10, crit: 8, dmgMin: 7, dmgMax: 12 },
    ],
  },
  'Veiled': {
    resistances: { stun: 20, blight: 10, bleed: 200, disease: 60, move: 10, debuff: 40, death: 67, trap: 0 },
    gear: [
      { hp: 20, dodge: 0, prot: 0, spd: 7, crit: 3, dmgMin: 4, dmgMax: 7 },
      { hp: 24, dodge: 5, prot: 0, spd: 7, crit: 4, dmgMin: 5, dmgMax: 8 },
      { hp: 28, dodge: 10, prot: 0, spd: 8, crit: 5, dmgMin: 6, dmgMax: 9 },
      { hp: 32, dodge: 15, prot: 0, spd: 8, crit: 6, dmgMin: 6, dmgMax: 11 },
      { hp: 36, dodge: 20, prot: 0, spd: 9, crit: 7, dmgMin: 7, dmgMax: 13 },
    ],
  },
  'Vessel': {
    resistances: { stun: 20, blight: 20, bleed: 80, disease: 60, move: 20, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 16, dodge: 15, prot: 0, spd: 8, crit: 2, dmgMin: 5, dmgMax: 10 },
      { hp: 19, dodge: 20, prot: 0, spd: 8, crit: 3, dmgMin: 6, dmgMax: 12 },
      { hp: 22, dodge: 25, prot: 0, spd: 9, crit: 4, dmgMin: 7, dmgMax: 13 },
      { hp: 25, dodge: 30, prot: 0, spd: 9, crit: 5, dmgMin: 7, dmgMax: 15 },
      { hp: 28, dodge: 35, prot: 0, spd: 10, crit: 6, dmgMin: 8, dmgMax: 16 },
    ],
  },
  'Viper': {
    resistances: { stun: 40, blight: 40, bleed: 25, disease: 30, move: 40, debuff: 30, death: 67, trap: 40 },
    gear: [
      { hp: 24, dodge: 5, prot: 0, spd: 6, crit: 3, dmgMin: 6, dmgMax: 10 },
      { hp: 29, dodge: 10, prot: 0, spd: 6, crit: 4, dmgMin: 7, dmgMax: 12 },
      { hp: 34, dodge: 15, prot: 0, spd: 7, crit: 5, dmgMin: 8, dmgMax: 13 },
      { hp: 39, dodge: 20, prot: 0, spd: 7, crit: 6, dmgMin: 9, dmgMax: 15 },
      { hp: 44, dodge: 25, prot: 0, spd: 8, crit: 7, dmgMin: 10, dmgMax: 16 },
    ],
  },
  'Wizard': {
    resistances: { stun: 40, blight: 30, bleed: 30, disease: 30, move: 40, debuff: 50, death: 67, trap: 10 },
    gear: [
      { hp: 19, dodge: 0, prot: 0, spd: 6, crit: 8, dmgMin: 4, dmgMax: 8 },
      { hp: 23, dodge: 5, prot: 0, spd: 6, crit: 9, dmgMin: 5, dmgMax: 10 },
      { hp: 27, dodge: 10, prot: 0, spd: 7, crit: 10, dmgMin: 6, dmgMax: 11 },
      { hp: 31, dodge: 15, prot: 0, spd: 7, crit: 11, dmgMin: 7, dmgMax: 13 },
      { hp: 35, dodge: 20, prot: 0, spd: 8, crit: 12, dmgMin: 8, dmgMax: 15 },
    ],
  },
};

/** El rango de equipo mas alto que los ficheros describen. */
export const MAX_GEAR_RANK = 4;

/**
 * Las estadisticas de una clase, vanilla o modded, o null.
 *
 * Null y no un objeto a cero: una clase modded sin datos es una que NO SE SABE,
 * y dibujar ceros diria que el heroe no tiene vida.
 */
export const getHeroStats = (heroClass) =>
  (heroClass && (HERO_STATS[heroClass] || MODDED_HERO_STATS[heroClass])) || null;

/**
 * Las estadisticas de una clase a un rango de equipo, o null.
 *
 * El rango se recorta al ultimo que la clase describe en vez de fallar: un mod
 * puede traer menos de cinco filas, y ahi la ultima es su tope real.
 */
export const getGearStats = (heroClass, rank = MAX_GEAR_RANK) => {
  const stats = getHeroStats(heroClass);
  if (!stats || !stats.gear.length) return null;
  const i = Math.max(0, Math.min(Number(rank) || 0, stats.gear.length - 1));
  return stats.gear[i];
};
