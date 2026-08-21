import React from 'react';
import { Trash2 } from 'lucide-react';
import { getHeroImagePath } from '../../utils/imageHelper';
import ImageWithFallback from '../common/ImageWithFallback';

const CompCard = ({ title, location, heroes = [], onLoad, onDelete }) => {
  return (
    <div className="group relative bg-gray-900/60 border border-gray-700 hover:border-dd-gold/60 rounded-lg p-3 transition-colors">
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-1.5 right-1.5 p-1 text-gray-500 hover:text-red-400 transition-colors z-10"
          title="Delete team"
          type="button"
        >
          <Trash2 size={14} />
        </button>
      )}
      <button onClick={onLoad} className="w-full text-left" type="button">
        <div className="font-darkest text-dd-parchment text-sm truncate pr-5">{title}</div>
        {location && <div className="text-[11px] text-gray-400 truncate mb-2">{location}</div>}
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3].map((i) => {
            const hero = heroes[i];
            return hero?.heroClass ? (
              <ImageWithFallback
                key={i}
                src={getHeroImagePath(hero.heroClass)}
                alt={hero.heroClass}
                title={hero.heroClass}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded border border-gray-600 bg-gray-800"
                fallback={
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-700 rounded border border-gray-600 text-[10px] text-gray-500">
                    ?
                  </div>
                }
              />
            ) : (
              <div
                key={i}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-800/50 rounded border border-gray-700 text-gray-600 text-xs"
              >
                -
              </div>
            );
          })}
        </div>
      </button>
    </div>
  );
};

export default CompCard;
