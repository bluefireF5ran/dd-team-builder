import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Dice5, X, Check, Users, RotateCcw, Sparkles, Upload, FolderOpen, PackageCheck, BedDouble, Gem, Brain } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import {
  ALL_HERO_NAMES,
  VANILLA_HERO_NAMES,
  MODDED_HERO_NAMES,
  getHeroDefinition,
  isVanillaHero
} from '../../utils/rankerItems';
import { getHeroImagePath } from '../../utils/imageHelper';
import { ROSTER_STORAGE_KEY } from '../../config/rankerRoster';
import { parseRosterFile } from '../../utils/rosterLoader';
import { toRosterCounts, countOf, rosterFromHeroes, isHeroAvailable } from '../../utils/rosterAvailability';
import { STRESS_CONFIG, clampStress, isStrained } from '../../utils/heroStress';
import { PARTY_CONFIG } from '../../constants';

import { generateComp, generateComps } from '../../utils/compGenerator';

export const SUGGEST_ROSTER_KEY = 'dd_team_builder_suggest_roster_v1';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — keep working in memory.
  }
};

const HeroPortrait = ({ name, className = '' }) => (
  <ImageWithFallback
    src={getHeroImagePath(name)}
    alt={name}
    className={`object-cover ${className}`}
    fallback={
      <div className={`flex items-center justify-center bg-gray-700 text-gray-400 text-xs ${className}`}>
        {name.charAt(0)}
      </div>
    }
  />
);

/** A small on/off pill, matching the switches on the header row. */
const OptionToggle = ({ on, onClick, icon: Icon, label, title }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    title={title}
    className={`px-2.5 py-1.5 text-xs rounded border transition-colors inline-flex items-center gap-1.5 ${
      on
        ? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-300'
        : 'border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200'
    }`}
  >
    <Icon size={12} />
    {label}
  </button>
);

const SuggestCompModal = ({
  isOpen,
  onClose,
  onSuggest,
  onGenerate,
  showModdedHeroes = false,
  saveProfile = null,
  initialRoster = null,
  showToast
}) => {
  // A list **with repeats**: two Plague Doctors appear twice, because a comp
  // that runs two of a class needs you to own two. A roster stored before this
  // existed is a list of unique names, which reads as one of each.
  const [roster, setRoster] = useState([]);
  const [query, setQuery] = useState('');
  // Only meaningful with a save imported; all remembered per session only.
  const [skipBusy, setSkipBusy] = useState(true);
  const [requireOwnedTrinkets, setRequireOwnedTrinkets] = useState(false);
  const [reequip, setReequip] = useState(true);
  const [preferRested, setPreferRested] = useState(true);

  const counts = useMemo(() => toRosterCounts(roster), [roster]);
  const busyCount = useMemo(
    () => (saveProfile?.heroes || []).filter((hero) => !isHeroAvailable(hero)).length,
    [saveProfile]
  );
  // The switch is worth showing the moment any hero carries stress; the count
  // it advertises is the heroes a player would actually think twice about, and
  // it follows "skip busy" — a hero in the Abbey is not in the draw at all, so
  // counting their stress here would be counting someone who cannot come.
  const stressedHeroes = useMemo(
    () =>
      (saveProfile?.heroes || []).filter(
        (hero) => (!skipBusy || isHeroAvailable(hero)) && clampStress(hero.stress) > 0
      ),
    [saveProfile, skipBusy]
  );
  const strainedCount = useMemo(() => stressedHeroes.filter(isStrained).length, [stressedHeroes]);

  const heroPool = useMemo(() => (showModdedHeroes ? ALL_HERO_NAMES : VANILLA_HERO_NAMES), [showModdedHeroes]);

  // Keeps repeats (that is the whole point) but drops names this app does not
  // know and caps a class at the party size — a fifth Jester can never matter.
  const normalizeRoster = useCallback(
    (names) => {
      const used = new Map();
      const out = [];
      names.forEach((name) => {
        if (!heroPool.includes(name) || !getHeroDefinition(name)) return;
        const already = used.get(name) || 0;
        if (already >= PARTY_CONFIG.MAX_HEROES) return;
        used.set(name, already + 1);
        out.push(name);
      });
      return out;
    },
    [heroPool]
  );

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    // Priority: an explicit hand-over (the Import Save modal) → the roster you
    // last edited here → the ranker's → all vanilla heroes.
    const stored = readJSON(SUGGEST_ROSTER_KEY, null);
    const rankerRoster = readJSON(ROSTER_STORAGE_KEY, null);
    const fallback = showModdedHeroes ? [...VANILLA_HERO_NAMES, ...MODDED_HERO_NAMES] : VANILLA_HERO_NAMES;

    const initial = Array.isArray(initialRoster) && initialRoster.length
      ? initialRoster
      : Array.isArray(stored) && stored.length
      ? stored
      : Array.isArray(rankerRoster) && rankerRoster.length
      ? rankerRoster
      : fallback;

    // `normalizeRoster`, not a `Set`: deduplicating here would quietly flatten
    // "I have two Plague Doctors" back to one every time the modal reopened.
    const valid = normalizeRoster(initial);
    setRoster(valid.length ? valid : fallback);
    if (Array.isArray(initialRoster) && valid.length) writeJSON(SUGGEST_ROSTER_KEY, valid);
  }, [isOpen, heroPool, showModdedHeroes, initialRoster, normalizeRoster]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const setRosterAndSave = useCallback(
    (next) => {
      const valid = normalizeRoster(next);
      setRoster(valid);
      writeJSON(SUGGEST_ROSTER_KEY, valid);
    },
    [normalizeRoster]
  );

  /** 0 -> 1 -> 2 -> 3 -> 4 -> 0. One click is "I have one", two is "I have two". */
  const cycleHero = (name) => {
    const next = (countOf(counts, name) + 1) % (PARTY_CONFIG.MAX_HEROES + 1);
    setRosterAndSave([...roster.filter((entry) => entry !== name), ...Array(next).fill(name)]);
  };

  const useRankerRoster = () => {
    const rankerRoster = readJSON(ROSTER_STORAGE_KEY, []);
    const valid = rankerRoster.filter((name) => heroPool.includes(name) && getHeroDefinition(name));
    if (valid.length >= 4) {
      setRosterAndSave(valid);
      showToast?.('Roster loaded from Ranker', 'success');
    } else {
      showToast?.('Ranker roster has too few heroes', 'warning');
    }
  };

  // The expansion keeps duplicates, so two Plague Doctors on the roster are two
  // here, and comps that field two of a class become available.
  const applySaveRoster = useCallback(
    (options = {}) => {
      const { quiet = false, includeBusy = !skipBusy } = options;
      const names = rosterFromHeroes(saveProfile?.heroes, { includeBusy });
      const valid = normalizeRoster(names);
      if (valid.length < PARTY_CONFIG.MAX_HEROES) {
        if (!quiet) {
          showToast?.(
            busyCount && !includeBusy
              ? `Only ${valid.length} heroes are free this week — turn off "Skip busy" to include the rest.`
              : 'The imported save has too few usable heroes',
            'warning'
          );
        }
        return false;
      }
      setRosterAndSave(valid);
      if (!quiet) {
        showToast?.(
          `Roster loaded from your ${saveProfile.estateName || 'imported'} save (${valid.length} heroes)`,
          'success'
        );
      }
      return true;
    },
    [saveProfile, skipBusy, busyCount, normalizeRoster, setRosterAndSave, showToast]
  );

  const useSaveRoster = () => applySaveRoster();

  const resetToVanilla = () => setRosterAndSave([...VANILLA_HERO_NAMES]);
  const selectAll = () => setRosterAndSave([...heroPool]);
  const clearAll = () => setRosterAndSave([]);

  const handleSuggest = () => {
    if (roster.length < PARTY_CONFIG.MAX_HEROES) {
      showToast?.('Select at least 4 heroes in your roster', 'warning');
      return;
    }
    onSuggest?.(roster, { requireOwnedTrinkets, reequip, preferRested });
    onClose?.();
  };

  /**
   * Construir una comp nueva en vez de buscar una que ya exista.
   *
   * Es la salida para el reproche de siempre: la libreria esta repartida como
   * esta -- 97 de 704 ranuras son Houndmaster-- asi que buscar solo funciona si
   * tienes las clases de las que ya hay comps escritas. Esto monta una con los
   * heroes que hay, colocando a cada uno donde su kit funciona.
   *
   * Y NUEVA: nunca devuelve un reparto que ya este en la libreria, aunque
   * cambie el orden o la region. Los mismos cuatro heroes con otra etiqueta no
   * son una comp nueva.
   */
  const handleGenerate = () => {
    if (roster.length < PARTY_CONFIG.MAX_HEROES) {
      showToast?.('Select at least 4 heroes in your roster', 'warning');
      return;
    }
    const comp = generateComp({ roster });
    if (!comp) {
      // Tres fracasos distintos, y cual es cual cambia lo que hay que hacer:
      // "ya lo tienes" pide mas heroes, "solo saldrian dobles" pide mas
      // *clases*, y "no se puede montar nada" es un roster que no da ni para
      // cuatro. Un solo mensaje para los tres manda a la gente al sitio
      // equivocado.
      const known = generateComps({ roster, count: 1, excludeKnown: false });
      if (known.length) {
        showToast?.(
          'Every party this roster can field is already in the comp library — add more heroes to build something new.',
          'warning'
        );
        return;
      }
      const doubled = generateComps({
        roster,
        count: 1,
        excludeKnown: false,
        allowRepeatClass: true
      });
      showToast?.(
        doubled.length
          ? 'Every party this roster can field would double a class. Those are in the library on purpose, but they are not suggested — add more classes to build something new.'
          : 'Could not build a comp from that roster.',
        doubled.length ? 'warning' : 'error'
      );
      return;
    }
    onGenerate?.(comp);
    onClose?.();
  };

  const handleLoadRosterFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const valid = await parseRosterFile(file, heroPool);

      if (valid.length < 4) {
        showToast?.(`Only ${valid.length} valid heroes found. Need at least 4.`, 'warning');
      } else {
        setRosterAndSave(valid);
        showToast?.(`Loaded ${valid.length} heroes from ${file.name}`, 'success');
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to load roster file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const filteredHeroes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? heroPool.filter((name) => name.toLowerCase().includes(q)) : heroPool;
  }, [heroPool, query]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg p-5 sm:p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-darkest text-xl text-dd-parchment tracking-wide flex items-center gap-2">
              <Sparkles size={20} className="text-dd-gold" />
              Suggest a Comp
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Pick the heroes you have available, then roll a random party from your roster.
              Click a hero again for a second copy — a comp that fields two of a class is only
              offered if you own two.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-dd-parchment hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm text-gray-300">
            <span className="font-darkest text-dd-gold">{roster.length}</span> hero{roster.length !== 1 ? 'es' : ''} selected
            {counts.size !== roster.length && (
              <span className="text-gray-500 ml-1.5">({counts.size} classes)</span>
            )}
            {roster.length < PARTY_CONFIG.MAX_HEROES && (
              <span className="text-amber-400 ml-2">(need at least 4)</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="px-2.5 py-1.5 text-xs rounded border border-dd-gold/50 bg-dd-gold/10 hover:bg-dd-gold/20 text-dd-gold transition-colors cursor-pointer inline-flex items-center gap-1.5">
              <Upload size={12} />
              Load roster.json
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleLoadRosterFile}
                className="hidden"
              />
            </label>
            {saveProfile?.heroClasses?.length ? (
              <button
                onClick={useSaveRoster}
                className="px-2.5 py-1.5 text-xs rounded border border-emerald-600/60 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300 transition-colors inline-flex items-center gap-1.5"
                title="Use only the classes your imported save actually has"
              >
                <FolderOpen size={12} /> Use Save Roster
              </button>
            ) : null}
            <button
              onClick={useRankerRoster}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
              title="Load the roster configured in the Ranking Engine"
            >
              Use Ranker Roster
            </button>
            <button
              onClick={resetToVanilla}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
            >
              All Vanilla
            </button>
            <button
              onClick={selectAll}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        {saveProfile ? (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {busyCount > 0 && (
              <OptionToggle
                on={skipBusy}
                onClick={() => {
                  const next = !skipBusy;
                  setSkipBusy(next);
                  applySaveRoster({ quiet: true, includeBusy: !next });
                }}
                icon={BedDouble}
                label={`Skip ${busyCount} busy in town`}
                title="A hero locked into the Abbey, Tavern or Sanitarium cannot go out this week"
              />
            )}
            {stressedHeroes.length > 0 && (
              <OptionToggle
                on={preferRested}
                onClick={() => setPreferRested((prev) => !prev)}
                icon={Brain}
                label={
                  strainedCount
                    ? `Favour rested (${strainedCount} stressed)`
                    : 'Favour rested heroes'
                }
                title={`A comp that would field your most stressed heroes is offered far less often${
                  strainedCount
                    ? ` — ${strainedCount} of yours ${strainedCount === 1 ? 'is' : 'are'} at ${
                        STRESS_CONFIG.STRAINED
                      }+ stress`
                    : ''
                }. Nobody is excluded, so a tired roster still gets an answer.`}
              />
            )}
            {saveProfile.ownedTrinkets?.length > 0 && (
              <OptionToggle
                on={reequip}
                onClick={() => setReequip((prev) => !prev)}
                icon={Gem}
                label="Re-equip from my trinkets"
                title="Swap the comp's trinkets for the closest thing you own — matched on what they do, not on the name"
              />
            )}
            {saveProfile.ownedTrinkets?.length > 0 && (
              <OptionToggle
                on={requireOwnedTrinkets}
                onClick={() => setRequireOwnedTrinkets((prev) => !prev)}
                icon={PackageCheck}
                label="Only comps I can fully equip"
                title={`Prefer comps whose trinkets are all in your ${saveProfile.ownedTrinkets.length}-trinket inventory`}
              />
            )}
          </div>
        ) : null}

        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter heroes..."
            className="w-full bg-gray-900/80 text-dd-parchment pl-3 pr-3 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto pr-1 mb-4 max-h-72">
          {filteredHeroes.map((name) => {
            const owned = countOf(counts, name);
            const isActive = owned > 0;
            return (
              <button
                key={name}
                onClick={() => cycleHero(name)}
                className={`relative rounded border-2 overflow-hidden bg-gray-900 transition-all ${
                  isActive
                    ? 'border-dd-gold/70 ring-1 ring-dd-gold/40'
                    : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'
                }`}
                title={`${name}${isVanillaHero(name) ? '' : ' (modded)'}${
                  owned ? ` — you have ${owned}` : ''
                }. Click to change how many you have.`}
              >
                <HeroPortrait name={name} className="w-full h-14 sm:h-16" />
                <span className="block text-[9px] leading-tight text-gray-300 px-0.5 py-1 truncate">
                  {name}
                </span>
                <span
                  className={`absolute top-0.5 right-0.5 rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold leading-none ${
                    isActive ? 'bg-dd-gold text-gray-900' : 'bg-gray-800/80 text-gray-400'
                  }`}
                >
                  {owned > 1 ? `×${owned}` : isActive ? <Check size={11} /> : <Users size={11} />}
                </span>
              </button>
            );
          })}
          {filteredHeroes.length === 0 && (
            <p className="col-span-full text-sm text-gray-500 text-center py-6">
              No heroes match your filter.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={roster.length < 4}
            title="Build a new comp from this roster instead of looking one up"
            className={`px-4 py-2 rounded border transition-colors text-sm font-semibold inline-flex items-center gap-2 ${
              roster.length < 4
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                : 'bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border-purple-600/50'
            }`}
          >
            <Sparkles size={16} />
            Build New Comp
          </button>
          <button
            onClick={handleSuggest}
            disabled={roster.length < 4}
            className={`px-4 py-2 rounded border transition-colors text-sm font-semibold inline-flex items-center gap-2 ${
              roster.length < 4
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                : 'bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold border-dd-gold/50'
            }`}
          >
            <Dice5 size={16} />
            Suggest Comp
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SuggestCompModal;
