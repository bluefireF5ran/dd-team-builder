import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getRecommendedQuirks } from '../../data/recommendations';

const QuirkSelector = ({ availableQuirks, onSelect, isPositive, currentQuirks, heroClass }) => {
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);
  const listboxIdRef = useRef(`quirks-listbox-${Math.random().toString(36).slice(2, 8)}`);
  const listboxId = listboxIdRef.current;

  const filteredQuirks = availableQuirks.filter(q =>
    !currentQuirks.includes(q) && q.toLowerCase().includes(search.toLowerCase())
  );

  const recommendedSet = useMemo(() => {
    const recs = getRecommendedQuirks(heroClass);
    return new Set(isPositive ? recs.positive : recs.negative);
  }, [heroClass, isPositive]);

  // While searching, skip the Recommended grouping to avoid confusing double-listing
  const recommendedQuirks = search ? [] : filteredQuirks.filter(q => recommendedSet.has(q));
  const restQuirks = search ? filteredQuirks : filteredQuirks.filter(q => !recommendedSet.has(q));
  const combinedList = [...recommendedQuirks, ...restQuirks];

  useEffect(() => {
    setFocusedIndex(-1);
  }, [search]);

  const handleKeyDown = (e) => {
    if (combinedList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, combinedList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      onSelect(combinedList[focusedIndex]);
      setSearch('');
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const renderQuirkButton = (quirk, combinedIdx) => (
    <button
      key={quirk}
      role="option"
      aria-selected={combinedIdx === focusedIndex}
      onClick={() => {
        onSelect(quirk);
        setSearch('');
      }}
      className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors ${
        isPositive
          ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-300 border border-yellow-800/50'
          : 'bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-800/50'
      } ${combinedIdx === focusedIndex ? 'ring-1 ring-dd-gold' : ''}`}
    >
      {quirk}
    </button>
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search quirks..."
        aria-label={isPositive ? 'Search positive quirks' : 'Search negative quirks'}
        role="combobox"
        aria-expanded={combinedList.length > 0}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        className="w-full bg-gray-900 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs sm:text-sm"
      />
      <div
        ref={listRef}
        className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1"
        role="listbox"
        id={listboxId}
        aria-label={isPositive ? 'Positive quirks list' : 'Negative quirks list'}
      >
        {recommendedQuirks.length > 0 && (
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider font-darkest text-emerald-400 px-1 pt-0.5">
            Recommended
          </div>
        )}
        {recommendedQuirks.map((quirk, idx) => renderQuirkButton(quirk, idx))}
        {recommendedQuirks.length > 0 && restQuirks.length > 0 && (
          <div className="border-t border-gray-700 my-1" />
        )}
        {restQuirks.map((quirk, idx) => renderQuirkButton(quirk, recommendedQuirks.length + idx))}
        {combinedList.length === 0 && (
          <div className="text-center py-2 text-gray-500 text-xs sm:text-sm">No quirks found</div>
        )}
      </div>
    </div>
  );
};

export default QuirkSelector;
