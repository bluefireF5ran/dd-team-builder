import { bisLoadout, resetBisCaches, MIN_LIBRARY_SAMPLES, CAMP_ADOPTION_FLOOR } from '../bisIndex';
import { HERO_CLASSES } from '../heroes';
import { getRawComps } from '../compIndex';
import { skillProfile, classProfile } from '../../utils/skillProfile';

beforeEach(() => resetBisCaches());

const legalCount = (heroClass, skills, rank) =>
  skills.filter((name) => skillProfile(heroClass, name)?.launch.includes(rank)).length;

/** Lo que la libreria le pone a esta clase en este rango, contado aparte. */
const skillCounts = (heroClass, rank) => {
  let n = 0;
  const counts = new Map();
  getRawComps().forEach((comp) =>
    (comp.heroes || []).forEach((hero, index) => {
      if (hero?.heroClass !== heroClass || index + 1 !== rank) return;
      n += 1;
      new Set(hero.activeSkills || []).forEach((name) =>
        counts.set(name, (counts.get(name) || 0) + 1)
      );
    })
  );
  return { n, counts };
};

/** Igual, pero de camp skills y sin mirar el rango: acampar no tiene rangos. */
const campCounts = (heroClass) => {
  let n = 0;
  const counts = new Map();
  getRawComps().forEach((comp) =>
    (comp.heroes || []).forEach((hero) => {
      if (hero?.heroClass !== heroClass) return;
      n += 1;
      new Set(hero.activeCampSkills || []).forEach((name) =>
        counts.set(name, (counts.get(name) || 0) + 1)
      );
    })
  );
  return { n, counts };
};

describe('bisLoadout', () => {
  it('knows nothing about a class the app does not carry', () => {
    expect(bisLoadout('Not A Class', 1)).toBeNull();
  });

  it('hands the loadout back in the order the game lists the kit', () => {
    // Se eligen por nota y por legalidad de rango, pero ese orden no significa
    // nada para quien lee la ficha. El del juego si, y es el que comparte con
    // las 184 comps de la libreria.
    const inKitOrder = (selected, kit) => {
      const at = (name) => kit.indexOf(name);
      return selected.every((name, i) => i === 0 || at(selected[i - 1]) < at(name));
    };
    [1, 2, 3, 4].forEach((rank) => {
      Object.keys(HERO_CLASSES).forEach((heroClass) => {
        const build = bisLoadout(heroClass, rank);
        const kit = HERO_CLASSES[heroClass];
        expect(inKitOrder(build.activeSkills, kit.skills)).toBe(true);
        expect(inKitOrder(build.activeCampSkills, kit.campSkills)).toBe(true);
      });
    });
  });

  it('fills the four slots of a normal class', () => {
    const build = bisLoadout('Vestal', 3);
    expect(build.activeSkills).toHaveLength(4);
    expect(build.activeCampSkills).toHaveLength(4);
    expect(build.trinket1).toBeTruthy();
    expect(build.trinket2).toBeTruthy();
    expect(build.trinket1).not.toBe(build.trinket2);
  });

  it('gives a stance class its whole kit, because it does not choose', () => {
    // `alwaysActive`: el juego se las marca todas y HeroConfiguration tambien.
    const build = bisLoadout('Abomination', 2);
    expect(build.activeSkills).toHaveLength(HERO_CLASSES.Abomination.skills.length);
  });

  describe("Fran's rule: three of four usable from where you stand", () => {
    it('holds for every non-dancer class at every rank', () => {
      const broken = [];
      Object.entries(HERO_CLASSES).forEach(([heroClass, data]) => {
        if (data.alwaysActive) return;
        if (classProfile(heroClass, data.skills).isDancer) return;
        [1, 2, 3, 4].forEach((rank) => {
          const build = bisLoadout(heroClass, rank);
          const usable = legalCount(heroClass, build.activeSkills, rank);
          // Solo se exige cuando la clase TIENE tres desde ese rango: el Leper
          // en rango 4 solo puede lanzar una, y mentir sobre eso seria peor.
          const available = classProfile(heroClass, data.skills).launchableByRank[rank].length;
          if (usable < Math.min(3, available)) {
            broken.push(`${heroClass} r${rank}: ${usable} usable of 4 (${available} available)`);
          }
        });
      });
      expect(broken).toEqual([]);
    });

    it('spends the fourth slot on covering a shuffle', () => {
      // La Arbalest en rango 4: tres de fondo y una que sirva si la empujan.
      const build = bisLoadout('Arbalest', 4);
      const reachOtherRanks = build.activeSkills.filter((name) => {
        const launch = skillProfile('Arbalest', name)?.launch || [];
        return launch.some((r) => r !== 4);
      });
      expect(reachOtherRanks.length).toBeGreaterThan(0);
    });

    // Cubrir el empujon no puede costar cualquier cosa. Esta ranura se ordenaba
    // solo por alcance y el uso solo desempataba, asi que el Leper de rango 1
    // salia con `Revenge` -- 5 de 24 fichas, pero llega a los cuatro rangos--
    // y sin `Purge`, que esta en 16 de 24 y se lanza solo desde el 1.
    it('does not drop what the library plays for something that merely reaches further', () => {
      const build = bisLoadout('Leper', 1);
      expect(build.activeSkills).toContain('Purge');
      expect(build.activeSkills).not.toContain('Revenge');
    });

    // Mismo fallo por el otro lado: 10 de 11 fichas del Antiquarian de rango 4
    // llevan `Invigorating Vapours`, y se caia por lanzarse solo desde [3,4].
    it('keeps a skill the library nearly always plays, short reach and all', () => {
      const build = bisLoadout('Antiquarian', 4);
      expect(build.activeSkills).toContain('Invigorating Vapours');
    });
  });

  describe('dancers earn the exemption instead of being handed it', () => {
    it('gives a dancer an actual movement skill', () => {
      ['Shieldbreaker', 'Jester', 'Grave Robber'].forEach((heroClass) => {
        const build = bisLoadout(heroClass, 3);
        const movers = build.activeSkills.filter((name) =>
          skillProfile(heroClass, name)?.tags.has('selfMove')
        );
        expect(movers.length).toBeGreaterThan(0);
      });
    });

    // Reservar una ranura a la mejor skill de automovimiento era darle la
    // exencion a la clase por el nombre. `Get Down!` sale en 8 de las 86 fichas
    // del Antiquarian de rango 3 y se llevaba la ranura por delante de `Protect
    // Me`, que sale en 77.
    //
    // Se mira POR RANGO, que es donde se decide. La misma skill que el rango 3
    // no juega es la apertura del rango 1 -- ahi la Antiquaria sale delante y
    // `Get Down!` la manda al fondo, que es donde sus dos Vapours se lanzan--, y
    // la libreria lo dice: 13 de 15 fichas. Una asercion para los cuatro rangos
    // a la vez no distingue "no la juega" de "no la juega AQUI", y era la
    // primera la que habia que vigilar.
    it('leaves out a mover the library leaves at home at that rank', () => {
      [3, 4].forEach((rank) => {
        expect(bisLoadout('Antiquarian', rank).activeSkills).not.toContain('Get Down!');
      });
    });

    it('keeps the same mover where the library opens with it', () => {
      expect(bisLoadout('Antiquarian', 1).activeSkills).toContain('Get Down!');
    });

    // Y peor: `Holy Lance` se lanza desde el 3 y el 4, asi que al Cruzado de
    // rango 1 le entraba una skill que ni siquiera puede usar, con 7 fichas de
    // 27, por delante de `Stunning Blow`, que tiene 23.
    it('never reserves it for a mover that cannot be cast from here at all', () => {
      const build = bisLoadout('Crusader', 1);
      expect(skillProfile('Crusader', 'Holy Lance').launch).not.toContain(1);
      expect(build.activeSkills).not.toContain('Holy Lance');
    });

    // El automovimiento suma al alcance, no lo sustituye: `Impale` mueve a la
    // Shieldbreaker pero solo se lanza desde el 1, y `Serpent Sway` desde el 1,
    // el 2 y el 3. Las dos te devuelven a tu sitio; una lo hace desde tres.
    it('prefers the mover you can actually cast from more places', () => {
      const build = bisLoadout('Shieldbreaker', 3);
      expect(build.activeSkills).toContain('Serpent Sway');
      expect(build.activeSkills).not.toContain('Impale');
    });
  });

  describe('the library outranks the rule of thumb it was hired to cover for', () => {
    // 57 de las 110 fichas de Arbalest en rango 4 llevan `Suppressing Fire` y 54
    // `Rallying Flare`. El bono por alcance valia 0.35 y esa diferencia 0.03,
    // asi que ganaba siempre la que alcanza los cuatro rangos: una regla de
    // andar por casa por delante de 110 comps escritas a mano.
    it('takes what the library plays over what merely reaches further', () => {
      expect(bisLoadout('Arbalest', 4).activeSkills).toContain('Suppressing Fire');
    });

    // La version general, que sobrevive a que la libreria siga creciendo: donde
    // la regla de rango no ata nada --todo el kit se lanza desde ahi-- la
    // respuesta es lo que la libreria juega. El prior puede darle la vuelta a un
    // empate a una ficha y no a mas, porque se diluye con las muestras: vale
    // MIN_LIBRARY_SAMPLES * REACH_WEIGHT comps, o sea 1.4, sea cual sea `n`.
    it('leaves nothing more played out of a dense cell', () => {
      const broken = [];
      Object.entries(HERO_CLASSES).forEach(([heroClass, data]) => {
        if (data.alwaysActive) return;
        [1, 2, 3, 4].forEach((rank) => {
          const kit = data.skills || [];
          const unconstrained = kit.every((name) =>
            skillProfile(heroClass, name)?.launch.includes(rank)
          );
          const { n, counts } = skillCounts(heroClass, rank);
          if (!unconstrained || n < MIN_LIBRARY_SAMPLES) return;

          const chosen = bisLoadout(heroClass, rank).activeSkills;
          const at = (name) => counts.get(name) || 0;
          const worstIn = Math.min(...chosen.map(at));
          const bestOut = Math.max(...kit.filter((name) => !chosen.includes(name)).map(at));
          if (bestOut - worstIn > 1) {
            broken.push(`${heroClass} r${rank}: deja fuera una de ${bestOut} por una de ${worstIn}`);
          }
        });
      });
      expect(broken).toEqual([]);
    });

    it('still lets the rule of thumb decide where the library says nothing', () => {
      // Arbalest r1: cero fichas en toda la libreria. Sin muestras el prior pesa
      // entero, que es para lo que se invento.
      const build = bisLoadout('Arbalest', 1);
      expect(build.samples).toBe(0);
      const reaches = build.activeSkills.filter((name) =>
        skillProfile('Arbalest', name)?.launch.includes(1)
      );
      expect(reaches.length).toBeGreaterThan(0);
    });
  });

  describe('camp skills', () => {
    // El Flagelante solo tiene CUATRO camp skills, asi que rellenar hasta cuatro
    // se las ponia todas -- `Lash's Anger` incluida, que esta en 14 de sus 60
    // fichas. Tener la ranura no obliga a llenarla, igual que pasa con los
    // quirks negativos, que tampoco se recomiendan.
    it('leaves a slot empty rather than fill it with what the library refuses', () => {
      const build = bisLoadout('Flagellant', 1);
      expect(build.activeCampSkills).not.toContain("Lash's Anger");
      expect(build.activeCampSkills).toHaveLength(3);
    });

    it('never recommends one the library skips more often than not', () => {
      const broken = [];
      Object.keys(HERO_CLASSES).forEach((heroClass) => {
        const { n, counts } = campCounts(heroClass);
        if (n < MIN_LIBRARY_SAMPLES) return;
        bisLoadout(heroClass, 1).activeCampSkills.forEach((name) => {
          const rate = (counts.get(name) || 0) / n;
          if (rate <= CAMP_ADOPTION_FLOOR) {
            broken.push(`${heroClass}: ${name} en el ${Math.round(rate * 100)}% de sus fichas`);
          }
        });
      });
      expect(broken).toEqual([]);
    });

    it('answers the same at every rank, because camping has no ranks', () => {
      // Contarlas por rango partia las muestras por una columna que no cambia la
      // respuesta: el Flagelante tiene 60 fichas y dos de sus cuatro celdas no
      // llegaban al minimo.
      const broken = [];
      Object.keys(HERO_CLASSES).forEach((heroClass) => {
        const [atOne, ...rest] = [1, 2, 3, 4].map((rank) =>
          bisLoadout(heroClass, rank).activeCampSkills.join(', ')
        );
        rest.forEach((camp, index) => {
          if (camp !== atOne) broken.push(`${heroClass} r${index + 2}: [${camp}] != [${atOne}]`);
        });
      });
      expect(broken).toEqual([]);
    });
  });

  describe('rank changes the answer', () => {
    it('builds the same class differently at the front and at the back', () => {
      const front = bisLoadout('Occultist', 1);
      const back = bisLoadout('Occultist', 4);
      expect(front.activeSkills).not.toEqual(back.activeSkills);
    });

    it('does not hand a rank-4 Leper his rank-1 kit', () => {
      const front = bisLoadout('Leper', 1);
      const back = bisLoadout('Leper', 4);
      expect(legalCount('Leper', front.activeSkills, 1)).toBe(4);
      expect(front.activeSkills).not.toEqual(back.activeSkills);
    });
  });

  describe('it says where the answer came from', () => {
    it('leans on the library where the library has samples', () => {
      // Houndmaster r3 son 40 ranuras: el caso denso.
      const build = bisLoadout('Houndmaster', 3);
      expect(build.samples).toBeGreaterThanOrEqual(MIN_LIBRARY_SAMPLES);
      expect(build.source).toBe('library');
    });

    it('falls through to the model where the library is empty', () => {
      // Arbalest r1: cero comps en toda la libreria.
      const build = bisLoadout('Arbalest', 1);
      expect(build.samples).toBeLessThan(MIN_LIBRARY_SAMPLES);
      expect(build.source).toBe('model');
      expect(build.activeSkills).toHaveLength(4);
    });

    it('still answers for every class at every rank', () => {
      const missing = [];
      Object.keys(HERO_CLASSES).forEach((heroClass) => {
        [1, 2, 3, 4].forEach((rank) => {
          const build = bisLoadout(heroClass, rank);
          if (!build || !build.activeSkills.length) missing.push(`${heroClass} r${rank}`);
        });
      });
      expect(missing).toEqual([]);
    });
  });
});
