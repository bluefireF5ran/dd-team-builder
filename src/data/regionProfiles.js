/**
 * What you actually fight in each region, and the resolve level thresholds.
 *
 * GENERATED - do not hand-edit. `scripts/importRegionProfiles.js` rebuilds it
 * from a Darkest Dungeon install; nothing in `src/` needs the game.
 *
 * `resist` is the average of each enemy's resistance across the region's mash
 * tables, weighted by how often the table comes up, so a rare party cannot drag
 * the numbers. `typeMix` is the share of enemy bodies of each type, which is
 * what decides whether the Crusader's and Occultist's bonuses are live.
 * `corpseRate` is the share that leaves a body in the way.
 */

export const REGION_PROFILES = {
  "The Courtyard": {
    "tables": 263,
    "enemies": 47,
    "avgPartySize": 3.2,
    "avgRanksTaken": 3.5,
    "corpseRate": 72.8,
    "avgProt": 7,
    "avgDodge": 18.1,
    "markPunish": 22.9,
    "markThreat": 40.6,
    "resist": {
      "stun": 75,
      "blight": 79,
      "bleed": 50,
      "debuff": 57,
      "move": 64
    },
    "typeMix": {
      "vampire": 60.7,
      "beast": 29.7,
      "man": 4.8,
      "unholy": 4.2,
      "eldritch": 0.7
    },
    "zone": "courtyard"
  },
  "The Cove": {
    "tables": 211,
    "enemies": 63,
    "avgPartySize": 3.4,
    "avgRanksTaken": 3.7,
    "corpseRate": 77.8,
    "avgProt": 10.4,
    "avgDodge": 15.3,
    "markPunish": 11.1,
    "markThreat": 7.9,
    "resist": {
      "stun": 48,
      "blight": 40,
      "bleed": 59,
      "debuff": 37,
      "move": 39
    },
    "typeMix": {
      "eldritch": 60.9,
      "man": 26,
      "beast": 10.7,
      "unholy": 2.4
    },
    "zone": "cove"
  },
  "The Ruins": {
    "tables": 237,
    "enemies": 56,
    "avgPartySize": 3.4,
    "avgRanksTaken": 3.6,
    "corpseRate": 81.8,
    "avgProt": 9.8,
    "avgDodge": 14.7,
    "markPunish": 27.5,
    "markThreat": 7.9,
    "resist": {
      "stun": 48,
      "blight": 35,
      "bleed": 151,
      "debuff": 39,
      "move": 42
    },
    "typeMix": {
      "unholy": 61,
      "man": 20.8,
      "beast": 13.9,
      "stonework": 4.3
    },
    "zone": "crypts"
  },
  "The Warrens": {
    "tables": 249,
    "enemies": 56,
    "avgPartySize": 3.1,
    "avgRanksTaken": 3.4,
    "corpseRate": 90.3,
    "avgProt": 8.4,
    "avgDodge": 12.2,
    "markPunish": 29.8,
    "markThreat": 15.7,
    "resist": {
      "stun": 46,
      "blight": 62,
      "bleed": 44,
      "debuff": 38,
      "move": 46
    },
    "typeMix": {
      "man": 54.1,
      "beast": 41.7,
      "unholy": 4.2
    },
    "zone": "warrens"
  },
  "The Weald": {
    "tables": 210,
    "enemies": 58,
    "avgPartySize": 3.2,
    "avgRanksTaken": 3.6,
    "corpseRate": 66,
    "avgProt": 9.5,
    "avgDodge": 16.6,
    "markPunish": 24,
    "markThreat": 24,
    "resist": {
      "stun": 54,
      "blight": 62,
      "bleed": 50,
      "debuff": 45,
      "move": 41
    },
    "typeMix": {
      "man": 51.3,
      "beast": 33,
      "eldritch": 9.3,
      "unholy": 5.4,
      "stonework": 1
    },
    "zone": "weald"
  },
  "The Hamlet": {
    "tables": 218,
    "enemies": 55,
    "avgPartySize": 3.3,
    "avgRanksTaken": 3.5,
    "corpseRate": 81.9,
    "avgProt": 9.4,
    "avgDodge": 13.4,
    "markPunish": 27.9,
    "markThreat": 7.3,
    "resist": {
      "stun": 44,
      "blight": 33,
      "bleed": 149,
      "debuff": 37,
      "move": 40
    },
    "typeMix": {
      "unholy": 61,
      "man": 20.9,
      "beast": 13.8,
      "stonework": 4.3
    },
    "zone": "town"
  }
};

/**
 * XP needed for each resolve level, 0-indexed. Lives in the game install, which
 * is why the save importer could only ever show raw XP.
 *
 * The roster's own table, not the dungeon ladder in `progression.json` - see
 * the script for the difference, and for what reading the wrong one did. This
 * is Darkest's; Radiant levels faster, so read `RESOLVE_THRESHOLDS_BY_MODE`
 * when you know which campaign the save is.
 */
export const RESOLVE_THRESHOLDS = [0,2,8,14,24,36,48];

/** The same table per campaign mode, keyed as `saveParser` names them. */
export const RESOLVE_THRESHOLDS_BY_MODE = {"darkest":[0,2,8,14,24,36,48],"stygian":[0,2,8,14,24,36,48],"radiant":[0,2,7,13,21,29,40]};

/**
 * The highest Resolve the game lets on a quest, by dungeon level: Darkest caps
 * Apprentice (1) at 2 and Veteran (3) at 4, Radiant relaxes them to 4 and 6,
 * and 99 means no restriction at all. A MAXIMUM, not a band - the game stops a
 * levelled hero going down, never a recruit going up.
 */
export const QUEST_RESOLVE_CAPS = [2,2,3,4,5,99,99];

/** The same caps per campaign mode. */
export const QUEST_RESOLVE_CAPS_BY_MODE = {"darkest":[2,2,3,4,5,99,99],"stygian":[2,2,3,4,5,99,99],"radiant":[4,4,4,6,99,99,99]};

/**
 * What a hero pays for being under-levelled, indexed by how many levels short
 * of the dungeon they are: `starting` stress on entering, and `stressTaken`
 * as a share added to every stress hit after that.
 */
export const UNDER_LEVEL_COST = {"starting":[0,20,30,40,50,60,70],"stressTaken":[0,0.25,0.5,0.75,1,1.25,1.5]};

/**
 * The resolve level a hero with this much XP has reached.
 *
 * `difficulty` is the campaign the save was started in (`saveParser` reads
 * it): the same XP is a different level in Radiant, which needs 7 for Resolve 2
 * where Darkest needs 8. Unknown modes fall back to Darkest rather than
 * guessing a table.
 */
export const resolveLevel = (xp, difficulty) => {
  if (typeof xp !== 'number' || Number.isNaN(xp)) return null;
  const thresholds = RESOLVE_THRESHOLDS_BY_MODE[difficulty] || RESOLVE_THRESHOLDS;
  let level = 0;
  thresholds.forEach((threshold, index) => {
    if (xp >= threshold) level = index;
  });
  return level;
};

export const getRegionProfile = (location) => REGION_PROFILES[location] || null;
