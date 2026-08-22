// Motor de la taxonomía de comps.
//
// EL PROBLEMA: una taxonomía completa ("Occultist + Plague Doctor + Houndmaster,
// blight, stun, Ruins, v2") describe la comp perfectamente y no cabe en un nombre.
//
// LA REGLA: el nombre son DOS ranuras y punto — "Familia: Variante".
//   · Familia  = el motor de la comp (una pareja, un trío o un término clave).
//   · Variante = el ÚNICO token que la distingue de sus hermanas de familia.
// El resto de la taxonomía no se pierde: sale en `tags`, para filtrar y buscar.
//
// La variante no se elige por una prioridad fija sino por poder discriminante:
// dentro de una familia se escoge el token que MENOS hermanas comparten. Por eso
// los nombres salen a la vez cortos y únicos, que es lo que rompe una taxonomía
// escrita entera.

import {
  NAME_LIMITS,
  HERO_TOKENS,
  MECHANICS,
  CAMP_TERMS,
  FAMILIES,
  MECHANIC_FAMILIES,
  FALLBACK_FAMILY,
  REGION_TOKENS,
  VARIANT_KIND_PENALTY
} from '../data/compTaxonomy';

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

const heroToken = (heroClass) => (HERO_TOKENS[heroClass] || {}).token || heroClass;
const heroAlts = (heroClass) => (HERO_TOKENS[heroClass] || {}).alts || [];

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

  return { classes, classCounts, stacks, mechanics, campTerms, region, tags };
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
    let ok = true;
    for (const slot of family.requires || []) {
      const taken = fillSlot(slot, available);
      if (!taken) { ok = false; break; }
      consumed.push(...taken);
    }
    if (ok) return { name: family.name, id: family.id, consumed, source: 'signature' };
  }

  // Sin firma: la familia sale de la mecánica dominante. Estas comps son las
  // candidatas a merecer una firma propia en FAMILIES.
  const dominant = analysis.mechanics[0];
  if (dominant && MECHANIC_FAMILIES[dominant.tag]) {
    return { name: MECHANIC_FAMILIES[dominant.tag], id: `mech:${dominant.tag}`, consumed: [], source: 'mechanic' };
  }
  return { name: FALLBACK_FAMILY, id: 'fallback', consumed: [], source: 'fallback' };
};

const slotWeight = (family) =>
  family.sameClass || (family.requires || []).reduce((sum, s) => sum + s.count, 0);

const fits = (token) => token && token.length <= NAME_LIMITS.variant;

/**
 * Todos los tokens que podrían ser la variante de esta comp, de más a menos
 * informativo. El orden solo desempata: quien decide es la frecuencia dentro
 * de la familia (ver assignCompNames).
 */
export const variantCandidates = (analysis, family) => {
  const consumed = countBy(family.consumed || []);
  const out = [];
  const push = (token, kind, heroClass = '') => {
    if (fits(token) && !out.some((c) => c.token === token)) out.push({ token, kind, heroClass });
  };

  // 1. Dobletes/tripletes: lo más llamativo de una comp es repetir clase.
  //    Solo cuenta si la familia no la ha consumido ya (en "Ballad Quartet" el
  //    x4 es la familia entera, no aporta como variante).
  analysis.stacks.forEach((stack) => {
    if (consumed.has(stack.heroClass)) return;
    const label = stack.count >= 3 ? 'Trio' : 'Twin';
    push(`${label} ${heroToken(stack.heroClass)}`, 'stack', stack.heroClass);
  });

  // 2. Los héroes que la familia NO explica: el hueco flexible de la comp.
  const free = new Map(analysis.classCounts);
  (family.consumed || []).forEach((c) => free.set(c, (free.get(c) || 0) - 1));
  const freeClasses = [...free.entries()].filter(([, n]) => n > 0).map(([c]) => c);
  freeClasses.forEach((c) => push(heroToken(c), 'hero', c));

  // 3. Términos de campamento y mecánicas que la familia no da por supuestas.
  analysis.campTerms.forEach((t) => push(t.label, 'camp'));
  analysis.mechanics.forEach((m) => push(m.label, 'mech'));

  // 4. Último recurso: región, y apodos alternativos de cualquier héroe.
  push(analysis.region, 'region');
  freeClasses.forEach((c) => heroAlts(c).forEach((alt) => push(alt, 'alt', c)));
  (family.consumed || []).forEach((c) => heroAlts(c).forEach((alt) => push(alt, 'alt', c)));

  return out;
};

/**
 * Nombra un conjunto entero de comps a la vez. Hace falta el conjunto porque la
 * variante se elige por contraste: el mejor token es el que menos hermanas
 * comparten.
 *
 * @param {Array} comps  objetos {teamName, location, heroes}
 * @param {Object} [options]
 * @param {boolean} [options.preferExisting=true]  respeta la variante actual si sigue siendo única
 * @returns {Array} un registro por comp con nombre propuesto, familia, variante y tags
 */
export const assignCompNames = (comps, options = {}) => {
  const { preferExisting = true } = options;

  // Cuantas comps usan cada clase. Un Jester (19 comps) distingue mas que un
  // Crusader (50), asi que a igualdad de todo lo demas gana el raro.
  const corpusUse = new Map();
  comps.forEach((comp) => {
    new Set((comp.heroes || []).map((h) => h && h.heroClass).filter(Boolean)).forEach((c) =>
      corpusUse.set(c, (corpusUse.get(c) || 0) + 1)
    );
  });
  const rarity = (heroClass) => (heroClass ? (corpusUse.get(heroClass) || 0) / (comps.length + 1) : 0.5);

  const records = comps.map((comp, index) => {
    const analysis = analyzeComp(comp);
    const family = matchFamily(analysis);
    const parsed = parseCompName(comp.teamName || '');
    return {
      index,
      comp,
      originalName: comp.teamName || '',
      analysis,
      family,
      parsed,
      candidates: variantCandidates(analysis, family),
      variant: '',
      name: '',
      tags: analysis.tags
    };
  });

  const groups = new Map();
  records.forEach((rec) => {
    if (!groups.has(rec.family.name)) groups.set(rec.family.name, []);
    groups.get(rec.family.name).push(rec);
  });

  groups.forEach((group) => {
    // Frecuencia de cada token dentro de la familia: cuanto más raro, más discrimina.
    const freq = new Map();
    group.forEach((rec) =>
      rec.candidates.forEach((c) => freq.set(c.token, (freq.get(c.token) || 0) + 1))
    );

    const taken = new Set();
    const ordered = [...group].sort((a, b) => a.originalName.localeCompare(b.originalName));

    // Pasada 1 — estabilidad: si la variante que ya tenías sigue valiendo y nadie
    // más la reclama, se queda. Renombrar por renombrar solo genera ruido.
    if (preferExisting) {
      const claims = countBy(
        ordered.map((r) => r.parsed.variant).filter(Boolean)
      );
      ordered.forEach((rec) => {
        const current = rec.parsed.variant;
        if (!current || claims.get(current) !== 1 || !fits(current)) return;
        if (!rec.candidates.some((c) => c.token === current)) return;
        rec.variant = current;
        taken.add(current);
      });
    }

    // Pasada 2 — el token menos compartido de la familia.
    // Coste = cuantas hermanas comparten el token (lo que manda)
    //       + penalizacion por tipo de token
    //       + rareza global, que solo desempata (siempre < 1).
    const cost = (c) => (freq.get(c.token) || 0) + (VARIANT_KIND_PENALTY[c.kind] || 0) + rarity(c.heroClass);
    ordered.forEach((rec) => {
      if (rec.variant) return;
      if (rec.family.noVariant && group.length === 1) return;
      const best = rec.candidates.filter((c) => !taken.has(c.token)).sort((a, b) => cost(a) - cost(b))[0];
      if (best) {
        rec.variant = best.token;
        taken.add(best.token);
      }
    });

    // Pasada 3 — agotados los tokens sueltos, se combinan dos; y si aún colisiona,
    // un ordinal. Solo llega aquí una familia con demasiadas hermanas gemelas.
    ordered.forEach((rec, i) => {
      if (rec.variant || (rec.family.noVariant && group.length === 1)) return;
      const pair = rec.candidates.slice(0, 2).map((c) => c.token);
      const combo = pair.length === 2 ? `${pair[0]} & ${pair[1]}` : pair[0];
      let candidate = combo && combo.length <= NAME_LIMITS.variant ? combo : '';
      if (!candidate || taken.has(candidate)) {
        candidate = `${rec.candidates[0] ? rec.candidates[0].token : 'Alt'} ${i + 1}`;
      }
      rec.variant = candidate;
      taken.add(candidate);
    });
  });

  records.forEach((rec) => {
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

/** Longitud del nombre más largo generado — el control de que la regla se cumple. */
export const longestName = (records) =>
  records.reduce((max, r) => Math.max(max, r.name.length), 0);
