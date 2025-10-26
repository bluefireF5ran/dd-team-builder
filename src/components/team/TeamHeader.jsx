import React from 'react';
import { LOCATIONS } from '../../data/locations';

const TeamHeader = ({ teamName, onTeamNameChange, location, onLocationChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder="Enter team name..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Preferred Location</label>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
        >
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TeamHeader;