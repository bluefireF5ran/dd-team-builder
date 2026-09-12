import { generateComp, generateComps, scoreParty, resolveTrinketClashes } from '../compGenerator';
import { getTrinketLimit } from '../../data/trinketEffects';
import { compClassKey, knownCompKeys, resetCompIdentityCache } from '../compIdentity';
import { resetBisCaches, rankHomeMiss, bisLoadout } from '../../data/bisIndex';
import { getRawComps } from '../../data/compIndex';
import { REGION_PROFILES } from '../../data/regionProfiles';
import { skillProfile } from '../skillProfile';
import { partyCoverage } from '../synergyHelper';
import { rememberPendingComp, clearPendingComps } from '../pendingComps';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';

beforeEach(() => {
  resetBisCaches();
  clearPendingComps();
  resetCompIdentityCache();
});

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

  // Cuatro Bufones es una comp de la libreria, elegida a mano porque la
  // repeticion hace algo. Que salga sola de un roster con dos Doctores es
  // otra cosa, y no es lo que se pide al sugerir.
  it('does not field a class twice, even when the roster holds two', () => {
    const comp = generateComp({
      roster: ['Plague Doctor', 'Plague Doctor', 'Crusader', 'Vestal', 'Hellion'],
      rng: seeded(3)
    });
    const used = comp.heroes.map((h) => h.heroClass).filter(Boolean);
    expect(new Set(used).size).toBe(used.length);
  });

  // Preferir el silencio a la comp doblada: la doblada existe, pero es una
  // eleccion de quien la escribe, no una sugerencia.
  it('gives nothing back when the only party left would double a class', () => {
    expect(
      generateComp({
        roster: ['Plague Doctor', 'Plague Doctor', 'Crusader', 'Vestal'],
        rng: seeded(3)
      })
    ).toBeNull();
  });

  it('still fills four ranks when the roster has four distinct classes to give', () => {
    const comp = generateComp({
      roster: ['Plague Doctor', 'Plague Doctor', 'Crusader', 'Vestal', 'Hellion'],
      rng: seeded(3)
    });
    const used = comp.heroes.map((h) => h.heroClass).filter(Boolean);
    expect(used).toHaveLength(4);
    expect(new Set(used).size).toBe(4);
  });

  it('fields the double when asked to', () => {
    const comps = generateComps({
      roster: ['Plague Doctor', 'Plague Doctor', 'Crusader', 'Vestal'],
      count: 20,
      allowRepeatClass: true,
      excludeKnown: false,
      rng: seeded(3)
    });
    const doubled = comps.some((comp) => {
      const used = comp.heroes.map((h) => h.heroClass).filter(Boolean);
      return new Set(used).size < used.length;
    });
    expect(doubled).toBe(true);
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

describe('it builds comps that are actually new', () => {
  // El reproche de Fran, literal: *"que el modelo recomiende una comp y al
  // mirar las 4 clases en la pagina de comps salga una con esas 4 marcadas ya
  // es un fallo"*. La identidad es el reparto de clases, sin orden ni region.
  const wideRoster = [
    'Crusader', 'Vestal', 'Plague Doctor', 'Arbalest', 'Hellion', 'Jester',
    'Leper', 'Occultist', 'Houndmaster', 'Man at Arms', 'Highwayman', 'Grave Robber'
  ];

  it('never hands back a class line-up the library already has', () => {
    const comps = generateComps({ roster: wideRoster, count: 5, rng: seeded(17) });
    expect(comps.length).toBeGreaterThan(0);
    comps.forEach((comp) => {
      expect(knownCompKeys().has(compClassKey(comp.heroes))).toBe(false);
    });
  });

  it('never hands back a comp you saved while the page was open', () => {
    // El index se genera al arrancar, asi que una comp guardada hace un minuto
    // no esta en el bundle y el generador la volvia a ofrecer. `pendingComps`
    // la apunta al descargarla y aqui se comprueba que cuenta como escrita.
    const first = generateComp({ roster: wideRoster, rng: seeded(17) });
    expect(first).not.toBeNull();

    rememberPendingComp(compClassKey(first.heroes));

    const after = generateComps({ roster: wideRoster, count: 5, rng: seeded(17) });
    after.forEach((comp) => {
      expect(compClassKey(comp.heroes)).not.toBe(compClassKey(first.heroes));
    });
  });

  it('counts two comps as one when only the placement differs', () => {
    // Dos colocaciones del mismo reparto son la misma comp, asi que la lista de
    // alternativas no puede gastar dos huecos en ellas.
    const comps = generateComps({ roster: wideRoster, count: 6, rng: seeded(23) });
    const keys = comps.map((comp) => compClassKey(comp.heroes));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('changes a hero when every line-up the roster allows is already written', () => {
    // `Marked_Prey__Royal_Snipe` ya lleva estos cuatro. Con un roster de cinco
    // solo hay cinco repartos, y barajar no descubre ninguno: hay que cambiar
    // un heroe a proposito, que es lo que hace `diversify`.
    const roster = ['Leper', 'Houndmaster', 'Musketeer', 'Arbalest', 'Vestal'];
    expect(knownCompKeys().has(compClassKey(['Leper', 'Houndmaster', 'Musketeer', 'Arbalest']))).toBe(true);

    const comp = generateComp({ roster, rng: seeded(31) });
    expect(comp).not.toBeNull();
    expect(knownCompKeys().has(compClassKey(comp.heroes))).toBe(false);
    expect(comp.heroes.filter((hero) => hero.heroClass)).toHaveLength(4);
  });

  it('says nothing rather than repeat itself when the roster has no room left', () => {
    // Exactamente los cuatro de una comp que ya existe y nadie mas: no hay
    // ninguna comp nueva que montar, y devolver la vieja seria el fallo.
    const roster = ['Leper', 'Houndmaster', 'Musketeer', 'Arbalest'];
    expect(generateComp({ roster, rng: seeded(37) })).toBeNull();
    // Y sin el filtro sigue saliendo, que es como la UI distingue los dos casos.
    expect(generateComp({ roster, excludeKnown: false, rng: seeded(37) })).not.toBeNull();
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

describe('donde se planta cada uno', () => {
  // Arbalest y Musketeer lanzan su kit entero desde el 3 y desde el 4, asi que
  // la cobertura y la legalidad de rango daban EXACTAMENTE lo mismo en los dos
  // repartos y acababa decidiendo el orden del barajado. La libreria si tiene
  // opinion: 110 de las 120 Arbalest estan en el 4 y solo 8 en el 3, mientras
  // que la Musketeer baja al 3 en 14 de 71.
  it('puts the Arbalest behind the Musketeer, like the library does', () => {
    [
      ['Crusader', 'Occultist', 'Musketeer', 'Arbalest'],
      ['Leper', 'Houndmaster', 'Arbalest', 'Musketeer'],
      ['Hellion', 'Man at Arms', 'Musketeer', 'Arbalest']
    ].forEach((roster) => {
      const comp = generateComp({ roster, rng: seeded(), excludeKnown: false });
      const names = comp.heroes.map((hero) => hero.heroClass);
      expect(names.indexOf('Arbalest')).toBeGreaterThan(names.indexOf('Musketeer'));
    });
  });

  it('charges nothing to a class the library has never placed', () => {
    // No tener sitio de siempre no puede costar puntos: si costara, el generador
    // preferiria una vanilla a una modded en cualquier reparto, y el desvio es
    // para colocar, no para elegir.
    const seen = new Set();
    getRawComps().forEach((comp) =>
      (comp.heroes || []).forEach((hero) => hero?.heroClass && seen.add(hero.heroClass))
    );
    const unplaced = Object.keys(MODDED_HERO_CLASSES).find((name) => !seen.has(name));
    expect(unplaced).toBeTruthy();
    [1, 2, 3, 4].forEach((rank) => expect(rankHomeMiss(unplaced, rank)).toBe(0));
  });
});

describe('de los unicos hay uno', () => {
  const built = (names) =>
    names.map((heroClass, index) => ({ heroClass, ...bisLoadout(heroClass, index + 1) }));

  const tally = (heroes) => {
    const counts = new Map();
    heroes.forEach((hero) =>
      [hero.trinket1, hero.trinket2].forEach((name) => {
        if (name) counts.set(name, (counts.get(name) || 0) + 1);
      })
    );
    return counts;
  };

  it('never hands the same unique trinket to two heroes', () => {
    // `Ancestor's Map` sale como best-in-slot de 18 celdas distintas, asi que
    // sin repartirlo la comp salia con dos heroes llevando un objeto del que
    // solo hay uno.
    const heroes = resolveTrinketClashes(
      built(['Crusader', 'Occultist', 'Arbalest', 'Bounty Hunter'])
    );
    tally(heroes).forEach((count, name) => {
      expect(count).toBeLessThanOrEqual(getTrinketLimit(name));
    });
  });

  it('gives the contested one to whoever ranks it highest', () => {
    // La Arbalest lo tiene el primero de su cola y el Bounty Hunter el segundo,
    // asi que cede el Bounty Hunter -- y baja al siguiente que si pueda llevar.
    const before = built(['Crusader', 'Occultist', 'Arbalest', 'Bounty Hunter']);
    expect(before[2].trinketOptions.indexOf("Ancestor's Map")).toBeLessThan(
      before[3].trinketOptions.indexOf("Ancestor's Map")
    );

    const after = resolveTrinketClashes(before);
    expect([after[2].trinket1, after[2].trinket2]).toContain("Ancestor's Map");
    expect([after[3].trinket1, after[3].trinket2]).not.toContain("Ancestor's Map");
    // Y no se queda con el hueco vacio: coge otro.
    expect(after[3].trinket2).toBeTruthy();
  });

  it('leaves two DIFFERENT ancestral trinkets alone, on one hero or on two', () => {
    // El limite es del objeto, no de la rareza ni del hueco.
    const heroes = [
      { heroClass: 'Crusader', trinket1: "Ancestor's Map", trinket2: "Ancestor's Coat" },
      { heroClass: 'Vestal', trinket1: "Ancestor's Pen", trinket2: "Ancestor's Candle" }
    ];
    expect(resolveTrinketClashes(heroes)).toEqual(heroes);
  });

  it('lets an ordinary trinket repeat as often as it likes', () => {
    const heroes = [
      { heroClass: 'Crusader', trinket1: 'Bleed Charm', trinket2: 'Stun Charm' },
      { heroClass: 'Vestal', trinket1: 'Bleed Charm', trinket2: 'Stun Charm' }
    ];
    expect(getTrinketLimit('Bleed Charm')).toBe(Infinity);
    expect(resolveTrinketClashes(heroes)).toEqual(heroes);
  });

  it('honours a cap above one instead of assuming every cap is one', () => {
    // Del Rat Carcass hay dos, asi que dos heroes pueden llevarlo y el tercero
    // no.
    expect(getTrinketLimit('Rat Carcass')).toBe(2);
    const heroes = resolveTrinketClashes([
      { heroClass: 'Crusader', trinket1: 'Rat Carcass', trinket2: '' },
      { heroClass: 'Vestal', trinket1: 'Rat Carcass', trinket2: '' },
      { heroClass: 'Arbalest', trinket1: 'Rat Carcass', trinket2: '' }
    ]);
    expect(tally(heroes).get('Rat Carcass')).toBe(2);
  });

  it('leaves a party with nothing to sort out exactly as it was', () => {
    const heroes = built(['Hellion', 'Man at Arms', 'Highwayman', 'Musketeer']);
    expect(resolveTrinketClashes(heroes)).toEqual(heroes);
  });

  it('keeps every generated comp inside the caps', () => {
    const roster = Object.keys(HERO_CLASSES);
    const broken = [];
    [1, 5, 13, 29, 77].forEach((seed) => {
      generateComps({ roster, count: 3, rng: seeded(seed), excludeKnown: false }).forEach((comp) => {
        tally(comp.heroes).forEach((count, name) => {
          if (count > getTrinketLimit(name)) {
            broken.push(`${name} x${count} (cap ${getTrinketLimit(name)})`);
          }
        });
      });
    });
    expect(broken).toEqual([]);
  });
});

describe('para donde es la comp', () => {
  it('picks the region instead of stamping them all "The Ruins"', () => {
    // El defecto era una etiqueta fija, asi que una comp de sangrado salia
    // etiquetada para la unica region donde el sangrado no sirve de nada.
    const bleed = generateComp({
      roster: ['Hellion', 'Highwayman', 'Bounty Hunter', 'Houndmaster'],
      rng: seeded(),
      excludeKnown: false
    });
    expect(bleed.location).toBe('The Warrens');
    expect(REGION_PROFILES[bleed.location].resist.bleed).toBeLessThan(
      REGION_PROFILES['The Ruins'].resist.bleed
    );
  });

  it('still does what it is told when a region is asked for', () => {
    const comp = generateComp({
      roster: ['Hellion', 'Highwayman', 'Bounty Hunter', 'Houndmaster'],
      location: 'The Cove',
      rng: seeded(),
      excludeKnown: false
    });
    expect(comp.location).toBe('The Cove');
  });

  it('scores the same party differently in two regions', () => {
    // Es lo que `scoreParty` no sabia hacer: la party es la misma y el sitio no.
    const heroes = generateComp({
      roster: ['Hellion', 'Highwayman', 'Bounty Hunter', 'Houndmaster'],
      rng: seeded(),
      excludeKnown: false
    }).heroes;
    expect(scoreParty(heroes, 'The Warrens')).toBeGreaterThan(scoreParty(heroes, 'The Ruins'));
    // Y sin region sigue contestando lo de siempre, que es como se puntua
    // mientras la party se esta montando.
    expect(scoreParty(heroes)).toBeGreaterThan(0);
  });
});

describe('un roster enorme', () => {
  // `modded_heroes.js` ya trae 644 clases. Puntuar cada una de ellas en cada
  // rango de cada intento hacia que el coste creciera con el roster -- cuatro
  // segundos por sugerencia con 200 clases--, asi que solo se puntua a fondo una
  // muestra (`CANDIDATES_PER_RANK`). Lo que el recorte no puede hacer es
  // devolver una party a medias.
  it('sigue montando una party entera', () => {
    const roster = [
      ...Object.keys(HERO_CLASSES),
      ...Object.keys(MODDED_HERO_CLASSES).slice(0, 200)
    ];
    const comp = generateComp({ roster, rng: seeded(7) });
    expect(comp).not.toBeNull();
    expect(comp.heroes.filter((hero) => hero.heroClass)).toHaveLength(4);
  });

  it('no se queda con las primeras clases de la lista', () => {
    // La muestra sale del barajado, asi que no puede tener el sesgo de coger
    // siempre a las mismas: con semillas distintas salen partys distintas.
    const roster = [
      ...Object.keys(HERO_CLASSES),
      ...Object.keys(MODDED_HERO_CLASSES).slice(0, 200)
    ];
    const keys = [3, 11, 29].map((seed) => compClassKey(generateComp({ roster, rng: seeded(seed) })?.heroes || []));
    expect(new Set(keys).size).toBeGreaterThan(1);
  });
});
