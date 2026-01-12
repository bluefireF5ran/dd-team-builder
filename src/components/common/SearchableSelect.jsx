import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchableSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className, 
  showSeparator = false, 
  separatorIndex = 0,
  separatorLabel = "Hero Specific",
  backerStartIndex = -1
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular índices ajustados para los separadores después del filtrado
  const getOriginalIndex = (opt) => options.indexOf(opt);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  // Determinar el estilo de fondo según la categoría
  const getItemBackground = (originalIdx) => {
    if (backerStartIndex > 0 && originalIdx >= backerStartIndex) {
      return 'bg-emerald-900/20'; // Backer trinkets - verde oscuro
    }
    if (separatorIndex > 0 && originalIdx < separatorIndex) {
      return 'bg-amber-900/10'; // Hero specific - ámbar
    }
    return ''; // Generic - sin fondo
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-gray-800/80 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border-2 border-gray-700 hover:border-dd-gold/50 cursor-pointer flex items-center justify-between transition-colors text-xs sm:text-sm"
        >
          <span className={`truncate ${value ? 'text-dd-parchment' : 'text-gray-500'}`}>
            {value || placeholder}
          </span>
          <Search size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 ml-1" />
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="p-1.5 sm:p-2 bg-red-700/80 hover:bg-red-600 rounded transition-colors border border-red-600"
            type="button"
          >
            <X size={14} className="sm:w-4 sm:h-4 text-dd-parchment" />
          </button>
        )}
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-gray-800 border-2 border-gray-700 rounded shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-700">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-900 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs sm:text-sm"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {/* Mostrar separador de Hero Specific al inicio si hay hero-specific trinkets y no hay búsqueda */}
              {showSeparator && separatorIndex > 0 && !search && (
                <div className="px-2 sm:px-3 py-1 bg-amber-900/40 border-b border-amber-700/50">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider font-darkest">
                    ⚔️ {separatorLabel}
                  </span>
                </div>
              )}
              {filteredOptions.map((opt, idx) => {
                const originalIdx = getOriginalIndex(opt);
                
                // Mostrar separador de Generic después de los hero-specific
                const showGenericSeparator = showSeparator && 
                  separatorIndex > 0 && 
                  !search &&
                  originalIdx === separatorIndex &&
                  idx > 0;
                
                // Mostrar separador de Backer antes del primer backer trinket
                const showBackerSeparator = backerStartIndex > 0 &&
                  !search &&
                  originalIdx === backerStartIndex;
                
                return (
                  <React.Fragment key={opt}>
                    {showGenericSeparator && (
                      <div className="px-2 sm:px-3 py-1 bg-gray-700/50 border-y border-gray-600/50">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider font-darkest">
                          📦 Generic Trinkets
                        </span>
                      </div>
                    )}
                    {showBackerSeparator && (
                      <div className="px-2 sm:px-3 py-1 bg-emerald-900/40 border-y border-emerald-700/50">
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider font-darkest">
                          ⭐ Backer Trinkets
                        </span>
                      </div>
                    )}
                    <div
                      onClick={() => handleSelect(opt)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-700 cursor-pointer text-dd-parchment text-xs sm:text-sm transition-colors ${getItemBackground(originalIdx)}`}
                    >
                      {opt}
                    </div>
                  </React.Fragment>
                );
              })}
              {filteredOptions.length === 0 && (
                <div className="px-2 sm:px-3 py-2 text-gray-500 text-xs sm:text-sm">No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchableSelect;