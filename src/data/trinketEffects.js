/**
 * Trinket effects - what each trinket actually does.
 *
 * Keyed by exact trinket name, matching the name strings in
 * `hero_specific_trinkets.js`, `trinkets.js` and `backer_trinkets.js`.
 * The roster lives in those files; this one only answers "what does it do?".
 *
 * GENERATED - do not hand-edit. `scripts/importTrinketEffects.js` rebuilds it
 * from the game's own tables: which buffs a trinket grants, what each buff
 * does, and the English tooltip templates - the same three sources the game
 * reads to draw a trinket tooltip. Clauses are separated by " | " and kept in
 * the order the game lists them.
 *
 * Butcher's Circus is the exception: its entries file ships encrypted, so those
 * 99 trinkets come from a wiki CSV export passed with --csv, or are
 * carried over from the previous file when it is omitted.
 *
 * `TRINKET_SETS` at the bottom is the Crimson Court / Shieldbreaker / Fire's
 * Edge set bonuses: the extra effect that applies only when both member
 * trinkets are equipped on the same hero.
 *
 * `rarity` is the in-game tier or set, or `null` for the Runaway's Sunstone
 * chain, which transforms rather than dropping at a tier.
 *
 * `limit` is how many copies the game lets you hold at once, straight from
 * `.entries.trinkets.json`. **Absent means no limit.** It is 1 for the unique
 * ones -- ancestral, trophy, crystalline, Shrieker, Crimson Court, Thing,
 * Ringmaster, the Collector's heads, the backer trinkets and eleven very rares
 * -- 2 for the Rat Carcass and 3 for the Ancestor's Musket Ball. This is a
 * property of the trinket and not of its tier: eleven `Very Rare` entries are
 * unique and twenty-nine are not, so the rarity cannot stand in for it.
 *
 * Coverage is the whole roster - hero-specific, generic and backer - minus a
 * handful the game ships with no buffs at all; those have no entry, so the
 * tooltip falls back to the name. `trinketEffects.test.js` pins both
 * directions, so adding a trinket without its effect fails the suite.
 */

export const TRINKET_EFFECTS = {
  // ===== Abomination =====
  "Lock of Patience":         { rarity: "Common", effect: "+10% Virtue Chance" },
  "Padlock of Transference":  { rarity: "Uncommon", effect: "+20% Stun Skill Chance | +20% Blight Skill Chance" },
  "Protective Padlock":       { rarity: "Uncommon", effect: "+15% PROT | -1 SPD" },
  "Lock of Fury":             { rarity: "Rare", effect: "+10% DMG | +3 SPD | -10% MAX HP" },
  "Restraining Padlock":      { rarity: "Very Rare", effect: "Transform: -40% Stress Inflicted On Party | -40% On Transformation Stress" },
  "Shameful Shroud":          { rarity: "CC Set", limit: 1, effect: "-15% Stress | +10 DODGE" },
  "Osmond Chains":            { rarity: "CC Set", limit: 1, effect: "+20% DMG Ranged Skills | +8% CRIT Ranged Skills" },
  "Broken Key":               { rarity: "Crystalline", limit: 1, effect: "+15 ACC | +35% Stun Skill Chance | +10% Stress" },

  // ===== Antiquarian =====
  "Bag of Marbles":         { rarity: "Common", effect: "+10 DODGE" },
  "Bloodcourse Medallion":  { rarity: "Uncommon", effect: "+33% Healing Received" },
  "Carapace Idol":          { rarity: "Uncommon", effect: "+25% PROT" },
  "Fleet Florin":           { rarity: "Rare", effect: "+4 SPD | +20% Debuff Skill Chance" },
  "Candle of Life":         { rarity: "Very Rare", effect: "+50% Healing Skills | +15% MAX HP" },
  "The Master's Essence":   { rarity: "CC Set", limit: 1, effect: "+50% Healing Skills | +35% Blight Skill Chance | +35% Debuff Skill Chance" },
  "Two of Three":           { rarity: "CC Set", limit: 1, effect: "+50% DMG vs Blighted | +8% CRIT vs Blighted" },
  "Smoking Skull":          { rarity: "Crystalline", limit: 1, effect: "+35 DODGE if Shard Dust in inventory | -15 ACC" },

  // ===== Arbalest =====
  "Sturdy Greaves":      { rarity: "Common", effect: "+30% Move Resist | +30% Move Skill Chance | -1 SPD" },
  "Vengeful Greaves":    { rarity: "Common", effect: "+3% CRIT" },
  "Medic's Greaves":     { rarity: "Uncommon", effect: "+33% Healing Skills" },
  "Bull's Eye Bandana":  { rarity: "Rare", effect: "+8 ACC | +5% CRIT | -4 DODGE" },
  "Wrathful Bandana":    { rarity: "Very Rare", effect: "+25% DMG if in position 4 | +30% Debuff Skill Chance | -50% Healing Skills" },
  "Childhood Treasure":  { rarity: "CC Set", limit: 1, effect: "+30% Healing Skills | +20% Healing Skills while Camping | -15% Stress" },
  "Bedtime Story":       { rarity: "CC Set", limit: 1, effect: "+15 ACC vs Marked | +8% CRIT vs Marked | +35% Debuff Skill Chance | +35% Move Skill Chance" },
  "Keening Bolts":       { rarity: "Crystalline", limit: 1, effect: "+20% DMG | +7% CRIT Ranged Skills | On Attack: Self: Stress +3 (25% base)" },

  // ===== Bounty Hunter =====
  "Agility Talon":         { rarity: "Common", effect: "+1 SPD | +4 DODGE" },
  "Unmovable Helmet":      { rarity: "Common", effect: "+30% Move Resist | +20% Move Skill Chance" },
  "Camper's Helmet":       { rarity: "Uncommon", effect: "+20% Stress Heal Received while Camping | +10% Scouting Chance" },
  "Hunter's Talon":        { rarity: "Rare", effect: "+6% CRIT | +10 ACC | +50% Food Consumed" },
  "Wounding Helmet":       { rarity: "Very Rare", effect: "+25% DMG Melee Skills | -25% Move Skill Chance | -20% Stun Skill Chance" },
  "Crime Lords' Molars":   { rarity: "CC Set", limit: 1, effect: "+20% DMG vs Marked | +20% DMG vs Stunned | +20% DMG vs Bleeding | -10 DODGE" },
  "Vengeful Kill List":    { rarity: "CC Set", limit: 1, effect: "+50% Move Skill Chance | +35% Bleed Skill Chance | +15 ACC Ranged Skills" },
  "Mask Of The Timeless":  { rarity: "Crystalline", limit: 1, effect: "+2 SPD | +15 DODGE | +5% Stress" },

  // ===== Crusader =====
  "Defender's Seal":       { rarity: "Common", effect: "+5% PROT | -3% CRIT" },
  "Knight's Crest":        { rarity: "Common", effect: "+10% MAX HP" },
  "Swordsman's Crest":     { rarity: "Common", effect: "+10% DMG Melee Skills | -50% Healing Skills" },
  "Paralyzer's Crest":     { rarity: "Uncommon", effect: "+20% Stun Skill Chance | -2 DODGE" },
  "Commander's Orders":    { rarity: "Rare", effect: "+15% Stress Heal Received | +33% Healing Skills | -10% DMG" },
  "Holy Orders":           { rarity: "Very Rare", effect: "+15% Virtue Chance | -20% Stress | +12% Death Blow Resist | -20% Blight Resist | -20% Bleed Resist" },
  "Glittering Spaulders":  { rarity: "CC Set", limit: 1, effect: "+15% PROT | +35% Move Resist | -15% Stress | -2 SPD" },
  "Signed Conscription":   { rarity: "CC Set", limit: 1, effect: "+20% Healing Skills | +20% Stress Skills" },
  "Non Euclidean Hilt":    { rarity: "Crystalline", limit: 1, effect: "+15% MAX HP | On Attack: Random target 5%. | +25% Stun Skill Chance if Holy Water in inventory | On Attack: Blight 2 pts/rd for 2 rds (120% base)" },

  // ===== Flagellant =====
  "Heartburst Hood":        { rarity: "Common", effect: "+4 SPD if HP below 40%" },
  "Resurrection's Collar":  { rarity: "Uncommon", effect: "+33% Healing Skills | -15% Bleed Skill Chance" },
  "Punishment's Hood":      { rarity: "Uncommon", effect: "+20% Bleed Skill Chance | +15% DMG if HP below 40% | -20% Healing Skills" },
  "Suffering's Collar":     { rarity: "Rare", effect: "+20% Bleed Resist if HP below 40% | +20% Blight Resist if HP below 40% | +10% MAX HP" },
  "Eternity's Collar":      { rarity: "Very Rare", effect: "+10% Death Blow Resist | +20 DODGE at Death's Door | +20% DMG if Stress above 85" },
  "Chipped Tooth":          { rarity: "CC Set", limit: 1, effect: "+20% MAX HP | +35% Move Resist" },
  "Shard of Glass":         { rarity: "CC Set", limit: 1, effect: "+35% Bleed Skill Chance | -20% Bleed Resist" },
  "Acidic Husk Ichor":      { rarity: "Crystalline", limit: 1, effect: "-25% MAX HP | +30% DMG | +30% Bleed Skill Chance vs Husk | +25% Healing Received if HP below 20%" },

  // ===== Grave Robber =====
  "Quickening Satchel":       { rarity: "Common", effect: "+2 SPD" },
  "Sickening Satchel":        { rarity: "Common", effect: "+20% DMG vs Blighted" },
  "Blighting Satchel":        { rarity: "Uncommon", effect: "+25% Blight Skill Chance | +1 SPD | -4 DODGE" },
  "Lucky Talisman":           { rarity: "Rare", effect: "+12 DODGE | +10 ACC Ranged Skills | +10% Stress" },
  "Raider's Talisman":        { rarity: "Very Rare", effect: "+5% CRIT | +30% Trap Disarm Chance | +2 SPD | +15% Scouting Chance | -10% MAX HP" },
  "Absinthe":                 { rarity: "CC Set", limit: 1, effect: "+35% Disease Resist | +35% Blight Resist | +35% Blight Skill Chance | -10% MAX HP" },
  "Sharpened Letter Opener":  { rarity: "CC Set", limit: 1, effect: "+25% DMG Melee Skills | +10 ACC Melee Skills | +5 DODGE" },
  "Topshelf Tonic":           { rarity: "Crystalline", limit: 1, effect: "+15 DODGE if Medicinal Herbs in inventory | +3 SPD | -20% Blight Resist | +50% Blight duration when applied" },

  // ===== Hellion =====
  "Bleeding Pendant":      { rarity: "Common", effect: "+15% Bleed Skill Chance" },
  "Selfish Pendant":       { rarity: "Common", effect: "-15% Stress" },
  "Double-Edged Pendant":  { rarity: "Uncommon", effect: "+15% MAX HP | -20% Stun Resist" },
  "Heaven's Hairpin":      { rarity: "Rare", effect: "-25% Stress if Torch above 75 | +10 ACC if Torch above 75" },
  "Hell's Hairpin":        { rarity: "Very Rare", effect: "+10% CRIT if Torch below 25 | +15 ACC if Torch below 25 | -10% Debuff Resist | -10% Bleed Resist" },
  "Lioness Warpaint":      { rarity: "CC Set", limit: 1, effect: "+20% DMG if HP below 75% | +20% DMG if HP below 50% | +20% DMG if HP below 25% | +10% Stress" },
  "Mark of the Outcast":   { rarity: "CC Set", limit: 1, effect: "+2 SPD | +35% Bleed Skill Chance | +15% Death Blow Resist | -15% Healing Received" },
  "Thirsting Blade":       { rarity: "Crystalline", limit: 1, effect: "+15 ACC | -20% Bleed Resist | +2 SPD | +8% CRIT vs Bleeding | On Attack: Self: 5 DMG" },

  // ===== Highwayman =====
  "Drifter's Buckle":       { rarity: "Common", effect: "+10% Trap Disarm Chance | +4 DODGE | -5% Stress Heal Received" },
  "Flashfire Gunpowder":    { rarity: "Common", effect: "+10% DMG Ranged Skills | -20% Stun Resist" },
  "Stalwart Buckle":        { rarity: "Common", effect: "+5% CRIT | +5% Stress | -3% Virtue Chance" },
  "Dodgy Sheath":           { rarity: "Uncommon", effect: "+8 DODGE | +1 SPD | -10 ACC Ranged Skills" },
  "Sharpening Sheath":      { rarity: "Rare", effect: "+7% CRIT Melee Skills | +40% Bleed Skill Chance | -1 SPD" },
  "Gunslinger's Buckle":    { rarity: "Very Rare", effect: "+20% DMG Ranged Skills | +15 ACC Ranged Skills | -10% DMG Melee Skills | -5% CRIT Melee Skills" },
  "Bloodied Neckerchief":   { rarity: "CC Set", limit: 1, effect: "+2 SPD | +10 DODGE" },
  "Shameful Locket":        { rarity: "CC Set", limit: 1, effect: "+10 ACC | +5% CRIT | +15% Stress" },
  "Crystalline Gunpowder":  { rarity: "Crystalline", limit: 1, effect: "+20% DMG | +3 SPD | -15% Stun Resist" },

  // ===== Houndmaster =====
  "Agility Whistle":          { rarity: "Common", effect: "+4 DODGE | +1 SPD | -20% Debuff Resist" },
  "Scouting Whistle":         { rarity: "Common", effect: "+20% Scouting Chance if Torch below 51 | +20% Trap Disarm Chance" },
  "Cudgel Weight":            { rarity: "Uncommon", effect: "+25% Stun Skill Chance | -1 SPD" },
  "Protective Collar":        { rarity: "Rare", effect: "+12 DODGE | -15% DMG" },
  "Spiked Collar":            { rarity: "Very Rare", effect: "+20% DMG | +30% Bleed Skill Chance | -20% Healing Received | -50% Healing Skills" },
  "Evidence of Corruption":   { rarity: "CC Set", limit: 1, effect: "+25% Scouting Chance | -15% Chance Party Surprised | +10% Stress" },
  "Battered Lawman's Badge":  { rarity: "CC Set", limit: 1, effect: "+15 ACC Ranged Skills | +50% Stress Skills while Camping | +25% Healing Skills | -20% Stun Resist | -20% Debuff Resist" },
  "Huskfang Whistle":         { rarity: "Crystalline", limit: 1, effect: "+50% Bleed Skill Chance if Dog Treats in inventory | +40% Stress Skills when Guarding | -10 DODGE | +66% Guard Duration" },

  // ===== Jester =====
  "Bloody Dice":             { rarity: "Common", effect: "+30% Bleed Skill Chance | -10% Bleed Resist" },
  "Lucky Dice":              { rarity: "Common", effect: "+4 ACC | +4 DODGE" },
  "Critical Dice":           { rarity: "Uncommon", effect: "+7% CRIT" },
  "Bright Tambourine":       { rarity: "Rare", effect: "-25% Stress if Torch above 75 | +15% Stress if Torch below 51 | +20% Stress Skills" },
  "Dark Tambourine":         { rarity: "Very Rare", effect: "+12% Death Blow Resist | -25% Stress if Torch below 26 | +10% Virtue Chance if Torch below 26" },
  "Tyrant's Tasting Cup":    { rarity: "CC Set", limit: 1, effect: "+33% Stress Skills | +25% Stress" },
  "Tyrant's Fingerbone":     { rarity: "CC Set", limit: 1, effect: "+3 SPD if in position 1 | +20 DODGE if in position 1" },
  "Dirge For The Devoured":  { rarity: "Crystalline", limit: 1, effect: "+25% Stress Skills | +25% DMG if Laudanum in inventory | +10% Stress" },

  // ===== Leper =====
  "Healing Armlet":           { rarity: "Common", effect: "+20% Healing Received" },
  "Redemption Armlet":        { rarity: "Common", effect: "+15% DMG if in position 1 | -3% Virtue Chance" },
  "Fortunate Armlet":         { rarity: "Uncommon", effect: "+8 ACC | +3% CRIT | +10% Stress" },
  "Immunity Mask":            { rarity: "Rare", effect: "+40% Stun Resist | +30% Blight Resist | +30% Bleed Resist | -10% MAX HP" },
  "Berserk Mask":             { rarity: "Very Rare", effect: "+8% CRIT | +3 SPD | -10% Virtue Chance | -33% Healing Received" },
  "Last Will and Testament":  { rarity: "CC Set", limit: 1, effect: "+15% PROT | +15% MAX HP | -10% Death Blow Resist" },
  "Tin Flute":                { rarity: "CC Set", limit: 1, effect: "-20% Stress | +33% Stress Skills while Camping" },
  "Petrified Amulet":         { rarity: "Crystalline", limit: 1, effect: "+10 ACC if Bandage in inventory | +15% MAX HP | -15% Bleed Resist" },

  // ===== Man-at-Arms =====
  "Cleansing Eyepatch":  { rarity: "Common", effect: "+30% Blight Resist | +20% Disease Resist | -2 DODGE" },
  "Sly Eyepatch":        { rarity: "Common", effect: "+4 DODGE | -10% Stun Resist | -10% Move Resist" },
  "Longevity Eyepatch":  { rarity: "Uncommon", effect: "+15% MAX HP | -2 SPD" },
  "Rampart Shield":      { rarity: "Rare", effect: "+40% Move Skill Chance | +30% Stun Skill Chance | -15% DMG" },
  "Guardian's Shield":   { rarity: "Very Rare", effect: "+10% PROT if in position 4 | +50% Healing Received if in position 4 | +10 DODGE if in position 4" },
  "Old Unit Standard":   { rarity: "CC Set", limit: 1, effect: "+15% Stun Skill Chance | +20% Debuff Skill Chance | +15% Death Blow Resist | +10% Stress" },
  "Toy Soldier":         { rarity: "CC Set", limit: 1, effect: "+10% PROT | +5% CRIT" },
  "Mirror Shield":       { rarity: "Crystalline", limit: 1, effect: "+10 DODGE | 30% Damage Reflection | +20% Stun Resist" },

  // ===== Musketeer =====
  "Sturdy Boots":              { rarity: "Common", effect: "+30% Move Resist | +30% Move Skill Chance | -1 SPD" },
  "Vengeful Boots":            { rarity: "Common", effect: "+3% CRIT" },
  "Medic's Boots":             { rarity: "Uncommon", effect: "+33% Healing Skills" },
  "Bull's Eye Hat":            { rarity: "Rare", effect: "+8 ACC | +5% CRIT | -4 DODGE" },
  "Wrathful Hat":              { rarity: "Very Rare", effect: "+25% DMG if in position 4 | +30% Debuff Skill Chance | -50% Healing Skills" },
  "Second Place Trophy":       { rarity: "CC Set", limit: 1, effect: "+30% Healing Skills | +20% Healing Skills while Camping | -15% Stress" },
  "Silver Musket Ball":        { rarity: "CC Set", limit: 1, effect: "+15 ACC vs Marked | +8% CRIT vs Marked | +35% Debuff Skill Chance | +35% Move Skill Chance" },
  "Icosahedric Musket Balls":  { rarity: "Crystalline", limit: 1, effect: "+20% DMG | On Attack: Random target 20%." },

  // ===== Occultist =====
  "Eldritch Killing Incense":  { rarity: "Common", effect: "+6% CRIT vs Eldritch | +15% DMG vs Eldritch" },
  "Evasion Incense":           { rarity: "Common", effect: "+8 DODGE | -1 SPD" },
  "Cursed Incense":            { rarity: "Uncommon", effect: "+40% Debuff Skill Chance | +20% Move Skill Chance | -10% MAX HP" },
  "Sacrificial Cauldron":      { rarity: "Rare", effect: "+20% DMG | +10% Stress" },
  "Demon's Cauldron":          { rarity: "Very Rare", effect: "+30% Stun Skill Chance | +40% Debuff Skill Chance | +3% CRIT | -10% Virtue Chance | +15% Stress" },
  "Blood Pact":                { rarity: "CC Set", limit: 1, effect: "+4 SPD if Torch below 60 | +25% DMG if Torch below 60 | -25% Bleed Skill Chance | -10% MAX HP" },
  "Vial of Sand":              { rarity: "CC Set", limit: 1, effect: "+20% Stun Skill Chance | +20% Debuff Skill Chance | +20% Move Skill Chance | +20% Stun Resist" },
  "Petrified Skull":           { rarity: "Crystalline", limit: 1, effect: "+40% PROT when attacked by Husk | -20% Healing Received | +30% PROT when attacked by Eldritch | +15% MAX HP" },

  // ===== Plague Doctor =====
  "Diseased Herb":       { rarity: "Common", effect: "+40% Disease Resist" },
  "Rotgut Censer":       { rarity: "Common", effect: "+8 ACC | -5% MAX HP" },
  "Witch's Vial":        { rarity: "Common", effect: "+15% Stun Skill Chance" },
  "Poisoned Herb":       { rarity: "Uncommon", effect: "+40% Blight Skill Chance | -15% MAX HP" },
  "Bloody Herb":         { rarity: "Rare", effect: "+10 ACC Melee Skills | +30% Bleed Skill Chance | +20% DMG Melee Skills" },
  "Blasphemous Vial":    { rarity: "Very Rare", effect: "+10 ACC Ranged Skills | +20% Stun Skill Chance | +20% Blight Skill Chance | +25% Stress" },
  "Subject #40 Notes":   { rarity: "CC Set", limit: 1, effect: "+25% MAX HP | +35% Disease Resist" },
  "Dissection Kit":      { rarity: "CC Set", limit: 1, effect: "+35% Bleed Skill Chance | +25% DMG" },
  "Ashen Distillation":  { rarity: "Crystalline", limit: 1, effect: "+20 DODGE | +25% Blight Skill Chance | +20% Healing Received if Medicinal Herbs in inventory" },

  // ===== Shieldbreaker =====
  "Venomous Vial":       { rarity: "Common", limit: 1, effect: "+30% Blight Skill Chance | -10% Blight Resist" },
  "Shimmering Scale":    { rarity: "Uncommon", limit: 1, effect: "+10% PROT | +5% Stress" },
  "Dancer's Footwraps":  { rarity: "Uncommon", limit: 1, effect: "+40% Move Resist | +2 SPD" },
  "Fanged Spear Tip":    { rarity: "Rare", limit: 1, effect: "+35% DMG vs Marked | -10% DMG" },
  "Cuirboilli":          { rarity: "Very Rare", limit: 1, effect: "+33% MAX HP | -2 SPD" },
  "Obsidian Dagger":     { rarity: "SB Set", limit: 1, effect: "+40% Debuff Skill Chance | +40% Blight Skill Chance" },
  "Severed Hand":        { rarity: "SB Set", limit: 1, effect: "+50% Blight Resist | -10% Stress" },
  "Spectral Speartip":   { rarity: "Crystalline", limit: 1, effect: "+15% DMG | On Attack: Random target 5%. | +20% Blight Skill Chance | +15% MAX HP" },

  // ===== Vestal =====
  "Virtuous Chalice":      { rarity: "Common", effect: "+10% Virtue Chance | -5% MAX HP" },
  "Haste Chalice":         { rarity: "Uncommon", effect: "+8 SPD on First Round | +2 SPD after First Round | -25% Stun Skill Chance" },
  "Youth Chalice":         { rarity: "Uncommon", effect: "+20% MAX HP | -10% DMG" },
  "Profane Scroll":        { rarity: "Rare", effect: "+15% DMG | +10% PROT if in position 2 | +33% Healing Skills if in position 2 | +15% Stress" },
  "Tome of Holy Healing":  { rarity: "Rare", effect: "+25% Healing Skills | -15% MAX HP" },
  "Sacred Scroll":         { rarity: "Very Rare", effect: "-10% Stress | +33% Healing Skills | -10% Stun Skill Chance | -33% DMG" },
  "Atonement Beads":       { rarity: "CC Set", limit: 1, effect: "+15% DMG Melee Skills | +8% CRIT Melee Skills | -15% Virtue Chance" },
  "Salacious Diary":       { rarity: "CC Set", limit: 1, effect: "+33% Stress Skills while Camping | +25% Healing Skills" },
  "Heretical Passage":     { rarity: "Crystalline", limit: 1, effect: "+20% Healing Skills if Holy Water in inventory | +25% DMG vs Husk | +25% DMG vs Eldritch | +10% Stress" },
  "Idol of Purity":        { rarity: "Ringmaster", effect: "+33% Healing Skills | -15% Stress" },
  "Gleaming Breastplate":  { rarity: "Ringmaster", effect: "+15% PROT | +8% Death Blow Resist | Crits Received Chance: -4%" },
  "Purgation Talisman":    { rarity: "Ringmaster", effect: "+25% DMG Melee Skills | +7% CRIT Melee Skills | +12 ACC | +20% Debuff Skill Chance" },
  "Tome of Fury":          { rarity: "Ringmaster", effect: "+15 ACC Ranged Skills | +40% Debuff Skill Chance | +30% Stun/Daze Skill Chance" },

  // ===== ABOMINATION BC =====
  "Shattered Padlock":   { rarity: "Butcher's Circus", effect: "+15% DMG Melee Skills | +15% Move Skill Chance | +3% CRIT | On Melee Attack Hit: Bleed (120% Base) 1 pts/rd for 2 rds" },
  "Spiked Chain":        { rarity: "Butcher's Circus", effect: "+20% DMG Ranged Skills | +10% Stun/Daze Skill Chance | +20% Blight Skill Chance" },
  "Wretch's Cloak":      { rarity: "Butcher's Circus", effect: "+20% Stress Dealt | +10 ACC | +33% Horror Duration" },
  "Taste of Grandeur":   { rarity: "Butcher's Circus", effect: "+10% DMG | +4 ACC | +25% Virtue Chance | On Miss Attack: Self: +8 Stress" },
  "Clasp of the Beast":  { rarity: "Butcher's Circus", effect: "+10% PROT | +10% MAX HP | On Melee Attack Hit: Inflict Stress +5" },

  // ===== ANTIQUARIAN BC =====
  "Black Diamond Mirror":  { rarity: "Butcher's Circus", effect: "+15% MAX HP | +15 DODGE | +10% Stress" },
  "Tears of the Lost":     { rarity: "Butcher's Circus", effect: "+30% Virtue Chance | -15% Stress | +20% Debuff Skill Chance | +33% Restoration Duration" },
  "Ghoul Claw":            { rarity: "Butcher's Circus", effect: "+25% DMG Melee Skills | +6% CRIT Melee Skills | +10 ACC | On Melee Attack Hit: Horror +6 Stress/rd for 2 rds (100% Base)" },
  "Impossible Glyph":      { rarity: "Butcher's Circus", effect: "+20% Stress Dealt | +30% Debuff Skill Chance | +6 ACC" },
  "Materia Pestis":        { rarity: "Butcher's Circus", effect: "+20% Blight Skill Chance | +33% Blight Duration" },

  // ===== ARBALEST BC =====
  "Piercing Quarrel":    { rarity: "Butcher's Circus", effect: "+10% DMG Ranged Skills | +7% CRIT Ranged Skills | Armor Piercing: +20%" },
  "Medic Fullplate":     { rarity: "Butcher's Circus", effect: "+33% Healing Skills | +15% PROT | -15% Stress" },
  "Stabilizing Tiller":  { rarity: "Butcher's Circus", effect: "+15% DMG when acting Last | +12 ACC when acting Last | +15% DMG vs Marked | +5% CRIT vs Marked | Bypass Guard vs Marked" },
  "Weighted Bolas":      { rarity: "Butcher's Circus", effect: "+30% Move Skill Chance | +20% Debuff Skill Chance | +12 ACC" },

  // ===== BOUNTY HUNTER BC =====
  "Bounty Notice":    { rarity: "Butcher's Circus", effect: "+20% DMG vs Marked | +10 ACC vs Marked | +4% CRIT vs Marked" },
  "Grappling Mits":   { rarity: "Butcher's Circus", effect: "+25% Move Skill Chance | +20% Stun/Daze Skill Chance | +8 ACC" },
  "Heart Seeker":     { rarity: "Butcher's Circus", effect: "+25% DMG Melee Skills | +10% Death Blow Dealt Chance" },
  "Infamous Visage":  { rarity: "Butcher's Circus", effect: "+20% DMG vs Afflicted | +10% CRIT vs Afflicted | +5 ACC vs Afflicted | On Melee Attack Hit: Inflict Stress +15" },

  // ===== CRUSADER BC =====
  "Writ of Execution":    { rarity: "Butcher's Circus", effect: "+10% DMG | +8 ACC | +15% Stress Dealt | +10% Death Blow Dealt Chance" },
  "Glorious Standard":    { rarity: "Butcher's Circus", effect: "+33% Healing | +30% Stress Skills | +30% Move Resist | -15% Stress" },
  "Sacred Blade":         { rarity: "Butcher's Circus", effect: "+15% DMG Melee Skills | +20% Stun/Daze Skill Chance | +30% Virtue Chance" },
  "Battle Scarred Helm":  { rarity: "Butcher's Circus", effect: "+5% PROT | +15% MAX HP | +8% Death Blow Resist" },

  // ===== FLAGELLANT BC =====
  "Confessor Gauntlet":      { rarity: "Butcher's Circus", effect: "+20% DMG vs Bleeding | +15% CRIT vs Bleeding | +6 ACC" },
  "Crown of Thorns":         { rarity: "Butcher's Circus", effect: "+15 ACC | +15% DMG while Bleeding | +15% DMG Taken while Bleeding | On Melee Attack: Self: Bleed (50% Base) 2 pts/rd for 3 rds" },
  "Madman Collar":           { rarity: "Butcher's Circus", effect: "+10% Healing Received | +30% Bleed Skill Chance if Afflicted | +25% DMG if Afflicted | +20% Stress | +100% Heart Attack Stress Heal" },
  "Gauntlet of Absolution":  { rarity: "Butcher's Circus", effect: "+33% Healing Skills | +10% PROT | On Being Hit: Self: -10 Stress" },
  "Last Breath Collar":      { rarity: "Butcher's Circus", effect: "+12% Death Blow Resist | +20 DODGE at Death's Door" },

  // ===== GRAVE ROBBER BC =====
  "Well Balanced Stiletto":   { rarity: "Butcher's Circus", effect: "+15% DMG | On Melee Attack Hit: Self Buff: +20% DMG Ranged Skills | On Melee Attack Hit: Self Buff: +6% Crit Ranged Skills | On Ranged Attack Hit: Self Buff: +15 ACC Melee Skills | On Ranged Attack Hit: Self Buff: +20% Death Blow Dealt Chance Melee Skills" },
  "Cloak and Dagger":         { rarity: "Butcher's Circus", effect: "+15% DMG Melee Skills | +10% Death Blow Dealt Chance Melee Skills | +20 DODGE while Stealthed | Bypass Guard while Stealthed" },
  "Leather Bandolier":        { rarity: "Butcher's Circus", effect: "+10% DMG Ranged Skills | +8 DODGE | +5% CRIT" },
  "Satchel of Dirty Tricks":  { rarity: "Butcher's Circus", effect: "+10 DODGE | +4 ACC | +20% Blight Skill Chance | +10% Stress Dealt" },

  // ===== HELLION BC =====
  "Razor Pin":            { rarity: "Butcher's Circus", effect: "+10 ACC | +20% Bleed Skill Chance" },
  "Bone Vest":            { rarity: "Butcher's Circus", effect: "+15% PROT | +8% Death Blow Resist | +20% Stress Dealt | +10% Stress" },
  "Savage Gauntlets":     { rarity: "Butcher's Circus", effect: "+8 ACC | +5% CRIT | +25% DMG if Afflicted | +15% Stress" },
  "Executioner Halberd":  { rarity: "Butcher's Circus", effect: "+15% DMG | +3% CRIT | +10% Death Blow Dealt Chance" },

  // ===== HIGHWAYMAN BC =====
  "Grim Bandana":      { rarity: "Butcher's Circus", effect: "+10% DMG | +3% CRIT | +20% Stress Dealt | +10% Stress" },
  "Parrying Dagger":   { rarity: "Butcher's Circus", effect: "+10% DMG Melee Skills | +5 ACC Melee Skills | +30% Bleed Skill Chance | Riposte: +10% DMG | Riposte: +3% Crit" },
  "Powder Flask":      { rarity: "Butcher's Circus", effect: "+20% DMG Ranged Skills | +15 ACC Ranged Skills | -20% Stun Resist" },
  "Sturdy Buckle":     { rarity: "Butcher's Circus", effect: "+4 DODGE | +15% MAX HP | -10% Stress | +30% Stun Resist" },
  "Duelist's Pistol":  { rarity: "Butcher's Circus", effect: "+10% DMG Ranged Skills | +5% CRIT | +30% Move Resist | +10 ACC if in Position 1" },

  // ===== HOUNDMASTER BC =====
  "Attack Whistle":    { rarity: "Butcher's Circus", effect: "+20% Debuff Skill Chance | +12 ACC" },
  "Tattered Chewtoy":  { rarity: "Butcher's Circus", effect: "-15% Stress | +50% Stress Relief Skills when Guarding | +15% Healing Received | +33% Restoration Duration" },
  "Padded Armguard":   { rarity: "Butcher's Circus", effect: "+15% PROT when Guarding | +12 DODGE | +33% Guard Duration" },
  "Training Whistle":  { rarity: "Butcher's Circus", effect: "+15% DMG vs Marked | +15% DMG Ranged Skills | +8% CRIT Ranged Skills" },

  // ===== JESTER BC =====
  "Reaper Shroud":     { rarity: "Butcher's Circus", effect: "+15% DMG | +3% CRIT | +20 ACC vs HP below 35%" },
  "Well Tuned Lute":   { rarity: "Butcher's Circus", effect: "+30% Stress Skills | -20% Stress" },
  "Blood-red Coin":    { rarity: "Butcher's Circus", effect: "+20% Bleed Skill Chance | +25% DMG vs Bleeding | +10 ACC vs Bleeding" },
  "Harlequin Masque":  { rarity: "Butcher's Circus", effect: "+20% MAX HP | On Melee Attack Hit: Self: -10 Stress" },

  // ===== LEPER BC =====
  "Gladiator Mask":     { rarity: "Butcher's Circus", effect: "+15% DMG | +3% CRIT" },
  "Durable Armlet":     { rarity: "Butcher's Circus", effect: "+10% MAX HP | +12 ACC" },
  "Invigorating Balm":  { rarity: "Butcher's Circus", effect: "+20% Healing Received | +20% Bleed Resist | +20% Blight Resist | +8% Death Blow Resist" },
  "Sharpening Stone":   { rarity: "Butcher's Circus", effect: "+6% CRIT | On Melee Attack Hit: Bleed (120% Base) 1 pts/rd for 3 rds" },

  // ===== MAN AT ARMS BC =====
  "Insignia of Rank":   { rarity: "Butcher's Circus", effect: "+12 ACC | +3% CRIT | +20% Debuff Skill Chance | On Attack Crit: Party Buff: +8 ACC (100% Base)" },
  "Protector's Kite":   { rarity: "Butcher's Circus", effect: "+5% PROT | +15% MAX HP | +33% Guard Duration" },
  "Survivor Eyepatch":  { rarity: "Butcher's Circus", effect: "+12 DODGE | +20% Blight Resist | +15% Healing Received when Guarding" },
  "Veteran Gauntlet":   { rarity: "Butcher's Circus", effect: "+20% DMG Melee Skills | +30% Stun/Daze Skill Chance | +20% Move Skill Chance | On Melee Attack Hit: Daze (50% base) for 1 rds" },
  "Shield Spike":       { rarity: "Butcher's Circus", effect: "Riposte: +25% DMG | Riposte: +10 ACC | Riposte: +8% Crit | On Riposte Hit: Bleed (100% Base) 1 pts/rd for 4 rds" },

  // ===== MUSKETEER BC =====
  "Minié Ball":          { rarity: "Butcher's Circus", effect: "+10% DMG Ranged Skills | +7% CRIT Ranged Skills | Armor Piercing: +20%" },
  "Tincture of Iodine":  { rarity: "Butcher's Circus", effect: "+33% Healing Skills | -15% Stress | On Heal: Cure Blight | On Heal: +25% Blight Resist (2 rds)" },
  "Iron Sights":         { rarity: "Butcher's Circus", effect: "+15% DMG when acting Last | +12 ACC when acting Last | +15% DMG vs Marked | +5% CRIT vs Marked | Bypass Guard vs Marked" },
  "Buckshot Cartridge":  { rarity: "Butcher's Circus", effect: "+30% Move Skill Chance | +20% Debuff Skill Chance | +12 ACC" },

  // ===== OCCULTIST BC =====
  "Fleshbound Grimoire":  { rarity: "Butcher's Circus", effect: "+15 ACC Ranged Skills | +20% Move Skill Chance | +33% Horror duration" },
  "Calling Salts":        { rarity: "Butcher's Circus", effect: "+15% DMG Ranged Skills | +4% CRIT Ranged Skills | +15% DMG vs Marked | +10 ACC vs Marked" },
  "Hand of Glory":        { rarity: "Butcher's Circus", effect: "+20% Stress Dealt | +30% Debuff Skill Chance" },
  "Bleeding Skull":       { rarity: "Butcher's Circus", effect: "+15% MAX HP | +4 additional HP Healed Duration | On Heal Debuff Target: -10% Death Blow Resist" },
  "Sacrificial Kris":     { rarity: "Butcher's Circus", effect: "+20% DMG Melee Skills | +10 ACC Melee Skills | +25% Stress Dealt vs vs Marked | +10% Death Blow Dealt Chance vs Marked | On Melee Attack Hit: Mark Target" },

  // ===== PLAGUE DOCTOR BC =====
  "Volatile Concoction":  { rarity: "Butcher's Circus", effect: "+20% Blight Skill Chance | +15 ACC" },
  "Hazard Mask":          { rarity: "Butcher's Circus", effect: "+8 ACC | +15% MAX HP | +15% Healing Received | +20% Blight Resist" },
  "Acrid Vial":           { rarity: "Butcher's Circus", effect: "+20% Stress Dealt | +20% Debuff Skill Chance | +30% Move Skill Chance" },
  "Amputation Saw":       { rarity: "Butcher's Circus", effect: "+30% DMG Melee Skills | +30% Bleed Skill Chance | +10 ACC vs Bleeding" },

  // ===== SHIELDBREAKER BC =====
  "Graceful Anklet":  { rarity: "Butcher's Circus", effect: "+15 DODGE | +4 ACC" },
  "Viper Spear Tip":  { rarity: "Butcher's Circus", effect: "+10 ACC | +20% Blight Skill Chance" },
  "Scaled Shoulder":  { rarity: "Butcher's Circus", effect: "+5% PROT | +10% MAX HP | +12% Death Blow Resist" },
  "Fang Talisman":    { rarity: "Butcher's Circus", effect: "+15% DMG | +3% CRIT | +10% DMG vs Blighted" },

  // ===== Duelist =====
  "Steel-tip Boots":    { rarity: "Common", effect: "+10% Stun Skill Chance | +4% CRIT if in mode Aggressive" },
  "Blade Oil":          { rarity: "Uncommon", effect: "+4% CRIT Melee Skills | On Monster Kill: Self: Next Riposte: +100% CRIT (4 rds)" },
  "Gilded Mantle":      { rarity: "Uncommon", effect: "Crits Received Chance: -6% | Crits Received Chance: -6% while Marked | +10 DODGE while Marked" },
  "Razor Hilt":         { rarity: "Rare", effect: "Armor Piercing: +100% vs Bleeding | -20% Bleed Resist | On Riposte: Bleed 2 pts/rd for 2 rds (130% base) | On Riposte: Crits Received Chance: +7% (3 rds)" },
  "Champion's Mantle":  { rarity: "Very Rare", effect: "+20% DMG if in position 2 | +20% DMG if in position 4 | -10 DODGE if in position 1 | -10 DODGE if in position 3 | On Attack: Self: Riposte (2 rds)" },
  "Académie Ring":      { rarity: "Set", limit: 1, effect: "+35% Debuff Skill Chance | Riposte: +8% CRIT | On Attack: Self: -10 DODGE (4 rds) | On Friendly Skill: Self: +10 ACC (2 rds)" },
  "Lover's Glove":      { rarity: "Set", limit: 1, effect: "+10 ACC if in mode Aggressive | On Attack: Self: Stress +7 | On Monster Kill: Other Heroes: +7 ACC (3 rds), +3 SPD (3 rds)" },
  "Phantom Wit":        { rarity: "Very Rare", limit: 1, effect: "+50% DMG if HP above 99% | +25% Bleed Resist | +25% Blight Resist | -33% MAX HP | On Riposte CRIT: Self: Heal 10% MAX HP | On Riposte Kill: Self: Heal 25% MAX HP" },

  // ===== Runaway =====
  "Warm Scarf":          { rarity: "Common", effect: "+10 DODGE | On Dodge: Shuffle target" },
  "Pyro Accelerant":     { rarity: "Uncommon", effect: "On Attack: Enemies: -6% CRIT while Burning (3 rds), Crits Received Chance: +6% while Burning (3 rds) | On Attack: Self: Burn 2 pts/rd" },
  "Charcoal Effigy":     { rarity: "Uncommon", effect: "When Hit: Self: Heal 3" },
  "Rescuer's Rucksack":  { rarity: "Rare", effect: "+20% MAX HP | -10% CRIT | -50% Restoration Duration Received | On Friendly Skill: Other Heroes: Restoration 3 pts/rd for 1 rd" },
  "Infernal Coalstone":  { rarity: "Very Rare", effect: "+3 SPD while Any Character is Burning | Wildfire applies to both adjacent targets | On Attack: Knockback 1 (130% base) if target in rank 1 | On Attack: Pull 1 (130% base) if target in rank 4" },
  "Carved Toy":          { rarity: "Set", limit: 1, effect: "+15 ACC while Stealthed | +12% CRIT vs Burning | -15% Stun Resist | -15% Bleed Resist" },
  "Knitted Blanket":     { rarity: "Set", limit: 1, effect: "+25% PROT | +25% Healing Received | When Hit: Self: Burn 2 pts/rd" },
  "Inert Sunstone":      { rarity: null, limit: 1, effect: "-2 SPD | Transforms into Heated Sunstone" },
  "Heated Sunstone":     { rarity: null, limit: 1, effect: "+1 SPD | Transforms into Scorching Sunstone" },
  "Scorching Sunstone":  { rarity: null, limit: 1, effect: "+2 SPD | +33% Burn Skill Amount | Transforms into Searing Sunstone" },
  "Searing Sunstone":    { rarity: null, limit: 1, effect: "+4 SPD | +50% Burn Skill Amount | On Attack: Self: Burn 1 pts/rd (75% base) | Final form - perilous to bear" },

  // ===== Generic trinkets =====
  "Accuracy Stone":               { rarity: "Very Common", effect: "+4 ACC | -1 SPD" },
  "Bleed Charm":                  { rarity: "Very Common", effect: "+20% Bleed Resist | -2 DODGE" },
  "Bleed Stone":                  { rarity: "Very Common", effect: "+15% Bleed Skill Chance | -1 SPD" },
  "Blight Charm":                 { rarity: "Very Common", effect: "+20% Blight Resist | -2 DODGE" },
  "Blight Stone":                 { rarity: "Very Common", effect: "+15% Blight Skill Chance | -1 SPD" },
  "Critical Stone":               { rarity: "Very Common", effect: "+3% CRIT | -1 SPD" },
  "Debuff Charm":                 { rarity: "Very Common", effect: "+20% Debuff Resist | -2 DODGE" },
  "Debuff Stone":                 { rarity: "Very Common", effect: "+15% Debuff Skill Chance | -1 SPD" },
  "Disease Charm":                { rarity: "Very Common", effect: "+20% Disease Resist | -2 DODGE" },
  "Dodge Stone":                  { rarity: "Very Common", effect: "+4 DODGE | -1 SPD" },
  "Health Stone":                 { rarity: "Very Common", effect: "+10% MAX HP | -1 SPD" },
  "Move Charm":                   { rarity: "Very Common", effect: "+20% Move Resist | -1 SPD" },
  "Move Stone":                   { rarity: "Very Common", effect: "+15% Move Skill Chance | -1 SPD" },
  "Protection Stone":             { rarity: "Very Common", effect: "+5% PROT | -1 SPD" },
  "Stun Charm":                   { rarity: "Very Common", effect: "+20% Stun Resist | -2 DODGE" },
  "Stun Stone":                   { rarity: "Very Common", effect: "+10% Stun Skill Chance | -1 SPD" },
  "Archer's Ring":                { rarity: "Common", effect: "+5 ACC Ranged Skills | -1 SPD" },
  "Bloodied Fetish":              { rarity: "Common", effect: "+20% Blight Resist | +20% Bleed Resist | -20% Disease Resist" },
  "Book of Intuition":            { rarity: "Common", effect: "-20% Chance Party Surprised | -1 SPD" },
  "Caution Cloak":                { rarity: "Common", effect: "+10% Scouting Chance | -10 SPD on First Round" },
  "Damage Stone":                 { rarity: "Common", effect: "+10% DMG | -4 DODGE" },
  "Dazzling Charm":               { rarity: "Common", effect: "+10% Stun Skill Chance" },
  "Deteriorating Bracer":         { rarity: "Common", effect: "+10 DODGE if HP above 75% | -6 DODGE if HP below 50%" },
  "Reckless Charm":               { rarity: "Common", effect: "+5 ACC | -2 DODGE" },
  "Slippery Boots":               { rarity: "Common", effect: "+4 DODGE | -20% Move Resist" },
  "Snake Oil":                    { rarity: "Common", effect: "-10% Stress" },
  "Speed Stone":                  { rarity: "Common", effect: "+1 SPD" },
  "Survival Guide":               { rarity: "Common", effect: "+10% Scouting Chance | +10% Trap Disarm Chance | -1 SPD" },
  "Warrior's Bracer":             { rarity: "Common", effect: "+10% DMG Melee Skills | -4 DODGE" },
  "Warrior's Cap":                { rarity: "Common", effect: "+5 ACC Melee Skills" },
  "Bleed Amulet":                 { rarity: "Uncommon", effect: "+20% Bleed Skill Chance | +20% Bleed Resist | -20% Blight Resist" },
  "Blight Amulet":                { rarity: "Uncommon", effect: "+20% Blight Skill Chance | +20% Blight Resist | -20% Bleed Resist" },
  "Blood Charm":                  { rarity: "Uncommon", effect: "+30% Bleed Resist" },
  "Bloodthirst Ring":             { rarity: "Uncommon", effect: "-100% Food Consumed | +10% MAX HP | -25% Healing Received" },
  "Book of Constitution":         { rarity: "Uncommon", effect: "+30% Blight Resist | +30% Disease Resist | -1 SPD" },
  "Book of Holiness":             { rarity: "Uncommon", effect: "-20% Stress | -10% Death Blow Resist" },
  "Book of Rage":                 { rarity: "Uncommon", effect: "+20% DMG if HP below 33% | +8% CRIT if HP below 33% | -10% Bleed Resist | -10% Blight Resist" },
  "Book of Relaxation":           { rarity: "Uncommon", effect: "-10% Stress | +4 ACC | -4 DODGE" },
  "Calming Crystal":              { rarity: "Uncommon", effect: "-15% Stress | -1 SPD" },
  "Camouflage Cloak":             { rarity: "Uncommon", effect: "+15 DODGE if Torch above 75 | -20% Stun Resist" },
  "Chirurgeon's Charm":           { rarity: "Uncommon", effect: "+15% Healing Skills" },
  "Dark Bracer":                  { rarity: "Uncommon", effect: "+8% CRIT if Torch below 26 | +5 DODGE if Torch below 51 | -10% DMG if Torch above 51" },
  "Debuff Amulet":                { rarity: "Uncommon", effect: "+30% Debuff Skill Chance | +30% Debuff Resist | -4 DODGE" },
  "Gambler's Charm":              { rarity: "Uncommon", effect: "+15% MAX HP | -10% Death Blow Resist" },
  "Heavy Boots":                  { rarity: "Uncommon", effect: "+40% Move Resist | +20% PROT | -2 SPD" },
  "Life Crystal":                 { rarity: "Uncommon", effect: "+20% MAX HP | -1 SPD" },
  "Move Amulet":                  { rarity: "Uncommon", effect: "+20% Move Skill Chance | +30% Move Resist | -20% Debuff Resist" },
  "Seer Stone":                   { rarity: "Uncommon", effect: "+15% Scouting Chance | -1 SPD" },
  "Shimmering Cloak":             { rarity: "Uncommon", effect: "+8 DODGE | -33% Healing Received" },
  "Solar Bracer":                 { rarity: "Uncommon", effect: "+4% CRIT if Torch above 75 | +5 DODGE if Torch above 75 | -5% CRIT if Torch below 50 | -6 DODGE if Torch below 51" },
  "Steady Bracer":                { rarity: "Uncommon", effect: "+10 ACC Ranged Skills | -2 DODGE" },
  "Stun Amulet":                  { rarity: "Uncommon", effect: "+10% Stun Skill Chance | +20% Stun Resist | -4 DODGE" },
  "Surgical Gloves":              { rarity: "Uncommon", effect: "+8% CRIT Melee Skills | +5 ACC Melee Skills | -20% Move Resist | -10% Debuff Resist" },
  "Swift Cloak":                  { rarity: "Uncommon", effect: "+2 SPD | -20% Move Resist" },
  "Tenacity Ring":                { rarity: "Uncommon", effect: "+10% Death Blow Resist | +5 DODGE | -5% CRIT" },
  "Worrystone":                   { rarity: "Uncommon", effect: "+10% Virtue Chance | -10% Stress | -1 SPD" },
  "Beast Slayer's Ring":          { rarity: "Rare", effect: "+25% DMG vs Beast | -8 DODGE" },
  "Berserk Charm":                { rarity: "Rare", effect: "+3 SPD | +15% DMG | +15% Stress | -5 ACC | -10% Virtue Chance" },
  "Brawler's Gloves":             { rarity: "Rare", effect: "+25% DMG if in position 1 | -5% CRIT | -1 SPD" },
  "Dark Crown":                   { rarity: "Rare", effect: "-25% Stress if Torch below 26 | +15% Virtue Chance if Torch below 26" },
  "Eldritch Slayer's Ring":       { rarity: "Rare", effect: "+25% DMG vs Eldritch | -8 DODGE" },
  "Fasting Seal":                 { rarity: "Rare", effect: "-100% Food Consumed | -100% HP DMG Inflicted When Starving | +5 DODGE | -100% Stress from hunger | -100% Stress from camping meals" },
  "Feather Crystal":              { rarity: "Rare", effect: "+2 SPD | +8 DODGE | -20% Stun Resist | -20% Move Resist" },
  "Man Slayer's Ring":            { rarity: "Rare", effect: "+25% DMG vs Human | -8 DODGE" },
  "Moon Cloak":                   { rarity: "Rare", effect: "+15% PROT if Torch below 26 | +10 DODGE if Torch below 26 | +10% Stress" },
  "Moon Ring":                    { rarity: "Rare", effect: "+15% DMG if Torch below 25 | +10 ACC if Torch below 25 | +10% Stress" },
  "Quick Draw Charm":             { rarity: "Rare", effect: "+8 SPD on First Round | +12% CRIT on First Round | -3 SPD after First Round" },
  "Recovery Charm":               { rarity: "Rare", effect: "+40% Healing Received" },
  "Sniper's Ring":                { rarity: "Rare", effect: "+15 ACC if in position 4 | -2 SPD | +4% CRIT if in position 4" },
  "Solar Crown":                  { rarity: "Rare", effect: "-20% Stress if Torch above 75" },
  "Sun Cloak":                    { rarity: "Rare", effect: "+5% PROT if Torch above 75 | +10 DODGE if Torch above 75 | +10% Stress" },
  "Sun Ring":                     { rarity: "Rare", effect: "+10% DMG if Torch above 75 | +5 ACC if Torch above 75 | +10% Stress" },
  "Unholy Slayer's Ring":         { rarity: "Rare", effect: "+25% DMG vs Unholy | -8 DODGE" },
  "Book of Sanity":               { rarity: "Very Rare", effect: "-20% Stress" },
  "Cleansing Crystal":            { rarity: "Very Rare", effect: "+40% Blight Resist | +40% Bleed Resist | +40% Debuff Resist | -15% Blight Skill Chance | -15% Bleed Skill Chance | -15% Debuff Skill Chance" },
  "Ethereal Crucifix":            { rarity: "Very Rare", limit: 1, effect: "+25% DMG vs Eldritch | +30% Bleed Resist | -20% MAX HP" },
  "Focus Ring":                   { rarity: "Very Rare", effect: "+10 ACC | +5% CRIT | -8 DODGE" },
  "Fortifying Garlic":            { rarity: "Very Rare", limit: 1, effect: "+33% Blight Resist | +33% Bleed Resist | +33% Disease Resist" },
  "Hero's Ring":                  { rarity: "Very Rare", effect: "+25% Virtue Chance" },
  "Legendary Bracer":             { rarity: "Very Rare", effect: "+20% DMG | -1 SPD | +10% Stress" },
  "Martyr's Seal":                { rarity: "Very Rare", effect: "+60% DMG at Death's Door | +14% CRIT at Death's Door | +12% Death Blow Resist | +15% MAX HP" },
  "Tough Ring":                   { rarity: "Very Rare", effect: "+10% PROT | +15% MAX HP | -15% DMG | +10% Stress" },
  "Barristan's Head":             { rarity: "Collector", limit: 1, effect: "+25% PROT | +20% Stress" },
  "Dismas' Head":                 { rarity: "Collector", limit: 1, effect: "+25% DMG | -10% MAX HP | +20% Stress" },
  "Junia's Head":                 { rarity: "Collector", limit: 1, effect: "+30% Healing Skills | +20% Stress" },
  "Aria Box":                     { rarity: "Madman", limit: 1, effect: "-25% Stress" },
  "Crescendo Box":                { rarity: "Madman", limit: 1, effect: "+2 SPD | +15% DMG | +10% Stress" },
  "Overture Box":                 { rarity: "Madman", limit: 1, effect: "+15% MAX HP | +8 DODGE | -2 ACC" },
  "The Tempting Goblet":          { rarity: "Courtier", limit: 1, effect: "+20% MAX HP | +3 SPD | +8 DODGE | +25% Stress | -10% Virtue Chance" },
  "Ancestor's Coat":              { rarity: "Ancestral", limit: 1, effect: "+15 DODGE | +10% Stress" },
  "Ancestor's Handkerchief":      { rarity: "Ancestral", limit: 1, effect: "+50% Bleed Resist | +50% Disease Resist | +10% Stress" },
  "Ancestor's Lantern":           { rarity: "Ancestral", limit: 1, effect: "-20% Chance Party Surprised | +20% Chance Monsters Surprised | +10% Stress" },
  "Ancestor's Moustache Cream":   { rarity: "Ancestral", limit: 1, effect: "+50% Blight Resist | +50% Debuff Resist | +10% Stress" },
  "Ancestor's Musket Ball":       { rarity: "Ancestral", limit: 1, effect: "+8% CRIT Ranged Skills | +10% DMG Ranged Skills | +10% Stress" },
  "Ancestor's Pen":               { rarity: "Ancestral", limit: 1, effect: "+8% CRIT Melee Skills | +10% DMG Melee Skills | +10% Stress" },
  "Ancestor's Pistol":            { rarity: "Ancestral", limit: 1, effect: "+15 ACC Ranged Skills | +3 SPD | +10% Stress" },
  "Ancestor's Portrait":          { rarity: "Ancestral", limit: 1, effect: "+50% Resolve XP | +10% Stress" },
  "Ancestor's Signet Ring":       { rarity: "Ancestral", limit: 1, effect: "+10 ACC | +10% PROT | +10% Stress" },
  "Ancestor's Bottle":            { rarity: "Shambler", limit: 1, effect: "+25% MAX HP | +50% Food Consumed | +10% Stress" },
  "Ancestor's Candle":            { rarity: "Shambler", limit: 1, effect: "+15% DMG if Torch above 50 | +2 SPD if Torch above 50 | +5 DODGE if Torch above 50 | +10% Stress" },
  "Ancestor's Map":               { rarity: "Shambler", limit: 1, effect: "+25% Trap Disarm Chance | +25% Scouting Chance | +10% Stress" },
  "Ancestor's Scroll":            { rarity: "Shambler", limit: 1, effect: "+25% Healing Skills | +25% Stress Skills | +10% Stress" },
  "Ancestor's Tentacle Idol":     { rarity: "Shambler", limit: 1, effect: "+20% Virtue Chance | +8% Death Blow Resist" },
  "Necromancer's Collar":         { rarity: "Trophy", limit: 1, effect: "+20% DMG vs Unholy | +8% CRIT vs Unholy" },
  "Prophet's Eye":                { rarity: "Trophy", limit: 1, effect: "+15 ACC if in position 4 | +3 SPD if in position 4 | -15% Stress if in position 4" },
  "Hag's Ladle":                  { rarity: "Trophy", limit: 1, effect: "+30% Blight Skill Chance | +40% Blight Resist | +40% Disease Resist" },
  "Fuseman's Matchstick":         { rarity: "Trophy", limit: 1, effect: "+2 SPD | +10% DMG Ranged Skills | +6% CRIT Ranged Skills" },
  "Wilbur's Flag":                { rarity: "Trophy", limit: 1, effect: "+50% Stun Resist | +10 DODGE" },
  "Flesh's Heart":                { rarity: "Trophy", limit: 1, effect: "+50% Bleed Resist | +15% MAX HP" },
  "Siren's Conch":                { rarity: "Trophy", limit: 1, effect: "+50% Debuff Resist | -20% Stress" },
  "Crew's Bell":                  { rarity: "Trophy", limit: 1, effect: "+50% Move Resist | +20% Healing Received" },
  "Vvulf's Tassel":               { rarity: "Trophy", limit: 1, effect: "+20% DMG vs Marked | +10 ACC vs Marked | +5% CRIT vs size 2" },
  "Baron's Lash":                 { rarity: "Trophy", limit: 1, effect: "+75% Debuff Resist if has Crimson Curse | +4 SPD if has Crimson Curse | -10% Stun Resist if has Crimson Curse" },
  "Viscount's Spices":            { rarity: "Trophy", limit: 1, effect: "+5% CRIT if has Crimson Curse | +100% Healing when Eating if has Crimson Curse | +100% Food Consumed if has Crimson Curse" },
  "Countess' Fan":                { rarity: "Trophy", limit: 1, effect: "+50% Healing Received if has Crimson Curse | -25% Bleed Resist if has Crimson Curse" },
  "Callous Talon":                { rarity: "Crow", limit: 1, effect: "+7% CRIT | +33% Disease Resist if Torch below 75 | +33% Bleed Skill Chance if Torch below 50 | +15% Stress" },
  "Distended Crowseye":           { rarity: "Crow", limit: 1, effect: "+10 ACC | +33% Disease Resist if Torch below 75 | +15% Scouting Chance if Torch below 50 | +15% Stress" },
  "Molted Tailfeather":           { rarity: "Crow", limit: 1, effect: "+4 SPD | +33% Disease Resist if Torch below 75 | +33% Stun Resist if Torch below 50 | +15% Stress" },
  "Molted Wingfeather":           { rarity: "Crow", limit: 1, effect: "+10 DODGE | +33% Disease Resist if Torch below 75 | +33% Move Resist if Torch below 50 | +15% Stress" },
  "Ancestor's Vintage":           { rarity: "Very Rare", limit: 1, effect: "Delayed Curse craving" },
  "Coven Signet":                 { rarity: "Very Rare", limit: 1, effect: "-25% Stress if has Crimson Curse" },
  "Dazzling Mirror":              { rarity: "Very Rare", limit: 1, effect: "+4 SPD vs Bloodsuckers | +20% Stun Skill Chance vs Bloodsuckers" },
  "Mantra of Fasting":            { rarity: "Very Rare", limit: 1, effect: "+40% MAX HP if Crimson Curse - Wasting | +7 SPD if Crimson Curse - Wasting" },
  "Mercurial Salve":              { rarity: "Very Rare", limit: 1, effect: "+25% DMG vs Bloodsuckers" },
  "Pagan Talisman":               { rarity: "Very Rare", limit: 1, effect: "+25% DMG vs Fanatic | -10% Stress" },
  "Rat Carcass":                  { rarity: "Very Rare", limit: 2, effect: "Immune to death by Crimson Curse" },
  "Sanguine Snuff":               { rarity: "Very Rare", limit: 1, effect: "+8% CRIT if Crimson Curse - Bloodlust | +15 DODGE if Crimson Curse - Bloodlust" },
  "Sculptor's Tools":             { rarity: "Very Rare", limit: 1, effect: "+40% DMG vs Stonework" },
  "Lens of the Comet":            { rarity: "Crystalline", limit: 1, effect: "Ignores Stealth | -20% Virtue Chance | +5% CRIT if Shard Dust in inventory" },
  "Crystal Pendant":              { rarity: "Crystalline", limit: 1, effect: "+15% Shards Given | +15% Stress" },
  "Cluster Pendant":              { rarity: "Crystalline", limit: 1, effect: "+25% Shards Given | +15% Stress" },
  "Coat Of Many Colors":          { rarity: "Crystalline", limit: 1, effect: "On Monster Kill: Self: -2% Stress (2 battles), +2 ACC (2 battles) | Hero Killed: Party: Stun (120% base) | Hero Killed: Party: Stress +25 (120% base)" },
  "Miller's Pipe":                { rarity: "Crystalline", limit: 1, effect: "On Monster Kill: Self: Stress -2 | On Battle Won: Blight 2 pts/rd for 3 rds (120% base) | Hero Killed: Party: -20% PROT (quest), -2 SPD (quest) | Hero Killed: Party: Stress +45" },
  "Mildred's Locket":             { rarity: "Keepsake", limit: 1, effect: "Miller: The Reaping: -100% DMG Taken | +40% Blight Resist | +3 SPD | +40% DMG vs Miller" },
  "Thing's Mesmerizing Eye":      { rarity: "Thing", limit: 1, effect: "+4% CRIT if HP above 41% | +8% CRIT if HP below 40%" },
  "Thing's Crystalline Fang":     { rarity: "Thing", limit: 1, effect: "+10% Stun Skill Chance if HP above 40% | +40% Stun Skill Chance if HP below 41%" },
  "Thing's Phase Shifting Hide":  { rarity: "Thing", limit: 1, effect: "-15% Stress if HP above 41% | -50% Stress if HP below 40%" },
  "Prismatic Heart Crystal":      { rarity: "Thing", limit: 1, effect: "+35% Blight Skill Chance vs Thing | +35% Bleed Skill Chance vs Thing | +12% CRIT vs Thing" },
  "Talisman of the Flame":        { rarity: "Darkest Dungeon", limit: 3, effect: "Revelation: -100% Stress | Revelation: -100% DMG Taken" },
  "Stone of Patience":            { rarity: "Uncommon", effect: "-10% Stress | +5% Virtue Chance" },
  "Stone of Endurance":           { rarity: "Rare", effect: "+8% Death Blow Resist" },
  "Ankh of Life":                 { rarity: "Butcher's Circus", effect: "+8% Death Blow Resist | +10 Dodge at Death's Door" },
  "Bloodstained Gambeson":        { rarity: "Butcher's Circus", effect: "+8% MAX HP | +4% Death Blow Resist" },
  "Brass Bugle":                  { rarity: "Butcher's Circus", effect: "+50% Stress Skills" },
  "Brass Knuckles":               { rarity: "Butcher's Circus", effect: "+10% DMG | +10% Stun/Daze Skill Chance" },
  "Carnival Masque":              { rarity: "Butcher's Circus", effect: "+20% Stress Dealt | +4 ACC" },
  "Crimson Hook":                 { rarity: "Butcher's Circus", effect: "+25% Stress Dealt vs Bleeding | +15% Bleed Skill Chance | +3% CRIT" },
  "Crushed Hemlock":              { rarity: "Butcher's Circus", effect: "+20% Blight Skill Chance | On Melee Attack Hit: Blight (100% Base) 2 pts/rd for 2 rds" },
  "Eagle Eye Talisman":           { rarity: "Butcher's Circus", effect: "+10% DMG | +10 ACC" },
  "Eerie Eye":                    { rarity: "Butcher's Circus", effect: "+12 ACC | +20% Debuff Skill Chance | Ignores Stealth" },
  "Exotic Snuff":                 { rarity: "Butcher's Circus", effect: "+30% Stun Resist | +30% Move Resist | +10% DMG when acting First | +4 ACC" },
  "Gladiator Helmet":             { rarity: "Butcher's Circus", effect: "+10% MAX HP | +5% PROT" },
  "Hunters Charm":                { rarity: "Butcher's Circus", effect: "+15% DMG | +4 ACC" },
  "Jagged Chopper":               { rarity: "Butcher's Circus", effect: "+15% DMG | +3% CRIT" },
  "Monkey's Paw":                 { rarity: "Butcher's Circus", effect: "+15 DODGE | +4 ACC | Crits Received Chance +3% | +10% Stress" },
  "Nepenthe":                     { rarity: "Butcher's Circus", effect: "-15% Stress | +25% Virtue Chance | +15% Debuff Resist" },
  "Numbing Incense":              { rarity: "Butcher's Circus", effect: "-15% Stress | +20% Stun Resist | -4 DODGE" },
  "Pitfighter's Helm":            { rarity: "Butcher's Circus", effect: "+20% PROT | +10% Stress Dealt" },
  "Rancid Cure All":              { rarity: "Butcher's Circus", effect: "+40% Bleed Resist | +40% Blight Resist | +30% Debuff Resist" },
  "Retarius' Net":                { rarity: "Butcher's Circus", effect: "+20% Move Skill Chance | +6 ACC" },
  "Rotting Trophy":               { rarity: "Butcher's Circus", effect: "+15% Stress Dealt | +30% Blight Skill Chance | -20% Blight Resist" },
  "Sanity's Bane":                { rarity: "Butcher's Circus", effect: "+15% DMG vs Afflicted | +10 ACC vs Afflicted | +25% Death Blow Dealt Chance vs Afflicted | +25% Stun/Daze Skill Chance vs Afflicted" },
  "Silver Syringe":               { rarity: "Butcher's Circus", effect: "+35% Healing Skills" },
  "Spiked Bat":                   { rarity: "Butcher's Circus", effect: "+10% DMG | +20% Bleed Skill Chance" },
  "The Finisher":                 { rarity: "Butcher's Circus", effect: "+25% Death Blow Dealt Chance | +20 ACC vs HP below 40%" },
  "Treated Bandage":              { rarity: "Butcher's Circus", effect: "+35% Healing Received | +40% Bleed Resist | +40% Blight Resist" },
  "Pile of Ash":                  { rarity: "Very Common", effect: "-4 DODGE | On Attack: Burn 2 pts/rd | On Round End: A random enemy: Burn 2 pts/rd" },
  "Jar of Ash":                   { rarity: "Rare", effect: "+100% Burn Skill Amount vs Corpses | -12 DODGE | On Attack: Burn 3 pts/rd | After Battle: This trinket: Gain Pile of Ash" },
  "Offering Pendant":             { rarity: "Common", effect: "+10% Stress Skills | +10% Healing Skills" },
  "Focus Talisman":               { rarity: "Common", effect: "+5 ACC | +5 ACC after First Round | -6 DODGE" },
  "Nullifying Contract":          { rarity: "Uncommon", effect: "+33% Debuff Resist | +33% Blight Resist | +33% Bleed Resist | -100% Resolve XP" },
  "Lifestyle Guide":              { rarity: "Uncommon", effect: "+33% Healing Received if HP above 40% | -20% Stress if Stress below 40 | On Quest Complete: Self: Gain a quirk (75% positive)" },
  "Crier's Bell":                 { rarity: "Uncommon", effect: "+15% Scouting Chance | +20% Chance Party Surprised | On Quest Complete: Self: Guaranteed town event" },
  "Sunset Ring":                  { rarity: "Rare", effect: "+10 ACC if Torch above 75 | +20% Stress | +5% DMG per Quest Use remaining" },
  "Vice Crown":                   { rarity: "Rare", effect: "+5% DMG per Negative Quirk | +6% CRIT | -25% Virtue Chance | On Quest Complete: Self: Gain a negative quirk" },
  "Slumber Pendant":              { rarity: "Rare", effect: "-20% Stress | -4 SPD on First Round" },
  "Waking Pendant":               { rarity: "Fire's Edge", effect: "+15% DMG | +4 SPD | +20% Stress" },
  "Tinker Box":                   { rarity: "Very Rare", effect: "+5 ACC | +5% PROT | On Quest Complete: This trinket: Gain a random trinket" },
  "Flickering Lamplight":         { rarity: "Very Rare", effect: "On Turn End: Self: Heal 4 | After Battle: This trinket: +6 uses" },
  "Crumbling Timekeeper":         { rarity: "Very Rare", effect: "+10 ACC | -10% MAX HP | On Death: This trinket: Destroys this trinket | On Quest Complete: This trinket: +3% DMG | On Quest Complete: This trinket: -3% MAX HP" },
  "Dark Catalyst":                { rarity: "Very Rare", limit: 1, effect: "+20% Stress" },

  // ===== Backer trinkets =====
  "Aakeskiol":                            { rarity: "Kickstarter", limit: 1, effect: "+4% Virtue Chance | +3% Death Blow Resist | +3% PROT | -4 SPD if in position 4" },
  "Abyssal Tome":                         { rarity: "Kickstarter", limit: 1, effect: "-10% Stress if Torch below 26 | +6% Death Blow Resist if Torch below 26 | +8% Virtue Chance if Torch below 26 | -6% PROT if Torch above 75 | -13% Healing Received if Torch above 75" },
  "Adamant":                              { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +10% Move Resist | -6 DODGE | -4 SPD" },
  "Agnus Dei":                            { rarity: "Kickstarter", limit: 1, effect: "+8% DMG | +3% CRIT | -10% Bleed Resist on First Round | -13% Healing Skills if Torch below 26" },
  "AJ's Growling Tome of Maddness":       { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +13% Healing Received | -4 SPD on First Round" },
  "Aliandre":                             { rarity: "Kickstarter", limit: 1, effect: "+11% PROT if in position 1 | -18% Stress if Torch below 26 | -13% Healing Skills if HP above 75% | -8% Virtue Chance if Torch above 75 | -10% Trap Disarm Chance vs Beast" },
  "Amiga":                                { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +4 SPD | +5 SPD if HP below 25% | -10% DMG | -4% CRIT | -13% Healing Skills if Torch below 26" },
  "Amulet of Superior Asphyxiation":      { rarity: "Kickstarter", limit: 1, effect: "+5% MAX HP | +3 DODGE | +5% DMG | -13% Healing Received on First Round" },
  "Amulet of Yeti Fur":                   { rarity: "Kickstarter", limit: 1, effect: "-8% Stress after First Round | +8% Trap Disarm Chance if Torch below 26 | -30% HP DMG Inflicted When Starving if HP below 25% | -4 SPD if Torch below 26" },
  "Arbalest Accolade":                    { rarity: "Kickstarter", limit: 1, effect: "+3 DODGE | +5% DMG | +4% Virtue Chance | -10% Move Resist on First Round" },
  "Arkenhelm":                            { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +10% Healing Received if Torch above 75 | -8% Stress if HP above 75% | -10% Disease Resist if HP below 25%" },
  "Aronynnes Bane":                       { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +5 ACC | -8% Chance Monsters Surprised if Torch below 26" },
  "Aru":                                  { rarity: "Kickstarter", limit: 1, effect: "+5% Trap Disarm Chance | +3 DODGE | +5% Disease Resist | +10% Stress vs Marked" },
  "Arzacs Tome of Incantations":          { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | -6 DODGE" },
  "Atlas":                                { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +8% Disease Resist at Death's Door | +3% Scouting Chance if Torch above 75 | -8% Virtue Chance if Torch below 26" },
  "Aurora Pendant":                       { rarity: "Kickstarter", limit: 1, effect: "+6 ACC Ranged Skills | +10% Virtue Chance if Torch above 75 | -8% Virtue Chance if Torch below 26" },
  "Avalon":                               { rarity: "Kickstarter", limit: 1, effect: "+6 SPD | +6% CRIT | -6% PROT on First Round | -10% Disease Resist if in position 1 | -10% Blight Resist if in position 1" },
  "Bears Breath":                         { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +4% CRIT | +10% Stun Resist | -8% Virtue Chance if in position 4 | -16% Resolve XP at Death's Door | -5 ACC Ranged Skills" },
  "Behelit":                              { rarity: "Kickstarter", limit: 1, effect: "+13% DMG vs Eldritch | +8% Virtue Chance | -10% MAX HP vs Eldritch" },
  "Beloveds Ring":                        { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +10% DMG | +4 SPD | -10% Bleed Resist | -10% Blight Resist | -10% Disease Resist" },
  "Beneath the Dark":                     { rarity: "Kickstarter", limit: 1, effect: "-13% Stress if Torch below 26 | +16% Resolve XP | -6 DODGE on First Round" },
  "Beneficence":                          { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | -13% Healing Skills if Torch below 26" },
  "Bernie the Rock":                      { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | +50% HP DMG Inflicted When Starving at Death's Door" },
  "Black Design":                         { rarity: "Kickstarter", limit: 1, effect: "+5% CRIT if HP above 75% | +6% Death Blow Resist | +5 ACC | +50% Food Consumed | -6% PROT if Torch below 26 | -13% Healing Skills if Torch below 26" },
  "Blood Letter":                         { rarity: "Kickstarter", limit: 1, effect: "+8 DODGE if in position 1 | +13% DMG if in position 1 | -4% CRIT if in position 1" },
  "Blood of Innocent":                    { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +13% DMG if in position 1 | +13% Bleed Resist if in position 1 | -6 DODGE | -10% DMG if in position 4 | -10% Bleed Resist if in position 4" },
  "Bloodbrine":                           { rarity: "Kickstarter", limit: 1, effect: "+30% Healing Skills if in position 4 | +50% Food Consumed while Camping | -10% MAX HP" },
  "Bloodstained Bounty List":             { rarity: "Kickstarter", limit: 1, effect: "+5% CRIT vs Marked | +13% DMG vs Marked | -5 ACC vs Marked" },
  "Bogis Bulwark":                        { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +10% MAX HP | -13% Healing Skills if HP above 75%" },
  "Bones of Zuh":                         { rarity: "Kickstarter", limit: 1, effect: "+6% Virtue Chance at Death's Door | +5% Death Blow Resist if HP below 25% | +8% Bleed Resist if HP below 25% | +10% Stress if Torch above 75" },
  "Boots of Much Kicking":                { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +4% CRIT | +6% PROT | -10% Move Resist while Camping | -10% Trap Disarm Chance while Camping | -16% Resolve XP while Camping" },
  "Bowmens End":                          { rarity: "Kickstarter", limit: 1, effect: "+8% DMG | +5 ACC Ranged Skills | +4% CRIT vs Human | -13% Healing Skills if HP above 75% | -4 SPD if HP below 25%" },
  "Brace of Thorns":                      { rarity: "Kickstarter", limit: 1, effect: "+26% Healing Received if HP below 25% | -10% MAX HP" },
  "Braveheart":                           { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +10% MAX HP | +8% Virtue Chance | -6 DODGE if in position 1 | -4% CRIT if in position 4" },
  "Brilliant Clasp":                      { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT on First Round | +10% DMG on First Round | +5 ACC on First Round | -10% DMG after First Round | -4% CRIT after First Round" },
  "Brimstone of Ice":                     { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +6% Chance Monsters Surprised if HP below 25% | +5% Death Blow Resist if Torch below 26 | -4 SPD if Torch above 75" },
  "Brothers Soulstone":                   { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +3 DODGE | +5% PROT if HP below 25% | -5 ACC vs Human" },
  "Brutal Hairpin":                       { rarity: "Kickstarter", limit: 1, effect: "+15% DMG | -10% Bleed Resist while Camping" },
  "Bugle Horn Ring":                      { rarity: "Kickstarter", limit: 1, effect: "+8% PROT if in position 1 | +13% Move Resist if in position 1 | -8% Virtue Chance if in position 4" },
  "Bulk Smash":                           { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +5% MAX HP | +2% CRIT | -10% DMG on First Round" },
  "Bulwark of Faith":                     { rarity: "Kickstarter", limit: 1, effect: "+7% Healing Skills | +8% Stun Resist after First Round | +5% PROT if in position 1 | -4% Scouting Chance if Torch below 26" },
  "Bulwark of Volitok":                   { rarity: "Kickstarter", limit: 1, effect: "+3% PROT | +5% MAX HP | +5% Death Blow Resist if Torch below 26 | -4 SPD on First Round" },
  "Burritopia":                           { rarity: "Kickstarter", limit: 1, effect: "-20% Food Consumed | -50% HP DMG Inflicted When Starving after First Round | +13% Healing Skills | -10% Move Resist if Torch below 26 | -10% Blight Resist after First Round | -6 DODGE" },
  "Cadogans Shield":                      { rarity: "Kickstarter", limit: 1, effect: "+3% PROT | +6% Virtue Chance if in position 1 | +8% Move Resist if HP above 75% | -4 SPD if in position 4" },
  "Canis Doctrine":                       { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +10% Healing Skills while Camping | +6% Chance Monsters Surprised if in position 1 | -8% Virtue Chance if Torch below 26" },
  "Caretakers Hoodie":                    { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +6 DODGE | +10% Debuff Resist | -5 ACC on First Round | -10% DMG on First Round | -4% CRIT on First Round" },
  "Carnal Visage":                        { rarity: "Kickstarter", limit: 1, effect: "+10% Trap Disarm Chance | +8% Chance Monsters Surprised | +50% Food Consumed at Death's Door | +50% HP DMG Inflicted When Starving on First Round" },
  "Checkmate":                            { rarity: "Kickstarter", limit: 1, effect: "+13% DMG at Death's Door | +17% Healing Received if HP below 25% | +5% CRIT at Death's Door | -6% PROT if in position 4 | -8% Chance Monsters Surprised if in position 4 | -13% Healing Received if in position 4" },
  "Chew Toy":                             { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +17% Healing Received while Camping | -10% Move Resist if Torch below 26" },
  "Chortling Pseudopod":                  { rarity: "Kickstarter", limit: 1, effect: "-8% Stress | +8% Virtue Chance if Torch below 26 | +4 SPD if in position 1 | -8% Chance Monsters Surprised vs Eldritch | -4% CRIT on First Round" },
  "Claw of the Bellwether Beast":         { rarity: "Kickstarter", limit: 1, effect: "+6% CRIT if Torch below 26 | +15% Move Resist if in position 1 | +10% Stress if Torch above 75 | +50% Food Consumed" },
  "Claws of the Cat":                     { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT | +10% DMG if Torch below 26 | +5 ACC if Torch below 26 | +10% Stress if Torch above 75 | -10% Move Resist if HP above 75%" },
  "Cloak of Shadows":                     { rarity: "Kickstarter", limit: 1, effect: "+5 DODGE | +4 SPD if Torch below 26 | +8% Trap Disarm Chance | -10% MAX HP | -8% Virtue Chance if Torch below 26" },
  "Cloak of the Antedeluvian":            { rarity: "Kickstarter", limit: 1, effect: "+6 DODGE | +4 SPD | +6 ACC vs Eldritch | +10% Stress vs Eldritch | -16% Resolve XP | -10% DMG vs Eldritch" },
  "Cloak of the Heavens":                 { rarity: "Kickstarter", limit: 1, effect: "-15% Stress if Torch below 26 | +6 SPD if Torch above 75 | -10% Move Resist if Torch below 26 | -4% CRIT if Torch above 75" },
  "Cloak of the Overwatch":               { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +3 DODGE | +4% Chance Monsters Surprised | +50% HP DMG Inflicted When Starving on First Round" },
  "Cloak of the Shadow Dancer":           { rarity: "Kickstarter", limit: 1, effect: "+13% DMG if HP below 25% | +4% CRIT | +8% Death Blow Resist at Death's Door | -6 DODGE if Torch below 26 | -6% PROT when attacked by Unholy | -10% Move Resist on First Round" },
  "Concealed Dagger":                     { rarity: "Kickstarter", limit: 1, effect: "+3 SPD on First Round | +3% CRIT on First Round | +5% DMG | -6% PROT" },
  "Corwyns Cape":                         { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT Ranged Skills | +8% DMG Ranged Skills | +4 ACC Ranged Skills | +50% HP DMG Inflicted When Starving at Death's Door" },
  "Cowards Crutch":                       { rarity: "Kickstarter", limit: 1, effect: "+8 DODGE if in position 4 | +5 SPD if in position 4 | -6 DODGE if in position 1" },
  "Crest of the 1100":                    { rarity: "Kickstarter", limit: 1, effect: "+25% Virtue Chance | -15% Stress" },
  "Crucifix for the Lord":                { rarity: "Kickstarter", limit: 1, effect: "+3% PROT | +7% Healing Received | +5% DMG | -16% Resolve XP" },
  "Cthulhus Requiem":                     { rarity: "Kickstarter", limit: 1, effect: "+10% DMG if in position 4 | +8% DMG | +4% CRIT Ranged Skills | -10% Bleed Resist when attacked by Human | -10% Trap Disarm Chance if Torch below 26" },
  "Da Powar":                             { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +10% DMG | -10% Trap Disarm Chance while Camping" },
  "Dad Jokes":                            { rarity: "Kickstarter", limit: 1, effect: "+23% Healing Skills | -10% Stun Resist on First Round | -6 DODGE Melee Skills" },
  "Dagnabits Crown":                      { rarity: "Kickstarter", limit: 1, effect: "+6 ACC Melee Skills | -13% Stress if in position 1 | +13% Healing Received | -5 ACC if in position 4 | +10% Stress Ranged Skills | -8% Virtue Chance at Death's Door" },
  "Danger Zone":                          { rarity: "Kickstarter", limit: 1, effect: "+6% CRIT if in position 1 | +7 ACC if in position 1 | +50% Food Consumed if Torch below 26 | +10% Stress if in position 4" },
  "Danos Glory":                          { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +5 ACC | +4 SPD | -4% Scouting Chance on First Round | -10% Stun Resist on First Round | -8% Virtue Chance on First Round" },
  "Dark Irony":                           { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | -8% Chance Monsters Surprised" },
  "Dark Night of the Soul":               { rarity: "Kickstarter", limit: 1, effect: "-13% Stress if Torch below 26 | +8% PROT if Torch below 26 | -16% Resolve XP" },
  "De Vermis Mysteriis":                  { rarity: "Kickstarter", limit: 1, effect: "-20% Stress vs Eldritch | -6 DODGE when attacked by Eldritch" },
  "Dead Mans Will":                       { rarity: "Kickstarter", limit: 1, effect: "+8% Virtue Chance | +6% Death Blow Resist | +8% Death Blow Resist at Death's Door | -13% Healing Skills | -10% DMG on First Round | -13% Healing Received if in position 4" },
  "Decusian Prayerbook":                  { rarity: "Kickstarter", limit: 1, effect: "+12% Virtue Chance | -16% Resolve XP if Torch below 26" },
  "Demons Eye":                           { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +6 ACC if Torch below 26 | +5% CRIT if Torch below 26 | +10% Stress | -8% Virtue Chance if Torch below 26 | +10% Stress if Torch below 26" },
  "Dés Chanceux":                         { rarity: "Kickstarter", limit: 1, effect: "+4 ACC if Torch above 75 | +3% CRIT if Torch above 75 | +3 SPD if Torch above 75 | -16% Resolve XP if Torch below 26" },
  "Deus Da Morte Egito":                  { rarity: "Kickstarter", limit: 1, effect: "+17% Healing Received at Death's Door | +8% PROT when attacked by Eldritch | -13% Stress if HP below 25% | +10% Stress | -6 DODGE if in position 1 | -10% Bleed Resist if in position 4" },
  "Diadem of the Arcane":                 { rarity: "Kickstarter", limit: 1, effect: "+12% PROT when attacked by Eldritch | -4% Scouting Chance" },
  "Dippys Little Black Book":             { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +10% MAX HP | -8% Virtue Chance if Torch below 26" },
  "Dorans Dice":                          { rarity: "Kickstarter", limit: 1, effect: "+5% Death Blow Resist if HP below 25% | +5% DMG | +5 DODGE if in position 1 | -10% Bleed Resist on First Round" },
  "Dragon Gods Mantle":                   { rarity: "Kickstarter", limit: 1, effect: "+10% Virtue Chance vs Unholy | +10% DMG | +10% Stress" },
  "Drifters Bandana":                     { rarity: "Kickstarter", limit: 1, effect: "+8% Virtue Chance | +13% DMG Ranged Skills | +5% CRIT Ranged Skills | -6% Death Blow Resist | +10% Stress if HP below 25% | -6 DODGE if HP below 25%" },
  "Drop of Rain":                         { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +13% Healing Received | +20% Resolve XP if Torch above 75 | +10% Stress if Torch below 26 | -10% Stun Resist if Torch below 26 | -10% Debuff Resist if Torch below 26" },
  "Druidic Herb":                         { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +10% Blight Resist | -4 SPD" },
  "Edge Comb":                            { rarity: "Kickstarter", limit: 1, effect: "+17% Healing Skills if in position 4 | +8 DODGE if in position 4 | +13% Blight Resist if in position 4 | -6 DODGE if in position 1 | -13% Healing Skills if in position 1 | -10% Blight Resist if in position 1" },
  "Edgecomb":                             { rarity: "Kickstarter", limit: 1, effect: "+7% Healing Skills | +3% PROT | +7% Healing Received | -10% Bleed Resist while Camping" },
  "Eilif":                                { rarity: "Kickstarter", limit: 1, effect: "+3% PROT | +5% MAX HP | +5% Death Blow Resist at Death's Door | -13% Healing Skills while Camping" },
  "Eirenes Visage":                       { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | -10% DMG on First Round" },
  "Eldritch Chamber Pot":                 { rarity: "Kickstarter", limit: 1, effect: "+13% DMG if Torch below 26 | +10% Blight Resist | -20% Food Consumed | -10% MAX HP if Torch above 75 | +10% Stress | -10% Disease Resist on First Round" },
  "Eldritch Trophy":                      { rarity: "Kickstarter", limit: 1, effect: "+8% DMG vs Eldritch | +6% Virtue Chance if Torch above 75 | +3% Death Blow Resist | -8% Virtue Chance if Torch below 26" },
  "Emblem of Trista":                     { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Received | -13% Stress vs Unholy | +5% CRIT if in position 1 | -8% Virtue Chance if Torch below 26 | -5 ACC if in position 4 | -5 ACC Ranged Skills" },
  "Eye for the Feisty":                   { rarity: "Kickstarter", limit: 1, effect: "+5% MAX HP | +4% Virtue Chance | -5% Stress | -10% Stun Resist if Torch below 26" },
  "Eye of Sathariel":                     { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +8% PROT when attacked by Eldritch | +13% DMG vs Eldritch | -10% MAX HP | -6 DODGE when attacked by Eldritch | -4 SPD vs Eldritch" },
  "Eyepatch of Iniative":                 { rarity: "Kickstarter", limit: 1, effect: "+20% DMG on First Round | -4% Scouting Chance if in position 4" },
  "False Grin":                           { rarity: "Kickstarter", limit: 1, effect: "+2% CRIT | +6% Chance Monsters Surprised if HP above 75% | +5 DODGE if HP above 75% | -8% Virtue Chance if Torch above 75" },
  "Final Memento":                        { rarity: "Kickstarter", limit: 1, effect: "+9% Death Blow Resist | -8% Virtue Chance" },
  "Fools Bane":                           { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +5 ACC | +10% DMG | -6% PROT | +50% HP DMG Inflicted When Starving | -10% Bleed Resist" },
  "Forgotten Family Ring":                { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +8% Death Blow Resist at Death's Door | +13% Healing Received | -8% Chance Monsters Surprised if Torch above 75 | -4 SPD if Torch above 75 | -6% PROT on First Round" },
  "Forlorn Memento":                      { rarity: "Kickstarter", limit: 1, effect: "+6% PROT if Torch below 26 | +10% DMG if Torch below 26 | -10% Stress if Torch below 26 | -10% Move Resist | -6% Death Blow Resist" },
  "Fox Hound":                            { rarity: "Kickstarter", limit: 1, effect: "+2 ACC | +2% CRIT | -6 DODGE if Torch below 26" },
  "Frontal Lobe Protector":               { rarity: "Kickstarter", limit: 1, effect: "+5% PROT | +13% Healing Skills if HP below 25% | +5 DODGE | -10% Disease Resist if Torch below 26 | -10% Bleed Resist at Death's Door" },
  "Full Throttle":                        { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +3% CRIT if HP below 25% | +2 SPD | -10% Trap Disarm Chance vs Unholy" },
  "Ghost Satchel":                        { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT if Torch below 26 | +5 ACC if Torch below 26 | +8% Move Resist | -13% Healing Received if Torch above 75 | -10% MAX HP" },
  "Gisklers Hairpin":                     { rarity: "Kickstarter", limit: 1, effect: "-15% Stress if in position 1 | +7 ACC if in position 1 | +10% Stress if in position 4 | -5 ACC if in position 4" },
  "Golf Gun":                             { rarity: "Kickstarter", limit: 1, effect: "+13% DMG Ranged Skills | +6 ACC Ranged Skills | -4 SPD while Camping" },
  "Goliath Killer":                       { rarity: "Kickstarter", limit: 1, effect: "+6 ACC if in position 1 | +13% DMG if in position 1 | +5% CRIT if in position 1 | -10% Trap Disarm Chance if in position 4 | -8% Chance Monsters Surprised if in position 4 | -13% Healing Skills if in position 4" },
  "Grandfathers Rose":                    { rarity: "Kickstarter", limit: 1, effect: "+6 ACC if in position 4 | -10% Stress | +8% Virtue Chance | -10% Bleed Resist at Death's Door | -8% Chance Monsters Surprised if Torch below 26 | -10% Trap Disarm Chance if Torch below 26" },
  "Graviers Grimoire":                    { rarity: "Kickstarter", limit: 1, effect: "+3 SPD | +5% PROT | +3% CRIT | -6 DODGE | -10% Trap Disarm Chance" },
  "Grimalkins Nip":                       { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +16% Resolve XP | -8% Chance Monsters Surprised if Torch below 26" },
  "Grimoire of the Grey":                 { rarity: "Kickstarter", limit: 1, effect: "+8% Death Blow Resist after First Round | -13% Stress after First Round | -8% Virtue Chance after First Round" },
  "Gryphons Ring":                        { rarity: "Kickstarter", limit: 1, effect: "-15% Stress if in position 1 | +15% Debuff Resist if in position 1 | -10% Move Resist if Torch below 26 | -4% CRIT if Torch below 26" },
  "Grythepinnen":                         { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +8% PROT if in position 1 | -13% Stress Melee Skills | -5 ACC if HP below 25% | -10% Blight Resist at Death's Door | -10% Move Resist Ranged Skills" },
  "Guise of the Harbinger":               { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +2 ACC | +2% CRIT | +10% Stress at Death's Door" },
  "Handy Haversack":                      { rarity: "Kickstarter", limit: 1, effect: "+10% DMG Ranged Skills | +13% Healing Skills after First Round | +3% Scouting Chance | -13% Healing Received on First Round | -10% DMG Melee Skills" },
  "Harpy Talon":                          { rarity: "Kickstarter", limit: 1, effect: "+4 SPD | +8 DODGE if Torch above 75 | -4% CRIT" },
  "Headhunters Herbs":                    { rarity: "Kickstarter", limit: 1, effect: "+6 ACC vs Marked | +13% DMG vs Marked | +5% CRIT vs Marked | -10% MAX HP | -13% Healing Received | -10% Stun Resist" },
  "Helmet of the Mad Warrior":            { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +4% CRIT | +10% MAX HP | -5 ACC if in position 4 | -4% Scouting Chance if in position 4 | -6 DODGE if in position 4" },
  "Highbornes Praise":                    { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +10% Move Resist | +6% PROT | -4% CRIT if in position 4 | -8% Chance Monsters Surprised if in position 4 | -13% Healing Skills if in position 4" },
  "Hope in Hand":                         { rarity: "Kickstarter", limit: 1, effect: "+6 ACC after First Round | -13% Stress after First Round | +50% Food Consumed on First Round" },
  "Hope in Hand 2":                       { rarity: "Kickstarter", limit: 1, effect: "-15% Stress after First Round | +5 ACC | -13% Healing Skills on First Round | -10% Move Resist" },
  "Hound Crest":                          { rarity: "Kickstarter", limit: 1, effect: "+4 SPD | +10% DMG | +5 ACC | -4% CRIT while Camping" },
  "House Bloodrage Signet Ring":          { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +10% DMG | -4% Scouting Chance" },
  "Howling Devil":                        { rarity: "Kickstarter", limit: 1, effect: "+5% CRIT if in position 1 | -10% Stress | +13% DMG if Torch below 26 | -8% Chance Monsters Surprised | -4% Scouting Chance if Torch above 75 | -8% Chance Monsters Surprised if Torch above 75" },
  "Huichis Bracelet":                     { rarity: "Kickstarter", limit: 1, effect: "+4 ACC | +3% CRIT | +10% Stress if HP below 25% | +50% Food Consumed if HP below 25%" },
  "Hunlumb":                              { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +17% Healing Received if HP below 25% | +13% Stun Resist if in position 1 | -4% CRIT | -8% Chance Monsters Surprised if Torch below 26 | -10% Move Resist if in position 4" },
  "Hysteresis":                           { rarity: "Kickstarter", limit: 1, effect: "+16% Resolve XP | +13% Healing Skills | -10% Trap Disarm Chance if Torch below 26 | -6% Death Blow Resist on First Round | +50% HP DMG Inflicted When Starving at Death's Door" },
  "Hysterical Visage":                    { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +5% CRIT Melee Skills | +6 DODGE | +10% Stress if Torch above 75 | -8% Virtue Chance | -10% Blight Resist at Death's Door" },
  "Ingrown Toe Nail":                     { rarity: "Kickstarter", limit: 1, effect: "+5% Bleed Resist | +6% Chance Monsters Surprised if Torch above 75 | +10% Healing Skills if HP above 75% | -4% CRIT" },
  "Invictus":                             { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | -10% Trap Disarm Chance on First Round" },
  "Jade Maiden Hairpin":                  { rarity: "Kickstarter", limit: 1, effect: "+6 SPD on First Round | +6% PROT | -10% Bleed Resist | -6% Death Blow Resist" },
  "K Scorpio Necklase":                   { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT if Torch below 26 | +3 SPD if Torch below 26 | -6 DODGE if Torch above 75" },
  "Kalmas Last Chance":                   { rarity: "Kickstarter", limit: 1, effect: "+8 ACC if HP below 25% | +9 DODGE | -6% PROT if Torch below 26 | -10% DMG if Torch below 26 | -4% CRIT if Torch below 26" },
  "Kauthriens Stimpack":                  { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +13% Healing Skills | -4 SPD on First Round" },
  "Keljores Lost Valor":                  { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +6% Death Blow Resist | -13% Stress if Torch below 26 | -6 DODGE if Torch above 75 | -4 SPD if HP below 25% | +50% Food Consumed if Torch above 75" },
  "Kistras Prayer Book":                  { rarity: "Kickstarter", limit: 1, effect: "+10% Healing Skills | -10% Stress if Torch above 75 | +10% Move Resist if Torch above 75 | -10% DMG | +10% Stress if HP below 25%" },
  "Knights Folly":                        { rarity: "Kickstarter", limit: 1, effect: "+6% Virtue Chance | +4% CRIT if in position 1 | +10% DMG if in position 1 | -6 DODGE if Torch below 26 | -6% PROT if Torch below 26" },
  "Knohbodis Ring":                       { rarity: "Kickstarter", limit: 1, effect: "+5 DODGE | +5% PROT | +8% MAX HP | -8% Virtue Chance | -4 SPD" },
  "Kucorus Regard":                       { rarity: "Kickstarter", limit: 1, effect: "+5 ACC if in position 1 | +10% DMG if in position 1 | +13% Healing Received if HP below 25% | +10% Stress if HP below 25% | -10% Stun Resist if in position 1" },
  "Lahzarels Phylactery":                 { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT Ranged Skills | +5% PROT if HP below 25% | +4% Chance Monsters Surprised | -10% MAX HP" },
  "Last Cinder":                          { rarity: "Kickstarter", limit: 1, effect: "+5% PROT if Torch below 26 | +6% Virtue Chance if in position 1 | +4 ACC if in position 1 | -4 SPD at Death's Door" },
  "Last Roll a Testament":                { rarity: "Kickstarter", limit: 1, effect: "+5 ACC at Death's Door | +6 DODGE at Death's Door | +6% Death Blow Resist at Death's Door | -10% MAX HP | -10% Move Resist after First Round" },
  "Le Roi En Jaune":                      { rarity: "Kickstarter", limit: 1, effect: "+24% Resolve XP | -15% Stress | -8% Chance Monsters Surprised if in position 4 | -8% Virtue Chance if Torch below 26 | -5 ACC vs Eldritch" },
  "Leaders Crest":                        { rarity: "Kickstarter", limit: 1, effect: "+5% PROT | -10% Stress if in position 1 | +10% DMG if in position 1 | -5 ACC if in position 4 | -10% DMG if in position 4" },
  "Lewd Vial":                            { rarity: "Kickstarter", limit: 1, effect: "+6 ACC while Camping | +5 SPD while Camping | -13% Stress while Camping | -6% PROT while Camping | -10% Disease Resist while Camping | -10% Trap Disarm Chance while Camping" },
  "Libro Tenedo":                         { rarity: "Kickstarter", limit: 1, effect: "+10% Chance Monsters Surprised vs Eldritch | +5% CRIT vs Eldritch | -10% Trap Disarm Chance" },
  "Light Repetition":                     { rarity: "Kickstarter", limit: 1, effect: "+5 SPD if Torch above 75 | +5% CRIT if Torch above 75 | +6 ACC if Torch above 75 | -10% Disease Resist after First Round | -6% PROT after First Round | -6% Death Blow Resist after First Round" },
  "Loincloth":                            { rarity: "Kickstarter", limit: 1, effect: "+4 ACC | +4% CRIT if Torch below 26 | +10% DMG if Torch below 26 | -10% Stun Resist if in position 1 | -4 SPD if HP below 25%" },
  "Loris Lantern":                        { rarity: "Kickstarter", limit: 1, effect: "+6% Virtue Chance | +5 ACC if in position 4 | -10% Stress if Torch above 75 | -5 ACC if in position 1 | -4% CRIT if in position 1" },
  "Lost Ring of the Serpent":             { rarity: "Kickstarter", limit: 1, effect: "+20% Blight Resist | -8% Virtue Chance | -6% Death Blow Resist at Death's Door | -13% Healing Received while Camping" },
  "Lumihiutale":                          { rarity: "Kickstarter", limit: 1, effect: "+20% Healing Skills | +14% Virtue Chance if Torch below 26 | -10% DMG vs Human | -13% Healing Received if Torch above 75 | -4% Scouting Chance if Torch below 26" },
  "Malazan Book of the Fallen":           { rarity: "Kickstarter", limit: 1, effect: "+13% DMG if HP above 75% | +6 ACC if HP above 75% | +10% Move Resist | -4% Scouting Chance if Torch below 26 | -10% Debuff Resist if Torch below 26 | -6% Death Blow Resist if Torch below 26" },
  "Maleficence":                          { rarity: "Kickstarter", limit: 1, effect: "+6 ACC if in position 1 | +17% Healing Skills if Torch below 26 | +10% Virtue Chance if Torch above 75 | -6 DODGE if HP above 75% | -4% CRIT if Torch below 26 | -4 SPD on First Round" },
  "Mask of the Pious":                    { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +8 DODGE if HP below 25% | +8% Virtue Chance | +50% Food Consumed while Camping | -4 SPD if HP above 75% | -16% Resolve XP if HP above 75%" },
  "Masque of the Red Death":              { rarity: "Kickstarter", limit: 1, effect: "+11 DODGE | -10% Disease Resist | -13% Healing Received" },
  "Memory of True Love":                  { rarity: "Kickstarter", limit: 1, effect: "+12% Virtue Chance | -15% Stress | -4% CRIT on First Round | -4 SPD on First Round | -10% DMG on First Round" },
  "Mine":                                 { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +13% DMG if Torch below 26 | -13% Healing Received on First Round" },
  "Mizirs Unfinished Bestiary":           { rarity: "Kickstarter", limit: 1, effect: "+15% DMG vs Eldritch | +15% DMG vs Unholy | +10% Stress | -4 SPD" },
  "Moirai Bones":                         { rarity: "Kickstarter", limit: 1, effect: "+6% CRIT on First Round | +15% DMG after First Round | -5 ACC on First Round | -4% CRIT after First Round" },
  "Monorailpigs Seal":                    { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +3% PROT | +5% Death Blow Resist at Death's Door | +50% Food Consumed while Camping" },
  "Moonleafs Torture":                    { rarity: "Kickstarter", limit: 1, effect: "+15% Move Resist if in position 1 | +15% DMG Melee Skills | -10% Bleed Resist | +10% Stress if in position 4" },
  "Moonlight Greatsword":                 { rarity: "Kickstarter", limit: 1, effect: "+8% DMG Melee Skills | +8% MAX HP if in position 1 | +3% PROT | -13% Healing Received if in position 4" },
  "Morgauzes Locket":                     { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | -13% Stress if Torch below 26 | -4% Scouting Chance if Torch below 26" },
  "Morris Family Crest":                  { rarity: "Kickstarter", limit: 1, effect: "+10 ACC Melee Skills | -5 ACC if Torch below 26" },
  "Mothers Love":                         { rarity: "Kickstarter", limit: 1, effect: "+11% PROT if HP below 25% | +11% PROT if Torch below 26 | -5 ACC vs Human | -10% DMG vs Human | -6 DODGE when attacked by Human" },
  "Nagelring":                            { rarity: "Kickstarter", limit: 1, effect: "-10% Stress if Torch below 26 | +6 DODGE if Torch above 75 | +6% Virtue Chance | -10% MAX HP | -4% CRIT" },
  "Necronomicon":                         { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +4 SPD | -16% Resolve XP" },
  "Negus Visage":                         { rarity: "Kickstarter", limit: 1, effect: "+6 ACC vs Marked | +6 ACC if in position 1 | +6 ACC Melee Skills | -13% Healing Skills if HP above 75% | -8% Virtue Chance Ranged Skills | +50% Food Consumed if Torch below 26" },
  "Nevra":                                { rarity: "Kickstarter", limit: 1, effect: "+18% DMG if HP above 75% | +11% PROT if HP below 25% | -13% Healing Received at Death's Door | +50% HP DMG Inflicted When Starving while Camping | -6 DODGE" },
  "Nicholas Shield of Honour":            { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +5% CRIT if HP below 25% | +13% MAX HP if Torch below 26 | -4 SPD | -13% Healing Skills if Torch above 75 | +10% Stress vs Eldritch" },
  "Nictybenmas":                          { rarity: "Kickstarter", limit: 1, effect: "+6% CRIT | -10% Move Resist on First Round" },
  "Numinis":                              { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +6% PROT | +10% MAX HP | -10% DMG if HP below 25% | -6% PROT if HP below 25% | -4% CRIT if HP below 25%" },
  "Oath-breakers Sheathe":                { rarity: "Kickstarter", limit: 1, effect: "+6 SPD if Torch below 26 | +7 ACC if Torch below 26 | -8% Virtue Chance | -6% PROT if Torch above 75" },
  "Old Lucky Rag":                        { rarity: "Kickstarter", limit: 1, effect: "+5% PROT Melee Skills | +3 DODGE | -5% Stress | -10% Disease Resist Ranged Skills" },
  "Oviria":                               { rarity: "Kickstarter", limit: 1, effect: "+3 DODGE | +2 ACC | +2 SPD | -10% Move Resist at Death's Door" },
  "Palid Mask":                           { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +5 ACC | +10% DMG | -6 DODGE | -6% PROT | -4 SPD" },
  "Pamplemousse":                         { rarity: "Kickstarter", limit: 1, effect: "+9 DODGE if Torch above 75 | +15% DMG vs Marked | -5 ACC if Torch below 26 | +10% Stress" },
  "Papyrus Containing the Spell":         { rarity: "Kickstarter", limit: 1, effect: "+8 DODGE when attacked by Beast | +8% Death Blow Resist when attacked by Beast | -10% Trap Disarm Chance" },
  "Patch of Sight":                       { rarity: "Kickstarter", limit: 1, effect: "+4 ACC if HP above 75% | +3% CRIT if HP below 25% | +2% Scouting Chance | -6 DODGE" },
  "Pavlovs Bell":                         { rarity: "Kickstarter", limit: 1, effect: "+10% DMG on First Round | +5 ACC on First Round | +4% CRIT on First Round | +50% HP DMG Inflicted When Starving | +50% Food Consumed" },
  "Pendant of the Lost Sister":           { rarity: "Kickstarter", limit: 1, effect: "+17% Healing Skills if Torch above 75 | +13% Stun Resist if Torch below 26 | +4 SPD | +10% Stress if Torch below 26 | -6% PROT when attacked by Beast | -10% Debuff Resist after First Round" },
  "Pepperpot":                            { rarity: "Kickstarter", limit: 1, effect: "+3 SPD if in position 4 | -8% Stress if in position 4 | +50% Food Consumed" },
  "Pet Rock":                             { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | -5% Stress | +2% CRIT | +50% Food Consumed if HP below 25%" },
  "Pharmakon":                            { rarity: "Kickstarter", limit: 1, effect: "+2% CRIT | +5% DMG | +2 ACC | -8% Virtue Chance while Camping" },
  "Philosophers Wisdom":                  { rarity: "Kickstarter", limit: 1, effect: "+8% Virtue Chance | +6 ACC if in position 4 | +10% Stress" },
  "Phoenix Tears":                        { rarity: "Kickstarter", limit: 1, effect: "+8% MAX HP | +5% Death Blow Resist | +10% Healing Received | -13% Healing Received at Death's Door | +10% Stress at Death's Door" },
  "Portrait of the Beloved":              { rarity: "Kickstarter", limit: 1, effect: "-5% Stress | +3% CRIT Ranged Skills | +4 ACC Ranged Skills | +50% Food Consumed if HP below 25%" },
  "Purifying Vial":                       { rarity: "Kickstarter", limit: 1, effect: "+10% Healing Received | +4% CRIT if Torch above 75 | -10% Stress if Torch above 75 | -10% Move Resist if Torch above 75 | -4 SPD" },
  "Purity of Albedo":                     { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +6 DODGE | +8% Virtue Chance | -5 ACC while Camping | -10% Move Resist while Camping | -4 SPD while Camping" },
  "Ralackks Visage":                      { rarity: "Kickstarter", limit: 1, effect: "+2 ACC | +3% PROT | +6% Chance Monsters Surprised if in position 1 | -10% Trap Disarm Chance if in position 4" },
  "Ravenous Lions Ring":                  { rarity: "Kickstarter", limit: 1, effect: "+15% DMG Melee Skills | +6% CRIT Melee Skills | +50% Food Consumed | +50% HP DMG Inflicted When Starving" },
  "Rayners Seal":                         { rarity: "Kickstarter", limit: 1, effect: "+8% Virtue Chance if in position 1 | +6% PROT if in position 1 | +10% DMG if in position 1 | -13% Healing Received if HP above 75% | -4 SPD after First Round" },
  "Reapers Hourglass":                    { rarity: "Kickstarter", limit: 1, effect: "+5 SPD if HP above 75% | +8 DODGE if HP above 75% | +5% CRIT if HP above 75% | -4 SPD if HP below 25% | -6 DODGE if HP below 25% | -5 ACC if HP below 25%" },
  "Red Pill":                             { rarity: "Kickstarter", limit: 1, effect: "+3 DODGE | -4% CRIT on First Round" },
  "Reliquary of the Forgotten Saint":     { rarity: "Kickstarter", limit: 1, effect: "+20% MAX HP if in position 1 | -6% Death Blow Resist if in position 4" },
  "Rough-hewn Heart":                     { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +16% Resolve XP | +6% PROT | -6 DODGE | -10% Trap Disarm Chance | -8% Chance Monsters Surprised" },
  "Sacra Fracti":                         { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | +20% Healing Received | -5 ACC if Torch below 26 | -6 DODGE if Torch below 26 | -10% Disease Resist if in position 1" },
  "Sanguinary Talons":                    { rarity: "Kickstarter", limit: 1, effect: "+8% DMG Melee Skills | +2% CRIT | +5% DMG | -13% Healing Received" },
  "Sansibas Cuppa":                       { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +13% DMG if Torch below 26 | -6% Death Blow Resist on First Round" },
  "Scales of Justice":                    { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +5 ACC | +6% PROT | -4% CRIT | -6 DODGE | -4 SPD" },
  "Scent of Sarnath":                     { rarity: "Kickstarter", limit: 1, effect: "+9% PROT when attacked by Eldritch | +9 DODGE if Torch below 26 | -10% Disease Resist when attacked by Beast | -8% Chance Monsters Surprised if Torch below 26" },
  "Scions Resolve":                       { rarity: "Kickstarter", limit: 1, effect: "+6% Death Blow Resist | +8% Virtue Chance | +16% Resolve XP | -5 ACC | -4 SPD | -10% MAX HP" },
  "Scroll of Grimmr":                     { rarity: "Kickstarter", limit: 1, effect: "+4 SPD | +17% Healing Received if HP below 25% | +50% Food Consumed" },
  "Scroll of the Divine Healer":          { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +17% Healing Skills if in position 4 | +6% Death Blow Resist | -10% DMG | +10% Stress if in position 1 | -6% PROT" },
  "Shard of Rhembrandts Soul":            { rarity: "Kickstarter", limit: 1, effect: "+8% MAX HP | -8% Stress | +6% PROT when attacked by Eldritch | -10% DMG vs Eldritch | -6 DODGE when attacked by Eldritch" },
  "Shigless Requium":                     { rarity: "Kickstarter", limit: 1, effect: "+6 ACC if in position 1 | +5% CRIT if HP below 25% | +8 DODGE at Death's Door | -10% Bleed Resist vs Marked | -10% Disease Resist if Torch below 26 | -10% Move Resist if in position 1" },
  "Shinjis Detail Charm":                 { rarity: "Kickstarter", limit: 1, effect: "+6 ACC Ranged Skills | +5% CRIT Ranged Skills | +10% Stress" },
  "Shroud of Living Failures":            { rarity: "Kickstarter", limit: 1, effect: "+10% DMG Ranged Skills | +4% CRIT Ranged Skills | +4 SPD vs Marked | -6 DODGE if Torch below 26 | +10% Stress if HP below 25%" },
  "Shroud of the Midnight Charmer":       { rarity: "Kickstarter", limit: 1, effect: "+5% Death Blow Resist | +10% MAX HP if in position 4 | +6% Virtue Chance | -10% DMG if Torch below 26 | -10% Blight Resist on First Round" },
  "Sieg Stories":                         { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +5 ACC | +4% CRIT | -4% CRIT on First Round | -5 ACC on First Round | -6% PROT on First Round" },
  "Silent":                               { rarity: "Kickstarter", limit: 1, effect: "+13% DMG if HP above 75% | +6 ACC if Torch above 75 | +4 SPD | -6% PROT if Torch below 26 | -6 DODGE when attacked by Beast | -6% PROT at Death's Door" },
  "Silken Sheath":                        { rarity: "Kickstarter", limit: 1, effect: "+10% DMG if in position 1 | +4% CRIT if in position 1 | +6% PROT if HP above 75% | -4 SPD vs Beast | -6 DODGE on First Round" },
  "Skin-bound Volume":                    { rarity: "Kickstarter", limit: 1, effect: "+9% PROT | +9 DODGE | -10% Blight Resist if Torch below 26 | -10% Bleed Resist if Torch below 26 | -10% Disease Resist if Torch below 26" },
  "Skullyfm":                             { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | -10% Stress | -13% Healing Received if in position 4 | -13% Healing Skills if in position 4" },
  "Soul of the Neverborn":                { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +5% CRIT if Torch below 26 | +6% PROT | -10% Debuff Resist if Torch above 75 | +10% Stress if Torch above 75 | -4 SPD if Torch above 75" },
  "Spidersilk Cloak":                     { rarity: "Kickstarter", limit: 1, effect: "+6 DODGE | +4% CRIT | -8% Chance Monsters Surprised if Torch below 26" },
  "Split Skullcap Memento":               { rarity: "Kickstarter", limit: 1, effect: "+15% DMG if Torch above 75 | +8% Virtue Chance | -10% Move Resist | +10% Stress" },
  "Squittens Survival Guide":             { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +13% Stun Resist if HP below 25% | -8% Chance Monsters Surprised on First Round" },
  "Starbreaker":                          { rarity: "Kickstarter", limit: 1, effect: "+4 SPD | -13% Healing Skills on First Round" },
  "Stay Frosty Cloak":                    { rarity: "Kickstarter", limit: 1, effect: "+4 SPD | +6 DODGE | +8 DODGE at Death's Door | -10% DMG on First Round | -6% PROT at Death's Door | -13% Healing Received at Death's Door" },
  "Steel Toad":                           { rarity: "Kickstarter", limit: 1, effect: "+3% PROT | +5 DODGE if in position 1 | +4 ACC if in position 4 | -4% CRIT on First Round" },
  "Steelfists Bulwark":                   { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +5% MAX HP | +5% PROT if in position 1 | -4 SPD if in position 4" },
  "Stone of Hearth":                      { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | -13% Healing Skills" },
  "Stones of Gelati Preziosi":            { rarity: "Kickstarter", limit: 1, effect: "+17% Healing Received Melee Skills | +13% MAX HP if HP above 75% | +5% CRIT if HP below 25% | -5 ACC if Torch below 26 | -10% DMG if in position 1 | -6 DODGE" },
  "Surpisingly Lucky Satchel":            { rarity: "Kickstarter", limit: 1, effect: "+4% Virtue Chance | +4 ACC Ranged Skills | +3% CRIT Ranged Skills | +50% Food Consumed at Death's Door" },
  "Svalinn":                              { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | -10% Stress | +13% Healing Received | -6 DODGE if Torch below 26 | -13% Healing Received if in position 4 | -10% Debuff Resist if Torch below 26" },
  "Svallin":                              { rarity: "Kickstarter", limit: 1, effect: "+9% PROT if Torch above 75 | +15% MAX HP if Torch above 75 | -6 DODGE when attacked by Beast | -4 SPD vs Beast" },
  "T Doh Teddy Bear":                     { rarity: "Kickstarter", limit: 1, effect: "-15% Stress | -10% Trap Disarm Chance after First Round" },
  "Taersas Perseverance":                 { rarity: "Kickstarter", limit: 1, effect: "+12% Virtue Chance | +50% Food Consumed if Torch below 26" },
  "Takaras Heart":                        { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +6% Death Blow Resist | +5 ACC | -6 DODGE | -6% PROT if Torch below 26 | -13% Healing Received if Torch below 26" },
  "Talins Tale":                          { rarity: "Kickstarter", limit: 1, effect: "+6% PROT if in position 1 | +8% MAX HP | +6% Virtue Chance | -10% DMG if in position 4 | -5 ACC Ranged Skills" },
  "Talisman of Passion":                  { rarity: "Kickstarter", limit: 1, effect: "+16% Resolve XP | +12% Chance Monsters Surprised if Torch below 26 | +50% Food Consumed | -10% Move Resist if Torch above 75" },
  "Tear of Nhays":                        { rarity: "Kickstarter", limit: 1, effect: "+3 SPD | +5 DODGE | +13% Healing Received at Death's Door | +10% Stress | +10% Stress at Death's Door" },
  "Tetsuo":                               { rarity: "Kickstarter", limit: 1, effect: "+2% CRIT | +5% DMG | +2 ACC | +10% Stress if in position 4" },
  "The Black Halo":                       { rarity: "Kickstarter", limit: 1, effect: "+14% Virtue Chance if HP below 25% | +8 ACC if in position 1 | -10% Move Resist on First Round | -4% CRIT | -10% Trap Disarm Chance if Torch below 26" },
  "The Black Swordsmans Guantlet":        { rarity: "Kickstarter", limit: 1, effect: "+7 ACC if in position 1 | -15% Stress if Torch below 26 | -4 SPD | -10% Bleed Resist" },
  "The Bloodied Shroud":                  { rarity: "Kickstarter", limit: 1, effect: "+13% DMG if HP below 25% | +8 DODGE if HP below 25% | -13% Healing Received" },
  "The Book of Ruin":                     { rarity: "Kickstarter", limit: 1, effect: "+9% Death Blow Resist | +50% Food Consumed at Death's Door" },
  "The Cagoule":                          { rarity: "Kickstarter", limit: 1, effect: "+6 DODGE | +4% CRIT | +5 ACC | -13% Healing Skills if Torch below 26 | -10% Move Resist if in position 1 | -10% Trap Disarm Chance if Torch below 26" },
  "The Cod of Wisdom":                    { rarity: "Kickstarter", limit: 1, effect: "+9% PROT | +10% Stress if Torch above 75" },
  "The Cthonian Texts":                   { rarity: "Kickstarter", limit: 1, effect: "-10% Stress if Torch below 26 | +10% Blight Resist if Torch below 26 | +10% Healing Skills | +10% Stress if Torch above 75 | -10% Blight Resist if Torch above 75" },
  "The Eidolons Will":                    { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +10% MAX HP | +6% PROT | -13% Healing Received | -8% Virtue Chance | -6% Death Blow Resist" },
  "The Exiles Tears":                     { rarity: "Kickstarter", limit: 1, effect: "-8% Stress if HP below 25% | +12% Resolve XP if HP below 25% | +5% PROT if HP below 25% | -10% DMG if HP below 25%" },
  "The Face of Frost":                    { rarity: "Kickstarter", limit: 1, effect: "+10% Bleed Resist at Death's Door | +6 DODGE at Death's Door | +13% Healing Received at Death's Door | -4 SPD | +10% Stress" },
  "The Glass of Milk":                    { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | +6% PROT | +10% Stress" },
  "The Harbinger":                        { rarity: "Kickstarter", limit: 1, effect: "+5% DMG | +3% PROT | +50% HP DMG Inflicted When Starving while Camping" },
  "The Heart Shroud":                     { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +13% DMG Melee Skills | -6 DODGE" },
  "The Holy Grail":                       { rarity: "Kickstarter", limit: 1, effect: "+6% Death Blow Resist | +10% Virtue Chance if in position 1 | -6 DODGE if HP above 75%" },
  "The Man That Hides a Demon":           { rarity: "Kickstarter", limit: 1, effect: "+6 ACC if Torch below 26 | +13% DMG if Torch below 26 | +10% Stress" },
  "The Mantle of the Owl":                { rarity: "Kickstarter", limit: 1, effect: "+5% CRIT if HP below 25% | +6 ACC vs Marked | +10% Stress if Torch below 26" },
  "The News":                             { rarity: "Kickstarter", limit: 1, effect: "+6 ACC vs Marked | +17% Healing Received if Torch above 75 | +6% Death Blow Resist | -4 SPD | -6% PROT if Torch below 26 | -8% Virtue Chance" },
  "The Phalanx":                          { rarity: "Kickstarter", limit: 1, effect: "+6% PROT if in position 1 | +10% Move Resist if in position 1 | +10% Stun Resist if in position 1 | -4 SPD | -6 DODGE" },
  "The Radies":                           { rarity: "Kickstarter", limit: 1, effect: "-13% Stress at Death's Door | +5 ACC | +8 DODGE if Torch below 26 | +50% Food Consumed if Torch above 75 | -6% PROT on First Round | -10% Move Resist at Death's Door" },
  "The Ravens Brain":                     { rarity: "Kickstarter", limit: 1, effect: "+20% Resolve XP if in position 4 | -50% HP DMG Inflicted When Starving while Camping | +10% Blight Resist | -8% Chance Monsters Surprised on First Round | -10% MAX HP if HP below 25% | +50% Food Consumed" },
  "The Red Hand":                         { rarity: "Kickstarter", limit: 1, effect: "+5% CRIT Ranged Skills | +5 SPD on First Round | -10% DMG Melee Skills" },
  "The Reflectorum":                      { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +8% Death Blow Resist at Death's Door | -13% Healing Skills vs Beast" },
  "The Rolled Bones":                     { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT at Death's Door | +3% CRIT if HP below 25% | +3% CRIT if Torch below 26 | -5 ACC" },
  "The Scarecrows Brain":                 { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | -5 ACC" },
  "The Serpents Eye":                     { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +6 ACC if Torch below 26 | +50% Food Consumed if HP below 25%" },
  "The Silver Mountain":                  { rarity: "Kickstarter", limit: 1, effect: "+13% Bleed Resist if in position 4 | -13% Stress if in position 4 | +5% CRIT if in position 4 | -4% Scouting Chance while Camping | -10% Trap Disarm Chance if in position 1" },
  "The Sopsok":                           { rarity: "Kickstarter", limit: 1, effect: "+8% Disease Resist if Torch below 26 | +3 SPD if Torch below 26 | +6% Chance Monsters Surprised if Torch below 26 | -5 ACC if Torch below 26" },
  "The Spade of Aces":                    { rarity: "Kickstarter", limit: 1, effect: "+6% Death Blow Resist | +5% CRIT at Death's Door | +17% Healing Received at Death's Door | -10% Stun Resist on First Round | -10% Debuff Resist if HP above 75% | -8% Virtue Chance if in position 4" },
  "The Tattered King":                    { rarity: "Kickstarter", limit: 1, effect: "+6% CRIT vs Marked | +8% Chance Monsters Surprised | -6% Death Blow Resist when attacked by Human | +10% Stress" },
  "The Tome of Magrus":                   { rarity: "Kickstarter", limit: 1, effect: "+8% PROT at Death's Door | +8 DODGE if in position 1 | +17% Healing Skills if in position 4 | +10% Stress at Death's Door | -13% Healing Received if in position 1 | +10% Stress if in position 4" },
  "The Tome of Stixx":                    { rarity: "Kickstarter", limit: 1, effect: "+12% PROT if Torch below 26 | -8% Virtue Chance while Camping" },
  "The True Knot":                        { rarity: "Kickstarter", limit: 1, effect: "+15% Disease Resist | -6% Death Blow Resist after First Round" },
  "The Voice of the Founder":             { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +10% Disease Resist | -6 DODGE | -10% DMG | -4% CRIT" },
  "The Winning Smile":                    { rarity: "Kickstarter", limit: 1, effect: "+16% Resolve XP | +5% CRIT Melee Skills | +13% DMG if Torch above 75 | -10% Move Resist | +10% Stress if Torch below 26 | -4 SPD if HP below 25%" },
  "Things to Remember":                   { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +10% MAX HP | -13% Healing Received on First Round" },
  "Thoons Guide":                         { rarity: "Kickstarter", limit: 1, effect: "+6 ACC after First Round | +5% CRIT if in position 1 | +13% Healing Received | -10% Trap Disarm Chance while Camping | -10% Move Resist if Torch below 26 | -8% Chance Monsters Surprised while Camping" },
  "Thorwans Blood":                       { rarity: "Kickstarter", limit: 1, effect: "+8% PROT if in position 4 | +10% Debuff Resist | +50% Food Consumed" },
  "Thraximundars Rage":                   { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +10% MAX HP | +4% CRIT | -10% Bleed Resist on First Round | -10% Disease Resist on First Round | -13% Healing Skills on First Round" },
  "Thunderflux":                          { rarity: "Kickstarter", limit: 1, effect: "+3% CRIT if Torch below 26 | +6% Virtue Chance if Torch below 26 | -8% Stress if Torch below 26 | -4% Scouting Chance if Torch below 26" },
  "Tiddlywink":                           { rarity: "Kickstarter", limit: 1, effect: "+17% Healing Skills at Death's Door | +13% Healing Received | +8% Death Blow Resist at Death's Door | -6 DODGE if Torch above 75 | -5 ACC if Torch below 26 | -4 SPD" },
  "Tiny Hatespike":                       { rarity: "Kickstarter", limit: 1, effect: "+7 ACC Melee Skills | +9 DODGE if in position 1 | -8% Virtue Chance if in position 4 | -4% CRIT if in position 4" },
  "Tome of Agh'Be":                       { rarity: "Kickstarter", limit: 1, effect: "+15% MAX HP | -13% Healing Received" },
  "Tome of the Dawn":                     { rarity: "Kickstarter", limit: 1, effect: "+11% PROT if Torch below 26 | +23% Healing Skills if Torch below 26 | -10% Debuff Resist if in position 4 | -8% Virtue Chance if in position 4 | -8% Chance Monsters Surprised if in position 4" },
  "Torchwood":                            { rarity: "Kickstarter", limit: 1, effect: "+5% PROT if in position 1 | +8% Move Resist if in position 1 | -10% MAX HP" },
  "Tournament Victors Ribbon":            { rarity: "Kickstarter", limit: 1, effect: "+5 ACC | +10% DMG | +6 DODGE | +50% HP DMG Inflicted When Starving | -4 SPD if in position 4 | -4% CRIT if in position 4" },
  "Trenche Fist":                         { rarity: "Kickstarter", limit: 1, effect: "+6 DODGE | +10% DMG | +10% MAX HP | -5 ACC if Torch below 26 | -10% DMG if Torch below 26 | -6% Death Blow Resist if Torch below 26" },
  "Trials of the Trinity the Relicants":  { rarity: "Kickstarter", limit: 1, effect: "+8% Debuff Resist | +4 SPD after First Round | -8% Stress | -10% Move Resist on First Round | -10% Trap Disarm Chance if Torch above 75" },
  "Trouble":                              { rarity: "Kickstarter", limit: 1, effect: "+10% DMG Melee Skills | +4% CRIT if in position 1 | +6% Virtue Chance | -6 DODGE if in position 4 | -10% Move Resist if in position 4" },
  "Truth":                                { rarity: "Kickstarter", limit: 1, effect: "+7 ACC | +10% Stress vs Eldritch" },
  "Twilitinox":                           { rarity: "Kickstarter", limit: 1, effect: "-13% Stress if Torch below 26 | +13% Trap Disarm Chance if Torch below 26 | +10% Chance Monsters Surprised if in position 1 | -4 SPD if in position 1 | -10% Stun Resist if HP below 25% | -6% PROT if Torch below 26" },
  "Tyruil":                               { rarity: "Kickstarter", limit: 1, effect: "+10% CRIT Ranged Skills | +50% Food Consumed on First Round | -6 DODGE on First Round | -13% Healing Received on First Round" },
  "Vanders Signet":                       { rarity: "Kickstarter", limit: 1, effect: "-13% Stress if in position 4 | +6 ACC if Torch above 75 | +50% HP DMG Inflicted When Starving while Camping" },
  "Vial of Tears":                        { rarity: "Kickstarter", limit: 1, effect: "+10% DMG | +13% Debuff Resist if Torch above 75 | +5 ACC | -8% Chance Monsters Surprised | -13% Healing Received | -6% Death Blow Resist if Torch above 75" },
  "Violets Pet":                          { rarity: "Kickstarter", limit: 1, effect: "+3 SPD | +4% CRIT Melee Skills | +5 ACC Melee Skills | +50% HP DMG Inflicted When Starving | +50% Food Consumed" },
  "Wadmalaw":                             { rarity: "Kickstarter", limit: 1, effect: "+10% MAX HP | -10% Stress | -6% Death Blow Resist when attacked by Eldritch | -10% Debuff Resist" },
  "Winstons Revenge":                     { rarity: "Kickstarter", limit: 1, effect: "-10% Stress | +6% PROT | +8% Chance Monsters Surprised | +50% Food Consumed | +50% HP DMG Inflicted When Starving" },
  "Winter Veil":                          { rarity: "Kickstarter", limit: 1, effect: "+8% Bleed Resist | +13% Healing Received if HP below 25% | +6% PROT Ranged Skills | +50% Food Consumed if in position 1 | +50% HP DMG Inflicted When Starving if in position 1" },
  "Wondergoths Special Blend":            { rarity: "Kickstarter", limit: 1, effect: "+9% PROT if in position 4 | -15% Stress if in position 4 | -8% Virtue Chance if in position 1 | -10% Blight Resist if in position 1" },
  "Wrath of Khan":                        { rarity: "Kickstarter", limit: 1, effect: "+4% CRIT | +5 ACC | +10% DMG | -4 SPD | -13% Healing Received | -6% PROT" },
  "Yogs Thousand Eyes":                   { rarity: "Kickstarter", limit: 1, effect: "+4 ACC | +6% PROT when attacked by Eldritch | +6% PROT when attacked by Unholy | +10% Stress vs Human | -10% Blight Resist if Torch below 26" },
  "Zephyr":                               { rarity: "Kickstarter", limit: 1, effect: "+13% Healing Skills | +4 SPD | -10% Stress | -4% CRIT on First Round | -10% DMG vs Beast | -5 ACC vs Unholy" },
  "Zuilong":                              { rarity: "Kickstarter", limit: 1, effect: "+6% PROT | +8 DODGE when attacked by Unholy | +16% Resolve XP | -10% MAX HP | -10% Trap Disarm Chance if Torch below 26 | -6 DODGE on First Round" },
};

/**
 * Look up a trinket's effect.
 * @param {string} name - Exact trinket name.
 * @returns {{ rarity: string|null, effect: string }|null} Null when unknown.
 */
export function getTrinketEffect(name) {
  if (!name) return null;
  return TRINKET_EFFECTS[name] || null;
}

/**
 * One-line summary for tooltips: "Rare \u2014 +10% DMG | +3 SPD | -10% MAX HP".
 * @param {string} name - Exact trinket name.
 * @returns {string} Empty string when the trinket has no known effect.
 */
export function getTrinketEffectText(name) {
  const entry = getTrinketEffect(name);
  if (!entry) return '';
  return entry.rarity ? `${entry.rarity} \u2014 ${entry.effect}` : entry.effect;
}

/**
 * Cuantas copias de este trinket se pueden llevar a la vez, o `Infinity`.
 *
 * Es lo que hace que un equipo no pueda salir con dos Abominations llevando la
 * misma `Broken Key`: no hay dos. La regla es del OBJETO y no de su rareza --
 * hay once `Very Rare` unicos y veintinueve que no lo son-- asi que se lee del
 * dato y no se deduce de la etiqueta.
 *
 * Un trinket que esta app no conoce no tiene tope, que es la respuesta prudente:
 * inventarse un limite prohibiria equipar algo legal.
 *
 * @param {string} name - Exact trinket name.
 * @returns {number} 1 for the unique ones, `Infinity` when there is no cap.
 */
export function getTrinketLimit(name) {
  const entry = getTrinketEffect(name);
  return entry && entry.limit ? entry.limit : Infinity;
}

/**
 * Trinket set bonuses. A set's `bonus` applies only when both `members` are
 * equipped on the same hero. Keyed by the game's internal set id.
 * @type {Record<string, { label: string, members: string[], bonus: string }>}
 */
export const TRINKET_SETS = {
  "cc_abom": { label: "Crimson Court Set", members: ["Shameful Shroud", "Osmond Chains"], bonus: "+20% DMG if in position 1" },
  "cc_anti": { label: "Crimson Court Set", members: ["Two of Three", "The Master's Essence"], bonus: "+4 SPD | +10 DODGE" },
  "cc_arb": { label: "Crimson Court Set", members: ["Bedtime Story", "Childhood Treasure"], bonus: "+25% PROT" },
  "cc_bh": { label: "Crimson Court Set", members: ["Crime Lords' Molars", "Vengeful Kill List"], bonus: "+5% CRIT vs Marked | +5% CRIT vs Stunned | +5% CRIT vs Bleeding" },
  "cc_cru": { label: "Crimson Court Set", members: ["Glittering Spaulders", "Signed Conscription"], bonus: "+20% MAX HP" },
  "cc_flag": { label: "Crimson Court Set", members: ["Chipped Tooth", "Shard of Glass"], bonus: "+10% Death Blow Resist" },
  "cc_gr": { label: "Crimson Court Set", members: ["Absinthe", "Sharpened Letter Opener"], bonus: "+5% CRIT" },
  "cc_hel": { label: "Crimson Court Set", members: ["Lioness Warpaint", "Mark of the Outcast"], bonus: "+7 ACC | +7 DODGE" },
  "cc_high": { label: "Crimson Court Set", members: ["Shameful Locket", "Bloodied Neckerchief"], bonus: "+45% Virtue Chance" },
  "cc_hm": { label: "Crimson Court Set", members: ["Battered Lawman's Badge", "Evidence of Corruption"], bonus: "+25% DMG vs Bleeding | +5% CRIT vs Bleeding" },
  "cc_jest": { label: "Crimson Court Set", members: ["Tyrant's Tasting Cup", "Tyrant's Fingerbone"], bonus: "+33% Stress Skills while Camping" },
  "cc_lep": { label: "Crimson Court Set", members: ["Tin Flute", "Last Will and Testament"], bonus: "+15 ACC if HP above 60%" },
  "cc_maa": { label: "Crimson Court Set", members: ["Old Unit Standard", "Toy Soldier"], bonus: "Riposte: +25% DMG | Riposte: +10 ACC" },
  "cc_msk": { label: "Crimson Court Set", members: ["Silver Musket Ball", "Second Place Trophy"], bonus: "+25% PROT" },
  "cc_occ": { label: "Crimson Court Set", members: ["Vial of Sand", "Blood Pact"], bonus: "+15 DODGE" },
  "cc_pd": { label: "Crimson Court Set", members: ["Subject #40 Notes", "Dissection Kit"], bonus: "+15% Blight Skill Chance | +15% Stun Skill Chance" },
  "cc_vest": { label: "Crimson Court Set", members: ["Atonement Beads", "Salacious Diary"], bonus: "+35% Debuff Skill Chance | +35% Stun Skill Chance" },
  "duelist_set1": { label: "Fire's Edge Set", members: ["Académie Ring", "Lover's Glove"], bonus: "+33% DMG vs position 1" },
  "rw_set1": { label: "Fire's Edge Set", members: ["Carved Toy", "Knitted Blanket"], bonus: "+50% Burn Skill Amount" },
  "sb_set1": { label: "Shieldbreaker Set", members: ["Obsidian Dagger", "Severed Hand"], bonus: "+15% MAX HP | +10% PROT | Can't be Guarded" },
};

const TRINKET_TO_SET = {};
for (const [id, set] of Object.entries(TRINKET_SETS)) {
  for (const m of set.members) TRINKET_TO_SET[m] = { id, ...set };
}

/**
 * The set a single trinket belongs to, or null. Present regardless of what
 * else is equipped - the caller decides whether the bonus is active.
 * @param {string} name - Exact trinket name.
 */
export function getTrinketSet(name) {
  return (name && TRINKET_TO_SET[name]) || null;
}

/**
 * The set bonus for a pair of trinkets, plus whether it is active (both
 * members equipped). Returns null when neither trinket belongs to a set.
 * @param {string} a - First equipped trinket name.
 * @param {string} b - Second equipped trinket name.
 * @returns {{ id: string, label: string, members: string[], bonus: string, active: boolean }|null}
 */
export function getSetBonus(a, b) {
  const set = getTrinketSet(a) || getTrinketSet(b);
  if (!set) return null;
  const active = set.members.includes(a) && set.members.includes(b) && a !== b;
  return { ...set, active };
}
