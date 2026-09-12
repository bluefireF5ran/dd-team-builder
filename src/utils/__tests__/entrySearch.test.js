import { matchEntry, searchEntries, searchTerms, effectSegments } from '../entrySearch';

const trinket = (name, effect) => ({ name, effect });

describe('searchTerms', () => {
  const plain = (q) => searchTerms(q).map((t) => t.text);

  it('splits on anything that is not a letter or digit', () => {
    expect(plain('  20% DODGE ')).toEqual(['20', 'dodge']);
  });

  it('is empty for a blank query', () => {
    expect(searchTerms('   ')).toEqual([]);
    expect(searchTerms(undefined)).toEqual([]);
    expect(searchTerms(null)).toEqual([]);
  });

  it('reads a leading + or - as a sign filter, not punctuation', () => {
    expect(searchTerms('+dodge')).toEqual([{ text: 'dodge', sign: '+' }]);
    expect(searchTerms('-dodge')).toEqual([{ text: 'dodge', sign: '-' }]);
    expect(searchTerms('dodge')).toEqual([{ text: 'dodge', sign: null }]);
  });

  it('signs each token on its own', () => {
    expect(searchTerms('+dmg -acc')).toEqual([
      { text: 'dmg', sign: '+' },
      { text: 'acc', sign: '-' },
    ]);
  });

  it('ignores a bare sign with nothing attached', () => {
    expect(searchTerms('+')).toEqual([]);
    expect(searchTerms('- dodge')).toEqual([{ text: 'dodge', sign: null }]);
  });
});

describe('effectSegments', () => {
  it('reads the sign of each clause', () => {
    const segs = effectSegments('+10 DODGE | -10% MAX HP');
    expect(segs.map((s) => [...s.signs])).toEqual([['+'], ['-']]);
  });

  it('splits comma-joined halves so a sign stays on its own stat', () => {
    // Both signs live in one pipe-clause here; only the comma tells them apart.
    const segs = effectSegments('On Monster Kill: Self: -2% Stress (2 battles), +2 ACC (2 battles)');
    expect(segs).toHaveLength(2);
    expect([...segs[0].signs]).toEqual(['-']);
    expect([...segs[1].signs]).toEqual(['+']);
  });

  it('records no sign for a clause that carries no signed number', () => {
    const segs = effectSegments('30% Damage Reflection');
    expect([...segs[0].signs]).toEqual([]);
  });
});

describe('matchEntry', () => {
  it('matches on the effect text, not only the name', () => {
    const m = matchEntry('dodge', trinket('Tough Ring', '+10 DODGE | -10% MAX HP'));
    expect(m).not.toBeNull();
    expect(m.inEffect).toBe(true);
    expect(m.inName).toBe(false);
  });

  it('ranks a name hit above an effect hit', () => {
    const byName = matchEntry('dodge', trinket('Dodge Charm', '+5% CRIT'));
    const byEffect = matchEntry('dodge', trinket('Tough Ring', '+10 DODGE'));
    expect(byName.score).toBeGreaterThan(byEffect.score);
  });

  it('ands the terms together across both fields', () => {
    const entry = trinket('Sun Ring', '+10 DODGE | +5% CRIT');
    expect(matchEntry('dodge crit', entry)).not.toBeNull();
    // "stun" appears nowhere, so the whole query fails
    expect(matchEntry('dodge stun', entry)).toBeNull();
  });

  it('treats the game abbreviation and the word players type as one term', () => {
    const acc = trinket('Focus Talisman', '+5 ACC | -6 DODGE');
    expect(matchEntry('accuracy', acc)).not.toBeNull();
    const prot = trinket('Knitted Blanket', '+25% PROT');
    expect(matchEntry('armor', prot)).not.toBeNull();
    expect(matchEntry('protection', prot)).not.toBeNull();
    const dmg = trinket('Berserk Mask', '+20% DMG');
    expect(matchEntry('damage', dmg)).not.toBeNull();
  });

  it('matches a prefix so results narrow while typing', () => {
    expect(matchEntry('dodg', trinket('Tough Ring', '+10 DODGE'))).not.toBeNull();
    expect(matchEntry('acc', trinket('Focus Talisman', '+5 ACC'))).not.toBeNull();
  });

  it('does not match a token buried inside a longer word', () => {
    // "hp" must not be found inside "sharp"
    expect(matchEntry('hp', trinket('Sharp Blade', 'Sharpened edge'))).toBeNull();
  });

  it('ignores apostrophes and accents, like the rest of the app', () => {
    expect(matchEntry('academie ring', trinket('Académie Ring', '+35% Debuff Skill Chance'))).not.toBeNull();
    expect(matchEntry('lashs anger', trinket("Lash's Anger", '+15% DMG'))).not.toBeNull();
  });

  it('still finds a trinket by the misspelling NAME_ALIASES knows', () => {
    // The behaviour nameMatchesSearch had, kept: these aliases are real
    // spellings that turn up in imported saves and wiki copy/paste.
    expect(matchEntry('tassle', trinket("Vvulf's Tassel", '+20% DMG'))).not.toBeNull();
    expect(matchEntry('primatic', trinket('Prismatic Eye', '+10% CRIT'))).not.toBeNull();
  });

  it('does not let an alias hit outrank the trinket actually named that', () => {
    const alias = matchEntry('tassel', trinket("Vvulf's Tassel", ''));
    expect(alias.inName).toBe(true);
  });

  it('searches the extra tags a caller supplies', () => {
    const m = matchEntry('very rare', { name: 'Berserk Mask', effect: '+20% DMG', tags: ['Very Rare'] });
    expect(m).not.toBeNull();
  });

  it('reports a zero-score match for a blank query so nothing is filtered out', () => {
    const m = matchEntry('', trinket('Sun Ring', '+10 DODGE'));
    expect(m).toEqual({ score: 0, inName: false, inEffect: false });
  });

  describe('the +/- sign filter', () => {
    const grants = trinket('Tough Ring', '+10 DODGE | -10% MAX HP');
    const costs = trinket('Berserk Mask', '+20% DMG | -10 DODGE');

    it('keeps only the sign that was asked for', () => {
      expect(matchEntry('+dodge', grants)).not.toBeNull();
      expect(matchEntry('+dodge', costs)).toBeNull();

      expect(matchEntry('-dodge', costs)).not.toBeNull();
      expect(matchEntry('-dodge', grants)).toBeNull();
    });

    it('still matches either way round without a sign', () => {
      expect(matchEntry('dodge', grants)).not.toBeNull();
      expect(matchEntry('dodge', costs)).not.toBeNull();
    });

    it('reads the sign of the matched stat, not of the whole line', () => {
      // Both entries carry a "+" and a "-" somewhere; the question is which
      // one sits on the stat being searched.
      expect(matchEntry('-hp', grants)).not.toBeNull();
      expect(matchEntry('+hp', grants)).toBeNull();
      expect(matchEntry('+dmg', costs)).not.toBeNull();
      expect(matchEntry('-dmg', costs)).toBeNull();
    });

    it('reads it per comma-joined half as well as per clause', () => {
      const coat = trinket('Coat Of Many Colors',
        'On Monster Kill: Self: -2% Stress (2 battles), +2 ACC (2 battles)');
      expect(matchEntry('-stress', coat)).not.toBeNull();
      expect(matchEntry('+stress', coat)).toBeNull();
      expect(matchEntry('+acc', coat)).not.toBeNull();
      expect(matchEntry('-acc', coat)).toBeNull();
    });

    it('does not match a clause that carries no sign at all', () => {
      const mirror = trinket('Mirror Shield', '+10 DODGE | 30% Damage Reflection');
      expect(matchEntry('reflection', mirror)).not.toBeNull();
      expect(matchEntry('+reflection', mirror)).toBeNull();
    });

    it('asks the effect, never the name', () => {
      // Named for dodge, does not grant any.
      const named = trinket('Dodge Charm', '+5% CRIT');
      expect(matchEntry('dodge', named)).not.toBeNull();
      expect(matchEntry('+dodge', named)).toBeNull();
    });

    it('honours the synonyms a plain term would', () => {
      const prot = trinket('Knitted Blanket', '+25% PROT | -12 DODGE');
      expect(matchEntry('+armor', prot)).not.toBeNull();
      expect(matchEntry('-armour', prot)).toBeNull();
    });

    it('combines with an unsigned term', () => {
      const entry = trinket('Sun Ring', '+10 DODGE | +5% CRIT');
      expect(matchEntry('+dodge crit', entry)).not.toBeNull();
      expect(matchEntry('+dodge stun', entry)).toBeNull();
    });

    it('can require two signs at once', () => {
      const entry = trinket('Focus Talisman', '+5 ACC | -6 DODGE');
      expect(matchEntry('+acc -dodge', entry)).not.toBeNull();
      expect(matchEntry('+acc +dodge', entry)).toBeNull();
    });

    it('scores as an effect hit, so a name match still outranks it', () => {
      const signed = matchEntry('+dodge', grants);
      const byName = matchEntry('tough', grants);
      expect(byName.score).toBeGreaterThan(signed.score);
      expect(signed.inName).toBe(false);
      expect(signed.inEffect).toBe(true);
    });
  });
});

describe('searchEntries', () => {
  const describe_ = (name) => ({ name, effect: EFFECTS[name] || '' });
  const EFFECTS = {
    'Sun Ring': '+15% DMG vs Unholy',
    'Tough Ring': '+10 DODGE',
    'Dodge Charm': '+5% CRIT',
    'Berserk Mask': '+20% DMG | -10 DODGE',
  };
  const names = ['Sun Ring', 'Tough Ring', 'Dodge Charm', 'Berserk Mask'];

  it('leaves the list and its curated order untouched with no query', () => {
    const out = searchEntries(names, '', describe_);
    expect(out.map((r) => r.name)).toEqual(names);
    expect(out.every((r) => r.match === null)).toBe(true);
  });

  it('keeps only matches, name hits first', () => {
    const out = searchEntries(names, 'dodge', describe_);
    expect(out.map((r) => r.name)).toEqual(['Dodge Charm', 'Tough Ring', 'Berserk Mask']);
  });

  it('breaks ties by the original order rather than reshuffling', () => {
    const out = searchEntries(names, 'dmg', describe_);
    expect(out.map((r) => r.name)).toEqual(['Sun Ring', 'Berserk Mask']);
  });

  it('returns nothing when a term lands nowhere', () => {
    expect(searchEntries(names, 'zzzz', describe_)).toEqual([]);
  });
});
