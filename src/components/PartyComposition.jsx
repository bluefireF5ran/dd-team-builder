import React from 'react';
import { HERO_CLASSES } from '../data/heroes';
import { getHeroImagePath, getSkillImagePath, getCampSkillImagePath, getTrinketImagePath } from '../utils/imageHelper';

const PartyComposition = ({ heroes }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border-2 border-gray-700">
      <h3 className="text-xl font-semibold mb-3 text-center">Party Composition</h3>
      <div className="grid grid-cols-4 gap-4">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          const heroData = HERO_CLASSES[hero.heroClass];
          const activeSkills = hero.activeSkills || [];
          const activeCampSkills = hero.activeCampSkills || [];

          return (
            <div key={position} className="text-center">
              <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600">
                <div className="text-lg font-bold text-yellow-400 mb-2">Position {position}</div>
                
                <div className="flex gap-2">
                  {/* Left side - Hero portrait */}
                  <div className="flex-shrink-0">
                    {hero.heroClass ? (
                      <>
                        <img 
                          src={getHeroImagePath(hero.heroClass)} 
                          alt={hero.heroClass}
                          className="w-[85px] h-[85px] object-contain rounded border-2 border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-[85px] h-[85px] items-center justify-center bg-gray-600 rounded border-2 border-gray-600"
                          style={{display: 'none'}}
                        >
                          <span className="text-3xl text-gray-500">{position}</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-[85px] h-[85px] flex items-center justify-center bg-gray-600 rounded border-2 border-gray-600">
                        <span className="text-3xl text-gray-500">{position}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-300 font-semibold mt-1 truncate w-[85px]">
                      {hero.heroClass || 'Empty'}
                    </div>
                  </div>

                  {/* Middle - Skills and Camp Skills */}
                  {hero.heroClass && (
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Combat Skills */}
                      <div>
                        <div className="text-xs text-gray-400 mb-1 font-semibold">Skills</div>
                        <div className="grid grid-cols-2 gap-1">
                          {activeSkills.slice(0, 4).map((skill, idx) => (
                            <div 
                              key={idx}
                              className="relative group"
                            >
                              <img 
                                src={getSkillImagePath(skill)}
                                alt={skill}
                                className="w-[36px] h-[36px] object-contain rounded border-2 border-green-700/50 bg-gray-800"
                                title={skill}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div 
                                className="w-[36px] h-[36px] items-center justify-center bg-green-900/40 border-2 border-green-700/50 rounded text-xs text-green-300"
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
                              className="w-[36px] h-[36px] flex items-center justify-center bg-gray-600/40 border-2 border-gray-600 rounded"
                            >
                              <span className="text-xs text-gray-500">-</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Camp Skills */}
                      <div>
                        <div className="text-xs text-gray-400 mb-1 font-semibold">Camp</div>
                        <div className="grid grid-cols-2 gap-1">
                          {activeCampSkills.slice(0, 4).map((skill, idx) => (
                            <div 
                              key={idx}
                              className="relative group"
                            >
                              <img 
                                src={getCampSkillImagePath(skill)}
                                alt={skill}
                                className="w-[36px] h-[36px] object-contain rounded border-2 border-purple-700/50 bg-gray-800"
                                title={skill}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div 
                                className="w-[36px] h-[36px] items-center justify-center bg-purple-900/40 border-2 border-purple-700/50 rounded text-xs text-purple-300"
                                style={{display: 'none'}}
                                title={skill}
                              >
                                ?
                              </div>
                            </div>
                          ))}
                          {activeCampSkills.length === 0 && (
                            <div className="col-span-2 w-full h-[36px] flex items-center justify-center bg-gray-600/40 border-2 border-gray-600 rounded">
                              <span className="text-xs text-gray-500">None</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right side - Trinkets (lado a lado) */}
                  {hero.heroClass && (
                    <div className="flex-shrink-0">
                      <div className="text-xs text-gray-400 mb-1 font-semibold">Trinkets</div>
                      <div className="flex gap-1">
                        {/* Trinket 1 */}
                        {hero.trinket1 ? (
                          <div className="relative group">
                            <img 
                              src={getTrinketImagePath(hero.trinket1)}
                              alt={hero.trinket1}
                              className="w-[36px] h-[72px] object-contain rounded border-2 border-purple-700/50 bg-gray-800"
                              title={hero.trinket1}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-[36px] h-[72px] items-center justify-center bg-purple-900/40 border-2 border-purple-700/50 rounded text-xs text-purple-300"
                              style={{display: 'none'}}
                              title={hero.trinket1}
                            >
                              ?
                            </div>
                          </div>
                        ) : (
                          <div className="w-[36px] h-[72px] flex items-center justify-center bg-gray-600/40 border-2 border-gray-600 rounded">
                            <span className="text-xs text-gray-500">-</span>
                          </div>
                        )}

                        {/* Trinket 2 */}
                        {hero.trinket2 ? (
                          <div className="relative group">
                            <img 
                              src={getTrinketImagePath(hero.trinket2)}
                              alt={hero.trinket2}
                              className="w-[36px] h-[72px] object-contain rounded border-2 border-purple-700/50 bg-gray-800"
                              title={hero.trinket2}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-[36px] h-[72px] items-center justify-center bg-purple-900/40 border-2 border-purple-700/50 rounded text-xs text-purple-300"
                              style={{display: 'none'}}
                              title={hero.trinket2}
                            >
                              ?
                            </div>
                          </div>
                        ) : (
                          <div className="w-[36px] h-[36px] flex items-center justify-center bg-gray-600/40 border-2 border-gray-600 rounded">
                            <span className="text-xs text-gray-500">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartyComposition;