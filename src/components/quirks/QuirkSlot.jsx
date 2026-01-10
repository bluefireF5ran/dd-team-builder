import React from 'react';
import { Lock, Unlock, X } from 'lucide-react';

const QuirkSlot = ({ quirk, isPositive, onToggleLock, isLocked, onRemove }) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const handleToggleLock = (e) => {
    e.stopPropagation();
    if (onToggleLock) {
      onToggleLock();
    }
  };

  return (
    <div className={`flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-all ${
      isPositive 
        ? 'bg-yellow-900/40 border border-yellow-700/50 hover:border-yellow-600' 
        : 'bg-red-900/40 border border-red-700/50 hover:border-red-600'
    }`}>
      <span className={`text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none ${isPositive ? 'text-yellow-300' : 'text-red-300'}`}>
        {quirk || 'Empty'}
      </span>
      <div className="flex gap-0.5 sm:gap-1 ml-1">
        {quirk && (
          <>
            <button
              onClick={handleToggleLock}
              type="button"
              className={`p-0.5 sm:p-1 rounded transition-colors ${isLocked ? (isPositive ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500 hover:text-gray-300'}`}
              title={isLocked ? 'Unlock' : 'Lock'}
            >
              {isLocked ? <Lock size={12} className="sm:w-[14px] sm:h-[14px]" /> : <Unlock size={12} className="sm:w-[14px] sm:h-[14px]" />}
            </button>
            <button
              onClick={handleRemove}
              type="button"
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
};

export default QuirkSlot;