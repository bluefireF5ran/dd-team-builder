/**
 * Every enemy the region tables can draw, with the stats the summary is built
 * from.
 *
 * GENERATED - do not hand-edit. `scripts/importRegionProfiles.js` writes it
 * beside `regionProfiles.js`.
 *
 * **Nothing in the app imports this, and that is deliberate.** It is provenance:
 * with these rows the region summary can be re-derived or re-weighted without
 * having the game installed, which is the same reason `importModdedHeroes`
 * keeps its manifest. Kept in its own file so it cannot be dragged into the
 * bundle behind `REGION_PROFILES`, which is imported.
 *
 * Resistances are the game's own percentages and they DO go above 100: a
 * skeleton ships `bleed_resist 200%`, which is why the Ruins average is over
 * 150 and why bleed comps are the wrong answer there.
 */

export const REGION_ENEMIES = {
 "brigand_sapper_D": {
  "size": 1,
  "type": "man",
  "hp": 160,
  "prot": 0,
  "dodge": 20,
  "spd": 4,
  "stun": 100,
  "blight": 75,
  "bleed": 75,
  "debuff": 60,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "sapper_throw",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "sapper_detonate",
    "dmgMin": 23,
    "dmgMax": 45,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "sapper_summon",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "sapper_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "sapper_stress",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "baron_B": {
  "size": 1,
  "type": "vampire",
  "hp": 233,
  "prot": 0.1,
  "dodge": 21.75,
  "spd": 10,
  "stun": 87,
  "blight": 85,
  "bleed": 55,
  "debuff": 60,
  "move": 85,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "necessary_discipline",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "forced_enthusiasm",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "baron_hunger",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "intro_change_to_curtain",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "change_to_curtain_1-3",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "change_to_curtain_2-3",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "crowd_pleaser",
    "dmgMin": 5,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "body_average_A": {
  "size": 1,
  "type": "body",
  "hp": 50,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 25,
  "bleed": 35,
  "debuff": 55,
  "move": 35,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_average_B": {
  "size": 1,
  "type": "body",
  "hp": 75,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 65,
  "blight": 45,
  "bleed": 55,
  "debuff": 75,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_average_C": {
  "size": 1,
  "type": "body",
  "hp": 55,
  "prot": 0,
  "dodge": 0,
  "spd": 2,
  "stun": 85,
  "blight": 65,
  "bleed": 75,
  "debuff": 240,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_bloated_A": {
  "size": 1,
  "type": "body",
  "hp": 60,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 45,
  "blight": 45,
  "bleed": 15,
  "debuff": 75,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_bloated_B": {
  "size": 1,
  "type": "body",
  "hp": 90,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 65,
  "blight": 65,
  "bleed": 35,
  "debuff": 95,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_bloated_C": {
  "size": 1,
  "type": "body",
  "hp": 72,
  "prot": 0,
  "dodge": 0,
  "spd": 2,
  "stun": 85,
  "blight": 85,
  "bleed": 55,
  "debuff": 240,
  "move": 115,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_emaciated_A": {
  "size": 1,
  "type": "body",
  "hp": 40,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 45,
  "blight": 5,
  "bleed": 65,
  "debuff": 35,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_emaciated_B": {
  "size": 1,
  "type": "body",
  "hp": 60,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 65,
  "blight": 25,
  "bleed": 85,
  "debuff": 55,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "body_emaciated_C": {
  "size": 1,
  "type": "body",
  "hp": 31,
  "prot": 0,
  "dodge": 0,
  "spd": 2,
  "stun": 85,
  "blight": 45,
  "bleed": 105,
  "debuff": 240,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "bulrush_A": {
  "size": 1,
  "type": "vegetation",
  "hp": 100,
  "prot": 2,
  "dodge": 200,
  "spd": 0,
  "stun": 215,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "bulrush_B": {
  "size": 1,
  "type": "vegetation",
  "hp": 150,
  "prot": 2,
  "dodge": 208.75,
  "spd": 0,
  "stun": 235,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "bulrush_C": {
  "size": 1,
  "type": "vegetation",
  "hp": 205,
  "prot": 2,
  "dodge": 222.5,
  "spd": 0,
  "stun": 255,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "castellan_A": {
  "size": 1,
  "type": "vampire",
  "hp": 12,
  "prot": 0,
  "dodge": 21,
  "spd": 5,
  "stun": 50,
  "blight": 60,
  "bleed": 25,
  "debuff": 50,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "elusive_exit",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "castellan_B": {
  "size": 1,
  "type": "vampire",
  "hp": 17,
  "prot": 0,
  "dodge": 29.75,
  "spd": 6,
  "stun": 70,
  "blight": 80,
  "bleed": 45,
  "debuff": 70,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "elusive_exit",
    "dmgMin": 3,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "castellan_C": {
  "size": 1,
  "type": "vampire",
  "hp": 23,
  "prot": 0,
  "dodge": 42.25,
  "spd": 7,
  "stun": 90,
  "blight": 100,
  "bleed": 65,
  "debuff": 90,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "elusive_exit",
    "dmgMin": 4,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "cattail_A": {
  "size": 1,
  "type": "vegetation",
  "hp": 100,
  "prot": 2,
  "dodge": 200,
  "spd": 0,
  "stun": 215,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cattail_B": {
  "size": 1,
  "type": "vegetation",
  "hp": 150,
  "prot": 2,
  "dodge": 208.75,
  "spd": 0,
  "stun": 235,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cattail_C": {
  "size": 1,
  "type": "vegetation",
  "hp": 205,
  "prot": 2,
  "dodge": 222.5,
  "spd": 0,
  "stun": 255,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "chevalier_A": {
  "size": 1,
  "type": "vampire",
  "hp": 21,
  "prot": 0.3,
  "dodge": 0,
  "spd": 0,
  "stun": 20,
  "blight": 50,
  "bleed": 20,
  "debuff": 30,
  "move": 250,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "buried_blast",
    "dmgMin": 4,
    "dmgMax": 6,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "buried_skewer",
    "dmgMin": 6,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "chevalier_B": {
  "size": 1,
  "type": "vampire",
  "hp": 29,
  "prot": 0.3,
  "dodge": 8.75,
  "spd": 1,
  "stun": 40,
  "blight": 70,
  "bleed": 40,
  "debuff": 50,
  "move": 270,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "buried_blast",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "buried_skewer",
    "dmgMin": 8,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "chevalier_C": {
  "size": 1,
  "type": "vampire",
  "hp": 41,
  "prot": 0.3,
  "dodge": 21.25,
  "spd": 2,
  "stun": 60,
  "blight": 90,
  "bleed": 60,
  "debuff": 70,
  "move": 290,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "buried_blast",
    "dmgMin": 7,
    "dmgMax": 12,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "buried_skewer",
    "dmgMin": 10,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "countess_D": {
  "size": 4,
  "type": "vampire",
  "hp": 400,
  "prot": 0.3,
  "dodge": 25,
  "spd": 4,
  "stun": 140,
  "blight": 110,
  "bleed": 90,
  "debuff": 120,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "transform_to_weak",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "claw_swipe_normal",
    "dmgMin": 8,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "pheromonal_delirium",
    "dmgMin": 4,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "life_feeds_on_life",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "countess_E": {
  "size": 4,
  "type": "vampire",
  "hp": 400,
  "prot": 0.1,
  "dodge": 0,
  "spd": 1,
  "stun": 145,
  "blight": 110,
  "bleed": 90,
  "debuff": 120,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fan_flutter",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "transform_to_berserk",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "countess_F": {
  "size": 4,
  "type": "vampire",
  "hp": 400,
  "prot": 0.4,
  "dodge": 30,
  "spd": 8,
  "stun": 165,
  "blight": 120,
  "bleed": 80,
  "debuff": 140,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 4,
  "skills": [
   {
    "id": "clear_the_court",
    "dmgMin": 3,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "transform_to_normal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "claw_swipe_berserk",
    "dmgMin": 10,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "feed_berserk",
    "dmgMin": 7,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "be_silent",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "courtesan_A": {
  "size": 1,
  "type": "vampire",
  "hp": 13,
  "prot": 0,
  "dodge": 6,
  "spd": 5,
  "stun": 45,
  "blight": 40,
  "bleed": 20,
  "debuff": 35,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "careless_whispers",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "midnight_minuet",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "damsel_in_distress",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "renewed_appetite",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "expose_the_vein",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 2,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "rebuff_slap",
    "dmgMin": 3,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "courtesan_B": {
  "size": 1,
  "type": "vampire",
  "hp": 18,
  "prot": 0,
  "dodge": 14.75,
  "spd": 6,
  "stun": 65,
  "blight": 60,
  "bleed": 40,
  "debuff": 55,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "careless_whispers",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "midnight_minuet",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "damsel_in_distress",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "renewed_appetite",
    "dmgMin": 3,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "expose_the_vein",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 4,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "rebuff_slap",
    "dmgMin": 3,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "courtesan_C": {
  "size": 1,
  "type": "vampire",
  "hp": 25,
  "prot": 0,
  "dodge": 27.25,
  "spd": 7,
  "stun": 85,
  "blight": 80,
  "bleed": 60,
  "debuff": 75,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "careless_whispers",
    "dmgMin": 3,
    "dmgMax": 4,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "midnight_minuet",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "damsel_in_distress",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "renewed_appetite",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "expose_the_vein",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 5,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "rebuff_slap",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "crocodile_A": {
  "size": 1,
  "type": "vampire",
  "hp": 109,
  "prot": 0.1,
  "dodge": 10,
  "spd": 7,
  "stun": 50,
  "blight": 80,
  "bleed": 50,
  "debuff": 75,
  "move": 35,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "angry_hive",
    "dmgMin": 1,
    "dmgMax": 6,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "teeth_rake",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "submerge",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "submerge_nuke",
    "dmgMin": 11,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "move_from_right",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "move_from_left",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "crocodile_B": {
  "size": 1,
  "type": "vampire",
  "hp": 164,
  "prot": 0.1,
  "dodge": 18.75,
  "spd": 8,
  "stun": 70,
  "blight": 100,
  "bleed": 70,
  "debuff": 95,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "angry_hive",
    "dmgMin": 2,
    "dmgMax": 7,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "teeth_rake",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "submerge",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "submerge_nuke",
    "dmgMin": 14,
    "dmgMax": 18,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "move_from_right",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "move_from_left",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "crocodile_C": {
  "size": 1,
  "type": "vampire",
  "hp": 223,
  "prot": 0.1,
  "dodge": 32.5,
  "spd": 9,
  "stun": 90,
  "blight": 120,
  "bleed": 90,
  "debuff": 115,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "angry_hive",
    "dmgMin": 3,
    "dmgMax": 10,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "teeth_rake",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "submerge",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "submerge_nuke",
    "dmgMin": 20,
    "dmgMax": 24,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "move_from_right",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "move_from_left",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "curtain_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_B": {
  "size": 1,
  "type": "vampire",
  "hp": 11,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 75,
  "debuff": 220,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_C": {
  "size": 1,
  "type": "vampire",
  "hp": 14,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 245,
  "blight": 245,
  "bleed": 100,
  "debuff": 245,
  "move": 100,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_E": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_F": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_G": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "curtain_H": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hatch_cocoons_A",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_B",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_C",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "curtain_I": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hatch_cocoons_A",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_B",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_C",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "curtain_J": {
  "size": 1,
  "type": "eldritch",
  "hp": 1,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 55,
  "debuff": 200,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hatch_cocoons_A",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_B",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "hatch_cocoons_C",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "esquire_A": {
  "size": 1,
  "type": "vampire",
  "hp": 16,
  "prot": 0,
  "dodge": 4,
  "spd": 2,
  "stun": 40,
  "blight": 40,
  "bleed": 20,
  "debuff": 10,
  "move": 35,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "rib_cracker",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skewering_repartee",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "piercing_foreleg",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "needling_execration",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "esquire_B": {
  "size": 1,
  "type": "vampire",
  "hp": 22,
  "prot": 0,
  "dodge": 12.75,
  "spd": 3,
  "stun": 60,
  "blight": 60,
  "bleed": 40,
  "debuff": 30,
  "move": 55,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "rib_cracker",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skewering_repartee",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "piercing_foreleg",
    "dmgMin": 8,
    "dmgMax": 14,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "needling_execration",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "esquire_C": {
  "size": 1,
  "type": "vampire",
  "hp": 31,
  "prot": 0,
  "dodge": 25.25,
  "spd": 4,
  "stun": 80,
  "blight": 80,
  "bleed": 60,
  "debuff": 50,
  "move": 75,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "rib_cracker",
    "dmgMin": 6,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skewering_repartee",
    "dmgMin": 8,
    "dmgMax": 14,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "piercing_foreleg",
    "dmgMin": 11,
    "dmgMax": 20,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "needling_execration",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fanatic_A": {
  "size": 2,
  "type": "man",
  "hp": 99,
  "prot": 0.15,
  "dodge": 3,
  "spd": 7,
  "stun": 45,
  "blight": 80,
  "bleed": 45,
  "debuff": 35,
  "move": 55,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 3,
  "skills": [
   {
    "id": "sentence_rendered",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "righteous_condemnation",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "holy_stake",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "brand_tainted",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "beat_down",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crush_tainted",
    "dmgMin": 4,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "fanatic_B": {
  "size": 2,
  "type": "man",
  "hp": 149,
  "prot": 0.15,
  "dodge": 11.75,
  "spd": 8,
  "stun": 65,
  "blight": 100,
  "bleed": 65,
  "debuff": 55,
  "move": 75,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 3,
  "skills": [
   {
    "id": "sentence_rendered",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "righteous_condemnation",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "holy_stake",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "brand_tainted",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "beat_down",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crush_tainted",
    "dmgMin": 6,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "fanatic_C": {
  "size": 2,
  "type": "man",
  "hp": 203,
  "prot": 0.15,
  "dodge": 25.5,
  "spd": 9,
  "stun": 85,
  "blight": 120,
  "bleed": 85,
  "debuff": 75,
  "move": 95,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 3,
  "skills": [
   {
    "id": "sentence_rendered",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "righteous_condemnation",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "holy_stake",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "brand_tainted",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "beat_down",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crush_tainted",
    "dmgMin": 8,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "pyre_empty_A": {
  "size": 2,
  "type": "pyre",
  "hp": 70,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pyre_empty_B": {
  "size": 2,
  "type": "pyre",
  "hp": 105,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pyre_empty_C": {
  "size": 2,
  "type": "pyre",
  "hp": 144,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pyre_full_A": {
  "size": 2,
  "type": "pyre",
  "hp": 18,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pyre_full_B": {
  "size": 2,
  "type": "pyre",
  "hp": 27,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pyre_full_C": {
  "size": 2,
  "type": "pyre",
  "hp": 37,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 245,
  "blight": 245,
  "bleed": 245,
  "debuff": 245,
  "move": 245,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "statue_hand_A": {
  "size": 1,
  "type": "stonework",
  "hp": 30,
  "prot": 0.4,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blood_rain",
    "dmgMin": 3,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "statue_hand_B": {
  "size": 1,
  "type": "stonework",
  "hp": 45,
  "prot": 0.4,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blood_rain",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "statue_hand_C": {
  "size": 1,
  "type": "stonework",
  "hp": 62,
  "prot": 0.4,
  "dodge": 0,
  "spd": 0,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blood_rain",
    "dmgMin": 5,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "statue_head_A": {
  "size": 2,
  "type": "stonework",
  "hp": 120,
  "prot": 0.5,
  "dodge": 0,
  "spd": 1,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_prep",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "head_spew",
    "dmgMin": 5,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "statue_head_B": {
  "size": 2,
  "type": "stonework",
  "hp": 180,
  "prot": 0.5,
  "dodge": 0,
  "spd": 2,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_prep",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "head_spew",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "statue_head_C": {
  "size": 2,
  "type": "stonework",
  "hp": 246,
  "prot": 0.5,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_prep",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "head_spew",
    "dmgMin": 9,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "statue_shield_A": {
  "size": 1,
  "type": "stonework",
  "hp": 35,
  "prot": 0.6,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shield_launch",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "shield_smash",
    "dmgMin": 5,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "statue_shield_B": {
  "size": 1,
  "type": "stonework",
  "hp": 53,
  "prot": 0.6,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shield_launch",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "shield_smash",
    "dmgMin": 7,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "statue_shield_C": {
  "size": 1,
  "type": "stonework",
  "hp": 72,
  "prot": 0.6,
  "dodge": 0,
  "spd": 0,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shield_launch",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "shield_smash",
    "dmgMin": 9,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "steward_A": {
  "size": 1,
  "type": "vampire",
  "hp": 10,
  "prot": 0,
  "dodge": 16,
  "spd": 9,
  "stun": 40,
  "blight": 40,
  "bleed": 15,
  "debuff": 30,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "infallible_servant",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "refined_palate",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "choice_cut",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gibbering_entourage",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "steward_B": {
  "size": 1,
  "type": "vampire",
  "hp": 14,
  "prot": 0,
  "dodge": 24.75,
  "spd": 10,
  "stun": 60,
  "blight": 60,
  "bleed": 35,
  "debuff": 50,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "infallible_servant",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "refined_palate",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "choice_cut",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gibbering_entourage",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 2,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "steward_C": {
  "size": 1,
  "type": "vampire",
  "hp": 20,
  "prot": 0,
  "dodge": 37.25,
  "spd": 11,
  "stun": 80,
  "blight": 80,
  "bleed": 55,
  "debuff": 70,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "enraging_slight",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "infallible_servant",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "refined_palate",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "choice_cut",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gibbering_entourage",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 3,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "sycophant_A": {
  "size": 1,
  "type": "vampire",
  "hp": 12,
  "prot": 0,
  "dodge": 10,
  "spd": 10,
  "stun": 15,
  "blight": 80,
  "bleed": 15,
  "debuff": 40,
  "move": 5,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_whine",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "deafening_whine",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bombing_run",
    "dmgMin": 3,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 4,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "sycophant_B": {
  "size": 1,
  "type": "vampire",
  "hp": 17,
  "prot": 0,
  "dodge": 18.75,
  "spd": 11,
  "stun": 35,
  "blight": 100,
  "bleed": 35,
  "debuff": 60,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_whine",
    "dmgMin": 3,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "deafening_whine",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bombing_run",
    "dmgMin": 4,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 6,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "sycophant_C": {
  "size": 1,
  "type": "vampire",
  "hp": 23,
  "prot": 0,
  "dodge": 31.25,
  "spd": 12,
  "stun": 55,
  "blight": 120,
  "bleed": 55,
  "debuff": 80,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_whine",
    "dmgMin": 4,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_human",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "deafening_whine",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bombing_run",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "the_hunger_beast",
    "dmgMin": 8,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "tick_zombie_A": {
  "size": 1,
  "type": "vampire",
  "hp": 12,
  "prot": 0.2,
  "dodge": 0,
  "spd": 1,
  "stun": 150,
  "blight": 50,
  "bleed": 15,
  "debuff": 40,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "gather_the_blood",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "predigestion",
    "dmgMin": 1,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "tick_zombie_B": {
  "size": 1,
  "type": "vampire",
  "hp": 17,
  "prot": 0.2,
  "dodge": 8.75,
  "spd": 2,
  "stun": 170,
  "blight": 70,
  "bleed": 35,
  "debuff": 60,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "gather_the_blood",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "predigestion",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "tick_zombie_C": {
  "size": 1,
  "type": "vampire",
  "hp": 23,
  "prot": 0.2,
  "dodge": 21.25,
  "spd": 3,
  "stun": 190,
  "blight": 90,
  "bleed": 55,
  "debuff": 80,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "gather_the_blood",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "predigestion",
    "dmgMin": 2,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "viscount_C": {
  "size": 1,
  "type": "vampire",
  "hp": 127,
  "prot": 0,
  "dodge": 22.5,
  "spd": 5,
  "stun": 50,
  "blight": 90,
  "bleed": 65,
  "debuff": 65,
  "move": 90,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "feed_on_emaciated",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "feed_on_average",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hungry_eyes",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fine_pairing",
    "dmgMin": 5,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "feed_on_bloated",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "served_rare",
    "dmgMin": 7,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_big_adder_A": {
  "size": 2,
  "type": "beast",
  "hp": 45,
  "prot": 0.2,
  "dodge": 5,
  "spd": 4,
  "stun": 50,
  "blight": 75,
  "bleed": 20,
  "debuff": 40,
  "move": 80,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_head_poison",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_head_stun",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "molt",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "snake_big_adder_B": {
  "size": 2,
  "type": "beast",
  "hp": 63,
  "prot": 0.2,
  "dodge": 13.75,
  "spd": 5,
  "stun": 70,
  "blight": 95,
  "bleed": 40,
  "debuff": 60,
  "move": 100,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_head_poison",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_head_stun",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "molt",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "snake_big_adder_C": {
  "size": 2,
  "type": "beast",
  "hp": 88,
  "prot": 0.2,
  "dodge": 26.25,
  "spd": 6,
  "stun": 90,
  "blight": 115,
  "bleed": 60,
  "debuff": 80,
  "move": 120,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_head_poison",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_head_stun",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "molt",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "snake_cobra_A": {
  "size": 1,
  "type": "beast",
  "hp": 12,
  "prot": 0.1,
  "dodge": 12,
  "spd": 6,
  "stun": 25,
  "blight": 80,
  "bleed": 10,
  "debuff": 20,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cobra_spit",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cobra_bite",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_cobra_B": {
  "size": 1,
  "type": "beast",
  "hp": 17,
  "prot": 0.1,
  "dodge": 20.75,
  "spd": 7,
  "stun": 45,
  "blight": 100,
  "bleed": 30,
  "debuff": 40,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cobra_spit",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cobra_bite",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_cobra_C": {
  "size": 1,
  "type": "beast",
  "hp": 23,
  "prot": 0.1,
  "dodge": 33.25,
  "spd": 8,
  "stun": 65,
  "blight": 120,
  "bleed": 50,
  "debuff": 60,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cobra_spit",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cobra_bite",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_rattler_A": {
  "size": 1,
  "type": "beast",
  "hp": 24,
  "prot": 0.25,
  "dodge": 7.5,
  "spd": 9,
  "stun": 25,
  "blight": 40,
  "bleed": 20,
  "debuff": 20,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_bite",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "slither_forward",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_rattler_B": {
  "size": 1,
  "type": "beast",
  "hp": 34,
  "prot": 0.25,
  "dodge": 16.25,
  "spd": 10,
  "stun": 45,
  "blight": 60,
  "bleed": 40,
  "debuff": 40,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_bite",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "slither_forward",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "snake_rattler_C": {
  "size": 1,
  "type": "beast",
  "hp": 47,
  "prot": 0.25,
  "dodge": 28.75,
  "spd": 11,
  "stun": 65,
  "blight": 80,
  "bleed": 60,
  "debuff": 60,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snake_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "snake_bite",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "slither_forward",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "cocoon_A": {
  "size": 1,
  "type": "husk",
  "hp": 18,
  "prot": 0.35,
  "dodge": 0,
  "spd": 1,
  "stun": 50,
  "blight": 0,
  "bleed": 50,
  "debuff": 50,
  "move": 0,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "xform_to_farmhand",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "murmurs",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cocoon_B": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.35,
  "dodge": 0,
  "spd": 2,
  "stun": 70,
  "blight": 20,
  "bleed": 70,
  "debuff": 70,
  "move": 20,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "xform_to_farmhand",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "murmurs",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cocoon_C": {
  "size": 1,
  "type": "husk",
  "hp": 35,
  "prot": 0.35,
  "dodge": 0,
  "spd": 3,
  "stun": 90,
  "blight": 40,
  "bleed": 90,
  "debuff": 40,
  "move": 40,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "xform_to_farmhand",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "murmurs",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "com_bulrush_D": {
  "size": 1,
  "type": "vegetation",
  "hp": 205,
  "prot": 2,
  "dodge": 222.5,
  "spd": 0,
  "stun": 255,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "com_cattail_D": {
  "size": 1,
  "type": "vegetation",
  "hp": 205,
  "prot": 2,
  "dodge": 222.5,
  "spd": 0,
  "stun": 255,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "com_crocodile_D": {
  "size": 1,
  "type": "vampire",
  "hp": 223,
  "prot": 0.1,
  "dodge": 32.5,
  "spd": 9,
  "stun": 90,
  "blight": 120,
  "bleed": 90,
  "debuff": 115,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "com_angry_hive",
    "dmgMin": 3,
    "dmgMax": 10,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "com_teeth_rake",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "com_submerge",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "com_submerge_nuke",
    "dmgMin": 20,
    "dmgMax": 24,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "com_move_from_right",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "com_move_from_left",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "corpse_crystal_A": {
  "size": 1,
  "type": "husk",
  "hp": 5,
  "prot": 0,
  "dodge": -20,
  "spd": -4,
  "stun": 400,
  "blight": 0,
  "bleed": 100,
  "debuff": 200,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crystal_ranged_suicide",
    "dmgMin": 10,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crystal_suicide",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "corpse_crystal_B": {
  "size": 1,
  "type": "husk",
  "hp": 6,
  "prot": 0,
  "dodge": -20,
  "spd": -4,
  "stun": 400,
  "blight": 0,
  "bleed": 100,
  "debuff": 200,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crystal_ranged_suicide",
    "dmgMin": 12,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crystal_suicide",
    "dmgMin": 3,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "corpse_crystal_C": {
  "size": 1,
  "type": "husk",
  "hp": 7,
  "prot": 0,
  "dodge": -20,
  "spd": -3,
  "stun": 400,
  "blight": 0,
  "bleed": 100,
  "debuff": 200,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crystal_ranged_suicide",
    "dmgMin": 20,
    "dmgMax": 25,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crystal_suicide",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "corpse_crystal_D": {
  "size": 1,
  "type": "corpse_crystal",
  "hp": 9,
  "prot": 0,
  "dodge": -20,
  "spd": -50,
  "stun": 200,
  "blight": 0,
  "bleed": 0,
  "debuff": 200,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crystal_ranged_suicide",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "crystal_suicide",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "farmer_A": {
  "size": 1,
  "type": "husk",
  "hp": 12,
  "prot": 0,
  "dodge": 8,
  "spd": 2,
  "stun": 20,
  "blight": 50,
  "bleed": 20,
  "debuff": 20,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sowing_seeds",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "pause_from_labour",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "farmer_attack",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "farmer_B": {
  "size": 1,
  "type": "husk",
  "hp": 17,
  "prot": 0,
  "dodge": 16.75,
  "spd": 3,
  "stun": 40,
  "blight": 70,
  "bleed": 40,
  "debuff": 40,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sowing_seeds",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "pause_from_labour",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "farmer_attack",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "farmer_C": {
  "size": 1,
  "type": "husk",
  "hp": 22,
  "prot": 0,
  "dodge": 28,
  "spd": 4,
  "stun": 60,
  "blight": 90,
  "bleed": 60,
  "debuff": 60,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sowing_seeds",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "pause_from_labour",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "farmer_attack",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "foreman_A": {
  "size": 1,
  "type": "husk",
  "hp": 26,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 20,
  "blight": 50,
  "bleed": 20,
  "debuff": 20,
  "move": 20,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "hasten_sowing",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "no_tresspassers",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "many_hands",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "foreman_B": {
  "size": 1,
  "type": "husk",
  "hp": 36,
  "prot": 0.15,
  "dodge": 8.75,
  "spd": 4,
  "stun": 40,
  "blight": 70,
  "bleed": 40,
  "debuff": 40,
  "move": 40,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "hasten_sowing",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "no_tresspassers",
    "dmgMin": 7,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "many_hands",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "foreman_C": {
  "size": 1,
  "type": "husk",
  "hp": 47,
  "prot": 0.15,
  "dodge": 20,
  "spd": 5,
  "stun": 60,
  "blight": 90,
  "bleed": 60,
  "debuff": 60,
  "move": 60,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "hasten_sowing",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "no_tresspassers",
    "dmgMin": 9,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "many_hands",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "galaxy_D": {
  "size": 4,
  "type": "husk",
  "hp": 225,
  "prot": 0.3,
  "dodge": 0,
  "spd": 6,
  "stun": 140,
  "blight": 70,
  "bleed": 140,
  "debuff": 100,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rend_the_warp",
    "dmgMin": 14,
    "dmgMax": 22,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "the_husking",
    "dmgMin": 6,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "gatekeeper_A": {
  "size": 1,
  "type": "husk",
  "hp": 500,
  "prot": 1.5,
  "dodge": 1000,
  "spd": 99,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "dimensional_gate",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "gatekeeper_B": {
  "size": 1,
  "type": "husk",
  "hp": 500,
  "prot": 1.5,
  "dodge": 1000,
  "spd": 99,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "dimensional_gate",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "gatekeeper_C": {
  "size": 1,
  "type": "husk",
  "hp": 500,
  "prot": 1.5,
  "dodge": 1000,
  "spd": 99,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "dimensional_gate",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "miller_A": {
  "size": 2,
  "type": "unfortunate_soul",
  "hp": 95,
  "prot": 0.2,
  "dodge": 5,
  "spd": 4,
  "stun": 75,
  "blight": 40,
  "bleed": 200,
  "debuff": 40,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "harvest",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "winters_breath",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "grind_the_grist",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "sadness",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_scarecrow",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_farmers",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_revenant",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "miller_B": {
  "size": 2,
  "type": "unfortunate_soul",
  "hp": 143,
  "prot": 0.2,
  "dodge": 13.75,
  "spd": 5,
  "stun": 95,
  "blight": 60,
  "bleed": 220,
  "debuff": 60,
  "move": 70,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "harvest",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "winters_breath",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "grind_the_grist",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "sadness",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_scarecrow",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_farmers",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_revenant",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "miller_C": {
  "size": 2,
  "type": "unfortunate_soul",
  "hp": 181,
  "prot": 0.2,
  "dodge": 26.25,
  "spd": 6,
  "stun": 115,
  "blight": 80,
  "bleed": 240,
  "debuff": 80,
  "move": 90,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "harvest",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "winters_breath",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "grind_the_grist",
    "dmgMin": 8,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "sadness",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_scarecrow",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_farmers",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_revenant",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "plowhorse_A": {
  "size": 2,
  "type": "husk",
  "hp": 20,
  "prot": 0.15,
  "dodge": 5,
  "spd": 7,
  "stun": 50,
  "blight": 20,
  "bleed": 20,
  "debuff": 40,
  "move": 60,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "trample",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rearing_stomp",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "paw_ground",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "scream",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "plowhorse_B": {
  "size": 2,
  "type": "husk",
  "hp": 28,
  "prot": 0.15,
  "dodge": 13.75,
  "spd": 8,
  "stun": 70,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 80,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "trample",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rearing_stomp",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "paw_ground",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "scream",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "plowhorse_C": {
  "size": 2,
  "type": "husk",
  "hp": 36,
  "prot": 0.15,
  "dodge": 25,
  "spd": 9,
  "stun": 90,
  "blight": 60,
  "bleed": 60,
  "debuff": 80,
  "move": 100,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "trample",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rearing_stomp",
    "dmgMin": 6,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "paw_ground",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "scream",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "revenant_A": {
  "size": 1,
  "type": "husk",
  "hp": 6,
  "prot": 0.45,
  "dodge": 0,
  "spd": 1,
  "stun": 100,
  "blight": 100,
  "bleed": 100,
  "debuff": 60,
  "move": 20,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "nothing_is_right",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "revenant_B": {
  "size": 1,
  "type": "husk",
  "hp": 8,
  "prot": 0.45,
  "dodge": 8.75,
  "spd": 2,
  "stun": 120,
  "blight": 120,
  "bleed": 120,
  "debuff": 80,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "nothing_is_right",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "revenant_C": {
  "size": 1,
  "type": "husk",
  "hp": 11,
  "prot": 0.45,
  "dodge": 20,
  "spd": 3,
  "stun": 140,
  "blight": 140,
  "bleed": 140,
  "debuff": 100,
  "move": 60,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "nothing_is_right",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "scarecrow_A": {
  "size": 1,
  "type": "husk",
  "hp": 12,
  "prot": 0,
  "dodge": 15,
  "spd": 6,
  "stun": 60,
  "blight": 25,
  "bleed": 200,
  "debuff": 40,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_wonders",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "insistent_grasp",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "scarecrow_B": {
  "size": 1,
  "type": "husk",
  "hp": 17,
  "prot": 0,
  "dodge": 23.75,
  "spd": 7,
  "stun": 80,
  "blight": 45,
  "bleed": 220,
  "debuff": 60,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_wonders",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "insistent_grasp",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "scarecrow_C": {
  "size": 1,
  "type": "husk",
  "hp": 22,
  "prot": 0,
  "dodge": 35,
  "spd": 8,
  "stun": 100,
  "blight": 65,
  "bleed": 240,
  "debuff": 80,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_wonders",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "insistent_grasp",
    "dmgMin": 6,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "root_down",
    "dmgMin": 4,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "ashen_breeze",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "seedling_black_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seedling_grey_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seedling_purple_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seedling_red_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seedling_yellow_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seed_black_D": {
  "size": 1,
  "type": "husk",
  "hp": 30,
  "prot": 0.2,
  "dodge": 0,
  "spd": 5,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "black_seed_suicide",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "seed_grey_D": {
  "size": 1,
  "type": "husk",
  "hp": 30,
  "prot": 0.05,
  "dodge": 0,
  "spd": 2,
  "stun": 85,
  "blight": 85,
  "bleed": 100,
  "debuff": 40,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "seed_purple_D": {
  "size": 1,
  "type": "husk",
  "hp": 30,
  "prot": 0.2,
  "dodge": 0,
  "spd": 5,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "purple_seed_suicide",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "seed_red_D": {
  "size": 1,
  "type": "husk",
  "hp": 30,
  "prot": 0.2,
  "dodge": 0,
  "spd": 5,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "red_seed_suicide",
    "dmgMin": 4,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "seed_yellow_D": {
  "size": 1,
  "type": "husk",
  "hp": 30,
  "prot": 0.2,
  "dodge": 0,
  "spd": 5,
  "stun": 240,
  "blight": 100,
  "bleed": 140,
  "debuff": 70,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "yellow_seed_suicide",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "spire_D": {
  "size": 1,
  "type": "husk",
  "hp": 115,
  "prot": 0.2,
  "dodge": 0,
  "spd": 7,
  "stun": 140,
  "blight": 100,
  "bleed": 240,
  "debuff": 90,
  "move": 140,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "spawn_sprout",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "initial_sprouts",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "grow_seed_yellow",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "grow_seed_red",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "grow_seed_black",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "grow_seed_purple",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "grow_seed_grey",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "slow_the_sands",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "xform_to_galaxy",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "sprout_to_seedling_grey",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "sprout_to_seedling_red",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "sprout_to_seedling_black",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "sprout_to_seedling_purple",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "sprout_to_seedling_yellow",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "sprout_D": {
  "size": 1,
  "type": "husk",
  "hp": 25,
  "prot": 0.1,
  "dodge": 0,
  "spd": 4,
  "stun": 240,
  "blight": 105,
  "bleed": 130,
  "debuff": 80,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "thing_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 106,
  "prot": 0,
  "dodge": 5,
  "spd": 2,
  "stun": 85,
  "blight": 40,
  "bleed": 33,
  "debuff": 40,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "phase_gnaw",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "consume_self",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "tainting_touch",
    "dmgMin": 6,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_stun",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_debuff",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_combatnerf",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "consume_self_once",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "thing_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 148,
  "prot": 0,
  "dodge": 13.75,
  "spd": 3,
  "stun": 105,
  "blight": 60,
  "bleed": 53,
  "debuff": 60,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "phase_gnaw",
    "dmgMin": 5,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "consume_self",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "tainting_touch",
    "dmgMin": 9,
    "dmgMax": 12,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_stun",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_debuff",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_combatnerf",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "consume_self_once",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "thing_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 191,
  "prot": 0,
  "dodge": 25,
  "spd": 4,
  "stun": 125,
  "blight": 80,
  "bleed": 73,
  "debuff": 80,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "phase_gnaw",
    "dmgMin": 6,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "consume_self",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "tainting_touch",
    "dmgMin": 11,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_stun",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_debuff",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "emit_globule_combatnerf",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "consume_self_once",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ancestor_big_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 252,
  "prot": 0,
  "dodge": 15.75,
  "spd": 10,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 77.5,
  "debuff": 67.5,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "ancestor_fuse_two",
    "dmgMin": 5,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "ancestor_fuse_all",
    "dmgMin": 2,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "ancestor_contemplate",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "kill_self",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "ancestor_flawed_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 29,
  "prot": 0,
  "dodge": 16.75,
  "spd": 4,
  "stun": 72.5,
  "blight": 57.5,
  "bleed": 57.5,
  "debuff": 57.5,
  "move": 58,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "flawed_mark",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "flawed_reveal",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ancestor_heart_D": {
  "size": 4,
  "type": "cosmic",
  "hp": 252,
  "prot": 0,
  "dodge": 23.75,
  "spd": 10,
  "stun": 87.5,
  "blight": 47.5,
  "bleed": 47.5,
  "debuff": 67.5,
  "move": 88,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "kill_pill",
    "dmgMin": 11,
    "dmgMax": 23,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "heart_stress",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "heart_pierce",
    "dmgMin": 13,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "heart_stun",
    "dmgMin": 13,
    "dmgMax": 16,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ancestor_nebula_D": {
  "size": 1,
  "type": "cosmic",
  "hp": 999,
  "prot": 0,
  "dodge": 999,
  "spd": 0,
  "stun": 1000,
  "blight": 1000,
  "bleed": 1000,
  "debuff": 1000,
  "move": 1000,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "ancestor_perfect_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 36,
  "prot": 0,
  "dodge": 17.75,
  "spd": 9,
  "stun": 72.5,
  "blight": 57.5,
  "bleed": 67.5,
  "debuff": 57.5,
  "move": 73,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "perfect_bloodsteal",
    "dmgMin": 5,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "perfect_reveal",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ancestor_pod_D": {
  "size": 4,
  "type": "eldritch",
  "hp": 189,
  "prot": 0,
  "dodge": 23.75,
  "spd": 2,
  "stun": 72.5,
  "blight": 87.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "pod_emit",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "pod_die",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "ancestor_small_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 5,
  "prot": 1,
  "dodge": 23.75,
  "spd": 12,
  "stun": 122.5,
  "blight": 247.5,
  "bleed": 247.5,
  "debuff": 72.5,
  "move": 73,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "summon_perfect",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_mixed",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "summon_flawed",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "ancestor_aoe_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "kill_self",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "bloated_corpse_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 14,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 50,
  "blight": 10,
  "bleed": 20,
  "debuff": 10,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "bloated_swipe",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "explode",
    "dmgMin": 5,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "bloated_corpse_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 20,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 70,
  "blight": 30,
  "bleed": 40,
  "debuff": 30,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "bloated_swipe",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "explode",
    "dmgMin": 7,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "bloated_corpse_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 27,
  "prot": 0,
  "dodge": 21.25,
  "spd": 2,
  "stun": 90,
  "blight": 50,
  "bleed": 60,
  "debuff": 50,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "bloated_swipe",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "explode",
    "dmgMin": 10,
    "dmgMax": 23,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "brigand_barrel_D": {
  "size": 1,
  "type": "carpentry",
  "hp": 25,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "brigand_blood_A": {
  "size": 2,
  "type": "man",
  "hp": 35,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 50,
  "blight": 20,
  "bleed": 20,
  "debuff": 15,
  "move": 75,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "whip_party",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "whip_single",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "point_blank_shot",
    "dmgMin": 4,
    "dmgMax": 11,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "brigand_blood_B": {
  "size": 2,
  "type": "man",
  "hp": 49,
  "prot": 0,
  "dodge": 8.75,
  "spd": 2,
  "stun": 70,
  "blight": 40,
  "bleed": 40,
  "debuff": 35,
  "move": 95,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "whip_party",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "whip_single",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "point_blank_shot",
    "dmgMin": 5,
    "dmgMax": 14,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "brigand_blood_C": {
  "size": 2,
  "type": "man",
  "hp": 68,
  "prot": 0,
  "dodge": 21.25,
  "spd": 3,
  "stun": 90,
  "blight": 60,
  "bleed": 60,
  "debuff": 55,
  "move": 115,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "whip_party",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "whip_single",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "point_blank_shot",
    "dmgMin": 7,
    "dmgMax": 20,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "brigand_cannon_A": {
  "size": 1,
  "type": "ironwork",
  "hp": 76,
  "prot": 0.2,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 100,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cannon_boom",
    "dmgMin": 9,
    "dmgMax": 27,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_misfire",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "brigand_cannon_B": {
  "size": 1,
  "type": "ironwork",
  "hp": 114,
  "prot": 0.2,
  "dodge": 8.75,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 120,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cannon_boom",
    "dmgMin": 12,
    "dmgMax": 37,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_misfire",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "brigand_cannon_C": {
  "size": 1,
  "type": "ironwork",
  "hp": 156,
  "prot": 0.25,
  "dodge": 22.5,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 140,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cannon_boom",
    "dmgMin": 17,
    "dmgMax": 50,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_misfire",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "cannon_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "brigand_cutthroat_A": {
  "size": 1,
  "type": "man",
  "hp": 12,
  "prot": 0.15,
  "dodge": 2.5,
  "spd": 3,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "double_slice",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "uppercut_slice",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby_weak",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "brigand_cutthroat_B": {
  "size": 1,
  "type": "man",
  "hp": 17,
  "prot": 0.25,
  "dodge": 11.25,
  "spd": 4,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "double_slice",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "uppercut_slice",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby_weak",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "brigand_cutthroat_C": {
  "size": 1,
  "type": "man",
  "hp": 23,
  "prot": 0.25,
  "dodge": 23.75,
  "spd": 5,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "double_slice",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "uppercut_slice",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby_weak",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "brigand_fuseman_A": {
  "size": 1,
  "type": "man",
  "hp": 8,
  "prot": 0,
  "dodge": 12.5,
  "spd": -20,
  "stun": 25,
  "blight": 10,
  "bleed": 10,
  "debuff": 15,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "light_fuse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hot_shot",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "brigand_fuseman_B": {
  "size": 1,
  "type": "man",
  "hp": 12,
  "prot": 0,
  "dodge": 21.25,
  "spd": -19,
  "stun": 45,
  "blight": 30,
  "bleed": 30,
  "debuff": 35,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "light_fuse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hot_shot",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "brigand_fuseman_C": {
  "size": 1,
  "type": "man",
  "hp": 16,
  "prot": 0,
  "dodge": 35,
  "spd": -18,
  "stun": 65,
  "blight": 50,
  "bleed": 50,
  "debuff": 55,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "light_fuse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hot_shot",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "brigand_fusilier_A": {
  "size": 1,
  "type": "man",
  "hp": 12,
  "prot": 0,
  "dodge": 7.5,
  "spd": 6,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blunderbuss_shot",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rushed_shot",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "brigand_fusilier_B": {
  "size": 1,
  "type": "man",
  "hp": 17,
  "prot": 0,
  "dodge": 16.25,
  "spd": 7,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blunderbuss_shot",
    "dmgMin": 1,
    "dmgMax": 4,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rushed_shot",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "brigand_fusilier_C": {
  "size": 1,
  "type": "man",
  "hp": 23,
  "prot": 0,
  "dodge": 28.75,
  "spd": 8,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blunderbuss_shot",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rushed_shot",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "brigand_hunter_D": {
  "size": 1,
  "type": "man",
  "hp": 25,
  "prot": 0,
  "dodge": 31.25,
  "spd": 8,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 67.5,
  "debuff": 62.5,
  "move": 73,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "blunderbuss_shot",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "rushed_shot",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "brigand_raider_D": {
  "size": 1,
  "type": "man",
  "hp": 25,
  "prot": 0.25,
  "dodge": 26.25,
  "spd": 5,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 67.5,
  "debuff": 62.5,
  "move": 73,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "double_slice",
    "dmgMin": 6,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "uppercut_slice",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bandit_stabby_weak",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_A": {
  "size": 1,
  "type": "beast",
  "hp": 11,
  "prot": 0,
  "dodge": 0,
  "spd": 4,
  "stun": 50,
  "blight": 100,
  "bleed": 60,
  "debuff": 40,
  "move": 50,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "munch",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_B": {
  "size": 1,
  "type": "beast",
  "hp": 15,
  "prot": 0,
  "dodge": 8.75,
  "spd": 5,
  "stun": 70,
  "blight": 120,
  "bleed": 80,
  "debuff": 60,
  "move": 70,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "munch",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_C": {
  "size": 1,
  "type": "beast",
  "hp": 21,
  "prot": 0,
  "dodge": 21.25,
  "spd": 6,
  "stun": 90,
  "blight": 140,
  "bleed": 100,
  "debuff": 80,
  "move": 90,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "munch",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_big_A": {
  "size": 2,
  "type": "beast",
  "hp": 37,
  "prot": 0.15,
  "dodge": 0,
  "spd": 1,
  "stun": 50,
  "blight": 100,
  "bleed": 60,
  "debuff": 40,
  "move": 75,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "weaken_prey",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "tentacle_devour",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_big_B": {
  "size": 2,
  "type": "beast",
  "hp": 52,
  "prot": 0.15,
  "dodge": 8.75,
  "spd": 2,
  "stun": 70,
  "blight": 120,
  "bleed": 80,
  "debuff": 60,
  "move": 95,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "weaken_prey",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "tentacle_devour",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "carrion_eater_big_C": {
  "size": 2,
  "type": "beast",
  "hp": 72,
  "prot": 0.15,
  "dodge": 21.25,
  "spd": 3,
  "stun": 90,
  "blight": 140,
  "bleed": 100,
  "debuff": 80,
  "move": 115,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "weaken_prey",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "tentacle_devour",
    "dmgMin": 10,
    "dmgMax": 20,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "cauldron_empty_A": {
  "size": 2,
  "type": "cauldron",
  "hp": 100,
  "prot": 1,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cauldron_empty_B": {
  "size": 2,
  "type": "cauldron",
  "hp": 150,
  "prot": 1,
  "dodge": 10,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cauldron_empty_C": {
  "size": 2,
  "type": "cauldron",
  "hp": 205,
  "prot": 1,
  "dodge": 20,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cauldron_full_A": {
  "size": 2,
  "type": "cauldron",
  "hp": 14,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cauldron_full_B": {
  "size": 2,
  "type": "cauldron",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cauldron_full_C": {
  "size": 2,
  "type": "cauldron",
  "hp": 29,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "cell_battle_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0,
  "dodge": 28.75,
  "spd": 6,
  "stun": 97.5,
  "blight": 67.5,
  "bleed": 87.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "battlecell_bam",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "cell_white_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0,
  "dodge": 38.75,
  "spd": 8,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 87.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cell_reconstruct",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cell_teleport",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cell_shuffle",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_A": {
  "size": 1,
  "type": "man",
  "hp": 70,
  "prot": 0,
  "dodge": 0,
  "spd": 5,
  "stun": 50,
  "blight": 20,
  "bleed": 20,
  "debuff": 20,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "show_collection",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "collect_call",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "life_steal",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "collect_call_battle",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "collector_B": {
  "size": 1,
  "type": "man",
  "hp": 98,
  "prot": 0,
  "dodge": 8.75,
  "spd": 6,
  "stun": 70,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "show_collection",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "collect_call",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "life_steal",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "collect_call_battle",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "collector_C": {
  "size": 1,
  "type": "man",
  "hp": 137,
  "prot": 0,
  "dodge": 21.25,
  "spd": 7,
  "stun": 90,
  "blight": 60,
  "bleed": 60,
  "debuff": 60,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "show_collection",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "collect_call",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "life_steal",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "collect_call_battle",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "collector_battle_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 7.5,
  "spd": 3,
  "stun": 25,
  "blight": 40,
  "bleed": 40,
  "debuff": 15,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_chomp",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_battle_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 22,
  "prot": 0,
  "dodge": 16.25,
  "spd": 4,
  "stun": 45,
  "blight": 60,
  "bleed": 60,
  "debuff": 35,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_chomp",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_battle_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 31,
  "prot": 0,
  "dodge": 28.75,
  "spd": 5,
  "stun": 65,
  "blight": 80,
  "bleed": 80,
  "debuff": 55,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_chomp",
    "dmgMin": 10,
    "dmgMax": 20,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_protect_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 7.5,
  "spd": 7,
  "stun": 25,
  "blight": 40,
  "bleed": 40,
  "debuff": 15,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_crush",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_protect_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 22,
  "prot": 0,
  "dodge": 16.25,
  "spd": 8,
  "stun": 45,
  "blight": 60,
  "bleed": 60,
  "debuff": 35,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_crush",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_protect_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 31,
  "prot": 0,
  "dodge": 28.75,
  "spd": 9,
  "stun": 65,
  "blight": 80,
  "bleed": 80,
  "debuff": 55,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_crush",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_shaman_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 7.5,
  "spd": 5,
  "stun": 25,
  "blight": 40,
  "bleed": 40,
  "debuff": 15,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_buff",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_stress",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_shaman_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 22,
  "prot": 0,
  "dodge": 16.25,
  "spd": 6,
  "stun": 45,
  "blight": 60,
  "bleed": 60,
  "debuff": 35,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_buff",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_stress",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "collector_shaman_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 31,
  "prot": 0,
  "dodge": 28.75,
  "spd": 7,
  "stun": 65,
  "blight": 80,
  "bleed": 80,
  "debuff": 55,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "head_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_buff",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "head_stress",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "corpse_A": {
  "size": 1,
  "type": "corpse",
  "hp": 7,
  "prot": 0,
  "dodge": -20,
  "spd": 0,
  "stun": 200,
  "blight": 0,
  "bleed": 0,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_B": {
  "size": 1,
  "type": "corpse",
  "hp": 10,
  "prot": 0,
  "dodge": -11.25,
  "spd": 0,
  "stun": 220,
  "blight": 0,
  "bleed": 0,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_C": {
  "size": 1,
  "type": "corpse",
  "hp": 14,
  "prot": 0,
  "dodge": 1.25,
  "spd": 0,
  "stun": 240,
  "blight": 0,
  "bleed": 0,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_D": {
  "size": 1,
  "type": "corpse",
  "hp": 14,
  "prot": 0,
  "dodge": 2.5,
  "spd": 0,
  "stun": 245,
  "blight": 0,
  "bleed": 0,
  "debuff": 245,
  "move": 245,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_large_A": {
  "size": 2,
  "type": "corpse",
  "hp": 15,
  "prot": 0,
  "dodge": -20,
  "spd": 0,
  "stun": 200,
  "blight": 0,
  "bleed": 0,
  "debuff": 200,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_large_B": {
  "size": 2,
  "type": "corpse",
  "hp": 21,
  "prot": 0,
  "dodge": -11.25,
  "spd": 0,
  "stun": 220,
  "blight": 0,
  "bleed": 0,
  "debuff": 220,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_large_C": {
  "size": 2,
  "type": "corpse",
  "hp": 29,
  "prot": 0,
  "dodge": 1.25,
  "spd": 0,
  "stun": 240,
  "blight": 0,
  "bleed": 0,
  "debuff": 240,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "corpse_large_D": {
  "size": 2,
  "type": "corpse",
  "hp": 30,
  "prot": 0,
  "dodge": 2.5,
  "spd": 0,
  "stun": 245,
  "blight": 0,
  "bleed": 0,
  "debuff": 245,
  "move": 245,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "crone_A": {
  "size": 1,
  "type": "man",
  "hp": 13,
  "prot": 0,
  "dodge": 20,
  "spd": 8,
  "stun": 10,
  "blight": 40,
  "bleed": 20,
  "debuff": 40,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "curse_vulnerability",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fetid_censer",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "embrace_the_dark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "crone_B": {
  "size": 1,
  "type": "man",
  "hp": 18,
  "prot": 0,
  "dodge": 28.75,
  "spd": 9,
  "stun": 30,
  "blight": 60,
  "bleed": 40,
  "debuff": 60,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "curse_vulnerability",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fetid_censer",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "embrace_the_dark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "crone_C": {
  "size": 1,
  "type": "man",
  "hp": 25,
  "prot": 0,
  "dodge": 41.25,
  "spd": 10,
  "stun": 50,
  "blight": 80,
  "bleed": 60,
  "debuff": 80,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "curse_vulnerability",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fetid_censer",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "embrace_the_dark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "crow_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 75,
  "prot": 0,
  "dodge": 40,
  "spd": 7,
  "stun": 55,
  "blight": 200,
  "bleed": 55,
  "debuff": 30,
  "move": 55,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "peck",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "caw",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "flutter",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "distract",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "escape",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "crow_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 113,
  "prot": 0,
  "dodge": 48.75,
  "spd": 8,
  "stun": 75,
  "blight": 220,
  "bleed": 75,
  "debuff": 50,
  "move": 75,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "peck",
    "dmgMin": 9,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "caw",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "flutter",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "distract",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "escape",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "crow_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 154,
  "prot": 0,
  "dodge": 62.5,
  "spd": 9,
  "stun": 95,
  "blight": 240,
  "bleed": 95,
  "debuff": 70,
  "move": 95,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "peck",
    "dmgMin": 12,
    "dmgMax": 18,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "caw",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "flutter",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "distract",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "escape",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "crow_D": {
  "size": 2,
  "type": "eldritch",
  "hp": 154,
  "prot": 0,
  "dodge": 62.5,
  "spd": 9,
  "stun": 95,
  "blight": 240,
  "bleed": 95,
  "debuff": 70,
  "move": 95,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 3,
  "skills": [
   {
    "id": "peck",
    "dmgMin": 12,
    "dmgMax": 18,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "caw",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "flutter",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "distract",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "escape",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "cultist_brawler_A": {
  "size": 1,
  "type": "man",
  "hp": 15,
  "prot": 0,
  "dodge": 0,
  "spd": 5,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "brawler_claw",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "brawler_claw_weak",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "cultist_brawler_B": {
  "size": 1,
  "type": "man",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 6,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "brawler_claw",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "brawler_claw_weak",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "cultist_brawler_C": {
  "size": 1,
  "type": "man",
  "hp": 29,
  "prot": 0,
  "dodge": 21.25,
  "spd": 7,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "brawler_claw",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "brawler_claw_weak",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "cultist_harpy_D": {
  "size": 1,
  "type": "man",
  "hp": 27,
  "prot": 0,
  "dodge": 36.25,
  "spd": 9,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 67.5,
  "debuff": 87.5,
  "move": 58,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "cultist_pull_D",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cultist_push_D",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cultist_incantation_D",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cultist_orgiastic_D": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0,
  "dodge": 0,
  "spd": 9,
  "stun": 47.5,
  "blight": 47.5,
  "bleed": 47.5,
  "debuff": 47.5,
  "move": 48,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "orgiastic_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "orgiastic_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cultist_shrouded_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0,
  "dodge": 23.75,
  "spd": 7,
  "stun": 72.5,
  "blight": 57.5,
  "bleed": 107.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shrouded_melee",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "shrouded_ranged",
    "dmgMin": 7,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cultist_warlord_D": {
  "size": 1,
  "type": "man",
  "hp": 32,
  "prot": 0,
  "dodge": 23.75,
  "spd": 7,
  "stun": 72.5,
  "blight": 67.5,
  "bleed": 67.5,
  "debuff": 62.5,
  "move": 73,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "brawler_claw_D",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "brawler_claw_weak",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "cultist_witch_A": {
  "size": 1,
  "type": "man",
  "hp": 13,
  "prot": 0,
  "dodge": 12.5,
  "spd": 7,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 40,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cultist_pull",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cultist_push",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cultist_incantation",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cultist_witch_B": {
  "size": 1,
  "type": "man",
  "hp": 18,
  "prot": 0,
  "dodge": 21.25,
  "spd": 8,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "cultist_pull",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cultist_push",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cultist_incantation",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cultist_witch_C": {
  "size": 1,
  "type": "man",
  "hp": 25,
  "prot": 0,
  "dodge": 33.75,
  "spd": 9,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 80,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "cultist_pull",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "cultist_push",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cultist_incantation",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "cyst_D": {
  "size": 3,
  "type": "eldritch",
  "hp": 158,
  "prot": 0.25,
  "dodge": 23.75,
  "spd": 3,
  "stun": 97.5,
  "blight": 87.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "beholder_gaze",
    "dmgMin": 8,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "beholder_burn",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "beholder_healself",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "beholder_summon",
    "dmgMin": null,
    "dmgMax": null,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "drowned_anchor_A": {
  "size": 1,
  "type": "unholy",
  "hp": 14,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 25,
  "blight": 20,
  "bleed": 60,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "anchor_grapple",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "drowned_anchor_B": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 45,
  "blight": 40,
  "bleed": 80,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "anchor_grapple",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "drowned_anchor_C": {
  "size": 1,
  "type": "unholy",
  "hp": 29,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 65,
  "blight": 60,
  "bleed": 100,
  "debuff": 60,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "anchor_grapple",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1
    ],
    "hits": [
     1
    ],
    "aoe": false
   }
  ]
 },
 "drowned_anchored_A": {
  "size": 1,
  "type": "unholy",
  "hp": 14,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 25,
  "blight": 20,
  "bleed": 60,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "drowned_anchored_B": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 45,
  "blight": 40,
  "bleed": 80,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "drowned_anchored_C": {
  "size": 1,
  "type": "unholy",
  "hp": 29,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 70,
  "blight": 65,
  "bleed": 105,
  "debuff": 65,
  "move": 245,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "drowned_captain_A": {
  "size": 3,
  "type": "unholy",
  "hp": 100,
  "prot": 0,
  "dodge": 0,
  "spd": 3,
  "stun": 50,
  "blight": 20,
  "bleed": 60,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "all_hands",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gaffer_hook",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout_debuff",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "drowned_captain_B": {
  "size": 3,
  "type": "unholy",
  "hp": 150,
  "prot": 0,
  "dodge": 8.75,
  "spd": 4,
  "stun": 70,
  "blight": 40,
  "bleed": 80,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "all_hands",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gaffer_hook",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout_debuff",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "drowned_captain_C": {
  "size": 3,
  "type": "unholy",
  "hp": 205,
  "prot": 0,
  "dodge": 22.5,
  "spd": 5,
  "stun": 90,
  "blight": 60,
  "bleed": 100,
  "debuff": 60,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "all_hands",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "gaffer_hook",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "captain_shout_debuff",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "drowned_pirate_A": {
  "size": 1,
  "type": "unholy",
  "hp": 27,
  "prot": 0,
  "dodge": 11,
  "spd": 6,
  "stun": 70,
  "blight": 15,
  "bleed": 100,
  "debuff": 15,
  "move": 5,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_shanty",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "offkilter_jig",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "drowned_pirate_B": {
  "size": 1,
  "type": "unholy",
  "hp": 38,
  "prot": 0,
  "dodge": 19.75,
  "spd": 7,
  "stun": 90,
  "blight": 35,
  "bleed": 120,
  "debuff": 35,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_shanty",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "offkilter_jig",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "drowned_pirate_C": {
  "size": 1,
  "type": "unholy",
  "hp": 53,
  "prot": 0,
  "dodge": 32.25,
  "spd": 8,
  "stun": 110,
  "blight": 55,
  "bleed": 140,
  "debuff": 55,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "maddening_shanty",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "offkilter_jig",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ectoplasm_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 8,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 50,
  "blight": 60,
  "bleed": 60,
  "debuff": 40,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_slime",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_big_slime",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ectoplasm_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 11,
  "prot": 0,
  "dodge": 8.75,
  "spd": 2,
  "stun": 70,
  "blight": 80,
  "bleed": 80,
  "debuff": 60,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_slime",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_big_slime",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ectoplasm_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 21.25,
  "spd": 3,
  "stun": 90,
  "blight": 100,
  "bleed": 100,
  "debuff": 80,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime",
    "dmgMin": 6,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_slime",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "summon_big_slime",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ectoplasm_large_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 35,
  "prot": 0.2,
  "dodge": 0,
  "spd": 1,
  "stun": 75,
  "blight": 60,
  "bleed": 60,
  "debuff": 40,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime_lg",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "slime_stun",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "summon_little_slime",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ectoplasm_large_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 49,
  "prot": 0.33,
  "dodge": 8.75,
  "spd": 2,
  "stun": 95,
  "blight": 80,
  "bleed": 80,
  "debuff": 60,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime_lg",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "slime_stun",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "summon_little_slime",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ectoplasm_large_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 68,
  "prot": 0.33,
  "dodge": 21.25,
  "spd": 3,
  "stun": 115,
  "blight": 100,
  "bleed": 100,
  "debuff": 80,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "slime_lg",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "slime_stun",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "summon_little_slime",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "errant_flesh_bat_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0,
  "dodge": 33.75,
  "spd": 12,
  "stun": 72.5,
  "blight": 87.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "errant_spit",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "errant_cough",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "errant_push",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "errant_flesh_dog_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 34,
  "prot": 0,
  "dodge": 28.75,
  "spd": 9,
  "stun": 72.5,
  "blight": 77.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "errant_bite",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "errant_nip",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "errant_pull",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_crabby_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 42,
  "prot": 0.33,
  "dodge": 0,
  "spd": 0,
  "stun": 50,
  "blight": 10,
  "bleed": 60,
  "debuff": 20,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_pinch",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "pincer_smack",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "fishman_crabby_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 59,
  "prot": 0.5,
  "dodge": 8.75,
  "spd": 1,
  "stun": 70,
  "blight": 30,
  "bleed": 80,
  "debuff": 40,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_pinch",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "pincer_smack",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "fishman_crabby_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 82,
  "prot": 0.5,
  "dodge": 21.25,
  "spd": 2,
  "stun": 90,
  "blight": 50,
  "bleed": 100,
  "debuff": 60,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "the_pinch",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "pincer_smack",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "fishman_harpoon_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 14,
  "prot": 0,
  "dodge": 5,
  "spd": 6,
  "stun": 10,
  "blight": 10,
  "bleed": 50,
  "debuff": 10,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_cutlass",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fish_harpoon",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_harpoon_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 20,
  "prot": 0,
  "dodge": 13.75,
  "spd": 7,
  "stun": 30,
  "blight": 30,
  "bleed": 70,
  "debuff": 30,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_cutlass",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fish_harpoon",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_harpoon_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 27,
  "prot": 0,
  "dodge": 26.25,
  "spd": 8,
  "stun": 50,
  "blight": 50,
  "bleed": 90,
  "debuff": 50,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_cutlass",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fish_harpoon",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_shaman_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 12,
  "prot": 0,
  "dodge": 7.5,
  "spd": 10,
  "stun": 10,
  "blight": 10,
  "bleed": 50,
  "debuff": 20,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_stresscast",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "call_of_the_deep",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "shaman_stab",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shaman_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_shaman_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 17,
  "prot": 0,
  "dodge": 16.25,
  "spd": 11,
  "stun": 30,
  "blight": 30,
  "bleed": 70,
  "debuff": 40,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_stresscast",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "call_of_the_deep",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "shaman_stab",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shaman_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fishman_shaman_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 23,
  "prot": 0,
  "dodge": 28.75,
  "spd": 12,
  "stun": 50,
  "blight": 50,
  "bleed": 90,
  "debuff": 60,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "fish_stresscast",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "call_of_the_deep",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "shaman_stab",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shaman_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_guard_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0.7,
  "dodge": 0,
  "spd": 1,
  "stun": 50,
  "blight": 20,
  "bleed": 40,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_guard_attack",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_guard_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0.8,
  "dodge": 8.75,
  "spd": 2,
  "stun": 70,
  "blight": 40,
  "bleed": 60,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_guard_attack",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_guard_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 51,
  "prot": 0.9,
  "dodge": 22.5,
  "spd": 3,
  "stun": 90,
  "blight": 60,
  "bleed": 80,
  "debuff": 60,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_guard_attack",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_melee_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0.5,
  "dodge": 0,
  "spd": 5,
  "stun": 50,
  "blight": 20,
  "bleed": 40,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_melee_attack",
    "dmgMin": 6,
    "dmgMax": 12,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "formless_melee_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0.6,
  "dodge": 8.75,
  "spd": 6,
  "stun": 70,
  "blight": 40,
  "bleed": 60,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_melee_attack",
    "dmgMin": 8,
    "dmgMax": 16,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "formless_melee_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 51,
  "prot": 0.7,
  "dodge": 22.5,
  "spd": 7,
  "stun": 90,
  "blight": 60,
  "bleed": 80,
  "debuff": 60,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_melee_attack",
    "dmgMin": 11,
    "dmgMax": 22,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "formless_ranged_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0.3,
  "dodge": 0,
  "spd": 8,
  "stun": 25,
  "blight": 40,
  "bleed": 20,
  "debuff": 20,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_ranged_attack",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_ranged_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0.4,
  "dodge": 8.75,
  "spd": 9,
  "stun": 45,
  "blight": 60,
  "bleed": 40,
  "debuff": 40,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_ranged_attack",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_ranged_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 51,
  "prot": 0.5,
  "dodge": 22.5,
  "spd": 10,
  "stun": 65,
  "blight": 80,
  "bleed": 60,
  "debuff": 60,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_ranged_attack",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_weak_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0,
  "dodge": 0,
  "spd": 10,
  "stun": 10,
  "blight": 0,
  "bleed": 0,
  "debuff": 0,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_weak_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_weak_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 38,
  "prot": 0,
  "dodge": 8.75,
  "spd": 11,
  "stun": 30,
  "blight": 20,
  "bleed": 20,
  "debuff": 20,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_weak_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "formless_weak_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 51,
  "prot": 0,
  "dodge": 22.5,
  "spd": 12,
  "stun": 50,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "formless_weak_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "fungal_artillery_A": {
  "size": 1,
  "type": "man",
  "hp": 14,
  "prot": 0.15,
  "dodge": 5,
  "spd": 2,
  "stun": 25,
  "blight": 60,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "artillery_tag",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "artillery_blight",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "escape_cloud",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   }
  ]
 },
 "fungal_artillery_B": {
  "size": 1,
  "type": "man",
  "hp": 20,
  "prot": 0.25,
  "dodge": 13.75,
  "spd": 3,
  "stun": 45,
  "blight": 80,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "artillery_tag",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "artillery_blight",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "escape_cloud",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   }
  ]
 },
 "fungal_artillery_C": {
  "size": 1,
  "type": "man",
  "hp": 27,
  "prot": 0.25,
  "dodge": 26.25,
  "spd": 4,
  "stun": 65,
  "blight": 100,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "artillery_tag",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "artillery_blight",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "escape_cloud",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   }
  ]
 },
 "fungal_bloat_A": {
  "size": 1,
  "type": "man",
  "hp": 19,
  "prot": 0.33,
  "dodge": 0,
  "spd": 0,
  "stun": 25,
  "blight": 60,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "groping_swipe",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fierce_swipe",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "groping_swipe_weak",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "fungal_bloat_B": {
  "size": 1,
  "type": "man",
  "hp": 27,
  "prot": 0.5,
  "dodge": 8.75,
  "spd": 1,
  "stun": 45,
  "blight": 80,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "groping_swipe",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fierce_swipe",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "groping_swipe_weak",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "fungal_bloat_C": {
  "size": 1,
  "type": "man",
  "hp": 37,
  "prot": 0.5,
  "dodge": 21.25,
  "spd": 2,
  "stun": 65,
  "blight": 100,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "groping_swipe",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "fierce_swipe",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "groping_swipe_weak",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "gargoyle_A": {
  "size": 1,
  "type": "stonework",
  "hp": 7,
  "prot": 0.33,
  "dodge": 7.5,
  "spd": 8,
  "stun": 10,
  "blight": 20,
  "bleed": 100,
  "debuff": 15,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "claw_flurry",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "tail_whip",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "gargoyle_B": {
  "size": 1,
  "type": "stonework",
  "hp": 10,
  "prot": 0.5,
  "dodge": 16.25,
  "spd": 9,
  "stun": 30,
  "blight": 40,
  "bleed": 120,
  "debuff": 35,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "claw_flurry",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "tail_whip",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "gargoyle_C": {
  "size": 1,
  "type": "stonework",
  "hp": 14,
  "prot": 0.5,
  "dodge": 28.75,
  "spd": 10,
  "stun": 50,
  "blight": 60,
  "bleed": 140,
  "debuff": 55,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "claw_flurry",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "tail_whip",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "ghoul_A": {
  "size": 2,
  "type": "unholy",
  "hp": 29,
  "prot": 0.33,
  "dodge": 5,
  "spd": 5,
  "stun": 50,
  "blight": 20,
  "bleed": 20,
  "debuff": 20,
  "move": 62,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rend",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skull_toss",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "howl",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ghoul_B": {
  "size": 2,
  "type": "unholy",
  "hp": 41,
  "prot": 0.4,
  "dodge": 13.75,
  "spd": 6,
  "stun": 70,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 82,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rend",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skull_toss",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "howl",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "ghoul_C": {
  "size": 2,
  "type": "unholy",
  "hp": 57,
  "prot": 0.4,
  "dodge": 26.25,
  "spd": 7,
  "stun": 90,
  "blight": 60,
  "bleed": 60,
  "debuff": 60,
  "move": 102,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rend",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "skull_toss",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "howl",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "hag_A": {
  "size": 2,
  "type": "man",
  "hp": 66,
  "prot": 0,
  "dodge": 5,
  "spd": 5,
  "stun": 100,
  "blight": 60,
  "bleed": 20,
  "debuff": 40,
  "move": 200,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "hag_grab",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_tenderize",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "hag_season",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_taste",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "hag_B": {
  "size": 2,
  "type": "man",
  "hp": 99,
  "prot": 0,
  "dodge": 13.75,
  "spd": 6,
  "stun": 120,
  "blight": 80,
  "bleed": 40,
  "debuff": 60,
  "move": 220,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "hag_grab",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_tenderize",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "hag_season",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_taste",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "hag_C": {
  "size": 2,
  "type": "man",
  "hp": 135,
  "prot": 0,
  "dodge": 27.5,
  "spd": 7,
  "stun": 140,
  "blight": 100,
  "bleed": 60,
  "debuff": 80,
  "move": 240,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "hag_grab",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_tenderize",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "hag_season",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "hag_taste",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "jellyfish_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 10,
  "prot": 0,
  "dodge": 12.5,
  "spd": 7,
  "stun": 50,
  "blight": 10,
  "bleed": 50,
  "debuff": 10,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "jellyfish_sting",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "jellyfish_rend",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "jellyfish_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 14,
  "prot": 0,
  "dodge": 21.25,
  "spd": 8,
  "stun": 70,
  "blight": 30,
  "bleed": 70,
  "debuff": 30,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "jellyfish_sting",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "jellyfish_rend",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "jellyfish_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 20,
  "prot": 0,
  "dodge": 33.75,
  "spd": 9,
  "stun": 90,
  "blight": 50,
  "bleed": 90,
  "debuff": 50,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "jellyfish_sting",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "jellyfish_rend",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "madman_A": {
  "size": 1,
  "type": "man",
  "hp": 14,
  "prot": 0,
  "dodge": 20,
  "spd": 9,
  "stun": 10,
  "blight": 10,
  "bleed": 10,
  "debuff": 15,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "accusation",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "doomsay",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "madman_B": {
  "size": 1,
  "type": "man",
  "hp": 20,
  "prot": 0,
  "dodge": 28.75,
  "spd": 10,
  "stun": 30,
  "blight": 30,
  "bleed": 30,
  "debuff": 35,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "accusation",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "doomsay",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "madman_C": {
  "size": 1,
  "type": "man",
  "hp": 27,
  "prot": 0,
  "dodge": 41.25,
  "spd": 11,
  "stun": 50,
  "blight": 50,
  "bleed": 50,
  "debuff": 55,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "accusation",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "doomsay",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "maggot_A": {
  "size": 1,
  "type": "beast",
  "hp": 6,
  "prot": 0,
  "dodge": 0,
  "spd": 3,
  "stun": 100,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "grave_nibble",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "maggot_B": {
  "size": 1,
  "type": "beast",
  "hp": 8,
  "prot": 0,
  "dodge": 8.75,
  "spd": 4,
  "stun": 120,
  "blight": 60,
  "bleed": 60,
  "debuff": 80,
  "move": 20,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "grave_nibble",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "maggot_C": {
  "size": 1,
  "type": "beast",
  "hp": 12,
  "prot": 0,
  "dodge": 21.25,
  "spd": 5,
  "stun": 140,
  "blight": 80,
  "bleed": 80,
  "debuff": 100,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "grave_nibble",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "necromancer_A": {
  "size": 1,
  "type": "unholy",
  "hp": 105,
  "prot": 0,
  "dodge": 0,
  "spd": 8,
  "stun": 75,
  "blight": 20,
  "bleed": 20,
  "debuff": 40,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "unholy_smite",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "unholy_judgement",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "unholy_curse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "necromancer_B": {
  "size": 1,
  "type": "unholy",
  "hp": 158,
  "prot": 0,
  "dodge": 8.75,
  "spd": 9,
  "stun": 95,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "unholy_smite",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "unholy_judgement",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "unholy_curse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "necromancer_C": {
  "size": 1,
  "type": "unholy",
  "hp": 215,
  "prot": 0,
  "dodge": 22.5,
  "spd": 10,
  "stun": 115,
  "blight": 60,
  "bleed": 60,
  "debuff": 80,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "unholy_smite",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "unholy_judgement",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "unholy_curse",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "nest_A": {
  "size": 2,
  "type": "thatchery",
  "hp": 60,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 20,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "nest_B": {
  "size": 2,
  "type": "thatchery",
  "hp": 90,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "nest_C": {
  "size": 2,
  "type": "thatchery",
  "hp": 123,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 60,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "octotank_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 25,
  "prot": 0.33,
  "dodge": 0,
  "spd": 0,
  "stun": 25,
  "blight": 10,
  "bleed": 60,
  "debuff": 10,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "octo_cestus",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "octo_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "octotank_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 35,
  "prot": 0.5,
  "dodge": 8.75,
  "spd": 1,
  "stun": 45,
  "blight": 30,
  "bleed": 80,
  "debuff": 30,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "octo_cestus",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "octo_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "octotank_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 49,
  "prot": 0.5,
  "dodge": 21.25,
  "spd": 2,
  "stun": 65,
  "blight": 50,
  "bleed": 100,
  "debuff": 50,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "octo_cestus",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "octo_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "pew_large_A": {
  "size": 1,
  "type": "carpentry",
  "hp": 55,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_large_B": {
  "size": 1,
  "type": "carpentry",
  "hp": 83,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 320,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_large_C": {
  "size": 1,
  "type": "carpentry",
  "hp": 113,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 340,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_medium_A": {
  "size": 1,
  "type": "carpentry",
  "hp": 40,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_medium_B": {
  "size": 1,
  "type": "carpentry",
  "hp": 60,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 320,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_medium_C": {
  "size": 1,
  "type": "carpentry",
  "hp": 82,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 340,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_small_A": {
  "size": 1,
  "type": "carpentry",
  "hp": 25,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 200,
  "blight": 200,
  "bleed": 200,
  "debuff": 200,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_small_B": {
  "size": 1,
  "type": "carpentry",
  "hp": 38,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 220,
  "blight": 220,
  "bleed": 220,
  "debuff": 220,
  "move": 320,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "pew_small_C": {
  "size": 1,
  "type": "carpentry",
  "hp": 51,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 240,
  "blight": 240,
  "bleed": 240,
  "debuff": 240,
  "move": 340,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "prophet_A": {
  "size": 1,
  "type": "unholy",
  "hp": 105,
  "prot": 0,
  "dodge": 5,
  "spd": 0,
  "stun": 100,
  "blight": 0,
  "bleed": 0,
  "debuff": 20,
  "move": 300,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "prophet_mark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "prophet_attack",
    "dmgMin": 11,
    "dmgMax": 23,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "eye_on_you",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fulminate",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "prophet_B": {
  "size": 1,
  "type": "unholy",
  "hp": 158,
  "prot": 0,
  "dodge": 13.75,
  "spd": 1,
  "stun": 120,
  "blight": 20,
  "bleed": 20,
  "debuff": 40,
  "move": 320,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "prophet_mark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "prophet_attack",
    "dmgMin": 15,
    "dmgMax": 31,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "eye_on_you",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fulminate",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "prophet_C": {
  "size": 1,
  "type": "unholy",
  "hp": 215,
  "prot": 0,
  "dodge": 27.5,
  "spd": 2,
  "stun": 140,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 340,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "prophet_mark",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "prophet_attack",
    "dmgMin": 21,
    "dmgMax": 42,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "eye_on_you",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "fulminate",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "rabid_dog_A": {
  "size": 1,
  "type": "beast",
  "hp": 10,
  "prot": 0,
  "dodge": 15,
  "spd": 8,
  "stun": 10,
  "blight": 60,
  "bleed": 20,
  "debuff": 10,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rabid_rush",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "rabid_dog_B": {
  "size": 1,
  "type": "beast",
  "hp": 14,
  "prot": 0,
  "dodge": 23.75,
  "spd": 9,
  "stun": 30,
  "blight": 80,
  "bleed": 40,
  "debuff": 30,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rabid_rush",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "rabid_dog_C": {
  "size": 1,
  "type": "beast",
  "hp": 20,
  "prot": 0,
  "dodge": 36.25,
  "spd": 10,
  "stun": 50,
  "blight": 100,
  "bleed": 60,
  "debuff": 50,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "rabid_rush",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "shambler_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 77,
  "prot": 0.33,
  "dodge": 0,
  "spd": 0,
  "stun": 100,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shamble_fwd",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shamble_back",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shambler_howl",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "shambler_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 116,
  "prot": 0.33,
  "dodge": 8.75,
  "spd": 1,
  "stun": 120,
  "blight": 60,
  "bleed": 60,
  "debuff": 60,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shamble_fwd",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shamble_back",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shambler_howl",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "shambler_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 158,
  "prot": 0.33,
  "dodge": 22.5,
  "spd": 2,
  "stun": 140,
  "blight": 80,
  "bleed": 80,
  "debuff": 80,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shamble_fwd",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shamble_back",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shambler_howl",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "shambler_E": {
  "size": 2,
  "type": "eldritch",
  "hp": 174,
  "prot": 0.33,
  "dodge": 25,
  "spd": 3,
  "stun": 145,
  "blight": 85,
  "bleed": 85,
  "debuff": 85,
  "move": 95,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "shamble_fwd",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shamble_back",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shambler_howl",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "shambler_tentacle_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 8,
  "prot": 0,
  "dodge": 17.5,
  "spd": 10,
  "stun": 50,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tentacle_slap",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "shambler_tentacle_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 12,
  "prot": 0,
  "dodge": 26.25,
  "spd": 11,
  "stun": 70,
  "blight": 60,
  "bleed": 60,
  "debuff": 60,
  "move": 60,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tentacle_slap",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "shambler_tentacle_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 40,
  "spd": 12,
  "stun": 90,
  "blight": 80,
  "bleed": 80,
  "debuff": 80,
  "move": 80,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tentacle_slap",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "shambler_tentacle_E": {
  "size": 1,
  "type": "eldritch",
  "hp": 18,
  "prot": 0,
  "dodge": 42.5,
  "spd": 13,
  "stun": 95,
  "blight": 85,
  "bleed": 85,
  "debuff": 85,
  "move": 85,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tentacle_slap",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "shuffler_D": {
  "size": 3,
  "type": "eldritch",
  "hp": 162,
  "prot": 0.33,
  "dodge": 23.75,
  "spd": 2,
  "stun": 147.5,
  "blight": 107.5,
  "bleed": 67.5,
  "debuff": 87.5,
  "move": 98,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "shuffler_eat",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "shuffler_howl",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "shuffler_shuffle",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "siren_A": {
  "size": 2,
  "type": "eldritch",
  "hp": 119,
  "prot": 0,
  "dodge": 12.5,
  "spd": 5,
  "stun": 50,
  "blight": 40,
  "bleed": 60,
  "debuff": 40,
  "move": 25,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "siren_song",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "conch_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "conch_horror",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "conch_celldisrupt",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "siren_B": {
  "size": 2,
  "type": "eldritch",
  "hp": 179,
  "prot": 0,
  "dodge": 21.25,
  "spd": 6,
  "stun": 75,
  "blight": 60,
  "bleed": 80,
  "debuff": 60,
  "move": 45,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "siren_song",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "conch_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "conch_horror",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "conch_celldisrupt",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "siren_C": {
  "size": 2,
  "type": "eldritch",
  "hp": 244,
  "prot": 0,
  "dodge": 35,
  "spd": 7,
  "stun": 100,
  "blight": 80,
  "bleed": 100,
  "debuff": 80,
  "move": 65,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "siren_song",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "conch_summon",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "conch_horror",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "conch_celldisrupt",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_arbalist_A": {
  "size": 1,
  "type": "unholy",
  "hp": 15,
  "prot": 0,
  "dodge": 5,
  "spd": 5,
  "stun": 10,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crossbow_shot",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bayonet_jab",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_arbalist_B": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0,
  "dodge": 13.75,
  "spd": 6,
  "stun": 30,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crossbow_shot",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bayonet_jab",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_arbalist_C": {
  "size": 1,
  "type": "unholy",
  "hp": 29,
  "prot": 0,
  "dodge": 26.25,
  "spd": 7,
  "stun": 50,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crossbow_shot",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "bayonet_jab",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_bearer_A": {
  "size": 1,
  "type": "unholy",
  "hp": 22,
  "prot": 0.15,
  "dodge": 13,
  "spd": 5,
  "stun": 200,
  "blight": 30,
  "bleed": 200,
  "debuff": 15,
  "move": 15,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "into_the_ranks",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "wicked_surge",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "unholy_rally",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "skeleton_bearer_B": {
  "size": 1,
  "type": "unholy",
  "hp": 31,
  "prot": 0.15,
  "dodge": 21.75,
  "spd": 6,
  "stun": 220,
  "blight": 50,
  "bleed": 220,
  "debuff": 35,
  "move": 35,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "into_the_ranks",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "wicked_surge",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "unholy_rally",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "skeleton_bearer_C": {
  "size": 1,
  "type": "unholy",
  "hp": 43,
  "prot": 0.15,
  "dodge": 34.25,
  "spd": 7,
  "stun": 240,
  "blight": 70,
  "bleed": 240,
  "debuff": 55,
  "move": 55,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "into_the_ranks",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "wicked_surge",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "unholy_rally",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "skeleton_captain_A": {
  "size": 2,
  "type": "unholy",
  "hp": 35,
  "prot": 0.15,
  "dodge": 0,
  "spd": 0,
  "stun": 50,
  "blight": 10,
  "bleed": 200,
  "debuff": 20,
  "move": 75,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crushing_blow",
    "dmgMin": 6,
    "dmgMax": 12,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "ground_pound",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_captain_B": {
  "size": 2,
  "type": "unholy",
  "hp": 49,
  "prot": 0.33,
  "dodge": 8.75,
  "spd": 1,
  "stun": 70,
  "blight": 30,
  "bleed": 220,
  "debuff": 40,
  "move": 95,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crushing_blow",
    "dmgMin": 8,
    "dmgMax": 16,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "ground_pound",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_captain_C": {
  "size": 2,
  "type": "unholy",
  "hp": 68,
  "prot": 0.33,
  "dodge": 21.25,
  "spd": 2,
  "stun": 90,
  "blight": 50,
  "bleed": 240,
  "debuff": 60,
  "move": 115,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "crushing_blow",
    "dmgMin": 11,
    "dmgMax": 22,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "ground_pound",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_common_A": {
  "size": 1,
  "type": "unholy",
  "hp": 8,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 10,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cudgel",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cudgel_weak",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_common_B": {
  "size": 1,
  "type": "unholy",
  "hp": 11,
  "prot": 0,
  "dodge": 8.75,
  "spd": 2,
  "stun": 30,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cudgel",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cudgel_weak",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_common_C": {
  "size": 1,
  "type": "unholy",
  "hp": 16,
  "prot": 0,
  "dodge": 21.25,
  "spd": 3,
  "stun": 50,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "cudgel",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "cudgel_weak",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_courtier_A": {
  "size": 1,
  "type": "unholy",
  "hp": 10,
  "prot": 0,
  "dodge": 12.5,
  "spd": 8,
  "stun": 10,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 10,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tempting_goblet",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "dagger_jab",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_courtier_B": {
  "size": 1,
  "type": "unholy",
  "hp": 14,
  "prot": 0,
  "dodge": 21.25,
  "spd": 9,
  "stun": 30,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tempting_goblet",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "dagger_jab",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_courtier_C": {
  "size": 1,
  "type": "unholy",
  "hp": 20,
  "prot": 0,
  "dodge": 33.75,
  "spd": 10,
  "stun": 50,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "tempting_goblet",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "dagger_jab",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_defender_A": {
  "size": 1,
  "type": "unholy",
  "hp": 15,
  "prot": 0.25,
  "dodge": 0,
  "spd": 0,
  "stun": 25,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "axe_strike",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shield_bash",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "axe_strike_weak",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_defender_B": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0.45,
  "dodge": 8.75,
  "spd": 1,
  "stun": 45,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "axe_strike",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shield_bash",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "axe_strike_weak",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shield_defend",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_defender_C": {
  "size": 1,
  "type": "unholy",
  "hp": 29,
  "prot": 0.45,
  "dodge": 21.25,
  "spd": 2,
  "stun": 65,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "axe_strike",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shield_bash",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "axe_strike_weak",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "shield_defend",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_militia_A": {
  "size": 1,
  "type": "unholy",
  "hp": 10,
  "prot": 0.15,
  "dodge": 0,
  "spd": 2,
  "stun": 25,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 20,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sword_strike",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "sword_strike_weak",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_militia_B": {
  "size": 1,
  "type": "unholy",
  "hp": 14,
  "prot": 0.25,
  "dodge": 8.75,
  "spd": 3,
  "stun": 45,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 40,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sword_strike",
    "dmgMin": 4,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "sword_strike_weak",
    "dmgMin": 2,
    "dmgMax": 6,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_militia_C": {
  "size": 1,
  "type": "unholy",
  "hp": 20,
  "prot": 0.25,
  "dodge": 21.25,
  "spd": 4,
  "stun": 65,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 60,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "sword_strike",
    "dmgMin": 5,
    "dmgMax": 14,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "sword_strike_weak",
    "dmgMin": 3,
    "dmgMax": 8,
    "launch": [
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "skeleton_spear_A": {
  "size": 1,
  "type": "unholy",
  "hp": 15,
  "prot": 0,
  "dodge": 0,
  "spd": 3,
  "stun": 25,
  "blight": 10,
  "bleed": 200,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spear_thrust",
    "dmgMin": 4,
    "dmgMax": 8,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "impale",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_spear_B": {
  "size": 1,
  "type": "unholy",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 4,
  "stun": 45,
  "blight": 30,
  "bleed": 220,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spear_thrust",
    "dmgMin": 5,
    "dmgMax": 11,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "impale",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "skeleton_spear_C": {
  "size": 1,
  "type": "unholy",
  "hp": 29,
  "prot": 0,
  "dodge": 21.25,
  "spd": 5,
  "stun": 65,
  "blight": 50,
  "bleed": 240,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spear_thrust",
    "dmgMin": 7,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "impale",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "snail_urchin_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 5,
  "prot": 0.75,
  "dodge": 0,
  "spd": -5,
  "stun": 50,
  "blight": 20,
  "bleed": 40,
  "debuff": 10,
  "move": 10,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snail_slime",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "snail_urchin_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 7,
  "prot": 0.75,
  "dodge": 8.75,
  "spd": -4,
  "stun": 70,
  "blight": 40,
  "bleed": 60,
  "debuff": 30,
  "move": 30,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snail_slime",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "snail_urchin_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 10,
  "prot": 0.75,
  "dodge": 21.25,
  "spd": -3,
  "stun": 90,
  "blight": 60,
  "bleed": 80,
  "debuff": 50,
  "move": 50,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "snail_slime",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_spitter_A": {
  "size": 1,
  "type": "beast",
  "hp": 7,
  "prot": 0,
  "dodge": 15,
  "spd": 4,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 10,
  "move": 10,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spider_spit",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_spitter_B": {
  "size": 1,
  "type": "beast",
  "hp": 10,
  "prot": 0,
  "dodge": 23.75,
  "spd": 5,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 30,
  "move": 30,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spider_spit",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_spitter_C": {
  "size": 1,
  "type": "beast",
  "hp": 14,
  "prot": 0,
  "dodge": 36.25,
  "spd": 6,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 50,
  "move": 50,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spider_spit",
    "dmgMin": 5,
    "dmgMax": 10,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_webber_A": {
  "size": 1,
  "type": "beast",
  "hp": 7,
  "prot": 0,
  "dodge": 15,
  "spd": 5,
  "stun": 25,
  "blight": 20,
  "bleed": 20,
  "debuff": 10,
  "move": 10,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "spider_web",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_webber_B": {
  "size": 1,
  "type": "beast",
  "hp": 10,
  "prot": 0,
  "dodge": 23.75,
  "spd": 6,
  "stun": 45,
  "blight": 40,
  "bleed": 40,
  "debuff": 30,
  "move": 30,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "spider_web",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 2,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "spider_webber_C": {
  "size": 1,
  "type": "beast",
  "hp": 14,
  "prot": 0,
  "dodge": 36.25,
  "spd": 7,
  "stun": 65,
  "blight": 60,
  "bleed": 60,
  "debuff": 50,
  "move": 50,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "spider_web",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "spider_bite",
    "dmgMin": 2,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swinetaur_A": {
  "size": 2,
  "type": "man",
  "hp": 45,
  "prot": 0.25,
  "dodge": 0,
  "spd": 0,
  "stun": 75,
  "blight": 60,
  "bleed": 20,
  "debuff": 20,
  "move": 100,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "pig_spear",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "bull_rush",
    "dmgMin": 6,
    "dmgMax": 12,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "trot_retreat",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "backhand",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swinetaur_B": {
  "size": 2,
  "type": "man",
  "hp": 63,
  "prot": 0.4,
  "dodge": 8.75,
  "spd": 1,
  "stun": 95,
  "blight": 80,
  "bleed": 40,
  "debuff": 40,
  "move": 120,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "pig_spear",
    "dmgMin": 4,
    "dmgMax": 10,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "bull_rush",
    "dmgMin": 8,
    "dmgMax": 16,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "trot_retreat",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "backhand",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swinetaur_C": {
  "size": 2,
  "type": "man",
  "hp": 88,
  "prot": 0.4,
  "dodge": 21.25,
  "spd": 2,
  "stun": 115,
  "blight": 100,
  "bleed": 60,
  "debuff": 60,
  "move": 140,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "pig_spear",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "bull_rush",
    "dmgMin": 11,
    "dmgMax": 22,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "trot_retreat",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2
    ],
    "hits": [],
    "aoe": false
   },
   {
    "id": "backhand",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swine_drummer_A": {
  "size": 1,
  "type": "man",
  "hp": 15,
  "prot": 0,
  "dodge": 0,
  "spd": 7,
  "stun": 10,
  "blight": 40,
  "bleed": 20,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "drum_fear",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "drum_debuff",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_drummer_B": {
  "size": 1,
  "type": "man",
  "hp": 21,
  "prot": 0,
  "dodge": 8.75,
  "spd": 8,
  "stun": 30,
  "blight": 60,
  "bleed": 40,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "drum_fear",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "drum_debuff",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_drummer_C": {
  "size": 1,
  "type": "man",
  "hp": 29,
  "prot": 0,
  "dodge": 21.25,
  "spd": 9,
  "stun": 50,
  "blight": 80,
  "bleed": 60,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "drum_fear",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "drum_debuff",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_piglet_A": {
  "size": 1,
  "type": "beast",
  "hp": 17,
  "prot": 0,
  "dodge": 15,
  "spd": 20,
  "stun": 50,
  "blight": 0,
  "bleed": 0,
  "debuff": 0,
  "move": 0,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "squeal",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "wilbur_mark_1",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "wilbur_mark_2",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "squeal_single",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_piglet_B": {
  "size": 1,
  "type": "beast",
  "hp": 26,
  "prot": 0,
  "dodge": 23.75,
  "spd": 21,
  "stun": 70,
  "blight": 20,
  "bleed": 20,
  "debuff": 20,
  "move": 20,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 2,
  "skills": [
   {
    "id": "squeal",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "wilbur_mark_1",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "wilbur_mark_2",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "squeal_single",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_piglet_C": {
  "size": 1,
  "type": "beast",
  "hp": 35,
  "prot": 0,
  "dodge": 37.5,
  "spd": 22,
  "stun": 90,
  "blight": 40,
  "bleed": 40,
  "debuff": 40,
  "move": 40,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 2,
  "skills": [
   {
    "id": "squeal",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "wilbur_mark_1",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "wilbur_mark_2",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "squeal_single",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_prince_A": {
  "size": 3,
  "type": "beast",
  "hp": 132,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 100,
  "blight": 0,
  "bleed": 0,
  "debuff": 20,
  "move": 100,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "obliterate_marked_one",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "obliterate_marked_two",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "obliterate_enraged",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "obliterate_blind",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_prince_B": {
  "size": 3,
  "type": "beast",
  "hp": 198,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 120,
  "blight": 20,
  "bleed": 20,
  "debuff": 40,
  "move": 120,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "obliterate_marked_one",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "obliterate_marked_two",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "obliterate_enraged",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "obliterate_blind",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_prince_C": {
  "size": 3,
  "type": "beast",
  "hp": 271,
  "prot": 0,
  "dodge": 22.5,
  "spd": 2,
  "stun": 140,
  "blight": 40,
  "bleed": 40,
  "debuff": 60,
  "move": 140,
  "corpse": false,
  "punishesMark": true,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "obliterate_marked_one",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "obliterate_marked_two",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "obliterate_enraged",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "obliterate_blind",
    "dmgMin": 9,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_reaver_A": {
  "size": 1,
  "type": "man",
  "hp": 21,
  "prot": 0.15,
  "dodge": 0,
  "spd": 3,
  "stun": 25,
  "blight": 60,
  "bleed": 20,
  "debuff": 15,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "butcher_cut",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "ball_and_chain",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_reaver_B": {
  "size": 1,
  "type": "man",
  "hp": 29,
  "prot": 0.33,
  "dodge": 8.75,
  "spd": 4,
  "stun": 45,
  "blight": 80,
  "bleed": 40,
  "debuff": 35,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "butcher_cut",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "ball_and_chain",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_reaver_C": {
  "size": 1,
  "type": "man",
  "hp": 41,
  "prot": 0.33,
  "dodge": 21.25,
  "spd": 5,
  "stun": 65,
  "blight": 100,
  "bleed": 60,
  "debuff": 55,
  "move": 90,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "butcher_cut",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "ball_and_chain",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_skiver_A": {
  "size": 1,
  "type": "man",
  "hp": 25,
  "prot": 0,
  "dodge": 10,
  "spd": 7,
  "stun": 45,
  "blight": 60,
  "bleed": 20,
  "debuff": 30,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spit_to_roast",
    "dmgMin": 6,
    "dmgMax": 10,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "cripple_them",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "goring_flight",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "swine_skiver_B": {
  "size": 1,
  "type": "man",
  "hp": 35,
  "prot": 0.15,
  "dodge": 18.75,
  "spd": 8,
  "stun": 65,
  "blight": 80,
  "bleed": 40,
  "debuff": 50,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spit_to_roast",
    "dmgMin": 9,
    "dmgMax": 13,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "cripple_them",
    "dmgMin": 4,
    "dmgMax": 10,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "goring_flight",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "swine_skiver_C": {
  "size": 1,
  "type": "man",
  "hp": 49,
  "prot": 0.15,
  "dodge": 31.25,
  "spd": 9,
  "stun": 85,
  "blight": 100,
  "bleed": 60,
  "debuff": 70,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "spit_to_roast",
    "dmgMin": 12,
    "dmgMax": 18,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "cripple_them",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "goring_flight",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "swine_slasher_A": {
  "size": 1,
  "type": "man",
  "hp": 8,
  "prot": 0.25,
  "dodge": 7.5,
  "spd": 5,
  "stun": 10,
  "blight": 40,
  "bleed": 40,
  "debuff": 15,
  "move": 25,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hook_where_it_hurts",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swine_slasher_B": {
  "size": 1,
  "type": "man",
  "hp": 11,
  "prot": 0.4,
  "dodge": 16.25,
  "spd": 6,
  "stun": 30,
  "blight": 60,
  "bleed": 60,
  "debuff": 35,
  "move": 45,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hook_where_it_hurts",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swine_slasher_C": {
  "size": 1,
  "type": "man",
  "hp": 16,
  "prot": 0.4,
  "dodge": 28.75,
  "spd": 7,
  "stun": 50,
  "blight": 80,
  "bleed": 80,
  "debuff": 55,
  "move": 65,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "hook_where_it_hurts",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "swine_wretch_A": {
  "size": 1,
  "type": "beast",
  "hp": 12,
  "prot": 0,
  "dodge": 12.5,
  "spd": 8,
  "stun": 10,
  "blight": 40,
  "bleed": 10,
  "debuff": 15,
  "move": 0,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "vomit",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_wretch_B": {
  "size": 1,
  "type": "beast",
  "hp": 17,
  "prot": 0,
  "dodge": 21.25,
  "spd": 9,
  "stun": 30,
  "blight": 60,
  "bleed": 30,
  "debuff": 35,
  "move": 20,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "vomit",
    "dmgMin": 1,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "swine_wretch_C": {
  "size": 1,
  "type": "beast",
  "hp": 23,
  "prot": 0,
  "dodge": 33.75,
  "spd": 10,
  "stun": 50,
  "blight": 80,
  "bleed": 50,
  "debuff": 55,
  "move": 40,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "vomit",
    "dmgMin": 1,
    "dmgMax": 3,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "templar_melee_D": {
  "size": 2,
  "type": "eldritch",
  "hp": 137,
  "prot": 0,
  "dodge": 46.25,
  "spd": 5,
  "stun": 97.5,
  "blight": 97.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "templar_pinch",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "templar_sting",
    "dmgMin": 9,
    "dmgMax": 20,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "templar_slam",
    "dmgMin": 8,
    "dmgMax": 18,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   }
  ]
 },
 "templar_melee_mb_D": {
  "size": 2,
  "type": "eldritch",
  "hp": 137,
  "prot": 0,
  "dodge": 26.25,
  "spd": 5,
  "stun": 97.5,
  "blight": 97.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 73,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "templar_pinch",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "templar_sting",
    "dmgMin": 9,
    "dmgMax": 20,
    "launch": [
     1,
     2
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "templar_slam",
    "dmgMin": 8,
    "dmgMax": 18,
    "launch": [
     1,
     2,
     3
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "darkest_eye",
    "dmgMin": 16,
    "dmgMax": 26,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "templar_ranged_D": {
  "size": 2,
  "type": "eldritch",
  "hp": 105,
  "prot": 0,
  "dodge": 46.25,
  "spd": 6,
  "stun": 97.5,
  "blight": 97.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 48,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "templar_pinch",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "templar_snipe",
    "dmgMin": 12,
    "dmgMax": 17,
    "launch": [
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "templar_aoe",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "templar_ranged_mb_D": {
  "size": 2,
  "type": "eldritch",
  "hp": 105,
  "prot": 0,
  "dodge": 28.75,
  "spd": 6,
  "stun": 97.5,
  "blight": 97.5,
  "bleed": 67.5,
  "debuff": 67.5,
  "move": 98,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 2,
  "skills": [
   {
    "id": "templar_pinch",
    "dmgMin": 8,
    "dmgMax": 17,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": true
   },
   {
    "id": "templar_snipe",
    "dmgMin": 12,
    "dmgMax": 17,
    "launch": [
     3,
     4
    ],
    "hits": [
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "templar_aoe",
    "dmgMin": 5,
    "dmgMax": 8,
    "launch": [
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "darkest_eye",
    "dmgMin": 16,
    "dmgMax": 26,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "totem_attack_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 42,
  "prot": 0,
  "dodge": 18.75,
  "spd": 4,
  "stun": 72.5,
  "blight": 77.5,
  "bleed": 197.5,
  "debuff": 47.5,
  "move": 148,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "totem_maul",
    "dmgMin": 8,
    "dmgMax": 15,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "totem_stun",
    "dmgMin": 4,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   }
  ]
 },
 "totem_guard_D": {
  "size": 1,
  "type": "eldritch",
  "hp": 42,
  "prot": 0,
  "dodge": 13.75,
  "spd": 10,
  "stun": 97.5,
  "blight": 77.5,
  "bleed": 197.5,
  "debuff": 47.5,
  "move": 148,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "totem_guard",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "totem_bolster",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "totem_heal",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "totem_stressblast",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   }
  ]
 },
 "unclean_giant_A": {
  "size": 2,
  "type": "man",
  "hp": 70,
  "prot": 0,
  "dodge": 0,
  "spd": 0,
  "stun": 50,
  "blight": 60,
  "bleed": 20,
  "debuff": 40,
  "move": 75,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "club_smack",
    "dmgMin": 10,
    "dmgMax": 20,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "confusion_spores",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "poison_spores",
    "dmgMin": 1,
    "dmgMax": 1,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "unclean_giant_B": {
  "size": 2,
  "type": "man",
  "hp": 98,
  "prot": 0,
  "dodge": 8.75,
  "spd": 1,
  "stun": 70,
  "blight": 80,
  "bleed": 40,
  "debuff": 60,
  "move": 95,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "club_smack",
    "dmgMin": 14,
    "dmgMax": 27,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "confusion_spores",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "poison_spores",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "unclean_giant_C": {
  "size": 2,
  "type": "man",
  "hp": 137,
  "prot": 0,
  "dodge": 21.25,
  "spd": 2,
  "stun": 90,
  "blight": 100,
  "bleed": 60,
  "debuff": 80,
  "move": 115,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": [
   {
    "id": "club_smack",
    "dmgMin": 19,
    "dmgMax": 37,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2
    ],
    "aoe": false
   },
   {
    "id": "confusion_spores",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": true
   },
   {
    "id": "poison_spores",
    "dmgMin": 2,
    "dmgMax": 2,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   }
  ]
 },
 "virago_hateful_A": {
  "size": 1,
  "type": "man",
  "hp": 28,
  "prot": 0.07,
  "dodge": 25,
  "spd": 8,
  "stun": 200,
  "blight": 100,
  "bleed": 40,
  "debuff": 70,
  "move": 30,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "ruinous_hex",
    "dmgMin": 2,
    "dmgMax": 4,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "putrefying_breath",
    "dmgMin": 3,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "from_death_comes_life",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "virago_hateful_B": {
  "size": 1,
  "type": "man",
  "hp": 39,
  "prot": 0.07,
  "dodge": 33.75,
  "spd": 9,
  "stun": 220,
  "blight": 120,
  "bleed": 60,
  "debuff": 90,
  "move": 50,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "ruinous_hex",
    "dmgMin": 3,
    "dmgMax": 5,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "putrefying_breath",
    "dmgMin": 5,
    "dmgMax": 9,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "from_death_comes_life",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "virago_hateful_C": {
  "size": 1,
  "type": "man",
  "hp": 55,
  "prot": 0.07,
  "dodge": 46.25,
  "spd": 10,
  "stun": 240,
  "blight": 140,
  "bleed": 80,
  "debuff": 110,
  "move": 70,
  "corpse": true,
  "punishesMark": false,
  "marksHeroes": true,
  "turns": 1,
  "skills": [
   {
    "id": "ruinous_hex",
    "dmgMin": 4,
    "dmgMax": 7,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3,
     4
    ],
    "aoe": false
   },
   {
    "id": "putrefying_breath",
    "dmgMin": 6,
    "dmgMax": 13,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [
     1,
     2,
     3
    ],
    "aoe": false
   },
   {
    "id": "from_death_comes_life",
    "dmgMin": 0,
    "dmgMax": 0,
    "launch": [
     1,
     2,
     3,
     4
    ],
    "hits": [],
    "aoe": false
   }
  ]
 },
 "virago_shroom_A": {
  "size": 1,
  "type": "eldritch",
  "hp": 16,
  "prot": 0,
  "dodge": 0,
  "spd": 1,
  "stun": 200,
  "blight": 40,
  "bleed": 40,
  "debuff": 100,
  "move": 120,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "virago_shroom_B": {
  "size": 1,
  "type": "eldritch",
  "hp": 22,
  "prot": 0,
  "dodge": 0,
  "spd": 2,
  "stun": 220,
  "blight": 60,
  "bleed": 60,
  "debuff": 120,
  "move": 120,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 },
 "virago_shroom_C": {
  "size": 1,
  "type": "eldritch",
  "hp": 31,
  "prot": 0,
  "dodge": 0,
  "spd": 3,
  "stun": 240,
  "blight": 80,
  "bleed": 80,
  "debuff": 140,
  "move": 120,
  "corpse": false,
  "punishesMark": false,
  "marksHeroes": false,
  "turns": 1,
  "skills": []
 }
};
