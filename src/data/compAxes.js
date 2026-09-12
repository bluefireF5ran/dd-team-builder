// Vocabulario y calibrado de la taxonomia por EJES.
//
// Este fichero es SOLO datos, igual que `compTaxonomy.js` lo es de la taxonomia
// por firmas: aqui se afina el sistema sin tocar `src/utils/compNaming2.js`.
//
// ## Por que hay una segunda taxonomia
//
// La primera reparte por FIRMA de clases, y eso deja de repartir cuando la
// libreria crece: a 461 comps, 240 encajan en dos firmas o mas a la vez, asi que
// en cual caen lo decide el `priority` y no la comp. `Curious Coin` se habia
// comido 80 comps, 76 repartos distintos y las 21 clases -- ya no es una familia,
// es la etiqueta "lleva Antiquarian". Enlazando las comps que comparten 3 de sus
// 4 heroes sale UN solo componente con las 461 dentro: no hay particion que
// encontrar, y forzarla es lo que producia los `... 2`.
//
// El otro problema era de informacion. El 85% de los tokens de variante se leen
// ya en los cuatro retratos, y `Hound` sale en 226 comps de 461: decirlo en el
// nombre vale un bit, una moneda al aire. El nombre se gastaba entero en repetir
// lo que la ficha ya enseña.
//
// ## La regla
//
// Un hecho se gana una ranura por lo RARO que es, medido contra esta libreria:
//
//     bits = -log2(fraccion de comps que lo cumplen al menos tanto)
//
// Misma vara para un eje continuo, una clase o un campamento, asi que compiten
// entre ellos y no hace falta una tabla de penalizaciones por tipo. Y se
// recalibra sola: el dia que `Hound` deje de ser raro, se cae de los nombres sin
// que nadie toque nada aqui.

/**
 * MOTORES: como se acaba la pelea. Una comp los construye o no los lleva.
 *
 * Los demas ejes son FIGURA (como esta armada), y esa distincion es lo unico
 * que impide que el nombre mienta: medidos juntos, `front` y `reach` mandaban en
 * 102 comps -- mas que ningun motor-- porque toda party tiene geometria de
 * rangos y su media es alta. Una figura califica; no encabeza, salvo cuando no
 * hay motor ninguno.
 */
export const ENGINES = ['bleed', 'blight', 'burn', 'stun', 'mark', 'riposte', 'crit'];

/**
 * Umbrales, y cada uno esta puesto por un fallo concreto que arreglo.
 *
 * `dominantPct`  el eje tiene que estar en el cuartil alto de la libreria. Sin
 *                esto salia `Shield Wall` en comps cuyo guard no estaba ni entre
 *                sus cuatro cuotas mayores.
 * `minEngine`    ...y ademas pesar algo en ESTA comp. El percentil solo dice
 *                "mas que las demas", y con medias tan bajas (blight 5%) una
 *                comp con UNA skill de veneno entraba en el cuartil alto. Dos
 *                acciones de dieciseis es el minimo para llamarlo un plan.
 * `slot2Bits`    ~1 de cada 5 comps o menos; por encima de esa frecuencia un
 *                token no distingue a nadie.
 * `tierCuts`     que fraccion de las comps que encabezan ese eje se lleva la
 *                palabra extrema y cual la intermedia.
 */
export const AXIS_LIMITS = {
  dominantPct: 0.25,
  minEngine: 0.12,
  slot2Bits: 2.4,
  tierCuts: [0.15, 0.50],
  separator: ': ',
  critBonus: 8      // a partir de que +CRIT% cuenta una skill como "de critico"
};

/**
 * Una palabra por eje, en tres grados, mas la forma corta para la ranura 2.
 *
 * El registro es el del Antepasado. El GRADO lo elige cuanto se desvia la comp,
 * asi que la intensidad viaja dentro de la palabra y no hace falta decirla
 * aparte -- y se mide entre las comps que encabezan ESE eje, no contra la
 * libreria entera: medido asi, `Thornfield` (el extremo) caia sobre las 28 comps
 * con riposte, porque la rareza del eje se comia la intensidad de la comp.
 *
 * NINGUN `attr` coincide con el `lead` de otro eje: una palabra, una cosa.
 */
export const AXIS_WORDS = {
  bleed:      { lead: ['Red Harvest', 'Crimson Tide', 'Exsanguination'],   attr: 'Crimson' },
  blight:     { lead: ['Creeping Rot', 'Black Humours', 'Pestilence'],     attr: 'Rot' },
  burn:       { lead: ['Cinder Wake', 'Pyre Song', 'Conflagration'],       attr: 'Ember' },
  stun:       { lead: ['Hammer Fall', 'Silent Choir', 'The Long Hush'],    attr: 'Hush' },
  mark:       { lead: ['Open Season', 'The Quarry', 'Death Sentence'],     attr: 'Quarry' },
  riposte:    { lead: ['Counterpoint', 'Waiting Blade', 'Thornfield'],     attr: 'Thorns' },
  crit:       { lead: ['Keen Edge', 'Fortune Favours', 'Ruinous Fortune'], attr: 'Keen' },
  guard:      { lead: ['Shield Wall', 'Grim Bastion', 'The Immovable'],    attr: 'Aegis' },
  heal:       { lead: ['Mercy Ward', 'Endless Mercy', 'Undying'],          attr: 'Mercy' },
  stressHeal: { lead: ['Steady Nerves', 'Kindled Resolve', 'Unbroken'],    attr: 'Resolve' },
  debuff:     { lead: ['Wasting Curse', 'Withering Hand', 'Enfeebled'],    attr: 'Withering' },
  enemyMove:  { lead: ['Broken Ranks', 'Disarray', 'Scattered Host'],      attr: 'Upheaval' },
  evade:      { lead: ['Shifting Shadow', 'Mirage Dance', 'Untouchable'],  attr: 'Shadow' },
  aoe:        { lead: ['Scattered Shot', 'Sweeping Ruin', 'Indiscriminate'], attr: 'Scatter' },
  reach:      { lead: ['Long Reach', 'The Far Shot', 'Nowhere to Hide'],   attr: 'Reach' },
  front:      { lead: ['Close Quarters', 'Press of Steel', 'Toe to Toe'],  attr: 'Melee' }
};

/**
 * Campamentos que por si solos dicen una intencion. Solo estos: los demas los
 * lleva media libreria y no distinguen nada.
 */
export const PURPOSE_CAMP = {
  'Dark Ritual': 'Pact',
  'Unspeakable Commune': 'Commune',
  'Snuff Box': 'Snuffed',
  'The Quickening': 'Quickening',
  'Zealous Speech': 'Zeal',
  "Hound's Watch": 'Kennel'
};

/**
 * Una pila de clase se ve de un vistazo y es rarisima, asi que se gana la ranura
 * 1 por encima de cualquier eje -- y ademas `Ballad Quartet` ya se leia bien.
 */
export const STACK_NAMES = { 4: '{token} Quartet', 3: '{token} Pack' };

/**
 * Cuando no destaca ni el motor ni la figura, la comp es una generalista de
 * verdad y el nombre lo dice. Que sean 13 y no 99 es la señal de que el resto
 * si tenia algo que contar; si esta lista engorda, faltan ejes.
 */
export const EVEN_NAMES = ['Sound Company', 'Measured Ruin', 'Ragged Band'];

/**
 * Clases que son la misma a efectos de sorpresa.
 *
 * Arbalest y Musketeer comparten fila en la hoja de stats -- mismas
 * resistencias, mismo sitio, mismo papel-- y en esta libreria se alternan por
 * region solo para variar. Contadas por separado, `Volley` (156) y `Snipe` (120)
 * parecian medio raras cada una; juntas son 276 de 461, o sea 0.7 bits, o sea
 * nada. Contarlas como una no cambio ningun nombre: el modelo ya las habia
 * descartado solo, que es justo lo que se le pide.
 */
export const SAME_ROLE = { Musketeer: 'Arbalest' };
