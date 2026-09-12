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
 */
export const RESOLVE_THRESHOLDS = [0,2,6,10,16,22,32,42];

/** The resolve level a hero with this much XP has reached. */
export const resolveLevel = (xp) => {
  if (typeof xp !== 'number' || Number.isNaN(xp)) return null;
  let level = 0;
  RESOLVE_THRESHOLDS.forEach((threshold, index) => {
    if (xp >= threshold) level = index;
  });
  return level;
};

export const getRegionProfile = (location) => REGION_PROFILES[location] || null;
