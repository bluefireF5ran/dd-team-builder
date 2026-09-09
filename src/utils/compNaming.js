// Motor de la taxonomía de comps.
//
// EL PROBLEMA: una taxonomía completa ("Occultist + Plague Doctor + Houndmaster,
// blight, stun, Ruins, v2") describe la comp perfectamente y no cabe en un nombre.
//
// LA REGLA: el nombre son DOS ranuras y punto — "Familia: Variante".
//   · Familia  = el motor de la comp (una pareja, un trío o un término clave).
//   · Variante = la descripción MÁS CORTA que la separa de sus hermanas de familia.
// El resto de la taxonomía no se pierde: sale en `tags`, para filtrar y buscar.
//
// La variante se construye como un "conjunto mínimo distintivo":
//   1. Si algún token es EXCLUSIVO de esta comp dentro de la familia, ese es el
//      nombre — "Marked Prey: Money" solo puede ser la del Antiquarian.
//   2. Si no, se emparejan los dos tokens de reparto más informativos, en orden
//      de rango — "Marked Prey: Royal & Bulwark".
//   3. Y solo si dos comps son gemelas hasta ahí, se añade el discriminante.
//
// El invariante que hace que todo esto se lea al revés: UN TOKEN = UNA CLASE.
// El Musketeer es `Snipe` en toda la librería. Antes había `alts` y la misma
// familia llegó a tener `Snipe`, `Musket` y `Buckshot` — tres nombres para el
// mismo héroe, que es justo lo que rompe una taxonomía.

import {
  NAME_LIMITS,
  HERO_TOKENS,
  MECHANICS,
  CAMP_TERMS,
  FAMILIES,
  MECHANIC_FAMILIES,
  FALLBACK_FAMILY,
  REGION_TOKENS,
  RANK_WORDS,
  VARIANT_KIND_PENALTY,
  ROSTER_KINDS
} from '../data/compTaxonomy';

/** Tokens que dicen QUIÉN va en la comp; son los únicos que pueden dar nombre solos. */
const isRoster = (candidate) => ROSTER_KINDS.includes(candidate.kind);

// "V2.0", "v3.0", "1.1", "ALT": marcas de variante heredadas. La V es de variante,
// no de version — y para eso ya esta la segunda ranura del nombre, que ademas dice
// QUE cambia en vez de limitarse a numerarlo. Se recortan y no se vuelven a poner.
const LEGACY_MARKER = /\s+(v\d+(?:\.\d+)*|\d+(?:\.\d+)+|alt)\s*$/i;

/** Separa "Blight, Bite & Bleed V2.1" en {base, marker}. El marcador se descarta. */
export const stripLegacyMarker = (name) => {
  const raw = String(name || '').trim();
  const match = raw.match(LEGACY_MARKER);
  if (!match) return { base: raw, marker: '' };
  return { base: raw.slice(0, match.index).trim(), marker: match[1].trim() };
};

/** Descompone un nombre ya taxonómico. Devuelve variant vacío si es un nombre libre. */
export const parseCompName = (name) => {
  const { base, marker } = stripLegacyMarker(name);
  const idx = base.indexOf(':');
  if (idx === -1) return { family: base, variant: '', marker, taxonomic: false };
  return {
    family: base.slice(0, idx).trim(),
    variant: base.slice(idx + 1).trim(),
    marker,
    taxonomic: true
  };
};

export const formatCompName = (family, variant) =>
  variant ? `${family}${NAME_LIMITS.separator}${variant}` : family;

/**
 * Una comp puede declararse fuera de la taxonomía con `"taxonomy": false`.
 * The Old Road es el caso: es el tutorial del juego, no una comp de la comunidad,
 * y renombrarla a "Ragged Band: Heist" solo la volvía irreconocible.
 */
export const isExempt = (comp) => comp && comp.taxonomy === false;

const heroToken = (heroClass) => (HERO_TOKENS[heroClass] || {}).token || heroClass;

/** Sinónimos de una clase. NO son nombres: solo alimentan el buscador. */
export const heroAka = (heroClass) => (HERO_TOKENS[heroClass] || {}).aka || [];

const countBy = (items) => {
  const map = new Map();
  items.forEach((item) => map.set(item, (map.get(item) || 0) + 1));
  return map;
};

/**
 * Extrae los hechos de una comp: quién va, qué hace y dónde.
 * Esta es la taxonomía COMPLETA — el nombre solo usará dos piezas de aquí.
 */
export const analyzeComp = (comp) => {
  const heroes = (comp.heroes || []).filter((h) => h && h.heroClass);
  const classes = heroes.map((h) => h.heroClass);
  const classCounts = countBy(classes);
  const activeSkills = heroes.flatMap((h) => h.activeSkills || []).filter(Boolean);
  const campSkills = heroes.flatMap((h) => h.activeCampSkills || []).filter(Boolean);
  const skillSet = new Set(activeSkills);
  const campSet = new Set(campSkills);

  const mechanics = MECHANICS.map((mech) => {
    const core = mech.skills.filter((s) => skillSet.has(s)).length;
    const payoff = (mech.payoff || []).filter((s) => skillSet.has(s)).length;
    const hits = core + payoff;
    return { tag: mech.tag, label: mech.label, weight: mech.weight, hits, score: hits * mech.weight };
  })
    // Una mecánica "de peso" (burn, riposte, gold, mark) cuenta con una sola skill;
    // las genéricas necesitan al menos dos para no etiquetar cualquier cosa.
    .filter((m) => m.hits >= (m.weight >= 3 ? 1 : 2))
    .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));

  const campTerms = CAMP_TERMS.filter((term) => term.campSkills.some((s) => campSet.has(s)));

  const stacks = [...classCounts.entries()]
    .filter(([, n]) => n >= 2)
    .map(([heroClass, count]) => ({ heroClass, count }))
    .sort((a, b) => b.count - a.count || a.heroClass.localeCompare(b.heroClass));

  const region = REGION_TOKENS[comp.location] || '';

  const tags = [
    ...[...new Set(classes)].map((c) => `hero:${heroToken(c).toLowerCase()}`),
    ...stacks.map((s) => `stack:${heroToken(s.heroClass).toLowerCase()}x${s.count}`),
    ...mechanics.map((m) => `mech:${m.tag}`),
    ...campTerms.map((t) => `camp:${t.tag}`),
    region ? `region:${region.toLowerCase()}` : ''
  ].filter(Boolean);

  // `ranks` conserva la posicion (frente -> retaguardia) incluyendo los huecos:
  // dos comps con las mismas clases en distinto orden solo se distinguen por aqui.
  const ranks = (comp.heroes || []).map((h) => (h && h.heroClass) || '');

  return { classes, classCounts, stacks, mechanics, campTerms, region, ranks, activeSkills, tags };
};

/** ¿Satisface la comp esta ranura de firma? Devuelve las clases que la consumen. */
const fillSlot = (slot, available) => {
  const taken = [];
  for (const heroClass of slot.any) {
    while (taken.length < slot.count && (available.get(heroClass) || 0) > 0) {
      available.set(heroClass, available.get(heroClass) - 1);
      taken.push(heroClass);
    }
    if (taken.length >= slot.count) break;
  }
  return taken.length >= slot.count ? taken : null;
};

const slotWeight = (family) =>
  family.sameClass || (family.requires || []).reduce((sum, s) => sum + s.count, 0);

/**
 * Elige la familia: la firma de mayor prioridad que encaje. `consumed` son las
 * clases que la firma ya explica, y que por tanto NO pueden ser la variante
 * (decir "Dark Ritual: Warlock" no aporta nada: el Occultist va implícito).
 */
export const matchFamily = (analysis) => {
  const ordered = [...FAMILIES].sort(
    (a, b) => b.priority - a.priority || slotWeight(b) - slotWeight(a)
  );
  const mechTags = new Set(analysis.mechanics.map((m) => m.tag));
  const campTags = new Set(analysis.campTerms.map((t) => t.tag));

  for (const family of ordered) {
    if (family.mechanics && !family.mechanics.every((t) => mechTags.has(t))) continue;
    if (family.campTerms && !family.campTerms.every((t) => campTags.has(t))) continue;

    if (family.sameClass) {
      const hit = analysis.stacks.find((s) => s.count >= family.sameClass);
      if (!hit) continue;
      // Una pila da nombre a su propia familia: Jester x4 -> "Ballad Quartet".
      const name = family.name.replace('{token}', heroToken(hit.heroClass));
      const consumed = Array(family.sameClass).fill(hit.heroClass);
      return { name, id: family.id, consumed, source: 'signature', noVariant: !!family.noVariant };
    }

    if (!family.requires) {
      // Firma solo por termino de campamento / mecanica.
      return { name: family.name, id: family.id, consumed: [], source: 'signature' };
    }

    const available = new Map(analysis.classCounts);
    const consumed = [];
    // Una ranura con alternativas ({any: ['Arbalest','Musketeer']}) deja una
    // decision tomada que la firma no cuenta: CUAL de las dos fue. Eso es un
    // hecho nombrable, asi que se guarda aparte para poder usarlo de variante.
    const picks = [];
    let ok = true;
    for (const slot of family.requires) {
      const taken = fillSlot(slot, available);
      if (!taken) { ok = false; break; }
      consumed.push(...taken);
      if (slot.any.length > 1) picks.push(...taken);
    }
    if (ok) return { name: family.name, id: family.id, consumed, picks, source: 'signature' };
  }

  // Sin firma: la familia sale de la mecánica dominante, y con un nombre que no
  // usa ninguna firma — así se ve de un vistazo que a esta comp le falta la suya.
  const dominant = analysis.mechanics[0];
  if (dominant && MECHANIC_FAMILIES[dominant.tag]) {
    return { name: MECHANIC_FAMILIES[dominant.tag], id: `mech:${dominant.tag}`, consumed: [], source: 'mechanic' };
  }
  return { name: FALLBACK_FAMILY, id: 'fallback', consumed: [], source: 'fallback' };
};

const fitsToken = (token) => !!token && token.length <= NAME_LIMITS.token;
const fitsVariant = (variant) => !!variant && variant.length <= NAME_LIMITS.variant;

/**
 * Todos los tokens que podrían describir esta comp, de más a menos informativo.
 * El orden solo desempata; quien decide es cuántas hermanas comparten el token.
 *
 * Ojo con `kind`: importa tanto como el token. Una variante `Guard` (mecánica) y
 * otra `Bulwark` (héroe) puestas al lado no se distinguen a simple vista, así que
 * la penalización por tipo mantiene a las mecánicas al final de la cola.
 */
export const variantCandidates = (analysis, family) => {
  const consumed = countBy(family.consumed || []);
  const out = [];
  const push = (token, kind, heroClass = '') => {
    if (fitsToken(token) && !out.some((c) => c.token === token)) out.push({ token, kind, heroClass });
  };

  // 1. Dobletes/tripletes: lo más llamativo de una comp es repetir clase. Cuenta
  //    mientras la familia no se haya comido TODAS las copias — en "Hound Pack"
  //    (2 Houndmasters de firma) un tercero sigue mereciendo "Trio Hound".
  analysis.stacks.forEach((stack) => {
    if (stack.count <= (consumed.get(stack.heroClass) || 0)) return;
    const label = stack.count >= 3 ? 'Trio' : 'Twin';
    push(`${label} ${heroToken(stack.heroClass)}`, 'stack', stack.heroClass);
  });

  // 2. Los héroes que la familia NO explica: el hueco flexible de la comp, en
  //    orden de rango (frente -> retaguardia), que es como se lee una party.
  //    Una clase ya consumida no vuelve aquí: si hay copias de sobra ya las ha
  //    nombrado la pila del punto 1, y repetir "Hound" en un "Hound Pack" no dice nada.
  const free = new Map(analysis.classCounts);
  const freeClasses = analysis.classes.filter((c) => {
    if (consumed.has(c) || (free.get(c) || 0) <= 0) return false;
    free.set(c, free.get(c) - 1);
    return true;
  });
  freeClasses.forEach((c) => push(heroToken(c), 'hero', c));

  // 3. La clase que ocupó una ranura con alternativas. "Marked Prey" acepta
  //    Arbalest o Musketeer: cuál de los dos fue no lo dice la familia, y es la
  //    única diferencia real entre dos comps por lo demás idénticas.
  (family.picks || []).forEach((c) => push(heroToken(c), 'pick', c));

  // 4. La banca de desempate. Nada de esto puede dar nombre por si solo en las
  //    dos primeras pasadas; existe para separar comps que el reparto ya no
  //    separa, y por eso tiene que ser ANCHA: cada palabra que falte aqui es una
  //    comp condenada a llamarse "... 2".
  analysis.campTerms.forEach((t) => push(t.label, 'camp'));
  push(analysis.region, 'region');

  // Rango: la unica diferencia entre dos comps con las mismas clases barajadas.
  analysis.ranks.forEach((heroClass, i) => {
    if (heroClass) push(`${heroToken(heroClass)} ${RANK_WORDS[i]}`, 'rank', heroClass);
  });

  analysis.mechanics.forEach((m) => push(m.label, 'mech'));

  // Skills: la banca mas ancha que hay. Se descartan las que ya significan otra
  // cosa en la taxonomia ("Lunge" es el Grave Robber, "Rampart" una mecanica de
  // aturdir): un token tiene que querer decir una sola cosa.
  const reserved = new Set([
    ...Object.values(HERO_TOKENS).map((h) => h.token),
    ...Object.values(HERO_TOKENS).flatMap((h) => h.aka || []),
    ...MECHANICS.map((m) => m.label),
    ...CAMP_TERMS.map((t) => t.label),
    ...Object.values(REGION_TOKENS),
    ...RANK_WORDS
  ]);
  [...new Set(analysis.activeSkills)].sort().forEach((skill) => {
    if (!reserved.has(skill)) push(skill, 'skill');
  });

  return out;
};

/**
 * La variante, leida SOLO de esta comp.
 *
 * Antes se elegia por contraste: "lo mas corto que la separa de sus hermanas
 * ACTUALES". Eso hace que meter una comp renombre a las viejas -- con 192 ya
 * se descuadraban siete-- y un renombrado rompe ficheros, enlaces y la memoria
 * de quien la usa. Peor: cuando el contraste no encontraba nada, la salida era
 * borrar una comp buena (`Marked_Prey__Snipe_Back`) por no saber nombrarla.
 *
 * Asi que la variante ya no mira a las hermanas. Sale de los propios heroes de
 * la comp, en el orden en que se leen, y por eso se puede calcular sin la
 * libreria delante y no cambia nunca:
 *
 *   1. La pila que la familia no se haya comido -- `Twin Money`, `Trio Hound`.
 *      Repetir clase es lo mas llamativo de una party y va primero.
 *   2. Los heroes que la familia NO explica, de frente a retaguardia, hasta dos.
 *      Es como se lee una party y es lo que de verdad la distingue.
 *   3. Cual ocupo una ranura con alternativas (`Marked Prey` acepta Arbalest o
 *      Musketeer): la familia no lo dice y es un hecho de la comp.
 *   4. Y si la familia lo explica todo, la region o la mecanica dominante,
 *      porque algo hay que decir.
 *
 * Lo que se pierde: dos comps pueden pedir la misma variante. Es inevitable --
 * si comparten clases solo las separan region y colocacion, y meter las dos en
 * el nombre lo vuelve ilegible. La unicidad se resuelve al escribir, cediendo
 * SIEMPRE la ultima en llegar (ver `assignCompNames`), que es lo que mantiene
 * quieto lo ya nombrado.
 */
export const compVariant = (analysis, family) => {
  // Una familia que ya se nombra sola no lleva variante: "Money Quartet" son
  // cuatro Antiquarians y no hay nada que anadir.
  if (family.noVariant) return '';
  const consumed = countBy(family.consumed || []);
  const parts = [];

  // 1. La pila, si queda alguna copia que la firma no haya gastado.
  const stack = analysis.stacks.find((st) => st.count > (consumed.get(st.heroClass) || 0));
  if (stack) parts.push(`${stack.count >= 3 ? 'Trio' : 'Twin'} ${heroToken(stack.heroClass)}`);

  // 2. Los heroes libres, en orden de rango. La clase apilada no vuelve: ya la
  //    ha nombrado el paso 1, y "Twin Hound & Hound" no distingue nada.
  const left = new Map(analysis.classCounts);
  (family.consumed || []).forEach((c) => left.set(c, (left.get(c) || 0) - 1));
  const seen = new Set(stack ? [stack.heroClass] : []);
  analysis.classes.forEach((heroClass) => {
    if (seen.has(heroClass) || (left.get(heroClass) || 0) <= 0) return;
    seen.add(heroClass);
    if (parts.length < NAME_LIMITS.maxParts) parts.push(heroToken(heroClass));
  });

  // 3. La eleccion que la firma dejo abierta.
  if (!parts.length) {
    (family.picks || []).forEach((heroClass) => {
      if (parts.length < NAME_LIMITS.maxParts) parts.push(heroToken(heroClass));
    });
  }

  // 4. La familia lo explica todo, asi que se habla de donde o de que hace.
  if (!parts.length) {
    const dominant = analysis.mechanics[0];
    const fallback = analysis.region || (dominant && dominant.label) || '';
    if (fallback) parts.push(fallback);
  }

  // El presupuesto manda: si la pareja no cabe, se queda el primero, que es
  // siempre el mas informativo de los dos.
  const full = parts.join(NAME_LIMITS.pairJoin);
  if (fitsVariant(full) || !parts.length) return full;
  return fitsVariant(parts[0]) ? parts[0] : '';
};

/**
 * El desempate cuando dos comps piden la misma variante. Todo lo que se ofrece
 * sale de la propia comp -- donde se juega, quien va en que rango, que hace --
 * asi que la que cede lo hace con un hecho suyo y no con un ordinal.
 *
 * Sustituye al segundo token en vez de anadirse: `Twin Money & Ruins`, no
 * `Twin Money & Sand & Ruins`. Tres cosas ya no se leen de un vistazo.
 */
/**
 * El sitio que ocupa un nombre. "Bulwark & Cross" y "Cross & Bulwark" dicen lo
 * mismo con los tokens al reves, asi que no pueden convivir: la segunda tiene
 * que buscarse un desempate de verdad.
 */
const nameSlot = (family, variant) =>
  `${family}|${variant.split(NAME_LIMITS.pairJoin).sort().join('|')}`;

const tieBreakers = (analysis) => {
  const out = [];
  if (analysis.region) out.push(analysis.region);
  analysis.ranks.forEach((heroClass, i) => {
    if (heroClass) out.push(`${heroToken(heroClass)} ${RANK_WORDS[i]}`);
  });
  analysis.campTerms.forEach((t) => out.push(t.label));
  analysis.mechanics.forEach((m) => out.push(m.label));
  return out.filter(fitsToken);
};
/**
 * Nombra un conjunto entero de comps a la vez. Hace falta el conjunto porque la
 * variante se elige por contraste: el mejor token es el que ninguna hermana usa.
 *
 * @param {Array} comps  objetos {teamName, location, heroes, taxonomy?}
 * @returns {Array} un registro por comp con nombre propuesto, familia, variante y tags
 */
export const assignCompNames = (comps) => {
  const records = comps.map((comp, index) => {
    const analysis = analyzeComp(comp);
    const parsed = parseCompName(comp.teamName || '');
    const exempt = isExempt(comp);
    const family = exempt
      ? { name: comp.teamName || FALLBACK_FAMILY, id: 'exempt', consumed: [], source: 'exempt' }
      : matchFamily(analysis);
    return {
      index,
      comp,
      exempt,
      originalName: comp.teamName || '',
      analysis,
      family,
      parsed,
      candidates: exempt ? [] : variantCandidates(analysis, family),
      variant: exempt ? '' : compVariant(analysis, family),
      name: '',
      tags: analysis.tags
    };
  });

  // Quien ya luce su nombre se lo queda, y se lo queda ANTES de que nadie mas
  // reparta. Es lo unico que hace falta para que meter una comp no renombre a
  // las viejas: la nueva encuentra el sitio ocupado y cede ella.
  const taken = new Set();
  const settled = new Set();
  records.forEach((rec) => {
    if (rec.exempt) {
      taken.add(rec.originalName);
      settled.add(rec.index);
      return;
    }
    // No basta con reclamar el nombre intrinseco: una comp que luce un
    // desempate (`Twin Money & Sand`) tiene tanto derecho a el, y si no lo
    // reclama aqui, la siguiente comp que entre puede quitarselo. Vale
    // cualquier nombre que ELLA MISMA podria haberse puesto.
    if (rec.parsed.family !== rec.family.name) return;
    const head = rec.variant.split(NAME_LIMITS.pairJoin)[0];
    const hers = new Set([rec.variant, ...tieBreakers(rec.analysis).flatMap((extra) => [
      extra,
      head && extra !== head ? `${head}${NAME_LIMITS.pairJoin}${extra}` : extra
    ])]);
    if (!hers.has(rec.parsed.variant)) return;
    if (taken.has(nameSlot(rec.family.name, rec.parsed.variant))) return;
    rec.variant = rec.parsed.variant;
    taken.add(nameSlot(rec.family.name, rec.variant));
    settled.add(rec.index);
  });

  records.forEach((rec) => {
    if (settled.has(rec.index)) return;
    const base = formatCompName(rec.family.name, rec.variant);
    if (!taken.has(nameSlot(rec.family.name, rec.variant))) {
      taken.add(nameSlot(rec.family.name, rec.variant));
      return;
    }
    const head = rec.variant.split(NAME_LIMITS.pairJoin)[0];
    const swap = tieBreakers(rec.analysis)
      .map((extra) => (head && extra !== head ? `${head}${NAME_LIMITS.pairJoin}${extra}` : extra))
      .find((variant) => fitsVariant(variant) && !taken.has(nameSlot(rec.family.name, variant)));
    if (swap) {
      rec.variant = swap;
      taken.add(nameSlot(rec.family.name, swap));
      return;
    }
    // Nada suyo la separa porque no hay nada distinto: es la misma comp dos
    // veces. El ordinal es el diagnostico, y el informe la saca como DUPLICADA.
    let n = 2;
    while (taken.has(nameSlot(rec.family.name, `${rec.variant} ${n}`.trim()))) n += 1;
    rec.variant = `${rec.variant} ${n}`.trim();
    taken.add(nameSlot(rec.family.name, rec.variant));
  });

  records.forEach((rec) => {
    if (rec.exempt) {
      // Fuera de la taxonomía: el nombre es el que trae, y no cambia nunca.
      rec.name = rec.originalName;
      rec.alias = rec.comp.alias || '';
      rec.changed = false;
      return;
    }
    rec.name = formatCompName(rec.family.name, rec.variant);
    // El nombre de autor ("Za Warudo", "Clown Fiesta") no se tira: pasa a alias.
    // Un alias ya guardado manda siempre — si no, al volver a nombrar una comp
    // ya taxonomica se perderia el nombre original para siempre.
    const inherited = rec.comp.alias || '';
    rec.alias = inherited || (rec.parsed.taxonomic ? '' : rec.originalName);
    if (rec.alias === rec.name) rec.alias = '';
    rec.changed = rec.name !== rec.originalName;
  });

  return records;
};
/**
 * Nombra UNA comp contra una librería ya nombrada. Es lo que usa el guardado
 * "preset comp" de la app: la comp nueva entra en su familia y compite por la
 * variante con las que ya están, pero sin renombrar a ninguna.
 *
 * De ahí el desempate final: el motor reparte variantes suponiendo que puede
 * mover a todas: aquí no puede, así que si le toca un nombre que otra ya luce en
 * su fichero, quien cede es la nueva.
 */
export const nameCompAgainst = (comp, library = []) => {
  const others = library.filter((c) => c !== comp);
  const record = assignCompNames([...others, comp]).pop();
  const used = new Set(others.map((c) => c.teamName).filter(Boolean));
  if (!used.has(record.name)) return record;

  let n = 2;
  while (used.has(`${record.name} ${n}`)) n += 1;
  return { ...record, variant: `${record.variant} ${n}`.trim(), name: `${record.name} ${n}` };
};

/**
 * "Dark Ritual: Cross & Volley" -> "Dark_Ritual__Cross_Volley.json".
 *
 * Windows no admite ":" en un nombre de fichero, y el doble guion bajo es lo que
 * deja leer la familia y la variante por separado en el listado del directorio.
 * El "&" tambien se cae: es legal en Windows pero es un metacaracter de shell, y
 * un `for %%f in (*.json)` o un `cat $f` sin comillas se lo come. El nombre
 * completo, ampersand incluido, sigue estando dentro del fichero en `teamName`.
 *
 * Lo comparten la app y scripts/nameComps.js: los dos escriben en presetComps.
 */
export const toCompFileName = (name) =>
  `${String(name || '')
    .replace(/:\s*/g, '__')
    .replace(/\s*&\s*/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[<>"/\\|?*]/g, '')
    .replace(/_{3,}/g, '__')
    .replace(/_+$/, '')}.json`;

/** Longitud del nombre más largo generado — el control de que la regla se cumple. */
export const longestName = (records) =>
  records.reduce((max, r) => Math.max(max, r.name.length), 0);
