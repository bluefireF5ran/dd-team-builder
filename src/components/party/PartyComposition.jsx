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
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-dd-red/30 torch-border">
      <h3 className="font-darkest text-2xl sm:text-3xl mb-2 text-center text-dd-red-light tracking-wide">
        Party Composition
      </h3>
      <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
        <span className="hidden sm:inline">Drag and drop heroes to swap positions</span>
        <span className="sm:hidden">Tap and hold to reorder</span>
      </p>
      
      {/* Grid responsivo: 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
              className={`cursor-grab active:cursor-grabbing transition-all duration-200 hero-card ${
                draggedIndex === actualIndex ? 'opacity-50 scale-95' : ''
              } ${
                dragOverIndex === actualIndex ? 'ring-2 ring-dd-gold ring-offset-2 ring-offset-gray-800 rounded-lg' : ''
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