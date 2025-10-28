import React from 'react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';
import { getHeroImagePath, getSkillImagePath, getCampSkillImagePath, getTrinketImagePath } from '../../utils/imageHelper';


const PartyHeroCard = ({ hero, position }) => {
  const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];
  const maxSkills = isAlwaysActive ? 7 : 4;

  // Dividir skills en dos filas si son 7
  const firstRowSkills = activeSkills.slice(0, 4);
  const secondRowSkills = activeSkills.slice(4, 7);

  return (
    <div className="relative">
      <div className="bg-gray-700 rounded-lg p-4 border-2 border-gray-600">
        {/* Position Badge */}
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg z-10">
          <span className="text-2xl font-black text-gray-900">{position}</span>
        </div>

        {/* Hero Portrait */}
        <div className="flex flex-col items-center mb-4">
          {hero.heroClass ? (
            <>
              <img 
                src={getHeroImagePath(hero.heroClass)} 
                alt={hero.heroClass}
                className="w-[120px] h-[120px] object-contain rounded-lg border-4 border-gray-600 bg-gray-800 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-[120px] h-[120px] items-center justify-center bg-gray-600 rounded-lg border-4 border-gray-600"
                style={{display: 'none'}}
              >
                <span className="text-5xl text-gray-500">{position}</span>
              </div>
            </>
          ) : (
            <div className="w-[120px] h-[120px] flex items-center justify-center bg-gray-600 rounded-lg border-4 border-gray-600">
              <span className="text-5xl text-gray-500">{position}</span>
            </div>
          )}
          <div className="text-sm text-gray-200 font-bold mt-2 text-center px-2 py-1 bg-gray-800 rounded">
            {hero.heroClass || 'Empty'}
          </div>
        </div>

        {hero.heroClass && (
          <>
            {/* Trinkets */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Trinkets</div>
              <div className="flex justify-center gap-2">
                {[hero.trinket1, hero.trinket2].map((trinket, idx) => (
                  <div key={idx}>
                    {trinket ? (
                      <div className="relative group">
                        <img 
                          src={getTrinketImagePath(trinket)}
                          alt={trinket}
                          className="w-[60px] h-[120px] object-contain rounded border-3 border-purple-600 bg-gray-800 shadow-md"
                          title={trinket}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-[60px] h-[120px] items-center justify-center bg-purple-900/40 border-3 border-purple-600 rounded text-lg text-purple-300 font-bold"
                          style={{display: 'none'}}
                          title={trinket}
                        >
                          ?
                        </div>
                      </div>
                    ) : (
                      <div className="w-[60px] h-[120px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded">
                        <span className="text-lg text-gray-500 font-bold">-</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Skills */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Skills</div>
              <div className="space-y-1.5">
                {/* Primera fila - 4 skills */}
                <div className="flex justify-center gap-1.5">
                  {firstRowSkills.map((skill, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={getSkillImagePath(skill, hero.heroClass)}
                        alt={skill}
                        className="w-[64px] h-[64px] object-contain rounded border-3 border-green-600 bg-gray-800 shadow-md hover:scale-110 transition-transform"
                        title={skill}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-[64px] h-[64px] items-center justify-center bg-green-900/40 border-3 border-green-600 rounded text-lg text-green-300 font-bold"
                        style={{display: 'none'}}
                        title={skill}
                      >
                        ?
                      </div>
                    </div>
                  ))}
                  {!isAlwaysActive && Array(Math.max(0, 4 - firstRowSkills.length)).fill(null).map((_, idx) => (
                    <div 
                      key={`empty-skill-${idx}`}
                      className="w-[64px] h-[64px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded"
                    >
                      <span className="text-lg text-gray-500 font-bold">-</span>
                    </div>
                  ))}
                </div>

                {/* Segunda fila - 3 skills (solo para héroes con 7 skills) */}
                {isAlwaysActive && secondRowSkills.length > 0 && (
                  <div className="flex justify-center gap-1.5">
                    {secondRowSkills.map((skill, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={getSkillImagePath(skill, hero.heroClass)}
                          alt={skill}
                          className="w-[64px] h-[64px] object-contain rounded border-3 border-green-600 bg-gray-800 shadow-md hover:scale-110 transition-transform"
                          title={skill}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-[64px] h-[64px] items-center justify-center bg-green-900/40 border-3 border-green-600 rounded text-lg text-green-300 font-bold"
                          style={{display: 'none'}}
                          title={skill}
                        >
                          ?
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Camp Skills */}
            <div>
              <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Camp</div>
              <div className="flex justify-center gap-1.5">
                {activeCampSkills.slice(0, 4).map((skill, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={getCampSkillImagePath(skill, hero.heroClass)}
                      alt={skill}
                      className="w-[64px] h-[64px] object-contain rounded border-3 border-purple-600 bg-gray-800 shadow-md hover:scale-110 transition-transform"
                      title={skill}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-[64px] h-[64px] items-center justify-center bg-purple-900/40 border-3 border-purple-600 rounded text-lg text-purple-300 font-bold"
                      style={{display: 'none'}}
                      title={skill}
                    >
                      ?
                    </div>
                  </div>
                ))}
                {activeCampSkills.length === 0 ? (
                  <div className="w-full h-[64px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded">
                    <span className="text-sm text-gray-500 font-bold">None</span>
                  </div>
                ) : (
                  Array(Math.max(0, 4 - activeCampSkills.length)).fill(null).map((_, idx) => (
                    <div 
                      key={`empty-camp-${idx}`}
                      className="w-[64px] h-[64px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded"
                    >
                      <span className="text-lg text-gray-500 font-bold">-</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartyHeroCard;