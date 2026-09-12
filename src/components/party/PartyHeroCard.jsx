import React from 'react';
import { Lock } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';
import { getHeroImagePath, getSkillImagePath, getCampSkillImagePath, getTrinketImagePath } from '../../utils/imageHelper';
import ImageWithFallback from '../common/ImageWithFallback';
import HoverCard from '../common/HoverCard';
import { skillHover, trinketHover, quirkHover } from '../../utils/hoverInfo';
import { quirkClasses } from '../../utils/quirkStyle';
import { rarityBorderStyle, withAlpha } from '../../utils/trinketRarity';

// The four icon grids below differ only in art, colour and what the hover panel
// reads from, so the icon itself is one component.
const ICON = 'w-[40px] h-[40px] sm:w-[64px] sm:h-[64px]';

const SkillIcon = ({ name, heroClass, camp }) => {
  const colour = camp ? 'border-purple-600' : 'border-green-600';
  const fallbackColour = camp ? 'bg-purple-900/40 text-purple-300' : 'bg-green-900/40 text-green-300';
  return (
    <HoverCard {...skillHover(name, heroClass)}>
      <ImageWithFallback
        src={camp ? getCampSkillImagePath(name, heroClass) : getSkillImagePath(name, heroClass)}
        alt={name}
        className={`${ICON} object-contain rounded border-2 sm:border-3 ${colour} bg-gray-800 shadow-md hover:scale-110 transition-transform skill-icon`}
        fallback={(
          <div className={`${ICON} flex items-center justify-center ${fallbackColour} border-2 sm:border-3 ${colour} rounded text-sm sm:text-lg font-bold`}>
            ?
          </div>
        )}
      />
    </HoverCard>
  );
};

// A quirk chip, in the colour of whatever it turned out to be: a prismatic
// quirk sits in the positive list but is not yellow, and a disease is green.
const QuirkChip = ({ name, tone, locked }) => (
  <HoverCard {...quirkHover(name, tone)}>
    <span
      className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 border rounded text-[9px] sm:text-xs ${quirkClasses(name, tone).chip}`}
      title={name}
    >
      {locked && <Lock size={8} className="sm:w-[10px] sm:h-[10px]" />}
      <span className="truncate max-w-[50px] sm:max-w-[80px]">{name}</span>
    </span>
  </HoverCard>
);

// The border is the trinket's rarity. Every one of these was amber before, so
// a party wearing a Very Common and an Ancestral looked the same until you
// hovered - and this card is the one that gets exported as a PNG.
const TrinketIcon = ({ name, other, heroClass }) => {
  const border = rarityBorderStyle(name);
  return (
    <HoverCard {...trinketHover(name, other)}>
      <ImageWithFallback
        src={getTrinketImagePath(name, heroClass)}
        alt={name}
        style={border}
        className="w-[36px] h-[72px] sm:w-[60px] sm:h-[120px] object-contain rounded border-2 sm:border-3 bg-gray-800 shadow-md trinket-icon"
        fallback={(
          <div
            style={{ ...border, backgroundColor: withAlpha(border.borderColor, 0.25) }}
            className="w-[36px] h-[72px] sm:w-[60px] sm:h-[120px] flex items-center justify-center border-2 sm:border-3 rounded text-sm sm:text-lg text-amber-300 font-bold"
          >
            ?
          </div>
        )}
      />
    </HoverCard>
  );
};

const PartyHeroCard = ({ hero, position }) => {
  const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];
  const quirks = hero.quirks || { positive: [], negative: [] };
  const lockedQuirks = hero.lockedQuirks || { positive: [], negative: [] };
  const diseases = hero.diseases || [];
  const hasQuirks = quirks.positive.length > 0 || quirks.negative.length > 0 || diseases.length > 0;

  // Dividir skills en dos filas si son 7
  const firstRowSkills = activeSkills.slice(0, 4);
  const secondRowSkills = activeSkills.slice(4, 7);

  const heroPortraitFallback = (
    <div className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] flex items-center justify-center bg-gray-600 rounded-lg border-2 sm:border-4 border-gray-600">
      <span className="text-3xl sm:text-5xl text-gray-500">{position}</span>
    </div>
  );

  return (
    <div className="relative hero-card">
      <div className="hero-frame bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-2 sm:p-4 border-2 border-gray-700 hover:border-dd-gold/50 transition-all duration-300 shadow-inner-dark">
        {/* Position Badge */}
        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-dd-gold to-amber-600 rounded-full flex items-center justify-center border-2 sm:border-4 border-gray-900 shadow-torch z-10">
          <span className="position-badge text-lg sm:text-2xl font-black text-gray-900 leading-none">
            {position}
          </span>
        </div>

        {/* Hero Portrait */}
        <div className="flex flex-col items-center mb-2 sm:mb-4">
          {hero.heroClass ? (
            <ImageWithFallback
              src={getHeroImagePath(hero.heroClass)}
              alt={hero.heroClass}
              className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-contain rounded-lg border-2 sm:border-4 border-gray-600 bg-gray-800 shadow-lg"
              fallback={heroPortraitFallback}
            />
          ) : (
            <div className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] flex items-center justify-center bg-gray-600 rounded-lg border-2 sm:border-4 border-gray-600">
              <span className="text-3xl sm:text-5xl text-gray-500">{position}</span>
            </div>
          )}
          <div className="text-sm sm:text-lg text-dd-parchment font-bold mt-1 sm:mt-2 text-center px-2 py-0.5 sm:py-1 bg-gray-800/80 rounded font-darkest tracking-wide">
            {hero.heroClass || 'Empty'}
          </div>
        </div>

        {hero.heroClass && (
          <>
            {/* Combat Skills */}
            <div className="mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm text-dd-gold mb-1 sm:mb-2 font-bold text-center uppercase tracking-wider font-darkest">Skills</div>
              <div className="space-y-1 sm:space-y-1.5">
                {/* Primera fila - 4 skills */}
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  {firstRowSkills.map((skill, idx) => (
                    <SkillIcon key={`skill-${idx}-${skill}`} name={skill} heroClass={hero.heroClass} />
                  ))}
                  {!isAlwaysActive && Array(Math.max(0, 4 - firstRowSkills.length)).fill(null).map((_, idx) => (
                    <div
                      key={`empty-skill-${idx}`}
                      className="w-[40px] h-[40px] sm:w-[64px] sm:h-[64px] flex items-center justify-center bg-gray-600/40 border-2 sm:border-3 border-gray-600 rounded"
                    >
                      <span className="text-sm sm:text-lg text-gray-500 font-bold">-</span>
                    </div>
                  ))}
                </div>

                {/* Segunda fila - 3 skills (solo para héroes con 7 skills) */}
                {isAlwaysActive && secondRowSkills.length > 0 && (
                  <div className="flex justify-center gap-1 sm:gap-1.5">
                    {secondRowSkills.map((skill, idx) => (
                      <SkillIcon key={`skill2-${idx}-${skill}`} name={skill} heroClass={hero.heroClass} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Camp Skills */}
            <div className="mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm text-purple-400 mb-1 sm:mb-2 font-bold text-center uppercase tracking-wider font-darkest">Camp</div>
              <div className="flex justify-center gap-1 sm:gap-1.5">
                {activeCampSkills.slice(0, 4).map((skill, idx) => (
                  <SkillIcon key={`camp-${idx}-${skill}`} name={skill} heroClass={hero.heroClass} camp />
                ))}
                {activeCampSkills.length === 0 ? (
                  <div className="w-full h-[40px] sm:h-[64px] flex items-center justify-center bg-gray-600/40 border-2 sm:border-3 border-gray-600 rounded">
                    <span className="text-xs sm:text-sm text-gray-500 font-bold">None</span>
                  </div>
                ) : (
                  Array(Math.max(0, 4 - activeCampSkills.length)).fill(null).map((_, idx) => (
                    <div
                      key={`empty-camp-${idx}`}
                      className="w-[40px] h-[40px] sm:w-[64px] sm:h-[64px] flex items-center justify-center bg-gray-600/40 border-2 sm:border-3 border-gray-600 rounded"
                    >
                      <span className="text-sm sm:text-lg text-gray-500 font-bold">-</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Trinkets */}
            <div className="mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm text-amber-400 mb-1 sm:mb-2 font-bold text-center uppercase tracking-wider font-darkest">Trinkets</div>
              <div className="flex justify-center gap-1 sm:gap-2">
                {[hero.trinket1, hero.trinket2].map((trinket, idx) => (
                  <div key={`trinket-${idx}`}>
                    {trinket ? (
                      <TrinketIcon
                        name={trinket}
                        other={idx === 0 ? hero.trinket2 : hero.trinket1}
                        heroClass={hero.heroClass}
                      />
                    ) : (
                      <div className="w-[36px] h-[72px] sm:w-[60px] sm:h-[120px] flex items-center justify-center bg-gray-600/40 border-2 sm:border-3 border-gray-600 rounded">
                        <span className="text-sm sm:text-lg text-gray-500 font-bold">-</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quirks - Only shown if there are any */}
            {hasQuirks && (
              <div>
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 font-bold text-center uppercase tracking-wider font-darkest">Quirks</div>
                <div className="space-y-1">
                  {[
                    { tone: 'positive', list: quirks.positive, locked: lockedQuirks.positive },
                    { tone: 'negative', list: quirks.negative, locked: lockedQuirks.negative },
                    { tone: 'disease', list: diseases, locked: [] }
                  ].map(({ tone, list, locked }) => list.length > 0 && (
                    <div key={tone} className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                      {list.map((quirk, idx) => (
                        <QuirkChip
                          key={`${tone}-${idx}`}
                          name={quirk}
                          tone={tone}
                          locked={locked.includes(quirk)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PartyHeroCard);
