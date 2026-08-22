import {
  stripLegacyMarker,
  parseCompName,
  formatCompName,
  analyzeComp,
  matchFamily,
  assignCompNames,
  longestName
} from '../compNaming';
import { NAME_LIMITS } from '../../data/compTaxonomy';
import { PRESET_COMP_ENTRIES } from '../../data/presetComps/index';

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
