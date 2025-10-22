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
        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
      />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filteredQuirks.map(quirk => (
          <button
            key={quirk}
            onClick={() => {
              onSelect(quirk);
              setSearch('');
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm ${
              isPositive 
                ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-300'
                : 'bg-red-900/20 hover:bg-red-900/40 text-red-300'
            }`}
          >
            {quirk}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuirkSelector;