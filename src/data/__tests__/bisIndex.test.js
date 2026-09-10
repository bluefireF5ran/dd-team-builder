import { bisLoadout, resetBisCaches, MIN_LIBRARY_SAMPLES } from '../bisIndex';
import { HERO_CLASSES } from '../heroes';
import { skillProfile, classProfile } from '../../utils/skillProfile';

beforeEach(() => resetBisCaches());

const legalCount = (heroClass, skills, rank) =>
  skills.filter((name) => skillProfile(heroClass, name)?.launch.includes(rank)).length;

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
