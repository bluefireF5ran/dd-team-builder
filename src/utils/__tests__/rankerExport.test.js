import { buildRankingPayload } from '../rankerExport';
import { buildCompItems } from '../rankerItems';

describe('buildRankingPayload', () => {
  it('keeps a comp entry whole, so the file can be read outside this app', () => {
    // Straight from the real library, not a hand-made stub: the point is that
    // whatever `compItem` attaches survives the export.
    const [comp] = buildCompItems('The Ruins');
    const payload = buildRankingPayload({
      category: 'comps',
      ranking: [comp],
      exact: true,
      comparisons: 12,
      rankedAt: '2026-09-02T00:00:00.000Z'
    });

    const [entry] = payload.ranking;
    expect(entry.rank).toBe(1);
    expect(entry.name).toBe(comp.name);
    // The three fields the export used to drop.
    expect(entry.location).toBe(comp.location);
    expect(entry.alias).toBe(comp.alias);
    expect(entry.heroes).toEqual(comp.heroes);
    // A party, with real builds on it.
    expect(entry.heroes.length).toBeGreaterThanOrEqual(2);
    expect(entry.heroes[0].heroClass).toBeTruthy();
  });

  it('preserves rank order, which is the whole result', () => {
    const comps = buildCompItems('The Ruins').slice(0, 3);
    const payload = buildRankingPayload({ category: 'comps', ranking: comps });
    expect(payload.ranking.map((e) => e.rank)).toEqual([1, 2, 3]);
    expect(payload.ranking.map((e) => e.name)).toEqual(comps.map((c) => c.name));
  });

  it('leaves the loadout keys off items that have none', () => {
    // Heroes, skills and camp skills are not parties; an empty `heroes: []`
    // would read as "a comp with nobody in it".
    const payload = buildRankingPayload({
      category: 'heroes',
      ranking: [{ name: 'Vestal', classes: undefined }]
    });
    expect(payload.ranking[0]).toEqual({ rank: 1, name: 'Vestal', classes: undefined });
    expect('heroes' in payload.ranking[0]).toBe(false);
    expect('location' in payload.ranking[0]).toBe(false);
  });

  it('carries the session metadata a reader needs to weigh the ranking', () => {
    const payload = buildRankingPayload({
      category: 'comps',
      ranking: [],
      exact: false,
      comparisons: 40,
      rankedAt: '2026-09-02T00:00:00.000Z'
    });
    // `exact: false` means the run was finished early, so the tail of the
    // order is a guess. A consumer that cannot see this would over-trust it.
    expect(payload).toEqual({
      category: 'comps',
      rankedAt: '2026-09-02T00:00:00.000Z',
      exact: false,
      comparisons: 40,
      ranking: []
    });
  });
});
