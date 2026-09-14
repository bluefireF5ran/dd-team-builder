import { heroNeeds, DODGE_TANK_BAR } from '../heroNeeds';
import { trinketValue } from '../trinketValue';
import { reequipParty } from '../trinketReequip';
import { readExpeditions, ddHash } from '../campaignHistory';
import { bisLoadout } from '../../data/bisIndex';
import { TRINKETS } from '../../data/trinkets';

// A hero as the library builds it for that rank: the kit is what the needs are
// read from, so the tests use real kits rather than invented ones.
const hero = (heroClass, rank) => ({
  heroClass,
  activeSkills: bisLoadout(heroClass, rank).activeSkills,
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  diseases: []
});
const needsOf = (heroClass, rank) => heroNeeds(hero(heroClass, rank), { heroIndex: rank - 1 });
const valueOn = (trinket, heroClass, rank, context = {}) =>
  trinketValue(trinket, needsOf(heroClass, rank), context).value;

describe('heroNeeds reads what a hero wants from its kit', () => {
  it('tells a DoT hero from one whose DoT rides on a hit', () => {
    // Noxious Blast is 7 blight a round on a -80% hit; Hound's Rush is 2 bleed
    // a round on a full one.
    expect(needsOf('Plague Doctor', 3).roles.blightPrimary).toBe(true);
    expect(needsOf('Houndmaster', 2).roles.bleedPrimary).toBe(false);
  });

  it('keeps a dodge tank off the HP and PROT frontline, even when it marks itself', () => {
    const jester = needsOf('Jester', 3);
    expect(jester.roles.dodgeTank).toBe(true);
    expect(jester.roles.tank).toBe(false);
    expect(jester.goals[0]).toBe('dodge sustain');
  });

  it('knows a party healer and a heavy hitter', () => {
    expect(needsOf('Vestal', 4).roles.partyHealSustain).toBe(true);
    expect(needsOf('Leper', 1).roles.damageDealer).toBe(true);
    expect(needsOf('Antiquarian', 3).roles.damageDealer).toBe(false);
  });

  it('lets the estate answer part of the accuracy question', () => {
    // Training Ring's +4 ACC is why the Arbalest dossier says she "doesn't
    // desperately need ACC investments", and the Houndmaster would rather have
    // the DODGE he lives on than the ACC the district already gave him.
    const built = heroNeeds(hero('Houndmaster', 2), { heroIndex: 1, estate: true });
    const none = heroNeeds(hero('Houndmaster', 2), { heroIndex: 1, estate: false });
    expect(built.district).toEqual({ acc: 4, riposteDamage: 15 });
    expect(built.accNeed).toBeLessThan(none.accNeed);
    expect(trinketValue('Steady Bracer', built).value)
      .toBeLessThan(trinketValue('Steady Bracer', none).value);
    // A hero with no ACC district is where it was.
    expect(heroNeeds(hero('Leper', 1), { heroIndex: 0, estate: true }).accNeed)
      .toBe(heroNeeds(hero('Leper', 1), { heroIndex: 0, estate: false }).accNeed);
  });
});

describe('trinketValue follows Fran\'s rules', () => {
  it('trades DODGE for damage only on a hero who hits hard', () => {
    // Focus Ring: +10 ACC, +5% CRIT, -8 DODGE.
    expect(valueOn('Focus Ring', 'Antiquarian', 3)).toBeLessThan(0);
    expect(valueOn('Focus Ring', 'Hellion', 1)).toBeGreaterThan(0);
  });

  it('values blight chance on a blight hero, not on one who happens to blight', () => {
    const doctor = valueOn('Padlock of Transference', 'Plague Doctor', 3);
    const antiquarian = valueOn('Padlock of Transference', 'Antiquarian', 3);
    expect(doctor).toBeGreaterThan(antiquarian);
    expect(antiquarian).toBeLessThan(0.6);
  });

  it('values ACC more the less a hero has', () => {
    // Focus Talisman: +5 ACC, +5 ACC after the first round, -6 DODGE. Leper
    // lands about 87% on a champion, the Arbalest over 95%.
    expect(valueOn('Focus Talisman', 'Leper', 1)).toBeGreaterThan(valueOn('Focus Talisman', 'Arbalest', 4));
  });

  it('stops paying for scouting once the party has its map', () => {
    const first = valueOn("Ancestor's Map", 'Arbalest', 4);
    const second = valueOn("Ancestor's Map", 'Arbalest', 4, { partyScouting: 25 });
    expect(second).toBeLessThan(first * 0.3);
  });

  it('counts a "vs" bonus when the party sets it up, and less otherwise', () => {
    // Sickening Satchel: +20% DMG vs Blighted.
    const alone = valueOn('Sickening Satchel', 'Hellion', 1);
    const withBlight = valueOn('Sickening Satchel', 'Hellion', 1, { partyTags: new Set(['blight']) });
    expect(withBlight).toBeGreaterThan(alone);
    expect(alone).toBeLessThan(0.6);
  });

  it('counts torch-above conditions like the stat bars, and not in the dark', () => {
    const radiant = valueOn('Camouflage Cloak', 'Jester', 3);
    expect(valueOn('Camouflage Cloak', 'Jester', 3, { lowTorch: true })).toBeLessThan(radiant);
  });

  it('counts a position trinket where the hero stands', () => {
    // Prophet's Eye only works in position 4.
    const atFour = trinketValue("Prophet's Eye", heroNeeds(hero('Arbalest', 4), { heroIndex: 3 })).value;
    const atTwo = trinketValue("Prophet's Eye", heroNeeds(hero('Arbalest', 4), { heroIndex: 1 })).value;
    expect(atFour).toBeGreaterThan(atTwo);
  });

  it('rewards pushing a dodge tank over the bar', () => {
    const needs = needsOf('Jester', 3);
    const below = trinketValue('Bag of Marbles', needs, { currentDodge: DODGE_TANK_BAR - 5 });
    const far = trinketValue('Bag of Marbles', needs, { currentDodge: DODGE_TANK_BAR - 40 });
    expect(below.reasons.join(' ')).toMatch(/reaches DODGE 85/);
    expect(below.value).toBeGreaterThan(far.value);
  });
});

describe('riposte, guard and secondary DoT heroes', () => {
  it('keeps a bleed that rides on one skill of four from pulling a Highwayman off damage', () => {
    // Open Vein is real damage, but Fran would rather DMG, CRIT and SPD.
    expect(needsOf('Highwayman', 3).roles.bleedPrimary).toBe(false);
    expect(valueOn("Ancestor's Candle", 'Highwayman', 3)).toBeGreaterThan(valueOn('Bleed Amulet', 'Highwayman', 3));
  });

  it('tells a hero who guards from one who is guarded', () => {
    expect(needsOf('Man at Arms', 2).roles.guardAlly).toBe(true);
    // Protect Me is "Force Guard by Ally": the Antiquarian is the one guarded.
    expect(needsOf('Antiquarian', 3).roles.guardAlly).toBe(false);
  });

  it('counts a melee or ranged clause by the share of the hero\'s damage it covers', () => {
    // Steady Bracer: +10 ACC Ranged Skills, -2 DODGE. The Arbalest shoots, the Leper does not.
    expect(valueOn('Steady Bracer', 'Arbalest', 4)).toBeGreaterThan(valueOn('Steady Bracer', 'Leper', 1));
  });
});

describe('reequipParty fills a party in Fran\'s order', () => {
  // Every general trinket, one of each: a pool where every hero has something
  // useful. A hand-picked slice was mostly class trinkets for other classes, and
  // left a Houndmaster with nothing that helps him, so empty was right there.
  const OWNED = [...TRINKETS];
  const party = () => [hero('Crusader', 1), hero('Houndmaster', 2), hero('Highwayman', 3), hero('Jester', 4)];

  it('fills every slot from a useful pool, and nothing it fits hurts its hero', () => {
    const result = reequipParty(party(), OWNED);
    expect(result.unfilled).toBe(0);
    result.picks.forEach((pick) => expect(pick.value).toBeGreaterThan(-0.05));
  });

  it('gives the one Ancestor\'s Map to one hero and moves the rest on to their next trinket', () => {
    const result = reequipParty([hero('Crusader', 1), hero('Houndmaster', 2), hero('Jester', 3), hero('Arbalest', 4)], OWNED);
    const wearers = result.heroes.filter((h) => [h.trinket1, h.trinket2].includes("Ancestor's Map"));
    expect(wearers).toHaveLength(1);
    expect(result.unfilled).toBe(0);
  });

  it('leaves a slot empty rather than hand a hero something that hurts it', () => {
    const result = reequipParty([hero('Antiquarian', 3)], ['Focus Ring']);
    expect([result.heroes[0].trinket1, result.heroes[0].trinket2]).not.toContain('Focus Ring');
    expect(result.unfilled).toBe(2);
  });

  it('keeps the comp\'s own trinkets first', () => {
    const [crusader, ...rest] = party();
    const result = reequipParty([{ ...crusader, trinket1: 'Tough Ring' }, ...rest], OWNED);
    const pick = result.picks.find((p) => p.name === 'Tough Ring');
    expect(pick.index).toBe(0);
    expect(pick.tierLabel).toBe('comp trinket');
  });

  it('dresses the Vestal in her Crimson Court pair when both halves are owned', () => {
    const result = reequipParty([hero('Vestal', 4)], ['Salacious Diary', 'Atonement Beads', "Medic's Greaves"]);
    expect([result.heroes[0].trinket1, result.heroes[0].trinket2].sort()).toEqual(['Atonement Beads', 'Salacious Diary']);
  });
});

describe('what a point of effect chance is worth', () => {
  // Fran's rule: the effect rolls `chance - resist`, only after the attack has
  // already hit, and a DoT is all or nothing. So a point of chance does nothing
  // against an enemy already guaranteed, and the champion resists say how often
  // that is (`enemyResists.js`).
  const worthOf = (heroClass, rank, options) =>
    heroNeeds(hero(heroClass, rank), { heroIndex: rank - 1, ...options }).chanceWorth;

  it('costs the Athenaeum classes some of what more chance would buy', () => {
    const built = worthOf('Plague Doctor', 3);
    const none = worthOf('Plague Doctor', 3, { estate: false });
    // 140% is a maxed skill's own roll: nearly every point still counts there.
    expect(none.blight).toBeCloseTo(1, 1);
    // +15% from the district, and the next point is worth a third less.
    expect(built.blight).toBeLessThan(none.blight);
    expect(built.blight).toBeCloseTo(0.7, 1);
    // Debuff resists are lower, so the same 15% buys more of the way there.
    expect(built.debuff).toBeLessThan(built.blight);
  });

  it('reads a hero\'s own bleed as his problem, not his offence', () => {
    // Flagellant's Reclaim is `Self: Bleed (160% base)`, and it rolls against
    // HIS bleed resist, not an enemy's. Counting it as his bleed chance said an
    // enemy-facing clause had less left to buy than it does.
    const flagellant = heroNeeds(hero('Flagellant', 2), { heroIndex: 1 });
    expect(flagellant.chanceWorth.bleed).toBeCloseTo(flagellant.hitRate, 5);
    expect(flagellant.roles.selfBleed).toBe(true);
  });

  it('makes bleed resist a real pick on the hero who bleeds himself', () => {
    // Fran: the +Bleed Resist trinkets are worn on the Flagellant to cancel
    // what his own kit charges him. On anyone else a resist is filler.
    const flagellant = heroNeeds(hero('Flagellant', 2), { heroIndex: 1 });
    const hellion = heroNeeds(hero('Hellion', 1), { heroIndex: 0 });
    expect(hellion.roles.selfBleed).toBe(false);
    expect(trinketValue('Bleed Charm', flagellant).value)
      .toBeGreaterThan(trinketValue('Bleed Charm', hellion).value);
    expect(trinketValue('Bleed Charm', flagellant).value).toBeGreaterThan(0.3);
  });

  it('gates it behind hitting at all', () => {
    // The Training Ring's ACC makes the Man at Arms connect more often, and a
    // chance he never gets to roll is worth nothing.
    const built = heroNeeds(hero('Man at Arms', 2), { heroIndex: 1 });
    const none = heroNeeds(hero('Man at Arms', 2), { heroIndex: 1, estate: false });
    expect(built.hitRate).toBeGreaterThan(none.hitRate);
    expect(built.chanceWorth.stun).toBeGreaterThan(none.chanceWorth.stun);
  });

  it('makes a blight trinket worth less to a Plague Doctor who already has the district', () => {
    const built = heroNeeds(hero('Plague Doctor', 3), { heroIndex: 2 });
    const none = heroNeeds(hero('Plague Doctor', 3), { heroIndex: 2, estate: false });
    expect(trinketValue('Poisoned Herb', built).value)
      .toBeLessThan(trinketValue('Poisoned Herb', none).value);
  });
});

describe('the estate is part of the party', () => {
  const party = () => [hero('Highwayman', 1), hero('Grave Robber', 2), hero('Bounty Hunter', 3), hero('Vestal', 4)];

  it('counts House of the Yellow Hand towards the map the party needs', () => {
    // Three Yellow Hand heroes scout 5% each, so one Seer Stone finishes the
    // job and the second scouting trinket is not worth a slot. Without the
    // district the same party buys both.
    const pool = ['Seer Stone', 'Caution Cloak'];
    const built = reequipParty(party(), pool, { estate: true });
    const none = reequipParty(party(), pool, { estate: false });
    expect(built.picks.map((p) => p.name)).toEqual(['Seer Stone']);
    expect(none.picks.map((p) => p.name)).toEqual(['Seer Stone', 'Caution Cloak']);
  });
});

describe('readExpeditions', () => {
  const member = (guid, name, classId) => ({ name, class: ddHash(classId), died: false, guid });
  const record = (questId, dungeon) => ({
    rtti: 2006063882,
    heroes: {
      0: member(1, 'Reynauld', 'crusader'),
      1: member(2, 'Dismas', 'highwayman'),
      2: member(3, 'Junia', 'vestal'),
      3: member(4, 'Paracelsus', 'plague_doctor')
    },
    quest_id: questId,
    dungeon_type: ddHash(dungeon),
    difficulty: 1,
    length: 2
  });

  it('reads who went where, and folds the start and end record of one run into one', () => {
    const log = { chapters: { 2: { 0: record(77, 'crypts') }, 3: { 0: record(77, 'crypts'), 1: { rtti: 14865927 } } } };
    const expeditions = readExpeditions(log);
    expect(expeditions).toHaveLength(1);
    expect(expeditions[0].dungeon).toBe('The Ruins');
    expect(expeditions[0].heroes.map((h) => h.heroClass)).toEqual(['Crusader', 'Highwayman', 'Vestal', 'Plague Doctor']);
  });
});
