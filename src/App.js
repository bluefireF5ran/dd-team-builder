import React, { useState } from 'react';
import { Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { LOCATIONS } from './data/locations';
import { validateTeam } from './utils/validation';
import PartyComposition from './components/PartyComposition';
import HeroConfiguration from './components/HeroConfiguration';

const App = () => {
  const [teamName, setTeamName] = useState('My Team');
  const [location, setLocation] = useState('The Ruins');
  const [heroes, setHeroes] = useState([
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] } }
  ]);

  const teamValidation = validateTeam(heroes);

  const updateHero = (index, updatedHero) => {
    const newHeroes = [...heroes];
    newHeroes[index] = updatedHero;
    setHeroes(newHeroes);
  };

  const saveTeam = () => {
    const team = { teamName, location, heroes };
    const dataStr = JSON.stringify(team, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${teamName.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadTeam = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const team = JSON.parse(event.target.result);
          setTeamName(team.teamName || 'My Team');
          setLocation(team.location || 'The Ruins');
          setHeroes(team.heroes || []);
        } catch (error) {
          alert('Error loading team file');
        }
      };
      reader.readAsText(file);
    }
  };
  
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter team name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={saveTeam}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                <Save size={18} />
                Save Team
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer">
                <Upload size={18} />
                Load Team
                <input
                  type="file"
                  accept=".json"
                  onChange={loadTeam}
                  className="hidden"
                />
              </label>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded ${
              teamValidation.isComplete 
                ? 'bg-green-900/30 border border-green-700/50 text-green-400'
                : 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-400'
            }`}>
              {teamValidation.isComplete ? (
                <>
                  <CheckCircle size={18} />
                  <span className="font-semibold">Team Ready!</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  <span className="font-semibold">
                    {teamValidation.filledPositions}/4 Heroes Configured
                  </span>
                </>
              )}
            </div>
          </div>
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