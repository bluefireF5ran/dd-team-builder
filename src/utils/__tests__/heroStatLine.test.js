import {
  heroStatLine, statSources, statSpread, statPosition, STAT_ORDER,
} from '../heroStatLine';
import { HERO_STATS, getGearStats, MAX_GEAR_RANK } from '../../data/heroStats';
import { HERO_CLASSES } from '../../data/heroes';

const hero = (over = {}) => ({
  heroClass: 'Crusader',
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: [],
  ...over,
});

describe('the base every class has', () => {
  it('covers all twenty classes the app carries', () => {
    const missing = Object.keys(HERO_CLASSES).filter((c) => !HERO_STATS[c]);
    expect(missing).toEqual([]);
  });

  it('gives every class five gear ranks', () => {
    const wrong = Object.entries(HERO_STATS)
      .filter(([, s]) => s.gear.length !== MAX_GEAR_RANK + 1)
      .map(([c]) => c);
    expect(wrong).toEqual([]);
  });

  it('grows with the gear rank rather than staying flat', () => {
    const low = getGearStats('Crusader', 0);
    const high = getGearStats('Crusader', 4);
    expect(high.hp).toBeGreaterThan(low.hp);
    expect(high.dodge).toBeGreaterThan(low.dodge);
    expect(high.dmgMax).toBeGreaterThan(low.dmgMax);
  });

  // Los valores del juego, comprobados a mano contra la ficha del Cruzado.
  it('matches the game for a fully upgraded Crusader', () => {
    expect(getGearStats('Crusader', 4)).toEqual({
      hp: 61, dodge: 25, prot: 0, spd: 3, crit: 7, dmgMin: 10, dmgMax: 19,
    });
  });

  it('clamps a rank past the end instead of failing', () => {
    expect(getGearStats('Crusader', 99)).toEqual(getGearStats('Crusader', 4));
    expect(getGearStats('Crusader', -3)).toEqual(getGearStats('Crusader', 0));
  });
});

describe('a bare hero', () => {
  it('totals to its base when it carries nothing', () => {
    const line = heroStatLine(hero());
    expect(line.total).toEqual({
      hp: 61, dodge: 25, prot: 0, spd: 3, crit: 7, dmgMin: 10, dmgMax: 19,
    });
    expect(line.applied).toEqual([]);
  });

  /**
   * Null, no un objeto a cero. Una clase modded que nadie ha importado es
   * DESCONOCIDA, y dibujar ceros diria que el heroe no tiene vida.
   */
  it('returns null for a class with no stats at all', () => {
    expect(heroStatLine(hero({ heroClass: 'Nobody At All' }))).toBeNull();
    expect(heroStatLine({})).toBeNull();
    expect(heroStatLine(null)).toBeNull();
  });
});

describe('what the hero is wearing', () => {
  // `Sun Ring` y `Tough` son datos reales: si el generador cambia, esto avisa.
  it('adds flat points as points', () => {
    const bare = heroStatLine(hero()).total;
    const withQuirk = heroStatLine(hero({ quirks: { positive: ['Quick Reflexes'], negative: [] } })).total;
    // Quick Reflexes es "+2 SPD", plano.
    expect(withQuirk.spd).toBe(bare.spd + 2);
  });

  /**
   * `+15% MAX HP` multiplica la base; `+10 DODGE` suma puntos. El juego escribe
   * las dos igual y solo el `%` las separa -- confundirlas es el fallo que este
   * modulo existe para no cometer.
   */
  it('multiplies a percentage of MAX HP instead of adding it', () => {
    const bare = heroStatLine(hero()).total.hp;
    const tough = heroStatLine(hero({ quirks: { positive: ['Tough'], negative: [] } })).total.hp;
    expect(bare).toBe(61);
    // Tough es "+10% MAX HP": 61 -> 68, no 61 + 10.
    expect(tough).toBe(68);
    expect(tough).not.toBe(bare + 10);
  });

  /**
   * **MAX HP y el daño del heroe se redondean HACIA ARRIBA.** Es la regla del
   * juego, no una preferencia, y los numeros van escritos a pelo justamente
   * para que este test no sea un espejo de la implementacion: si alguien vuelve
   * a poner `Math.round`, 61 x 1.10 = 67.1 daria 67 y esto lo caza.
   */
  it('rounds MAX HP up, the way the game does', () => {
    const hp = (mods) => heroStatLine(hero(mods)).total.hp;
    // 61 x 1.10 = 67.1 -> 68   (Math.round daria 67)
    expect(hp({ quirks: { positive: ['Tough'], negative: [] } })).toBe(68);
    // 61 x 1.15 = 70.15 -> 71  (Math.round daria 70)
    expect(hp({ trinket1: 'Tough Ring' })).toBe(71);
  });

  it('rounds hero damage up too', () => {
    const bare = heroStatLine(hero()).base;
    expect([bare.dmgMin, bare.dmgMax]).toEqual([10, 19]);
    // Tough Ring lleva -15% DMG: 10 x 0.85 = 8.5 -> 9, 19 x 0.85 = 16.15 -> 17.
    const line = heroStatLine(hero({ trinket1: 'Tough Ring' }));
    expect(line.total.dmgMin).toBe(9);
    expect(line.total.dmgMax).toBe(17);
  });

  /**
   * PROT y CRIT se miden en porcentaje y aun asi SUMAN puntos: un +10% PROT
   * sobre un heroe con 0 de armadura da 10, no 0 x 1.1.
   */
  it('adds PROT as points even though it is written as a percentage', () => {
    // `Protection Stone` es "+5% PROT | -1 SPD". El Cruzado tiene 0 de PROT de
    // base: multiplicar dejaria 0, que es justo el fallo. Tiene que dar 5.
    const line = heroStatLine(hero({ trinket1: 'Protection Stone' }));
    expect(line.base.prot).toBe(0);
    expect(line.total.prot).toBe(5);
    expect(line.total.spd).toBe(line.base.spd - 1);
  });

  it('applies the whole of a trinket that moves several stats at once', () => {
    // `Tough Ring`: +10% PROT | +15% MAX HP | -15% DMG | +10% Stress
    const bare = heroStatLine(hero()).base;
    const line = heroStatLine(hero({ trinket1: 'Tough Ring' }));
    expect(line.total.prot).toBe(bare.prot + 10);
    expect(line.total.hp).toBe(71);
    expect(line.total.dmgMax).toBe(17);
    // `Stress` no es una estadistica de la ficha: se ignora, no se inventa.
    expect(line.skipped.unknown).toBeGreaterThan(0);
  });

  /**
   * Dos fuentes del mismo porcentaje se suman contra la BASE, no una sobre el
   * resultado de la otra: es como las suma el juego, y encadenarlas inflaria el
   * total en silencio.
   *
   * `Tough` es la unica quirk que es exactamente "+10% MAX HP", asi que la
   * segunda fuente se pone donde se puede poner la misma dos veces: las dos
   * ranuras de trinket no valen (el juego no deja repetir objeto), y por eso se
   * comprueba sumando una quirk y verificando la aritmetica exacta.
   */
  it('adds a percentage against the base rather than compounding', () => {
    const base = heroStatLine(hero()).base.hp;
    expect(heroStatLine(hero({ quirks: { positive: ['Tough'], negative: [] } })).total.hp).toBe(68);
    // Y el plano se suma DESPUES del porcentaje, no antes: si se sumara antes,
    // el porcentaje escalaria tambien los puntos planos.
    const line = heroStatLine(hero({ quirks: { positive: ['Tough', 'Evasive'], negative: [] } }));
    expect(line.total.hp).toBe(Math.ceil(base * 1.1));
    expect(line.total.dodge).toBe(heroStatLine(hero()).base.dodge + 5);
  });

  it('says where each number came from', () => {
    const line = heroStatLine(hero({ quirks: { positive: ['Quick Reflexes'], negative: [] } }));
    expect(line.applied).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: 'quirk', name: 'Quick Reflexes', stat: 'spd' }),
    ]));
  });

  it('moves a resistance rather than a stat', () => {
    const line = heroStatLine(hero({ quirks: { positive: ['Hard Noggin'], negative: [] } }));
    // Hard Noggin es "+15% Stun Resist".
    expect(line.resistances.stun).toBe(HERO_STATS.Crusader.resistances.stun + 15);
  });
});

describe('what it refuses to fold in', () => {
  /**
   * Una clausula condicional es real y no esta siempre activa. Meterla en un
   * total plano afirmaria algo falso la mayor parte del tiempo, asi que se
   * cuenta aparte y la UI puede decir "y 3 condicionales".
   */
  it('counts a conditional clause instead of applying it', () => {
    // `Camouflage Cloak`: "+15 DODGE if Torch above 75 | -20% Stun Resist".
    // La esquiva NO se suma -- solo vale con la antorcha alta-- pero se cuenta.
    const bare = heroStatLine(hero()).base;
    const line = heroStatLine(hero({ trinket1: 'Camouflage Cloak' }));
    expect(line.total.dodge).toBe(bare.dodge);
    expect(line.skipped.conditional).toBe(1);
    // La otra clausula no es condicional y si se aplica.
    expect(line.resistances.stun).toBe(HERO_STATS.Crusader.resistances.stun - 20);
  });

  it('does not count a scoped clause as the hero-wide number', () => {
    // `Slugger` es "+10% DMG Melee Skills": media kit, no el heroe.
    const bare = heroStatLine(hero()).base;
    const line = heroStatLine(hero({ quirks: { positive: ['Slugger'], negative: [] } }));
    expect(line.total.dmgMax).toBe(bare.dmgMax);
    expect(line.skipped.scoped).toBe(1);
  });

  it('reports counts for everything it did not apply', () => {
    const line = heroStatLine(hero());
    expect(line.skipped).toEqual({ conditional: 0, scoped: 0, unknown: 0 });
  });
});

describe('statSources', () => {
  it('lists the trinkets and quirks a hero carries, with their clauses', () => {
    const rows = statSources(hero({
      trinket1: 'Sun Ring',
      quirks: { positive: ['Quick Reflexes'], negative: [] },
    }));
    expect(rows.some((r) => r.source === 'trinket' && r.name === 'Sun Ring')).toBe(true);
    expect(rows.some((r) => r.source === 'quirk' && r.name === 'Quick Reflexes')).toBe(true);
    rows.forEach((r) => expect(typeof r.clause).toBe('string'));
  });

  it('is empty for a hero carrying nothing', () => {
    expect(statSources(hero())).toEqual([]);
    expect(statSources(null)).toEqual([]);
  });
});

describe('STAT_ORDER', () => {
  it('names stats the line actually produces', () => {
    const line = heroStatLine(hero());
    STAT_ORDER.forEach(({ key }) => expect(line.total[key]).toBeDefined());
  });
});

/**
 * Donde cae un numero dentro de lo que el roster ofrece, que es la unica forma
 * honesta de decir "esto es mucho" sin escribirlo a mano en ninguna parte.
 */
describe('the roster spread', () => {
  it('measures the range from the twenty base classes', () => {
    const spread = statSpread();
    expect(spread.hp.min).toBeLessThan(spread.hp.max);
    expect(spread.dodge.min).toBeLessThan(spread.dodge.max);
    // Los extremos son clases reales, no numeros redondos inventados.
    const hps = Object.keys(HERO_STATS).map((c) => heroStatLine({ heroClass: c }).base.hp);
    expect(spread.hp.min).toBe(Math.min(...hps));
    expect(spread.hp.max).toBe(Math.max(...hps));
  });

  it('puts the tankiest class at the top and the frailest at the bottom', () => {
    const hp = (c) => statPosition('hp', heroStatLine({ heroClass: c }).total.hp);
    expect(hp('Leper')).toBe(1);
    expect(hp('Jester')).toBeLessThan(0.5);
  });

  it('puts the dodgiest class at the top of dodge and the Leper at the bottom', () => {
    const dodge = (c) => statPosition('dodge', heroStatLine({ heroClass: c }).total.dodge);
    expect(dodge('Jester')).toBe(1);
    expect(dodge('Leper')).toBe(0);
  });

  /**
   * PROT es 0 en las veinte clases de base, asi que no hay rango contra el que
   * comparar. Null, y la carta no dibuja barra: una barra vacia diria que es
   * baja en vez de que no aplica.
   */
  it('has no position for a stat the whole roster shares', () => {
    expect(statSpread().prot).toEqual({ min: 0, max: 0 });
    expect(statPosition('prot', 0)).toBeNull();
  });

  it('clamps a value past either end instead of overflowing', () => {
    expect(statPosition('hp', 9999)).toBe(1);
    expect(statPosition('hp', -50)).toBe(0);
  });

  it('says nothing for a stat it does not track', () => {
    expect(statPosition('nonsense', 5)).toBeNull();
    expect(statPosition('hp', null)).toBeNull();
  });
});

