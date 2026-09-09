import { generateComp, generateComps, scoreParty } from '../compGenerator';
import { resetBisCaches } from '../../data/bisIndex';
import { skillProfile } from '../skillProfile';
import { partyCoverage } from '../synergyHelper';

beforeEach(() => resetBisCaches());

// Un rng determinista, para que un fallo se pueda repetir.
const seeded = (seed = 1) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const usableFromRank = (hero, rank) =>
  (hero.activeSkills || []).filter((name) => skillProfile(hero.heroClass, name)?.launch.includes(rank));

describe('generateComp', () => {
  it('gives nothing back when there is nobody to field', () => {
    expect(generateComp({ roster: [], rng: seeded() })).toBeNull();
    expect(generateComp({ roster: ['Not A Class'], rng: seeded() })).toBeNull();
  });

  it('fills four ranks from a roster that has enough heroes', () => {
    const comp = generateComp({
      roster: ['Crusader', 'Vestal', 'Plague Doctor', 'Arbalest'],
      rng: seeded()
    });
    expect(comp.heroes.filter((h) => h.heroClass)).toHaveLength(4);
    comp.heroes.forEach((hero) => {
      expect(hero.activeSkills.length).toBeGreaterThan(0);
      expect(hero.activeCampSkills.length).toBeGreaterThan(0);
    });
  });

  it('never fields a class more often than the roster holds it', () => {
    // El roster es un multiconjunto: con un solo Jester no salen cuatro.
    const comp = generateComp({
      roster: ['Jester', 'Vestal', 'Crusader', 'Hellion', 'Leper'],
      rng: seeded(7)
    });
    const used = comp.heroes.map((h) => h.heroClass).filter(Boolean);
    expect(used.filter((c) => c === 'Jester').length).toBeLessThanOrEqual(1);
  });

  it('will field two of a class when the roster holds two', () => {
    const comp = generateComp({
      roster: ['Plague Doctor', 'Plague Doctor', 'Crusader', 'Vestal'],
      rng: seeded(3)
    });
    const used = comp.heroes.map((h) => h.heroClass).filter(Boolean);
    expect(used.length).toBe(4);
  });

  it('leaves nobody stranded where they cannot use a single skill', () => {
    const comp = generateComp({
      roster: ['Leper', 'Arbalest', 'Vestal', 'Crusader', 'Hellion', 'Occultist'],
      rng: seeded(11)
    });
    comp.heroes.forEach((hero, index) => {
      if (!hero.heroClass) return;
      expect(usableFromRank(hero, index + 1).length).toBeGreaterThan(0);
    });
  });

  it('puts the back-line class in the back line', () => {
    // La Arbalest lanza 2 de 7 desde rango 1 y 7 de 7 desde rango 4; el Leper
    // al reves. Con los dos en el roster, el sitio de cada uno no es opinable.
    const comp = generateComp({
      roster: ['Leper', 'Arbalest', 'Vestal', 'Crusader'],
      rng: seeded(5)
    });
    const rankOf = (heroClass) => comp.heroes.findIndex((h) => h.heroClass === heroClass) + 1;
    expect(rankOf('Arbalest')).toBeGreaterThan(rankOf('Leper'));
  });

  describe('it builds for coverage, not popularity', () => {
    it('finds a healer when the roster has one', () => {
      const comp = generateComp({
        roster: ['Vestal', 'Hellion', 'Grave Robber', 'Highwayman'],
        rng: seeded(2)
      });
      expect(partyCoverage(comp.heroes).has('heal')).toBe(true);
    });

    it('works with a roster holding none of the popular classes', () => {
      // Sin Houndmaster, Crusader, Occultist ni Plague Doctor -- las cuatro que
      // dominan la libreria. `suggestTeam` no tendria nada que ofrecer aqui.
      const comp = generateComp({
        roster: ['Musketeer', 'Duelist', 'Runaway', 'Antiquarian'],
        rng: seeded(13)
      });
      expect(comp.heroes.filter((h) => h.heroClass)).toHaveLength(4);
      expect(comp.score).toBeGreaterThan(0);
      comp.heroes.forEach((hero, index) => {
        expect(usableFromRank(hero, index + 1).length).toBeGreaterThan(0);
      });
    });
  });

  describe('alternatives', () => {
    const roster = ['Crusader', 'Vestal', 'Plague Doctor', 'Arbalest', 'Hellion', 'Jester', 'Leper', 'Occultist'];

    it('offers several distinct comps, not the same one three times', () => {
      const comps = generateComps({ roster, count: 3, rng: seeded(4) });
      expect(comps.length).toBeGreaterThan(1);
      const signatures = comps.map((c) => c.heroes.map((h) => h.heroClass).join('/'));
      expect(new Set(signatures).size).toBe(signatures.length);
    });

    it('hands them back best first', () => {
      const comps = generateComps({ roster, count: 4, rng: seeded(9) });
      const scores = comps.map((c) => c.score);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    });

    it('and generateComp is just the best of them', () => {
      const comps = generateComps({ roster, count: 3, rng: seeded(21) });
      const one = generateComp({ roster, rng: seeded(21) });
      expect(one.score).toBe(comps[0].score);
    });

    it('every alternative is still a comp that works', () => {
      generateComps({ roster, count: 4, rng: seeded(6) }).forEach((comp) => {
        comp.heroes.forEach((hero, index) => {
          if (!hero.heroClass) return;
          expect(usableFromRank(hero, index + 1).length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('scoreParty', () => {
  it('is zero for an empty party', () => {
    expect(scoreParty([])).toBe(0);
  });

  it('punishes a hero who cannot act harder than any bonus rewards', () => {
    const stranded = [
      { heroClass: 'Leper', activeSkills: ['Hew', 'Chop'], activeCampSkills: [] },
      { heroClass: 'Vestal', activeSkills: ['Divine Grace'], activeCampSkills: [] },
      { heroClass: 'Crusader', activeSkills: ['Smite'], activeCampSkills: [] },
      { heroClass: 'Arbalest', activeSkills: ['Sniper Shot'], activeCampSkills: [] }
    ];
    // El Leper en rango 1 esta bien; moverlo al 4 lo deja sin nada que hacer.
    const fine = scoreParty(stranded);
    const broken = scoreParty([stranded[3], stranded[1], stranded[2], stranded[0]]);
    expect(broken).toBeLessThan(fine);
  });
});
