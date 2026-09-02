/**
 * Effects for modded heroes - skills, camp skills and class trinkets.
 *
 * The generated stores (`skillEffects.js`, `trinketEffects.js`) are built from
 * the base-game install and only cover the 20 vanilla classes plus DLC. The
 * import scripts never see a Steam Workshop mod, and their coverage tests pin
 * the generated files to the vanilla roster - so modded content cannot live
 * there. This file is the hand-authored companion: same shapes, keyed the same
 * way, merged in by the `getSkillEffect` / `getTrinketEffect` wrappers below so
 * callers get one lookup that covers both.
 *
 * Combat entries are keyed by class then skill name; camp and trinket entries
 * by name alone. Numbers are the max-level (rank 5) values, derived from the
 * mod's own `.info.darkest`, `*.effects.darkest`, `*.buffs.json`,
 * `*.camping_skills.json` and English string tables - the same sources the
 * game reads to draw the tooltip.
 *
 * `moddedEffects.test.js` pins each covered class against `modded_heroes.js`.
 */

import { TRINKET_SETS, getSetBonus as vanillaSetBonus } from './trinketEffects';

// ===== Sibyl (Workshop 3490076588) =====
// A stance class: Alignment cycles Moon -> Eclipse -> Sun, and most skills read
// or gate on the current stance.

const SIBYL_COMBAT = {
  "Alignment":         { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: cycle stance Moon → Eclipse → Sun | Does not end turn (1 per turn) | Into Eclipse: Self +15 DODGE, +4 SPD (4 rds) | Into Sun: Party Heal 2/turn (2 rds), Torch +12" },
  "Moonlight Touch":   { type: "Heal", launch: "3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Moon stance only | Heal 3 | Heal 3/turn (2 rds) | Cure Blight | +50% Restoration if target Blighted" },
  "Moonlight Embrace": { type: "Heal", launch: "2·3·4", target: "party", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Moon / Eclipse stance | 3 uses per battle | Party: -8% CRIT Received (3 rds) | As Moon: Party Heal 3 | As Eclipse: Party +10 ACC, -20% Stress Received (3 rds)" },
  "Banish":            { type: "Melee", launch: "1·2·3·4", target: "1·2", dmg: "-100%", acc: "110%", crit: "+0%", effect: "Moon / Eclipse stance | Self: Retreat 1, Stealth (3 rds), +25% PROT while Stealthed | Target cannot CRIT (3 rds) | As Moon: Stun (140% base) | As Eclipse: Blight 5/turn (3 rds)" },
  "Faerie Fire":       { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "+0%", acc: "115%", crit: "+10%", effect: "Eclipse / Sun stance | Ignores and removes Stealth | Torch +8 | +100% Burn vs Stealthed target | As Eclipse: Burn 5 (irresistible) | As Sun: Burn 8 (irresistible), Party Blight 2/turn (2 rds)" },
  "Solar Ray":         { type: "Ranged", launch: "3·4", target: "2·3", dmg: "+200%", acc: "105%", crit: "+5%", effect: "Sun stance only | -50% DMG from ranks 1-2 | Self: +35% DMG if Blighted, +15% DMG if Burning | Party Blight 2/turn (2 rds)" },
  "Solar Flare":       { type: "Ranged", launch: "1·2", target: "1·2·3·4", aoe: true, dmg: "-100%", acc: "120%", crit: "+0%", effect: "Sun stance only | Blight 6/turn (3 rds) | Destroys corpses | +50% Blight vs Stealthed target | Party Blight 2/turn (2 rds)" },
};

const SIBYL_CAMP = {
  "Midnight Stroll":   { cost: 2, effect: "Self: -10 Stress | Self: +10% Scouting Chance" },
  "In Her Radiance":   { cost: 2, effect: "Party (non-religious): +10% Healing Received | Party (religious): -10% Healing Received" },
  "Garden Harvest":    { cost: 4, effect: "Produce 4-8 Food | Produce 2-4 Medicinal Herbs | Produce 0-2 Antivenom" },
  "Panacea":           { cost: 4, effect: "Remove Disease | Remove Bleed | Remove Blight | Remove Death's Door recovery debuffs | +10% Healing Received" },
};

const SIBYL_TRINKETS = {
  "Petal Pouch":          { rarity: "Common", effect: "+1 Healing | -4% CRIT" },
  "Rotweed Bouquet":      { rarity: "Uncommon", effect: "-10% MAX HP | On Attack: Target -20% Blight Resist and +10% DMG Taken while Blighted (3 rds)" },
  "Protective Veil":      { rarity: "Uncommon", effect: "+10 DODGE (not in Sun stance) | +20% PROT (not in Sun stance)" },
  "Sun-scorched Petals":  { rarity: "Rare", effect: "+15% DMG | +6% CRIT | +25% DMG Taken while in Moon stance" },
  "Lunar Veil":           { rarity: "Very Rare", effect: "-33% DMG | On support skill: Party +10% Healing Received (3 rds) | When Hit: 67% chance to Stealth (1 rd)" },
  "Sun-bleached Hairlock":{ rarity: "CC Set", effect: "+2 Healing | +50% Restoration duration if target Blighted | +5% DMG Taken per 10 Light below 100 | On Attack: Light -12" },
  "Bloody Soil":          { rarity: "CC Set", effect: "+66% DMG while Bleeding | -25% Blight Chance | -18% Death Blow Resist | On Attack: cure own Bleed" },
  "Bottled Twilight":     { rarity: "Crystalline", effect: "+2 SPD (Light above 24) | +2 SPD (Light below 76) | Always CRIT vs Stealthed target | -33% DMG vs non-Stealthed target | On Attack: Stealth (2 rds)" },
};

// Set bonus: applies only with both members equipped. Same shape as the
// generated TRINKET_SETS. cc_sibyl_ms grants dodge that scales with stance.
const SIBYL_SETS = {
  cc_sibyl_ms: {
    label: 'Crimson Court Set',
    members: ['Sun-bleached Hairlock', 'Bloody Soil'],
    bonus: '+15 DODGE in Eclipse stance | +25 DODGE in Sun stance',
  },
};

export const MODDED_COMBAT_SKILL_EFFECTS = {
  Sibyl: SIBYL_COMBAT,
};

export const MODDED_TRINKET_SETS = {
  ...SIBYL_SETS,
};

export const MODDED_CAMP_SKILL_EFFECTS = {
  ...SIBYL_CAMP,
};

export const MODDED_TRINKET_EFFECTS = {
  ...SIBYL_TRINKETS,
};

export function getModdedSkillEffect(name, heroClass) {
  if (!name) return null;
  const byClass = heroClass && MODDED_COMBAT_SKILL_EFFECTS[heroClass];
  if (byClass && byClass[name]) return { kind: 'combat', ...byClass[name] };
  if (MODDED_CAMP_SKILL_EFFECTS[name]) return { kind: 'camp', ...MODDED_CAMP_SKILL_EFFECTS[name] };
  return null;
}

export function getModdedTrinketEffect(name) {
  if (!name) return null;
  return MODDED_TRINKET_EFFECTS[name] || null;
}

const ALL_SETS = { ...TRINKET_SETS, ...MODDED_TRINKET_SETS };
const TRINKET_TO_SET = {};
for (const [id, set] of Object.entries(ALL_SETS)) {
  for (const m of set.members) TRINKET_TO_SET[m] = { id, ...set };
}

/**
 * The set a single trinket belongs to (vanilla or modded), or null.
 * @param {string} name - Exact trinket name.
 */
export function getTrinketSet(name) {
  return (name && TRINKET_TO_SET[name]) || null;
}

/**
 * The set bonus for a pair of equipped trinkets, with `active` true only when
 * both members of the set are the two equipped. Falls through to the generated
 * vanilla lookup, then the modded sets. Null when neither trinket is in a set.
 * @param {string} a - First equipped trinket name.
 * @param {string} b - Second equipped trinket name.
 * @returns {{ id: string, label: string, members: string[], bonus: string, active: boolean }|null}
 */
export function getSetBonus(a, b) {
  const vanilla = vanillaSetBonus(a, b);
  if (vanilla) return vanilla;
  const set = getTrinketSet(a) || getTrinketSet(b);
  if (!set) return null;
  const active = set.members.includes(a) && set.members.includes(b) && a !== b;
  return { ...set, active };
}
