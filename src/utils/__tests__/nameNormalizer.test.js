import {
  nameKey,
  canonicalizeHeroClass,
  canonicalizeTrinket,
  canonicalizeSkill,
  canonicalizeCampSkill,
  canonicalizeQuirk,
  canonicalizeTeam
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

  it('passes through malformed input', () => {
    expect(canonicalizeTeam(null)).toBeNull();
    expect(canonicalizeTeam({ teamName: 'x' })).toEqual({ teamName: 'x' });
  });
});
