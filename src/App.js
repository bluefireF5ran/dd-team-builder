import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useTeam } from './hooks/useTeam';
import TeamHeader from './components/team/TeamHeader';
import TeamControls from './components/team/TeamControls';
import PartyComposition from './components/party/PartyComposition';
import HeroConfiguration from './components/hero/HeroConfiguration';
import ImageTester from './components/debug/ImageTester';
import { getAssetUrl } from './config/assets';
import html2canvas from 'html2canvas';

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
  const [showImageTester, setShowImageTester] = useState(false);
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
    const bgPath = LOCATION_BACKGROUNDS[location] || LOCATION_BACKGROUNDS['The Ruins'];
    return getAssetUrl(bgPath);
  }, [location]);

  // Ref for party composition export
  const partyRef = useRef(null);

  // Export party composition to PNG
  const exportToPNG = useCallback(async () => {
    if (!partyRef.current) return;
    
    try {
      // Temporarily adjust position badges for better rendering in html2canvas
      const badges = partyRef.current.querySelectorAll('.position-badge');
      const originalStyles = [];
      badges.forEach((badge) => {
        originalStyles.push(badge.style.cssText);
        badge.style.marginTop = '-15px';
        badge.style.fontFamily = 'Arial, sans-serif';
      });

      const canvas = await html2canvas(partyRef.current, {
        backgroundColor: '#1f2937', // gray-800
        scale: 2, // Higher quality
        useCORS: true, // For external images
        allowTaint: true,
        logging: false
      });
      
      // Restore original styles
      badges.forEach((badge, idx) => {
        badge.style.cssText = originalStyles[idx];
      });
      
      const link = document.createElement('a');
      const fileName = teamName ? `${teamName.replace(/[^a-z0-9]/gi, '_')}.png` : 'party_composition.png';
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Error exporting image. Please try again.');
    }
  }, [teamName]);

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white p-3 sm:p-6 bg-cover bg-center bg-fixed vignette"
      style={{ 
        backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.95)), url('${backgroundImage}')` 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header con fuente gótica */}
        <header className="mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="font-darkest text-3xl sm:text-5xl lg:text-6xl text-center mb-2 text-dd-red-light drop-shadow-lg tracking-wider">
            Darkest Dungeon
          </h1>
          <h2 className="font-darkest text-xl sm:text-2xl lg:text-3xl text-center text-dd-gold tracking-wide">
            Team Builder
          </h2>
          <div className="dd-separator mt-4 mb-2"></div>
          <p className="text-center text-gray-400 text-sm sm:text-base italic">
            "Remind yourself that overconfidence is a slow and insidious killer."
          </p>
        </header>

        {/* Panel de controles */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-dd-red/30 torch-border">
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
            onExportPNG={exportToPNG}
          />
        </div>

        {/* Party Composition */}
        <PartyComposition 
          ref={partyRef}
          heroes={heroes} 
          onSwapHeroes={swapHeroes}
          teamName={teamName}
          location={location}
        />

        {/* Hero Configuration Cards */}
        <div className="space-y-4 sm:space-y-6">
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

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-xs sm:text-sm pb-4">
          <div className="dd-separator mb-4"></div>
          <p className="font-darkest text-dd-gold/60 tracking-wider">
            Darkest Dungeon © Red Hook Studios
          </p>
          <button
            onClick={() => setShowImageTester(true)}
            className="mt-2 text-gray-600 hover:text-gray-400 text-xs underline"
          >
            Test Images
          </button>
        </footer>

        {/* Image Tester Modal */}
        {showImageTester && (
          <ImageTester onClose={() => setShowImageTester(false)} />
        )}
      </div>
    </div>
  );
};

export default App;