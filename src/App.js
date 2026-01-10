import React, { useMemo } from 'react';
import { useTeam } from './hooks/useTeam';
import TeamHeader from './components/team/TeamHeader';
import TeamControls from './components/team/TeamControls';
import PartyComposition from './components/party/PartyComposition';
import HeroConfiguration from './components/hero/HeroConfiguration';

// Map locations to background images
const LOCATION_BACKGROUNDS = {
  'The Ruins': '/images/bg/The Ruins.png',
  'The Warrens': '/images/bg/The Warrens.png',
  'The Weald': '/images/bg/The Weald.png',
  'The Cove': '/images/bg/The Cove.png',
  'The Hamlet': '/images/bg/The Ruins.png',
  'The Courtyard': '/images/bg/The Courtyard.png',
  'The Farmstead': '/images/bg/The Farmstead.png',
  'The Darkest Dungeon I': '/images/bg/The Darkest Dungeon.png',
  'The Darkest Dungeon II': '/images/bg/The Darkest Dungeon.png',
  'The Darkest Dungeon III': '/images/bg/The Darkest Dungeon.png',
  'The Darkest Dungeon IV': '/images/bg/The Darkest Dungeon.png',
  'Butcher Circus': '/images/bg/The Ruins.png'
};

const App = () => {
  const {
    teamName,
    setTeamName,
    location,
    setLocation,
    heroes,
    updateHero,
    swapHeroes,
    saveTeam,
    loadTeam,
    savedTeams,
    loadSavedTeam,
    deleteSavedTeam,
    showBackerTrinkets,
    toggleBackerTrinkets,
    showModdedHeroes,         
    toggleModdedHeroes        
  } = useTeam();

  const backgroundImage = useMemo(() => {
    return LOCATION_BACKGROUNDS[location] || LOCATION_BACKGROUNDS['The Ruins'];
  }, [location]);

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white p-6 bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.95)), url('${backgroundImage}')` 
      }}
    >
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
            savedTeams={savedTeams}
            onLoadSavedTeam={loadSavedTeam}
            onDeleteSavedTeam={deleteSavedTeam}
            showBackerTrinkets={showBackerTrinkets}
            onToggleBackerTrinkets={toggleBackerTrinkets}
            showModdedHeroes={showModdedHeroes}
            onToggleModdedHeroes={toggleModdedHeroes}
          />
        </div>

        <PartyComposition heroes={heroes} onSwapHeroes={swapHeroes} />

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
                showBackerTrinkets={showBackerTrinkets}
                showModdedHeroes={showModdedHeroes}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;