/**
 * Generic Trinkets for Darkest Dungeon
 * These trinkets can be equipped by ANY hero class.
 * 
 * Hero-specific trinkets are now in hero_specific_trinkets.js
 * 
 * Based on: https://darkestdungeon.wiki.gg/wiki/Trinkets
 * 
 * Categories included:
 * - Generic Normal Trinkets (Common to Very Rare)
 * - Enemy Trinkets (Collector, Madman, Bone Royalty)
 * - Ancestral Trinkets
 * - Trophy Trinkets (Boss rewards)
 * - Shrieker Trinkets
 * - Crimson Court Generic Trinkets
 * - Color of Madness Generic Trinkets
 * - Darkest Dungeon Trinkets
 * - Butcher's Circus Generic Trinkets
 */

export const TRINKETS = [
  // ===== GENERIC NORMAL TRINKETS =====
  // (Very) Common
  'Accuracy Stone',
  'Bleed Charm',
  'Bleed Stone',
  'Blight Charm',
  'Blight Stone',
  'Critical Stone',
  'Debuff Charm',
  'Debuff Stone',
  'Disease Charm',
  'Dodge Stone',
  'Health Stone',
  'Move Charm',
  'Move Stone',
  'Protection Stone',
  'Stun Charm',
  'Stun Stone',
  
  // Common
  'Archer\'s Ring',
  'Bloodied Fetish',
  'Book of Intuition',
  'Caution Cloak',
  'Damage Stone',
  'Dazzling Charm',
  'Deteriorating Bracer',
  'Reckless Charm',
  'Slippery Boots',
  'Snake Oil',
  'Speed Stone',
  'Survival Guide',
  'Warrior\'s Bracer',
  'Warrior\'s Cap',
  
  // Uncommon
  'Bleed Amulet',
  'Blight Amulet',
  'Blood Charm',
  'Bloodthirst Ring',
  'Book of Constitution',
  'Book of Holiness',
  'Book of Rage',
  'Book of Relaxation',
  'Calming Crystal',
  'Camouflage Cloak',
  'Chirurgeon\'s Charm',
  'Dark Bracer',
  'Debuff Amulet',
  'Gambler\'s Charm',
  'Heavy Boots',
  'Life Crystal',
  'Move Amulet',
  'Seer Stone',
  'Shimmering Cloak',
  'Solar Bracer',
  'Steady Bracer',
  'Stun Amulet',
  'Surgical Gloves',
  'Swift Cloak',
  'Tenacity Ring',
  'Worrystone',
  
  // Rare
  'Beast Slayer\'s Ring',
  'Berserk Charm',
  'Brawler\'s Gloves',
  'Dark Crown',
  'Eldritch Slayer\'s Ring',
  'Fasting Seal',
  'Feather Crystal',
  'Man Slayer\'s Ring',
  'Moon Cloak',
  'Moon Ring',
  'Quick Draw Charm',
  'Recovery Charm',
  'Sniper\'s Ring',
  'Solar Crown',
  'Sun Cloak',
  'Sun Ring',
  'Unholy Slayer\'s Ring',
  
  // Very Rare
  'Book of Sanity',
  'Cleansing Crystal',
  'Ethereal Crucifix',
  'Focus Ring',
  'Fortifying Garlic',
  'Hero\'s Ring',
  'Legendary Bracer',
  'Martyr\'s Seal',
  'Tough Ring',
  
  // ===== ENEMY TRINKETS =====
  // Collector Heads (Very Rare)
  'Barristan\'s Head',
  'Dismas\' Head',
  'Junia\'s Head',
  
  // Madman Music Boxes (Very Rare)
  'Aria Box',
  'Crescendo Box',
  'Overture Box',
  
  // Bone Royalty (Very Rare)
  'The Tempting Goblet',
  
  // ===== ANCESTRAL TRINKETS =====
  'Ancestor\'s Coat',
  'Ancestor\'s Handkerchief',
  'Ancestor\'s Lantern',
  'Ancestor\'s Moustache Cream',
  'Ancestor\'s Musket Ball',
  'Ancestor\'s Pen',
  'Ancestor\'s Pistol',
  'Ancestor\'s Portrait',
  'Ancestor\'s Signet Ring',
  'Ancestor\'s Bottle',
  'Ancestor\'s Candle',
  'Ancestor\'s Map',
  'Ancestor\'s Scroll',
  'Ancestor\'s Tentacle Idol',
  
  // ===== TROPHY TRINKETS =====
  // Ruins Bosses
  'Necromancer\'s Collar',
  'Prophet\'s Eye',
  // Weald Bosses
  'Hag\'s Ladle',
  'Fuseman\'s Matchstick',
  // Warrens Bosses
  'Wilbur\'s Flag',
  'Flesh\'s Heart',
  // Cove Bosses
  'Siren\'s Conch',
  'Crew\'s Bell',
  // Town Event
  'Vvulf\'s Tassel',
  // Crimson Court Bosses (DLC)
  'Baron\'s Lash',
  'Viscount\'s Spices',
  'Countess\' Fan',
  
  // ===== SHRIEKER TRINKETS =====
  'Callous Talon',
  'Distended Crowseye',
  'Molted Tailfeather',
  'Molted Wingfeather',
  
  // ===== CRIMSON COURT GENERIC TRINKETS (DLC) =====
  'Ancestor\'s Vintage',
  'Coven Signet',
  'Dazzling Mirror',
  'Mantra of Fasting',
  'Mercurial Salve',
  'Pagan Talisman',
  'Rat Carcass',
  'Sanguine Snuff',
  'Sculptor\'s Tools',
  
  // ===== COLOR OF MADNESS GENERIC TRINKETS (DLC) =====
  // Crystalline (Jeweler)
  'Lens of the Comet',
  'Crystal Pendant',
  'Cluster Pendant',
  'Coat Of Many Colors',
  'Miller\'s Pipe',
  // Farmstead Special
  'Mildred\'s Locket',
  // Thing from the Stars
  'Thing\'s Mesmerizing Eye',
  'Thing\'s Crystalline Fang',
  'Thing\'s Phase Shifting Hide',
  'Prismatic Heart Crystal',
  
  // ===== DARKEST DUNGEON TRINKETS =====
  'Talisman of the Flame',
  
  // ===== CONSOLE EXCLUSIVE (Reference) =====
  'Stone of Patience',
  'Stone of Endurance',
  
  // ===== UNUSED TRINKETS (Reference) =====
  'Stake',
  'Necklace',
  
  // ===== BUTCHER'S CIRCUS GENERIC TRINKETS (PvP DLC) =====
  'Ankh of Life',
  'Bloodstained Gambeson',
  'Brass Bugle',
  'Brass Knuckles',
  'Carnival Masque',
  'Crimson Hook',
  'Crushed Hemlock',
  'Eagle Eye Talisman',
  'Eerie Eye',
  'Exotic Snuff',
  'Gladiator Helmet',
  'Hunters Charm',
  'Jagged Chopper',
  'Monkey\'s Paw',
  'Nepenthe',
  'Numbing Incense',
  'Pitfighter\'s Helm',
  'Rancid Cure All',
  'Retarius\' Net',
  'Rotting Trophy',
  'Sanity\'s Bane',
  'Silver Syringe',
  'Spiked Bat',
  'The Finisher',
  'Treated Bandage',

  // ===== FIRE'S EDGE DLC TRINKETS =====
  // Generic (equippable by any hero)
  'Pile of Ash',
  'Jar of Ash',
  'Offering Pendant',
  'Focus Talisman',
  'Nullifying Contract',
  'Lifestyle Guide',
  'Crier\'s Bell',
  'Sunset Ring',
  'Vice Crown',
  'Slumber Pendant',
  'Waking Pendant',
  'Tinker Box',
  'Flickering Lamplight',
  'Crumbling Timekeeper',
  'Dark Catalyst'
];

/**
 * All generic trinket names as a Set for quick lookup
 */
export const GENERIC_TRINKETS_SET = new Set(TRINKETS);

/**
 * Check if a trinket is generic (equippable by any hero)
 * @param {string} trinketName - Name of the trinket
 * @returns {boolean} True if the trinket is generic
 */
export function isGenericTrinket(trinketName) {
  return GENERIC_TRINKETS_SET.has(trinketName);
}
