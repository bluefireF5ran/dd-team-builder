// Cada mod tiene un ID único que se usa como prefijo
export const MODDED_HERO_CLASSES = {
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
  'Pit Fighter': {
    modId: '886635500',
    skills: [
      'In the Kisser',
      'Come On',          
      'Headbutt',
      'Jaw Breaker',
      'Nose Bleeder',
      'Ya Mum',
      'Dash In'
    ],
    campSkills: [
      'Wound Care',
      'Encourage',
      'Pep Talk',
      'Eye of Tiger',
      'Fist Pump',
      'Pain Killer',
      'RoughHousing'
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
  'Good Girl': {
    modId: '899943437',
    skills: [
      'Chomp',
      'Chew Toy',          
      'Throat Bitter',
      'Bite the Hand',
      'Go Fetch',
      'Alpha Lady',
      'Bone Treat'
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
  'Warden': {
    modId: '906316834',
    skills: [
      'Rend',
      'Feint',          
      'Pommel Slam',
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
      'Routine Watch'
    ],
    image: '906316834.png',
    classSpecificTrinkets: [    
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
      'Cannon Balls of Steel',
      'Long Barrel'    
    ]
  }
};

// Trinkets generales de mods (no específicos de clase)
export const MODDED_GENERAL_TRINKETS = [
];