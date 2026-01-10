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
    <div className={`bg-gray-800 rounded-lg p-4 border-2 ${
      validation.isComplete ? 'border-green-700' : 
      validation.hasClass ? 'border-yellow-700' : 
      'border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl font-bold text-yellow-400">Position {position}</span>
          
          <HeroSelector
            value={hero.heroClass}
            onChange={handleHeroClassChange}
            className="flex-1"
            showModdedHeroes={showModdedHeroes}
          />
          
          {hero.heroClass && (
            <button
              onClick={handleResetConfiguration}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              title="Reset Configuration"
            >
              <RotateCcw size={20} />
            </button>
          )}

          {hero.heroClass && !validation.isComplete && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400 text-sm">
              <AlertTriangle size={16} />
              <span>Incomplete Configuration</span>
            </div>
          )}

          {hero.heroClass && validation.isComplete && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded text-green-400 text-sm">
              <span>✓ Ready</span>
            </div>
          )}

          {hero.heroClass && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>

      {hero.heroClass && isExpanded && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">
                Combat Skills {isAlwaysActive ? '(7 - All Active)' : '(4)'}
              </h4>
              <div className="space-y-1">
                {heroSkills.map(skill => {
                  const isActive = activeSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={isAlwaysActive}
                      className={`w-full px-3 py-2 rounded text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-green-600 hover:bg-green-700 text-white font-semibold'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      } ${isAlwaysActive ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {!isAlwaysActive && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {activeSkills.length}/4
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Camp Skills (4 max)</h4>
              <div className="space-y-1">
                {heroCampSkills.map(skill => {
                  const isActive = activeCampSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleCampSkill(skill)}
                      className={`w-full px-3 py-2 rounded text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-purple-600 hover:bg-purple-700 text-white font-semibold'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Selected: {activeCampSkills.length}/4
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Trinkets</h4>
              <div className="space-y-2">
                <SearchableSelect
                  value={hero.trinket1 || ''}
                  onChange={(value) => updateHero('trinket1', value)}
                  options={availableTrinkets}
                  placeholder="Trinket Slot 1"
                  className="w-full"
                  showSeparator={showBackerTrinkets}
                  separatorIndex={separatorIndex}
                />
                <SearchableSelect
                  value={hero.trinket2 || ''}
                  onChange={(value) => updateHero('trinket2', value)}
                  options={availableTrinkets}
                  placeholder="Trinket Slot 2"
                  className="w-full"
                  showSeparator={showBackerTrinkets}
                  separatorIndex={separatorIndex}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Positive Quirks</h4>
              <div className="space-y-1">
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
                  className="w-full mt-2 px-3 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-sm"
                >
                  {showPositiveQuirkSelector ? 'Cancel' : 'Add Quirk'}
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
              <h4 className="font-semibold text-red-400 mb-2">Negative Quirks</h4>
              <div className="space-y-1">
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
                  className="w-full mt-2 px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
                >
                  {showNegativeQuirkSelector ? 'Cancel' : 'Add Quirk'}
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