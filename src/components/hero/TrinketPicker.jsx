import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Search, PackageCheck } from 'lucide-react';
import Modal from '../common/Modal';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../../data/modded_heroes';
import { TRINKETS } from '../../data/trinkets';
import { BACKER_TRINKETS } from '../../data/backer_trinkets';
import { getRecommendedTrinkets } from '../../data/recommendations';
import { getTrinketImagePath } from '../../utils/imageHelper';
import { getTrinketEffect } from '../../data/trinketEffects';
import { getModdedTrinketEffect } from '../../data/moddedEffects';
import { trinketHover } from '../../utils/hoverInfo';
import { nameKey } from '../../utils/nameNormalizer';
import { searchEntries, searchTerms } from '../../utils/entrySearch';
import { rarityBorderStyle, rarityTone, withAlpha } from '../../utils/trinketRarity';
import ImageWithFallback from '../common/ImageWithFallback';
import HoverCard from '../common/HoverCard';

const CATEGORY_META = {
  recommended: { label: 'Recommended', text: 'text-emerald-400' },
  classSpecific: { label: 'Class Specific', text: 'text-amber-400' },
  generic: { label: 'Generic', text: 'text-gray-300' },
  moddedKickstarter: { label: 'Modded & Kickstarter', text: 'text-purple-400' }
};

// The drop tiers, in the game's own order. Everything else a trinket can be
// tagged (`CC Set`, `Crystalline`, `Kickstarter`, `Butcher's Circus`, the
// Sunstone chain's `null`...) collapses into one bucket: as a filter, "not a
// normal drop" is the distinction a player is actually making.
const RARITY_TIERS = ['Very Common', 'Common', 'Uncommon', 'Rare', 'Very Rare'];
const SPECIAL = 'Special';
const rarityBucket = (rarity) =>
  RARITY_TIERS.includes(rarity) ? rarity : SPECIAL;

const TrinketPicker = ({
  isOpen,
  onClose,
  value,
  onChange,
  heroClass,
  showBackerTrinkets,
  showModdedHeroes,
  slotLabel,
  ownedTrinkets = [],
  ownedOnly = false,
  onToggleOwnedOnly
}) => {
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState(null);

  // Matching on `nameKey` rather than the raw string, because an imported save
  // and the app can spell the same trinket differently (apostrophes, accents).
  const ownedKeys = useMemo(() => new Set(ownedTrinkets.map(nameKey)), [ownedTrinkets]);
  const canFilterByOwned = ownedKeys.size > 0;
  const filterOwned = canFilterByOwned && ownedOnly;

  useEffect(() => {
    if (isOpen) { setSearch(''); setRarity(null); }
  }, [isOpen]);

  // One description per trinket, shared by the search and the cards, so the
  // text a player reads is the text they searched.
  const describe = useCallback((name) => {
    const found = getTrinketEffect(name) || getModdedTrinketEffect(name);
    return {
      name,
      effect: found?.effect || '',
      tags: found?.rarity ? [found.rarity, rarityBucket(found.rarity)] : [SPECIAL]
    };
  }, []);

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

  // Which rarity chips to offer: only the ones some trinket in this picker
  // actually has, so no chip can lead to an empty grid.
  const rarities = useMemo(() => {
    const present = new Set();
    baseCategories.forEach((cat) => cat.items.forEach((name) => {
      const found = getTrinketEffect(name) || getModdedTrinketEffect(name);
      present.add(rarityBucket(found?.rarity));
    }));
    return [...RARITY_TIERS, SPECIAL].filter((r) => present.has(r));
  }, [baseCategories]);

  const categories = useMemo(() => {
    const q = search.trim();
    return baseCategories
      .map((cat) => {
        let rows = searchEntries(cat.items, q, describe);
        if (filterOwned) rows = rows.filter((row) => ownedKeys.has(nameKey(row.name)));
        if (rarity) {
          rows = rows.filter((row) => {
            const found = getTrinketEffect(row.name) || getModdedTrinketEffect(row.name);
            return rarityBucket(found?.rarity) === rarity;
          });
        }
        return { ...cat, rows };
      })
      .filter((cat) => cat.rows.length > 0);
  }, [baseCategories, search, filterOwned, ownedKeys, rarity, describe]);

  const resultCount = useMemo(
    () => categories.reduce((n, cat) => n + cat.rows.length, 0),
    [categories]
  );
  const isSearching = searchTerms(search).length > 0;

  return (
    // autoFocus off: the search box below carries its own, and landing there is
    // what makes the picker usable from the keyboard - Modal's default would
    // take the close button instead.
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="trinket-picker-title"
      autoFocus={false}
      panelClassName="bg-gray-800 border-2 rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
      panelStyle={{ borderColor: 'var(--dd-gold)' }}
    >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pb-3">
          <h3 id="trinket-picker-title" className="font-darkest text-lg sm:text-xl text-dd-parchment tracking-wide">
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
              placeholder="Search by name or effect - try dodge, +dodge, accuracy"
              aria-label="Search trinkets"
              className="w-full bg-gray-900 text-dd-parchment pl-8 pr-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm"
              autoFocus
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {canFilterByOwned && (
              <button
                type="button"
                onClick={onToggleOwnedOnly}
                aria-pressed={ownedOnly}
                className={`px-2.5 py-1 text-xs rounded border transition-colors inline-flex items-center gap-1.5 ${
                  ownedOnly
                    ? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-300'
                    : 'border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
                title="Show only the trinkets your imported save has"
              >
                <PackageCheck size={12} />
                Owned only ({ownedKeys.size})
              </button>
            )}
            {rarities.map((tier) => {
              // A chip wears the tier's own colour, so the filter row doubles
              // as the legend for the borders in the grid below it.
              const { colour } = rarityTone(tier);
              const on = rarity === tier;
              const known = tier !== SPECIAL;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setRarity(on ? null : tier)}
                  aria-pressed={on}
                  style={known ? {
                    borderColor: colour,
                    backgroundColor: withAlpha(colour, on ? 0.28 : 0.1),
                    color: on ? '#fff' : colour,
                  } : undefined}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    known ? '' : (on
                      ? 'border-dd-gold bg-dd-gold/15 text-dd-parchment'
                      : 'border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200')
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {(isSearching || rarity) && (
            <p className="mt-2 text-[11px] text-gray-500" role="status">
              {resultCount === 0
                ? 'No matches'
                : `${resultCount} ${resultCount === 1 ? 'trinket' : 'trinkets'}`}
              {isSearching && ' - searching names and effects'}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {categories.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              {filterOwned
                ? 'None of the trinkets you own match. Turn "Owned only" off to see the rest.'
                : 'No trinkets match your search. Names and effects are both searched, so try a stat - dodge, prot, stress - or +dodge for only the ones that grant it.'}
            </div>
          )}
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.key];
            return (
              <div key={cat.key}>
                <h4 className={`font-darkest text-xs sm:text-sm tracking-wider uppercase mb-2 ${meta.text}`}>
                  {meta.label}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {cat.rows.map(({ name, match }, idx) => {
                    const effect = getTrinketEffect(name) || getModdedTrinketEffect(name);
                    // A card that matched on its effect shows that effect in
                    // full: the clamped two lines are what hid the reason the
                    // trinket turned up at all.
                    const clamp = match?.inEffect ? '' : 'line-clamp-2';
                    return (
                    <HoverCard key={`${cat.key}-${name}-${idx}`} {...trinketHover(name)}>
                    <button
                      type="button"
                      onClick={() => { onChange(name); onClose(); }}
                      title={name}
                      // The border is the rarity, so the selected state is a
                      // ring instead of a colour: overwriting the border with
                      // gold would hide the one thing it is there to say.
                      style={rarityBorderStyle(name, { tint: 0.12 })}
                      className={`w-full flex flex-col items-center p-1.5 rounded border-2 transition-all ${
                        value === name
                          ? 'ring-2 ring-dd-gold ring-offset-2 ring-offset-gray-800'
                          : 'hover:ring-1 hover:ring-white/30'
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
                      {effect && (
                        <span className={`text-[9px] sm:text-[10px] text-center leading-tight mt-0.5 ${clamp} ${
                          match?.inEffect ? 'text-dd-gold/90' : 'text-gray-400'
                        }`}>
                          {effect.effect}
                        </span>
                      )}
                    </button>
                    </HoverCard>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
    </Modal>
  );
};

export default TrinketPicker;
