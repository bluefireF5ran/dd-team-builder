import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Upload, FolderOpen, Trash2, Users, Sparkles, AlertTriangle, Gem, Loader2, Heart, Brain
} from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { getHeroImagePath, isModdedHero } from '../../utils/imageHelper';
import { quirkClasses } from '../../utils/quirkStyle';
import { toBuilderHero, SAVE_FILES } from '../../utils/saveParser';
import { PARTY_CONFIG } from '../../constants';
import { rosterFromHeroes, isHeroAvailable } from '../../utils/rosterAvailability';

/**
 * Reads a Darkest Dungeon profile folder and puts the heroes you actually own
 * in front of you.
 *
 * The unit here is a **hero, not a class**. Two Plague Doctors are two rows,
 * because they are two different heroes with different quirks and different
 * trinkets, and picking between them is the whole point. That is also why
 * selection is ordered: the badge on a picked hero is the rank they will stand
 * in, 1 at the front, matching `heroes[0]` everywhere else in the app.
 *
 * Where the save lives is the one thing a player reliably does not know, so the
 * empty state says it rather than assuming.
 */

const SAVE_LOCATIONS = [
  ['Windows', '%USERPROFILE%\\Documents\\Darkest\\profile_0'],
  ['Steam Cloud', 'Steam\\userdata\\<id>\\262060\\remote\\profile_0'],
  ['macOS / Linux', '~/Documents/Darkest/profile_0']
];

const Badge = ({ children, className = '' }) => (
  <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none border ${className}`}>{children}</span>
);

const QuirkChip = ({ name, fallback, locked }) => (
  <span
    className={`px-1.5 py-0.5 rounded text-[10px] leading-none border ${quirkClasses(name, fallback).chip}`}
    title={locked ? `${name} (locked)` : name}
  >
    {locked ? '🔒 ' : ''}
    {name}
  </span>
);

const HeroRow = ({ hero, rank, onToggle, dimmed }) => {
  const modded = isModdedHero(hero.heroClass);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left flex items-start gap-3 p-2.5 rounded border-2 transition-colors ${
        rank
          ? 'border-dd-gold/70 bg-dd-gold/10'
          : 'border-gray-700 bg-gray-900/60 hover:border-gray-500'
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <div className="relative shrink-0">
        <ImageWithFallback
          src={getHeroImagePath(hero.heroClass)}
          alt={hero.heroClass}
          className="w-12 h-12 object-cover rounded bg-gray-800"
          fallback={
            <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center text-gray-400">
              {hero.heroClass.charAt(0)}
            </div>
          }
        />
        {rank ? (
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-dd-gold text-gray-900 text-[11px] font-bold flex items-center justify-center">
            {rank}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-dd-parchment text-sm font-semibold truncate">{hero.name || 'Unnamed'}</span>
          <span className="text-gray-400 text-xs">{hero.heroClass}</span>
          {modded && <Badge className="border-purple-700/50 bg-purple-900/40 text-purple-300">modded</Badge>}
          <Badge className="border-gray-600 bg-gray-800 text-gray-300">XP {hero.resolveXp}</Badge>
          {hero.stress > 0 && (
            <Badge className="border-amber-700/50 bg-amber-900/30 text-amber-300">
              <Brain size={9} className="inline -mt-0.5 mr-0.5" />
              {hero.stress}
            </Badge>
          )}
          {hero.currentHp !== null && (
            <Badge className="border-red-800/50 bg-red-900/30 text-red-300">
              <Heart size={9} className="inline -mt-0.5 mr-0.5" />
              {hero.currentHp}
            </Badge>
          )}
          {hero.activity && (
            <Badge className="border-blue-700/50 bg-blue-900/30 text-blue-300">in {hero.activity}</Badge>
          )}
        </div>

        {(hero.trinket1 || hero.trinket2) && (
          <p className="text-[11px] text-dd-gold/80 mt-1 truncate">
            <Gem size={10} className="inline -mt-0.5 mr-1" />
            {[hero.trinket1, hero.trinket2].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-1.5">
          {hero.quirks.positive.map((q) => (
            <QuirkChip key={q} name={q} fallback="positive" locked={hero.lockedQuirks.positive.includes(q)} />
          ))}
          {hero.quirks.negative.map((q) => (
            <QuirkChip key={q} name={q} fallback="negative" locked={hero.lockedQuirks.negative.includes(q)} />
          ))}
          {hero.diseases.map((d) => (
            <QuirkChip key={d} name={d} fallback="disease" />
          ))}
        </div>
      </div>
    </button>
  );
};

const ImportSaveModal = ({
  isOpen,
  onClose,
  profile,
  onImportFiles,
  onClearProfile,
  onSendToParty,
  onUseAsRoster,
  showToast
}) => {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const folderInput = useRef(null);

  // A directory picker is not expressible in JSX, so the attributes go on
  // after mount. Browsers without it still get the multi-file input below.
  useEffect(() => {
    if (folderInput.current) {
      folderInput.current.setAttribute('webkitdirectory', '');
      folderInput.current.setAttribute('directory', '');
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return undefined;
    setQuery('');
    setPicked([]);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const heroes = useMemo(() => profile?.heroes || [], [profile]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return heroes;
    return heroes.filter(
      (hero) =>
        hero.name.toLowerCase().includes(q) ||
        hero.heroClass.toLowerCase().includes(q) ||
        [...hero.quirks.positive, ...hero.quirks.negative, hero.trinket1, hero.trinket2]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q))
    );
  }, [heroes, query]);

  const unmatchedCount = useMemo(
    () => Object.values(profile?.unmatched || {}).reduce((total, list) => total + list.length, 0),
    [profile]
  );

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    try {
      const next = await onImportFiles(files);
      setPicked([]);
      showToast?.(
        `Imported ${next.heroes.length} hero${next.heroes.length === 1 ? '' : 'es'}${
          next.estateName ? ` from the ${next.estateName} estate` : ''
        }.`,
        'success'
      );
    } catch (error) {
      showToast?.(error.message || 'Could not read that save.', 'error');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const togglePick = (guid) =>
    setPicked((prev) => {
      if (prev.includes(guid)) return prev.filter((id) => id !== guid);
      if (prev.length >= PARTY_CONFIG.MAX_HEROES) return prev;
      return [...prev, guid];
    });

  const handleSendToParty = () => {
    const chosen = picked.map((guid) => heroes.find((hero) => hero.guid === guid)).filter(Boolean);
    onSendToParty?.(chosen.map(toBuilderHero));
    showToast?.(`Sent ${chosen.length} hero${chosen.length === 1 ? '' : 'es'} to the party.`, 'success');
    onClose?.();
  };

  const handleUseAsRoster = () => {
    // Duplicates and all: two Plague Doctors have to arrive as two, or comps
    // that field two of a class stay hidden.
    const names = rosterFromHeroes(heroes, { includeBusy: true });
    onUseAsRoster?.(names);
    const busy = heroes.filter((hero) => !isHeroAvailable(hero)).length;
    showToast?.(
      `Roster set to your ${names.length} heroes${busy ? ` (${busy} busy in town)` : ''}.`,
      'success'
    );
  };

  if (!isOpen) return null;

  const fileButton = (label, icon, ref) => (
    <label className="px-3 py-2 text-sm rounded border border-dd-gold/50 bg-dd-gold/10 hover:bg-dd-gold/20 text-dd-gold transition-colors cursor-pointer inline-flex items-center gap-2">
      {busy ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
      <input ref={ref} type="file" multiple onChange={handleFiles} className="hidden" />
    </label>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg p-5 sm:p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-darkest text-xl text-dd-parchment tracking-wide flex items-center gap-2">
              <FolderOpen size={20} className="text-dd-gold" />
              Import Save
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Build with the heroes and trinkets you actually own, read straight out of your save.
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

        {!profile ? (
          <div className="flex-1 overflow-y-auto">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload size={28} className="mx-auto text-gray-500 mb-3" />
              <p className="text-dd-parchment text-sm mb-1">Pick your profile folder</p>
              <p className="text-gray-400 text-xs mb-4">
                Or just the <code className="text-dd-gold">{SAVE_FILES.roster}</code> inside it — the other
                files only add your trinkets and estate name.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {fileButton('Choose folder', <FolderOpen size={14} />, folderInput)}
                {fileButton('Choose files', <Upload size={14} />, null)}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-gray-400 text-xs mb-2">Where saves live:</p>
              <div className="space-y-1">
                {SAVE_LOCATIONS.map(([label, location]) => (
                  <div key={label} className="flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-500 w-24 shrink-0">{label}</span>
                    <code className="text-gray-300 break-all">{location}</code>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Nothing is uploaded — the file is read in your browser, and only the parsed roster is kept.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-700">
              <div className="text-sm text-gray-300">
                <span className="font-darkest text-dd-gold">{profile.estateName || 'Your estate'}</span>
                <span className="text-gray-500">
                  {profile.week !== null ? ` · week ${profile.week}` : ''}
                  {profile.gameMode ? ` · ${profile.gameMode}` : ''}
                  {` · ${heroes.length} heroes`}
                  {profile.graveyard?.length
                    ? ` · ${profile.graveyard.length} buried`
                    : ''}
                  {` · ${profile.ownedTrinkets.length} trinkets`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {fileButton('Re-import', <Upload size={14} />, folderInput)}
                <button
                  onClick={() => {
                    onClearProfile?.();
                    setPicked([]);
                    showToast?.('Imported save forgotten.', 'success');
                  }}
                  className="px-2.5 py-2 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Forget
                </button>
              </div>
            </div>

            {unmatchedCount > 0 && (
              <div className="mb-3 px-3 py-2 rounded border border-amber-700/50 bg-amber-900/20 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  {unmatchedCount} name{unmatchedCount === 1 ? '' : 's'} in this save had no match in the
                  app and {unmatchedCount === 1 ? 'was' : 'were'} left out:{' '}
                  {Object.entries(profile.unmatched)
                    .filter(([, list]) => list.length)
                    .map(([kind, list]) => `${kind} (${list.join(', ')})`)
                    .join('; ')}
                  . Usually a modded hero whose class this app does not carry.
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name, class, quirk or trinket..."
                className="flex-1 min-w-[12rem] bg-gray-900/80 text-dd-parchment px-3 py-2 rounded border-2 border-gray-700 focus:border-dd-gold focus:outline-none transition-colors text-sm"
              />
              <button
                onClick={handleUseAsRoster}
                className="px-2.5 py-2 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
                title="Use these classes as the roster Suggest a Comp draws from"
              >
                <Sparkles size={12} /> Use as suggest roster
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {visible.map((hero) => {
                const rank = picked.indexOf(hero.guid) + 1;
                return (
                  <HeroRow
                    key={hero.guid}
                    hero={hero}
                    rank={rank || 0}
                    onToggle={() => togglePick(hero.guid)}
                    dimmed={!rank && picked.length >= PARTY_CONFIG.MAX_HEROES}
                  />
                );
              })}
              {!visible.length && (
                <p className="text-sm text-gray-500 text-center py-8">No hero matches that filter.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                <Users size={12} className="inline -mt-0.5 mr-1" />
                {picked.length
                  ? `Picked ${picked.length} of ${PARTY_CONFIG.MAX_HEROES} — the number is the rank, 1 is the front line.`
                  : 'Click heroes in rank order — the first one you pick stands at rank 1.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleSendToParty}
                  disabled={!picked.length}
                  className={`px-4 py-2 rounded border transition-colors text-sm font-semibold inline-flex items-center gap-2 ${
                    picked.length
                      ? 'bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold border-dd-gold/50'
                      : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  }`}
                >
                  <Users size={16} />
                  Send to party
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImportSaveModal;
