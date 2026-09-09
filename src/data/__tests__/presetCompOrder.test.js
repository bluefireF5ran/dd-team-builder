/**
 * Toda comp del bundle nombra sus skills en el orden en que las declara su
 * clase, que es el orden en que salen en el juego.
 *
 * El orden guardado antes era el orden en que se escribio cada comp: una
 * copiada de una partida traia el de la pantalla de equipar, una escrita a mano
 * el que se le ocurriera a quien la escribio, y una generada por la app el de
 * la frecuencia. Ninguno significa nada para quien la lee, y con 184 comps
 * hacia imposible comparar dos de un vistazo.
 *
 * `scripts/sortPresetCompSkills.js --apply` lo arregla de una vez; esto es lo
 * que impide que vuelva a colarse.
 */
import { COMP_LIBRARY } from '../compLibrary';
import { HERO_CLASSES } from '../heroes';
import { MODDED_HERO_CLASSES } from '../modded_heroes';
import { sortToRoster } from '../../utils/heroHelper';

const kitOf = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

const outOfOrder = (pick) => {
  const found = [];
  COMP_LIBRARY.forEach((comp) => {
    (comp.heroes || []).forEach((hero, index) => {
      const kit = kitOf(hero.heroClass);
      if (!kit) return;
      const { selected, order } = pick(hero, kit);
      if (!selected?.length) return;
      const sorted = sortToRoster(selected, order);
      if (sorted.join('|') !== selected.join('|')) {
        found.push(`${comp.teamName || comp.name} rank ${index + 1}: ${hero.heroClass} :: ${selected.join(', ')}`);
      }
    });
  });
  return found;
};

describe('the comp library reads in the game\'s own order', () => {
  it('lists combat skills in kit order', () => {
    expect(outOfOrder((hero, kit) => ({ selected: hero.activeSkills, order: kit.skills }))).toEqual([]);
  });

  it('lists camp skills in kit order', () => {
    expect(outOfOrder((hero, kit) => ({ selected: hero.activeCampSkills, order: kit.campSkills }))).toEqual([]);
  });

  it('never names the same skill twice in one slot', () => {
    // `Waiting_Blade__Sand_Lunge` llevaba `Snake Skin` y `Snakeskin` a la vez:
    // la pagina contaba 4/4 y solo se encendian 3 botones. Ese es exactamente
    // el fallo que reporto Fran.
    const repeated = [];
    COMP_LIBRARY.forEach((comp) => {
      (comp.heroes || []).forEach((hero, index) => {
        ['activeSkills', 'activeCampSkills'].forEach((field) => {
          const names = hero[field] || [];
          if (new Set(names).size !== names.length) {
            repeated.push(`${comp.teamName || comp.name} rank ${index + 1}: ${hero.heroClass} :: ${names.join(', ')}`);
          }
        });
      });
    });
    expect(repeated).toEqual([]);
  });
});
