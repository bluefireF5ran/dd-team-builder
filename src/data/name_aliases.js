/**
 * Nombres alternativos aceptados para una misma entrada.
 *
 * La clave es el nombre canónico (el que se muestra en la UI y se guarda en los
 * equipos); el array son las grafías alternativas que deben resolverse a él.
 *
 * Se usan para dos cosas:
 *  - Canonicalizar equipos importados/guardados que traigan otra grafía
 *    (ver utils/nameNormalizer.js).
 *  - Encontrar la entrada al buscar por cualquiera de sus nombres.
 *
 * Los nombres canónicos son los del juego, verificados contra las tablas de
 * localización inglesas del propio Darkest Dungeon
 * (`localization/miscellaneous.string_table.xml` y las de cada DLC). Las
 * grafías alternativas son las que usaba esta app (venían de la wiki) y las
 * que aparecen en comps generadas fuera de aquí.
 */
export const NAME_ALIASES = {
  // ===== HERO CLASSES =====
  // El id interno del mod de la Sibyl (Workshop 3490076588) es 'sibyl_ms' -es
  // el que aparece en su página de Steam y en las loadouts exportadas por
  // herramientas que leen los ficheros del mod-. La app la muestra como 'Sibyl'.
  'Sibyl': ['sibyl_ms'],

  // ===== TRINKETS =====
  // str_inventory_title_trinketboss_tassle
  "Vvulf's Tassel": ["Vvulf's Tassle"],
  // str_inventory_title_trinketancestors_moustache_cream
  "Ancestor's Moustache Cream": ["Ancestor's Mustache Cream"],
  // str_inventory_title_trinkethunters_talon
  "Hunter's Talon": ["Hunter's Talons"],
  // 'dd_trinket' es el id interno del juego, no un nombre: aparece crudo en
  // comps generadas por herramientas que leen los ficheros del juego.
  'Talisman of the Flame': ['dd_trinket'],
  // str_inventory_title_trinketvampiric_goblet (Crimson Court)
  'The Tempting Goblet': ['Tempting Goblet'],
  // str_inventory_title_trinketthing_fang / _hide (Color of Madness)
  "Thing's Crystalline Fang": ['Crystalline Fang'],
  "Thing's Phase Shifting Hide": ['Phase Shifting Hide'],

  // ----- Backer trinkets (backertrinkets.string_table.xml) -----
  // Las erratas son del propio juego: 'Maddness' y 'Necklase' se escriben así.
  "AJ's Growling Tome of Maddness": ['Ajs Growling Tome of Madness'],
  'Crest of the 1100': ['Crest of 1100'],
  'K Scorpio Necklase': ['K Scorpio Necklace'],
  "Tome of Agh'Be": ['Tome of Agh Be'],
  // Aquí el canónico es el nombre corto: el del juego son 98 caracteres y no
  // cabe en ninguna tarjeta de la UI.
  'Papyrus Containing the Spell': [
    'Papyrus Containing The Spell To Preserve Its Possessor Against Attacks From He Who Is In The Water'
  ],

  // ===== QUIRKS =====
  // str_quirk_name_husk_slayer
  'Husk Slayer': ['Hulk Slayer'],
  // str_quirk_name_meditator
  Meditator: ['Mediator'],
  // str_quirk_name_alien_eye
  'Prismatic Eye': ['Primatic Eye'],
  // str_quirk_name_resilient
  Resilient: ['Resillient'],
  // str_quirk_name_unyielding
  Unyielding: ['Unyealding'],
  // str_quirk_name_cove_phobe
  'Cove Phobe': ['Cove Phove'],
  // str_quirk_name_fear_of_eldritch
  'Fear of Eldritch': ['Fear of Eldrich']
};

/**
 * Grafías alternativas que sólo valen DENTRO de una clase.
 *
 * `NAME_ALIASES` resuelve globalmente, y para las skills eso es incorrecto:
 * `Wound Care` es el nombre bueno en las dieciocho clases que cubría el CSV de
 * la wiki, y el nombre *equivocado* en las dos de Fire's Edge, que el juego
 * llama `First Aid`. Es la misma regla que ya sigue `gameIds.js` con los ids de
 * partida: **un renombrado sólo se aplica cuando la clase tiene de verdad esa
 * skill**, y por eso la tabla va indexada por clase.
 *
 * Forma: `clase -> campo -> canónico -> [grafías]`, donde `campo` es
 * `skills`, `campSkills` o `trinkets`.
 *
 * El síntoma que arreglan es silencioso: una comp que guarda `Snakeskin` pinta
 * "Selected: 4/4" mientras ninguno de los siete botones del roster se enciende,
 * porque el contador mira el array y el botón mira el roster.
 */
export const CLASS_NAME_ALIASES = {
  // La Shieldbreaker la escribe en dos palabras (`str_camping_skill_name_snake_skin`).
  Shieldbreaker: {
    campSkills: { 'Snake Skin': ['Snakeskin'] }
  },
  // Fire's Edge: el juego las renderiza desde la instalación como `First Aid`.
  // Sin este alias, `COMMON_VANILLA_CAMP_SKILLS` resuelve `Wound Care` a sí
  // mismo y deja al héroe con una camp skill que su clase no tiene.
  Duelist: {
    campSkills: { 'First Aid': ['Wound Care'] }
  },
  Runaway: {
    campSkills: { 'First Aid': ['Wound Care'] }
  }
};
