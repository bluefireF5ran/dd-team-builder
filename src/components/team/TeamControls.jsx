import React, { useState } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Star, Puzzle, FolderOpen, Trash2, Download, ChevronDown } from 'lucide-react';
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
      {/* First Row: Save/Load buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Save */}
        <button
          onClick={handleQuickSave}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-green-700/80 hover:bg-green-600 text-dd-parchment rounded border border-green-600 transition-colors text-sm sm:text-base"
          title="Save to browser storage"
        >
          <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">Quick</span> Save
        </button>
        
        {/* Export to File */}
        <button
          onClick={handleSaveToFile}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-dd-parchment rounded border border-emerald-600 transition-colors text-sm sm:text-base"
          title="Export to .json file"
        >
          <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
          Export
        </button>
        
        {/* Load from File */}
        <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-blue-700/80 hover:bg-blue-600 text-dd-parchment rounded border border-blue-600 cursor-pointer transition-colors text-sm sm:text-base">
          <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
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
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-indigo-700/80 hover:bg-indigo-600 text-dd-parchment rounded border border-indigo-600 transition-colors text-sm sm:text-base"
            >
              <FolderOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Saved</span> ({savedTeams.length})
              <ChevronDown size={14} className={`transform transition-transform ${showSavedTeams ? 'rotate-180' : ''}`} />
            </button>
            
            {showSavedTeams && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSavedTeams(false)}
                />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-64 sm:w-72 bg-gray-800 border-2 border-gray-700 rounded shadow-lg z-20 max-h-64 overflow-y-auto">
                  {savedTeams.map((team, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                    >
                      <button
                        onClick={() => {
                          onLoadSavedTeam(team.teamName);
                          setShowSavedTeams(false);
                        }}
                        className="flex-1 text-left text-dd-parchment hover:text-dd-gold transition-colors truncate font-darkest"
                      >
                        {team.teamName}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${team.teamName}"?`)) {
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

      {/* Second Row: Toggles and Status */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Modded Heroes Toggle */}
        <button
          onClick={onToggleModdedHeroes}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded transition-colors border-2 text-sm sm:text-base ${
            showModdedHeroes
              ? 'bg-purple-700/80 hover:bg-purple-600 border-purple-500 text-dd-parchment'
              : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600 text-gray-400'
          }`}
          title="Toggle Modded Heroes"
        >
          <Puzzle size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline font-darkest">Modded</span>
          <span className="sm:hidden">Mod</span>
        </button>

        {/* Backer Trinkets Toggle */}
        <button
          onClick={onToggleBackerTrinkets}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded transition-colors border-2 text-sm sm:text-base ${
            showBackerTrinkets
              ? 'bg-amber-700/80 hover:bg-amber-600 border-amber-500 text-dd-parchment'
              : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600 text-gray-400'
          }`}
          title="Toggle Backer Trinkets"
        >
          <Star size={16} className={`sm:w-[18px] sm:h-[18px] ${showBackerTrinkets ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline font-darkest">Backer</span>
          <span className="sm:hidden">Bkr</span>
        </button>

        {/* Team Status - Moves to its own line on mobile */}
        <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded text-sm sm:text-base ml-auto ${
          teamValidation.isComplete 
            ? 'bg-green-900/50 border-2 border-green-700/50 text-green-400'
            : 'bg-yellow-900/50 border-2 border-yellow-700/50 text-yellow-400'
        }`}>
          {teamValidation.isComplete ? (
            <>
              <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-darkest">Ready!</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-darkest">
                {teamValidation.filledPositions}/4
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamControls;