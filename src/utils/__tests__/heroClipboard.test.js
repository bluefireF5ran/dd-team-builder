import {
  HERO_CLIPBOARD_KIND,
  copyTextToClipboard,
  parseHeroClipboard,
  readClipboardText,
  serializeHero
} from '../heroClipboard';

const vestal = {
  heroClass: 'Vestal',
  activeSkills: ['Judgement', 'Dazzling Light', 'Divine Grace', 'Divine Comfort'],
  activeCampSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Pray'],
  trinket1: "Junia's Head",
  trinket2: 'Surgical Gloves',
  quirks: { positive: ['Quick Reflexes'], negative: ['Kleptomaniac'] },
  lockedQuirks: { positive: ['Quick Reflexes'], negative: [] },
  diseases: ['Tapeworm']
};

describe('serializeHero', () => {
  it('writes a tagged, re-readable payload', () => {
    const payload = JSON.parse(serializeHero(vestal));
    expect(payload.kind).toBe(HERO_CLIPBOARD_KIND);
    expect(payload.hero).toEqual(vestal);
    expect(parseHeroClipboard(serializeHero(vestal))).toEqual(vestal);
  });

  it('drops fields that are not part of a hero', () => {
    const payload = JSON.parse(serializeHero({ ...vestal, position: 3, __proto__hack: 'x' }));
    expect(Object.keys(payload.hero).sort()).toEqual([
      'activeCampSkills', 'activeSkills', 'diseases', 'heroClass', 'lockedQuirks', 'quirks', 'trinket1', 'trinket2'
    ]);
  });

  it('fills in an empty hero rather than emitting undefined', () => {
    const payload = JSON.parse(serializeHero({ heroClass: 'Leper' }));
    expect(payload.hero).toEqual({
      heroClass: 'Leper',
      activeSkills: [],
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] },
      diseases: []
    });
  });

  it('does not hand out references into the source hero', () => {
    const payload = JSON.parse(serializeHero(vestal));
    payload.hero.activeSkills.push('Hand of Light');
    expect(vestal.activeSkills).toHaveLength(4);
  });
});

describe('parseHeroClipboard', () => {
  it('accepts a bare hero object, not just our own format', () => {
    expect(parseHeroClipboard(JSON.stringify(vestal))).toEqual(vestal);
  });

  it('fills in the fields a hand-written payload leaves out', () => {
    const parsed = parseHeroClipboard(JSON.stringify({ heroClass: 'Leper', activeSkills: ['Chop'] }));
    expect(parsed).toEqual({
      heroClass: 'Leper',
      activeSkills: ['Chop'],
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] },
      diseases: []
    });
  });

  it('points at the right button when handed a whole team', () => {
    const team = JSON.stringify({ teamName: 'T', location: 'The Ruins', heroes: [vestal] });
    expect(() => parseHeroClipboard(team)).toThrow(/whole team/i);
  });

  it('rejects junk without pretending it half worked', () => {
    expect(() => parseHeroClipboard('')).toThrow(/empty/i);
    expect(() => parseHeroClipboard('   ')).toThrow(/empty/i);
    expect(() => parseHeroClipboard('hello world')).toThrow(/does not contain a hero/i);
    expect(() => parseHeroClipboard('[1,2,3]')).toThrow(/does not contain a hero/i);
    expect(() => parseHeroClipboard('null')).toThrow(/does not contain a hero/i);
    expect(() => parseHeroClipboard('{"heroClass":""}')).toThrow(/does not contain a hero/i);
    expect(() => parseHeroClipboard(undefined)).toThrow(/empty/i);
  });

  it('refuses a payload that breaks the hero limits', () => {
    const tooMany = { ...vestal, activeSkills: ['a', 'b', 'c', 'd', 'e'] };
    expect(() => parseHeroClipboard(JSON.stringify(tooMany))).toThrow(/activeSkills exceeds max of 4/);
  });

  it('refuses a string where an array belongs instead of splitting it into letters', () => {
    const bad = JSON.stringify({ ...vestal, activeSkills: 'Smite' });
    expect(() => parseHeroClipboard(bad)).toThrow(/activeSkills must be an array/);
  });

  it('canonicalizes old spellings the way loading a preset does', () => {
    const parsed = parseHeroClipboard(JSON.stringify({ ...vestal, heroClass: 'Man-at-Arms' }));
    expect(parsed.heroClass).toBe('Man at Arms');
  });

  it('keeps unknown extra keys out of the pasted hero', () => {
    const parsed = parseHeroClipboard(JSON.stringify({ ...vestal, evil: 'payload' }));
    expect(parsed).not.toHaveProperty('evil');
  });
});

describe('copyTextToClipboard', () => {
  afterEach(() => { delete navigator.clipboard; });

  it('reports success when the clipboard API takes it', async () => {
    const writeText = jest.fn().mockResolvedValue();
    navigator.clipboard = { writeText };
    await expect(copyTextToClipboard('hi')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi');
  });

  it('falls back to execCommand when the API refuses', async () => {
    navigator.clipboard = { writeText: jest.fn().mockRejectedValue(new Error('denied')) };
    document.execCommand = jest.fn().mockReturnValue(true);
    await expect(copyTextToClipboard('hi')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull(); // limpia lo que crea
  });

  it('reports failure rather than throwing when both routes fail', async () => {
    navigator.clipboard = { writeText: jest.fn().mockRejectedValue(new Error('denied')) };
    document.execCommand = jest.fn(() => { throw new Error('nope'); });
    await expect(copyTextToClipboard('hi')).resolves.toBe(false);
  });
});

describe('readClipboardText', () => {
  afterEach(() => { delete navigator.clipboard; });

  it('returns the clipboard text', async () => {
    navigator.clipboard = { readText: jest.fn().mockResolvedValue('text') };
    await expect(readClipboardText()).resolves.toBe('text');
  });

  it('explains an unsupported browser', async () => {
    await expect(readClipboardText()).rejects.toThrow(/will not let the page read/i);
  });

  it('explains a denied permission', async () => {
    navigator.clipboard = { readText: jest.fn().mockRejectedValue(new Error('denied')) };
    await expect(readClipboardText()).rejects.toThrow(/allow clipboard access/i);
  });
});
