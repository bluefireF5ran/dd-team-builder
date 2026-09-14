import {
  setOptionalTrinkets,
  resetOptionalTrinketsForTests,
  isTrinketAllowed,
  allowedTrinkets,
  optionalTrinketsEnabled
} from '../optionalTrinkets';
import { BACKER_TRINKETS } from '../backer_trinkets';
import { TRINKET_EFFECTS } from '../trinketEffects';
import { bisLoadout, resetBisCaches } from '../bisIndex';
import { reequipParty } from '../../utils/trinketReequip';

afterEach(() => {
  resetOptionalTrinketsForTests();
  resetBisCaches();
});

const hero = (heroClass, rank) => ({
  heroClass,
  activeSkills: bisLoadout(heroClass, rank)?.activeSkills || [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  diseases: []
});

describe('optional content is off until the player says otherwise', () => {
  it('starts with both groups off', () => {
    expect(optionalTrinketsEnabled()).toEqual({ backer: false, circus: false });
  });

  it('turns away a Butcher\'s Circus trinket and a backer one', () => {
    expect(isTrinketAllowed("Monkey's Paw")).toBe(false);
    expect(isTrinketAllowed(BACKER_TRINKETS[0])).toBe(false);
    // And leaves the base game alone, which is nearly everything.
    expect(isTrinketAllowed('Ancestor\'s Map')).toBe(true);
    expect(isTrinketAllowed('Focus Ring')).toBe(true);
  });

  it('lets each group in on its own', () => {
    setOptionalTrinkets({ circus: true });
    expect(isTrinketAllowed("Monkey's Paw")).toBe(true);
    expect(isTrinketAllowed(BACKER_TRINKETS[0])).toBe(false);

    setOptionalTrinkets({ backer: true });
    expect(isTrinketAllowed(BACKER_TRINKETS[0])).toBe(true);
  });

  it("counts the Ringmaster's own trinkets as Circus content", () => {
    // The game gives them their own rarity, and Fran named them: "backer
    // trinkets or ringmaster ones". A Vestal was being told to wear two.
    expect(isTrinketAllowed('Purgation Talisman')).toBe(false);
    expect(isTrinketAllowed('Tome of Fury')).toBe(false);
    setOptionalTrinkets({ circus: true });
    expect(isTrinketAllowed('Purgation Talisman')).toBe(true);
  });

  it('reads the group off the rarity, so a miscategorised list cannot leak one', () => {
    // `Durable Armlet` sits in its class's ordinary array with the Circus
    // rarity beside it, and a list-based filter let it straight through.
    expect(isTrinketAllowed('Durable Armlet')).toBe(false);
  });

  it('filters a list without reordering what survives', () => {
    const list = ['Ancestor\'s Map', "Monkey's Paw", 'Focus Ring'];
    expect(allowedTrinkets(list)).toEqual(['Ancestor\'s Map', 'Focus Ring']);
  });
});

describe('what the recommender is allowed to say', () => {
  /**
   * The point of the switch. A thin best-in-slot cell picks its trinkets by
   * value, and the Butcher's Circus pieces are generic and strong enough to win
   * everywhere - which is no use to somebody who does not play the PvP DLC.
   */
  it('keeps switched-off content out of a best-in-slot', () => {
    const optional = (name) => /kickstarter|butcher|ringmaster/i.test(TRINKET_EFFECTS[name]?.rarity || '');
    ['Hellion', 'Abomination', 'Flagellant', 'Jester'].forEach((heroClass) => {
      [1, 2, 3, 4].forEach((rank) => {
        const loadout = bisLoadout(heroClass, rank);
        if (!loadout) return;
        [loadout.trinket1, loadout.trinket2].filter(Boolean).forEach((name) => {
          expect(optional(name)).toBe(false);
        });
      });
    });
  });

  it('will not equip it either, even out of your own inventory', () => {
    // Owning one is not the same as playing with it: switched off means it does
    // not count in this campaign.
    const party = [hero('Hellion', 1), hero('Crusader', 2), hero('Vestal', 3), hero('Arbalest', 4)];
    const owned = ["Monkey's Paw", 'Ancestor\'s Map', 'Focus Ring'];
    const off = reequipParty(party, owned);
    expect(off.picks.map((p) => p.name)).not.toContain("Monkey's Paw");

    setOptionalTrinkets({ circus: true });
    resetBisCaches();
    const on = reequipParty(party, owned);
    expect(on.picks.map((p) => p.name)).toContain("Monkey's Paw");
  });
});
