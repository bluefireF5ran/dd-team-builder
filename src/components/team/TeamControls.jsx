import React, { useState, useMemo } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Star, Puzzle, Image, Loader2, Clipboard, Dice5, Undo2, Redo2, ClipboardPaste, BookOpen, Archive, XCircle, Palette, Biohazard, Droplet, Settings } from 'lucide-react';
import { validateTeam } from '../../utils/validation';
import { copyTextToClipboard } from '../../utils/heroClipboard';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadCompModal from './LoadCompModal';
import SaveTeamModal from './SaveTeamModal';

const TeamControls = ({
  heroes,
  teamName,
  location,
  onSave,
  onLoad,
  savedTeams = [],
  onLoadSavedTeam,
  onDeleteSavedTeam,
  settings = {},
  onToggleSetting,
  onOpenSettings,
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
  describePreset,
  onSavePresetFile,
  onLoadPreset,
  onBackupAll,
  onImportBackup,
  onClearTeam,
  savedTeamsCount = 0,
  onCycleTheme
}) => {
  const currentTheme = settings.theme;
  const teamValidation = useMemo(() => validateTeam(heroes), [heroes]);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  // El dialogo ya avisa de que sobrescribe y de como se va a llamar el preset,
  // asi que aqui solo queda guardar y cerrar.
  const handleSaveToBrowser = () => {
    onSave(false);
    setShowSaveModal(false);
    showToast?.(`Saved "${teamName}" to browser storage.`, 'success');
  };

  const handleSavePresetFile = () => {
    const preset = onSavePresetFile();
    setShowSaveModal(false);
    showToast?.(`Exported as "${preset.name}".`, 'success');
  };

  const handleCopyToClipboard = async () => {
    const ok = await copyTextToClipboard(JSON.stringify({ teamName, location, heroes }));
    showToast?.(
      ok ? 'Team copied to clipboard!' : 'Failed to copy to clipboard.',
      ok ? 'success' : 'error'
    );
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

        {/* Save: elige destino (navegador o fichero de comp preset) */}
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-green-700/80 hover:bg-green-600 text-dd-parchment rounded border border-green-600 transition-colors text-sm sm:text-base"
          title="Save to browser storage or export as a taxonomy-named preset comp"
        >
          <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
          Save
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

        {/* Load Comp (Saved Teams + Comp Library) */}
        <button
          onClick={() => setShowLoadModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-amber-700/80 hover:bg-amber-600 text-dd-parchment rounded border border-amber-600 transition-colors text-sm sm:text-base"
        >
          <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Load Comp</span>
          <span className="sm:hidden">Load</span>
        </button>

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

      {/* Second Row: optional content, theme and status. These four are the
          quick switches; the Settings panel holds them and everything else. */}
      <div className="flex flex-wrap items-center gap-2">
        <ContentToggle
          on={settings.showModdedHeroes}
          onClick={() => onToggleSetting('showModdedHeroes')}
          title="Toggle Modded Heroes"
          icon={Puzzle}
          label="Modded"
          short="Mod"
          onClasses="bg-purple-700/80 hover:bg-purple-600 border-purple-500 text-dd-parchment"
        />

        <ContentToggle
          on={settings.showBackerTrinkets}
          onClick={() => onToggleSetting('showBackerTrinkets')}
          title="Toggle Backer Trinkets"
          icon={Star}
          label="Backer"
          short="Bkr"
          fillWhenOn
          onClasses="bg-amber-700/80 hover:bg-amber-600 border-amber-500 text-dd-parchment"
        />

        <ContentToggle
          on={settings.showDiseases}
          onClick={() => onToggleSetting('showDiseases')}
          title="Toggle Diseases"
          icon={Biohazard}
          label="Diseases"
          short="Dis"
          onClasses="bg-green-700/80 hover:bg-green-600 border-green-500 text-dd-parchment"
        />

        {/* Only offered once diseases are on: on its own it would toggle a
            list nothing is showing. */}
        {settings.showDiseases && (
          <ContentToggle
            on={settings.showCrimsonCourt}
            onClick={() => onToggleSetting('showCrimsonCourt')}
            title="Toggle Crimson Court diseases"
            icon={Droplet}
            label="Crimson"
            short="CC"
            fillWhenOn
            onClasses="bg-red-800/80 hover:bg-red-700 border-red-500 text-red-100"
          />
        )}

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

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded transition-colors border-2 bg-gray-800/80 hover:bg-gray-700 border-gray-600 text-gray-300 text-sm sm:text-base"
          title="Settings"
        >
          <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline font-darkest">Settings</span>
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

      <LoadCompModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        savedTeams={savedTeams}
        onLoadSavedTeam={onLoadSavedTeam}
        onDeleteSavedTeam={onDeleteSavedTeam}
        onLoadPreset={onLoadPreset}
        showToast={showToast}
        defaultSort={settings.compSort}
        defaultPageSize={settings.compPageSize}
      />

      <SaveTeamModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        teamName={teamName}
        onSaveToBrowser={handleSaveToBrowser}
        onSavePresetFile={handleSavePresetFile}
        describePreset={describePreset}
        teamExists={teamExists}
        isComplete={teamValidation.isComplete}
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

/** Un interruptor de contenido opcional: encendido tiene color, apagado gris. */
const ContentToggle = ({ on, onClick, title, icon: Icon, label, short, onClasses, fillWhenOn }) => (
  <button
    onClick={onClick}
    type="button"
    aria-pressed={on}
    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded transition-colors border-2 text-sm sm:text-base ${
      on ? onClasses : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600 text-gray-400'
    }`}
    title={title}
  >
    <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${fillWhenOn && on ? 'fill-current' : ''}`} />
    <span className="hidden sm:inline font-darkest">{label}</span>
    <span className="sm:hidden">{short}</span>
  </button>
);

export default TeamControls;