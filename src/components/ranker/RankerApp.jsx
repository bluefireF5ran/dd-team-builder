import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Users, ChevronDown, ChevronUp, Library, Swords } from 'lucide-react';
import Toast from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';
import RosterManager from './RosterManager';
import SetupView from './SetupView';
import ComparisonView from './ComparisonView';
import ResultsView from './ResultsView';
import GeneralistView from './GeneralistView';
import { useRanker } from '../../hooks/useRanker';
import { RANKING_CATEGORIES } from '../../config/rankerRoster';
import { getAssetUrl } from '../../config/assets';

const BACKGROUND = getAssetUrl('/images/bg/The Ruins.png');

// Dos rankings que no compiten: el de parejas pregunta que prefieres TU, el
// generalista lee lo que la libreria de comps lleva de verdad.
const MODES = [
  {
    id: 'pairwise',
    label: 'Your ranking',
    hint: 'Head-to-head picks',
    icon: Swords
  },
  {
    id: 'generalist',
    label: 'Generalist',
    hint: 'What the comp library uses',
    icon: Library
  }
];

const RankerApp = () => {
  const {
    activeHeroes,
    setActiveHeroes,
    toggleHero,
    resetRoster,
    category,
    setCategory,
    compRegion,
    setCompRegion,
    resultsKey,
    poolSizes,
    estimate,
    budgetFor,
    session,
    startSession,
    answer,
    undo,
    discardSession,
    currentPair,
    ranking,
    progress,
    isComplete,
    savedResults,
    saveResults
  } = useRanker();

  const [mode, setMode] = useState('pairwise');
  const [view, setView] = useState('setup');
  const [depth, setDepth] = useState('exact');
  const [showRoster, setShowRoster] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finishedEarly, setFinishedEarly] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const categoryMeta = RANKING_CATEGORIES.find((c) => c.id === category) || RANKING_CATEGORIES[0];
  const budget = budgetFor(depth);

  // The run ends on its own once the sort is resolved (or the budget runs out).
  useEffect(() => {
    if (view === 'compare' && isComplete) setView('results');
  }, [view, isComplete]);

  const handleStart = () => setConfirmOpen(true);

  const confirmStart = () => {
    setConfirmOpen(false);
    setFinishedEarly(false);
    startSession(depth);
    setView('compare');
  };

  const handleQuit = useCallback(() => {
    discardSession();
    setFinishedEarly(false);
    setView('setup');
  }, [discardSession]);

  const handleFinishEarly = useCallback(() => {
    setFinishedEarly(true);
    setView('results');
  }, []);

  const handleCategoryChange = (next) => {
    setCategory(next);
    setView('setup');
  };

  const savedForCategory = savedResults[resultsKey];
  const showingSaved = view === 'saved' && savedForCategory;

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-3 sm:p-6 bg-cover bg-center bg-fixed vignette dd-grain"
      style={{
        backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.88), rgba(17, 24, 39, 0.96)), url('${BACKGROUND}')`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 animate-fade-in-up">
          <div className="flex items-center justify-between gap-3 mb-3">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-dd-gold transition-colors"
            >
              <ArrowLeft size={14} /> Team Builder
            </a>
            {mode === 'pairwise' && (
              <button
                onClick={() => setShowRoster((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                <Users size={14} /> Roster ({activeHeroes.length})
                {showRoster ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
          <h1 className="font-darkest text-3xl sm:text-5xl text-center text-dd-red-light drop-shadow-lg tracking-wider">
            Darkest Dungeon
          </h1>
          <h2 className="font-darkest text-xl sm:text-2xl text-center text-dd-gold tracking-wide">
            Ranking Engine
          </h2>
          <div className="dd-separator mt-3 mb-2" />
          <p className="text-center text-gray-400 text-xs sm:text-sm italic">
            {mode === 'pairwise'
              ? '"Two roads diverged — and you must choose."'
              : '"The ledger remembers what every party carried."'}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {MODES.map(({ id, label, hint, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`px-3 py-1.5 rounded border-2 text-left transition-colors ${
                  mode === id
                    ? 'border-dd-gold bg-dd-gold/15 text-dd-parchment'
                    : 'border-gray-700 bg-gray-900/60 text-gray-400 hover:border-dd-gold/50'
                }`}
              >
                <span className="flex items-center gap-1.5 font-darkest text-sm tracking-wide">
                  <Icon size={14} /> {label}
                </span>
                <span className="block text-[10px] text-gray-500">{hint}</span>
              </button>
            ))}
          </div>
        </header>

        {mode === 'generalist' && <GeneralistView savedResults={savedResults} onNotify={notify} />}

        {mode === 'pairwise' && showRoster && (
          <div className="mb-4">
            <RosterManager
              activeHeroes={activeHeroes}
              onToggleHero={toggleHero}
              onSetRoster={setActiveHeroes}
              onReset={resetRoster}
              onNotify={notify}
            />
          </div>
        )}

        {mode === 'pairwise' && view === 'setup' && (
          <SetupView
            category={category}
            onSelectCategory={handleCategoryChange}
            compRegion={compRegion}
            onSelectRegion={setCompRegion}
            activeHeroes={activeHeroes}
            poolSizes={poolSizes}
            resultsKey={resultsKey}
            estimate={estimate}
            depth={depth}
            onSelectDepth={setDepth}
            budget={budget}
            onStart={handleStart}
            savedResults={savedResults}
            onViewSaved={() => setView('saved')}
            hasSession={!!session && !isComplete}
            onResume={() => setView('compare')}
          />
        )}

        {mode === 'pairwise' && view === 'compare' && currentPair && progress && (
          <ComparisonView
            category={category}
            categoryLabel={categoryMeta.label}
            blurb={categoryMeta.blurb}
            pair={currentPair}
            progress={progress}
            onPick={answer}
            onUndo={undo}
            canUndo={progress.done > 0}
            onFinishEarly={handleFinishEarly}
            onQuit={handleQuit}
          />
        )}

        {mode === 'pairwise' && view === 'results' && ranking && progress && (
          <ResultsView
            category={category}
            categoryLabel={categoryMeta.label}
            ranking={ranking}
            comparisons={progress.done}
            exact={progress.exact && !finishedEarly}
            onRestart={confirmStart}
            onBackToSetup={handleQuit}
            onSave={saveResults}
            onNotify={notify}
          />
        )}

        {mode === 'pairwise' && showingSaved && (
          <ResultsView
            category={category}
            categoryLabel={`${categoryMeta.label} (saved)`}
            ranking={savedForCategory.items}
            comparisons={savedForCategory.comparisons}
            exact={savedForCategory.exact}
            onRestart={handleStart}
            onBackToSetup={() => setView('setup')}
            onSave={null}
            onNotify={notify}
          />
        )}

        <ConfirmDialog
          isOpen={confirmOpen}
          title="Begin ranking?"
          message={`You are about to rank ${estimate.count} ${categoryMeta.label.toLowerCase()}. This will take an estimated ${budget.toLocaleString()} comparisons. Do you want to continue?`}
          confirmLabel="Continue"
          onConfirm={confirmStart}
          onCancel={() => setConfirmOpen(false)}
        />

        {toast && (
          <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};

export default RankerApp;
