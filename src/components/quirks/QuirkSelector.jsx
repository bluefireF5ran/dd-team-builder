import React, { useState } from 'react';

const QuirkSelector = ({ availableQuirks, onSelect, isPositive, currentQuirks }) => {
  const [search, setSearch] = useState('');
  
  const filteredQuirks = availableQuirks.filter(q => 
    !currentQuirks.includes(q) && q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search quirks..."
        className="w-full bg-gray-900 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs sm:text-sm"
      />
      <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1">
        {filteredQuirks.map(quirk => (
          <button
            key={quirk}
            onClick={() => {
              onSelect(quirk);
              setSearch('');
            }}
            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors ${
              isPositive 
                ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-300 border border-yellow-800/50'
                : 'bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-800/50'
            }`}
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