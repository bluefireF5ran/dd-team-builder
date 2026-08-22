// Vocabulario de la taxonomía de comps.
//
// Este fichero es SOLO datos: es el sitio donde afinar el sistema de nombres sin
// tocar la lógica (src/utils/compNaming.js). Tres piezas:
//
//   1. HERO_TOKENS — un apodo corto por clase ("Occultist" -> "Warlock").
//   2. MECHANICS   — qué hace la comp, deducido de las skills activas.
//   3. FAMILIES    — firmas de pareja/trío/término que dan el nombre de familia.
//
// La regla de oro está en NAME_LIMITS: un nombre son DOS ranuras, "Familia: Variante".
// Todo lo demás que sabemos de la comp vive en los tags, no en el nombre.

/** Presupuesto de caracteres. La taxonomía completa vive en los tags; el nombre solo lleva 2 ranuras. */
export const NAME_LIMITS = {
  family: 18,
  variant: 14,
  separator: ': '
};

/**
 * Apodo corto por clase. `token` es el que se usa por defecto; `alts` son
 * recambios para romper empates entre hermanas de la misma familia sin tener
 * que recurrir a un sufijo numérico.
 */
export const HERO_TOKENS = {
  'Abomination':   { token: 'Beast',    alts: ['Rage', 'Chain'] },
  'Antiquarian':   { token: 'Money',    alts: ['Vapour', 'Purse'] },
  'Arbalest':      { token: 'Volley',   alts: ['Flare', 'Bolt'] },
  'Bounty Hunter': { token: 'Contract', alts: ['Bounty', 'Takedown'] },
  'Crusader':      { token: 'Cross',    alts: ['Templar', 'Zeal'] },
  'Duelist':       { token: 'Duel',     alts: ['Touche', 'Feint'] },
  'Flagellant':    { token: 'Blood',    alts: ['Penance', 'Exanimate'] },
  'Grave Robber':  { token: 'Lunge',    alts: ['Shade', 'Dagger'] },
  'Hellion':       { token: 'Berserk',  alts: ['Hell', 'Yawp'] },
  'Highwayman':    { token: 'Heist',    alts: ['Pistol', 'Vein'] },
  'Houndmaster':   { token: 'Hound',    alts: ['Whistle', 'Kennel'] },
  'Jester':        { token: 'Ballad',   alts: ['Joker', 'Encore'] },
  'Leper':         { token: 'Royal',    alts: ['Chop', 'Solemn'] },
  'Man at Arms':   { token: 'Bulwark',  alts: ['Rampart', 'Command'] },
  'Musketeer':     { token: 'Snipe',    alts: ['Musket', 'Buckshot'] },
  'Occultist':     { token: 'Warlock',  alts: ['Hex', 'Abyss'] },
  'Plague Doctor': { token: 'Plague',   alts: ['Blight', 'Cure'] },
  'Runaway':       { token: 'Burn',     alts: ['Ember', 'Firefly'] },
  'Shieldbreaker': { token: 'Sand',     alts: ['Dream', 'Serpent'] },
  'Vestal':        { token: 'Faith',    alts: ['Hymn', 'Light'] }
};

/**
 * Mecánicas detectadas a partir de las skills activas. `label` es el token que
 * puede acabar en el nombre; `skills` son las skills que suman a esa mecánica.
 * `weight` inclina qué mecánica se considera dominante cuando hay empate.
 */
export const MECHANICS = [
  {
    tag: 'mark',
    label: 'Mark',
    weight: 3,
    skills: ['Target Whistle', "Sniper's Mark", 'Call the Shot', 'Mark for Death', 'Vulnerability Hex', 'Expose'],
    payoff: ['Sniper Shot', 'Aimed Shot', 'Collect Bounty', 'Finish Him', "Hound's Rush"]
  },
  {
    tag: 'bleed',
    label: 'Bleed',
    weight: 2,
    skills: ["Hound's Rush", "Hound's Harry", 'Wicked Hack', 'If It Bleeds', 'Bleed Out', 'Punish',
             'Rain of Sorrows', 'Exsanguinate', 'Lunge', 'Slice Off', 'Open Vein', 'Wicked Slice',
             'Impale', 'Puncture', 'Harvest', 'Rake']
  },
  {
    tag: 'blight',
    label: 'Blight',
    weight: 2,
    skills: ['Noxious Blast', 'Plague Grenade', 'Incision', "Beast's Bile", 'Poison Darts',
             'Toxin Trickery', 'Festering Vapours', "Adder's Kiss"]
  },
  {
    tag: 'burn',
    label: 'Burn',
    weight: 3,
    skills: ['Searing Strike', 'Firefly', 'Controlled Burn', 'Backdraft', 'Hearthlight']
  },
  {
    tag: 'stun',
    label: 'Stun',
    weight: 2,
    skills: ['Stunning Blow', 'Blinding Gas', 'Disorienting Blast', 'Manacles', 'Bola', 'Blackjack',
             'Flashbang', 'Flashpowder', 'Barbaric YAWP!', 'Slam', 'Rampart', 'Uppercut',
             'Dazzling Light', 'Smokescreen', 'Intimidate', 'Captivate', 'The Boot']
  },
  {
    tag: 'riposte',
    label: 'Riposte',
    weight: 3,
    skills: ['Retribution', "Duelist's Advance", 'Anticipation', 'Touché']
  },
  {
    tag: 'guard',
    label: 'Guard',
    weight: 2,
    skills: ['Defender', 'Guard Dog', 'Protect Me', 'Get Down!', 'Bulwark of Faith', 'Withstand', 'Endure']
  },
  {
    tag: 'heal',
    label: 'Mercy',
    weight: 1,
    skills: ['Divine Grace', 'Divine Comfort', 'Battle Heal', 'Wyrd Reconstruction', 'Battlefield Medicine',
             'Battlefield Bandage', 'Lick Wounds', 'Reclaim', 'Redeem', 'Patch Up', 'Hand of Light']
  },
  {
    tag: 'stress',
    label: 'Hymn',
    weight: 1,
    skills: ['Inspiring Cry', 'Inspiring Tune', 'Solo', 'Rallying Flare', 'Cry Havoc', 'Bellow',
             'Bolster', 'Battle Ballad', 'Illumination', 'Suffer']
  },
  {
    tag: 'shuffle',
    label: 'Tangle',
    weight: 2,
    skills: ['Come Hither', "Daemon's Pull", 'Tracking Shot', 'Breakthrough', 'Point Blank Shot',
             'Shadow Fade', 'Disengage', 'Iron Swan', 'Hew']
  },
  {
    tag: 'gold',
    label: 'Money',
    weight: 3,
    skills: ['Fortifying Vapours', 'Invigorating Vapours', 'Nervous Stab', 'Ransack']
  }
];

/**
 * Penalización por tipo de token al elegir variante. La rareza manda, pero no
 * hasta el punto de que una región gane a un héroe: sumar esto a la frecuencia
 * mantiene el orden "héroe > campamento > mecánica > apodo alterno > región".
 */
export const VARIANT_KIND_PENALTY = {
  stack: 0,
  hero: 0,
  camp: 1,
  mech: 2,
  alt: 4,
  region: 8
};

/** Camp skills que, por sí solas, marcan una intención de la comp. */
export const CAMP_TERMS = [
  { tag: 'ritual',     label: 'Ritual',    campSkills: ['Dark Ritual'] },
  { tag: 'commune',    label: 'Commune',   campSkills: ['Unspeakable Commune'] },
  { tag: 'quickening', label: 'Quicken',   campSkills: ['The Quickening', 'Eldritch Blood'] },
  { tag: 'zeal',       label: 'Zeal',      campSkills: ['Zealous Speech', 'Zealous Vigil'] },
  { tag: 'kennel',     label: 'Kennel',    campSkills: ["Hound's Watch", 'Therapy Dog', "Man's Best Friend"] },
  { tag: 'torchless',  label: 'Torchless', campSkills: ['Snuff Box'] }
];

/**
 * Firmas de familia. Gana la de mayor `priority`; a igualdad, la que exige más
 * miembros. Reordenar este array es la forma prevista de afinar la taxonomía.
 *
 * `requires`: cada entrada es una ranura {any:[clases], count:N}.
 * `sameClass`: N copias de una misma clase cualquiera.
 * `mechanics`: mecánicas que además deben estar presentes.
 */
export const FAMILIES = [
  // Apilar clase es la firma mas fuerte que hay. `{token}` se sustituye por el
  // apodo de la clase apilada: Jester x4 -> "Ballad Quartet", Crusader x3 -> "Cross Pack".
  { id: 'quartet',    name: '{token} Quartet', priority: 96, sameClass: 4, noVariant: true },
  { id: 'hound-pack', name: 'Hound Pack',      priority: 95, requires: [{ any: ['Houndmaster'], count: 2 }] },
  { id: 'pack',       name: '{token} Pack',    priority: 76, sameClass: 3 },

  { id: 'all-good',     name: 'Feral Contract',   priority: 84,
    requires: [{ any: ['Abomination'], count: 1 }, { any: ['Houndmaster'], count: 1 }, { any: ['Arbalest', 'Musketeer'], count: 1 }] },
  { id: 'blood-kennel', name: 'Rabid Devotion',   priority: 74,
    requires: [{ any: ['Flagellant'], count: 1 }, { any: ['Houndmaster'], count: 1 }] },
  { id: 'virulent',     name: 'Virulent Alchemy', priority: 80,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Plague Doctor'], count: 1 }, { any: ['Houndmaster'], count: 1 }] },
  { id: 'stun-control', name: 'Iron Shackles',    priority: 78,
    requires: [{ any: ['Abomination'], count: 1 }, { any: ['Plague Doctor'], count: 1 }, { any: ['Crusader'], count: 1 }] },
  { id: 'dark-ritual',  name: 'Dark Ritual',      priority: 72,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Plague Doctor'], count: 1 }] },
  { id: 'marked-prey',  name: 'Marked Prey',      priority: 70,
    requires: [{ any: ['Houndmaster'], count: 1 }, { any: ['Arbalest', 'Musketeer'], count: 1 }],
    mechanics: ['mark'] },
  { id: 'hex-battery',  name: 'Hex Battery',      priority: 66,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Arbalest', 'Musketeer'], count: 1 }] },
  { id: 'holy-hymn',    name: 'Holy Hymn',        priority: 64, requires: [{ any: ['Vestal'], count: 1 }] },
  { id: 'mirage-dance', name: 'Mirage Dance',     priority: 62,
    requires: [{ any: ['Grave Robber'], count: 1 }, { any: ['Abomination'], count: 1 }] },
  { id: 'gold-rush',    name: 'Curious Coin',     priority: 60, requires: [{ any: ['Antiquarian'], count: 1 }] },
  { id: 'riposte-wall', name: 'Waiting Blade',    priority: 58,
    requires: [{ any: ['Highwayman', 'Man at Arms', 'Duelist', 'Leper'], count: 1 }], mechanics: ['riposte'] },
  { id: 'ember-trail',  name: 'Ember Trail',      priority: 56, requires: [{ any: ['Runaway'], count: 1 }] },
  { id: 'ballad-choir', name: 'Grand Finale',     priority: 54,
    requires: [{ any: ['Jester'], count: 1 }, { any: ['Arbalest', 'Musketeer', 'Occultist'], count: 1 }] },
  { id: 'iron-line',    name: 'Grim Bastion',     priority: 52,
    requires: [{ any: ['Leper', 'Man at Arms'], count: 1 }, { any: ['Crusader', 'Flagellant', 'Man at Arms', 'Leper'], count: 1 }],
    mechanics: ['guard'] },
  { id: 'bounty-run',   name: 'Blood Money',      priority: 50,
    requires: [{ any: ['Bounty Hunter'], count: 1 }, { any: ['Abomination'], count: 1 }] },

  // Rescates por termino de campamento: prioridad baja a proposito, solo cazan
  // lo que ninguna firma de composicion ha reclamado antes.
  { id: 'dark-ritual-camp', name: 'Dark Ritual', priority: 30, campTerms: ['ritual'] },
  { id: 'torchless',        name: 'Torchless',   priority: 28, campTerms: ['torchless'] }
];

/**
 * Familia de reserva cuando ninguna firma encaja: se toma la mecánica dominante.
 * Sirve además de aviso — si una comp cae aquí, probablemente merezca su propia
 * firma en FAMILIES.
 */
export const MECHANIC_FAMILIES = {
  mark:    'Marked Prey',
  bleed:   'Red Harvest',
  blight:  'Creeping Rot',
  burn:    'Ember Trail',
  stun:    'Iron Shackles',
  riposte: 'Waiting Blade',
  guard:   'Grim Bastion',
  heal:    'Mercy Ward',
  stress:  'Grand Finale',
  shuffle: 'Broken Ranks',
  gold:    'Curious Coin'
};

/** Ninguna firma ni mecanica la explica: nombre a proposito poco lucido, para que cante. */
export const FALLBACK_FAMILY = 'Ragged Band';

/** Token corto por mazmorra, disponible como variante de último recurso. */
export const REGION_TOKENS = {
  'The Ruins': 'Ruins',
  'The Cove': 'Cove',
  'The Warrens': 'Warrens',
  'The Weald': 'Weald',
  'The Courtyard': 'Court',
  'The Darkest Dungeon': 'Darkest',
  'The Darkest Dungeon II': 'DD2'
};
