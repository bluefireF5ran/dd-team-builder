import React from 'react';
import { Play, Trophy, Timer } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { COMP_REGIONS, RANKING_CATEGORIES } from '../../config/rankerRoster';
import { DEPTH_MODES } from '../../hooks/useRanker';
import { buildItems } from '../../utils/rankerItems';
import { estimateComparisons } from '../../utils/pairwiseRanker';

const SAMPLE_COUNT = 5;

const CategoryCard = ({ category, isSelected, count, samples, onSelect }) => (
  <button
    onClick={() => onSelect(category.id)}
    className={`relative text-left rounded-lg border-2 p-4 transition-all duration-150 overflow-hidden ${
      isSelected
        ? 'border-dd-gold bg-gray-800/95 shadow-torch'
        : 'border-gray-700 bg-gray-800/70 hover:border-dd-gold/50'
    }`}
  >
    <div className="flex items-center justify-between gap-2 mb-2">
      <h3 className="font-darkest text-xl text-dd-parchment tracking-wide">{category.label}</h3>
      <span
        className={`text-xs px-2 py-0.5 rounded border ${
          isSelected ? 'border-dd-gold/60 text-dd-gold' : 'border-gray-600 text-gray-400'
        }`}
      >
        {count} items
      </span>
    </div>
    <p className="text-[11px] text-gray-400 mb-3">{category.blurb}</p>
    <div className="flex items-center gap-1.5">
      {samples.map((item) => (
        <ImageWithFallback
          key={item.id}
          src={item.image}
          alt=""
          aria-hidden="true"
          className={
            category.id === 'heroes'
              ? 'w-11 h-11 rounded-sm object-cover border border-gray-700'
              : 'w-11 h-11 object-contain'
          }
          fallback={null}
        />
      ))}
      {count > samples.length && (
        <span className="text-[11px] text-gray-500 ml-1">+{count - samples.length}</span>
      )}
    </div>
    <p className="text-[11px] text-gray-500 mt-3">
      ~{estimateComparisons(count).toLocaleString()} comparisons for a full ranking
    </p>
  </button>
);

// Comps are ranked one region at a time. Not a filter for convenience: a comp
// is BUILT for a region -- the enemy pool, the DoT resistances and the corpse
// and size mix all differ -- so one global comp order would be averaging four
// different questions into a single answer.
const RegionPicker = ({ region, onSelect, count }) => (
  <div className="mt-4 pt-4 border-t border-gray-700">
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
      <h4 className="font-darkest text-sm text-dd-gold tracking-wide">Region</h4>
      <p className="text-[11px] text-gray-500">
        {count} comp{count === 1 ? '' : 's'} tagged for this region
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      {COMP_REGIONS.map((name) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
            name === region
              ? 'border-dd-gold bg-dd-gold/20 text-dd-gold'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
    <p className="text-[11px] text-gray-500 mt-2">
      A comp ranked in one region is a comp for that region. Rank each one
      separately — the saved rankings are kept apart.
    </p>
  </div>
);

const SetupView = ({
  category,
  onSelectCategory,
  compRegion,
  onSelectRegion,
  activeHeroes,
  poolSizes,
  resultsKey,
  estimate,
  depth,
  onSelectDepth,
  budget,
  onStart,
  savedResults,
  onViewSaved,
  hasSession,
  onResume
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {RANKING_CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          isSelected={cat.id === category}
          count={poolSizes[cat.id] || 0}
          samples={buildItems(cat.id, activeHeroes).slice(0, SAMPLE_COUNT)}
          onSelect={onSelectCategory}
        />
      ))}
    </div>

    <div className="ornate-panel bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-dd-red/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px]">
          <h3 className="font-darkest text-xl text-dd-gold tracking-wide mb-1">How precise?</h3>
          <p className="text-xs text-gray-400 mb-3">
            An exact ranking of {estimate.count} items needs roughly{' '}
            {estimate.expected.toLocaleString()} head-to-heads. The shorter passes stop early and give an
            approximate order.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(DEPTH_MODES).map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectDepth(mode.id)}
                className={`px-3 py-2 rounded border-2 text-left transition-colors ${
                  depth === mode.id
                    ? 'border-dd-gold bg-dd-gold/15 text-dd-parchment'
                    : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-dd-gold/50'
                }`}
              >
                <span className="block text-sm font-darkest tracking-wide">{mode.label}</span>
                <span className="block text-[10px] text-gray-400">{mode.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 min-w-[220px]">
          <div className="rounded border border-gray-700 bg-gray-900/70 px-4 py-3 text-center">
            <span className="flex items-center justify-center gap-2 text-dd-gold">
              <Timer size={16} />
              <span className="font-darkest text-2xl">~{budget.toLocaleString()}</span>
            </span>
            <span className="block text-[11px] text-gray-400 mt-0.5">
              estimated comparisons for {estimate.count} items
            </span>
          </div>
          {hasSession && (
            <button
              onClick={onResume}
              className="px-4 py-2 rounded border-2 border-torch/60 bg-torch/15 text-dd-parchment hover:bg-torch/25 transition-colors text-sm"
            >
              Resume run in progress
            </button>
          )}
          <button
            onClick={onStart}
            disabled={estimate.count < 2}
            className="px-4 py-3 rounded border-2 border-dd-gold/60 bg-dd-gold/20 hover:bg-dd-gold/30 disabled:opacity-40 disabled:cursor-not-allowed text-dd-gold transition-colors inline-flex items-center justify-center gap-2 font-darkest text-lg tracking-wide"
          >
            <Play size={18} /> Start ranking
          </button>
          {estimate.count < 2 && (
            <p className="text-[11px] text-dd-red-light text-center">
              Add at least two heroes to the roster.
            </p>
          )}
        </div>
      </div>

      {category === 'comps' && (
        <RegionPicker
          region={compRegion}
          onSelect={onSelectRegion}
          count={poolSizes.comps || 0}
        />
      )}

      {savedResults[resultsKey] && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-400 inline-flex items-center gap-2">
            <Trophy size={14} className="text-dd-gold" />
            Saved ranking from {new Date(savedResults[resultsKey].rankedAt).toLocaleDateString()} —{' '}
            {savedResults[resultsKey].items.length} items,{' '}
            {savedResults[resultsKey].comparisons} comparisons
            {!savedResults[resultsKey].exact && ' (approximate)'}
          </p>
          <button
            onClick={onViewSaved}
            className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            View saved ranking
          </button>
        </div>
      )}
    </div>
  </div>
);

export default SetupView;
