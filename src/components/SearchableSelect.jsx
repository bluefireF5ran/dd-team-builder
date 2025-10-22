import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchableSelect = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 cursor-pointer flex items-center justify-between"
        >
          <span className={value ? 'text-white' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <Search size={16} className="text-gray-400" />
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="p-2 bg-red-600 hover:bg-red-700 rounded"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-gray-700 border border-gray-600 rounded shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-600">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer text-white"
                >
                  {opt}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-gray-400">No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchableSelect;