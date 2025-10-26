import React from 'react';
import PartyHeroCard from './PartyHeroCard';

const PartyComposition = ({ heroes }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
      <h3 className="text-3xl font-bold mb-6 text-center text-red-600">Party Composition</h3>
      <div className="grid grid-cols-4 gap-6">
        {[...heroes].reverse().map((hero, idx) => {
          const position = 4 - idx;
          return (
            <PartyHeroCard
              key={position}
              hero={hero}
              position={position}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PartyComposition;