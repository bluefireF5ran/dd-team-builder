// Vocabulario de la taxonomía de comps.
//
// Este fichero es SOLO datos: es el sitio donde afinar el sistema de nombres sin
// tocar la lógica (src/utils/compNaming.js). Cuatro piezas:
//
//   1. HERO_TOKENS       — UN apodo corto por clase ("Occultist" -> "Warlock").
//   2. MECHANICS         — qué hace la comp, deducido de las skills activas.
//   3. FAMILIES          — firmas de pareja/trío/término que dan el nombre de familia.
//   4. MECHANIC_FAMILIES — red de seguridad cuando ninguna firma encaja.
//
// La regla de oro está en NAME_LIMITS: un nombre son DOS ranuras, "Familia: Variante".
// Todo lo demás que sabemos de la comp vive en los tags, no en el nombre.
//
// DOS INVARIANTES que hacen que la taxonomía se pueda leer al revés:
//   · Un token = una clase, siempre. `Snipe` es el Musketeer en TODA la librería;
//     nunca aparece como `Musket` ni `Buckshot` en un nombre (para eso está `aka`,
//     que solo alimenta la búsqueda).
//   · Ningún nombre de MECHANIC_FAMILIES coincide con uno de FAMILIES. Si dos comps
//     comparten familia es porque comparten firma, no por casualidad de nombres.

/**
 * Presupuesto de caracteres. La taxonomía completa vive en los tags; el nombre
 * solo lleva 2 ranuras. `token` acota una variante de una sola pieza; `variant`
 * acota la variante entera, que puede ser una pareja ("Royal & Bulwark") cuando
 * un solo token no distingue a la comp de sus hermanas.
 */
export const NAME_LIMITS = {
  family: 18,
  token: 14,
  variant: 22,
  separator: ': ',
  pairJoin: ' & '
};

/**
 * Apodo corto por clase. `token` es el ÚNICO que puede salir en un nombre.
 * `aka` son sinónimos que solo alimentan el buscador de la librería: escribir
 * "hex", "musket" o "chop" encuentra al Occultist, al Musketeer y al Leper sin
 * que esas palabras lleguen nunca a un nombre.
 *
 * NINGUNA palabra puede significar dos cosas, `aka` incluidos. `Hymn` llegó a ser
 * a la vez apodo de la Vestal y etiqueta de la mecánica de estrés, y "Contract &
 * Hymn" se leía como "lleva Vestal" cuando quería decir "cura estrés". Hay un
 * test que cruza tokens, `aka`, mecánicas, campamentos, regiones y rangos.
 */
export const HERO_TOKENS = {
  'Abomination':   { token: 'Beast',    aka: ['Rage', 'Chain', 'Transform'] },
  'Antiquarian':   { token: 'Money',    aka: ['Vapour', 'Purse', 'Gold'] },
  'Arbalest':      { token: 'Volley',   aka: ['Flare', 'Bolt', 'Sniper'] },
  'Bounty Hunter': { token: 'Contract', aka: ['Bounty', 'Takedown'] },
  // `Holy` no puede ser sinonimo del Crusader: ya es media familia (`Holy Hymn`)
  // y media habilidad (`Holy Lance`), asi que dentro de un nombre no dice heroe.
  'Crusader':      { token: 'Cross',    aka: ['Templar', 'Smite'] },
  'Duelist':       { token: 'Duel',     aka: ['Touche', 'Feint'] },
  'Flagellant':    { token: 'Blood',    aka: ['Penance', 'Exanimate'] },
  'Grave Robber':  { token: 'Lunge',    aka: ['Shade', 'Dagger', 'Dance'] },
  'Hellion':       { token: 'Berserk',  aka: ['Hell', 'Yawp'] },
  'Highwayman':    { token: 'Heist',    aka: ['Pistol', 'Vein'] },
  'Houndmaster':   { token: 'Hound',    aka: ['Whistle', 'Dog', 'Hunter'] },
  'Jester':        { token: 'Ballad',   aka: ['Joker', 'Encore', 'Clown'] },
  'Leper':         { token: 'Royal',    aka: ['Chop', 'Solemn'] },
  'Man at Arms':   { token: 'Bulwark',  aka: ['Rampart', 'Command'] },
  'Musketeer':     { token: 'Snipe',    aka: ['Musket', 'Buckshot'] },
  'Occultist':     { token: 'Warlock',  aka: ['Hex', 'Abyss'] },
  'Plague Doctor': { token: 'Plague',   aka: ['Cure', 'Doctor', 'Poison'] },
  'Runaway':       { token: 'Burn',     aka: ['Ember', 'Firefly'] },
  'Shieldbreaker': { token: 'Sand',     aka: ['Dream', 'Serpent'] },
  'Vestal':        { token: 'Faith',    aka: ['Light', 'Nun'] }
};

/**
 * Mecánicas detectadas a partir de las skills activas. `label` es el token que
 * puede acabar en el nombre; `skills` son las skills que suman a esa mecánica.
 * `weight` inclina qué mecánica se considera dominante cuando hay empate, y
 * además decide cuántas skills hacen falta: una mecánica de peso (>=3) se marca
 * con una sola skill, las genéricas necesitan dos para no etiquetar cualquier cosa.
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
    label: 'Pyre',
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
    label: 'Rally',
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
    label: 'Coin',
    weight: 3,
    skills: ['Fortifying Vapours', 'Invigorating Vapours', 'Nervous Stab', 'Ransack']
  }
];

/**
 * Penalización por tipo de token al elegir variante. Manda quién discrimina más,
 * pero no hasta el punto de que una región gane a un héroe: sumar esto al reparto
 * mantiene el orden "pila > héroe > campamento > mecánica > región".
 */
export const VARIANT_KIND_PENALTY = {
  stack: 0,
  hero: 1,
  pick: 2,
  // A partir de aqui son desempates, y solo los usa la tercera pasada. El orden
  // no es casual: primero los HECHOS de la comp (que lleva al campamento, donde
  // se juega, en que rango va cada uno) y despues las etiquetas DERIVADAS de las
  // skills, que dicen menos porque media libreria las comparte.
  camp: 4,
  region: 6,
  mech: 8,
  skill: 10,
  // El rango va el ultimo aunque sea un hecho: TODAS las comps tienen cuatro
  // rangos, asi que siempre "separa" y se comeria a cualquier desempate mejor.
  // Es el que queda cuando dos comps solo se diferencian en el orden.
  rank: 14,
  // Un token suelto de desempate ("Farmstead") describe menos que el mismo token
  // pegado al reparto ("Bulwark & Farmstead"): este recargo inclina hacia la pareja.
  lone: 5
};

/**
 * Tipos de token que describen QUIÉN va en la comp. Solo estos pueden dar nombre
 * por sí solos o formar la pareja: una variante `Cove` o `Tangle` distingue tan
 * poco que dos comps con ese nombre no se pueden comparar de un vistazo.
 * Los demás (campamento, mecánica, región) solo entran como desempate final.
 */
export const ROSTER_KINDS = ['stack', 'hero', 'pick'];

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
 * `requires`:  cada entrada es una ranura {any:[clases], count:N}.
 * `sameClass`: N copias de una misma clase cualquiera.
 * `mechanics`: mecánicas que además deben estar presentes.
 * `campTerms`: términos de campamento que además deben estar presentes.
 *
 * Los tramos de prioridad son deliberados y valen como documentación:
 *   90+    apilar clase — la firma más fuerte que hay, se ve de un vistazo.
 *   80s    tríos con nombre: tres clases que se buscan entre ellas.
 *   60-70s parejas con nombre: el motor son dos clases.
 *   50s    familias de estrategia: manda la mecánica, la clase solo la habilita.
 *   20-30s rescates por término de campamento.
 */
export const FAMILIES = [
  // --- 90s: pilas de clase ---------------------------------------------------
  // `{token}` se sustituye por el apodo de la clase apilada:
  // Jester x4 -> "Ballad Quartet", Crusader x3 -> "Cross Pack".
  { id: 'quartet',    name: '{token} Quartet', priority: 98, sameClass: 4, noVariant: true },
  // hound-pack por delante de `pack` a proposito: si el trio de Houndmasters lo
  // cazara `pack`, la firma consumiria las 3 copias y la comp perderia el token
  // "Trio Hound" que es justo lo que la distingue de sus hermanas.
  { id: 'hound-pack', name: 'Hound Pack',      priority: 96, requires: [{ any: ['Houndmaster'], count: 2 }] },
  { id: 'pack',       name: '{token} Pack',    priority: 94, sameClass: 3 },

  // --- 80s: tríos con nombre -------------------------------------------------
  // Abom + Hound + fusilero: el "all good boys", marca y sangra a la vez.
  { id: 'feral-contract',   name: 'Feral Contract',   priority: 86,
    requires: [{ any: ['Abomination'], count: 1 }, { any: ['Houndmaster'], count: 1 },
               { any: ['Arbalest', 'Musketeer'], count: 1 }] },
  // Occ + PD + Hound: veneno con doble marca y curación de emergencia.
  { id: 'virulent-alchemy', name: 'Virulent Alchemy', priority: 84,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Plague Doctor'], count: 1 },
               { any: ['Houndmaster'], count: 1 }] },
  // Abom + PD + Crusader: la comp de aturdir de manual.
  { id: 'iron-shackles',    name: 'Iron Shackles',    priority: 82,
    requires: [{ any: ['Abomination'], count: 1 }, { any: ['Plague Doctor'], count: 1 },
               { any: ['Crusader'], count: 1 }] },
  // Occ + Hound + fusilero: Vulnerability Hex y Target Whistle sobre el mismo
  // objetivo. Antes caía en "Marked Prey", que se había comido 23 comps.
  { id: 'cursed-quarry',    name: 'Cursed Quarry',    priority: 80,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Houndmaster'], count: 1 },
               { any: ['Arbalest', 'Musketeer'], count: 1 }] },

  // --- 60-70s: parejas con nombre --------------------------------------------
  { id: 'rabid-devotion', name: 'Rabid Devotion', priority: 76,
    requires: [{ any: ['Flagellant'], count: 1 }, { any: ['Houndmaster'], count: 1 }] },
  { id: 'blood-money',    name: 'Blood Money',    priority: 74,
    requires: [{ any: ['Bounty Hunter'], count: 1 }, { any: ['Abomination'], count: 1 }] },
  { id: 'dark-ritual',    name: 'Dark Ritual',    priority: 72,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Plague Doctor'], count: 1 }] },
  { id: 'marked-prey',    name: 'Marked Prey',    priority: 70,
    requires: [{ any: ['Houndmaster'], count: 1 }, { any: ['Arbalest', 'Musketeer'], count: 1 }],
    mechanics: ['mark'] },
  { id: 'hex-battery',    name: 'Hex Battery',    priority: 68,
    requires: [{ any: ['Occultist'], count: 1 }, { any: ['Arbalest', 'Musketeer'], count: 1 }] },
  { id: 'mirage-dance',   name: 'Mirage Dance',   priority: 66,
    requires: [{ any: ['Grave Robber'], count: 1 }, { any: ['Abomination'], count: 1 }] },
  { id: 'gold-rush',      name: 'Curious Coin',   priority: 64,
    requires: [{ any: ['Antiquarian'], count: 1 }] },

  // --- 50s: familias de estrategia -------------------------------------------
  // Aquí manda la mecánica; la clase solo dice quién puede ejecutarla.
  { id: 'ember-trail',  name: 'Ember Trail',   priority: 60,
    requires: [{ any: ['Runaway'], count: 1 }], mechanics: ['burn'] },
  { id: 'riposte-wall', name: 'Waiting Blade', priority: 58,
    requires: [{ any: ['Highwayman', 'Man at Arms', 'Duelist', 'Leper', 'Crusader'], count: 1 }],
    mechanics: ['riposte'] },
  { id: 'iron-line',    name: 'Grim Bastion',  priority: 56,
    requires: [{ any: ['Leper', 'Man at Arms'], count: 1 },
               { any: ['Crusader', 'Flagellant', 'Man at Arms', 'Leper'], count: 1 }],
    mechanics: ['guard'] },
  { id: 'ballad-choir', name: 'Grand Finale',  priority: 54,
    requires: [{ any: ['Jester'], count: 1 }, { any: ['Arbalest', 'Musketeer', 'Occultist'], count: 1 }] },
  // La Vestal no es un motor, es la enfermera: solo da nombre cuando ninguna otra
  // firma explica la comp. Antes estaba en 64 y se llevaba 19 comps por las buenas.
  { id: 'holy-hymn',    name: 'Holy Hymn',     priority: 50,
    requires: [{ any: ['Vestal'], count: 1 }] },

  // --- 20-30s: rescates por término de campamento ----------------------------
  // Prioridad baja a propósito: solo cazan lo que ninguna firma ha reclamado.
  { id: 'unspeakable', name: 'Unspeakable Pact', priority: 30, campTerms: ['ritual'] },
  { id: 'torchless',   name: 'Torchless',        priority: 28, campTerms: ['torchless'] }
];

/**
 * Red de seguridad: ninguna firma encaja y la familia sale de la mecánica dominante.
 *
 * NINGUNO de estos nombres aparece en FAMILIES, y es a propósito. Si una comp se
 * llama "Hammer Fall" es porque NADA la explicaba, y eso se ve en el nombre; si
 * compartiera nombre con una familia de firma, la mezcla pasaría desapercibida.
 * Que un bloque de aquí crezca es la señal de que le falta una firma propia.
 */
export const MECHANIC_FAMILIES = {
  mark:    'Open Season',
  bleed:   'Red Harvest',
  blight:  'Creeping Rot',
  burn:    'Cinder Wake',
  stun:    'Hammer Fall',
  riposte: 'Counterpoint',
  guard:   'Shield Wall',
  heal:    'Mercy Ward',
  stress:  'Steady Nerves',
  shuffle: 'Broken Ranks',
  gold:    'Coin Purse'
};

/** Ni firma ni mecánica la explican: nombre a propósito poco lucido, para que cante. */
export const FALLBACK_FAMILY = 'Ragged Band';

/**
 * Token corto por mazmorra. Es un desempate de los buenos: no es una etiqueta
 * derivada sino un hecho de la comp, y separa a dos gemelas que se juegan en
 * sitios distintos. Tiene que cubrir LOCATIONS entero — una zona que falte aquí
 * es una comp que se queda sin ese desempate.
 */
export const REGION_TOKENS = {
  'The Ruins': 'Ruins',
  'The Warrens': 'Warrens',
  'The Weald': 'Weald',
  'The Cove': 'Cove',
  'The Hamlet': 'Hamlet',
  'The Courtyard': 'Court',
  'The Farmstead': 'Farmstead',
  'The Darkest Dungeon I': 'Darkest I',
  'The Darkest Dungeon II': 'Darkest II',
  'The Darkest Dungeon III': 'Darkest III',
  'The Darkest Dungeon IV': 'Darkest IV',
  'Butcher Circus': 'Circus',
  'Sunward Isles': 'Sunward',
  'The Pet Cemetery': 'Cemetery',
  'The Mountain': 'Mountain',
  'The Arena': 'Arena',
  'Dimensional Havoc': 'Havoc'
};

/**
 * Palabra por rango. Dos comps con las mismas cuatro clases en distinto orden NO
 * son la misma comp — en este juego el rango lo es casi todo — pero ningún token
 * de reparto las separa. `Beast Second` frente a `Beast Third` sí.
 */
export const RANK_WORDS = ['Front', 'Second', 'Third', 'Back'];
