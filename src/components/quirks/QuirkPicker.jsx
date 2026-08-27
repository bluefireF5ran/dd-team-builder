import React, { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../../data/quirks';
import { DISEASES, CRIMSON_COURT_DISEASES } from '../../data/diseases';
import { getQuirkEffect } from '../../data/quirkEffects';
import { getRecommendedQuirks } from '../../data/recommendations';
import { nameMatchesSearch } from '../../utils/nameNormalizer';
import { quirkClasses } from '../../utils/quirkStyle';
import { quirkHover } from '../../utils/hoverInfo';
import HoverCard from '../common/HoverCard';

/**
 * Choosing a quirk, the way choosing a trinket already works: a modal with a
 * search box and a grid of cards, each carrying what the quirk actually does.
 *
 * The dropdown this replaces listed 91 names and nothing else, so picking one
 * meant knowing the whole roster by heart. Quirks have no art in Darkest
 * Dungeon - the effect line IS the picture.
 */

/** Sections, in the order they are offered. */
const buildSections = ({ kind, heroClass, showCrimsonCourt, taken }) => {
  const takenSet = new Set(taken || []);
  const free = (list) => list.filter((n) => !takenSet.has(n));

  if (kind === 'disease') {
    return [
      { key: 'diseases', label: 'Diseases', heading: 'text-green-400', items: free(DISEASES) },
      ...(showCrimsonCourt
        ? [{
          key: 'crimson',
          label: 'Crimson Court',
          heading: 'text-red-300',
          items: free(CRIMSON_COURT_DISEASES)
        }]
        : [])
    ];
  }

  const isPositive = kind === 'positive';
  const roster = free(isPositive ? POSITIVE_QUIRKS : NEGATIVE_QUIRKS);
  const recs = getRecommendedQuirks(heroClass);
  // Usage order, not alphabetical: the first one is the one the library
  // reaches for most, and re-sorting would throw that away.
  const recommended = (isPositive ? recs.positive : recs.negative).filter((n) => !takenSet.has(n));
  const recommendedSet = new Set(recommended);

  // The game's own physical / mental split. Whatever it classifies as neither
  // is the town and curio behaviour - Kleptomaniac, Faithless - which is a
  // real third group rather than a leftovers bucket.
  const rest = roster.filter((n) => !recommendedSet.has(n));
  const bucket = (test) => rest.filter((n) => test(getQuirkEffect(n)?.classification || null));

  return [
    { key: 'recommended', label: 'Recommended', heading: 'text-emerald-400', items: recommended },
    { key: 'physical', label: 'Physical', heading: 'text-gray-300', items: bucket((c) => c === 'physical') },
    { key: 'mental', label: 'Mental', heading: 'text-gray-300', items: bucket((c) => c === 'mental') },
    { key: 'other', label: 'In Town & At Curios', heading: 'text-gray-400', items: bucket((c) => !c) }
  ];
};

const TITLES = {
  positive: 'Positive Quirk',
  negative: 'Negative Quirk',
  disease: 'Disease'
};

const QuirkPicker = ({ isOpen, onClose, onSelect, kind, heroClass, showCrimsonCourt, taken }) => {
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

  const baseSections = useMemo(
    () => buildSections({ kind, heroClass, showCrimsonCourt, taken }),
    [kind, heroClass, showCrimsonCourt, taken]
  );

  const sections = useMemo(() => {
    const q = search.trim();
    return baseSections
      .map((s) => ({ ...s, items: q ? s.items.filter((name) => nameMatchesSearch(name, q)) : s.items }))
      .filter((s) => s.items.length > 0);
  }, [baseSections, search]);

  if (!isOpen) return null;

  const fallbackTone = kind === 'disease' ? 'disease' : kind;

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
            Select {TITLES[kind] || 'Quirk'}
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
              placeholder={`Search ${kind === 'disease' ? 'diseases' : 'quirks'}...`}
              aria-label={`Search ${kind === 'disease' ? 'diseases' : 'quirks'}`}
              className="w-full bg-gray-900 text-dd-parchment pl-8 pr-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {sections.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              No {kind === 'disease' ? 'diseases' : 'quirks'} match your search.
            </div>
          )}
          {sections.map((section) => (
            <div key={section.key}>
              <h4 className={`font-darkest text-xs sm:text-sm tracking-wider uppercase mb-2 ${section.heading}`}>
                {section.label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {section.items.map((name) => {
                  const tone = quirkClasses(name, fallbackTone);
                  const effect = getQuirkEffect(name);
                  return (
                    <HoverCard key={`${section.key}-${name}`} className="w-full" {...quirkHover(name, fallbackTone)}>
                      <button
                        type="button"
                        onClick={() => { onSelect(name); onClose(); }}
                        title={name}
                        className={`w-full h-full text-left px-2 py-1.5 rounded border-2 transition-colors ${tone.card}`}
                      >
                        <span className={`block text-xs sm:text-sm font-semibold ${tone.text}`}>{name}</span>
                        {effect?.effect && (
                          <span className="block text-[10px] sm:text-[11px] text-gray-400 leading-tight line-clamp-2 mt-0.5">
                            {effect.effect}
                          </span>
                        )}
                      </button>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuirkPicker;
