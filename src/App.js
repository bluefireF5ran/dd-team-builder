import React, { useMemo, useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { useTeam } from './hooks/useTeam';
import TeamHeader from './components/team/TeamHeader';
import TeamControls from './components/team/TeamControls';
import PartyComposition from './components/party/PartyComposition';
import HeroConfiguration from './components/hero/HeroConfiguration';
import Toast from './components/common/Toast';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';
import { getAssetUrl } from './config/assets';

const ImageTester = lazy(() => import('./components/debug/ImageTester'));

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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toast, setToast] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('dd_theme') || 'default');
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
    toggleModdedHeroes,
    randomizeTeam,
    undo,
    redo,
    canUndo,
    canRedo,
    importFromClipboard,
    teamExists,
    loadPreset,
    backupAllTeams,
    importBackup,
    clearTeam
  } = useTeam();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const cycleTheme = useCallback(() => {
    const themes = ['default', 'bloodmoon', 'frost'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    localStorage.setItem('dd_theme', next);
  }, [theme]);

  const backgroundImage = useMemo(() => {
    const bgPath = LOCATION_BACKGROUNDS[location] || LOCATION_BACKGROUNDS['The Ruins'];
    return getAssetUrl(bgPath);
  }, [location]);

  // Ref for party composition export
  const partyRef = useRef(null);

  // Export party composition to PNG
  const exportToPNG = useCallback(async () => {
    if (!partyRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;

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
      showToast('Error exporting image. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [teamName, isExporting, showToast]);

  // Global keyboard shortcuts (using refs to avoid re-registering on every state change)
  const handlersRef = useRef({ undo, redo, saveTeam, exportToPNG, showToast, teamName, location, heroes });
  handlersRef.current = { undo, redo, saveTeam, exportToPNG, showToast, teamName, location, heroes };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const h = handlersRef.current;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); h.undo(); }
        else if (e.key === 'y') { e.preventDefault(); h.redo(); }
        else if (e.key === 's') { e.preventDefault(); h.saveTeam(false); h.showToast('Team saved!', 'success'); }
        else if (e.key === 'e') { e.preventDefault(); h.exportToPNG(); }
        else if (e.shiftKey && e.key === 'C') {
          e.preventDefault();
          const data = JSON.stringify({ teamName: h.teamName, location: h.location, heroes: h.heroes });
          navigator.clipboard.writeText(data).then(() => h.showToast('Team copied to clipboard!', 'success'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gray-900 text-white p-3 sm:p-6 bg-cover bg-center bg-fixed vignette ${theme !== 'default' ? `theme-${theme}` : ''}`}
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
            teamName={teamName}
            location={location}
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
            showToast={showToast}
            isExporting={isExporting}
            onRandomize={randomizeTeam}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onImportFromClipboard={importFromClipboard}
            teamExists={teamExists}
            onLoadPreset={loadPreset}
            onBackupAll={backupAllTeams}
            onImportBackup={importBackup}
            onClearTeam={clearTeam}
            savedTeamsCount={savedTeams.length}
            onCycleTheme={cycleTheme}
            currentTheme={theme}
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
          <span className="mx-2 text-gray-700">|</span>
          <button
            onClick={() => setShowShortcuts(true)}
            className="mt-2 text-gray-600 hover:text-gray-400 text-xs underline"
          >
            Keyboard Shortcuts
          </button>
        </footer>

        {/* Image Tester Modal */}
        {showImageTester && (
          <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="text-dd-parchment font-darkest">Loading...</div></div>}>
            <ImageTester onClose={() => setShowImageTester(false)} />
          </Suspense>
        )}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

        {/* Toast Notifications */}
        {toast && (
          <Toast
            key={toast.key}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;