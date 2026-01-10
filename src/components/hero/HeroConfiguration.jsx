import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../../data/modded_heroes'; 
import { TRINKETS } from '../../data/trinkets';
import { BACKER_TRINKETS } from '../../data/backer_trinkets';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../../data/quirks';
import { validateHero } from '../../utils/validation';
import SearchableSelect from '../common/SearchableSelect';
import HeroSelector from './HeroSelector';
import QuirkSlot from '../quirks/QuirkSlot';
import QuirkSelector from '../quirks/QuirkSelector';

const HeroConfiguration = ({ hero, position, onUpdate, showBackerTrinkets, showModdedHeroes }) => { 
  const [showPositiveQuirkSelector, setShowPositiveQuirkSelector] = useState(false);
  const [showNegativeQuirkSelector, setShowNegativeQuirkSelector] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const allHeroClasses = useMemo(() => {
    if (showModdedHeroes) {
      return { ...HERO_CLASSES, ...MODDED_HERO_CLASSES };
    }
    return HERO_CLASSES;
  }, [showModdedHeroes]);

  const validation = validateHero(hero);
  const heroData = allHeroClasses[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;

  // Auto-activar todas las skills si el héroe tiene alwaysActive
  useEffect(() => {
    if (hero.heroClass && isAlwaysActive && heroData) {
      const allSkills = heroData.skills || [];
      const currentSkills = hero.activeSkills || [];
      
      // Solo actualizar si no están todas activas
      if (currentSkills.length !== allSkills.length) {
        onUpdate({ ...hero, activeSkills: allSkills });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero.heroClass, isAlwaysActive]);

  const updateHero = (field, value) => {
    onUpdate({ ...hero, [field]: value });
  };

  const handleHeroClassChange = (newClass) => {
    if (hero.heroClass && hero.heroClass !== newClass) {
      const hasConfiguration = 
        (hero.activeSkills && hero.activeSkills.length > 0) ||
        (hero.activeCampSkills && hero.activeCampSkills.length > 0) ||
        hero.trinket1 || hero.trinket2 ||
        (hero.quirks?.positive && hero.quirks.positive.length > 0) ||
        (hero.quirks?.negative && hero.quirks.negative.length > 0);

      if (hasConfiguration) {
        const confirmed = window.confirm(
          'Changing hero class will reset all configuration (skills, camp skills, trinkets, and quirks). Continue?'
        );
        if (!confirmed) {
          return;
        }
      }
    }

    // Si el nuevo héroe tiene alwaysActive, activar todas las skills
    const newHeroData = allHeroClasses[newClass]; // ← Debe ser allHeroClasses
    const activeSkills = newHeroData?.alwaysActive ? (newHeroData.skills || []) : [];

    onUpdate({
      heroClass: newClass,
      activeSkills: activeSkills,
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] }
    });
  };

  const handleResetConfiguration = () => {
    const confirmed = window.confirm(
      'This will reset all configuration for this hero (skills, camp skills, trinkets, and quirks). Continue?'
    );
    if (confirmed) {
      onUpdate({
        heroClass: '',
        activeSkills: [],
        activeCampSkills: [],
        trinket1: '',
        trinket2: '',
        quirks: { positive: [], negative: [] },
        lockedQuirks: { positive: [], negative: [] }
      });
    }
  };

  const toggleSkill = (skill) => {
    // Si es alwaysActive, no permitir toggle
    if (isAlwaysActive) return;

    const activeSkills = hero.activeSkills || [];
    const newActive = activeSkills.includes(skill)
      ? activeSkills.filter(s => s !== skill)
      : activeSkills.length < 4
      ? [...activeSkills, skill]
      : activeSkills;
    updateHero('activeSkills', newActive);
  };

  const toggleCampSkill = (skill) => {
    const activeCamp = hero.activeCampSkills || [];
    const newActive = activeCamp.includes(skill)
      ? activeCamp.filter(s => s !== skill)
      : activeCamp.length < 4
      ? [...activeCamp, skill]
      : activeCamp;
    updateHero('activeCampSkills', newActive);
  };

  const addQuirk = (quirk, isPositive) => {
    const quirks = hero.quirks || { positive: [], negative: [] };
    const type = isPositive ? 'positive' : 'negative';
    const current = quirks[type] || [];
    
    if (current.length < 5 && !current.includes(quirk)) {
      updateHero('quirks', { ...quirks, [type]: [...current, quirk] });
    }
    
    if (isPositive) setShowPositiveQuirkSelector(false);
    else setShowNegativeQuirkSelector(false);
  };

  const removeQuirk = (quirk, isPositive) => {
    const quirks = hero.quirks || { positive: [], negative: [] };
    const locks = hero.lockedQuirks || { positive: [], negative: [] };
    const type = isPositive ? 'positive' : 'negative';
    
    // Update both quirks and lockedQuirks in a single update to avoid race conditions
    onUpdate({
      ...hero,
      quirks: {
        ...quirks,
        [type]: quirks[type].filter(q => q !== quirk)
      },
      lockedQuirks: {
        ...locks,
        [type]: locks[type].filter(q => q !== quirk)
      }
    });
  };

  const toggleQuirkLock = (quirk, isPositive) => {
    const locks = hero.lockedQuirks || { positive: [], negative: [] };
    const type = isPositive ? 'positive' : 'negative';
    const current = locks[type] || [];
    
    const newLocks = current.includes(quirk)
      ? current.filter(q => q !== quirk)
      : current.length < 3
      ? [...current, quirk]
      : current;
    
    updateHero('lockedQuirks', { ...locks, [type]: newLocks });
  };

  // Combinar trinkets normales, backer y modded
  const availableTrinkets = useMemo(() => {
    let trinkets = [...TRINKETS];
    
    if (showBackerTrinkets) {
      trinkets = [...trinkets, ...BACKER_TRINKETS];
    }
    
    // Añadir trinkets específicos de clase modded
    if (hero.heroClass && MODDED_HERO_CLASSES[hero.heroClass]) {
      const moddedHero = MODDED_HERO_CLASSES[hero.heroClass];
      if (moddedHero.classSpecificTrinkets) {
        trinkets = [...trinkets, ...moddedHero.classSpecificTrinkets];
      }
    }
    
    // Añadir trinkets generales modded
    if (showModdedHeroes) {
      trinkets = [...trinkets, ...MODDED_GENERAL_TRINKETS];
    }
    
    return trinkets;
  }, [showBackerTrinkets, showModdedHeroes, hero.heroClass]);

  const separatorIndex = showBackerTrinkets ? TRINKETS.length : 0;

  const heroSkills = heroData?.skills || [];
  const heroCampSkills = heroData?.campSkills || [];
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];
  const quirks = hero.quirks || { positive: [], negative: [] };
  const lockedQuirks = hero.lockedQuirks || { positive: [], negative: [] };

  const positiveSlots = Array(5).fill(null).map((_, i) => quirks.positive[i] || null);
  const negativeSlots = Array(5).fill(null).map((_, i) => quirks.negative[i] || null);

  return (
    <div className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 sm:p-4 border-2 transition-all duration-300 ${
      validation.isComplete ? 'border-green-700/80 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
      validation.hasClass ? 'border-yellow-700/80' : 
      'border-gray-700'
    }`}>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
          <span className="text-lg sm:text-2xl font-bold text-dd-gold font-darkest tracking-wide">#{position}</span>
          
          <HeroSelector
            value={hero.heroClass}
            onChange={handleHeroClassChange}
            className="flex-1 min-w-[150px]"
            showModdedHeroes={showModdedHeroes}
          />
          
          {hero.heroClass && (
            <button
              onClick={handleResetConfiguration}
              className="p-1.5 sm:p-2 bg-red-700/80 hover:bg-red-600 text-dd-parchment rounded transition-colors border border-red-600"
              title="Reset Configuration"
            >
              <RotateCcw size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {hero.heroClass && !validation.isComplete && (
            <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400 text-xs sm:text-sm">
              <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">Incomplete</span>
            </div>
          )}

          {hero.heroClass && validation.isComplete && (
            <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-900/30 border border-green-700/50 rounded text-green-400 text-xs sm:text-sm">
              <span>✓</span>
              <span className="hidden lg:inline">Ready</span>
            </div>
          )}

          {hero.heroClass && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors ml-auto sm:ml-0"
            >
              {isExpanded ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>
      </div>

      {hero.heroClass && isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-dd-parchment mb-2 text-base sm:text-lg font-darkest tracking-wide">
                Combat Skills {isAlwaysActive ? '(7)' : '(4)'}
              </h4>
              <div className="space-y-1 max-h-[200px] sm:max-h-none overflow-y-auto">
                {heroSkills.map(skill => {
                  const isActive = activeSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={isAlwaysActive}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-green-700/80 hover:bg-green-600 text-dd-parchment font-semibold border border-green-600'
                          : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 border border-gray-600'
                      } ${isAlwaysActive ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {!isAlwaysActive && (
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  Selected: {activeSkills.length}/4
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Camp Skills (4)</h4>
              <div className="space-y-1 max-h-[150px] sm:max-h-none overflow-y-auto">
                {heroCampSkills.map(skill => {
                  const isActive = activeCampSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleCampSkill(skill)}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-purple-700/80 hover:bg-purple-600 text-dd-parchment font-semibold border border-purple-600'
                          : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 border border-gray-600'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                Selected: {activeCampSkills.length}/4
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-amber-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Trinkets</h4>
              <div className="space-y-2">
                <SearchableSelect
                  value={hero.trinket1 || ''}
                  onChange={(value) => updateHero('trinket1', value)}
                  options={availableTrinkets}
                  placeholder="Trinket 1"
                  className="w-full"
                  showSeparator={showBackerTrinkets}
                  separatorIndex={separatorIndex}
                />
                <SearchableSelect
                  value={hero.trinket2 || ''}
                  onChange={(value) => updateHero('trinket2', value)}
                  options={availableTrinkets}
                  placeholder="Trinket 2"
                  className="w-full"
                  showSeparator={showBackerTrinkets}
                  separatorIndex={separatorIndex}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Positive Quirks</h4>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {positiveSlots.map((quirk, idx) => (
                  <QuirkSlot
                    key={`positive-${idx}-${quirk || 'empty'}`}
                    quirk={quirk}
                    isPositive={true}
                    isLocked={quirk && lockedQuirks.positive.includes(quirk)}
                    onToggleLock={() => {
                      if (quirk) toggleQuirkLock(quirk, true);
                    }}
                    onRemove={() => {
                      if (quirk) removeQuirk(quirk, true);
                    }}
                  />
                ))}
              </div>
              {quirks.positive.length < 5 && (
                <button
                  onClick={() => setShowPositiveQuirkSelector(!showPositiveQuirkSelector)}
                  className="w-full mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-700/80 hover:bg-yellow-600 text-dd-parchment rounded text-xs sm:text-sm border border-yellow-600 transition-colors"
                >
                  {showPositiveQuirkSelector ? 'Cancel' : '+ Add'}
                </button>
              )}
              {showPositiveQuirkSelector && (
                <div className="mt-2">
                  <QuirkSelector
                    availableQuirks={POSITIVE_QUIRKS}
                    currentQuirks={quirks.positive}
                    onSelect={(q) => addQuirk(q, true)}
                    isPositive={true}
                  />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-red-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Negative Quirks</h4>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {negativeSlots.map((quirk, idx) => (
                  <QuirkSlot
                    key={`negative-${idx}-${quirk || 'empty'}`}
                    quirk={quirk}
                    isPositive={false}
                    isLocked={quirk && lockedQuirks.negative.includes(quirk)}
                    onToggleLock={() => {
                      if (quirk) toggleQuirkLock(quirk, false);
                    }}
                    onRemove={() => {
                      if (quirk) removeQuirk(quirk, false);
                    }}
                  />
                ))}
              </div>
              {quirks.negative.length < 5 && (
                <button
                  onClick={() => setShowNegativeQuirkSelector(!showNegativeQuirkSelector)}
                  className="w-full mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-700/80 hover:bg-red-600 text-dd-parchment rounded text-xs sm:text-sm border border-red-600 transition-colors"
                >
                  {showNegativeQuirkSelector ? 'Cancel' : '+ Add'}
                </button>
              )}
              {showNegativeQuirkSelector && (
                <div className="mt-2">
                  <QuirkSelector
                    availableQuirks={NEGATIVE_QUIRKS}
                    currentQuirks={quirks.negative}
                    onSelect={(q) => addQuirk(q, false)}
                    isPositive={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroConfiguration;