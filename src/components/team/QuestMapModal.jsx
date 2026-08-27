import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';
import { getLocationTheme } from '../../data/locations';
import { QUEST_MAP_IMAGE, QUEST_MAP_NODES, toMapPercent } from '../../data/questMap';
import { getAssetUrl } from '../../config/assets';

/**
 * Elegir zona sobre el mapa de misiones, como en la pantalla de Quest Select.
 * El desplegable sigue estando: esto no lo sustituye, lo acompaña. Un nombre en
 * una lista no dice donde cae la zona ni con cual limita, y media libreria de
 * comps esta construida alrededor de eso.
 *
 * La imagen es decorado. Si el asset no esta (vive en el repo externo, como el
 * resto del arte), los nodos siguen colocados y siguen siendo clicables sobre
 * un panel oscuro: el mapa se degrada a una lista posicionada.
 */
const QuestMapModal = ({ isOpen, onClose, location, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const anyEstimated = QUEST_MAP_NODES.some((n) => n.estimated);

  const pick = (loc) => {
    onSelect?.(loc);
    onClose?.();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg p-4 sm:p-6 w-full max-w-5xl shadow-2xl"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a location on the quest map"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-darkest text-lg text-dd-parchment tracking-wide">Quest Map</h3>
            <p className="text-gray-400 text-sm mt-1">
              Pick the dungeon this party is built for.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded text-gray-400 hover:text-dd-parchment hover:bg-black/40 transition-colors"
            type="button"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sin overflow-hidden: los nodos de arriba (`The Arena`, y 15) se salen
            medio cuerpo del mapa y recortarlos los dejaria sin etiqueta. */}
        <div className="relative mt-4 w-full rounded border border-gray-700 bg-gray-950" style={{ aspectRatio: '16 / 9' }}>
          {!imageFailed && (
            <img
              src={getAssetUrl(QUEST_MAP_IMAGE)}
              alt="Quest map"
              className="absolute inset-0 w-full h-full object-cover rounded opacity-80"
              onError={() => setImageFailed(true)}
            />
          )}

          {QUEST_MAP_NODES.map((node) => {
            const theme = getLocationTheme(node.location);
            const active = node.location === location;
            return (
              <button
                key={node.location}
                type="button"
                onClick={() => pick(node.location)}
                title={node.location}
                aria-current={active ? 'true' : undefined}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-1 rounded transition-transform hover:scale-110 focus:scale-110 focus:outline-none ${
                  active ? 'z-20 scale-110' : 'z-10'
                }`}
                style={toMapPercent(node)}
              >
                <span
                  className={`block w-3 h-3 rounded-full border shadow-lg ${
                    active ? 'border-dd-gold' : 'border-black/60'
                  }`}
                  style={{ background: theme.accent, borderWidth: active ? 2 : 1 }}
                />
                <span
                  className={`font-darkest text-[11px] leading-none whitespace-nowrap px-1.5 py-1 rounded shadow-lg ${
                    active ? 'ring-1 ring-dd-gold' : ''
                  }`}
                  style={{ background: theme.accent, color: theme.ink }}
                >
                  {theme.short}
                  {node.estimated && <span className="opacity-60"> ?</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-dd-gold" />
            <span className="text-dd-parchment">{location || 'No location'}</span>
          </span>
          {anyEstimated && (
            <span>
              <span className="text-dd-parchment">?</span> — mod not installed locally, so the pin is
              a free spot on the map rather than the mod's own position.
            </span>
          )}
          {imageFailed && (
            <span>
              Map art missing from the assets repo (images/map/quest_map.png) — pins still work.
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuestMapModal;
