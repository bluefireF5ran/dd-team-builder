import React, { useEffect } from 'react';
import { Undo2, Flag, X } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import {
  getHeroImagePath,
  getSkillImagePath,
  getTrinketImagePath
} from '../../utils/imageHelper';

const isHeroCategory = (category) => category === 'heroes';
const isCompCategory = (category) => category === 'comps';

// ---------------------------------------------------------------------------
// A comp is judged as a BUILD, not as a name.
//
// Rank order is the comp -- `position = index`, front to back -- so the card
// reads top to bottom as 1-2-3-4 with the rank number stated, and every hero
// shows the three layers a party is actually built from, in the order they are
// chosen: the class and its rank, then the four skills, then the trinkets.
// Quirks ride along as text because they are the layer that changes least.
// ---------------------------------------------------------------------------

const IconRow = ({ names, srcFor, size, title }) => {
  const shown = (names || []).filter(Boolean);
  if (!shown.length) return null;
  return (
    <span className="flex flex-wrap items-center gap-1" title={`${title}: ${shown.join(', ')}`}>
      {shown.map((name, i) => (
        <ImageWithFallback
          key={`${name}-${i}`}
          src={srcFor(name)}
          alt={name}
          title={name}
          className={`${size} object-contain rounded-sm border border-gray-700/80 bg-gray-900/60`}
          fallback={
            <span
              className={`${size} flex items-center justify-center rounded-sm border border-gray-700 bg-gray-900 text-[9px] text-gray-500`}
              title={name}
            >
              {name.charAt(0)}
            </span>
          }
        />
      ))}
    </span>
  );
};

const CompRank = ({ hero, rank }) => (
  <span className="flex items-start gap-2 py-1.5 border-b border-gray-700/50 last:border-b-0">
    <span className="w-4 shrink-0 pt-1 text-[10px] font-mono text-dd-gold/70 text-right">{rank}</span>
    <ImageWithFallback
      src={getHeroImagePath(hero.heroClass)}
      alt={hero.heroClass}
      className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 object-cover rounded border border-gray-600 bg-gray-900"
      fallback={
        <span className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded border border-gray-600 bg-gray-900 text-xs text-gray-500">
          {hero.heroClass.charAt(0)}
        </span>
      }
    />
    <span className="min-w-0 flex-1 flex flex-col gap-1">
      <span className="block text-[11px] sm:text-xs text-dd-parchment leading-tight truncate">
        {hero.heroClass}
      </span>
      <IconRow
        names={hero.activeSkills}
        srcFor={(name) => getSkillImagePath(name, hero.heroClass)}
        size="w-6 h-6 sm:w-7 sm:h-7"
        title="Skills"
      />
      <IconRow
        names={[hero.trinket1, hero.trinket2]}
        srcFor={(name) => getTrinketImagePath(name, hero.heroClass)}
        size="w-5 h-5 sm:w-6 sm:h-6"
        title="Trinkets"
      />
      {!!(hero.quirks?.positive || []).length && (
        <span className="block text-[9px] text-gray-500 leading-tight truncate">
          {hero.quirks.positive.join(' · ')}
        </span>
      )}
    </span>
  </span>
);

const CompCard = ({ item, side, onPick }) => {
  const hotkey = side === 'left' ? '1' : '2';
  return (
    <button
      onClick={() => onPick(side)}
      className="group relative flex-1 min-w-0 rounded-lg border-2 border-gray-700 hover:border-dd-gold bg-gray-800/80 overflow-hidden transition-all duration-150 hover:shadow-torch hover:-translate-y-1 focus:outline-none focus:border-dd-gold text-left"
    >
      <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded border border-gray-600 bg-gray-900/80 text-gray-400 text-xs flex items-center justify-center font-mono">
        {hotkey}
      </span>
      <span className="relative z-10 flex flex-col h-full p-3 sm:p-4 pt-10">
        <span className="block text-center mb-2">
          <span className="block font-darkest text-base sm:text-xl text-dd-parchment tracking-wide leading-tight">
            {item.name}
          </span>
          <span className="block mt-0.5 text-[10px] sm:text-xs text-gray-400">{item.subtitle}</span>
        </span>
        <span className="block rounded border border-gray-700/60 bg-gray-900/40 px-2">
          {item.heroes.map((hero, i) => (
            <CompRank key={`${hero.heroClass}-${i}`} hero={hero} rank={i + 1} />
          ))}
        </span>
      </span>
    </button>
  );
};

const ContenderCard = ({ item, category, side, onPick }) => {
  if (!item) return null;
  if (isCompCategory(category)) return <CompCard item={item} side={side} onPick={onPick} />;
  const heroCard = isHeroCategory(category);
  const hotkey = side === 'left' ? '1' : '2';

  return (
    <button
      onClick={() => onPick(side)}
      className="group relative flex-1 min-w-0 rounded-lg border-2 border-gray-700 hover:border-dd-gold bg-gray-800/80 overflow-hidden transition-all duration-150 hover:shadow-torch hover:-translate-y-1 focus:outline-none focus:border-dd-gold"
    >
      {/* Faded class portrait behind non-hero items, so the card stays visual */}
      {!heroCard && item.heroImage && (
        <ImageWithFallback
          src={item.heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity"
          fallback={null}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

      <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded border border-gray-600 bg-gray-900/80 text-gray-400 text-xs flex items-center justify-center font-mono">
        {hotkey}
      </span>

      <span className="relative z-10 flex flex-col items-center justify-end gap-3 p-4 sm:p-6 h-full">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className={
            heroCard
              ? 'w-full max-w-[260px] h-[220px] sm:h-[320px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)]'
              : 'w-[150px] h-[150px] sm:w-[190px] sm:h-[190px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)] my-6 sm:my-10'
          }
          fallback={
            <span className="w-[150px] h-[150px] sm:w-[190px] sm:h-[190px] my-6 sm:my-10 flex items-center justify-center rounded border border-gray-700 bg-gray-900 text-4xl text-gray-600">
              {item.name.charAt(0)}
            </span>
          }
        />

        <span className="block text-center">
          <span className="block font-darkest text-xl sm:text-2xl text-dd-parchment tracking-wide leading-tight">
            {item.name}
          </span>
          <span className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            {!heroCard && item.heroImage && (
              <ImageWithFallback
                src={item.heroImage}
                alt=""
                aria-hidden="true"
                className="w-5 h-5 rounded-sm object-cover border border-gray-600"
                fallback={null}
              />
            )}
            {item.subtitle}
            {item.modded && (
              <span className="px-1.5 py-0.5 rounded bg-dd-red/30 border border-dd-red/50 text-[10px] text-dd-parchment">
                MOD
              </span>
            )}
          </span>
        </span>
      </span>
    </button>
  );
};

const ComparisonView = ({
  category,
  categoryLabel,
  blurb,
  pair,
  progress,
  onPick,
  onUndo,
  canUndo,
  onFinishEarly,
  onQuit
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        onPick('left');
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        onPick('right');
      } else if (e.key === 'Backspace' || e.key.toLowerCase() === 'u') {
        e.preventDefault();
        onUndo();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onQuit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPick, onUndo, onQuit]);

  if (!pair) return null;

  return (
    <div className="animate-fade-in-up">
      <div className="ornate-panel bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-dd-red/30 p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-darkest text-xl sm:text-2xl text-dd-gold tracking-wide">{blurb}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Comparison {progress.done + 1} of ~{progress.total} — ranking {categoryLabel.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <Undo2 size={13} /> Undo
            </button>
            <button
              onClick={onFinishEarly}
              className="px-3 py-1.5 text-xs rounded border border-dd-gold/50 bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold transition-colors inline-flex items-center gap-1.5"
              title="Stop here and keep the ranking as it stands"
            >
              <Flag size={13} /> Finish early
            </button>
            <button
              onClick={onQuit}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors inline-flex items-center gap-1.5"
            >
              <X size={13} /> Quit
            </button>
          </div>
        </div>

        <div className="h-2 rounded bg-gray-900 border border-gray-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-dd-red to-dd-gold transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
        <ContenderCard item={pair.left} category={category} side="left" onPick={onPick} />
        <div className="flex sm:flex-col items-center justify-center gap-2 py-1">
          <span className="font-darkest text-2xl sm:text-3xl text-dd-red-light tracking-widest">VS</span>
        </div>
        <ContenderCard item={pair.right} category={category} side="right" onPick={onPick} />
      </div>

      <p className="text-center text-[11px] text-gray-500 mt-4">
        Click a card, or use <kbd className="px-1 border border-gray-700 rounded">←</kbd>/
        <kbd className="px-1 border border-gray-700 rounded">→</kbd> ·{' '}
        <kbd className="px-1 border border-gray-700 rounded">U</kbd> undo ·{' '}
        <kbd className="px-1 border border-gray-700 rounded">Esc</kbd> quit
      </p>
    </div>
  );
};

export default ComparisonView;
