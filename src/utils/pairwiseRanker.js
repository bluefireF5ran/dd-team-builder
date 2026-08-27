// ---------------------------------------------------------------------------
// Pairwise comparison ranking engine (Pub Meeple style).
//
// Strategy: bottom-up merge sort driven by human answers. Merge sort needs
// ~n*log2(n) - n + 1 comparisons in the worst case, which is within a few
// percent of the information-theoretic minimum log2(n!) for a full ordering,
// so it is about as few head-to-heads as an exact ranking can be done in.
//
// The whole run is a pure function of (item ids, answers[]). Nothing else is
// stored, which makes undo (drop the last answer) and resume-after-reload
// (replay the answers) trivial and always consistent.
// ---------------------------------------------------------------------------

// Deterministic PRNG so a shuffled starting order can be replayed exactly.
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const seededShuffle = (list, seed) => {
  const rand = mulberry32(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const ANSWER_LEFT = 'a';
export const ANSWER_RIGHT = 'b';

/**
 * Replays a merge sort over `ids` using the recorded `answers`.
 *
 * @param {string[]} ids     Starting order (already shuffled by the caller).
 * @param {string[]} answers Sequence of 'a' / 'b' picks, oldest first.
 * @returns {{done: boolean, pair: [string,string]|null, ranking: string[]|null,
 *            used: number, runs: string[][]}}
 *          `pair` is the next head-to-head to show ([left, right]).
 *          `runs` are the sorted sub-lists built so far (used for the
 *          provisional standings when the user quits early).
 */
export const runMergeSort = (ids, answers) => {
  if (ids.length <= 1) {
    return { done: true, pair: null, ranking: [...ids], used: 0, runs: [ids.slice()] };
  }

  let runs = ids.map((id) => [id]);
  let used = 0;

  while (runs.length > 1) {
    const next = [];
    for (let i = 0; i + 1 < runs.length; i += 2) {
      const A = runs[i];
      const B = runs[i + 1];
      const merged = [];
      let x = 0;
      let y = 0;

      while (x < A.length && y < B.length) {
        if (used >= answers.length) {
          // Out of answers: this is the comparison the user has to make now.
          // Everything merged so far in this pass is preserved in `pending`.
          const pending = [...next, [...merged, ...A.slice(x), ...B.slice(y)], ...runs.slice(i + 2)];
          return {
            done: false,
            pair: [A[x], B[y]],
            ranking: null,
            used,
            runs: pending
          };
        }
        if (answers[used++] === ANSWER_LEFT) merged.push(A[x++]);
        else merged.push(B[y++]);
      }

      while (x < A.length) merged.push(A[x++]);
      while (y < B.length) merged.push(B[y++]);
      next.push(merged);
    }

    if (runs.length % 2 === 1) next.push(runs[runs.length - 1]);
    runs = next;
  }

  return { done: true, pair: null, ranking: runs[0], used, runs };
};

/** Worst-case number of comparisons this engine can ask for n items. */
export const maxComparisons = (n) => {
  if (n < 2) return 0;
  let sizes = new Array(n).fill(1);
  let total = 0;
  while (sizes.length > 1) {
    const next = [];
    for (let i = 0; i + 1 < sizes.length; i += 2) {
      total += sizes[i] + sizes[i + 1] - 1;
      next.push(sizes[i] + sizes[i + 1]);
    }
    if (sizes.length % 2 === 1) next.push(sizes[sizes.length - 1]);
    sizes = next;
  }
  return total;
};

/**
 * Expected number of comparisons for a randomly ordered list. Merging runs of
 * size m and n costs m + n - m/(n+1) - n/(m+1) on average, because whichever
 * run empties first saves its remaining comparisons.
 */
export const estimateComparisons = (n) => {
  if (n < 2) return 0;
  let sizes = new Array(n).fill(1);
  let total = 0;
  while (sizes.length > 1) {
    const next = [];
    for (let i = 0; i + 1 < sizes.length; i += 2) {
      const m = sizes[i];
      const k = sizes[i + 1];
      total += m + k - m / (k + 1) - k / (m + 1);
      next.push(m + k);
    }
    if (sizes.length % 2 === 1) next.push(sizes[sizes.length - 1]);
    sizes = next;
  }
  return Math.round(total);
};

/**
 * Best-guess standings while a run is still in progress. Items inside a merged
 * run are already correctly ordered relative to each other, so rank them by
 * their normalised position within their run and let longer (better-resolved)
 * runs win ties.
 */
export const provisionalRanking = (runs) => {
  const scored = [];
  runs.forEach((run) => {
    run.forEach((id, index) => {
      scored.push({
        id,
        score: run.length > 1 ? index / (run.length - 1) : 0.5,
        confidence: run.length
      });
    });
  });
  scored.sort((p, q) => (p.score - q.score) || (q.confidence - p.confidence));
  return scored.map((entry) => entry.id);
};
