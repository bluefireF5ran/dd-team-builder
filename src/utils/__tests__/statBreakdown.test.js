import { statBreakdown, statScale, partyLight, barGeometry, segmentGradient, GROUP_COLOURS } from '../statBreakdown';
import { cartographerBonus, districtsFor, districtEffects, classId, lightBonus } from '../../data/estate';
import { TRINKET_EFFECTS } from '../../data/trinketEffects';
import * as moddedHeroes from '../../data/modded_heroes';
import * as moddedEffectsGenerated from '../../data/moddedEffectsGenerated';
import { installModdedRoster } from '../../data/moddedRoster';
import { heroNeeds } from '../heroNeeds';

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

  it('reads what a district gives outside the bars, and only where it is built', () => {
    // Read off the game's own buff rows, not the dossiers' prose.
    expect(districtEffects('Arbalest').acc).toBe(4);
    expect(districtEffects('Plague Doctor')).toMatchObject({ blightChance: 15, debuffChance: 15 });
    expect(districtEffects('Highwayman').scouting).toBe(5);
    // Académie Duello's riposte damage is `hero_type_tags: []`: everyone's.
    expect(districtEffects('Leper')).toEqual({ riposteDamage: 15 });
    expect(districtEffects('Arbalest', false)).toEqual({});
    expect(districtEffects('Arbalest', ['training_ring'])).toEqual({ acc: 4 });
  });

  it('gives a modded class the district its own mod files tag it with', () => {
    // The table names no modded class, but the mod does, with the same
    // `tag: .id` line the Arbalest carries. The roster carries it for the mods
    // installed here: Hedge Knight trains at the Training Ring like she does.
    expect(moddedHeroes.MODDED_HERO_CLASSES['Hedge Knight'].district).toBe('training_ring');
    expect(partOf(statBreakdown({ heroClass: 'Hedge Knight' }).stats.hp, 'estate')).toBeGreaterThan(0);

    // And the plumbing, on a class that tags no district, so the test does not
    // turn on which mods are on this machine.
    const CLASS = 'Sibyl';
    const real = moddedHeroes.MODDED_HERO_CLASSES[CLASS];
    expect(real.district).toBeUndefined();
    const before = statBreakdown({ heroClass: CLASS }).stats.hp.total;
    installModdedRoster(
      {
        ...moddedHeroes,
        MODDED_HERO_CLASSES: {
          ...moddedHeroes.MODDED_HERO_CLASSES,
          [CLASS]: { ...real, district: 'training_ring' }
        }
      },
      moddedEffectsGenerated
    );
    try {
      const line = statBreakdown({ heroClass: CLASS });
      expect(partOf(line.stats.hp, 'estate')).toBeGreaterThan(0);
      expect(line.stats.hp.total).toBeGreaterThan(before);
      expect(heroNeeds({ heroClass: CLASS }).district).toEqual({ acc: 4, riposteDamage: 15 });
    } finally {
      installModdedRoster(moddedHeroes, moddedEffectsGenerated);
    }
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

describe('difficulty and estate settings', () => {
  it('without the estate: no districts, and the base game torchlight instead of the Cartographer\'s', () => {
    const bd = statBreakdown(fransJester, { party: [fransJester], heroIndex: 0, estate: false });
    expect(partOf(bd.stats.dodge, 'estate')).toBe(0);
    // shared/rules.json, darkness, above 75, Darkest: +4 DODGE (the Camp makes it 7.5).
    expect(partOf(bd.stats.dodge, 'light')).toBe(4);
    expect(bd.stats.dodge.total).toBe(35 + 4 + 30 + 16);
    expect(partOf(bd.stats.spd, 'estate')).toBe(0);
    expect(bd.estate).toBe(false);
  });

  it('reads the chosen difficulty\'s tables', () => {
    expect(partOf(statBreakdown(fransJester, { difficulty: 'radiant' }).stats.dodge, 'light')).toBe(10);
    expect(partOf(statBreakdown(fransJester, { difficulty: 'radiant', estate: false }).stats.dodge, 'light')).toBe(7.5);
    expect(lightBonus(100, 'darkest', false)).toMatchObject({ dodge: 4, crit: 0 });
    expect(lightBonus(25, 'stygian', false)).toMatchObject({ dodge: 0, crit: 2.5 });
  });

  it('counts only the districts a save has actually built', () => {
    // Fran's profile_8: only the Granary, which moves no barred stat.
    const granaryOnly = statBreakdown(fransJester, { estate: ['granary'] });
    expect(partOf(granaryOnly.stats.dodge, 'estate')).toBe(0);
    expect(partOf(granaryOnly.stats.dodge, 'light')).toBe(4);

    const some = statBreakdown(fransJester, { estate: ['illuminators_guild', 'conservatory_of_steel'] });
    expect(partOf(some.stats.dodge, 'estate')).toBe(3);
    expect(partOf(some.stats.dodge, 'light')).toBe(7.5);
    // Performance Hall is not in that list.
    expect(partOf(some.stats.spd, 'estate')).toBe(0);
  });

  it('sizes the bar for the settings it is drawn with', () => {
    expect(statScale('darkest', false).dodge).toBeLessThan(statScale('darkest', true).dodge);
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
