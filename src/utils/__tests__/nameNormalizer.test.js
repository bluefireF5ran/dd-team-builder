import {
  nameKey,
  canonicalizeHeroClass,
  canonicalizeTrinket,
  canonicalizeSkill,
  canonicalizeCampSkill,
  canonicalizeQuirk,
  canonicalizeTeam,
  getNameAliases,
  nameMatchesSearch
} from '../nameNormalizer';

describe('nameKey', () => {
  it('treats every apostrophe variant as the same character', () => {
    const expected = nameKey("Ancestor's Candle");
    expect(nameKey('Ancestor’s Candle')).toBe(expected);
    expect(nameKey('Ancestor´s Candle')).toBe(expected);
    expect(nameKey('Ancestor`s Candle')).toBe(expected);
    expect(nameKey('Ancestors Candle')).toBe(expected);
  });

  it('ignores case, accents and extra whitespace', () => {
    expect(nameKey('Coup de Grâce')).toBe(nameKey('  coup  de grace '));
  });

  it('is safe with non-string input', () => {
    expect(nameKey(undefined)).toBe('');
    expect(nameKey(null)).toBe('');
    expect(nameKey(42)).toBe('');
  });
});

describe('canonicalize*', () => {
  it('repairs title-cased apostrophes in trinket names', () => {
    expect(canonicalizeTrinket("Ancestor'S Candle", 'Duelist')).toBe("Ancestor's Candle");
    expect(canonicalizeTrinket('Fuseman’s Matchstick', 'Flagellant')).toBe("Fuseman's Matchstick");
  });

  it('prefers the class-specific trinket spelling', () => {
    expect(canonicalizeTrinket('gilded mantle', 'Duelist')).toBe('Gilded Mantle');
    expect(canonicalizeTrinket("champion'S mantle", 'Duelist')).toBe("Champion's Mantle");
  });

  it('repairs camp skill and skill names', () => {
    expect(canonicalizeCampSkill("Lash'S Anger", 'Flagellant')).toBe("Lash's Anger");
    expect(canonicalizeSkill('touche', 'Duelist')).toBe('Touché');
    expect(canonicalizeSkill('coup de grace', 'Duelist')).toBe('Coup de Grâce');
  });

  it('repairs hero class and quirk names', () => {
    expect(canonicalizeHeroClass('grave robber')).toBe('Grave Robber');
    expect(canonicalizeQuirk('quick reflexes', true)).toBe('Quick Reflexes');
  });

  it('keeps unknown names untouched', () => {
    expect(canonicalizeTrinket('Totally Made Up Thing', 'Duelist')).toBe('Totally Made Up Thing');
    expect(canonicalizeCampSkill("Lash's Anger", 'Not A Class')).toBe("Lash's Anger");
  });
});

describe('canonicalizeTeam', () => {
  it('normalizes a whole imported team without dropping fields', () => {
    const raw = {
      teamName: 'GA duelist 01',
      location: 'The Ruins',
      heroes: [
        {
          heroClass: 'Flagellant',
          activeSkills: ['Endure'],
          activeCampSkills: ["Lash'S Anger", "Lash's Cure"],
          trinket1: 'Blight Charm',
          trinket2: 'Fuseman’s Matchstick',
          quirks: { positive: ['irrepressible'], negative: [] },
          lockedQuirks: { positive: [], negative: [] }
        }
      ]
    };

    const team = canonicalizeTeam(raw);
    const hero = team.heroes[0];

    expect(team.teamName).toBe('GA duelist 01');
    expect(hero.activeCampSkills).toEqual(["Lash's Anger", "Lash's Cure"]);
    expect(hero.trinket2).toBe("Fuseman's Matchstick");
    expect(hero.quirks.positive).toEqual(['Irrepressible']);
    expect(hero.trinket1).toBe('Blight Charm');
    expect(raw.heroes[0].activeCampSkills[0]).toBe("Lash'S Anger");
  });

  it("canonicalizes a Sibyl comp exported with the mod's class id", () => {
    const raw = {
      teamName: 'sibyl_ms Coverage 02',
      location: 'The Ruins',
      heroes: [
        {
          heroClass: 'sibyl_ms',
          activeSkills: ['Alignment', 'Moonlight Touch'],
          activeCampSkills: ['GARDEN HARVEST', 'IN HER RADIANCE', 'PANACEA'],
          trinket1: 'Lunar Veil',
          trinket2: 'Petal Pouch'
        }
      ]
    };
    const hero = canonicalizeTeam(raw).heroes[0];
    expect(hero.heroClass).toBe('Sibyl');
    expect(hero.activeCampSkills).toEqual(['Garden Harvest', 'In Her Radiance', 'Panacea']);
  });

  it('passes through malformed input', () => {
    expect(canonicalizeTeam(null)).toBeNull();
    expect(canonicalizeTeam({ teamName: 'x' })).toEqual({ teamName: 'x' });
  });
});

describe('name aliases', () => {
  it("resolves the old 'Tassle' spelling to the in-game 'Tassel'", () => {
    expect(canonicalizeTrinket("Vvulf's Tassle", 'Crusader')).toBe("Vvulf's Tassel");
    expect(canonicalizeTrinket("vvulfs tassle", 'Crusader')).toBe("Vvulf's Tassel");
    expect(canonicalizeTrinket("Vvulf's Tassel", 'Crusader')).toBe("Vvulf's Tassel");
  });

  it('resolves the other trinket spellings to the in-game name', () => {
    expect(canonicalizeTrinket("Ancestor's Mustache Cream", 'Crusader'))
      .toBe("Ancestor's Moustache Cream");
    // El de clase gana sobre el índice global y conserva el nombre del juego.
    expect(canonicalizeTrinket("Hunter's Talons", 'Bounty Hunter')).toBe("Hunter's Talon");
    expect(canonicalizeTrinket("Hunter's Talons", 'Vestal')).toBe("Hunter's Talon");
  });

  it('resolves the internal game id emitted by external comp tools', () => {
    expect(canonicalizeTrinket('dd_trinket', 'Runaway')).toBe('Talisman of the Flame');
  });

  it("resolves the Sibyl mod's internal class id to the display name", () => {
    expect(canonicalizeHeroClass('sibyl_ms')).toBe('Sibyl');
    expect(canonicalizeHeroClass('SIBYL_MS')).toBe('Sibyl');
    expect(canonicalizeHeroClass('Sibyl')).toBe('Sibyl');
  });

  it('resolves misspelled quirks to their in-game name', () => {
    expect(canonicalizeQuirk('Hulk Slayer', true)).toBe('Husk Slayer');
    expect(canonicalizeQuirk('Mediator', true)).toBe('Meditator');
    expect(canonicalizeQuirk('Primatic Eye', true)).toBe('Prismatic Eye');
    expect(canonicalizeQuirk('Resillient', true)).toBe('Resilient');
    expect(canonicalizeQuirk('Unyealding', true)).toBe('Unyielding');
    expect(canonicalizeQuirk('Cove Phove', false)).toBe('Cove Phobe');
    expect(canonicalizeQuirk('Fear of Eldrich', false)).toBe('Fear of Eldritch');
    // Ya correctos: se quedan igual.
    expect(canonicalizeQuirk('Precise Striker', true)).toBe('Precise Striker');
    expect(canonicalizeQuirk('Husk Slayer', true)).toBe('Husk Slayer');
  });

  it('resolves the trinket spellings the app used to ship', () => {
    expect(canonicalizeTrinket('Tempting Goblet', 'Crusader')).toBe('The Tempting Goblet');
    expect(canonicalizeTrinket('Crystalline Fang', 'Crusader')).toBe("Thing's Crystalline Fang");
    expect(canonicalizeTrinket('Phase Shifting Hide', 'Crusader'))
      .toBe("Thing's Phase Shifting Hide");
    expect(canonicalizeTrinket('Ajs Growling Tome of Madness', 'Crusader'))
      .toBe("AJ's Growling Tome of Maddness");
    expect(canonicalizeTrinket('Crest of 1100', 'Crusader')).toBe('Crest of the 1100');
    expect(canonicalizeTrinket('K Scorpio Necklace', 'Crusader')).toBe('K Scorpio Necklase');
    expect(canonicalizeTrinket('Tome of Agh Be', 'Crusader')).toBe("Tome of Agh'Be");
  });

  it('shortens the 98-character Papyrus name back to the one the UI shows', () => {
    const full = 'Papyrus Containing The Spell To Preserve Its Possessor Against Attacks '
      + 'From He Who Is In The Water';
    expect(canonicalizeTrinket(full, 'Crusader')).toBe('Papyrus Containing the Spell');
  });

  it('leaves names that are already canonical untouched', () => {
    ['The Tempting Goblet', "Thing's Crystalline Fang", 'Crest of the 1100',
     "Tome of Agh'Be", 'Dés Chanceux', 'Talisman of the Flame'].forEach((name) => {
      expect(canonicalizeTrinket(name, 'Crusader')).toBe(name);
    });
  });

  it('exposes the alternative spellings of a name', () => {
    expect(getNameAliases("Vvulf's Tassel")).toContain("Vvulf's Tassle");
    expect(getNameAliases('Bleed Charm')).toEqual([]);
  });

  it('matches a search by any of the alternative spellings', () => {
    expect(nameMatchesSearch('The Tempting Goblet', 'tempting')).toBe(true);
    expect(nameMatchesSearch("Thing's Crystalline Fang", 'crystalline fang')).toBe(true);
    expect(nameMatchesSearch('Prismatic Eye', 'primatic')).toBe(true);
    expect(nameMatchesSearch('Cove Phobe', 'phove')).toBe(true);
  });

  it('matches a search by either spelling', () => {
    expect(nameMatchesSearch("Vvulf's Tassel", 'tassle')).toBe(true);
    expect(nameMatchesSearch("Vvulf's Tassel", 'tassel')).toBe(true);
    expect(nameMatchesSearch("Vvulf's Tassel", 'vvulf')).toBe(true);
    expect(nameMatchesSearch("Vvulf's Tassel", 'crusader')).toBe(false);
    expect(nameMatchesSearch('Bleed Charm', '')).toBe(true);
  });
  describe('class-scoped skill aliases', () => {
    // El nombre bueno depende de la clase, asi que una tabla plana no sirve:
    // `Wound Care` es correcto en dieciocho clases y equivocado en las dos de
    // Fire's Edge, que el juego llama `First Aid`.
    it("resolves the Shieldbreaker's camp skill written as one word", () => {
      expect(canonicalizeCampSkill('Snakeskin', 'Shieldbreaker')).toBe('Snake Skin');
      expect(canonicalizeCampSkill('Snake Skin', 'Shieldbreaker')).toBe('Snake Skin');
    });

    it("renames Wound Care to First Aid only for the Fire's Edge classes", () => {
      expect(canonicalizeCampSkill('Wound Care', 'Duelist')).toBe('First Aid');
      expect(canonicalizeCampSkill('Wound Care', 'Runaway')).toBe('First Aid');
    });

    it('leaves Wound Care alone for every class that really has it', () => {
      ['Crusader', 'Abomination', 'Vestal', 'Leper', 'Houndmaster'].forEach((heroClass) => {
        expect(canonicalizeCampSkill('Wound Care', heroClass)).toBe('Wound Care');
      });
    });

    it('does not leak a class alias into another class', () => {
      // La Shieldbreaker no tiene `First Aid`, y el Duelist no tiene `Snake Skin`:
      // un alias cuyo canonico la clase no lleva no debe aplicarse.
      expect(canonicalizeCampSkill('Snakeskin', 'Duelist')).toBe('Snakeskin');
      expect(canonicalizeCampSkill('Wound Care', 'Shieldbreaker')).toBe('Wound Care');
    });
  });
});
