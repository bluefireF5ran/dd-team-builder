import React, { useState, useMemo } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Star, Puzzle, FolderOpen, Trash2, Download, ChevronDown, Image, Loader2, Clipboard, Dice5, Undo2, Redo2, ClipboardPaste, BookOpen, Archive, XCircle, Palette } from 'lucide-react';
import { validateTeam } from '../../utils/validation';
import { TEAM_PRESETS } from '../../data/teamPresets';
import ConfirmDialog from '../common/ConfirmDialog';

const TeamControls = ({
  heroes,
  teamName,
  location,
  onSave,
  onLoad,
  savedTeams = [],
  onLoadSavedTeam,
  onDeleteSavedTeam,
  showBackerTrinkets,
  onToggleBackerTrinkets,
  showModdedHeroes,
  onToggleModdedHeroes,
  onExportPNG,
  showToast,
  isExporting = false,
  onRandomize,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onImportFromClipboard,
  teamExists,
  onLoadPreset,
  onBackupAll,
  onImportBackup,
  onClearTeam,
  savedTeamsCount = 0,
  onCycleTheme,
  currentTheme = 'default'
}) => {
  const teamValidation = useMemo(() => validateTeam(heroes), [heroes]);
  const [showSavedTeams, setShowSavedTeams] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, teamName: '' });
  const [overwriteState, setOverwriteState] = useState({ isOpen: false, saveToFile: false });
  const [showPresets, setShowPresets] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleBackupFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await onImportBackup(file);
        showToast?.(`Imported ${result.imported} team(s), skipped ${result.skipped} duplicate(s).`, 'success');
      } catch (error) {
        showToast?.(error.message || 'Error importing backup.', 'error');
      }
      e.target.value = '';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await onLoad(file);
        showToast?.('Team imported successfully!', 'success');
      } catch (error) {
        showToast?.(error.message || 'Error loading team file.', 'error');
      }
      e.target.value = '';
    }
  };

  const handleQuickSave = () => {
    if (teamExists?.(teamName)) {
      setOverwriteState({ isOpen: true, saveToFile: false });
    } else {
      onSave(false);
    }
  };

  const handleSaveToFile = () => {
    if (teamExists?.(teamName)) {
      setOverwriteState({ isOpen: true, saveToFile: true });
    } else {
      onSave(true);
    }
  };

  const handleCopyToClipboard = async () => {
    const teamData = JSON.stringify({ teamName, location, heroes });
    try {
      await navigator.clipboard.writeText(teamData);
      showToast?.('Team copied to clipboard!', 'success');
    } catch {
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = teamData;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast?.('Team copied to clipboard!', 'success');
      } catch {
        showToast?.('Failed to copy to clipboard.', 'error');
      }
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      await onImportFromClipboard();
      showToast?.('Team imported from clipboard!', 'success');
    } catch (error) {
      showToast?.(error.message || 'Failed to import from clipboard.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* First Row: Save/Load buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Undo/Redo */}
        {onUndo && (
          <div className="flex gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded border transition-colors ${
                canUndo
                  ? 'bg-gray-700 hover:bg-gray-600 text-dd-parchment border-gray-600'
                  : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded border transition-colors ${
                canRedo
                  ? 'bg-gray-700 hover:bg-gray-600 text-dd-parchment border-gray-600'
                  : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
          </div>
        )}

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

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-cyan-700/80 hover:bg-cyan-600 text-dd-parchment rounded border border-cyan-600 transition-colors text-sm sm:text-base"
          title="Copy team to clipboard"
        >
          <Clipboard size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">Copy</span>
        </button>

        {/* Paste from Clipboard */}
        {onImportFromClipboard && (
          <button
            onClick={handlePasteFromClipboard}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-teal-700/80 hover:bg-teal-600 text-dd-parchment rounded border border-teal-600 transition-colors text-sm sm:text-base"
            title="Import team from clipboard"
          >
            <ClipboardPaste size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Paste</span>
          </button>
        )}

        {/* Export to PNG */}
        <button
          onClick={onExportPNG}
          disabled={isExporting}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded border transition-colors text-sm sm:text-base ${
            isExporting
              ? 'bg-violet-900/50 border-violet-700 text-violet-300 cursor-wait'
              : 'bg-violet-700/80 hover:bg-violet-600 text-dd-parchment border-violet-600'
          }`}
          title="Export party composition as PNG image"
        >
          {isExporting ? (
            <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
          ) : (
            <Image size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
          <span className="hidden xs:inline">{isExporting ? 'Exporting...' : 'PNG'}</span>
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

        {/* Random Team */}
        {onRandomize && (
          <button
            onClick={onRandomize}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-orange-700/80 hover:bg-orange-600 text-dd-parchment rounded border border-orange-600 transition-colors text-sm sm:text-base"
            title="Generate random team"
          >
            <Dice5 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Random</span>
          </button>
        )}

        {/* Clear Team */}
        {onClearTeam && (
          <button
            onClick={() => setClearConfirm(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-red-900/80 hover:bg-red-800 text-dd-parchment rounded border border-red-700 transition-colors text-sm sm:text-base"
            title="Clear entire team"
          >
            <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Presets Dropdown */}
        {onLoadPreset && TEAM_PRESETS.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setShowPresets(!showPresets); setShowSavedTeams(false); }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-amber-700/80 hover:bg-amber-600 text-dd-parchment rounded border border-amber-600 transition-colors text-sm sm:text-base"
            >
              <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Presets</span>
              <ChevronDown size={14} className={`transform transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </button>

            {showPresets && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPresets(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 bg-gray-800 border-2 border-gray-700 rounded shadow-lg z-20 max-h-64 overflow-y-auto">
                  {TEAM_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onLoadPreset(preset);
                        setShowPresets(false);
                        showToast?.(`Loaded "${preset.name}" preset!`, 'success');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="font-darkest text-dd-parchment text-sm">{preset.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
                          setConfirmState({ isOpen: true, teamName: team.teamName });
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

        {/* Backup All Teams */}
        {onBackupAll && savedTeamsCount > 0 && (
          <button
            onClick={() => {
              onBackupAll();
              showToast?.('All teams exported to file!', 'success');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-teal-800/80 hover:bg-teal-700 text-dd-parchment rounded border border-teal-600 transition-colors text-sm sm:text-base"
            title="Backup all saved teams to file"
          >
            <Archive size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Backup</span>
          </button>
        )}

        {/* Import Backup */}
        {onImportBackup && (
          <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-sky-800/80 hover:bg-sky-700 text-dd-parchment rounded border border-sky-600 cursor-pointer transition-colors text-sm sm:text-base" title="Import teams from backup file">
            <Archive size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleBackupFile}
              className="hidden"
            />
          </label>
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

        {/* Theme Toggle */}
        {onCycleTheme && (
          <button
            onClick={onCycleTheme}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded transition-colors border-2 text-sm sm:text-base ${
              currentTheme === 'bloodmoon'
                ? 'bg-red-900/80 hover:bg-red-800 border-red-600 text-red-200'
                : currentTheme === 'frost'
                ? 'bg-blue-900/80 hover:bg-blue-800 border-blue-600 text-blue-200'
                : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600 text-gray-400'
            }`}
            title={`Theme: ${currentTheme === 'bloodmoon' ? 'Bloodmoon' : currentTheme === 'frost' ? 'Frost' : 'Default'} (click to cycle)`}
          >
            <Palette size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline font-darkest">{currentTheme === 'bloodmoon' ? 'Blood' : currentTheme === 'frost' ? 'Frost' : 'Theme'}</span>
          </button>
        )}

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

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete Team"
        message={`Delete "${confirmState.teamName}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          onDeleteSavedTeam(confirmState.teamName);
          setConfirmState({ isOpen: false, teamName: '' });
        }}
        onCancel={() => setConfirmState({ isOpen: false, teamName: '' })}
      />

      <ConfirmDialog
        isOpen={overwriteState.isOpen}
        title="Overwrite Team"
        message={`A team named "${teamName}" already exists. Save and overwrite it?`}
        confirmLabel="Overwrite"
        isDestructive={true}
        onConfirm={() => {
          onSave(overwriteState.saveToFile);
          setOverwriteState({ isOpen: false, saveToFile: false });
        }}
        onCancel={() => setOverwriteState({ isOpen: false, saveToFile: false })}
      />

      <ConfirmDialog
        isOpen={clearConfirm}
        title="Clear Team"
        message="Reset all hero slots to empty? This can be undone with Ctrl+Z."
        confirmLabel="Clear All"
        isDestructive={true}
        onConfirm={() => {
          onClearTeam();
          setClearConfirm(false);
          showToast?.('Team cleared.', 'success');
        }}
        onCancel={() => setClearConfirm(false)}
      />
    </div>
  );
};

export default TeamControls;