import React, { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../../data/modded_heroes';
import { TRINKETS } from '../../data/trinkets';
import { BACKER_TRINKETS } from '../../data/backer_trinkets';
import { getRecommendedTrinkets } from '../../data/recommendations';
import { getTrinketImagePath } from '../../utils/imageHelper';
import ImageWithFallback from '../common/ImageWithFallback';

const CATEGORY_META = {
  recommended: { label: 'Recommended', text: 'text-emerald-400' },
  classSpecific: { label: 'Class Specific', text: 'text-amber-400' },
  generic: { label: 'Generic', text: 'text-gray-300' },
  moddedKickstarter: { label: 'Modded & Kickstarter', text: 'text-purple-400' }
};

const TrinketPicker = ({
  isOpen,
  onClose,
  value,
  onChange,
  heroClass,
  showBackerTrinkets,
  showModdedHeroes,
  slotLabel
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setSearch('');
  }, [isOpen]);

  const baseCategories = useMemo(() => {
    const recommended = getRecommendedTrinkets(heroClass);
    const classSpecific = [
      ...(HERO_CLASSES[heroClass]?.classSpecificTrinkets || []),
      ...(showModdedHeroes ? (MODDED_HERO_CLASSES[heroClass]?.classSpecificTrinkets || []) : [])
    ];
    const generic = [...TRINKETS];
    const moddedKickstarter = [
      ...(showModdedHeroes ? MODDED_GENERAL_TRINKETS : []),
      ...(showBackerTrinkets ? BACKER_TRINKETS : [])
    ];
    return [
      { key: 'recommended', items: recommended },
      { key: 'classSpecific', items: classSpecific },
      { key: 'generic', items: generic },
      { key: 'moddedKickstarter', items: moddedKickstarter }
    ];
  }, [heroClass, showBackerTrinkets, showModdedHeroes]);

  const categories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseCategories
      .map((cat) => ({
        ...cat,
        items: q ? cat.items.filter((name) => name.toLowerCase().includes(q)) : cat.items
      }))
      .filter((cat) => cat.items.length > 0);
  }, [baseCategories, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pb-3">
          <h3 className="font-darkest text-lg sm:text-xl text-dd-parchment tracking-wide">
            Select {slotLabel}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-dd-parchment transition-colors"
            aria-label="Close"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trinkets..."
              aria-label="Search trinkets"
              className="w-full bg-gray-900 text-dd-parchment pl-8 pr-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {categories.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">No trinkets match your search.</div>
          )}
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.key];
            return (
              <div key={cat.key}>
                <h4 className={`font-darkest text-xs sm:text-sm tracking-wider uppercase mb-2 ${meta.text}`}>
                  {meta.label}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {cat.items.map((name, idx) => (
                    <button
                      key={`${cat.key}-${name}-${idx}`}
                      type="button"
                      onClick={() => { onChange(name); onClose(); }}
                      title={name}
                      className={`flex flex-col items-center p-1.5 rounded border-2 transition-colors ${
                        value === name ? 'border-dd-gold bg-dd-gold/10' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <ImageWithFallback
                        src={getTrinketImagePath(name, heroClass)}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-16 sm:w-14 sm:h-20 object-contain"
                        fallback={
                          <div className="w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center bg-amber-900/30 text-amber-300 text-[10px]">
                            ?
                          </div>
                        }
                      />
                      <span className="text-[10px] sm:text-xs text-dd-parchment text-center mt-1 line-clamp-2">
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrinketPicker;
