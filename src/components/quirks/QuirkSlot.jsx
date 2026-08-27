import React from 'react';
import { Lock, Unlock, X } from 'lucide-react';
import { quirkClasses } from '../../utils/quirkStyle';
import { quirkHover } from '../../utils/hoverInfo';
import HoverCard from '../common/HoverCard';

/**
 * One filled or empty quirk row. `tone` is the list it belongs to (positive,
 * negative, disease); the quirk's own name can override it - a prismatic quirk
 * sits in the positive list but draws blue.
 */
const QuirkSlot = ({ quirk, tone = 'positive', onToggleLock, isLocked, onRemove, canLock = true }) => {
  const style = quirkClasses(quirk, tone);

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleToggleLock = (e) => {
    e.stopPropagation();
    onToggleLock?.();
  };

  const row = (
    <div className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded border transition-all ${
      quirk ? style.slot : 'bg-gray-800/40 border-gray-700/50'
    }`}>
      <span className={`text-sm sm:text-base truncate max-w-[100px] sm:max-w-none ${quirk ? style.text : 'text-gray-600'}`}>
        {quirk || 'Empty'}
      </span>
      <div className="flex gap-0.5 sm:gap-1 ml-1">
        {quirk && (
          <>
            {canLock && (
              <button
                onClick={handleToggleLock}
                type="button"
                aria-label={isLocked ? `Unlock ${quirk}` : `Lock ${quirk}`}
                className={`p-0.5 sm:p-1 rounded transition-colors ${isLocked ? style.text : 'text-gray-500 hover:text-gray-300'}`}
                title={isLocked ? 'Unlock' : 'Lock'}
              >
                {isLocked ? <Lock size={12} className="sm:w-[14px] sm:h-[14px]" /> : <Unlock size={12} className="sm:w-[14px] sm:h-[14px]" />}
              </button>
            )}
            <button
              onClick={handleRemove}
              type="button"
              aria-label={`Remove ${quirk}`}
              className="p-0.5 sm:p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove"
            >
              <X size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // An empty slot has nothing to say, and HoverCard renders its child untouched
  // when there is nothing worth showing anyway.
  if (!quirk) return row;
  return <HoverCard className="w-full" {...quirkHover(quirk, tone)}>{row}</HoverCard>;
};

export default QuirkSlot;
