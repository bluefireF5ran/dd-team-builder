import {
  stripLegacyMarker,
  parseCompName,
  formatCompName,
  analyzeComp,
  matchFamily,
  assignCompNames,
  nameCompAgainst,
  toCompFileName,
  longestName
} from '../compNaming';
import {
  NAME_LIMITS,
  HERO_TOKENS,
  MECHANICS,
  CAMP_TERMS,
  REGION_TOKENS,
  RANK_WORDS,
  FAMILIES,
  MECHANIC_FAMILIES
} from '../../data/compTaxonomy';
import { PRESET_COMP_ENTRIES } from '../../data/presetComps/index';
import { LOCATIONS } from '../../data/locations';

const hero = (heroClass, activeSkills = [], activeCampSkills = []) => ({
  heroClass,
  activeSkills,
  activeCampSkills,
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] }
});

const comp = (teamName, heroes, location = 'The Ruins') => ({ teamName, location, heroes });

describe('name parsing', () => {
  it('strips a legacy variant marker off the name', () => {
    expect(stripLegacyMarker('Blight, Bite & Bleed V2.1')).toEqual({ base: 'Blight, Bite & Bleed', marker: 'V2.1' });
    expect(stripLegacyMarker('Marked Prey: Blight ALT')).toEqual({ base: 'Marked Prey: Blight', marker: 'ALT' });
    expect(stripLegacyMarker('Za Warudo')).toEqual({ base: 'Za Warudo', marker: '' });
  });

  it('does not mistake a variant token for a marker', () => {
    // "Encore" y "BIS" son apodos del Jester, no marcas de variante.
    expect(stripLegacyMarker('Dark Ritual: Encore').marker).toBe('');
  });

  it('separates family from variant, and flags free-form names', () => {
    expect(parseCompName('Hound Pack: Warlock')).toMatchObject({
      family: 'Hound Pack',
      variant: 'Warlock',
      taxonomic: true
    });
    expect(parseCompName('Clown Fiesta')).toMatchObject({ variant: '', taxonomic: false });
  });

  it('round-trips through formatCompName without the marker', () => {
    const parsed = parseCompName('Marked Prey: Blight ALT');
    expect(formatCompName(parsed.family, parsed.variant)).toBe('Marked Prey: Blight');
  });
});

describe('comp analysis', () => {
  it('counts repeated classes as stacks', () => {
    const analysis = analyzeComp(comp('x', [hero('Houndmaster'), hero('Houndmaster'), hero('Vestal'), hero('Leper')]));
    expect(analysis.stacks).toEqual([{ heroClass: 'Houndmaster', count: 2 }]);
    expect(analysis.tags).toContain('stack:houndx2');
  });

  it('derives mechanics from the active skills', () => {
    const analysis = analyzeComp(
      comp('x', [
        hero('Houndmaster', ['Target Whistle', "Hound's Rush"]),
        hero('Arbalest', ['Sniper Shot', "Sniper's Mark"]),
        hero('Occultist', ['Vulnerability Hex']),
        hero('Crusader', ['Smite'])
      ])
    );
    expect(analysis.mechanics.map((m) => m.tag)).toContain('mark');
    expect(analysis.mechanics[0].tag).toBe('mark');
  });

  it('needs two hits before tagging a low-weight mechanic', () => {
    const one = analyzeComp(comp('x', [hero('Crusader', ['Battle Heal'])]));
    const two = analyzeComp(comp('x', [hero('Crusader', ['Battle Heal']), hero('Vestal', ['Divine Grace'])]));
    expect(one.mechanics.map((m) => m.tag)).not.toContain('heal');
    expect(two.mechanics.map((m) => m.tag)).toContain('heal');
  });

  it('picks up camp-skill terms', () => {
    const analysis = analyzeComp(comp('x', [hero('Occultist', [], ['Encourage', 'Dark Ritual'])]));
    expect(analysis.campTerms.map((t) => t.tag)).toContain('ritual');
  });
});

describe('family matching', () => {
  it('prefers the more specific signature', () => {
    // Occultist + Plague Doctor solos son Dark Ritual; con Houndmaster, Virulent Alchemy.
    const pair = matchFamily(analyzeComp(comp('x', [hero('Occultist'), hero('Plague Doctor'), hero('Leper'), hero('Crusader')])));
    const trio = matchFamily(analyzeComp(comp('x', [hero('Occultist'), hero('Plague Doctor'), hero('Houndmaster'), hero('Crusader')])));
    expect(pair.name).toBe('Dark Ritual');
    expect(trio.name).toBe('Virulent Alchemy');
  });

  it('names a four-stack after the stacked class', () => {
    const family = matchFamily(analyzeComp(comp('x', [hero('Jester'), hero('Jester'), hero('Jester'), hero('Jester')])));
    expect(family.name).toBe('Ballad Quartet');
    expect(family.noVariant).toBe(true);
  });

  it('honours a signature that also demands a mechanic', () => {
    const withRiposte = matchFamily(
      analyzeComp(
        comp('x', [hero('Highwayman', ["Duelist's Advance"]), hero('Man at Arms', ['Retribution']), hero('Leper', ['Chop'])])
      )
    );
    expect(withRiposte).toMatchObject({ name: 'Waiting Blade', source: 'signature' });
  });

  it('falls back to the dominant mechanic when no signature fits', () => {
    const family = matchFamily(
      analyzeComp(
        comp('x', [
          hero('Hellion', ['Wicked Hack', 'If It Bleeds']),
          hero('Grave Robber', ['Lunge']),
          hero('Jester', ['Slice Off'])
        ])
      )
    );
    expect(family.source).toBe('mechanic');
    expect(family.name).toBe('Red Harvest');
  });

  it('marks a comp it cannot read at all as a fallback', () => {
    const family = matchFamily(analyzeComp(comp('x', [hero('Leper'), hero('Highwayman')])));
    expect(family.source).toBe('fallback');
  });
});

describe('assignCompNames', () => {
  // Dark Ritual consume Occultist + Plague Doctor, asi que `extra` es el unico
  // hueco libre y la variante queda determinada sin empates que deshacer.
  const family = (extra) => [
    hero('Occultist', ['Vulnerability Hex']),
    hero('Plague Doctor', ['Noxious Blast', 'Blinding Gas']),
    extra
  ];

  it('gives siblings of one family distinct variants', () => {
    const records = assignCompNames([
      comp('a', family(hero('Jester'))),
      comp('b', family(hero('Leper'))),
      comp('c', family(hero('Hellion')))
    ]);
    const variants = records.map((r) => r.variant);
    expect(new Set(variants).size).toBe(3);
    records.forEach((r) => expect(r.family.name).toBe('Dark Ritual'));
  });

  it('never puts a class the family already implies in the variant slot', () => {
    const [record] = assignCompNames([comp('a', family(hero('Jester')))]);
    expect(record.variant).toBe('Ballad');
  });

  it('leaves no legacy marker anywhere in the bundled library', () => {
    const records = assignCompNames(PRESET_COMP_ENTRIES.map(({ data }) => data));
    records.forEach((r) => expect(stripLegacyMarker(r.name).marker).toBe(''));
  });

  it('keeps a variant you already chose when it still reads uniquely', () => {
    const records = assignCompNames([
      comp('Dark Ritual: Ballad', family(hero('Jester'))),
      comp('Dark Ritual: Royal', family(hero('Leper')))
    ]);
    expect(records.map((r) => r.name)).toEqual(['Dark Ritual: Ballad', 'Dark Ritual: Royal']);
    expect(records.every((r) => r.changed)).toBe(false);
  });

  it('never loses an alias that was already saved', () => {
    // Al renombrar por segunda vez la comp ya es taxonomica: sin esto, el
    // nombre de autor guardado en la primera pasada se perderia.
    const saved = { ...comp('Money Quartet', family(hero('Jester'))), alias: 'Antiques Roadshow' };
    const [record] = assignCompNames([saved]);
    expect(record.alias).toBe('Antiques Roadshow');
  });

  it('does not store an alias that just repeats the new name', () => {
    const [record] = assignCompNames([comp('Dark Ritual: Ballad', family(hero('Jester')))]);
    expect(record.alias).toBe('');
  });

  it('keeps a free-form name as an alias instead of throwing it away', () => {
    const [record] = assignCompNames([comp('Za Warudo', family(hero('Jester')))]);
    expect(record.alias).toBe('Za Warudo');
    expect(record.name).toBe('Dark Ritual: Ballad');
  });

  it('drops a legacy V-marker instead of carrying it into the new name', () => {
    const [record] = assignCompNames([comp('Whatever V2.0', family(hero('Jester')))]);
    expect(record.name).toBe('Dark Ritual: Ballad');
  });

  it('gives two marker-siblings real tokens instead of numbering them', () => {
    const records = assignCompNames([
      comp('Thing', family(hero('Jester'))),
      comp('Thing V2.0', family(hero('Leper')))
    ]);
    expect(records.map((r) => r.name)).toEqual(['Dark Ritual: Ballad', 'Dark Ritual: Royal']);
  });
});

describe('the whole bundled library', () => {
  const comps = PRESET_COMP_ENTRIES.map(({ data }) => data);
  const records = assignCompNames(comps);

  it('gives every comp a name', () => {
    expect(records).toHaveLength(comps.length);
    records.forEach((r) => expect(r.name.length).toBeGreaterThan(0));
  });

  it('produces no duplicate names', () => {
    const seen = new Map();
    records.forEach((r) => seen.set(r.name, (seen.get(r.name) || 0) + 1));
    expect([...seen.entries()].filter(([, n]) => n > 1)).toEqual([]);
  });

  it('respects the two-slot budget', () => {
    // Esto es lo que evita que la taxonomia se desborde al nombre.
    const budget = NAME_LIMITS.family + NAME_LIMITS.separator.length + NAME_LIMITS.variant;
    records.forEach((r) => {
      expect(r.name.length).toBeLessThanOrEqual(budget);
      expect(r.name.split(':').length).toBeLessThanOrEqual(2);
    });
    expect(longestName(records)).toBeLessThanOrEqual(budget);
  });

  it('is deterministic', () => {
    expect(assignCompNames(comps).map((r) => r.name)).toEqual(records.map((r) => r.name));
  });
});

describe('comps outside the taxonomy', () => {
  // The Old Road es el tutorial del juego, no una comp de la comunidad: la
  // taxonomia la renombraba a "Ragged Band: Heist" y la volvia irreconocible.
  const oldRoad = { ...comp('The Old Road', [hero('Crusader'), hero('Highwayman')]), taxonomy: false };

  it('keeps the name of a comp marked taxonomy:false', () => {
    const [record] = assignCompNames([oldRoad]);
    expect(record.name).toBe('The Old Road');
    expect(record.changed).toBe(false);
    expect(record.exempt).toBe(true);
  });

  it('does not let it compete for a variant with the rest', () => {
    const records = assignCompNames([oldRoad, comp('a', [hero('Crusader'), hero('Highwayman')])]);
    expect(records[0].name).toBe('The Old Road');
    expect(records[1].name).not.toBe('The Old Road');
  });
});

describe('one token, one class', () => {
  const records = assignCompNames(PRESET_COMP_ENTRIES.map(({ data }) => data));

  it('gives no word two meanings anywhere in the taxonomy', () => {
    // `Hymn` fue a la vez apodo de la Vestal y etiqueta de la mecanica de estres,
    // y "Feral Contract: Contract & Hymn" se leia como "lleva Vestal".
    const buckets = {
      token: Object.values(HERO_TOKENS).map((h) => h.token),
      aka: Object.values(HERO_TOKENS).flatMap((h) => h.aka || []),
      mechanic: MECHANICS.map((m) => m.label),
      camp: CAMP_TERMS.map((t) => t.label),
      region: Object.values(REGION_TOKENS),
      rank: RANK_WORDS
    };
    const seen = new Map();
    Object.entries(buckets).forEach(([kind, words]) =>
      words.forEach((w) => seen.set(w, [...(seen.get(w) || []), kind]))
    );
    expect([...seen.entries()].filter(([, kinds]) => kinds.length > 1)).toEqual([]);
  });

  it('covers every dungeon with a region token', () => {
    // Una zona sin token es un desempate que la taxonomia no puede usar, y una
    // comp que se queda sin nombre propio por eso.
    LOCATIONS.forEach((loc) => expect(REGION_TOKENS[loc]).toBeTruthy());
  });

  it('never spends an `aka` synonym on a name', () => {
    // El fallo que rompio la taxonomia anterior: dentro de una misma familia el
    // Musketeer salia como Snipe, Musket y Buckshot — tres nombres, un heroe.
    const synonyms = new Set(Object.values(HERO_TOKENS).flatMap((h) => h.aka || []));
    const used = records.flatMap((r) => r.variant.split(/ & | /));
    expect(used.filter((token) => synonyms.has(token))).toEqual([]);
  });

  // Lo que esta regla decia antes: un token suelto solo vale si las hermanas
  // que tambien lo llevan lo ALARGAN. Era una buena regla de lectura y es
  // relacional por definicion -- para cumplirla hay que mirar a las hermanas, y
  // mirar a las hermanas es lo que hacia que meter una comp renombrara a siete.
  // Se cambia por lo que el motor si puede prometer mirando solo a la comp: un
  // token suelto nombra a un heroe que la familia no explica, siempre.
  it('spends a lone token on a hero the family does not explain', () => {
    const offenders = [];
    records.forEach((rec) => {
      if (rec.exempt || !rec.variant || rec.variant.includes(NAME_LIMITS.pairJoin)) return;
      const explains = new Set(rec.family.consumed || []);
      const free = rec.analysis.classes.filter((c) => !explains.has(c));
      const names = new Set(free.map((c) => (HERO_TOKENS[c] || {}).token || c));
      const stacks = rec.analysis.stacks.map((st) =>
        `${st.count >= 3 ? 'Trio' : 'Twin'} ${(HERO_TOKENS[st.heroClass] || {}).token || st.heroClass}`
      );
      // Un desempate (region, rango, campamento, mecanica) tambien es un hecho
      // suyo; lo que no puede es salir de ningun sitio.
      const ownFact =
        names.has(rec.variant) ||
        stacks.includes(rec.variant) ||
        rec.variant === rec.analysis.region ||
        rec.analysis.ranks.some(
          (c, i) => c && `${(HERO_TOKENS[c] || {}).token || c} ${RANK_WORDS[i]}` === rec.variant
        ) ||
        rec.analysis.campTerms.some((t) => t.label === rec.variant) ||
        rec.analysis.mechanics.some((m) => m.label === rec.variant);
      if (!ownFact) offenders.push(`${rec.name} -> ${rec.variant}`);
    });
    expect(offenders).toEqual([]);
  });
});

describe('the fallback names stay recognisable as fallbacks', () => {
  it('shares no name between a signature family and a mechanic one', () => {
    // Si "Iron Shackles" se pudiera alcanzar por firma Y por mecanica, media
    // familia no compartiria nada con la otra media y no habria como notarlo.
    const signatures = new Set(FAMILIES.map((f) => f.name));
    Object.values(MECHANIC_FAMILIES).forEach((name) => expect(signatures.has(name)).toBe(false));
  });
});

describe('naming one comp against the library', () => {
  const library = PRESET_COMP_ENTRIES.map(({ data }) => data);

  it('never hands the new comp a name the library already uses', () => {
    const taken = new Set(library.map((c) => c.teamName));
    const clone = JSON.parse(JSON.stringify(library[0]));
    expect(taken.has(nameCompAgainst(clone, library).name)).toBe(false);
  });

  it('renames nothing else', () => {
    const before = library.map((c) => c.teamName);
    nameCompAgainst(comp('mine', [hero('Occultist'), hero('Plague Doctor'), hero('Jester')]), library);
    expect(library.map((c) => c.teamName)).toEqual(before);
  });

  it('turns a name into the file it belongs in', () => {
    // El "&" se cae del fichero: es legal en Windows pero es un metacaracter de
    // shell. Sigue en `teamName`, que es donde se lee el nombre de verdad.
    expect(toCompFileName('Marked Prey: Royal & Bulwark')).toBe('Marked_Prey__Royal_Bulwark.json');
    expect(toCompFileName('Hound Quartet')).toBe('Hound_Quartet.json');
    expect(toCompFileName('Rabid Devotion: Beast Second')).toBe('Rabid_Devotion__Beast_Second.json');
  });

  it('gives every comp in the library its own file', () => {
    const files = library.map((c) => toCompFileName(c.teamName));
    expect(new Set(files).size).toBe(files.length);
  });
});

describe('the naming is a fixed point', () => {
  // Aplicar el renombrado cambia los teamName, y los teamName alimentan la
  // pasada siguiente. Si el reparto dependiera de ellos, cada pase propondria
  // otro nombre y `--check` no diria nunca "al dia".
  const comps = PRESET_COMP_ENTRIES.map(({ data }) => data);
  const first = assignCompNames(comps);

  it('proposes nothing new when run again on its own output', () => {
    const renamed = comps.map((comp, i) => ({
      ...comp,
      teamName: first[i].name,
      alias: first[i].alias || undefined
    }));
    expect(assignCompNames(renamed).map((r) => r.name)).toEqual(first.map((r) => r.name));
  });

  it('lands on the same names from scratch, whatever the comps were called', () => {
    // Mismo reparto partiendo de nombres libres: el nombre actual solo puede
    // romper empates, nunca decidir.
    const blank = comps.map((comp, i) => ({ ...comp, teamName: `zzz ${comps.length - i}`, alias: undefined }));
    const fromScratch = assignCompNames(blank);
    const exempt = new Set(comps.filter((c) => c.taxonomy === false).map((c) => c.location));
    fromScratch.forEach((rec, i) => {
      if (rec.exempt || exempt.size === 0) return;
      expect(rec.family.name).toBe(first[i].family.name);
    });
  });

  it('numbers nothing: every variant is made of words', () => {
    first.forEach((rec) => expect(rec.variant).not.toMatch(/\s\d+$/));
  });
});
