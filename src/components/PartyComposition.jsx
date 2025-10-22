import React from 'react';
import { HERO_CLASSES } from '../data/heroes';
import { validateHero } from '../utils/validation';
import StatusBadge from './StatusBadge';
import TrinketDisplay from './TrinketDisplay';

const PartyComposition = ({ heroes }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border-2 border-gray-700">
      <h3 className="text-xl font-semibold mb-3 text-center">Party Composition</h3>
      <div className="grid grid-cols-4 gap-4">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          const heroData = HERO_CLASSES[hero.heroClass];
          const heroImage = heroData?.image;
          const validation = validateHero(hero);
          const quirks = hero.quirks || { positive: [], negative: [] };

          return (
            <div key={position} className="text-center">
              <div className={`bg-gray-700 rounded-lg p-4 border-2 ${
                validation.isComplete ? 'border-green-600' : 
                validation.hasClass ? 'border-yellow-600' : 
                'border-gray-600'
              } flex flex-col items-center justify-center min-h-[280px]`}>
                <div className="text-lg font-bold text-yellow-400 mb-2">Position {position}</div>
                
                {heroImage ? (
                  <img 
                    src={`/images/heroes/${heroImage}`} 
                    alt={hero.heroClass}
                    className="w-24 h-24 object-contain mb-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 mb-2 flex items-center justify-center bg-gray-600 rounded">
                    <span className="text-4xl text-gray-500">{position}</span>
                  </div>
                )}
                
                <div className="text-sm text-gray-300 font-semibold mb-3">
                  {hero.heroClass || 'Empty'}
                </div>

                {hero.heroClass && (
                  <div className="w-full space-y-2">
                    <StatusBadge 
                      count={validation.skillsCount} 
                      max={4} 
                      label="Skills" 
                      type="skills"
                    />
                    
                    <StatusBadge 
                      count={validation.campSkillsCount} 
                      max={4} 
                      label="Camp" 
                      type="optional"
                    />
                    
                    <StatusBadge 
                      count={validation.trinketCount} 
                      max={2} 
                      label="Trinkets" 
                      type="optional"
                    />

                    <div className="flex gap-2 justify-center">
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-900/40 text-yellow-300 text-xs">
                        <span className="font-semibold">{quirks.positive.length}</span>
                        <span>+</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-900/40 text-red-300 text-xs">
                        <span className="font-semibold">{quirks.negative.length}</span>
                        <span>-</span>
                      </div>
                    </div>

                    <TrinketDisplay trinket1={hero.trinket1} trinket2={hero.trinket2} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartyComposition;