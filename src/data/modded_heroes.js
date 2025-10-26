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
    image: '847481187.png',
    classSpecificTrinkets: [    // ← Trinkets exclusivos de esta clase
    ]
  },
  'Red Mage': {
    modId: '868109272', // ← ID único del mod
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
    image: '868109272.png',
    classSpecificTrinkets: [    // ← Trinkets exclusivos de esta clase
    ]
  }
};

// Trinkets generales de mods (no específicos de clase)
export const MODDED_GENERAL_TRINKETS = [
];