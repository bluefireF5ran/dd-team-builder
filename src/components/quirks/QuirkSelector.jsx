import React, { useState, useRef, useEffect } from 'react';

const QuirkSelector = ({ availableQuirks, onSelect, isPositive, currentQuirks }) => {
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);
  const listboxIdRef = useRef(`quirks-listbox-${Math.random().toString(36).slice(2, 8)}`);
  const listboxId = listboxIdRef.current;

  const filteredQuirks = availableQuirks.filter(q =>
    !currentQuirks.includes(q) && q.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setFocusedIndex(-1);
  }, [search]);

  const handleKeyDown = (e) => {
    if (filteredQuirks.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filteredQuirks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      onSelect(filteredQuirks[focusedIndex]);
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
        aria-expanded={filteredQuirks.length > 0}
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
        {filteredQuirks.map((quirk, idx) => (
          <button
            key={quirk}
            role="option"
            aria-selected={idx === focusedIndex}
            onClick={() => {
              onSelect(quirk);
              setSearch('');
            }}
            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors ${
              isPositive
                ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-300 border border-yellow-800/50'
                : 'bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-800/50'
            } ${idx === focusedIndex ? 'ring-1 ring-dd-gold' : ''}`}
          >
            {quirk}
          </button>
        ))}
        {filteredQuirks.length === 0 && (
          <div className="text-center py-2 text-gray-500 text-xs sm:text-sm">No quirks found</div>
        )}
      </div>
    </div>
  );
};

export default QuirkSelector;
