import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  COMP_REGIONS,
  COMP_REGION_STORAGE_KEY,
  DEFAULT_ACTIVE_HEROES,
  EXTRA_HEROES,
  ROSTER_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  RESULTS_STORAGE_KEY
} from '../config/rankerRoster';
import { buildItems, getHeroDefinition } from '../utils/rankerItems';
import {
  ANSWER_LEFT,
  ANSWER_RIGHT,
  estimateComparisons,
  maxComparisons,
  provisionalRanking,
  runMergeSort,
  seededShuffle
} from '../utils/pairwiseRanker';

// How much of a full exact ranking each depth setting is willing to pay for.
export const DEPTH_MODES = {
  exact: { id: 'exact', label: 'Exact', factor: 1, blurb: 'Every position resolved. No guesswork.' },
  balanced: { id: 'balanced', label: 'Balanced', factor: 0.6, blurb: 'Approximate order, ~40% fewer picks.' },
  quick: { id: 'quick', label: 'Quick', factor: 0.35, blurb: 'Rough tiers only, fastest pass.' }
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — the run still works in memory */
  }
};

const defaultRoster = () => {
  const merged = [...new Set([...DEFAULT_ACTIVE_HEROES, ...EXTRA_HEROES])];
  return merged.filter((name) => !!getHeroDefinition(name));
};

export const useRanker = () => {
  const [activeHeroes, setActiveHeroesState] = useState(() => {
    const stored = readJSON(ROSTER_STORAGE_KEY, null);
    if (Array.isArray(stored) && stored.length) {
      const valid = stored.filter((name) => !!getHeroDefinition(name));
      if (valid.length) return valid;
    }
    return defaultRoster();
  });

  const [category, setCategory] = useState('heroes');
  // Comps are ranked one region at a time -- see `buildCompItems`.
  const [compRegion, setCompRegion] = useState(
    () => readJSON(COMP_REGION_STORAGE_KEY, null) || COMP_REGIONS[0]
  );
  const [session, setSession] = useState(() => readJSON(SESSION_STORAGE_KEY, null));
  const [savedResults, setSavedResults] = useState(() => readJSON(RESULTS_STORAGE_KEY, {}));

  useEffect(() => writeJSON(ROSTER_STORAGE_KEY, activeHeroes), [activeHeroes]);
  useEffect(() => writeJSON(SESSION_STORAGE_KEY, session), [session]);
  useEffect(() => writeJSON(RESULTS_STORAGE_KEY, savedResults), [savedResults]);
  useEffect(() => writeJSON(COMP_REGION_STORAGE_KEY, compRegion), [compRegion]);

  // ---- roster -------------------------------------------------------------
  const setActiveHeroes = useCallback((names) => {
    setActiveHeroesState(names.filter((name) => !!getHeroDefinition(name)));
  }, []);

  const toggleHero = useCallback((name) => {
    if (!getHeroDefinition(name)) return;
    setActiveHeroesState((prev) =>
      prev.includes(name) ? prev.filter((h) => h !== name) : [...prev, name]
    );
  }, []);

  const resetRoster = useCallback(() => setActiveHeroesState(defaultRoster()), []);

  // ---- item pools ---------------------------------------------------------
  const items = useMemo(
    () => buildItems(category, activeHeroes, { region: compRegion }),
    [category, activeHeroes, compRegion]
  );

  const itemsById = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, item));
    return map;
  }, [items]);

  const poolSizes = useMemo(
    () => ({
      heroes: buildItems('heroes', activeHeroes).length,
      skills: buildItems('skills', activeHeroes).length,
      campSkills: buildItems('campSkills', activeHeroes).length,
      comps: buildItems('comps', activeHeroes, { region: compRegion }).length
    }),
    [activeHeroes, compRegion]
  );

  const estimate = useMemo(() => {
    const n = items.length;
    return {
      count: n,
      expected: estimateComparisons(n),
      worst: maxComparisons(n)
    };
  }, [items.length]);

  const budgetFor = useCallback(
    (modeId) => {
      const mode = DEPTH_MODES[modeId] || DEPTH_MODES.exact;
      if (mode.factor >= 1) return estimate.worst;
      return Math.max(items.length - 1, Math.round(estimate.expected * mode.factor));
    },
    [estimate, items.length]
  );

  // ---- session ------------------------------------------------------------
  // A session is only (ids, answers); everything else is replayed from it.
  const isSessionUsable = useMemo(() => {
    if (!session || session.category !== category) return false;
    // A comp session belongs to one region: switching region changes the pool
    // out from under it, and every id would be missing anyway.
    if (category === 'comps' && session.region !== compRegion) return false;
    return !session.ids.some((id) => !itemsById.has(id));
  }, [session, category, compRegion, itemsById]);

  useEffect(() => {
    // Drop a session whose items no longer exist (roster edited mid-run).
    if (session && session.category === category && !isSessionUsable) setSession(null);
  }, [session, category, isSessionUsable]);

  const activeSession = isSessionUsable ? session : null;

  const sortState = useMemo(
    () => (activeSession ? runMergeSort(activeSession.ids, activeSession.answers) : null),
    [activeSession]
  );

  const isBudgetReached =
    !!activeSession && !!sortState && activeSession.answers.length >= activeSession.budget;

  const isComplete = !!sortState && (sortState.done || isBudgetReached);

  const currentPair = useMemo(() => {
    if (!sortState || isComplete || !sortState.pair) return null;
    const [leftId, rightId] = sortState.pair;
    return { left: itemsById.get(leftId), right: itemsById.get(rightId) };
  }, [sortState, isComplete, itemsById]);

  const ranking = useMemo(() => {
    if (!sortState) return null;
    const ids = sortState.done ? sortState.ranking : provisionalRanking(sortState.runs);
    return ids.map((id) => itemsById.get(id)).filter(Boolean);
  }, [sortState, itemsById]);

  const progress = useMemo(() => {
    if (!activeSession || !sortState) return null;
    const done = activeSession.answers.length;
    const total = Math.max(activeSession.budget, done);
    return {
      done,
      total,
      percent: isComplete ? 100 : Math.min(99, Math.round((done / total) * 100)),
      exact: sortState.done
    };
  }, [activeSession, sortState, isComplete]);

  const startSession = useCallback(
    (modeId = 'exact') => {
      if (items.length < 2) return;
      const seed = Date.now() % 2147483647;
      setSession({
        category,
        region: category === 'comps' ? compRegion : null,
        mode: modeId,
        seed,
        budget: budgetFor(modeId),
        ids: seededShuffle(items.map((item) => item.id), seed),
        answers: [],
        startedAt: new Date().toISOString()
      });
    },
    [items, category, compRegion, budgetFor]
  );

  const answer = useCallback((side) => {
    setSession((prev) =>
      prev ? { ...prev, answers: [...prev.answers, side === 'left' ? ANSWER_LEFT : ANSWER_RIGHT] } : prev
    );
  }, []);

  const undo = useCallback(() => {
    setSession((prev) =>
      prev && prev.answers.length ? { ...prev, answers: prev.answers.slice(0, -1) } : prev
    );
  }, []);

  const discardSession = useCallback(() => setSession(null), []);

  // Comp results are stored PER REGION, so ranking the Weald cannot overwrite
  // the Ruins -- they are different questions with different answers.
  const resultsKey = useMemo(
    () => (category === 'comps' ? `comps:${compRegion}` : category),
    [category, compRegion]
  );

  const saveResults = useCallback(() => {
    if (!ranking || !activeSession) return;
    setSavedResults((prev) => ({
      ...prev,
      [resultsKey]: {
        rankedAt: new Date().toISOString(),
        exact: !!sortState?.done,
        comparisons: activeSession.answers.length,
        roster: activeHeroes,
        region: category === 'comps' ? compRegion : null,
        items: ranking.map(
          ({ id, name, image, heroImage, subtitle, classes, modded, location, alias, heroes }) => ({
            id,
            name,
            image,
            heroImage,
            subtitle,
            classes,
            modded,
            // Comps only: the party as it was actually judged. A ranking of
            // names is not readable outside this app.
            ...(heroes ? { location, alias, heroes } : {})
          })
        )
      }
    }));
  }, [ranking, activeSession, category, compRegion, resultsKey, sortState, activeHeroes]);

  const clearResults = useCallback(
    (cat) => {
      setSavedResults((prev) => {
        const next = { ...prev };
        delete next[cat ?? resultsKey];
        return next;
      });
    },
    [resultsKey]
  );

  return {
    // roster
    activeHeroes,
    setActiveHeroes,
    toggleHero,
    resetRoster,
    // pools
    category,
    setCategory,
    compRegion,
    setCompRegion,
    resultsKey,
    items,
    poolSizes,
    estimate,
    budgetFor,
    // session
    session: activeSession,
    startSession,
    answer,
    undo,
    discardSession,
    currentPair,
    ranking,
    progress,
    isComplete,
    // results
    savedResults,
    saveResults,
    clearResults
  };
};
