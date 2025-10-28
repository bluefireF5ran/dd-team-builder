// Cada mod tiene un ID único que se usa como prefijo
export const MODDED_HERO_CLASSES = {
  'Acolyte of Sun': {
    modId: '971313538',
    skills: [
      'Dark Sun Arrow',
      'Primordial Bite',
      'Regenerate',
      'Concentrated Regeneration',
      'Vengeful Covenant',
      'Sun Mirage',
      'Focused Ray'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk',
      'Calming Chant',
      'Luminosity',
      'Moonshine',
      'Rekindle',
      'False Promise'
    ],
    vanillaCampSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk'
    ],
    alwaysActive: true,
    image: '971313538.png',
    classSpecificTrinkets: [
      'Crown without Throne',
      'Primordial Rites',
      'Sunlight Talisman',
      'Crescent Talisman',
      'Soothing Chime',
      'Heirloom of an Age Bygone',
      'Prism of the Sunbringer',
      'Lense of the Moonwatcher',
      'Sign of a Pact Forgotten',
      'Abyssal Orb',
      'Crown of Ash and Ember',
      'Sinful Quill',
      'Moon Crystal',
      'Befuddling Sundial'
    ]
  },
  'Cannoneer': {
    modId: '912030977',
    skills: [
      'Light the Fuse',
      'Kaboom',          
      'Rocket Jump',
      'Bombardment',
      'Shrapnel Blast',
      'Minefield',
      'On My Mark'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',   
      'Polish Cannon',
      'Sponge Barrel',
      'Fireworks',
      'Big Game'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '912030977.png',
    classSpecificTrinkets: [
      'Balls of Steel',
      'Long Barrel'    
    ]
  },
  'Chosen Cultist': {
    modId: '917421411',
    skills: [
      'Rupture',
      'Eldritch Mark',          
      'Bloodrage',
      'Agony',
      'Eldritch Purge',
      'Flensing Grab',
      'Sacrifice'
    ],
    campSkills: [
      'Wound Care',
      'Zealous Faith',
      'Unholy Ritual',
      'For the New God',
      'Pray'
    ],
    vanillaCampSkills: [
      'Wound Care',        
    ],
    image: '917421411.png',
    classSpecificTrinkets: [
      'Bloody Belt',
      'Idol of the New God',
      'Piece of Sacrificial Stone',
      'Tentacle Amulet',
      'Unholy Writings'
    ]
  },
  'Commissar': {
    modId: '955795133',
    skills: [
      'Pistol Shot',
      '"Get Up There!"',
      '"Fall Back!"',
      '"Stand Your Ground!"',
      '"Charge!"',
      '"Medic!"',
      'Inspire Courage'
    ],
    campSkills: [
      'Frontline Commander',
      'Disciplinary Action',
      'Military Drills',
      'Last Stand'
    ],
    vanillaCampSkills: [

    ],
    image: '955795133.png',
    classSpecificTrinkets: [

    ]
  },
  'Dark Mage': {
    modId: '847481187', // ← ID único del mod
    skills: [
      'Wand Strike',
      'Fira',          
      'Blizzara',
      'Thundara',
      'Quake',
      'Meteo',
      'Ultima'
    ],
    campSkills: [
      'Abandon_Hope',
      'Dark Ritual',
      'Dark Strength',
      'Unspeakable Commune'
    ],
    vanillaCampSkills: [        
      'Abandon_Hope',
      'Dark Ritual',
      'Dark Strength',
      'Unspeakable Commune'
    ],
    image: '847481187.png',
    classSpecificTrinkets: []
  },
  'Enigma': {
    modId: '970030269',
    skills: [
      'Mystic Bolt',
      'Illusionary Slash',
      'Phantasmal Shot',
      'Delusional Exertion',
      'Unusual Dynamism',
      'Arcane Fervor',
      'Esoteric Barrier'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Enigmatic Manifestation',
      'Stone Skin',
      'Puzzling Riddles',
      'Esoteric Arcanist'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    alwaysActive: true,
    image: '970030269.png',
    classSpecificTrinkets: [
      'Puzzling Crystal',
      'Cryptic Bracer',
      'Perplexing Band',
      'Arcanists Cloak',
      'Mystifying Pendant',
      'Hyperstone',
      'Arcane Aegis',
      'Absorbing Crystal'
    ]
  },
  'Falconer': {
    modId: '1089257023',
    skills: [
      'Quickshot / Crippling Shot',
      'Eyethief / Ravage',
      'Flank / Gouge',
      'Volley Fire / Flurry',
      'Spirited Cry / Stalk',
      'Fleeting Escape / Harrier',
      'Adapt'
    ],
    campSkills: [
      'Heightened Senses',
      'Scavenge',
      'Fletchery',
      'Camouflage'
    ],
    vanillaCampSkills: [

    ],
    image: '1089257023.png',
    classSpecificTrinkets: [
      'Raptor Charm',
      'Bloodshot Trophy',
      'Vagabonds Cloak',
      'Preystalkers Hood',
      'Avian Offering',
      'Butchered Bird',
      'True Hawk Medallion',
      'Sentry Kite',
      'Mothers Mask',
      'Shrikes Mask',
      'Feather Net',
      'Harrying Boots',
      'Carrion Claw',
      'Mothers Arrow',
      'Damsels Hairlock',
      'Killcount',
      'Ethereal Feather Shroud'
    ]
  },
  'Falconer (Legacy)': {
    modId: '1552517938',
    skills: [
      'Quickshot',
      'Diversion',
      'Eyethief',
      'Flurry',
      'Spirited Cry',
      'Volley Fire',
      'Fleeting Escape'     
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Target Practice',
      'Scavenge',
      'Camouflage',
      'Heightened Senses'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1552517938.png',
    classSpecificTrinkets: [
      'Raptor Charm',
      'Hawkeye Pendant',
      'Vagabonds Cloak',
      'Preystalkers Hood',
      'Avian Remains',
      'Damsels Hairlock',
      'Killcount',
      'Ethereal Feather Shroud'
    ]
  },
  'Fanatic': {
    modId: '955863292',
    skills: [
      'Strike The Heretic',
      'Brand The Tainted',
      'Holy Stake',
      'Righteous Condemnation',
      'Sentence Rendered',
      'Fury of The Righteous',
      'Righteous Hatred'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Fanatical Vigil',
      'Judicial Confiscation',
      'My Faith Is My Shield',
      'Wholesome Instruction'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '955863292.png',
    classSpecificTrinkets: [

    ]
  },
  'Good Girl': {
    modId: '899943437',
    skills: [
      'Chomp',
      'Chew Toy',          
      'Throat Bitter',
      'Bite the Hand',
      'Go Fetch',
      'Alpha Lady',
      'Bone Treats'
    ],
    campSkills: [
      'Wound Care',
      'Mark Territory',
      'Blood Scent',
      'Moon Howl',
      'Pack Hunters'
    ],
    vanillaCampSkills: [
      'Wound Care'  
    ],
    image: '899943437.png',
    classSpecificTrinkets: [    
    ]
  },
  'High Priestess': {
    modId: '930929791',
    skills: [
      'Leeching Strike',
      'Devourer From The Stars',          
      'Zealous Defender',
      'Offering',
      'New Gods Champion',
      'Unholy Restoration',
      'Eldritch Grasp'
    ],
    campSkills: [
      'Wound Care',
      'Dark Pact',
      'Demonic Blessing',
      'Insidious Mist',
      'New Gods Guidance'
    ],
    vanillaCampSkills: [
      'Wound Care',        
    ],
    image: '930929791.png',
    classSpecificTrinkets: [
      'Sacred Amulet',
      'Unholy Prophecies',
      'Enchanted Rope Belt',
      'Fishman Relic',
      'Corrupted Scepter',
      'Grimoire of Hunger'
    ]
  },
  'Martyr': {
    modId: '932344353',
    skills: [
      'Touch of Judgment',
      'Hand of Rapture',          
      'Blood of Martyr',
      'Bearer of Sin',
      'Sign of Stigma',
      'Lazarus Gift',
      'Iron Shroud'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk', 
      'Shroud of Turtin',
      'Resurrection',
      'Self Stigmata',
      'Penance'
    ],
    vanillaCampSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk'       
    ],
    image: '932344353.png',
    classSpecificTrinkets: []
  },
  'Onnabushi': {
    modId: '1082193921',
    skills: [
      'Grass Cutter',
      'Flight Reversal',
      'The Flesh Is Weak',
      'Ebb And Flow',
      'Impale',
      'Death Poem',
      'Moon Slash'
    ],
    campSkills: [
      'Art Of Massage',
      'Eastern Faith',
      'Calming Tune',
      'Mind Of Steel'
    ],
    vanillaCampSkills: [

    ],
    image: '1082193921.png',
    classSpecificTrinkets: [

    ]
  },
  'Pit Fighter': {
    modId: '886635500',
    skills: [
      'In Da Kisser',
      'Come On!',          
      'Headbutt',
      'Jaw Breaker',
      'Nose Bleeder',
      'Ya Mum!',
      'Dash In'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Eye of Tiger',
      'Fist Pump',
      'RoughHousing',
      'Pain Killer'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '886635500.png',
    classSpecificTrinkets: [    
    ]
  },
  'Prodigy': {
    modId: '924245318',
    skills: [
      'Spirit Shift',
      'Paralysing Palm',          
      'Hallowed Kick',
      'Righteous Fist',
      'Heavenly Charge',
      'Sacred Strike',
      'Divine Haymaker'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk',   
      'Fortune Cookie',
      'Gem Stash',
      'Serenity',
      'Solemn Training'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    alwaysActive: true,
    image: '924245318.png',
    classSpecificTrinkets: [
      'Heavenly Greaves',
      'Scroll of Endless Knowledge',
      'Sacred Gauntlets',
      'Divine Ring',
      'Medallion of Courage',
      'Anointed Gauntlet',
      'Pious Emblem',
      'Ardent Chalice'
    ]
  },
  'Reaver Brigrand': {
    modId: '948931447',
    skills: [
      'Aimed Shot',
      'Buckshot',
      'Raid Commander',
      'Stand and Deliver',
      'Return Fire',
      'Expose',
      'Cowering Fire'
    ],
    campSkills: [
      'Reinforce Armor',
      'Night Watch',
      'Clean Weapon',
      'Adjust Aim'
    ],
    vanillaCampSkills: [

    ],
    image: '948931447.png',
    classSpecificTrinkets: [
      'Lucky Coin',
      'Marksman Gloves',
      'Raiders Mask',
      'Looted Amulet',
      'Brigands Emblem'
    ]
  },
  'Red Mage': {
    modId: '868109272', 
    skills: [
      'Attack',
      'Fira',          
      'Haste',
      'Cura',
      'Bane',
      'Nulblight',
      'Exorcise'
    ],
    campSkills: [
      'Abandon_Hope',
      'Dark Ritual',
      'Dark Strength',
      'Unspeakable Commune'
    ],
    vanillaCampSkills: [        
      'Abandon_Hope',
      'Dark Ritual',
      'Dark Strength',
      'Unspeakable Commune'
    ],
    image: '868109272.png',
    classSpecificTrinkets: []
  },
  'Revenant': {
    modId: '913178378',
    skills: [
      'Sanguine Strike',
      'Obliterate',          
      'Bloodfury',
      'Crimson Unity',
      'Necromancy',
      'Siphon Life',
      'Vampiric Embrace'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk',   
      'Sanguine Potion',
      'Appalling Apathy',
      'Blood Ritual',
      'Drain Life'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '913178378.png',
    classSpecificTrinkets: [
      'Corruption Charm',
      'Cloak of Darkness',
      'Blood Bracer',
      'Sanguine Amulet',
      'Ebon Signet Ring',
      'Chains of Dismay',
      'Skulls of Dispair',
      'Necrotic Reaver'
    ]
  },
  'Ronin': {
    modId: '942851186',
    skills: [
      'Flashing Blade',
      'Swift Cuts',          
      'Battojutsu',
      'Calming Zen',
      'Swallows Return',
      'Guard Stance',
      'Shingan'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk', 
      'Meditate',
      'Sharpen Blade',
      'Kendo Practice',
      'Way of Bushido'
    ],
    vanillaCampSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk'       
    ],
    image: '942851186.png',
    classSpecificTrinkets: []
  },
  'Scourge': {
    modId: '947715735',
    skills: [
      'Purge',
      'Infectious Offering',
      'Noxious Raze',
      'Excoriate',
      'Unfathomable Torment',
      'Abyssal Havoc',
      'Deathlock'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Revolting Draught',
      'Pestilent Tenacity',
      'Nefarious Feast',
      'Toxic Infusion'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '947715735.png',
    classSpecificTrinkets: [
      'Abolished Bracer',
      'Abyssal Goblet',
      'Pendant of Affliction',
      'Cloak of Calamity',
      'Pandemonium Loop',
      'Portrait of Terror',
      'Vial of Dread',
      'Overgrown Armband'
    ]
  },
  'Seer': {
    modId: '934967620',
    skills: [
      'Touch of Death',
      'Hypnosis',          
      'Spectral Blast',
      'Celestial Renewal',
      'Tranquility',
      'Rejuvenating Surge',
      'Ethereal Blessing'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk', 
      'Eclipse',
      'Forgotten Heritage',
      'Clairvoyance',
      'Spectral Shroud'
    ],
    vanillaCampSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk'       
    ],
    image: '934967620.png',
    classSpecificTrinkets: [
      'Penumbral Belt',
      'Ethereal Loop',
      'Stellar Band',
      'Celestial Cloak',
      'Moonlight Pendant',
      'Vexatious Cloak',
      'Enchanted Blindfold',
      'Intangible Concoction'
    ]
  },
  'Shield Maiden': {
    modId: '963658853',
    skills: [
      'Cross Blade',
      'Front Guard',
      'Ram Shield',
      'Avenger',
      'Guardian',
      'Mending Touch',
      'Indomitable',
      'Krzyżowe cięcie',
      'Strzeż frontu',
      'Uderzenie tarczą',
      'Mścicielka',
      'Gwardzistka',
      'Nakładanie rąk',
      'Nieustraszenie'
    ],
    campSkills: [
      'Watchful March',
      'Lay Of Hands',
      'Shield Up',
      'Guardian Angel',
      'Czujny Marsz',
      'Nakładanie Rąk',
      'Wyżej Tarczę',
      'Anioł Stróż'
    ],
    vanillaCampSkills: [

    ],
    image: '963658853.png',
    classSpecificTrinkets: [

    ]
  },
  'Trap Maker': {
    modId: '929549650',
    skills: [
      'Blunderbusster',
      'Iron Maiden',          
      'Blade Wheel',
      'Spikes Trap',
      'Stone Fall',
      'Armor Breaker',
      'Escape Door'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk',   
      'Jack In The Box',
      'Tinker Monkey',
      'Wind Up',
      'Set Alarm'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '929549650.png',
    classSpecificTrinkets: []
  },
  'Undead DS1': {
    modId: '954141794',
    skills: [
      'Tödlich einschlagen!',
      'Read this you illiterate imbecile!',
      'Pommel Blow',
      'Bannerlord',
      'Battle Heal',
      'Heavenly Pierce',
      'Summon Phantom'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Stolen Potion',
      'Stolen Apathy',
      'Stolen Ritual',
      'Stolen Life'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '954141794.png',
    classSpecificTrinkets: [

    ]
  },
  'Warden': {
    modId: '906316834',
    skills: [
      'Rend',
      'Feint',          
      'Pommel Smash',
      'Judgement',
      'Rallying Banner',
      'Steadfast Banner',
      'Commanding Banner'
    ],
    campSkills: [
      'Banner Crafting',
      'Routine Watch',
      'Know Your Enemy',
      'Training Regiment',
      'Squad Mission'
    ],
    image: '906316834.png',
    classSpecificTrinkets: [    
    ]
  },
  'Warlock': {
    modId: '945983081',
    skills: [
      'Lightning Shock',
      'Black Magic',          
      'Cosmic Horror',
      'Ignite',
      'Avalanche',
      'Vampiric Assault',
      'Possession'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk', 
      'Blood Lust',
      'Mana',
      'Demonology',
      'Meditation'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '945983081.png',
    classSpecificTrinkets: [    
    ]
  },
  'Warrior': {
    modId: '945983081',
    skills: [
      'Crushing Blow',
      'Denting Blow',          
      'Punch Combo',
      'Fatality',
      'Shoulder charge',
      'Battle tactics',
      'Grand sacrifice'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk', 
      'Deep Sleep',
      'Song Of The Dragon',
      'Warcry',
      'Strange Potion'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'        
    ],
    image: '945983081.png',
    classSpecificTrinkets: [    
    ]
  },
  'Witcher': {
    modId: '967618008',
    skills: [
      'Style',
      'Steel Sword',
      'Silver Sword',
      'Potion',
      'Aard',
      'Axii',
      'Quen'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Meditation',
      'Oiling The Swords',
      'Gwent',
      'Witchers Sense'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '967618008.png',
    classSpecificTrinkets: [
      'Cat Medallion',
      'Griffin Medallion',
      'Ursine  Medallion',
      'Wolf Medallion'
    ]
  },
  'Pariah': {
    modId: '1097287720',
    skills: [
      'Deranged Gibberish',
      'Dagger of Ritual',
      'Prepare Sacrifice',
      'Offer Flesh',
      'Call Starspawn',
      'Finger of the Sky',
      'Nyarlathoteps Mark'
    ],
    campSkills: [
      'Admit Fear',
      'Dark Comfort',
      'Bloodletting Tehcniques',
      'Sky Ritual',
      'Eldritch Pact'
    ],
    vanillaCampSkills: [

    ],
    image: '1097287720.png',
    classSpecificTrinkets: [
      'Elder Charm',
      'Cage Of Madness',
      'Strange Idol',
      'Cultist Bloody Rag',
      'Ars Necronomica',
      'The Stone City'
    ]
  },
  'Butcher': {
    modId: '1100230439',
    skills: [
      'Impaling Strike',
      'Cripple',
      'Slice em Open',
      'Inspiring Command',
      'In My Sights',
      'Regroup',
      'Blade Toss'
    ],
    campSkills: [
      'Anticipation',
      'Marauder',
      'Beverage',
      'Sharpen Blades'
    ],
    vanillaCampSkills: [
      
    ],
    image: '1100230439.png',
    classSpecificTrinkets: [
      'Strong Ale',
      'Savings',
      'Raid Plan',
      'Kill Count',
      'Honor Guards Tassle'
    ]
  },
  'Fury': {
    modId: '1100450515',
    skills: [
      'Composed Slash',
      'Disciplined Thrust',
      'Poised Cleave',
      'Raging Sunder',
      'Vicious Rip',
      'Ferocious Laceration',
      'Feral Impulse'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Wavering Demeanor',
      'Staggering Technique',
      'Critical Lesson',
      'Exhilarating Inspiration'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1100450515.png',
    classSpecificTrinkets: [
      'Orders Resolve',
      'Pendant of Valor',
      'Ring of the Order',
      'Pauldrons of Malicious Intent',
      'Enmity Gauntlets',
      'Gem of Abundance',
      'Crown of Delirium',
      'Imbued Blade'
    ]
  },
  'Fawn': {
    modId: '1109179698',
    skills: [
      'Gouge',
      'Eviscerate',
      'Throat Skewer',
      'Maim',
      'Drill',
      'Moon Hoof',
      'Refresh'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Suture',
      'Grooming',
      "Doe'S Lullaby",
      'Oblivious'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1109179698.png',
    classSpecificTrinkets: [
      'Otherwordly Flea',
      'Companion Scrub',
      'Antler Modesty',
      'Thick Sap',
      'Friendly Flea',
      'Anger in a Bottle',
      'Hatred in a Bottle',
      "Czsyzow's Head",
      'Fawn Hoof',
      'Fawn Tooth',
      'Fawn Finger',
      'Fawn Bell',
      'Fawn Fur',
      'Fawn Mask',
      'Fawn Antler',
      'Eastern Flea Eggs',
      'Otherwordly Flea'
    ]
  },
  'Druid': {
    modId: '1110338003',
    skills: [
      'Drain Life',
      'Healing Mist',
      'Tremors',
      'Entangle',
      'Summon Thorn',
      'Rejuvenate',
      'Cleansing Rain'
    ],
    campSkills: [
      'Cleanse Campsite',
      'Commune With Nature',
      'Loud Complaining',
      'Make Soup'
    ],
    vanillaCampSkills: [

    ],
    image: '1110338003.png',
    classSpecificTrinkets: [
      'Sweet Smelling Herbs',
      'Scrying Bowl',
      'Soup Spoon',
      'Ritual Compost',
      'Sacrificial Knife'
    ]
  },
  'Conquistador': {
    modId: '1114545692',
    skills: [
      'Corte Doblado',
      'Embate',
      'Blandir Lanza',
      'Marcha Penetrante',
      'Fuego!',
      'Granada',
      'Formación en Tercio'
    ],
    campSkills: [
      'Solemn Prayer',
      'Search For Treasure',
      'Mission Fervor',
      'Pike And Shot Tactics'
    ],
    vanillaCampSkills: [

    ],
    image: '1114545692.png',
    classSpecificTrinkets: [
      'Paper Cartridge',
      'Cursed Coin',
      'El Ermitaño',
      'Spy Glass',
      'Grenade Shrapnel'
    ]
  },
  'Hollow': {
    modId: '1115865609',
    skills: [
      'Tumor',
      'Phagos',
      'Voro',
      'Effluo',
      'Depulsio',
      'Fatum Nunc',
      'Epulum'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Orior',
      'Exedo',
      'Vacuum',
      'Futilis'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1115865609.png',
    classSpecificTrinkets: [
      'Fresh Ink',
      'Abrasive Parchment',
      'Blurry Heels',
      'Black Light Seal',
      'Third o Wisp',
      'Fourth o Wisp',
      'Void Shard'
    ]
  },
  'Offering': {
    modId: '1119908263',
    skills: [
      'Tachycardia',
      'Lascivious',
      'Languid',
      'Licentious',
      'Quiet',
      'Mellow',
      'Thrill'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Unburden',
      'Sultry',
      'Muse',
      'Unscathed'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1119908263.png',
    classSpecificTrinkets: [
      'Leather Ribbon',
      'Satchel of Veins',
      'Anabolic Gland',
      'Resonant Leash',
      'Spinal Artery',
      'Vertebral Neurons',
      'Crystal Clot'
    ]
  },
  'Somnambulant': {
    modId: '1122495698',
    skills: [
      'Sleep Cycle',
      'Dream Fall',
      'Sleep Walk',
      'Nightmare Fuel',
      'Heavy Slumber',
      'Insomnia',
      'Safe Zone'
    ],
    campSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk',
      'Lucid Dream',
      'Jawn Practice',
      'Nightmare Visit',
      'Stay Up'
    ],
    vanillaCampSkills: [
      'Encourage',
      'Wound Care',
      'Pep Talk'
    ],
    alwaysActive: true,
    image: '1122495698.png',
    classSpecificTrinkets: [
      'Key to the Watch',
      'Music Box',
      'Red Wine',
      'Reliable Timepiece',
      'Sleeping Pills'
    ]
  },
  'Sunlight Warrior': {
    modId: '1122828159',
    skills: [
      'Rightful Thrust',
      'Parry',
      'Sunlight Spear',
      'Way of White',
      'Dodge Roll',
      'Praise the Sun!',
      'Emit Force'
    ],
    campSkills: [
      'Long May The Sun Shine',
      'Chug Chug',
      'Friends In Need',
      'Undead Curse',
      'Welcome To The Bonfire',
      'Jolly Cooperation',
      'Take Poise'
    ],
    vanillaCampSkills: [

    ],
    image: '1122828159.png',
    classSpecificTrinkets: [
      'Sun Edged Medal',
      'Ring of Sting',
      'Message from Betwixt',
      'Mossclump Stash',
      'Solaires Head',
      'Sunlight Buckler',
      'Indigo Tear',
      'Crimson Feather',
      'Sunseekers Talisman',
      'Sunblight Parma'
    ]
  },
  'Tusk': {
    modId: '1123633838',
    skills: [
      'Big Game',
      'Bite Me',
      'Mastodon',
      'Ram',
      'Spit',
      'Irascible',
      'Trample'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Overconfidence',
      'Boast',
      'Uncaring',
      'Filthy'
    ],
    vanillaCampSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk'
    ],
    image: '1123633838.png',
    classSpecificTrinkets: [
      'Alloy Studs',
      'Steady Piston',
      'Infested Pelt',
      'Giant Ear',
      'Maimed Toy',
      'Tainted Silk',
      'Cat Tongue'
    ]
  },
  'Zealot': {
    modId: '1129127265',
    skills: [
      'Hateful Bash',
      'Condemnation',
      'Consecrate',
      'Ardent Hammer',
      'Burning Brand',
      'Sentence The Guilty',
      'Seethe'
    ],
    campSkills: [
      'Annointment',
      'Make Penance',
      'Inquisition',
      'Grudge Of The Blood'
    ],
    vanillaCampSkills: [

    ],
    image: '1129127265.png',
    classSpecificTrinkets: [
      'Blessed Crozius',
      'Inquisitors Seal',
      'Witch Hunters Stake',
      'Hallowed Oil',
      'The Maledictum'
    ]
  },
  'Torchbearer': {
    modId: '1129894385',
    skills: [
      'Bash',
      'Scorch',
      'Hallowed Conflagration',
      'Beacon of Hope',
      'Light the Way',
      'Divine Embers',
      'Inspiring Leadership'
    ],
    campSkills: [
      'In Radiance We Find Victory',
      'Find The Path',
      'Burn The Sacred Incense',
      'Kindle Campfire'
    ],
    vanillaCampSkills: [

    ],
    image: '1129894385.png',
    classSpecificTrinkets: [
      'Sulfur Soaked Rags',
      'Sturdy Helmet',
      'Prayer Book',
      'Sacred Incense',
      'Blessed Lantern'
    ]
  },
  'Lamia': {
    modId: '1130829365',
    skills: [
      'The Veil',
      'Cleansing Tide',
      'Arietta',
      'Allure',
      'Petrifying Gaze',
      'Slither',
      'Hiss'
    ],
    campSkills: [
      'Soothing Presence',
      'Stalk Prey',
      'Immodest Vanity',
      'Lampreys Kiss'
    ],
    vanillaCampSkills: [

    ],
    image: '1130829365.png',
    classSpecificTrinkets: [
      'Caregivers Ring',
      'Deceivers Hairband',
      'Fleeting Earrings',
      'Lovely Necklet',
      'Selfish Bracelet',
      'Encrusted Dagger',
      'Gorgons Shroud',
      'Faceless Mirror'
    ]
  },
};

// Trinkets generales de mods (no específicos de clase)
export const MODDED_GENERAL_TRINKETS = [
];