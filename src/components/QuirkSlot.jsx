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
    <div className={`flex items-center justify-between px-3 py-2 rounded ${
      isPositive ? 'bg-yellow-900/40 border border-yellow-700/50' : 'bg-red-900/40 border border-red-700/50'
    }`}>
      <span className={`text-sm ${isPositive ? 'text-yellow-300' : 'text-red-300'}`}>
        {quirk || 'Empty Slot'}
      </span>
      <div className="flex gap-1">
        {quirk && (
          <>
            <button
              onClick={handleToggleLock}
              type="button"
              className={`p-1 rounded ${isLocked ? (isPositive ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'}`}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={handleRemove}
              type="button"
              className="p-1 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuirkSlot;