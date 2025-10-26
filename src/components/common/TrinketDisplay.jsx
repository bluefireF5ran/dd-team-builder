import React from 'react';

const TrinketDisplay = ({ trinket1, trinket2 }) => {
  if (!trinket1 && !trinket2) return null;

  return (
    <div className="flex gap-1 mt-2 justify-center">
      {trinket1 && (
        <div className="bg-purple-900/40 border border-purple-700/50 px-2 py-1 rounded text-xs text-purple-300 truncate max-w-[100px]" title={trinket1}>
          {trinket1}
        </div>
      )}
      {trinket2 && (
        <div className="bg-purple-900/40 border border-purple-700/50 px-2 py-1 rounded text-xs text-purple-300 truncate max-w-[100px]" title={trinket2}>
          {trinket2}
        </div>
      )}
    </div>
  );
};

export default TrinketDisplay;