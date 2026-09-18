import {
  ANY_MISSION,
  MISSION_TIERS,
  getMissionTier,
  heroCanEmbark,
  heroFitsMission,
  heroResolveLevel,
  heroesAllowedOn,
  heroesForMission,
  isMissionTier,
  missionCap,
  missionResolveLabel,
  missionRosterHeroes,
  missionTierCounts,
  tierOfHero,
  tierOfLevel,
  underLevelCost
} from '../missionLevel';
import { RESOLVE_THRESHOLDS, resolveLevel } from '../../data/regionProfiles';

/** A hero at exactly this resolve level, via the game's own threshold table. */
const atLevel = (level, extra = {}) => ({
  name: `Lv${level}`,
  heroClass: 'Crusader',
  resolveXp: RESOLVE_THRESHOLDS[level],
  ...extra
});

describe('the bands are the game’s', () => {
  it('splits Apprentice 0-2, Veteran 3-4, Champion 5-6', () => {
    expect(MISSION_TIERS.map((tier) => [tier.id, tier.minLevel, tier.maxLevel])).toEqual([
      ['apprentice', 0, 2],
      ['veteran', 3, 4],
      ['champion', 5, 6]
    ]);
  });

  it('carries the dungeon level the game writes on the quest', () => {
    expect(MISSION_TIERS.map((tier) => tier.dungeonLevel)).toEqual([1, 3, 5]);
  });

  it('puts every level in exactly one band', () => {
    expect([0, 1, 2].map((l) => tierOfLevel(l).id)).toEqual(['apprentice', 'apprentice', 'apprentice']);
    expect([3, 4].map((l) => tierOfLevel(l).id)).toEqual(['veteran', 'veteran']);
    expect([5, 6].map((l) => tierOfLevel(l).id)).toEqual(['champion', 'champion']);
  });

  it('gives a level past the cap to the top band rather than to nothing', () => {
    // The thresholds are read out of the game install; a mod that adds a level
    // must not leave that hero belonging to no mission at all.
    expect(tierOfLevel(RESOLVE_THRESHOLDS.length).id).toBe('champion');
    expect(tierOfLevel(99).id).toBe('champion');
  });

  it('reads a hero’s level from their raw XP, the way the roster screen does', () => {
    expect(heroResolveLevel({ resolveXp: 0 })).toBe(0);
    expect(heroResolveLevel({ resolveXp: RESOLVE_THRESHOLDS[3] })).toBe(3);
    expect(heroResolveLevel({ resolveXp: 1000 })).toBe(resolveLevel(1000));
  });

  it('reads it on the campaign’s own table', () => {
    // 7 XP is Resolve 1 in Darkest and Resolve 2 in Radiant, so the same save
    // hero belongs to a different place on the ladder.
    expect(heroResolveLevel({ resolveXp: 7 }, 'darkest')).toBe(1);
    expect(heroResolveLevel({ resolveXp: 7 }, 'radiant')).toBe(2);
  });

  it('treats a hero with no XP field as a recruit, not as nobody', () => {
    // A profile stored by an older version can be missing it. Level 0 is what
    // the parser itself defaults to; falling through every band would make the
    // hero vanish the moment a mission is picked, with nothing saying why.
    expect(heroResolveLevel({})).toBe(0);
    expect(tierOfHero({}).id).toBe('apprentice');
  });
});

describe('the cap is a maximum, not a band', () => {
  it('is the game’s own restriction table', () => {
    expect(missionCap(getMissionTier('apprentice'))).toBe(2);
    expect(missionCap(getMissionTier('veteran'))).toBe(4);
    // Champion's 99 means no restriction at all, so nothing is compared to 99.
    expect(missionCap(getMissionTier('champion'))).toBe(Infinity);
  });

  it('is relaxed by two levels in Radiant, as the game relaxes it', () => {
    expect(missionCap(getMissionTier('apprentice'), 'radiant')).toBe(4);
    expect(missionCap(getMissionTier('veteran'), 'radiant')).toBe(6);
  });

  it('falls back to Darkest for a campaign it has no table for', () => {
    // Crimson Court's bloodmoon has no mode folder of its own.
    expect(missionCap(getMissionTier('veteran'), 'bloodmoon')).toBe(4);
  });

  it('lets a recruit into a Champion run, which the game also does', () => {
    // The game stops a levelled hero going DOWN, never a recruit going up.
    expect(heroCanEmbark(atLevel(0), 'champion')).toBe(true);
    expect(heroFitsMission(atLevel(0), 'champion')).toBe(false);
  });

  it('turns a Resolve 5 hero away from a Veteran quest', () => {
    expect(heroCanEmbark(atLevel(5), 'veteran')).toBe(false);
    expect(heroCanEmbark(atLevel(5), 'veteran', 'radiant')).toBe(true);
  });
});

describe('what going in under level costs', () => {
  it('is the game’s table, measured against the dungeon level', () => {
    // A Resolve 1 hero on a Veteran quest (dungeon level 3) is two short.
    expect(underLevelCost(atLevel(1), 'veteran')).toEqual({
      levels: 2,
      stress: 30,
      stressTaken: 0.5
    });
    expect(underLevelCost(atLevel(2), 'veteran')).toEqual({
      levels: 1,
      stress: 20,
      stressTaken: 0.25
    });
  });

  it('charges a Resolve 0 recruit even on their own band’s quest', () => {
    // Apprentice is dungeon level 1, so a Resolve 0 hero is one short there —
    // which is exactly what the game does on a hero's first expedition.
    expect(underLevelCost(atLevel(0), 'apprentice').stress).toBe(20);
  });

  it('is nothing for a hero up to level, and nothing without a mission', () => {
    expect(underLevelCost(atLevel(4), 'veteran')).toBeNull();
    expect(underLevelCost(atLevel(0), ANY_MISSION)).toBeNull();
  });
});

describe('who the mission draws on', () => {
  const roster = [atLevel(0), atLevel(2), atLevel(3), atLevel(4), atLevel(5), atLevel(6)];

  it('keeps only the heroes of that band', () => {
    expect(heroesForMission(roster, 'veteran').map((h) => heroResolveLevel(h))).toEqual([3, 4]);
    expect(heroesForMission(roster, 'champion').map((h) => heroResolveLevel(h))).toEqual([5, 6]);
  });

  it('separates who it is FOR from who may come', () => {
    expect(heroesAllowedOn(roster, 'veteran').map((h) => heroResolveLevel(h))).toEqual([0, 2, 3, 4]);
    expect(heroesAllowedOn(roster, 'champion')).toHaveLength(roster.length);
  });

  it('shuts nobody out without a mission', () => {
    expect(heroesForMission(roster, ANY_MISSION)).toHaveLength(roster.length);
    expect(heroesForMission(roster, null)).toHaveLength(roster.length);
    expect(heroFitsMission(atLevel(6), ANY_MISSION)).toBe(true);
  });

  it('is the band alone while the band can make a party', () => {
    const fourVeterans = [atLevel(3), atLevel(3), atLevel(4), atLevel(4), atLevel(0), atLevel(1)];
    expect(missionRosterHeroes(fourVeterans, 'veteran').map((h) => heroResolveLevel(h))).toEqual([
      3, 3, 4, 4
    ]);
  });

  it('widens when it cannot, cheapest hero first', () => {
    // Two Veterans is not a party. The heroes who may still embark come along,
    // and the one who is only a level short comes before the one who is three.
    const thin = [atLevel(3), atLevel(4), atLevel(0), atLevel(2), atLevel(1)];
    expect(missionRosterHeroes(thin, 'veteran').map((h) => heroResolveLevel(h))).toEqual([
      3, 4, 2, 1, 0
    ]);
  });

  it('will not widen past the cap', () => {
    // Apprentice cannot widen at all: everyone outside its band is above it.
    const mixed = [atLevel(1), atLevel(4), atLevel(5)];
    expect(missionRosterHeroes(mixed, 'apprentice').map((h) => heroResolveLevel(h))).toEqual([1]);
    // Radiant lets Resolve 3-4 onto an Apprentice run, so there it widens.
    expect(
      missionRosterHeroes(mixed, 'apprentice', { difficulty: 'radiant' }).map((h) =>
        heroResolveLevel(h, 'radiant')
      )
    ).toEqual([1, 4]);
  });

  it('counts the roster by band, which is what the player picks on', () => {
    expect(missionTierCounts(roster)).toEqual({ apprentice: 2, veteran: 2, champion: 2 });
    expect(missionTierCounts([])).toEqual({ apprentice: 0, veteran: 0, champion: 0 });
  });
});

describe('the ids that get stored', () => {
  it('accepts its own ids and "any", and nothing else', () => {
    expect(isMissionTier('veteran')).toBe(true);
    expect(isMissionTier(ANY_MISSION)).toBe(true);
    expect(isMissionTier('darkest')).toBe(false);
    expect(isMissionTier(undefined)).toBe(false);
  });

  it('has no tier record for "any", because it is the absence of one', () => {
    expect(getMissionTier(ANY_MISSION)).toBeNull();
    expect(getMissionTier('veteran').label).toBe('Veteran');
  });

  it('spells the band out rather than making the player remember it', () => {
    expect(missionResolveLabel(getMissionTier('veteran'))).toBe('Resolve 3-4');
    expect(missionResolveLabel(null)).toBe('');
  });
});
