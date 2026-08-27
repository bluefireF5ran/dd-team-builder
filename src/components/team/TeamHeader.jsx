import React, { useState } from 'react';
import { Map } from 'lucide-react';
import { LOCATIONS, getLocationTheme } from '../../data/locations';
import QuestMapModal from './QuestMapModal';

const TeamHeader = ({ teamName, onTeamNameChange, location, onLocationChange }) => {
  const [showMap, setShowMap] = useState(false);
  const theme = getLocationTheme(location);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
      <div className="sm:col-span-2 lg:col-span-2">
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-dd-parchment font-darkest tracking-wide">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="w-full bg-gray-800/80 text-dd-parchment px-3 sm:px-4 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors font-darkest text-lg sm:text-xl placeholder-gray-500"
          placeholder="Enter team name..."
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-dd-parchment font-darkest tracking-wide">Preferred Location</label>
        <div className="flex gap-2">
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            // El color de la zona entra por el borde, igual que en las tarjetas
            // de la libreria: la misma pista visual en los dos sitios.
            className="flex-1 min-w-0 bg-gray-800/80 text-dd-parchment px-3 sm:px-4 py-2 rounded border-2 focus:border-dd-gold focus:outline-none transition-colors font-darkest text-lg sm:text-xl"
            style={{ borderColor: theme.accent }}
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc} className="bg-gray-800">{loc}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            title="Pick on the quest map"
            aria-label="Pick on the quest map"
            className="shrink-0 px-3 rounded border-2 border-gray-700 bg-gray-800/80 text-gray-400 hover:text-dd-gold hover:border-dd-gold/60 transition-colors"
          >
            <Map size={20} />
          </button>
        </div>
      </div>

      <QuestMapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        location={location}
        onSelect={onLocationChange}
      />
    </div>
  );
};

export default TeamHeader;
