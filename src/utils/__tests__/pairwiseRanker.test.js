import {
  runMergeSort,
  estimateComparisons,
  maxComparisons,
  seededShuffle,
  provisionalRanking
} from '../pairwiseRanker';
import { buildItems } from '../rankerItems';
import { DEFAULT_ACTIVE_HEROES } from '../../config/rankerRoster';

// Drives a full run by always preferring the numerically smaller id.
const rankNumbers = (n, seed = 7) => {
  const ids = seededShuffle([...Array(n).keys()].map(String), seed);
  const answers = [];
  let state = runMergeSort(ids, answers);
  while (!state.done) {
    const [left, right] = state.pair;
    answers.push(Number(left) < Number(right) ? 'a' : 'b');
    state = runMergeSort(ids, answers);
  }
  return { ranking: state.ranking.map(Number), comparisons: answers.length, ids, answers };
};

describe('pairwise ranking engine', () => {
  it.each([2, 3, 5, 20, 91, 140])('produces a total order for %i items', (n) => {
    const { ranking } = rankNumbers(n);
    expect(ranking).toEqual([...Array(n).keys()]);
  });

  it('never asks for more than the worst case and lands near the estimate', () => {
    [20, 91, 140].forEach((n) => {
      const { comparisons } = rankNumbers(n);
      expect(comparisons).toBeLessThanOrEqual(maxComparisons(n));
      expect(Math.abs(comparisons - estimateComparisons(n)) / comparisons).toBeLessThan(0.15);
    });
  });

  it('stays below n*log2(n), i.e. close to the theoretical minimum', () => {
    const n = 140;
    expect(maxComparisons(n)).toBeLessThan(n * Math.log2(n));
  });

  it('is a pure replay of the answers, so undo is just dropping the last one', () => {
    const { ids, answers } = rankNumbers(50);
    const truncated = answers.slice(0, 30);
    expect(runMergeSort(ids, truncated)).toEqual(runMergeSort(ids, truncated));
    expect(runMergeSort(ids, truncated).used).toBe(30);
  });

  it('returns the same pair until it is answered', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const first = runMergeSort(ids, []);
    expect(first.done).toBe(false);
    expect(runMergeSort(ids, []).pair).toEqual(first.pair);
  });

  it('gives provisional standings that keep every item exactly once', () => {
    const ids = seededShuffle([...Array(40).keys()].map(String), 3);
    const partial = runMergeSort(ids, new Array(25).fill('a'));
    const standings = provisionalRanking(partial.runs);
    expect(standings).toHaveLength(40);
    expect(new Set(standings).size).toBe(40);
  });

  it('handles degenerate pools', () => {
    expect(runMergeSort([], []).done).toBe(true);
    expect(runMergeSort(['only'], []).ranking).toEqual(['only']);
    expect(estimateComparisons(1)).toBe(0);
  });
});

describe('roster to item pools', () => {
  it('builds one item per active hero', () => {
    const items = buildItems('heroes', DEFAULT_ACTIVE_HEROES);
    expect(items).toHaveLength(DEFAULT_ACTIVE_HEROES.length);
    expect(items.every((item) => item.image && item.id.startsWith('hero:'))).toBe(true);
  });

  it('pulls in the skills and camp skills of whichever heroes are active', () => {
    const one = buildItems('skills', ['Vestal']);
    const two = buildItems('skills', ['Vestal', 'Crusader']);
    expect(one).toHaveLength(7);
    expect(two.length).toBeGreaterThan(one.length);
    expect(one.every((item) => item.subtitle === 'Vestal')).toBe(true);
  });

  it('dedupes shared camp skills and credits every owning class', () => {
    const camp = buildItems('campSkills', ['Vestal', 'Crusader']);
    const names = camp.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
    const encourage = camp.find((item) => item.name === 'Encourage');
    expect(encourage.classes).toEqual(expect.arrayContaining(['Vestal', 'Crusader']));
    expect(encourage.subtitle).toBe('Shared — 2 classes');
  });

  it('ignores hero names that do not exist', () => {
    expect(buildItems('heroes', ['Vestal', 'Not A Hero'])).toHaveLength(1);
  });
});
