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

/** Clave canónica de una variante: "A & B" y "B & A" son la MISMA descripción. */
const variantKey = (variant) => variant.split(NAME_LIMITS.pairJoin).sort().join('|');

/**
 * Todas las parejas de tokens de REPARTO que describen la comp, de la que más
 * discrimina a la que menos. La primera es el nombre natural; las siguientes son
 * el recambio cuando esa ya se la ha quedado una hermana.
 *
 * Solo reparto: "Berserk & Cove" o "Royal & Tangle" pegan una etiqueta que no se
 * puede comparar con la de al lado. Y nunca dos tokens de la misma clase, que
 * "Twin Hound & Hound" no distingue nada. Dentro de la pareja el orden es el de
 * rango (frente -> retaguardia), que es como se lee una party.
 */
const rosterPairs = (candidates, shared) => {
  const roster = [];
  candidates.forEach((c) => {
    if (!isRoster(c)) return;
    if (c.heroClass && roster.some((p) => p.heroClass === c.heroClass)) return;
    roster.push(c);
  });

  const pairs = [];
  for (let i = 0; i < roster.length; i += 1) {
    for (let j = i + 1; j < roster.length; j += 1) {
      const [a, b] = [roster[i], roster[j]];
      const token = `${a.token}${NAME_LIMITS.pairJoin}${b.token}`;
      if (fitsVariant(token)) {
        pairs.push({ token, tokens: [a.token, b.token], weight: (shared.get(a.token) || 0) + (shared.get(b.token) || 0) });
      }
    }
  }
  return pairs.sort((a, b) => a.weight - b.weight);
};

/**
 * Reparte variantes dentro de UNA familia. Aquí está la regla del conjunto
 * mínimo distintivo, en tres pasadas de menos a más nombre.
 *
 * @param {Array} group     registros de la misma familia
 * @param {Function} rarity clase -> [0,1], cuánto se repite en la librería entera
 */
const assignVariantsInFamily = (group, rarity) => {
  // Cuántas comps de la familia ofrecen cada token. 1 = identifica sin ambigüedad.
  const shared = new Map();
  group.forEach((rec) =>
    rec.candidates.forEach((c) => shared.set(c.token, (shared.get(c.token) || 0) + 1))
  );

  // Coste: primero el tipo de token, y la rareza global solo desempata (< 1).
  const cost = (c) => (VARIANT_KIND_PENALTY[c.kind] || 0) + rarity(c.heroClass);
  // Orden estable, derivado del CONTENIDO y nunca del nombre actual. Si dependiera
  // del nombre, renombrar cambiaria el orden, el orden cambiaria el reparto y el
  // siguiente pase volveria a renombrar: la taxonomia no llegaria a un punto fijo.
  const stableKey = (rec) => `${rec.analysis.ranks.join('|')}#${rec.analysis.activeSkills.join(',')}`;
  const ordered = [...group].sort((a, b) => stableKey(a).localeCompare(stableKey(b)));
  const skip = (rec) => rec.family.noVariant && group.length === 1;

  // Las variantes ya dadas, por clave canónica: "Cross & Bulwark" y
  // "Bulwark & Cross" describen lo mismo y no pueden convivir en una familia.
  // `holder` guarda QUIEN se quedo cada descripcion, en cualquiera de las pasadas:
  // la pasada 3 lo necesita para saber que tokens NO tiene su gemela y elegir un
  // desempate que de verdad las separe.
  const holder = new Map();
  const claim = (rec, variant) => {
    rec.variant = variant;
    holder.set(variantKey(variant), rec);
  };
  const free = (variant) => !holder.has(variantKey(variant));

  // Pasada 1 — token de reparto EXCLUSIVO. Nadie más en la familia lo ofrece, así
  // que el reparto no depende del orden y nunca hace falta arbitrar. Si la variante
  // que ya tenías sigue siendo exclusiva se queda: renombrar por renombrar es ruido.
  ordered.forEach((rec) => {
    if (skip(rec)) return;
    const exclusive = rec.candidates.filter((c) => isRoster(c) && shared.get(c.token) === 1);
    if (!exclusive.length) return;
    const keep = exclusive.find((c) => c.token === rec.parsed.variant);
    claim(rec, (keep || exclusive.slice().sort((a, b) => cost(a) - cost(b))[0]).token);
  });

  // Pasada 2 — pareja. Ningún token vale por sí solo, así que se nombran dos.
  // Deliberadamente NO se reparte el token compartido al primero que llegue:
  // "Marked Prey: Royal" junto a otras dos comps con Leper no dice cuál es cuál.
  const claimPair = (keepOnly) =>
    ordered.forEach((rec) => {
      if (rec.variant || skip(rec)) return;
      const pair = rosterPairs(rec.candidates, shared)[0];
      if (!pair || !free(pair.token)) return;
      if (keepOnly && rec.parsed.variant !== pair.token) return;
      claim(rec, pair.token);
    });
  claimPair(true); // primero quien ya la lucia: renombrar por renombrar es ruido
  claimPair(false);

  // Pasada 3 — el reparto ya no las separa: son gemelas de plantilla. Aqui entra
  // la banca ancha (campamento, region, rango, mecanica, skill), y la regla es
  // una: la primera se queda el nombre limpio y las demas cogen la descripcion
  // MAS BARATA que diga algo que NINGUNA de sus gemelas puede decir. Un token que
  // media camada comparte no distingue, solo lo aparenta.
  const unassigned = ordered.filter((rec) => !rec.variant && !skip(rec));
  const baseOf = (rec) => {
    const pairs = rosterPairs(rec.candidates, shared);
    return pairs.length ? pairs[0].token : (rec.candidates[0] || {}).token || 'Alt';
  };

  const pendingByBase = new Map();
  unassigned.forEach((rec) => {
    const key = variantKey(baseOf(rec));
    pendingByBase.set(key, [...(pendingByBase.get(key) || []), rec]);
  });

  pendingByBase.forEach((pending, key) => {
    // La hermana que ya se quedo ese nombre en la pasada 2 TAMBIEN es de la
    // camada: es justo contra la que hay que distinguirse. Sin ella la camada es
    // de uno, ningun token "separa" de nadie y todo acaba en ordinal.
    const litter = [...(holder.has(key) ? [holder.get(key)] : []), ...pending];

    // Cuantas de la camada ofrecen cada token: menos que toda la camada = separa.
    const inLitter = new Map();
    litter.forEach((rec) =>
      rec.candidates.forEach((c) => inLitter.set(c.token, (inLitter.get(c.token) || 0) + 1))
    );

    pending.forEach((rec) => {
      const base = baseOf(rec);
      const separates = (tokens) => tokens.some((t) => inLitter.get(t) < litter.length);
      const optionCost = (parts, lone) =>
        parts.reduce(
          (sum, c) =>
            // Compartir el REPARTO es lo normal — es lo que las hace hermanas.
            // Compartir el DESEMPATE es el problema, y por eso solo penaliza ahi.
            sum + cost(c) + (isRoster(c) ? 0 : 20 * ((inLitter.get(c.token) || 1) - 1)),
          lone
        );

      const options = [];
      rec.candidates.forEach((a, i) => {
        // Un desempate suelto vale ("Curious Coin: Farmstead"), pero pega mas al
        // lado del reparto que comparte con sus gemelas. Un token de rango se
        // libra del recargo: "Beast Second" ya dice quien y donde va.
        if (!isRoster(a)) options.push({ parts: [a], lone: a.kind === 'rank' ? 0 : VARIANT_KIND_PENALTY.lone });
        rec.candidates.slice(i + 1).forEach((b) => {
          if (a.heroClass && a.heroClass === b.heroClass) return;
          if (isRoster(a) && isRoster(b)) return; // eso ya lo intento rosterPairs
          options.push({ parts: [a, b], lone: 0 });
        });
      });

      const best = options
        .map((o) => ({
          token: o.parts.map((c) => c.token).join(NAME_LIMITS.pairJoin),
          tokens: o.parts.map((c) => c.token),
          cost: optionCost(o.parts, o.lone)
        }))
        .filter((o) => separates(o.tokens) && fitsVariant(o.token) && free(o.token))
        .sort((a, b) => a.cost - b.cost || a.token.localeCompare(b.token))[0];

      // Recambio de reparto antes que desempate: si otra pareja de heroes las
      // separa, sigue siendo el nombre que mejor se lee.
      const pairs = rosterPairs(rec.candidates, shared);
      const alternative = pairs.slice(1).find((p) => separates(p.tokens) && free(p.token));

      // Estabilidad: la variante que ya tenias gana a cualquier recambio, mientras
      // siga estando libre y siga separandola de sus gemelas. Sin esto el reparto
      // de la camada depende de quien llegue primero, y quien llega primero cambia
      // en cuanto se aplica un renombrado.
      const current = rec.parsed.variant;
      const stillValid =
        (current === base && free(base)) ||
        (pairs.some((p) => p.token === current) && separates(current.split(NAME_LIMITS.pairJoin)) && free(current)) ||
        (best && options.some((o) => o.parts.map((c) => c.token).join(NAME_LIMITS.pairJoin) === current) &&
          separates(current.split(NAME_LIMITS.pairJoin)) && free(current));
      if (current && stillValid) {
        claim(rec, current);
        return;
      }

      if (free(base)) {
        claim(rec, base);
        return;
      }
      if (alternative && (!best || alternative.weight <= best.cost)) {
        claim(rec, alternative.token);
        return;
      }
      if (best) {
        claim(rec, best.token);
        return;
      }

      // Nada las separa porque no hay NADA distinto: es la misma comp dos veces.
      // El ordinal es el diagnostico, y el informe la saca como DUPLICADA.
      let n = 2;
      while (!free(`${base} ${n}`)) n += 1;
      claim(rec, `${base} ${n}`);
    });
  });
};

/**
 * Nombra un conjunto entero de comps a la vez. Hace falta el conjunto porque la
 * variante se elige por contraste: el mejor token es el que ninguna hermana usa.
 *
 * @param {Array} comps  objetos {teamName, location, heroes, taxonomy?}
 * @returns {Array} un registro por comp con nombre propuesto, familia, variante y tags
 */
export const assignCompNames = (comps) => {
  // Cuantas comps usan cada clase. Un Jester (23 comps) distingue mas que un
  // Crusader (54), asi que a igualdad de todo lo demas gana el raro.
  const corpusUse = new Map();
  comps.forEach((comp) => {
    new Set((comp.heroes || []).map((h) => h && h.heroClass).filter(Boolean)).forEach((c) =>
      corpusUse.set(c, (corpusUse.get(c) || 0) + 1)
    );
  });
  const rarity = (heroClass) => (heroClass ? (corpusUse.get(heroClass) || 0) / (comps.length + 1) : 0.5);

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
      variant: '',
      name: '',
      tags: analysis.tags
    };
  });

  const groups = new Map();
  records.forEach((rec) => {
    if (rec.exempt) return;
    if (!groups.has(rec.family.name)) groups.set(rec.family.name, []);
    groups.get(rec.family.name).push(rec);
  });
  groups.forEach((group) => assignVariantsInFamily(group, rarity));

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
