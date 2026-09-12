import {
  encodeComp,
  decodeComp,
  compLinkFor,
  compPayloadFromHash,
  COMP_LINK_ROUTE,
  COMP_LINK_VERSION,
} from '../compLink';
import { COMP_LIBRARY } from '../../data/compLibrary';

const hero = (over = {}) => ({
  heroClass: 'Crusader',
  activeSkills: ['Smite', 'Stunning Blow'],
  activeCampSkills: ['Encourage'],
  trinket1: 'Sun Ring',
  trinket2: '',
  quirks: { positive: ['Quick Reflexes'], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: [],
  ...over,
});

const team = (over = {}) => ({
  teamName: 'Test Comp',
  location: 'The Ruins',
  heroes: [hero(), hero({ heroClass: 'Vestal' }), hero({ heroClass: 'Jester' }), hero({ heroClass: 'Hellion' })],
  ...over,
});

describe('a comp in a link', () => {
  it('comes back the way it went in', () => {
    const t = team();
    expect(decodeComp(encodeComp(t))).toEqual(t);
  });

  it('produces a payload that is safe in a URL', () => {
    expect(encodeComp(team())).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('keeps an empty slot empty rather than dropping it', () => {
    const t = team({ heroes: [hero(), { heroClass: '' }, hero({ heroClass: 'Vestal' }), { heroClass: '' }] });
    const back = decodeComp(encodeComp(t));
    expect(back.heroes).toHaveLength(4);
    expect(back.heroes[1].heroClass).toBe('');
    expect(back.heroes[2].heroClass).toBe('Vestal');
  });

  /**
   * Rank order IS the comp: `heroes[0]` is rank 1, front to back, and nothing
   * on the way in or out may sort or dedupe. Two Jesters in different ranks
   * with different kit is a real comp, and the link has to keep them apart.
   */
  it('keeps rank order and does not dedupe a repeated class', () => {
    const t = team({
      heroes: [
        hero({ heroClass: 'Jester', activeSkills: ['Finale'] }),
        hero({ heroClass: 'Jester', activeSkills: ['Solo'] }),
        hero({ heroClass: 'Vestal' }),
        hero({ heroClass: 'Hellion' }),
      ],
    });
    const back = decodeComp(encodeComp(t));
    expect(back.heroes.map((h) => h.heroClass)).toEqual(['Jester', 'Jester', 'Vestal', 'Hellion']);
    expect(back.heroes[0].activeSkills).toEqual(['Finale']);
    expect(back.heroes[1].activeSkills).toEqual(['Solo']);
  });

  // btoa only speaks latin-1, and these are real skill names.
  it('survives the accented names the game actually ships', () => {
    const t = team({
      teamName: 'Touché',
      heroes: [hero({ heroClass: 'Duelist', activeSkills: ['Touché', 'Flèche', 'Coup de Grâce'] })],
    });
    const back = decodeComp(encodeComp(t));
    expect(back.teamName).toBe('Touché');
    expect(back.heroes[0].activeSkills).toEqual(['Touché', 'Flèche', 'Coup de Grâce']);
  });

  // No bundled name carries a delimiter today, but a mod may ship anything and
  // a split that cuts a name in half would be silent.
  it('survives a name carrying the delimiters themselves', () => {
    const nasty = 'Boots, Spurs | Reins ~ Whip \\ Crop';
    const back = decodeComp(encodeComp(team({ teamName: nasty, heroes: [hero({ trinket1: nasty })] })));
    expect(back.teamName).toBe(nasty);
    expect(back.heroes[0].trinket1).toBe(nasty);
  });

  it('keeps locked quirks and diseases apart from the ordinary ones', () => {
    const t = team({
      heroes: [hero({
        quirks: { positive: ['Quick Reflexes'], negative: ['Kleptomaniac'] },
        lockedQuirks: { positive: ['Quick Reflexes'], negative: [] },
        diseases: ['The Red Plague', 'Rabies'],
      })],
    });
    const back = decodeComp(encodeComp(t));
    expect(back.heroes[0].lockedQuirks).toEqual({ positive: ['Quick Reflexes'], negative: [] });
    expect(back.heroes[0].diseases).toEqual(['The Red Plague', 'Rabies']);
  });
});

describe('a payload that is not a comp', () => {
  it.each([
    ['nothing', ''],
    ['not a string', null],
    ['not base64', '!!!!'],
    ['base64 of nonsense', btoa('hello there')],
  ])('returns null for %s', (_label, payload) => {
    expect(decodeComp(payload)).toBeNull();
  });

  // A newer build's link read with these rules would produce a plausible wrong
  // party, which is worse than refusing it.
  it('refuses a version it does not know', () => {
    const future = encodeComp(team()).length ? btoa('9~Name~The Ruins~Crusader') : '';
    expect(decodeComp(future)).toBeNull();
  });

  it('accepts the version it does know', () => {
    expect(COMP_LINK_VERSION).toBe('1');
    expect(decodeComp(encodeComp(team()))).not.toBeNull();
  });
});

describe('the link itself', () => {
  it('hangs the payload off the comp route', () => {
    const url = compLinkFor(team(), 'https://example.com/builder');
    expect(url.startsWith('https://example.com/builder' + COMP_LINK_ROUTE)).toBe(true);
  });

  it('replaces a hash that is already there rather than appending', () => {
    const url = compLinkFor(team(), 'https://example.com/builder#/ranker');
    expect(url).not.toContain('#/ranker');
    expect(url.split('#')).toHaveLength(2);
  });

  it('reads its own hash back', () => {
    const url = compLinkFor(team(), 'https://example.com/');
    const payload = compPayloadFromHash('#' + url.split('#')[1]);
    expect(decodeComp(payload)).toEqual(team());
  });

  it('ignores a hash that is not a comp link', () => {
    expect(compPayloadFromHash('#/ranker')).toBeNull();
    expect(compPayloadFromHash('')).toBeNull();
    expect(compPayloadFromHash(COMP_LINK_ROUTE)).toBeNull();
  });
});

/**
 * The library is the real corpus: 467 comps with every shape the app produces,
 * including the duplicated-class ones and the tutorial party with two empty
 * slots. A round trip over all of them is what says the format holds.
 */
describe('against the whole comp library', () => {
  const comps = COMP_LIBRARY.slice(0, 200);

  /**
   * La comparacion es por CONTENIDO, no por claves presentes.
   *
   * Un heroe de la libreria puede no traer `diseases` -- los .json viejos se
   * escribieron antes de que existiera esa lista -- y el decodificador siempre
   * la emite. Eso no es perdida, es lo contrario: devuelve la forma completa de
   * `EMPTY_HERO`, que es lo que el resto de la app espera y la razon por la que
   * AGENTS.md insiste en que todo lo que recorre un heroe la lleve.
   */
  const shaped = (h) => ({
    heroClass: h.heroClass || '',
    activeSkills: h.activeSkills || [],
    activeCampSkills: h.activeCampSkills || [],
    trinket1: h.trinket1 || '',
    trinket2: h.trinket2 || '',
    quirks: { positive: h.quirks?.positive || [], negative: h.quirks?.negative || [] },
    lockedQuirks: { positive: h.lockedQuirks?.positive || [], negative: h.lockedQuirks?.negative || [] },
    diseases: h.diseases || [],
  });

  it('always returns the full hero shape, even from a comp written without it', () => {
    const back = decodeComp(encodeComp({ teamName: 'x', location: 'y', heroes: [{ heroClass: 'Jester' }] }));
    expect(back.heroes[0]).toEqual(shaped({ heroClass: 'Jester' }));
  });

  it('names every comp it is given, and every one has a name to test', () => {
    expect(comps.filter((c) => c.name).length).toBe(comps.length);
  });

  it('round-trips every comp it is given', () => {
    const broken = [];
    comps.forEach((comp) => {
      // `compLibrary` normaliza `teamName` a `name` -- leer el campo que no es
      // daba la vuelta a cadenas vacias y no probaba nada del nombre.
      const t = { teamName: comp.name || '', location: comp.location || '', heroes: comp.heroes || [] };
      const back = decodeComp(encodeComp(t));
      if (!back) { broken.push(`${t.teamName}: did not decode`); return; }
      if (back.teamName !== t.teamName) broken.push(`${t.teamName}: name came back as "${back.teamName}"`);
      if (back.location !== t.location) broken.push(`${t.teamName}: location`);
      if (JSON.stringify(back.heroes.map(shaped)) !== JSON.stringify(t.heroes.map(shaped))) {
        broken.push(`${t.teamName}: heroes differ`);
      }
    });
    expect(broken).toEqual([]);
  });

  /**
   * A link nobody can paste is not a feature. The ceiling is what chat clients
   * and address bars handle comfortably, and the measured max over the library
   * is a little over 1,400 characters of payload.
   */
  it('stays well inside what a URL can carry', () => {
    const lengths = comps.map((c) => encodeComp({
      teamName: c.name || '', location: c.location || '', heroes: c.heroes || [],
    }).length);
    expect(Math.max(...lengths)).toBeLessThan(1800);
  });
});
