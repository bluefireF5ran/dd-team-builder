import React from 'react';
import { HERO_CLASSES } from '../data/heroes';
import { getHeroImagePath, getSkillImagePath, getCampSkillImagePath, getTrinketImagePath } from '../utils/imageHelper';

const PartyComposition = ({ heroes }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
      <h3 className="text-3xl font-bold mb-6 text-center text-red-600">Party Composition</h3>
      <div className="grid grid-cols-4 gap-6">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          const heroData = HERO_CLASSES[hero.heroClass];
          const activeSkills = hero.activeSkills || [];
          const activeCampSkills = hero.activeCampSkills || [];

          return (
            <div key={position} className="relative">
              <div className="bg-gray-700 rounded-lg p-4 border-2 border-gray-600">
                {/* Position Badge - Top Right Corner */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg z-10">
                  <span className="text-2xl font-black text-gray-900">{position}</span>
                </div>

                {/* Hero Portrait and Name */}
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
                    {/* Trinkets Row */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Trinkets</div>
                      <div className="flex justify-center gap-2">
                        {/* Trinket 1 */}
                        {hero.trinket1 ? (
                          <div className="relative group">
                            <img 
                              src={getTrinketImagePath(hero.trinket1)}
                              alt={hero.trinket1}
                              className="w-[60px] h-[120px] object-contain rounded border-3 border-purple-600 bg-gray-800 shadow-md"
                              title={hero.trinket1}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-[60px] h-[120px] items-center justify-center bg-purple-900/40 border-3 border-purple-600 rounded text-lg text-purple-300 font-bold"
                              style={{display: 'none'}}
                              title={hero.trinket1}
                            >
                              ?
                            </div>
                          </div>
                        ) : (
                          <div className="w-[60px] h-[120px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded">
                            <span className="text-lg text-gray-500 font-bold">-</span>
                          </div>
                        )}

                        {/* Trinket 2 */}
                        {hero.trinket2 ? (
                          <div className="relative group">
                            <img 
                              src={getTrinketImagePath(hero.trinket2)}
                              alt={hero.trinket2}
                              className="w-[60px] h-[120px] object-contain rounded border-3 border-purple-600 bg-gray-800 shadow-md"
                              title={hero.trinket2}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-[60px] h-[120px] items-center justify-center bg-purple-900/40 border-3 border-purple-600 rounded text-lg text-purple-300 font-bold"
                              style={{display: 'none'}}
                              title={hero.trinket2}
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
                    </div>

                    {/* Combat Skills */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Skills</div>
                      <div className="flex justify-center gap-1.5">
                        {activeSkills.slice(0, 4).map((skill, idx) => (
                          <div 
                            key={idx}
                            className="relative group"
                          >
                            <img 
                              src={getSkillImagePath(skill)}
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
                        {Array(Math.max(0, 4 - activeSkills.length)).fill(null).map((_, idx) => (
                          <div 
                            key={`empty-skill-${idx}`}
                            className="w-[64px] h-[64px] flex items-center justify-center bg-gray-600/40 border-3 border-gray-600 rounded"
                          >
                            <span className="text-lg text-gray-500 font-bold">-</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Camp Skills */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-bold text-center uppercase tracking-wider">Camp</div>
                      <div className="flex justify-center gap-1.5">
                        {activeCampSkills.slice(0, 4).map((skill, idx) => (
                          <div 
                            key={idx}
                            className="relative group"
                          >
                            <img 
                              src={getCampSkillImagePath(skill)}
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
        })}
      </div>
    </div>
  );
};

export default PartyComposition;