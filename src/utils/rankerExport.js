/**
 * The shape a finished ranking takes on its way out of the app.
 *
 * This is a pure function on purpose: the ranker's JSON export is what the
 * sibling RL project reads, so the shape is a contract with something outside
 * this repo and deserves a test that does not need a mounted component.
 *
 * **A comp entry carries its whole party.** `rankerItems.compItem` attaches
 * `heroes`, `location` and `alias` for exactly this reason — two comps can
 * field the same four classes and differ entirely in skills, trinkets and
 * region, so a reader given only a name and a class list cannot tell them
 * apart, and cannot reconstruct what was actually ranked. The export used to
 * drop all three.
 *
 * Hero, skill and camp-skill items have no loadout, and get the short form.
 */
export const buildRankingPayload = ({ category, ranking, exact, comparisons, rankedAt }) => ({
  category,
  rankedAt: rankedAt || new Date().toISOString(),
  exact,
  comparisons,
  ranking: (ranking || []).map((item, index) => ({
    rank: index + 1,
    name: item.name,
    classes: item.classes,
    ...(item.heroes ? { location: item.location, alias: item.alias, heroes: item.heroes } : {})
  }))
});

export default buildRankingPayload;
