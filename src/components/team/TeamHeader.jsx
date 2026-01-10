import React from 'react';
import { LOCATIONS } from '../../data/locations';

const TeamHeader = ({ teamName, onTeamNameChange, location, onLocationChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
      <div className="sm:col-span-2 lg:col-span-2">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-dd-parchment font-darkest tracking-wide">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="w-full bg-gray-800/80 text-dd-parchment px-3 sm:px-4 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors font-darkest text-base sm:text-lg placeholder-gray-500"
          placeholder="Enter team name..."
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-dd-parchment font-darkest tracking-wide">Preferred Location</label>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full bg-gray-800/80 text-dd-parchment px-3 sm:px-4 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors font-darkest text-base sm:text-lg"
        >
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc} className="bg-gray-800">{loc}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TeamHeader;