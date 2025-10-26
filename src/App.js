import React from 'react';
import { useTeam } from './hooks/useTeam';
import TeamHeader from './components/team/TeamHeader';
import TeamControls from './components/team/TeamControls';
import PartyComposition from './components/party/PartyComposition';
import HeroConfiguration from './components/hero/HeroConfiguration';

const App = () => {
  const {
    teamName,
    setTeamName,
    location,
    setLocation,
    heroes,
    updateHero,
    saveTeam,
    loadTeam
  } = useTeam();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
          Darkest Dungeon Team Builder
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Craft your perfect party composition
        </p>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
          <TeamHeader
            teamName={teamName}
            onTeamNameChange={setTeamName}
            location={location}
            onLocationChange={setLocation}
          />
          <TeamControls
            heroes={heroes}
            onSave={saveTeam}
            onLoad={loadTeam}
          />
        </div>

        <PartyComposition heroes={heroes} />

        <div className="space-y-6">
          {[...heroes].reverse().map((hero, idx) => {
            const position = 4 - idx;
            const actualIndex = heroes.length - 1 - idx;
            return (
              <HeroConfiguration
                key={position}
                hero={hero}
                position={position}
                onUpdate={(updatedHero) => updateHero(actualIndex, updatedHero)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;