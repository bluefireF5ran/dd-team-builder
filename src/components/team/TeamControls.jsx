import React from 'react';
import { Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { validateTeam } from '../../utils/validation';

const TeamControls = ({ heroes, onSave, onLoad }) => {
  const teamValidation = validateTeam(heroes);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoad(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          <Save size={18} />
          Save Team
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors">
          <Upload size={18} />
          Load Team
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
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
  );
};

export default TeamControls;