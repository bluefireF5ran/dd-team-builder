import React, { useState } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Star, Puzzle, FolderOpen, Trash2, Download, X, ChevronDown } from 'lucide-react';
import { validateTeam } from '../../utils/validation';

const TeamControls = ({ 
  heroes, 
  onSave, 
  onLoad,
  savedTeams = [],
  onLoadSavedTeam,
  onDeleteSavedTeam,
  showBackerTrinkets, 
  onToggleBackerTrinkets,
  showModdedHeroes,
  onToggleModdedHeroes
}) => {
  const teamValidation = validateTeam(heroes);
  const [showSavedTeams, setShowSavedTeams] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoad(file);
      e.target.value = '';
    }
  };

  const handleQuickSave = () => {
    onSave(false); // Save only to localStorage, not to file
  };

  const handleSaveToFile = () => {
    onSave(true); // Save to both localStorage and file
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {/* Quick Save (localStorage only) */}
          <button
            onClick={handleQuickSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Save to browser storage"
          >
            <Save size={18} />
            Quick Save
          </button>
          
          {/* Export to File */}
          <button
            onClick={handleSaveToFile}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors"
            title="Export to .json file"
          >
            <Download size={18} />
            Export
          </button>
          
          {/* Load from File */}
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Saved Teams Dropdown */}
          {savedTeams.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSavedTeams(!showSavedTeams)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
              >
                <FolderOpen size={18} />
                Saved Teams ({savedTeams.length})
                <ChevronDown size={16} className={`transform transition-transform ${showSavedTeams ? 'rotate-180' : ''}`} />
              </button>
              
              {showSavedTeams && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSavedTeams(false)}
                  />
                  <div className="absolute left-0 mt-1 w-72 bg-gray-700 border border-gray-600 rounded shadow-lg z-20 max-h-64 overflow-y-auto">
                    {savedTeams.map((team, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                      >
                        <button
                          onClick={() => {
                            onLoadSavedTeam(team.teamName);
                            setShowSavedTeams(false);
                          }}
                          className="flex-1 text-left text-white hover:text-green-400 transition-colors truncate"
                        >
                          {team.teamName}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${team.teamName}"?`)) {
                              onDeleteSavedTeam(team.teamName);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors ml-2"
                          title="Delete team"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Modded Heroes Toggle */}
          <button
            onClick={onToggleModdedHeroes}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors border-2 ${
              showModdedHeroes
                ? 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300'
            }`}
            title="Toggle Modded Heroes"
          >
            <Puzzle size={18} />
            <span className="font-semibold">Modded Heroes</span>
          </button>

          {/* Backer Trinkets Toggle */}
          <button
            onClick={onToggleBackerTrinkets}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors border-2 ${
              showBackerTrinkets
                ? 'bg-amber-600 hover:bg-amber-700 border-amber-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300'
            }`}
            title="Toggle Backer Trinkets"
          >
            <Star size={18} className={showBackerTrinkets ? 'fill-current' : ''} />
            <span className="font-semibold">Backer Trinkets</span>
          </button>

          {/* Team Status */}
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
    </div>
  );
};

export default TeamControls;