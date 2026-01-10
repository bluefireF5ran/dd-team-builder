import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';
import { getHeroImagePath } from '../../utils/imageHelper';

const HeroSelector = ({ value, onChange, className, showModdedHeroes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Combinar héroes vanilla y modded
  const allHeroes = useMemo(() => {
    const vanilla = Object.keys(HERO_CLASSES);
    if (showModdedHeroes) {
      const modded = Object.keys(MODDED_HERO_CLASSES);
      return { vanilla, modded };
    }
    return { vanilla, modded: [] };
  }, [showModdedHeroes]);

  const filteredVanilla = allHeroes.vanilla.filter(hero => 
    hero.toLowerCase().includes(search.toLowerCase())
  );

  const filteredModded = allHeroes.modded.filter(hero => 
    hero.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (hero) => {
    onChange(hero);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative flex-1">
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-gray-800/80 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border-2 border-gray-700 hover:border-dd-gold/50 cursor-pointer flex items-center justify-between min-h-[38px] sm:min-h-[42px] transition-colors"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            {value && (
              <img 
                src={getHeroImagePath(value)}
                alt={value}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded border border-gray-600"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span className={`text-xs sm:text-sm font-darkest ${value ? 'text-dd-parchment' : 'text-gray-500'}`}>
              {value || 'Select Hero'}
            </span>
          </div>
          <Search size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-gray-800 border-2 border-gray-700 rounded shadow-lg max-h-80 sm:max-h-96 overflow-hidden">
            <div className="p-2 border-b border-gray-700 bg-gray-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hero..."
                className="w-full bg-gray-900 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs sm:text-sm"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-64 sm:max-h-80">
              {/* Vanilla Heroes */}
              {filteredVanilla.length > 0 && (
                <div>
                  {showModdedHeroes && filteredModded.length > 0 && (
                    <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-700 border-b border-gray-600">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider font-darkest">
                        Vanilla Heroes
                      </span>
                    </div>
                  )}
                  {filteredVanilla.map(hero => (
                    <div
                      key={hero}
                      onClick={() => handleSelect(hero)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-700 cursor-pointer text-dd-parchment flex items-center gap-2 sm:gap-3 transition-colors"
                    >
                      <img 
                        src={getHeroImagePath(hero)}
                        alt={hero}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded border border-gray-600"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="font-medium text-xs sm:text-sm font-darkest">{hero}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Modded Heroes */}
              {showModdedHeroes && filteredModded.length > 0 && (
                <div>
                  <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-900/50 border-y border-purple-700/50">
                    <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-wider font-darkest">
                      🧩 Modded Heroes
                    </span>
                  </div>
                  {filteredModded.map(hero => (
                    <div
                      key={hero}
                      onClick={() => handleSelect(hero)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-700 cursor-pointer text-dd-parchment flex items-center gap-2 sm:gap-3 transition-colors"
                    >
                      <img 
                        src={getHeroImagePath(hero)}
                        alt={hero}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded border border-purple-600"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="font-medium text-xs sm:text-sm font-darkest">{hero}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredVanilla.length === 0 && filteredModded.length === 0 && (
                <div className="px-3 py-4 text-gray-500 text-center text-xs sm:text-sm">No heroes found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSelector;