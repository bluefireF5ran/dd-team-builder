import { TRINKET_EFFECTS, getTrinketEffect, getTrinketEffectText } from '../trinketEffects';
import { HERO_SPECIFIC_TRINKETS, ALL_HERO_SPECIFIC_TRINKETS } from '../hero_specific_trinkets';
import { TRINKETS } from '../trinkets';
import { BACKER_TRINKETS } from '../backer_trinkets';

// Three trinkets have no effect in any source: the game ships them with an
// empty buff list and the wiki export leaves the cell blank. They deliberately
// have no entry, so the tooltip falls back to the name alone.
const NO_EFFECT_DATA = ['Flickering Lamplight', 'Necklace', 'Stake'];

const ROSTER = [...new Set([...ALL_HERO_SPECIFIC_TRINKETS, ...TRINKETS, ...BACKER_TRINKETS])];

describe('TRINKET_EFFECTS coverage', () => {
  // The roster lives in hero_specific_trinkets.js, trinkets.js and
  // backer_trinkets.js; the effects live here. Those files can drift, and this
  // is the thing that notices. Adding a trinket without its effect fails here
  // rather than showing up as a silently name-only tooltip.
  it('has an entry for every trinket on the roster', () => {
    const missing = ROSTER
      .filter((name) => !TRINKET_EFFECTS[name])
      .filter((name) => !NO_EFFECT_DATA.includes(name));
    expect(missing).toEqual([]);
  });

  it('does not describe trinkets that no longer exist', () => {
    const roster = new Set(ROSTER);
    const orphans = Object.keys(TRINKET_EFFECTS).filter((name) => !roster.has(name));
    expect(orphans).toEqual([]);
  });

  it('covers every class that has hero-specific trinkets', () => {
    Object.entries(HERO_SPECIFIC_TRINKETS).forEach(([heroClass, list]) => {
      const missing = list.filter((name) => !TRINKET_EFFECTS[name]);
      expect({ heroClass, missing }).toEqual({ heroClass, missing: [] });
    });
  });

  it('covers the generic and backer trinkets too', () => {
    const missing = [...TRINKETS, ...BACKER_TRINKETS]
      .filter((name) => !TRINKET_EFFECTS[name])
      .filter((name) => !NO_EFFECT_DATA.includes(name));
    expect(missing).toEqual([]);
  });

  it('keeps the no-effect exceptions genuinely absent rather than blank', () => {
    // If the game ever gains data for one of these, drop it from the list
    // instead of leaving a stale exception behind.
    NO_EFFECT_DATA.forEach((name) => {
      expect(TRINKET_EFFECTS[name]).toBeUndefined();
    });
  });
});

describe('TRINKET_EFFECTS shape', () => {
  it('gives every entry non-empty effect text', () => {
    const blank = Object.entries(TRINKET_EFFECTS)
      .filter(([, v]) => typeof v.effect !== 'string' || v.effect.trim() === '')
      .map(([k]) => k);
    expect(blank).toEqual([]);
  });

  it('leaves no rarity marker stranded in the effect text', () => {
    // The effect is rendered from the game's buff templates; a rarity token at
    // the front means a source line was split on the wrong separator.
    const markers = ['Common -', 'Uncommon -', 'Rare -', 'Very Rare -', 'CC Set -', 'SB Set -', 'Crystalline -', 'Ringmaster -'];
    const stranded = Object.entries(TRINKET_EFFECTS)
      .filter(([, v]) => markers.some((m) => v.effect.startsWith(m)))
      .map(([k, v]) => `${k}: ${v.effect}`);
    expect(stranded).toEqual([]);
  });

  it('separates effect clauses with " | " and never leaves an empty one', () => {
    const malformed = Object.entries(TRINKET_EFFECTS)
      .filter(([, v]) => v.effect.split('|').some((part) => part.trim() === ''))
      .map(([k, v]) => `${k}: ${v.effect}`);
    expect(malformed).toEqual([]);
  });

  it('writes CRIT, not the game\'s internal CRT', () => {
    const wrong = Object.entries(TRINKET_EFFECTS)
      .filter(([, v]) => /\bCRT\b/.test(v.effect))
      .map(([k]) => k);
    expect(wrong).toEqual([]);
  });

  it('only omits rarity for the Runaway Sunstone chain', () => {
    const tierless = Object.entries(TRINKET_EFFECTS)
      .filter(([, v]) => v.rarity === null)
      .map(([k]) => k);
    expect(tierless.sort()).toEqual([
      'Heated Sunstone',
      'Inert Sunstone',
      'Scorching Sunstone',
      'Searing Sunstone'
    ]);
  });
});

describe('getTrinketEffect', () => {
  it('looks up a known trinket', () => {
    expect(getTrinketEffect('Lock of Fury')).toEqual({
      rarity: 'Rare',
      effect: '+10% DMG | +3 SPD | -10% MAX HP'
    });
  });

  it('handles names carrying an apostrophe', () => {
    expect(getTrinketEffect("Medic's Greaves").effect).toBe('+33% Healing Skills');
  });

  it('describes generic trinkets', () => {
    expect(getTrinketEffect('Accuracy Stone')).toEqual({
      rarity: 'Very Common',
      effect: '+4 ACC | -1 SPD'
    });
  });

  it('describes backer trinkets', () => {
    expect(getTrinketEffect('Adamant')).toEqual({
      rarity: 'Kickstarter',
      effect: '+6% PROT | +10% Move Resist | -6 DODGE | -4 SPD'
    });
  });

  it('keeps a buff\'s condition attached to the clause it qualifies', () => {
    expect(getTrinketEffect('Wrathful Bandana').effect)
      .toBe('+25% DMG if in position 4 | +30% Debuff Skill Chance | -50% Healing Skills');
  });

  it('returns null for a trinket with no effect data in any source', () => {
    expect(getTrinketEffect('Flickering Lamplight')).toBeNull();
  });

  it('returns null for an unknown or empty name', () => {
    expect(getTrinketEffect('Not A Trinket')).toBeNull();
    expect(getTrinketEffect('')).toBeNull();
    expect(getTrinketEffect(undefined)).toBeNull();
  });
});

describe('getTrinketEffectText', () => {
  it('joins rarity and effect for display', () => {
    expect(getTrinketEffectText('Lock of Fury')).toBe('Rare — +10% DMG | +3 SPD | -10% MAX HP');
  });

  it('omits the dash when the trinket has no rarity', () => {
    expect(getTrinketEffectText('Inert Sunstone')).toBe('-2 SPD | Transforms into Heated Sunstone');
  });

  it('returns an empty string for an unknown trinket so callers fall back to the name', () => {
    expect(getTrinketEffectText('Not A Trinket')).toBe('');
  });
});
