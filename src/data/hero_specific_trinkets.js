/**
 * Hero-Specific Trinkets for Darkest Dungeon
 * These trinkets can only be equipped by the specific hero class listed.
 * 
 * Based on: https://darkestdungeon.wiki.gg/wiki/Trinkets
 * 
 * Categories:
 * - Normal Hero Trinkets: Common, Uncommon, Rare, Very Rare
 * - Crimson Court Set Trinkets: Paired trinkets with set bonuses
 * - Color of Madness Crystalline Trinkets: Purchased with Crystal Shards
 */

// Abomination-specific trinkets
export const ABOMINATION_TRINKETS = [
  // Normal Hero Trinkets
  'Lock of Patience',           // Common - +10% Virtue Chance
  'Padlock of Transference',    // Uncommon - +20% Stun/Blight Skill Chance
  'Protective Padlock',         // Uncommon - +15% PROT -1 SPD
  'Lock of Fury',               // Rare - +10% DMG +3 SPD -10% MAX HP
  'Restraining Padlock',        // Very Rare - Transform: -40% Stress Inflicted on Party
  // Crimson Court Set
  'Shameful Shroud',            // CC Set - -15% Stress +10 DODGE
  'Osmond Chains',              // CC Set - +20% DMG Ranged Skills +8% CRIT Ranged Skills
  // Color of Madness
  'Broken Key'                  // Crystalline - +15 ACC +35% Stun Skill Chance +10% Stress
];

// Antiquarian-specific trinkets
export const ANTIQUARIAN_TRINKETS = [
  // Normal Hero Trinkets
  'Bag of Marbles',             // Common - +10 DODGE
  'Bloodcourse Medallion',      // Uncommon - +33% Healing Received
  'Carapace Idol',              // Uncommon - +25% PROT
  'Fleet Florin',               // Rare - +4 SPD +20% Debuff Skill Chance
  'Candle of Life',             // Very Rare - +50% Healing Skills +15% MAX HP
  // Crimson Court Set
  'The Master\'s Essence',      // CC Set - +50% Healing/Blight/Debuff Skills
  'Two of Three',               // CC Set - +50% DMG vs Blighted +8% CRIT vs Blighted
  // Color of Madness
  'Smoking Skull'               // Crystalline - +35 DODGE if Shard Dust in inventory
];

// Arbalest-specific trinkets
export const ARBALEST_TRINKETS = [
  // Normal Hero Trinkets
  'Sturdy Greaves',             // Common - +30% Move Resist +30% Move Skill Chance -1 SPD
  'Vengeful Greaves',           // Common - +3% CRIT
  'Medic\'s Greaves',           // Uncommon - +33% Healing Skills
  'Bull\'s Eye Bandana',        // Rare - +8 ACC +5% CRIT -4 DODGE
  'Wrathful Bandana',           // Very Rare - +25% DMG if in position 4
  // Crimson Court Set
  'Childhood Treasure',         // CC Set - +30% Healing Skills
  'Bedtime Story',              // CC Set - +15 ACC vs Marked +8% CRIT vs Marked
  // Color of Madness
  'Keening Bolts'               // Crystalline - +20% DMG +7% CRIT Ranged Skills
];

// Bounty Hunter-specific trinkets
export const BOUNTY_HUNTER_TRINKETS = [
  // Normal Hero Trinkets
  'Agility Talon',              // Common - +1 SPD +4 DODGE
  'Unmovable Helmet',           // Common - +30% Move Resist +20% Move Skill Chance
  'Camper\'s Helmet',           // Uncommon - +20% Stress Heal while Camping +10% Scouting
  'Hunter\'s Talons',           // Rare - +6% CRIT +10 ACC +50% Food Consumed
  'Wounding Helmet',            // Very Rare - +25% DMG Melee Skills
  // Crimson Court Set
  'Crime Lords\' Molars',       // CC Set - +20% DMG vs Marked/Stunned/Bleeding
  'Vengeful Kill List',         // CC Set - +50% Move Skill Chance +35% Bleed Skill Chance
  // Color of Madness
  'Mask Of The Timeless'        // Crystalline - +2 SPD +15 DODGE +5% Stress
];

// Crusader-specific trinkets
export const CRUSADER_TRINKETS = [
  // Normal Hero Trinkets
  'Defender\'s Seal',           // Common - +5% PROT -3% CRIT
  'Knight\'s Crest',            // Common - +10% MAX HP
  'Swordsman\'s Crest',         // Common - +10% DMG Melee Skills -50% Healing Skills
  'Paralyzer\'s Crest',         // Uncommon - +20% Stun Skill Chance -2 DODGE
  'Commander\'s Orders',        // Rare - +15% Stress Heal Received +33% Healing Skills
  'Holy Orders',                // Very Rare - +15% Virtue Chance -20% Stress
  // Crimson Court Set
  'Glittering Spaulders',       // CC Set - +15% PROT +35% Move Resist -15% Stress
  'Signed Conscription',        // CC Set - +20% Healing/Stress Skills
  // Color of Madness
  'Non Euclidean Hilt'          // Crystalline - +15% MAX HP +25% Stun Skill Chance
];

// Flagellant-specific trinkets (Crimson Court DLC)
export const FLAGELLANT_TRINKETS = [
  // Normal Hero Trinkets
  'Heartburst Hood',            // Common - +4 SPD if HP below 40%
  'Resurrection\'s Collar',     // Uncommon - +33% Healing Skills -15% Bleed Skill Chance
  'Punishment\'s Hood',         // Uncommon - +20% Bleed Skill Chance -20% Healing Skills
  'Suffering\'s Collar',        // Rare - +20% Bleed/Blight Resist if HP below 40% +10% MAX HP
  'Eternity\'s Collar',         // Very Rare - +10% Death Blow Resist +20 DODGE at Death's Door
  // Crimson Court Set
  'Chipped Tooth',              // CC Set - +20% MAX HP +35% Move Resist
  'Shard of Glass',             // CC Set - +35% Bleed Skill Chance -20% Bleed Resist
  // Color of Madness
  'Acidic Husk Ichor'           // Crystalline - -25% MAX HP +30% DMG +30% Bleed vs Husk
];

// Grave Robber-specific trinkets
export const GRAVE_ROBBER_TRINKETS = [
  // Normal Hero Trinkets
  'Quickening Satchel',         // Common - +2 SPD
  'Sickening Satchel',          // Common - +20% DMG vs Blighted
  'Blighting Satchel',          // Uncommon - +25% Blight Skill Chance +1 SPD -4 DODGE
  'Lucky Talisman',             // Rare - +12 DODGE +10 ACC Ranged Skills +10% Stress
  'Raider\'s Talisman',         // Very Rare - +5% CRIT +30% Trap Disarm +2 SPD +15% Scouting
  // Crimson Court Set
  'Absinthe',                   // CC Set - +35% Disease/Blight Resist +35% Blight Skill Chance
  'Sharpened Letter Opener',    // CC Set - +25% DMG Melee Skills +10 ACC Melee Skills
  // Color of Madness
  'Topshelf Tonic'              // Crystalline - +15 DODGE if Medicinal Herbs +3 SPD
];

// Hellion-specific trinkets
export const HELLION_TRINKETS = [
  // Normal Hero Trinkets
  'Bleeding Pendant',           // Common - +15% Bleed Skill Chance
  'Selfish Pendant',            // Common - -15% Stress
  'Double-Edged Pendant',       // Uncommon - +15% MAX HP -20% Stun Resist
  'Heaven\'s Hairpin',          // Rare - -25% Stress if Torch above 75 +10 ACC
  'Hell\'s Hairpin',            // Very Rare - +10% CRIT if Torch below 25 +15 ACC
  // Crimson Court Set
  'Lioness Warpaint',           // CC Set - +20/40/60% DMG based on HP
  'Mark of the Outcast',        // CC Set - +2 SPD +35% Bleed Skill Chance +15% Death Blow Resist
  // Color of Madness
  'Thirsting Blade'             // Crystalline - +15 ACC +2 SPD +8% CRIT vs Bleeding
];

// Highwayman-specific trinkets
export const HIGHWAYMAN_TRINKETS = [
  // Normal Hero Trinkets
  'Drifter\'s Buckle',          // Common - +10% Trap Disarm +4 DODGE -5% Stress Heal
  'Flashfire Gunpowder',        // Common - +10% DMG Ranged Skills -20% Stun Resist
  'Stalwart Buckle',            // Common - +5% CRIT +5% Stress -3% Virtue Chance
  'Dodgy Sheath',               // Uncommon - +8 DODGE +1 SPD -10 ACC Ranged Skills
  'Sharpening Sheath',          // Rare - +7% CRIT Melee Skills +40% Bleed Skill Chance -1 SPD
  'Gunslinger\'s Buckle',       // Very Rare - +20% DMG Ranged +15 ACC Ranged -10% DMG Melee
  // Crimson Court Set
  'Bloodied Neckerchief',       // CC Set - +2 SPD +10 DODGE
  'Shameful Locket',            // CC Set - +10 ACC +5% CRIT +15% Stress
  // Color of Madness
  'Crystalline Gunpowder'       // Crystalline - +20% DMG +3 SPD -15% Stun Resist
];

// Houndmaster-specific trinkets
export const HOUNDMASTER_TRINKETS = [
  // Normal Hero Trinkets
  'Agility Whistle',            // Common - +4 DODGE +1 SPD -20% Debuff Resist
  'Scouting Whistle',           // Common - +20% Scouting if Torch below 51 +20% Trap Disarm
  'Cudgel Weight',              // Uncommon - +25% Stun Skill Chance -1 SPD
  'Protective Collar',          // Rare - +12 DODGE -15% DMG
  'Spiked Collar',              // Very Rare - +20% DMG +30% Bleed Skill Chance -50% Healing
  // Crimson Court Set
  'Evidence of Corruption',     // CC Set - +25% Scouting -15% Chance Party Surprised
  'Battered Lawman\'s Badge',   // CC Set - +15 ACC Ranged +50% Stress Skills Camping
  // Color of Madness
  'Huskfang Whistle'            // Crystalline - +50% Bleed Skill Chance if Dog Treats
];

// Jester-specific trinkets
export const JESTER_TRINKETS = [
  // Normal Hero Trinkets
  'Bloody Dice',                // Common - +30% Bleed Skill Chance -10% Bleed Resist
  'Lucky Dice',                 // Common - +4 ACC +4 DODGE
  'Critical Dice',              // Uncommon - +7% CRIT
  'Bright Tambourine',          // Rare - +20% Stress Skills -25% Stress if Torch above 75
  'Dark Tambourine',            // Very Rare - +12% Death Blow Resist -25% Stress if Torch below 26
  // Crimson Court Set
  'Tyrant\'s Tasting Cup',      // CC Set - +33% Stress Skills +25% Stress
  'Tyrant\'s Fingerbone',       // CC Set - +3 SPD if in position 1 +20 DODGE if in position 1
  // Color of Madness
  'Dirge For The Devoured'      // Crystalline - +25% Stress Skills +25% DMG if Laudanum
];

// Leper-specific trinkets
export const LEPER_TRINKETS = [
  // Normal Hero Trinkets
  'Healing Armlet',             // Common - +20% Healing Received
  'Redemption Armlet',          // Common - +15% DMG if in position 1 -3% Virtue Chance
  'Fortunate Armlet',           // Uncommon - +8 ACC +3% CRIT +10% Stress
  'Immunity Mask',              // Rare - +40% Stun Resist +30% Blight/Bleed Resist -10% MAX HP
  'Berserk Mask',               // Very Rare - +8% CRIT +3 SPD -10% Virtue Chance -33% Healing Received
  // Crimson Court Set
  'Last Will and Testament',    // CC Set - +15% PROT +15% MAX HP -10% Death Blow Resist
  'Tin Flute',                  // CC Set - -20% Stress +33% Stress Skills Camping
  // Color of Madness
  'Petrified Amulet'            // Crystalline - +10 ACC if Bandage +15% MAX HP
];

// Man-at-Arms-specific trinkets
export const MAN_AT_ARMS_TRINKETS = [
  // Normal Hero Trinkets
  'Cleansing Eyepatch',         // Common - +30% Blight Resist +20% Disease Resist -2 DODGE
  'Sly Eyepatch',               // Common - +4 DODGE -10% Stun/Move Resist
  'Longevity Eyepatch',         // Uncommon - +15% MAX HP -2 SPD
  'Rampart Shield',             // Rare - +40% Move Skill Chance +30% Stun Skill Chance -15% DMG
  'Guardian\'s Shield',         // Very Rare - +10% PROT/50% Healing/10 DODGE if in position 4
  // Crimson Court Set
  'Old Unit Standard',          // CC Set - +15% Stun +20% Debuff +15% Death Blow Resist
  'Toy Soldier',                // CC Set - +10% PROT +5% CRIT
  // Color of Madness
  'Mirror Shield'               // Crystalline - +10 DODGE 30% Damage Reflection
];

// Musketeer-specific trinkets
export const MUSKETEER_TRINKETS = [
  // Normal Hero Trinkets
  'Sturdy Boots',               // Common - +30% Move Resist +30% Move Skill Chance -1 SPD
  'Vengeful Boots',             // Common - +3% CRIT
  'Medic\'s Boots',             // Uncommon - +33% Healing Skills
  'Bull\'s Eye Hat',            // Rare - +8 ACC +5% CRIT -4 DODGE
  'Wrathful Hat',               // Very Rare - +25% DMG if in position 4
  // Crimson Court Set
  'Second Place Trophy',        // CC Set - +30% Healing Skills
  'Silver Musket Ball',         // CC Set - +15 ACC vs Marked +8% CRIT vs Marked
  // Color of Madness
  'Icosahedric Musket Balls'    // Crystalline - +20% DMG +20% Random Target Chance
];

// Occultist-specific trinkets
export const OCCULTIST_TRINKETS = [
  // Normal Hero Trinkets
  'Eldritch Killing Incense',   // Common - +6% CRIT vs Eldritch +15% DMG vs Eldritch
  'Evasion Incense',            // Common - +8 DODGE -1 SPD
  'Cursed Incense',             // Uncommon - +40% Debuff/20% Move Skill Chance -10% MAX HP
  'Sacrificial Cauldron',       // Rare - +20% DMG +10% Stress
  'Demon\'s Cauldron',          // Very Rare - +30% Stun +40% Debuff +3% CRIT -10% Virtue
  // Crimson Court Set
  'Blood Pact',                 // CC Set - +4 SPD/25% DMG if Torch below 60
  'Vial of Sand',               // CC Set - +20% Debuff/Stun/Move Skill Chance
  // Color of Madness
  'Petrified Skull'             // Crystalline - +40% PROT vs Husk +30% PROT vs Eldritch
];

// Plague Doctor-specific trinkets
export const PLAGUE_DOCTOR_TRINKETS = [
  // Normal Hero Trinkets
  'Diseased Herb',              // Common - +40% Disease Resist
  'Rotgut Censer',              // Common - +8 ACC -5% MAX HP
  'Witch\'s Vial',              // Common - +15% Stun Skill Chance
  'Poisoned Herb',              // Uncommon - +40% Blight Skill Chance -15% MAX HP
  'Bloody Herb',                // Rare - +10 ACC Melee +30% Bleed Skill Chance +20% DMG Melee
  'Blasphemous Vial',           // Very Rare - +10 ACC Ranged +20% Stun/Blight Skill Chance +25% Stress
  // Crimson Court Set
  'Subject #40 Notes',          // CC Set - +25% MAX HP +35% Disease Resist
  'Dissection Kit',             // CC Set - +35% Bleed Skill Chance +25% DMG
  // Color of Madness
  'Ashen Distillation'          // Crystalline - +20 DODGE +25% Blight Skill Chance
];

// Shieldbreaker-specific trinkets (The Shieldbreaker DLC)
export const SHIELDBREAKER_TRINKETS = [
  // Normal Hero Trinkets (from Nightmares)
  'Venomous Vial',              // Common - +30% Blight Skill Chance (Nightmare 1)
  'Shimmering Scale',           // Uncommon - +10% PROT +5% Stress (Nightmare 2)
  'Dancer\'s Footwraps',        // Uncommon - +40% Move Resist +2 SPD (Nightmare 3)
  'Fanged Spear Tip',           // Rare - +35% DMG vs Marked -10% DMG (Nightmare 4)
  'Cuirboilli',                 // Very Rare - +33% MAX HP -2 SPD (Nightmare 5)
  // Shieldbreaker Set Trinkets (Nightmares 6 & 7)
  'Obsidian Dagger',            // SB Set - +40% Debuff/Blight Skill Chance
  'Severed Hand',               // SB Set - +50% Blight Resist -10% Stress
  // Color of Madness
  'Spectral Speartip'           // Crystalline - +15% DMG +20% Blight Skill Chance +15% MAX HP
];

// Vestal-specific trinkets
export const VESTAL_TRINKETS = [
  // Normal Hero Trinkets
  'Virtuous Chalice',           // Common - +10% Virtue Chance -5% MAX HP
  'Haste Chalice',              // Uncommon - +8 SPD First Round +2 SPD after -25% Stun Skill Chance
  'Youth Chalice',              // Uncommon - +20% MAX HP -10% DMG
  'Profane Scroll',             // Rare - +15% DMG +10% PROT/33% Healing if in position 2 +15% Stress
  'Tome of Holy Healing',       // Rare - +25% Healing Skills -15% MAX HP
  'Sacred Scroll',              // Very Rare - -10% Stress +33% Healing Skills -10% Stun -33% DMG
  // Crimson Court Set
  'Atonement Beads',            // CC Set - +15% DMG Melee +8% CRIT Melee -15% Virtue Chance
  'Salacious Diary',            // CC Set - +33% Stress Skills Camping +25% Healing Skills
  // Color of Madness
  'Heretical Passage',          // Crystalline - +20% Healing if Holy Water +25% DMG vs Husk/Eldritch
  // Butcher's Circus (PvP)
  'Idol of Purity',             // Ringmaster - +33% Healing Skills -15% Stress
  'Gleaming Breastplate',       // Ringmaster - +15% PROT +8% Death Blow Resist -4% Crits Received
  'Purgation Talisman',         // Ringmaster - +25% DMG Melee +7% CRIT Melee +12 ACC +20% Debuff
  'Tome of Fury'                // Ringmaster - +15 ACC Ranged +40% Debuff +30% Stun/Daze
];

// ===== BUTCHER'S CIRCUS HERO-SPECIFIC TRINKETS (PvP DLC) =====

// Abomination Butcher's Circus trinkets
export const ABOMINATION_BC_TRINKETS = [
  'Shattered Padlock',          // +15% DMG Melee +15% Move +3% CRIT + Bleed on hit
  'Spiked Chain',               // +20% DMG Ranged +15% Stun/Daze +20% Blight
  'Wretch\'s Cloak',            // +20% Stress Dealt +10 ACC +33% Horror Duration
  'Taste of Grandeur',          // +10% DMG +4 ACC +25% Virtue Chance
  'Clasp of the Beast'          // +10% PROT +10% MAX HP + Stress on hit
];

// Antiquarian Butcher's Circus trinkets
export const ANTIQUARIAN_BC_TRINKETS = [
  'Black Diamond Mirror',       // +15% MAX HP +15 DODGE +10% Stress
  'Tears of the Lost',          // +30% Virtue Chance -15% Stress +20% Debuff Resist
  'Ghoul Claw',                 // +25% DMG Melee +6% CRIT Melee +10 ACC + Horror on hit
  'Impossible Glyph',           // +20% Stress Dealt +30% Debuff +6 ACC
  'Materia Pestis'              // +20% Blight +33% Blight Duration
];

// Arbalest Butcher's Circus trinkets
export const ARBALEST_BC_TRINKETS = [
  'Piercing Quarrel',           // +10% DMG Ranged +7% CRIT Ranged + Armor Piercing
  'Medic Fullplate',            // +33% Healing +15% PROT -15% Stress
  'Stabilizing Tiller',         // +15% DMG when acting Last +12 ACC when Last + vs Marked bonuses
  'Weighted Bolas'              // +30% Move +20% Debuff +12 ACC
];

// Bounty Hunter Butcher's Circus trinkets
export const BOUNTY_HUNTER_BC_TRINKETS = [
  'Bounty Notice',              // +20% DMG vs Marked +10 ACC vs Marked +4% CRIT vs Marked
  'Grappling Mits',             // +25% Move +20% Stun/Daze +8 ACC
  'Heart Seeker',               // +25% DMG Melee +10% Death Blow Dealt Chance
  'Infamous Visage'             // +20% DMG vs Afflicted +10% CRIT vs Afflicted + Stress on hit
];

// Crusader Butcher's Circus trinkets
export const CRUSADER_BC_TRINKETS = [
  'Writ of Execution',          // +10% DMG +8 ACC +15% Stress Dealt +10% Death Blow Dealt
  'Glorious Standard',          // +33% Healing +30% Stress Skills +30% Move Resist -15% Stress
  'Sacred Blade',               // +15% DMG Melee +20% Stun/Daze +30% Virtue Chance
  'Battle Scarred Helm'         // +5% PROT +15% MAX HP +8% Death Blow Resist
];

// Flagellant Butcher's Circus trinkets
export const FLAGELLANT_BC_TRINKETS = [
  'Confessor Gauntlet',         // +15% DMG vs Bleeding +5% CRIT vs Bleeding +6 ACC
  'Crown of Thorns',            // +15 ACC +15% DMG while Bleeding + Self Bleed on attack
  'Madman Collar',              // +10% Healing Received +30% Bleed if Afflicted +25% DMG if Afflicted
  'Gauntlet of Absolution',     // +33% Healing +10% PROT + Stress heal on being hit
  'Last Breath Collar'          // +12% Death Blow Resist +20 DODGE at Death's Door
];

// Grave Robber Butcher's Circus trinkets
export const GRAVE_ROBBER_BC_TRINKETS = [
  'Well Balanced Stiletto',     // +10% DMG + cross-buff on Melee/Ranged hits
  'Cloak and Dagger',           // +15% DMG Melee +10% Death Blow Melee + Stealth bonuses
  'Leather Bandolier',          // +10% DMG Ranged +8 DODGE +5% CRIT
  'Satchel of Dirty Tricks'     // +10 ACC +4 DODGE +20% Blight +10% Stress Dealt
];

// Hellion Butcher's Circus trinkets
export const HELLION_BC_TRINKETS = [
  'Razor Pin',                  // +10 ACC +20% Bleed
  'Bone Vest',                  // +10% PROT +8% Death Blow Resist +20% Stress Dealt +10% Stress
  'Savage Gauntlets',           // +8 ACC +5% CRIT +25% DMG if Afflicted +15% Stress
  'Executioner Halberd'         // +15% DMG +3% CRIT +10% Death Blow Dealt
];

// Highwayman Butcher's Circus trinkets
export const HIGHWAYMAN_BC_TRINKETS = [
  'Grim Bandana',               // +10% DMG +3% CRIT +20% Stress Dealt +10% Stress
  'Parrying Dagger',            // +10% DMG Melee +5 ACC Melee +30% Bleed + Riposte bonuses
  'Powder Flask',               // +20% DMG Ranged +15 ACC Ranged -20% Stun Resist
  'Sturdy Buckle',              // +4 DODGE +15% MAX HP -10% Stress +30% Stun Resist
  'Duelist\'s Pistol'           // +10% DMG Ranged +5% CRIT +30% Move +10 ACC if in position 1
];

// Houndmaster Butcher's Circus trinkets
export const HOUNDMASTER_BC_TRINKETS = [
  'Attack Whistle',             // +20% Bleed +12 ACC
  'Tattered Chewtoy',           // -15% Stress +50% Stress Skills while Guarding +15% Healing Received
  'Padded Armguard',            // +15% PROT while Guarding +12 DODGE +33% Guard Duration
  'Training Whistle'            // +15% DMG vs Marked +15% DMG Ranged +8% CRIT Ranged
];

// Jester Butcher's Circus trinkets
export const JESTER_BC_TRINKETS = [
  'Reaper Shroud',              // +15% DMG +3% CRIT +20 ACC vs HP below 35%
  'Well Tuned Lute',            // +30% Stress Skills -20% Stress
  'Blood-red Coin',             // +20% Bleed +25% DMG vs Bleeding +10 ACC vs Bleeding
  'Harlequin Masque'            // +20% MAX HP + Stress heal on Melee hit
];

// Leper Butcher's Circus trinkets
export const LEPER_BC_TRINKETS = [
  'Gladiator Mask',             // +15% DMG +3% CRIT
  'Durable Armlet',             // +10% MAX HP +12 ACC
  'Invigorating Balm',          // +20% Healing Received +20% Blight/Bleed Resist +8% Death Blow Resist
  'Sharpening Stone'            // +6% CRIT + Bleed on hit
];

// Man-at-Arms Butcher's Circus trinkets
export const MAN_AT_ARMS_BC_TRINKETS = [
  'Insignia of Rank',           // +12 ACC +3% CRIT +20% Debuff + Party buff on Crit
  'Protector\'s Kite',          // +5% PROT +15% MAX HP +33% Guard Duration
  'Survivor Eyepatch',          // +12 DODGE +20% Blight Resist +15% Healing while Guarding
  'Veteran Gauntlet',           // +10% DMG +20% Stun/Daze +20% Move + Daze on hit
  'Shield Spike'                // Riposte bonuses + Bleed on Riposte hit
];

// Musketeer Butcher's Circus trinkets
export const MUSKETEER_BC_TRINKETS = [
  'Minié Ball',                 // +10% DMG Ranged +7% CRIT Ranged + Armor Piercing
  'Tincture of Iodine',         // +33% Healing -15% Stress + Cure Blight on Heal
  'Iron Sights',                // +15% DMG when acting Last +12 ACC when Last + vs Marked bonuses
  'Buckshot Cartridge'          // +30% Move +20% Debuff +12 ACC
];

// Occultist Butcher's Circus trinkets
export const OCCULTIST_BC_TRINKETS = [
  'Fleshbound Grimoire',        // +15 ACC Ranged +20% Move +33% Horror Duration
  'Calling Salts',              // +15% DMG Ranged +4% CRIT Ranged +15% DMG vs Marked +10 ACC vs Marked
  'Hand of Glory',              // +20% Stress Dealt +30% Debuff
  'Bleeding Skull',             // +15% MAX HP +4 additional HP Healed + Death Blow debuff on heal
  'Sacrificial Kris'            // +20% DMG Melee +10 ACC Melee + Mark on hit
];

// Plague Doctor Butcher's Circus trinkets
export const PLAGUE_DOCTOR_BC_TRINKETS = [
  'Volatile Concoction',        // +20% Blight +15 ACC
  'Hazard Mask',                // +8 ACC +15% MAX HP +15% Healing Received +20% Blight Resist
  'Acrid Vial',                 // +20% Stress Dealt +20% Debuff +30% Move
  'Amputation Saw'              // +30% DMG Melee +30% Bleed +10 ACC vs Bleeding
];

// Shieldbreaker Butcher's Circus trinkets
export const SHIELDBREAKER_BC_TRINKETS = [
  'Graceful Anklet',            // +15 DODGE +4 ACC
  'Viper Spear Tip',            // +10 ACC +20% Blight
  'Scaled Shoulder',            // +5% PROT +10% MAX HP +12% Death Blow Resist
  'Fang Talisman'               // +15% DMG +3% CRIT +10% DMG vs Blighted
];

// Duelist-specific trinkets (Fire's Edge DLC)
export const DUELIST_TRINKETS = [
  'Steel-tip Boots',            // Common - Stun skill chance + Aggressive CRIT
  'Blade Oil',                  // Uncommon - CRIT + on kill riposte buff
  'Gilded Mantle',              // Uncommon - Crits received + Dodge vs Marked
  'Razor Hilt',                 // Rare - ACC vs Bleeding + Bleed resist + riposte effects
  "Champion's Mantle",          // Very Rare - Rank-based DMG + Dodge + riposte activation
  "Académie Ring",              // Set - Académie Duello set piece
  "Lover's Glove",              // Set - Académie Duello set piece
  'Phantom Wit'                 // Very Rare - Ghastly miasma trinket
];

// Runaway-specific trinkets (Fire's Edge DLC)
export const RUNAWAY_TRINKETS = [
  'Warm Scarf',                 // Common - Dodge + progressive art on dodge
  'Pyro Accelerant',            // Uncommon - Attack debuffs + self burn
  'Charcoal Effigy',            // Uncommon - Self heal when hit + progressive art
  "Rescuer's Rucksack",         // Rare - MAX HP + CRIT + friendly skill heal
  'Infernal Coalstone',         // Very Rare - SPD + wildfire + knockback/pull
  'Carved Toy',                 // Set - Runaway set piece
  'Knitted Blanket',            // Set - Runaway set piece
  'Inert Sunstone',             // Transforms into Heated Sunstone
  'Heated Sunstone',            // Transforms into Scorching Sunstone
  'Scorching Sunstone',         // Transforms into Searing Sunstone
  'Searing Sunstone'            // Final form - perilous to bear
];

/**
 * Master map of hero class names to their specific trinkets
 * Combines base game trinkets with Butcher's Circus trinkets
 */
export const HERO_SPECIFIC_TRINKETS = {
  'Abomination': [...ABOMINATION_TRINKETS, ...ABOMINATION_BC_TRINKETS],
  'Antiquarian': [...ANTIQUARIAN_TRINKETS, ...ANTIQUARIAN_BC_TRINKETS],
  'Arbalest': [...ARBALEST_TRINKETS, ...ARBALEST_BC_TRINKETS],
  'Bounty Hunter': [...BOUNTY_HUNTER_TRINKETS, ...BOUNTY_HUNTER_BC_TRINKETS],
  'Crusader': [...CRUSADER_TRINKETS, ...CRUSADER_BC_TRINKETS],
  'Duelist': DUELIST_TRINKETS,
  'Flagellant': [...FLAGELLANT_TRINKETS, ...FLAGELLANT_BC_TRINKETS],
  'Grave Robber': [...GRAVE_ROBBER_TRINKETS, ...GRAVE_ROBBER_BC_TRINKETS],
  'Hellion': [...HELLION_TRINKETS, ...HELLION_BC_TRINKETS],
  'Highwayman': [...HIGHWAYMAN_TRINKETS, ...HIGHWAYMAN_BC_TRINKETS],
  'Houndmaster': [...HOUNDMASTER_TRINKETS, ...HOUNDMASTER_BC_TRINKETS],
  'Jester': [...JESTER_TRINKETS, ...JESTER_BC_TRINKETS],
  'Leper': [...LEPER_TRINKETS, ...LEPER_BC_TRINKETS],
  'Man at Arms': [...MAN_AT_ARMS_TRINKETS, ...MAN_AT_ARMS_BC_TRINKETS],
  'Musketeer': [...MUSKETEER_TRINKETS, ...MUSKETEER_BC_TRINKETS],
  'Occultist': [...OCCULTIST_TRINKETS, ...OCCULTIST_BC_TRINKETS],
  'Plague Doctor': [...PLAGUE_DOCTOR_TRINKETS, ...PLAGUE_DOCTOR_BC_TRINKETS],
  'Runaway': RUNAWAY_TRINKETS,
  'Shieldbreaker': [...SHIELDBREAKER_TRINKETS, ...SHIELDBREAKER_BC_TRINKETS],
  'Vestal': VESTAL_TRINKETS
};

/**
 * Flat array of all hero-specific trinkets for filtering
 */
export const ALL_HERO_SPECIFIC_TRINKETS = Object.values(HERO_SPECIFIC_TRINKETS).flat();

/**
 * Get trinkets available for a specific hero class
 * @param {string} heroClass - The hero class name
 * @returns {string[]} Array of available hero-specific trinkets
 */
export function getHeroSpecificTrinkets(heroClass) {
  return HERO_SPECIFIC_TRINKETS[heroClass] || [];
}
