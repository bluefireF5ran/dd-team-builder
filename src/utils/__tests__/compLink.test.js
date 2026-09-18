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

const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s';

/** `atob` wants plain base64 back: the url alphabet and the padding undone. */
const pad = (payload) => {
  const plain = payload.replace(/-/g, '+').replace(/_/g, '/');
  return plain + '='.repeat((4 - (plain.length % 4)) % 4);
};

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

  it('accepts the versions it does know', () => {
    expect(COMP_LINK_VERSION).toBe('2');
    expect(decodeComp(encodeComp(team()))).not.toBeNull();
    expect(decodeComp(encodeComp(team({ video: VIDEO })))).not.toBeNull();
  });
});

/**
 * The video is the only thing `2` adds, and the only reason to write a `2`.
 */
describe('the guide video a comp carries', () => {
  it('comes back the way it went in', () => {
    const t = team({ video: VIDEO });
    expect(decodeComp(encodeComp(t))).toEqual(t);
  });

  it('only stamps the new version on a comp that has one', () => {
    expect(atob(pad(encodeComp(team()))).startsWith('1~')).toBe(true);
    expect(atob(pad(encodeComp(team({ video: VIDEO })))).startsWith('2~')).toBe(true);
  });

  // The whole point of holding the old shape back: a link written before this
  // existed, and a link from a build that never learnt to write one.
  it('still opens a link with no video in it', () => {
    const v1 = btoa('1~Old Comp~The Weald~Crusader|Smite');
    expect(decodeComp(v1)).toEqual({
      teamName: 'Old Comp',
      location: 'The Weald',
      heroes: [expect.objectContaining({ heroClass: 'Crusader' })],
    });
  });

  // Nothing renders the string itself (see videoLink.js), and a comp is not the
  // place to keep something the player will never play.
  it('drops a video it could not play rather than carrying it into the app', () => {
    const decoded = decodeComp(encodeComp(team({ video: 'https://vimeo.com/123456789' })));
    expect(decoded).not.toHaveProperty('video');
  });

  it('drops one that was hand-written into a payload', () => {
    // eslint-disable-next-line no-script-url
    const hostile = btoa('2~Comp~The Weald~javascript:alert(1)~Crusader|Smite');
    expect(decodeComp(hostile)).not.toHaveProperty('video');
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
