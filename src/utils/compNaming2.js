/**
 * Nombrar una comp por lo que HACE, no por quien va dentro.
 *
 * La taxonomia por firmas (`compNaming.js`) reparte por clases y deja de
 * repartir cuando la libreria crece -- el porque esta en `src/data/compAxes.js`,
 * que es donde se afina esto. Aqui solo esta el motor.
 *
 * ## Tres ranuras, tres trabajos distintos
 *
 * El sistema anterior pedia a un solo texto que fuera a la vez descripcion e
 * identificador, y eso tira en direcciones opuestas: una descripcion QUIERE
 * repetirse entre comps parecidas, un identificador NO puede. De ahi salio todo
 * el aparato de desempates -- region, campamento, rango, y al final un `... 2`.
 * Separados:
 *
 *   clave      las cuatro clases. Ya era la definicion de identidad del proyecto
 *              (`compIdentity.js`), y es unica por construccion.
 *   nombre     que hace la comp. COMPARTIDO a proposito: 104 de 239 nombres los
 *              llevan dos o mas comps, y asi es como se navega la libreria.
 *   tags       todo lo demas.
 *
 * ## La comp no la nombra el reparto
 *
 * Las mismas cuatro clases con otro kit son otro plan, y el nombre lo dice: los
 * tres Flagelante+Bounty+Houndmaster+Plague de la libreria salen `Red Harvest`,
 * `Crimson Tide` y `Exsanguination` segun cuanto sangren de verdad. La taxonomia
 * vieja solo podia separarlos por region, que de la comp no dice nada.
 */

import { compProfile, AXIS_KEYS } from './compProfile';
import {
  ENGINES, AXIS_LIMITS, AXIS_WORDS, PURPOSE_CAMP,
  STACK_NAMES, EVEN_NAMES, SAME_ROLE
} from '../data/compAxes';
import { HERO_TOKENS } from '../data/compTaxonomy';

const tokenOf = (heroClass) => HERO_TOKENS[heroClass]?.token || heroClass;
const roleOf = (heroClass) => SAME_ROLE[heroClass] || heroClass;

/** Cuantos de `sorted` (descendente) son >= x. Binaria: se llama mucho. */
const atLeast = (sorted, x) => {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] >= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/**
 * Prepara un nombrador contra una libreria concreta.
 *
 * Hace falta la libreria entera porque la regla es comparativa: un hecho vale lo
 * raro que es AQUI. El mismo 19% de quemadura es un plan en esta libreria (media
 * 2.8%) y seria ruido en otra donde todo el mundo quema.
 *
 * @param {Array} library  las comps contra las que medir
 * @returns {{nameFor: Function, axisStats: Function}}
 */
export const buildNamer = (library) => {
  const comps = (library || []).map((c) => ({ comp: c, ...compProfile(c) }));
  const total = comps.length || 1;

  // Percentil empirico y no una z: casi todos los ejes estan inflados a cero
  // -- media libreria no tiene riposte-- y ahi una normal grita "extremo" por
  // tener la cosa siquiera. Se vio: 28 comps llamadas `Thornfield`.
  const sortedByAxis = {};
  AXIS_KEYS.forEach((k) => {
    sortedByAxis[k] = comps.map((c) => c.axes[k]).sort((a, b) => b - a);
  });
  const pct = (k, x) => atLeast(sortedByAxis[k], x) / total;
  const axisBits = (k, x) => (x <= 0 ? 0 : -Math.log2(Math.max(pct(k, x), 1 / total)));
  const freqBits = (n) => -Math.log2(n / total);

  const tally = (pick) => {
    const seen = {};
    comps.forEach(({ comp }) => new Set(pick(comp)).forEach((v) => { seen[v] = (seen[v] || 0) + 1; }));
    return seen;
  };
  const classCount = tally((c) => (c.heroes || []).map((h) => roleOf(h.heroClass)));
  const campCount = tally((c) => (c.heroes || [])
    .flatMap((h) => h.activeCampSkills || []).filter((s) => PURPOSE_CAMP[s]));
  const regionCount = tally((c) => [c.location].filter(Boolean));

  const axisFact = (key, share) => ({
    kind: 'axis', key, share, bits: axisBits(key, share), attr: AXIS_WORDS[key].attr
  });

  // Un motor manda si es raro AQUI **y** pesa en ESTA comp. Solo lo primero
  // producia `Creeping Rot` en comps cuyo veneno no estaba ni entre sus cuatro
  // cuotas mayores; solo lo segundo ahoga al riposte, que promedia 1.2% y nunca
  // ganaria una comparacion de cuotas crudas contra el critico, que promedia 31%.
  const enginesOf = (axes) => ENGINES
    .filter((k) => axes[k] >= AXIS_LIMITS.minEngine && pct(k, axes[k]) <= AXIS_LIMITS.dominantPct)
    .map((k) => axisFact(k, axes[k]))
    // Por bits x cuota: solo con los bits gana siempre lo mas raro aunque sea una
    // esquirla de la comp. El producto pregunta las dos cosas a la vez, que es
    // como se lee un nombre.
    .sort((a, b) => b.bits * b.share - a.bits * a.share);

  const shapesOf = (axes) => AXIS_KEYS
    .filter((k) => !ENGINES.includes(k) && axes[k] > 0 && pct(k, axes[k]) <= AXIS_LIMITS.dominantPct)
    .map((k) => axisFact(k, axes[k]))
    .sort((a, b) => b.bits - a.bits);

  const sideFactsOf = (comp) => {
    const out = [];
    for (const cls of new Set((comp.heroes || []).map((h) => h.heroClass))) {
      const n = classCount[roleOf(cls)];
      // El token que sale es el heroe REAL; los bits son los de su ROL, porque
      // Arbalest y Musketeer son el mismo heroe (ver SAME_ROLE).
      if (n) out.push({ kind: 'class', key: roleOf(cls), bits: freqBits(n), attr: tokenOf(cls) });
    }
    for (const camp of new Set((comp.heroes || []).flatMap((h) => h.activeCampSkills || []))) {
      if (PURPOSE_CAMP[camp] && campCount[camp]) {
        out.push({ kind: 'camp', key: camp, bits: freqBits(campCount[camp]), attr: PURPOSE_CAMP[camp] });
      }
    }
    if (comp.location && regionCount[comp.location]) {
      out.push({
        kind: 'region', key: comp.location, bits: freqBits(regionCount[comp.location]),
        attr: String(comp.location).replace(/^The /, '')
      });
    }
    return out.sort((a, b) => b.bits - a.bits);
  };

  const stackOf = (comp) => {
    const count = {};
    (comp.heroes || []).forEach((h) => { count[h.heroClass] = (count[h.heroClass] || 0) + 1; });
    const [cls, n] = Object.entries(count).sort((a, b) => b[1] - a[1])[0] || [];
    return STACK_NAMES[n] ? STACK_NAMES[n].replace('{token}', tokenOf(cls)) : null;
  };

  // Quien encabeza cada comp, para poder medir los GRADOS despues. El grado se
  // mide entre las comps que encabezan ESE eje: contra la libreria entera, la
  // rareza del eje se comia la intensidad de la comp.
  const headOf = (axes) => {
    const engines = enginesOf(axes);
    if (engines.length) return engines[0];
    return shapesOf(axes)[0] || null;
  };
  const leadShares = {};
  comps.forEach(({ axes }) => {
    const head = headOf(axes);
    if (head) (leadShares[head.key] = leadShares[head.key] || []).push(head.share);
  });
  Object.values(leadShares).forEach((list) => list.sort((a, b) => b - a));

  const tierOf = (key, share) => {
    const list = leadShares[key];
    if (!list || !list.length) return 0;
    const r = atLeast(list, share) / list.length;
    const [hot, warm] = AXIS_LIMITS.tierCuts;
    return r <= hot ? 2 : r <= warm ? 1 : 0;
  };
  const wordFor = (fact) => AXIS_WORDS[fact.key].lead[tierOf(fact.key, fact.share)];

  /**
   * El nombre de una comp, y en que se apoya.
   *
   * @returns {{name, kind, lead, second, key, axes}}
   *   `kind` es de que tipo salio la ranura 1: `stack`, `engine`, `shape` o
   *   `even`. Que `even` sean pocas es la señal de que el resto si tenia algo
   *   que contar; si engorda, faltan ejes.
   */
  const nameFor = (comp) => {
    const { axes } = compProfile(comp);
    const stack = stackOf(comp);
    const engines = enginesOf(axes);
    const lead = engines[0] || null;
    const shapes = shapesOf(axes);
    const side = [...shapes, ...sideFactsOf(comp)].sort((a, b) => b.bits - a.bits);

    // Sin motor la comp todavia tiene FIGURA, y esa la describe: una party que no
    // mata de ninguna manera concreta pero aguanta tras un muro es `Shield Wall`,
    // no "compania correcta".
    const shape = !lead && !stack ? shapes[0] || null : null;

    let slot1;
    if (stack) slot1 = stack;
    else if (lead) slot1 = wordFor(lead);
    else if (shape) slot1 = wordFor(shape);
    else {
      const live = AXIS_KEYS.filter((k) => axes[k] > 0).map((k) => pct(k, axes[k]));
      const flattest = live.length ? Math.min(...live) : 1;
      slot1 = EVEN_NAMES[flattest <= 0.35 ? 0 : flattest <= 0.5 ? 1 : 2];
    }

    const spent = new Set([lead?.key, shape?.key]);
    const second = [...engines, ...side]
      .filter((f) => !spent.has(f.key) && f.bits >= AXIS_LIMITS.slot2Bits)
      .sort((a, b) => b.bits - a.bits)[0] || null;
    // Una pila ya se explica sola; lo que le falta es que hace.
    const tail = stack && lead ? { attr: AXIS_WORDS[lead.key].attr } : second;

    return {
      name: tail ? `${slot1}${AXIS_LIMITS.separator}${tail.attr}` : slot1,
      kind: stack ? 'stack' : lead ? 'engine' : shape ? 'shape' : 'even',
      lead: lead || shape || null,
      second: tail,
      key: (comp.heroes || []).map((h) => tokenOf(h.heroClass)).sort().join('_'),
      axes
    };
  };

  /** Media, desviacion y maximo de cada eje. Para el informe. */
  const axisStats = () => AXIS_KEYS.map((k) => {
    const values = comps.map((c) => c.axes[k]);
    const mean = values.reduce((a, b) => a + b, 0) / total;
    const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / total);
    return { axis: k, mean, sd, max: Math.max(...values), engine: ENGINES.includes(k) };
  });

  return { nameFor, axisStats };
};

/** El nombre de fichero de un nombre: sin `&`, sin `:`, espacios a guion bajo. */
export const toCompFileName2 = (name) =>
  `${String(name).replace(/&/g, '').replace(/[:]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_')}.json`;
