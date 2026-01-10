import React, { useState } from 'react';
import PartyHeroCard from './PartyHeroCard';

const PartyComposition = ({ heroes, onSwapHeroes }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onSwapHeroes(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
      <h3 className="text-3xl font-bold mb-2 text-center text-red-600">Party Composition</h3>
      <p className="text-center text-gray-400 text-sm mb-6">Drag and drop heroes to swap positions</p>
      <div className="grid grid-cols-4 gap-6">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          const actualIndex = heroes.length - 1 - idx;
          return (
            <div
              key={position}
              draggable={!!hero.heroClass}
              onDragStart={() => handleDragStart(actualIndex)}
              onDragOver={(e) => handleDragOver(e, actualIndex)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(actualIndex)}
              onDragEnd={handleDragEnd}
              className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
                draggedIndex === actualIndex ? 'opacity-50 scale-95' : ''
              } ${
                dragOverIndex === actualIndex ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800 rounded-lg' : ''
              }`}
            >
              <PartyHeroCard
                hero={hero}
                position={position}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartyComposition;