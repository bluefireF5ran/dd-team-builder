import { generateRandomTeam, generateRandomTeamFromRoster } from '../randomTeam';
import { PARTY_CONFIG, HERO_CONFIG } from '../../constants';

describe('generateRandomTeam', () => {
  test('generates 4 heroes', () => {
    const team = generateRandomTeam(false);
    expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
  });

  test('each hero has a heroClass', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(hero.heroClass).toBeTruthy();
      expect(typeof hero.heroClass).toBe('string');
    });
  });

  test('each hero has activeSkills', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(Array.isArray(hero.activeSkills)).toBe(true);
      expect(hero.activeSkills.length).toBeGreaterThanOrEqual(HERO_CONFIG.MAX_SKILLS);
    });
  });

  test('each hero has activeCampSkills', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(Array.isArray(hero.activeCampSkills)).toBe(true);
      expect(hero.activeCampSkills.length).toBeGreaterThan(0);
    });
  });

  test('each hero has trinkets', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(typeof hero.trinket1).toBe('string');
      expect(typeof hero.trinket2).toBe('string');
    });
  });

  test('each hero has quirks', () => {
    const team = generateRandomTeam(false);
    team.forEach(hero => {
      expect(hero.quirks).toBeDefined();
      expect(Array.isArray(hero.quirks.positive)).toBe(true);
      expect(Array.isArray(hero.quirks.negative)).toBe(true);
    });
  });

  test('generates different teams on successive calls', () => {
    const team1 = generateRandomTeam(false);
    const team2 = generateRandomTeam(false);
    // Extremely unlikely to get the same team twice
    const classes1 = team1.map(h => h.heroClass).join(',');
    const classes2 = team2.map(h => h.heroClass).join(',');
    // They might be the same, but skills/trinkets should differ
    const skills1 = team1.map(h => h.activeSkills.join(',')).join(';');
    const skills2 = team2.map(h => h.activeSkills.join(',')).join(';');
    // At least one of these should differ
    const isDifferent = classes1 !== classes2 || skills1 !== skills2;
    expect(isDifferent).toBe(true);
  });
});

describe('generateRandomTeamFromRoster', () => {
  test('generates 4 heroes from the provided roster', () => {
    const roster = ['Crusader', 'Vestal', 'Hellion', 'Highwayman', 'Plague Doctor', 'Occultist'];
    const team = generateRandomTeamFromRoster(roster);
    expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
    team.forEach(hero => {
      expect(roster).toContain(hero.heroClass);
    });
  });

  test('falls back to all vanilla heroes when roster is too small', () => {
    const team = generateRandomTeamFromRoster(['Crusader', 'Vestal']);
    expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
    team.forEach(hero => {
      expect(typeof hero.heroClass).toBe('string');
      expect(hero.heroClass).toBeTruthy();
    });
  });

  test('ignores invalid hero names in roster', () => {
    const roster = ['Crusader', 'Vestal', 'NotARealHero', 'Hellion', 'Highwayman', 'Plague Doctor'];
    const team = generateRandomTeamFromRoster(roster);
    expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
    team.forEach(hero => {
      expect(hero.heroClass).not.toBe('NotARealHero');
    });
  });

  test('generates different teams from the same roster', () => {
    // Two draws can legitimately land on the same comp, so this asks the real
    // question — that the suggester varies at all — over enough draws that a
    // pass is not luck. Comparing exactly two made this fail about one run in
    // three.
    const roster = ['Crusader', 'Vestal', 'Hellion', 'Highwayman', 'Plague Doctor', 'Occultist', 'Abomination', 'Jester'];
    const shapes = new Set();
    for (let i = 0; i < 25; i++) {
      const team = generateRandomTeamFromRoster(roster);
      shapes.add(team.map((h) => `${h.heroClass}:${h.activeSkills.join(',')}`).join(';'));
    }
    expect(shapes.size).toBeGreaterThan(1);
  });

  // Fifty-one of the bundled comps run a duplicated class. Membership in a
  // `Set` said one Jester was enough for Ballad Quartet's four.
  describe('respects how many of a class you have', () => {
    const classCounts = (team) =>
      team.reduce((counts, hero) => ({ ...counts, [hero.heroClass]: (counts[hero.heroClass] || 0) + 1 }), {});

    test('never doubles a class you only own one of', () => {
      const roster = ['Crusader', 'Vestal', 'Hellion', 'Highwayman', 'Plague Doctor', 'Occultist', 'Jester', 'Leper'];
      for (let i = 0; i < 60; i++) {
        const team = generateRandomTeamFromRoster(roster);
        Object.entries(classCounts(team)).forEach(([heroClass, used]) => {
          expect({ heroClass, used }).toEqual({ heroClass, used: 1 });
        });
      }
    });

    test('will double a class once you own two', () => {
      // Exactly what "Blood Money: Twin Beast" asks for.
      const roster = ['Abomination', 'Abomination', 'Bounty Hunter', 'Crusader'];
      let sawADouble = false;
      for (let i = 0; i < 80 && !sawADouble; i++) {
        sawADouble = Object.values(classCounts(generateRandomTeamFromRoster(roster))).some((n) => n > 1);
      }
      expect(sawADouble).toBe(true);
    });

    test('never suggests a comp with an empty slot', () => {
      // "The Old Road" is the tutorial pair, two heroes and two holes. An empty
      // slot asks nothing of a roster, so it would otherwise fit everyone.
      for (let i = 0; i < 40; i++) {
        generateRandomTeamFromRoster(['Crusader', 'Highwayman', 'Vestal', 'Hellion']).forEach((hero) => {
          expect(hero.heroClass).toBeTruthy();
        });
      }
    });

    test('four of one class unlocks the quartet comps', () => {
      const team = generateRandomTeamFromRoster(['Jester', 'Jester', 'Jester', 'Jester']);
      expect(team.map((h) => h.heroClass)).toEqual(['Jester', 'Jester', 'Jester', 'Jester']);
      expect(team.fromPreset).toBe(true);
    });

    test('reads a count map as well as a list', () => {
      const team = generateRandomTeamFromRoster({ Hellion: 4 });
      expect(team.map((h) => h.heroClass)).toEqual(['Hellion', 'Hellion', 'Hellion', 'Hellion']);
    });
  });

  describe('with an imported save', () => {
    const saveHeroes = [
      {
        name: 'Campbell',
        heroClass: 'Plague Doctor',
        resolveXp: 0,
        stress: 0,
        activity: '',
        isMissing: false,
        quirks: { positive: ['Quick Reflexes'], negative: ['Kleptomaniac'] },
        lockedQuirks: { positive: ['Quick Reflexes'], negative: [] },
        diseases: ['The Red Plague']
      },
      {
        name: 'Boisivon',
        heroClass: 'Plague Doctor',
        resolveXp: 3,
        stress: 40,
        activity: '',
        isMissing: false,
        quirks: { positive: ['Natural'], negative: ['Soft'] },
        lockedQuirks: { positive: [], negative: [] },
        diseases: []
      }
    ];

    test('dresses the comp in your heroes quirks, not blank ones', () => {
      const team = generateRandomTeamFromRoster(
        ['Plague Doctor', 'Plague Doctor', 'Vestal', 'Crusader'],
        false,
        { saveHeroes }
      );
      const pd = team.find((hero) => hero.heroClass === 'Plague Doctor');
      // Boisivon is the more experienced of the two, so he goes in first.
      expect(pd.quirks.positive).toEqual(['Natural']);
      expect(team.assignedHeroes).toContain('Boisivon');
    });

    test('never fills two slots with the same hero', () => {
      const roster = ['Plague Doctor', 'Plague Doctor', 'Vestal', 'Crusader'];
      for (let i = 0; i < 40; i++) {
        const team = generateRandomTeamFromRoster(roster, false, { saveHeroes });
        const used = team.assignedHeroes;
        expect(used.length).toBe(new Set(used).size);
      }
    });

    test('carries a disease across, because you cannot wish it away', () => {
      const team = generateRandomTeamFromRoster(
        ['Plague Doctor', 'Plague Doctor', 'Vestal', 'Crusader'],
        false,
        { saveHeroes }
      );
      const diseases = team.flatMap((hero) => hero.diseases || []);
      expect(diseases).toContain('The Red Plague');
    });

    test('keeps the comps own skills and trinkets - that is the recommendation', () => {
      const team = generateRandomTeamFromRoster(['Jester', 'Jester', 'Jester', 'Jester'], false, {
        saveHeroes: [{ name: 'Sarmenti', heroClass: 'Jester', quirks: { positive: [], negative: [] } }]
      });
      expect(team.fromPreset).toBe(true);
      expect(team[0].activeSkills.length).toBeGreaterThan(0);
    });

    test('flags the trinkets the comp wants and you do not have', () => {
      const team = generateRandomTeamFromRoster(['Jester', 'Jester', 'Jester', 'Jester'], false, {
        ownedTrinkets: ["Ancestor's Bottle"]
      });
      expect(team.missingTrinkets.length).toBeGreaterThan(0);
      expect(team.missingTrinkets).not.toContain("Ancestor's Bottle");
    });

    test('says so when nothing can be fully equipped rather than suggesting nothing', () => {
      const team = generateRandomTeamFromRoster(['Jester', 'Jester', 'Jester', 'Jester'], false, {
        ownedTrinkets: ["Ancestor's Bottle"],
        requireOwnedTrinkets: true
      });
      expect(team).toHaveLength(PARTY_CONFIG.MAX_HEROES);
      expect(team.warning).toMatch(/fully equipped/i);
    });

    // The comp names the trinkets it was built with. If you have imported a
    // save you probably do not own them, and a comp you cannot equip is not
    // advice - so they are swapped for the closest thing you do own.
    describe('re-equipping from your own trinkets', () => {
      const suggest = (options) =>
        generateRandomTeamFromRoster(['Jester', 'Jester', 'Jester', 'Jester'], false, options);

      test('leaves the comp alone unless asked', () => {
        const team = suggest({ ownedTrinkets: ['Feather Crystal'] });
        expect(team.trinketSwaps).toEqual([]);
        // Whatever the comp asked for is still on it.
        expect(team.some((hero) => hero.trinket1 || hero.trinket2)).toBe(true);
      });

      test('equips only what you own', () => {
        const owned = ['Feather Crystal', 'Sun Ring', 'Legendary Bracer'];
        const team = suggest({ ownedTrinkets: owned, reequip: true });
        const worn = team.flatMap((hero) => [hero.trinket1, hero.trinket2]).filter(Boolean);
        worn.forEach((trinket) => expect(owned).toContain(trinket));
      });

      test('never wears the same trinket twice across the party', () => {
        const owned = ['Feather Crystal', 'Sun Ring', 'Legendary Bracer', 'Focus Ring'];
        for (let i = 0; i < 20; i++) {
          const worn = suggest({ ownedTrinkets: owned, reequip: true })
            .flatMap((hero) => [hero.trinket1, hero.trinket2])
            .filter(Boolean);
          expect(new Set(worn).size).toBe(worn.length);
        }
      });

      test('empties the slots when you own nothing', () => {
        const team = suggest({ ownedTrinkets: [], reequip: true });
        // An empty inventory means reequip has nothing to do, so the comp's own
        // trinkets stay - there is no pool to draw from.
        expect(team.trinketSwaps).toEqual([]);
      });

      test('reports the swaps so they can be explained', () => {
        const team = suggest({
          ownedTrinkets: ['Feather Crystal', 'Sun Ring', 'Legendary Bracer'],
          reequip: true
        });
        expect(Array.isArray(team.trinketSwaps)).toBe(true);
        team.trinketSwaps.forEach((swap) => {
          expect(swap.wanted).toBeTruthy();
          expect(swap.got).toBeTruthy();
          expect(swap.got).not.toBe(swap.wanted);
        });
      });
    });
  });
});
