import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Save, FileJson, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';

/**
 * Elegir DONDE se guarda el equipo. Son dos sitios distintos con dos nombres
 * distintos, y esa es la razon de que haya un dialogo en vez de dos botones:
 *
 *   · Navegador   — tus equipos, con el nombre que tu les pones.
 *   · Comp preset — un .json ya renombrado por la taxonomia, para soltarlo en
 *                   src/data/presetComps. Ahi el nombre no es tuyo: lo decide el
 *                   PLAN que ejecuta la party, y tu nombre pasa a alias.
 *
 * Y el fichero no se llama como el nombre. El nombre lo comparten varias comps a
 * proposito, asi que quien separa es el reparto de clases: se ensenan los dos
 * porque son dos cosas distintas, no un nombre y su version con guiones.
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
  // Cual de las coincidencias se sustituye. Normalmente hay una; cuando hay
  // varias es porque la libreria ya lleva dos comps con la misma region y las
  // mismas cuatro clases, y entonces hay que elegir.
  const [updateKey, setUpdateKey] = useState(null);
  const confirmRef = useRef(null);

  // Nombrar una comp es compararla con la libreria entera: solo al abrir.
  const preset = useMemo(() => (isOpen ? describePreset() : null), [isOpen, describePreset]);
  const overwrites = isOpen && target === 'browser' && teamExists?.(teamName);

  const updates = preset?.updates || [];
  const chosenUpdate = updates.find((u) => u.key === updateKey) || updates[0] || null;

  useEffect(() => {
    if (isOpen) { setTarget('browser'); setUpdateKey(null); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && confirmRef.current) confirmRef.current.focus();
  }, [isOpen]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="save-team-title"
      panelClassName="bg-gray-800 border-2 rounded-lg p-6 max-w-lg w-full shadow-2xl"
      panelStyle={{ borderColor: 'var(--dd-gold)' }}
    >
        <h3 id="save-team-title" className="font-darkest text-lg text-dd-parchment tracking-wide">Save Team</h3>
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

          {updates.length > 0 && option('update', <RefreshCw size={16} />, 'Update an existing comp', (
            <>
              <p>
                Rewrites <span className="text-dd-parchment">“{chosenUpdate?.teamName}”</span> in
                place — same region, same four classes.
              </p>
              <p className="font-mono text-xs text-gray-500 break-all">{chosenUpdate?.key}.json</p>
              <p className="text-gray-500">
                Keeps its name; replaces its heroes. Drop it in and it overwrites the file.
              </p>
              {updates.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {updates.map((u) => (
                    <span
                      key={u.key}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setTarget('update'); setUpdateKey(u.key); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          setTarget('update');
                          setUpdateKey(u.key);
                        }
                      }}
                      className={`px-2 py-0.5 text-xs rounded border cursor-pointer ${
                        chosenUpdate?.key === u.key
                          ? 'border-dd-gold bg-dd-gold/15 text-dd-parchment'
                          : 'border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {u.teamName}
                    </span>
                  ))}
                </div>
              )}
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
        {/* Una generalista de verdad: ni motor ni figura destacan sobre la
            libreria, y el nombre lo admite. Vale la pena decirlo, porque si
            crees que esta party SI hace algo concreto, lo que falta es un eje
            que lo mida. */}
        {target === 'preset' && preset?.kind === 'even' && (
          <div className="mt-4 flex items-start gap-2 text-sm text-amber-300 bg-amber-900/20 border border-amber-700/50 rounded p-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              Nothing this party does stands out from the library, so “{preset?.name}” names how
              even it is instead of a plan. If it does have one, compAxes.js is not measuring it yet.
            </span>
          </div>
        )}
        {target === 'update' && (
          <div className="mt-4 flex items-start gap-2 text-sm text-sky-300 bg-sky-900/20 border border-sky-700/50 rounded p-2">
            <Check size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              The taxonomy is not re-run on a replacement — “{chosenUpdate?.teamName}” keeps its
              name until <span className="font-mono text-xs">nameComps.v2.js --apply</span> reads
              the library again.
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
            onClick={() => {
              if (target === 'browser') return onSaveToBrowser();
              return onSavePresetFile(target === 'update' ? chosenUpdate : undefined);
            }}
            className="px-4 py-2 rounded border transition-colors text-sm font-semibold bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold border-dd-gold/50"
          >
            {target === 'browser' && (overwrites ? 'Overwrite' : 'Save')}
            {target === 'preset' && 'Download'}
            {target === 'update' && 'Replace it'}
          </button>
        </div>
    </Modal>
  );
};

export default SaveTeamModal;
