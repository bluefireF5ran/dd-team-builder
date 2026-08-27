import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, FileJson, AlertTriangle, Check } from 'lucide-react';

/**
 * Elegir DONDE se guarda el equipo. Son dos sitios distintos con dos nombres
 * distintos, y esa es la razon de que haya un dialogo en vez de dos botones:
 *
 *   · Navegador   — tus equipos, con el nombre que tu les pones.
 *   · Comp preset — un .json ya renombrado por la taxonomia, para soltarlo en
 *                   src/data/presetComps. Ahi el nombre no es tuyo: lo decide la
 *                   familia a la que pertenece la comp, y tu nombre pasa a alias.
 *
 * El nombre taxonomico se calcula al abrir (`describePreset`) y se ensena antes
 * de guardar, porque es justo lo que va a cambiar respecto a lo que escribiste.
 */
const SaveTeamModal = ({
  isOpen,
  onClose,
  teamName,
  onSaveToBrowser,
  onSavePresetFile,
  describePreset,
  teamExists,
  isComplete = true
}) => {
  const [target, setTarget] = useState('browser');
  const confirmRef = useRef(null);

  // Nombrar una comp es compararla con la libreria entera: solo al abrir.
  const preset = useMemo(() => (isOpen ? describePreset() : null), [isOpen, describePreset]);
  const overwrites = isOpen && target === 'browser' && teamExists?.(teamName);

  useEffect(() => {
    if (isOpen) setTarget('browser');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && confirmRef.current) confirmRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const option = (id, icon, title, children) => {
    const active = target === id;
    return (
      <button
        type="button"
        onClick={() => setTarget(id)}
        className={`w-full text-left rounded border-2 p-3 transition-colors ${
          active
            ? 'bg-dd-gold/10 border-dd-gold/60'
            : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={active ? 'text-dd-gold' : 'text-gray-400'}>{icon}</span>
          <span className={`font-darkest tracking-wide ${active ? 'text-dd-gold' : 'text-dd-parchment'}`}>
            {title}
          </span>
          {active && <Check size={14} className="text-dd-gold ml-auto" />}
        </div>
        <div className="mt-2 text-sm text-gray-400 space-y-1">{children}</div>
      </button>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg p-6 max-w-lg w-full shadow-2xl"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-darkest text-lg text-dd-parchment tracking-wide">Save Team</h3>
        <p className="text-gray-400 text-sm mt-1">Where should this party go?</p>

        <div className="mt-4 space-y-3">
          {option('browser', <Save size={16} />, 'Browser storage', (
            <>
              <p>
                Keeps your own name: <span className="text-dd-parchment">“{teamName}”</span>
              </p>
              <p className="text-gray-500">Shows up under “My Teams” in the comp library.</p>
            </>
          ))}

          {option('preset', <FileJson size={16} />, 'Preset comp file', (
            <>
              <p>
                Named by the taxonomy: <span className="text-dd-parchment">“{preset?.name}”</span>
              </p>
              <p className="font-mono text-xs text-gray-500 break-all">{preset?.fileName}</p>
              {preset?.alias ? (
                <p className="text-gray-500">
                  Your name is kept as the alias: <span className="text-gray-400">“{preset.alias}”</span>
                </p>
              ) : null}
              <p className="text-gray-500">Downloads a .json to drop into src/data/presetComps.</p>
            </>
          ))}
        </div>

        {/* Avisos: dos cosas que conviene saber ANTES de pulsar guardar. */}
        {target === 'browser' && overwrites && (
          <div className="mt-4 flex items-start gap-2 text-sm text-amber-300 bg-amber-900/20 border border-amber-700/50 rounded p-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>A team named “{teamName}” is already saved. Saving overwrites it.</span>
          </div>
        )}
        {target === 'preset' && preset?.familySource !== 'signature' && (
          <div className="mt-4 flex items-start gap-2 text-sm text-amber-300 bg-amber-900/20 border border-amber-700/50 rounded p-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              No family signature matched this party, so “{preset?.family}” comes from its dominant
              mechanic. It may deserve a signature of its own in compTaxonomy.js.
            </span>
          </div>
        )}
        {target === 'preset' && !isComplete && (
          <div className="mt-4 flex items-start gap-2 text-sm text-amber-300 bg-amber-900/20 border border-amber-700/50 rounded p-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>This party has empty slots — the name is derived from the heroes it does have.</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={() => (target === 'browser' ? onSaveToBrowser() : onSavePresetFile())}
            className="px-4 py-2 rounded border transition-colors text-sm font-semibold bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold border-dd-gold/50"
          >
            {target === 'browser' ? (overwrites ? 'Overwrite' : 'Save') : 'Download'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveTeamModal;
