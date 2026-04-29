import React, { useState, forwardRef, useMemo, useRef } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import PartyHeroCard from './PartyHeroCard';
import { analyzeSynergy } from '../../utils/synergyHelper';

const LEVEL_CONFIG = {
  good: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700/50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700/50' },
  danger: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700/50' },
};

const PartyComposition = forwardRef(({ heroes, onSwapHeroes, teamName, location }, ref) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSynergyDetails, setShowSynergyDetails] = useState(false);
  const dragOverIndexRef = useRef(null);

  const synergy = useMemo(() => analyzeSynergy(heroes), [heroes]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
      dragOverIndexRef.current = index;
    }
  };

  const handleDragLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const currentTarget = e.currentTarget;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    setDragOverIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onSwapHeroes(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleKeyDown = (e, actualIndex) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === null) {
        setSelectedIndex(actualIndex);
      } else if (selectedIndex !== actualIndex) {
        onSwapHeroes(selectedIndex, actualIndex);
        setSelectedIndex(null);
      } else {
        setSelectedIndex(null);
      }
    } else if (e.key === 'Escape') {
      setSelectedIndex(null);
    }
  };

  return (
    <div
      ref={ref}
      className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-dd-red/30 torch-border"
    >
      {/* Team info header for export */}
      {teamName && (
        <div className="text-center mb-2">
          <h2 className="font-darkest text-2xl sm:text-3xl text-dd-gold tracking-wide">{teamName}</h2>
          {location && (
            <p className="text-gray-400 text-sm italic">{location}</p>
          )}
        </div>
      )}

      <h3 className="font-darkest text-3xl sm:text-4xl mb-2 text-center text-dd-red-light tracking-wide">
        Party Composition
      </h3>
      <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
        <span className="hidden sm:inline">Drag and drop heroes to swap positions</span>
        <span className="sm:hidden">Tap and hold to reorder</span>
      </p>

      {/* Grid responsivo: 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" role="list" aria-label="Party hero positions">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          const actualIndex = heroes.length - 1 - idx;
          const isSelected = selectedIndex === actualIndex;
          return (
            <div
              key={position}
              role="listitem"
              tabIndex={0}
              aria-label={`Position ${position}: ${hero.heroClass || 'Empty'}${isSelected ? ' (selected — press Space on another position to swap)' : ''}`}
              onKeyDown={(e) => handleKeyDown(e, actualIndex)}
              draggable={!!hero.heroClass}
              onDragStart={() => handleDragStart(actualIndex)}
              onDragOver={(e) => handleDragOver(e, actualIndex)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(actualIndex)}
              onDragEnd={handleDragEnd}
              className={`cursor-grab active:cursor-grabbing transition-all duration-200 hero-card outline-none ${
                draggedIndex === actualIndex ? 'opacity-50 scale-95' : ''
              } ${
                dragOverIndex === actualIndex || isSelected ? 'ring-2 ring-dd-gold ring-offset-2 ring-offset-gray-800 rounded-lg' : ''
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

      {/* Synergy Indicator */}
      {synergy.notes.length > 0 && (() => {
        const config = LEVEL_CONFIG[synergy.level];
        const Icon = config.icon;
        return (
          <div className="mt-3 sm:mt-4">
            <button
              onClick={() => setShowSynergyDetails(!showSynergyDetails)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm transition-colors ${config.bg} ${config.color}`}
            >
              <Icon size={16} />
              <span className="font-darkest tracking-wide">
                {synergy.level === 'good' ? 'Team Synergy' : synergy.level === 'warning' ? 'Team Warnings' : 'Issues Detected'}
              </span>
              <span className="text-xs">({synergy.notes.length})</span>
            </button>
            {showSynergyDetails && (
              <div className="mt-2 space-y-1">
                {synergy.notes.map((note, idx) => (
                  <div key={idx} className={`text-xs px-3 py-1.5 rounded ${config.bg} ${config.color}`}>
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
});

export default PartyComposition;
