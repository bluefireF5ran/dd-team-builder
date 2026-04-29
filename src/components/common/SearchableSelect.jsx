import React, { useState, useRef, useCallback } from 'react';
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Build index map once for O(1) lookup instead of O(n) indexOf per item
  const optionIndexMap = React.useMemo(() => {
    const map = new Map();
    options.forEach((opt, idx) => map.set(opt, idx));
    return map;
  }, [options]);

  const getOriginalIndex = (opt) => optionIndexMap.get(opt);

  const handleSelect = useCallback((option) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
    setFocusedIndex(-1);
  }, [onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  }, [onChange]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearch('');
    setFocusedIndex(-1);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setFocusedIndex(-1);
  }, []);

  const handleListKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = Math.min(prev + 1, filteredOptions.length - 1);
        setTimeout(() => {
          const items = listRef.current?.querySelectorAll('[role="option"]');
          items?.[next]?.scrollIntoView({ block: 'nearest' });
        }, 0);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = Math.max(prev - 1, 0);
        setTimeout(() => {
          const items = listRef.current?.querySelectorAll('[role="option"]');
          items?.[next]?.scrollIntoView({ block: 'nearest' });
        }, 0);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }, [filteredOptions, focusedIndex, handleClose, handleSelect]);

  const listboxId = useRef(`listbox-${Math.random().toString(36).slice(2, 8)}`).current;

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
          onClick={handleOpen}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-label={placeholder || 'Select an option'}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (isOpen) handleClose();
              else handleOpen();
            }
          }}
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
            onClick={handleClose}
          />
          <div className="absolute z-20 mt-1 w-full bg-gray-800 border-2 border-gray-700 rounded shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-700">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setFocusedIndex(-1); }}
                onKeyDown={handleListKeyDown}
                placeholder="Search..."
                aria-label="Search options"
                className="w-full bg-gray-900 text-dd-parchment px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs sm:text-sm"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48" role="listbox" id={listboxId} ref={listRef}>
              {/* Mostrar separador de Hero Specific al inicio si hay hero-specific trinkets y no hay búsqueda */}
              {showSeparator && separatorIndex > 0 && !search && (
                <div className="px-2 sm:px-3 py-1 bg-amber-900/40 border-b border-amber-700/50">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider font-darkest">
                    <span aria-hidden="true">⚔️</span> {separatorLabel}
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
                          <span aria-hidden="true">📦</span> Generic Trinkets
                        </span>
                      </div>
                    )}
                    {showBackerSeparator && (
                      <div className="px-2 sm:px-3 py-1 bg-emerald-900/40 border-y border-emerald-700/50">
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider font-darkest">
                          <span aria-hidden="true">⭐</span> Backer Trinkets
                        </span>
                      </div>
                    )}
                    <div
                      onClick={() => handleSelect(opt)}
                      role="option"
                      aria-selected={value === opt}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-dd-parchment text-xs sm:text-sm transition-colors ${getItemBackground(originalIdx)} ${
                        idx === focusedIndex
                          ? 'bg-gray-600 ring-1 ring-dd-gold/50'
                          : 'hover:bg-gray-700'
                      }`}
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

export default React.memo(SearchableSelect);