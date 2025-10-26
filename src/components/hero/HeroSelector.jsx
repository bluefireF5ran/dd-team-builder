import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { getHeroImagePath } from '../../utils/imageHelper';

const HeroSelector = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const heroOptions = Object.keys(HERO_CLASSES);
  const filteredOptions = heroOptions.filter(hero => 
    hero.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (hero) => {
    onChange(hero);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative flex-1">
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 cursor-pointer flex items-center justify-between min-h-[42px]"
        >
          <div className="flex items-center gap-2">
            {value && (
              <img 
                src={getHeroImagePath(value)}
                alt={value}
                className="w-8 h-8 object-contain rounded border border-gray-600"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span className={value ? 'text-white' : 'text-gray-400'}>
              {value || 'Select Hero Class'}
            </span>
          </div>
          <Search size={16} className="text-gray-400" />
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            type="button"
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
          <div className="absolute z-20 mt-1 w-full bg-gray-700 border border-gray-600 rounded shadow-lg max-h-96 overflow-hidden">
            <div className="p-2 border-b border-gray-600 sticky top-0 bg-gray-700">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hero..."
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-80">
              {filteredOptions.map(hero => (
                <div
                  key={hero}
                  onClick={() => handleSelect(hero)}
                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer text-white flex items-center gap-3 transition-colors"
                >
                  <img 
                    src={getHeroImagePath(hero)}
                    alt={hero}
                    className="w-10 h-10 object-contain rounded border border-gray-600"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span className="font-medium">{hero}</span>
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-gray-400 text-center">No heroes found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSelector;