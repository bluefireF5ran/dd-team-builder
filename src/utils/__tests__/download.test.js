import { downloadJSON } from '../download';

describe('downloadJSON', () => {
  let clicked;
  let createdBlobs;

  beforeEach(() => {
    clicked = [];
    createdBlobs = [];
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const attrs = {};
      return {
        tagName: tag,
        setAttribute: (k, v) => { attrs[k] = v; },
        getAttribute: (k) => attrs[k],
        click: () => clicked.push({ ...attrs })
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  const stubObjectUrl = () => {
    URL.createObjectURL = jest.fn((blob) => {
      createdBlobs.push(blob);
      return 'blob:stub-url';
    });
    URL.revokeObjectURL = jest.fn();
  };

  it('hands the browser a blob, not a data: URI', () => {
    stubObjectUrl();
    expect(downloadJSON('teams.json', { teams: [] })).toBe(true);

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe('teams.json');
    expect(clicked[0].href).toBe('blob:stub-url');
    expect(createdBlobs[0].type).toBe('application/json');
  });

  it('survives a payload far past the data: URI ceiling', () => {
    stubObjectUrl();
    // Roughly what a full comp ranking looks like: every comp carries a party.
    const ranking = Array.from({ length: 160 }, (_, i) => ({
      rank: i + 1,
      name: `Comp ${i}`,
      heroes: Array.from({ length: 4 }, () => ({
        heroClass: 'Plague Doctor',
        activeSkills: ['Plague Grenade', 'Incision', 'Battlefield Medicine', 'Blinding Gas'],
        activeCampSkills: ['Encourage', 'Wound Care', 'Leeches', 'Self Medicate'],
        trinket1: "Ancestor's Bottle",
        trinket2: 'Bloodied Fetish'
      }))
    }));

    downloadJSON('dd_ranking_comps.json', { ranking });

    const text = JSON.stringify({ ranking }, null, 2);
    // The blob carries the JSON verbatim...
    expect(createdBlobs[0].size).toBe(text.length);
    // ...whereas the data: URI this replaced ran it through
    // encodeURIComponent first, which more than doubles it before the browser
    // ever applies its ~2 MB cap.
    expect(encodeURIComponent(text).length).toBeGreaterThan(text.length * 2);
  });

  it('releases the object URL rather than leaking it for the tab', () => {
    jest.useFakeTimers();
    stubObjectUrl();
    downloadJSON('teams.json', {});
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:stub-url');
    jest.useRealTimers();
  });

  it('falls back to a data: URI where blobs are unavailable', () => {
    // jsdom without createObjectURL, which is what the storage tests run in.
    expect(downloadJSON('teams.json', { a: 1 })).toBe(true);
    expect(clicked[0].href).toMatch(/^data:application\/json/);
    expect(decodeURIComponent(clicked[0].href.split(',')[1])).toContain('"a": 1');
  });
});
