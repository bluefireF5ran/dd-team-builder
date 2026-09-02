import {
  parseClause,
  effectProfile,
  trinketProfile,
  targetProfile,
  profileMatch,
  downsideShare,
  describeProfile,
  LOWER_IS_BETTER
} from '../trinketProfile';

describe('parseClause', () => {
  it('reads sign, magnitude and stat', () => {
    expect(parseClause('+10% DMG')).toEqual({ base: 'dmg', amount: 10, conditional: false });
    expect(parseClause('-15 ACC')).toEqual({ base: 'acc', amount: -15, conditional: false });
  });

  it('marks a conditional clause as one', () => {
    expect(parseClause('+25% DMG if in position 4')).toEqual({
      base: 'dmg',
      amount: 25,
      conditional: true
    });
    expect(parseClause('+15% DMG vs Beast').conditional).toBe(true);
  });

  it('folds the melee/ranged split into the base stat', () => {
    expect(parseClause('+18% DMG Melee Skills').base).toBe('dmg');
    expect(parseClause('+22 ACC Ranged Skills').base).toBe('acc');
  });

  it('skips prose rather than guessing at it', () => {
    // About a fifth of the corpus is prose, and prose has no vector.
    expect(parseClause('Attacks usable in any position')).toBeNull();
    expect(parseClause('No stress penalty when walking backwards.')).toBeNull();
  });
});

describe('benefit, not sign', () => {
  it('treats added stress as a cost even though it is a plus', () => {
    // Grim Bandana: damage bought with stress.
    const profile = effectProfile('+10% DMG | +3% CRIT | +20% Stress Dealt | +10% Stress');
    expect(profile.get('dmg')).toBeGreaterThan(0);
    expect(profile.get('stress')).toBeLessThan(0);
    // Stress you inflict is a different stat, and a benefit.
    expect(profile.get('stress dealt')).toBeGreaterThan(0);
  });

  it('treats removed stress as a benefit even though it is a minus', () => {
    const profile = effectProfile('-15% Stress | +10 DODGE');
    expect(profile.get('stress')).toBeGreaterThan(0);
  });

  it('knows the near-misses apart', () => {
    expect(LOWER_IS_BETTER.has('stress')).toBe(true);
    expect(LOWER_IS_BETTER.has('stress dealt')).toBe(false);
    expect(LOWER_IS_BETTER.has('chance party surprised')).toBe(true);
    expect(LOWER_IS_BETTER.has('chance monsters surprised')).toBe(false);
    // Eating more is a cost; eating less is the Fasting Seal's whole point.
    expect(effectProfile('+50% Food Consumed').get('food consumed')).toBeLessThan(0);
    expect(effectProfile('-100% Food Consumed').get('food consumed')).toBeGreaterThan(0);
  });

  it('discounts a conditional clause against an unconditional one', () => {
    const always = effectProfile('+10% DMG');
    const sometimes = effectProfile('+10% DMG if Torch below 26');
    expect(sometimes.get('dmg')).toBeLessThan(always.get('dmg'));
    expect(sometimes.get('dmg')).toBeGreaterThan(0);
  });
});

describe('trinketProfile', () => {
  it('resolves a typographic apostrophe, which the effect store does not', () => {
    // The stores are keyed by exact string, and an unresolved name yields an
    // empty profile that silently matches nothing.
    expect(trinketProfile('Ancestor’s Bottle').size).toBeGreaterThan(0);
    expect(trinketProfile("Ancestor's Bottle").size).toBeGreaterThan(0);
  });

  it('reads a real trinket out of the generated data', () => {
    const profile = trinketProfile('Sun Ring');
    expect(profile.size).toBeGreaterThan(0);
  });

  it('is empty, not wrong, for a trinket with no known effect', () => {
    // Stake, Necklace and Flickering Lamplight ship with no buffs at all.
    expect(trinketProfile('Stake').size).toBe(0);
    expect(trinketProfile('Not A Trinket').size).toBe(0);
  });
});

describe('targetProfile', () => {
  it('asks for the upside only, never the price', () => {
    // The comp accepted the stress; it is not something to go looking for.
    const target = targetProfile(['Grim Bandana']);
    expect(target.has('dmg')).toBe(true);
    expect(target.has('stress')).toBe(false);
  });

  it('combines both trinkets a hero was given', () => {
    const target = targetProfile(['Sun Ring', 'Sun Cloak']);
    expect(target.size).toBeGreaterThan(0);
  });
});

describe('profileMatch', () => {
  it('prefers a trinket that does the same job', () => {
    const target = effectProfile('+4 SPD | +10 DODGE');
    const alike = profileMatch(effectProfile('+3 SPD | +8 DODGE'), target);
    const unlike = profileMatch(effectProfile('+20% MAX HP | +15% PROT'), target);
    expect(alike).toBeGreaterThan(unlike);
    // Not 1: it delivers a bit less than was asked for, and coverage says so.
    expect(alike).toBeGreaterThan(0.7);
    expect(unlike).toBeLessThanOrEqual(0);
  });

  it('scores a trinket that does the opposite against itself', () => {
    const target = effectProfile('+4 SPD | +10 DODGE');
    expect(profileMatch(effectProfile('-4 SPD | -10 DODGE'), target)).toBeLessThanOrEqual(0);
  });

  it('covers half the target when it gives half as much', () => {
    // Half is the honest answer when half is all you own - and still far ahead
    // of a trinket that covers none of it.
    const target = effectProfile('+8 SPD | +20 DODGE');
    const half = profileMatch(effectProfile('+4 SPD | +10 DODGE'), target);
    expect(half).toBeCloseTo(0.5, 1);
    expect(half).toBeGreaterThan(profileMatch(effectProfile('+20% MAX HP'), target));
  });

  it('does not mark a candidate down for being better than the original', () => {
    // Feather Crystal covers a wanted +2 SPD in full and throws in dodge. The
    // first version scored the angle between the vectors and rejected it.
    const target = targetProfile(['Quickening Satchel']);
    expect(profileMatch(trinketProfile('Feather Crystal'), target)).toBeGreaterThan(0.5);
  });

  it('does not reward overshooting either', () => {
    const target = effectProfile('+4 SPD');
    const exact = profileMatch(effectProfile('+4 SPD'), target);
    const lots = profileMatch(effectProfile('+40 SPD'), target);
    expect(lots).toBeCloseTo(exact, 5);
  });

  it('marks down a trinket that drags a cost along', () => {
    const target = effectProfile('+10% DMG');
    const clean = profileMatch(effectProfile('+10% DMG'), target);
    const costly = profileMatch(effectProfile('+10% DMG | +15% Stress | -10 ACC'), target);
    expect(costly).toBeLessThan(clean);
  });

  it('is zero against a target that wants nothing', () => {
    expect(profileMatch(effectProfile('+10% DMG'), new Map())).toBe(0);
  });
});

describe('downsideShare', () => {
  it('is nothing for a clean trinket and something for a costly one', () => {
    expect(downsideShare(effectProfile('+10% DMG | +5 ACC'))).toBe(0);
    expect(downsideShare(effectProfile('+10% DMG | +30% Stress'))).toBeGreaterThan(0);
  });
});

describe('describeProfile', () => {
  it('names what a trinket is mostly for', () => {
    expect(describeProfile(effectProfile('+4 SPD | +10 DODGE | +1% CRIT'), 2)).toEqual(
      expect.arrayContaining(['dodge'])
    );
  });
});
