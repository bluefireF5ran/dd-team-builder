/**
 * Parte un texto de efecto en trozos, marcando las palabras clave del juego.
 *
 * El texto de una skill, un trinket o un quirk es la misma prosa gris para
 * todo, y en esa prosa "Mark Target" y "+100% DMG vs Marked" no se parecen en
 * nada aunque sean las dos mitades de la misma jugada. Pintarlas del mismo
 * color -- el del juego, `gameColours.js` -- es lo que hace que el ojo las
 * junte sin leer.
 *
 * Devuelve `[{ text, keyword }]`, con `keyword` null en lo que no lo es. Puro y
 * sin React, para poder probarlo y para que quien pinte decida como.
 *
 * ## Por que reglas y no una lista de palabras
 *
 * Porque el juego conjuga: `Stun` / `Stunned`, `Bleed` / `Bleeding`,
 * `Mark Target` / `vs Marked`. Y porque algunas palabras solo son clave con un
 * numero detras: `Back 2` es moverse, "Turn Back Time" no.
 *
 * `Blight Resist` pinta solo `Blight`: la resistencia es a esa cosa, y es
 * justamente el enlace que se quiere ver entre el trinket y la skill.
 */

const RULES = [
  ['deathdoor', "Death'?s\\s+Door"],
  ['deathblow', 'Death\\s?blow'],
  // Antes que `burn` y `stealth`: "Controlled Burn" y "Bypass/Remove Stealth"
  // son otra cosa que la palabra suelta, y el mas largo gana a igual inicio.
  ['controlledBurn', 'Controlled\\s+Burn'],
  [
    'bypass',
    "Armou?r\\s+Piercing|Ignores?\\s+(?:PROT|Guard|Stealth)|(?:Bypass|Break)\\s+Guard|Can'?t\\s+be\\s+Guarded|Bypass(?:\\s*/\\s*Remove)?\\s+Stealth|Removes?\\s+Stealth",
  ],
  ['block', '(?:Damage\\s+)?Block|Aegis'],
  ['torch', 'Torch'],
  ['mark', 'Mark(?:ed)?(?:\\s+(?:Target|Self))?'],
  ['stun', 'Stun(?:ned|s)?'],
  ['bleed', 'Bleed(?:ing|s)?'],
  ['blight', 'Blight(?:ed|s)?|Poison(?:ed)?'],
  ['burn', 'Burn(?:ing|s)?'],
  ['disease', 'Disease[sd]?'],
  ['stress', 'Stress'],
  ['healhp', 'Heal(?:ing|s|ed)?'],
  // Moverte tu y mover al enemigo son colores distintos, como en el borde.
  ['selfMove', '(?:Forward|Back)(?=\\s+\\d)'],
  ['move', 'Knockback|Pull|Shuffle|Move'],
  ['debuff', 'Debuff(?:s|ed)?'],
  ['buff', 'Buff(?:s|ed)?'],
  ['guard', 'Guard(?:ed|ing|s)?'],
  ['riposte', 'Riposte'],
  ['stealth', 'Stealth(?:ed)?'],
  ['virtue', 'Virtue(?:s|ous)?'],
  ['afflicted', 'Afflict(?:ed|ion)'],
  ['trap', 'Traps?'],
  ['scouting', 'Scout(?:ing)?'],
  ['surprised', 'Surprise[ds]?'],
].map(([keyword, source]) => ({ keyword, re: new RegExp(`\\b(?:${source})\\b`, 'gi') }));

export const KEYWORDS = RULES.map((r) => r.keyword);

export const keywordSegments = (text) => {
  if (typeof text !== 'string' || !text) return [];

  const hits = [];
  RULES.forEach(({ keyword, re }) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) hits.push({ start: m.index, end: m.index + m[0].length, keyword });
  });
  // El que empieza antes gana; a igual inicio, el mas largo ("Marked Target"
  // antes que "Mark"). Lo que se solape con uno ya elegido se descarta.
  hits.sort((a, b) => a.start - b.start || b.end - a.end);

  const out = [];
  let cursor = 0;
  hits.forEach((hit) => {
    if (hit.start < cursor) return;
    if (hit.start > cursor) out.push({ text: text.slice(cursor, hit.start), keyword: null });
    out.push({ text: text.slice(hit.start, hit.end), keyword: hit.keyword });
    cursor = hit.end;
  });
  if (cursor < text.length) out.push({ text: text.slice(cursor), keyword: null });
  return out;
};
