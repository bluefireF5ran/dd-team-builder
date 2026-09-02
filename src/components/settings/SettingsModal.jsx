import React, { useEffect } from 'react';
import { X, Palette, Puzzle, Star, Biohazard, Droplet, BookOpen, Swords, Trophy, RotateCcw, PackageCheck } from 'lucide-react';
import { THEMES } from '../../hooks/useSettings';
import { SORT_OPTIONS } from '../../utils/compFilters';
import { LOCATIONS } from '../../data/locations';
import { PAGE_SIZES } from '../../constants';

/**
 * Every preference in one panel.
 *
 * The optional-content switches are still on the header row, because those get
 * flipped mid-build; this is where they live permanently, alongside the ones
 * that have no business taking up header space.
 */

const Row = ({ icon: Icon, title, hint, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-sm text-dd-parchment">
        {Icon && <Icon size={15} className="text-gray-400 flex-shrink-0" />}
        <span>{title}</span>
      </div>
      {hint && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{hint}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full border-2 transition-colors ${
      disabled
        ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50'
        : checked
        ? 'bg-dd-gold/30 border-dd-gold'
        : 'bg-gray-800 border-gray-600 hover:border-gray-500'
    }`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
        checked ? 'left-[22px] bg-dd-gold' : 'left-0.5 bg-gray-500'
      }`}
    />
  </button>
);

const Select = ({ value, onChange, label, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={label}
    className="bg-gray-900 text-dd-parchment px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs max-w-[190px]"
  >
    {children}
  </select>
);

const Section = ({ title, children }) => (
  <div>
    <h4 className="font-darkest text-xs sm:text-sm tracking-wider uppercase text-dd-gold mb-1">{title}</h4>
    <div className="divide-y divide-gray-700/50">{children}</div>
  </div>
);

const SettingsModal = ({ isOpen, onClose, settings, setSetting, toggleSetting, resetSettings }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortOptions = SORT_OPTIONS.filter((o) => !o.savedOnly);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
        style={{ borderColor: 'var(--dd-gold)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pb-3">
          <h3 className="font-darkest text-lg sm:text-xl text-dd-parchment tracking-wide">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-dd-parchment transition-colors"
            aria-label="Close"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-4">
          <Section title="Appearance">
            <Row icon={Palette} title="Theme">
              <div className="flex gap-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSetting('theme', t.id)}
                    aria-pressed={settings.theme === t.id}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      settings.theme === t.id
                        ? 'bg-dd-gold/20 border-dd-gold text-dd-gold'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Row>
          </Section>

          <Section title="Optional content">
            <Row
              icon={Puzzle}
              title="Modded heroes"
              hint="Workshop classes and their trinkets."
            >
              <Toggle
                label="Modded heroes"
                checked={settings.showModdedHeroes}
                onChange={() => toggleSetting('showModdedHeroes')}
              />
            </Row>
            <Row icon={Star} title="Backer trinkets" hint="The Kickstarter backer trinkets.">
              <Toggle
                label="Backer trinkets"
                checked={settings.showBackerTrinkets}
                onChange={() => toggleSetting('showBackerTrinkets')}
              />
            </Row>
            <Row
              icon={Biohazard}
              title="Diseases"
              hint="Adds a third quirk list to each hero, drawn in green."
            >
              <Toggle
                label="Diseases"
                checked={settings.showDiseases}
                onChange={() => toggleSetting('showDiseases')}
              />
            </Row>
            <Row
              icon={Droplet}
              title="Crimson Court"
              hint={
                settings.showDiseases
                  ? 'The Crimson Curse and its three stages, in red.'
                  : 'Needs Diseases turned on first.'
              }
            >
              <Toggle
                label="Crimson Court diseases"
                disabled={!settings.showDiseases}
                checked={settings.showDiseases && settings.showCrimsonCourt}
                onChange={() => toggleSetting('showCrimsonCourt')}
              />
            </Row>
          </Section>

          <Section title="Comp library">
            <Row icon={BookOpen} title="Default sort" hint="What Load Comp opens sorted by.">
              <Select value={settings.compSort} onChange={(v) => setSetting('compSort', v)} label="Default comp sort">
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </Select>
            </Row>
            <Row icon={BookOpen} title="Comps per page">
              <Select
                value={String(settings.compPageSize)}
                onChange={(v) => setSetting('compPageSize', Number(v))}
                label="Default comps per page"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n === 0 ? 'Show all' : `${n} / page`}</option>
                ))}
              </Select>
            </Row>
          </Section>

          <Section title="Hero configuration">
            <Row
              icon={Swords}
              title="Auto-sort skills"
              hint="Puts skills and camp skills back into the class's own order — but only when you change a slot, so a comp you just loaded keeps the order it was saved with."
            >
              <Toggle
                label="Auto-sort skills"
                checked={settings.autoSortSkills}
                onChange={() => toggleSetting('autoSortSkills')}
              />
            </Row>
            <Row
              icon={Trophy}
              title="Skill tiers"
              hint="Puts an S-D badge on each combat skill, from one community tier list. Opinion, not game data — and it only covers 17 classes, so Musketeer, Duelist and Runaway show nothing."
            >
              <Toggle
                label="Skill tiers"
                checked={settings.showSkillTiers}
                onChange={() => toggleSetting('showSkillTiers')}
              />
            </Row>
            <Row
              icon={PackageCheck}
              title="Owned trinkets only"
              hint="Narrows the trinket picker to what your imported save actually holds. Does nothing until you import one, and never hides a trinket already equipped on a hero."
            >
              <Toggle
                label="Owned trinkets only"
                checked={settings.ownedTrinketsOnly}
                onChange={() => toggleSetting('ownedTrinketsOnly')}
              />
            </Row>
            <Row icon={BookOpen} title="Default location" hint="Where a new or cleared team starts.">
              <Select
                value={settings.defaultLocation}
                onChange={(v) => setSetting('defaultLocation', v)}
                label="Default location"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
            </Row>
          </Section>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-gray-700 flex justify-between items-center">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-dd-parchment transition-colors"
          >
            <RotateCcw size={13} />
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-dd-parchment rounded border border-gray-600 text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
