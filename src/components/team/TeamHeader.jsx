import React, { useState } from 'react';
import { Map, Play, Video } from 'lucide-react';
import { LOCATIONS, getLocationTheme } from '../../data/locations';
import QuestMapModal from './QuestMapModal';
import VideoModal from '../common/VideoModal';
import { isVideoLink } from '../../utils/videoLink';

/**
 * Lo que la comp ES antes de tener heroes: como se llama, donde se juega y --
 * desde ahora-- donde se la ve jugar. El video esta aqui y no entre los botones
 * porque no es una accion sobre el equipo: es un dato suyo, como los otros dos,
 * y se guarda, se comparte y se carga con ellos.
 */
const TeamHeader = ({ teamName, onTeamNameChange, location, onLocationChange, video = '', onVideoChange }) => {
  const [showMap, setShowMap] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const theme = getLocationTheme(location);
  const playable = isVideoLink(video);
  // Un campo vacio no es un error: es que esta comp no tiene video. Solo se
  // avisa de lo que se ha escrito y no se puede reproducir.
  const wrong = !!video.trim() && !playable;

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

      <div className="sm:col-span-2 lg:col-span-3">
        <label
          htmlFor="team-video"
          className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-dd-parchment font-darkest tracking-wide"
        >
          Guide Video <span className="text-gray-500 font-sans text-xs tracking-normal">— a YouTube link showing the comp in play</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Video
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${playable ? 'text-dd-gold' : 'text-gray-500'}`}
              aria-hidden="true"
            />
            <input
              id="team-video"
              type="url"
              value={video}
              onChange={(e) => onVideoChange?.(e.target.value)}
              aria-invalid={wrong}
              aria-describedby={wrong ? 'team-video-error' : undefined}
              className={`w-full bg-gray-800/80 text-dd-parchment pl-10 pr-3 sm:pr-4 py-2 rounded border-2 focus:outline-none transition-colors placeholder-gray-500 text-sm sm:text-base ${
                wrong ? 'border-red-900 focus:border-red-700' : 'border-gray-700 focus:border-dd-gold'
              }`}
              placeholder="https://youtu.be/... (optional)"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            disabled={!playable}
            title={playable ? 'Watch the guide video' : 'Paste a YouTube link first'}
            aria-label="Watch the guide video"
            className="shrink-0 px-3 rounded border-2 border-gray-700 bg-gray-800/80 text-gray-400 enabled:hover:text-dd-gold enabled:hover:border-dd-gold/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={20} />
          </button>
        </div>
        {wrong && (
          <p id="team-video-error" className="mt-1 text-xs text-red-400">
            That is not a YouTube link — the comp keeps it, but there is nothing to play.
          </p>
        )}
      </div>

      <VideoModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        video={video}
        title={teamName || 'Guide video'}
      />

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
