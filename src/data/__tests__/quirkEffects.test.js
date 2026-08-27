import { QUIRK_EFFECTS, getQuirkEffect, getQuirkEffectText } from '../quirkEffects';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../quirks';
import { DISEASES, CRIMSON_COURT_DISEASES, ALL_DISEASES, isDisease, isCrimsonCourtDisease } from '../diseases';

const ROSTER = [...POSITIVE_QUIRKS, ...NEGATIVE_QUIRKS, ...ALL_DISEASES];

describe('QUIRK_EFFECTS coverage', () => {
  // quirks.js and diseases.js own the roster, this file the effects. The two
  // can drift, and this is what notices: a quirk added without its effect
  // fails here rather than showing a bare name in the picker.
  it('has an entry for every quirk and disease on the roster', () => {
    expect(ROSTER.filter((name) => !QUIRK_EFFECTS[name])).toEqual([]);
  });

  it('does not describe quirks that are no longer on the roster', () => {
    const roster = new Set(ROSTER);
    expect(Object.keys(QUIRK_EFFECTS).filter((name) => !roster.has(name))).toEqual([]);
  });

  it('says something about every single one', () => {
    // Unlike the trinkets, there is no blank here to tolerate: a quirk with no
    // buffs carries the game's own description instead, which for the town and
    // curio quirks IS the mechanic.
    const silent = Object.entries(QUIRK_EFFECTS).filter(([, e]) => !e.effect).map(([name]) => name);
    expect(silent).toEqual([]);
  });

  it('agrees with the roster about which side each quirk is on', () => {
    const wrong = [];
    POSITIVE_QUIRKS.forEach((n) => { if (QUIRK_EFFECTS[n].kind !== 'positive') wrong.push(n); });
    NEGATIVE_QUIRKS.forEach((n) => { if (QUIRK_EFFECTS[n].kind !== 'negative') wrong.push(n); });
    ALL_DISEASES.forEach((n) => { if (QUIRK_EFFECTS[n].kind !== 'disease') wrong.push(n); });
    expect(wrong).toEqual([]);
  });

  it('keeps the roster and the effect table agreeing on the Crimson Court', () => {
    // The toggle reads the roster and the colour reads `flavour`; if these two
    // ever disagreed a Crimson Curse would be hidden but still drawn in red.
    const flagged = Object.entries(QUIRK_EFFECTS)
      .filter(([, e]) => e.flavour === 'crimson')
      .map(([name]) => name)
      .sort();
    expect(flagged).toEqual([...CRIMSON_COURT_DISEASES].sort());
  });
});

describe('QUIRK_EFFECTS shape', () => {
  const entries = Object.entries(QUIRK_EFFECTS);

  it('leaves no unfilled format specifier or markup behind', () => {
    // The text is rendered through the game's printf-style tooltip templates,
    // which carry {?token} argument markers and colour tags.
    const bad = entries
      .filter(([, e]) => /%[ds]|\{\?|colour_start|colour_end/.test(e.effect || ''))
      .map(([name, e]) => `${name}: ${e.effect}`);
    expect(bad).toEqual([]);
  });

  it("writes CRIT, not the game's internal CRT", () => {
    expect(entries.filter(([, e]) => /\bCRT\b/.test(e.effect)).map(([n]) => n)).toEqual([]);
  });

  it('never emits an empty clause between separators', () => {
    const bad = entries
      .filter(([, e]) => e.effect.split('|').some((p) => p.trim() === ''))
      .map(([name, e]) => `${name}: ${e.effect}`);
    expect(bad).toEqual([]);
  });

  it('only uses classifications and flavours the UI knows how to draw', () => {
    const badClass = entries.filter(([, e]) => ![null, 'physical', 'mental'].includes(e.classification));
    const badFlavour = entries.filter(([, e]) => ![null, 'prismatic', 'corvid', 'crimson'].includes(e.flavour));
    expect({ badClass: badClass.map(([n]) => n), badFlavour: badFlavour.map(([n]) => n) })
      .toEqual({ badClass: [], badFlavour: [] });
  });

  it('renders stats rather than flavour when a quirk has both', () => {
    // The Crimson Curse has real numbers AND "M-madness...in my veins!"; the
    // atmosphere is not what a party planner needs.
    expect(QUIRK_EFFECTS['Crimson Curse'].effect).toContain('-10% MAX HP');
    expect(QUIRK_EFFECTS['Crimson Curse'].effect).not.toMatch(/madness/i);
  });

  it('falls back to the description for a quirk that grants no buff', () => {
    // Kleptomaniac's whole mechanic is a sentence, not a stat line.
    expect(QUIRK_EFFECTS.Kleptomaniac.effect).toBe('Prone to stealing items.');
  });

  it('renders the stress templates that drop their sub-type', () => {
    // buff_stat_tooltip_stress_on_miss has no _STRESS_AMOUNT variant, so these
    // two rendered blank until the lookup learned to fall back.
    expect(QUIRK_EFFECTS.Perfectionist.effect).toBe('+5 stress when attack misses');
    expect(QUIRK_EFFECTS.Antsy.effect).toBe('+20 stress when idle in town for a week');
  });
});

describe('the disease roster', () => {
  it('keeps the Crimson Court out of the plain list', () => {
    expect(DISEASES.some((d) => CRIMSON_COURT_DISEASES.includes(d))).toBe(false);
    expect(ALL_DISEASES).toHaveLength(DISEASES.length + CRIMSON_COURT_DISEASES.length);
  });

  it('recognises its own members and nothing else', () => {
    expect(isDisease('Tapeworm')).toBe(true);
    expect(isDisease('Crimson Curse')).toBe(true);
    expect(isDisease('Kleptomaniac')).toBe(false);
    expect(isCrimsonCourtDisease('Crimson Curse (wasting)')).toBe(true);
    expect(isCrimsonCourtDisease('Tapeworm')).toBe(false);
  });

  it('does not double up as a negative quirk', () => {
    // A disease is its own list; a name in both would be pickable twice and
    // would colour differently depending on which slot it landed in.
    const negatives = new Set(NEGATIVE_QUIRKS);
    expect(ALL_DISEASES.filter((d) => negatives.has(d))).toEqual([]);
  });
});

describe('getQuirkEffect', () => {
  it('finds a quirk by name', () => {
    expect(getQuirkEffect('Tough')).toMatchObject({ kind: 'positive', effect: '+10% MAX HP' });
  });

  it('returns null for an unknown or empty name', () => {
    expect(getQuirkEffect('Not A Quirk')).toBeNull();
    expect(getQuirkEffect('')).toBeNull();
    expect(getQuirkEffect(undefined)).toBeNull();
  });
});

describe('getQuirkEffectText', () => {
  it('gives the effect line', () => {
    expect(getQuirkEffectText('Tough')).toBe('+10% MAX HP');
  });

  it('returns an empty string for an unknown quirk so callers fall back to the name', () => {
    expect(getQuirkEffectText('Not A Quirk')).toBe('');
  });
});
