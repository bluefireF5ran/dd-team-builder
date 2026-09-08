import React, { useMemo, useState } from 'react';
import { Search, X, RotateCcw, ClipboardCopy, Plus, Check } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import {
  ALL_HERO_NAMES,
  VANILLA_HERO_NAMES,
  MODDED_HERO_NAMES,
  getHeroDefinition,
  isVanillaHero
} from '../../utils/rankerItems';
import { getHeroImagePath } from '../../utils/imageHelper';

const MAX_SUGGESTIONS = 60;

const HeroPortrait = ({ name, className = '' }) => (
  <ImageWithFallback
    src={getHeroImagePath(name)}
    alt={name}
    className={`object-cover ${className}`}
    fallback={
      <div className={`flex items-center justify-center bg-gray-700 text-gray-400 text-xs ${className}`}>
        {name.charAt(0)}
      </div>
    }
  />
);

/**
 * The roster is the single source of truth for every ranking: adding a hero
 * also pulls in all of its skills and camp skills.
 */
const RosterManager = ({ activeHeroes, onToggleHero, onSetRoster, onReset, onNotify }) => {
  const [query, setQuery] = useState('');
  const [showModded, setShowModded] = useState(false);

  const activeSet = useMemo(() => new Set(activeHeroes), [activeHeroes]);

  const suggestions = useMemo(() => {
    const pool = showModded ? ALL_HERO_NAMES : VANILLA_HERO_NAMES;
    const q = query.trim().toLowerCase();
    const matches = q ? pool.filter((name) => name.toLowerCase().includes(q)) : pool;
    return matches.slice(0, MAX_SUGGESTIONS);
  }, [query, showModded]);

  const totalMatches = useMemo(() => {
    const pool = showModded ? ALL_HERO_NAMES : VANILLA_HERO_NAMES;
    const q = query.trim().toLowerCase();
    return q ? pool.filter((name) => name.toLowerCase().includes(q)).length : pool.length;
  }, [query, showModded]);

  const copyAsConfig = () => {
    const lines = [...activeHeroes].sort().map((name) => `  '${name.replace(/'/g, "\\'")}'`);
    const text = `export const DEFAULT_ACTIVE_HEROES = [\n${lines.join(',\n')}\n];`;
    navigator.clipboard
      .writeText(text)
      .then(() => onNotify?.('Roster copied — paste it into src/config/rankerRoster.js', 'success'))
      .catch(() => onNotify?.('Could not access the clipboard', 'error'));
  };

  const counts = useMemo(() => {
    const vanilla = activeHeroes.filter(isVanillaHero).length;
    return { vanilla, modded: activeHeroes.length - vanilla };
  }, [activeHeroes]);

  return (
    <div className="ornate-panel bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-dd-red/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-darkest text-xl text-dd-gold tracking-wide">Roster</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeHeroes.length} active — {counts.vanilla} vanilla, {counts.modded} modded. Their skills and
            camp skills are ranked too.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetRoster(VANILLA_HERO_NAMES)}
            className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            All vanilla
          </button>
          <button
            onClick={onReset}
            title="Back to the config file defaults"
            className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={copyAsConfig}
            title="Copy this roster as code for src/config/rankerRoster.js"
            className="px-3 py-1.5 text-xs rounded border border-dd-gold/50 bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold transition-colors inline-flex items-center gap-1.5"
          >
            <ClipboardCopy size={13} /> Copy as config
          </button>
        </div>
      </div>

      {/* Active roster — portraits, not a text list */}
      <div className="flex flex-wrap gap-2 mb-4 max-h-64 overflow-y-auto pr-1">
        {activeHeroes.length === 0 && (
          <p className="text-sm text-gray-500 italic py-4">
            No heroes active. Add some below to start ranking.
          </p>
        )}
        {activeHeroes.map((name) => {
          const def = getHeroDefinition(name);
          return (
            <button
              key={name}
              onClick={() => onToggleHero(name)}
              title={`Remove ${name} (${def?.skills?.length || 0} skills, ${def?.campSkills?.length || 0} camp skills)`}
              className="group relative w-16 rounded border-2 border-dd-gold/40 hover:border-dd-red-light bg-gray-900 overflow-hidden transition-colors"
            >
              <HeroPortrait name={name} className="w-full h-16" />
              <span className="block text-[9px] leading-tight text-gray-300 px-0.5 py-1 truncate">
                {name}
              </span>
              <span className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={20} className="text-dd-red-light" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Add heroes */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search heroes to add..."
              className="w-full bg-gray-900/80 text-dd-parchment pl-9 pr-3 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showModded}
              onChange={(e) => setShowModded(e.target.checked)}
              className="accent-[color:var(--dd-gold)]"
            />
            Include modded ({MODDED_HERO_NAMES.length})
          </label>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto pr-1">
          {suggestions.map((name) => {
            const isActive = activeSet.has(name);
            return (
              <button
                key={name}
                onClick={() => onToggleHero(name)}
                className={`relative rounded border-2 overflow-hidden bg-gray-900 transition-colors ${
                  isActive
                    ? 'border-dd-gold/70'
                    : 'border-gray-700 hover:border-dd-gold/50'
                }`}
                title={isVanillaHero(name) ? name : `${name} (modded)`}
              >
                <HeroPortrait name={name} className="w-full h-16 opacity-90" />
                <span className="block text-[9px] leading-tight text-gray-300 px-0.5 py-1 truncate">
                  {name}
                </span>
                <span
                  className={`absolute top-0.5 right-0.5 rounded-full p-0.5 ${
                    isActive ? 'bg-dd-gold text-gray-900' : 'bg-gray-800/80 text-gray-400'
                  }`}
                >
                  {isActive ? <Check size={11} /> : <Plus size={11} />}
                </span>
              </button>
            );
          })}
        </div>
        {totalMatches > suggestions.length && (
          <p className="text-[11px] text-gray-500 mt-2">
            Showing {suggestions.length} of {totalMatches} matches — refine the search to see more.
          </p>
        )}
      </div>
    </div>
  );
};

export default RosterManager;
