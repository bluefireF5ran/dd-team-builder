import { statBreakdown, statScale, partyLight, barGeometry, segmentGradient, GROUP_COLOURS } from '../statBreakdown';
import { cartographerBonus, districtsFor, classId } from '../../data/estate';
import { TRINKET_EFFECTS } from '../../data/trinketEffects';

const partOf = (row, group) => row.parts.find((p) => p.group === group)?.amount ?? 0;

// El ejemplo de Fran, numero a numero.
const fransJester = {
  heroClass: 'Jester',
  trinket1: "Ancestor's Coat",
  trinket2: 'Camouflage Cloak',
  quirks: { positive: ['Corvids Grace', 'Luminous', 'Evasive'], negative: [] },
  diseases: [],
  activeSkills: ['Solo'],
};

describe("Fran's Jester", () => {
  const bd = statBreakdown(fransJester, { party: [fransJester], heroIndex: 0 });
  const dodge = bd.stats.dodge;

  it('stacks DODGE from the most fixed layer to the most temporary', () => {
    expect(dodge.base).toBe(35);
    expect(partOf(dodge, 'estate')).toBe(3); // Académie Duello
    expect(partOf(dodge, 'light')).toBe(7.5); // radiant light, Cartographer's Camp, Darkest
    expect(partOf(dodge, 'trinket')).toBe(30); // Ancestor's Coat 15 + Camouflage Cloak 15 above 75
    expect(partOf(dodge, 'quirk')).toBe(16); // Corvids Grace 6 + Luminous 5 + Evasive 5
    expect(dodge.total).toBe(91.5);
    expect(dodge.parts.map((p) => p.group)).toEqual(['estate', 'light', 'trinket', 'quirk']);
  });

  it('draws Solo as potential, not as part of the total', () => {
    expect(dodge.potential).toBe(30);
    expect(dodge.potentialSources).toEqual([
      expect.objectContaining({ heroClass: 'Jester', skill: 'Solo', self: true }),
    ]);
  });

  it('runs radiant, because nothing in the party wants the torch low', () => {
    expect(bd.light).toMatchObject({ torch: 100, label: 'Radiant', source: null });
  });

  it('fits inside the bar, stripes included: the scale leaves room for buffs', () => {
    expect(statScale().dodge).toBeGreaterThanOrEqual(dodge.total + dodge.potential);
  });
});

describe('a party that runs dark', () => {
  const [darkTrinket] = Object.entries(TRINKET_EFFECTS).find(([, e]) => /if Torch below 26/.test(e.effect));
  const carrier = { heroClass: 'Crusader', trinket1: darkTrinket };

  it('takes the torch below the most demanding "below"', () => {
    expect(partyLight([fransJester, carrier])).toMatchObject({ torch: 25, label: 'Dark', below: 26, source: darkTrinket });
  });

  it('loses the radiant DODGE and the cloak, and gets the darkness CRIT instead', () => {
    const party = [fransJester, carrier];
    const bd = statBreakdown(fransJester, { party, heroIndex: 0 });
    expect(partOf(bd.stats.dodge, 'light')).toBe(0);
    expect(partOf(bd.stats.dodge, 'trinket')).toBe(15);
    expect(bd.stats.dodge.total).toBe(35 + 3 + 15 + 16);
    expect(partOf(bd.stats.crit, 'light')).toBe(3);
  });
});

describe('trinket conditions', () => {
  it('counts an "in inventory" condition as met: carrying Shard Dust is your choice', () => {
    // Smoking Skull: "+35 DODGE if Shard Dust in inventory | -15 ACC".
    const bd = statBreakdown({ heroClass: 'Jester', trinket1: 'Smoking Skull' });
    expect(partOf(bd.stats.dodge, 'trinket')).toBe(35);
  });

  it('counts "if in position N" only at that rank', () => {
    const found = Object.entries(TRINKET_EFFECTS)
      .flatMap(([name, e]) => e.effect.split(' | ').map((clause) => [name, clause]))
      .map(([name, clause]) => [name, /^\+(\d+) (DODGE|SPD) if in position (\d)$/.exec(clause)])
      .find(([, m]) => m);
    const [name, [, amount, statWord, position]] = found;
    const stat = statWord.toLowerCase();
    const hero = { heroClass: 'Jester', trinket1: name };

    const at = Number(position);
    const partyAt = [0, 1, 2, 3].map((i) => (i === at - 1 ? hero : { heroClass: 'Leper' }));
    const atRank = statBreakdown(hero, { party: partyAt, heroIndex: at - 1 });
    expect(partOf(atRank.stats[stat], 'trinket')).toBeGreaterThanOrEqual(Number(amount));

    const elsewhere = at === 1 ? 2 : 1;
    const partyElsewhere = [0, 1, 2, 3].map((i) => (i === elsewhere - 1 ? hero : { heroClass: 'Leper' }));
    const offRank = statBreakdown(hero, { party: partyElsewhere, heroIndex: elsewhere - 1 });
    expect(partOf(offRank.stats[stat], 'trinket')).toBeLessThan(partOf(atRank.stats[stat], 'trinket'));
  });
});

describe('the estate', () => {
  it('reads districts by the game tag, whatever the app calls the class', () => {
    expect(classId('Man-at-Arms')).toBe('man_at_arms');
    expect(districtsFor('Man-at-Arms').map((d) => d.name)).toContain('Training Ring');
    expect(districtsFor('Jester').map((d) => d.name)).toEqual(['Académie Duello', 'Performance Hall']);
  });

  it('multiplies HP for a Training Ring class and adds CRIT for a Yellow Hand one', () => {
    expect(partOf(statBreakdown({ heroClass: 'Arbalest' }).stats.hp, 'estate')).toBeGreaterThan(0);
    expect(partOf(statBreakdown({ heroClass: 'Highwayman' }).stats.crit, 'estate')).toBe(4);
    expect(partOf(statBreakdown({ heroClass: 'Leper' }).stats.hp, 'estate')).toBe(0);
  });

  it('adds the Altar of the Light stun resist to a Crusader', () => {
    const bd = statBreakdown({ heroClass: 'Crusader' });
    expect(bd.resistances.stun).toBe(40 + 10);
  });

  it('uses the Darkest light table by default, and the difficulty changes it', () => {
    expect(cartographerBonus(100)).toMatchObject({ dodge: 7.5, crit: 1 });
    expect(cartographerBonus(100, 'radiant')).toMatchObject({ dodge: 10 });
    expect(cartographerBonus(25)).toMatchObject({ dodge: 0, crit: 3 });
  });
});

describe('skill potential from the party', () => {
  const vapours = (heroClass = 'Antiquarian') => ({ heroClass, activeSkills: ['Invigorating Vapours'] });

  it('counts an ally buff from someone else, and the same skill twice only once', () => {
    const party = [{ heroClass: 'Leper', activeSkills: [] }, vapours(), vapours()];
    expect(statBreakdown(party[0], { party, heroIndex: 0 }).stats.dodge.potential).toBe(10);
  });

  it('does not hand a self buff to anyone else', () => {
    const party = [fransJester, { heroClass: 'Leper', activeSkills: [] }];
    expect(statBreakdown(party[1], { party, heroIndex: 1 }).stats.dodge.potential).toBe(0);
  });

  it('draws no potential without a party', () => {
    expect(statBreakdown(fransJester).stats.dodge.potential).toBe(0);
  });
});

describe('drawing it', () => {
  it('stacks segments in order and stripes the potential after them', () => {
    const row = { base: 30, parts: [{ group: 'trinket', amount: 20 }], potential: 10 };
    const g = barGeometry(row, 100);
    expect(g.segments).toEqual([
      { group: 'base', from: 0, to: 30 },
      { group: 'trinket', from: 30, to: 50 },
    ]);
    expect(g.totalEnd).toBe(50);
    expect(g.potentialEnd).toBe(60);
  });

  it('marks what a negative layer takes away', () => {
    const g = barGeometry({ base: 40, parts: [{ group: 'quirk', amount: -10 }], potential: 0 }, 100);
    expect(g.positiveEnd).toBe(40);
    expect(g.totalEnd).toBe(30);
  });

  it('blends between source colours instead of cutting', () => {
    const g = barGeometry({ base: 30, parts: [{ group: 'trinket', amount: 20 }], potential: 0 }, 100);
    const css = segmentGradient(g.segments, '#00ff00', g.positiveEnd);
    expect(css).toMatch(/^linear-gradient\(90deg, #00ff00 0%/);
    expect(css).toContain(GROUP_COLOURS.trinket);
  });

  it('knows nothing about a class with no stats', () => {
    expect(statBreakdown({ heroClass: 'Nobody' })).toBeNull();
  });
});
