import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import Keywords from '../common/Keywords';
import StatRows from './StatRows';
import { RESISTANCE_ORDER } from '../../utils/heroStatLine';
import { statBreakdown, GROUP_COLOURS, GROUP_LABELS } from '../../utils/statBreakdown';
import { keywordColour } from '../../data/gameColours';
import { useStatSettings } from '../../hooks/useStatSettings';

/**
 * Las estadisticas de un heroe a tamaño de leer, y de donde sale cada numero.
 *
 * Es el mismo desglose que la ficha (`statBreakdown`) en grande, mas lo que en
 * pequeño no cabe: cada fuente con su nombre, agrupada en el color de su capa,
 * y con que luz corre la party y por que.
 */
const DIFFICULTY_LABEL = { darkest: 'Darkest', radiant: 'Radiant', stygian: 'Stygian', bloodmoon: 'Bloodmoon' };

const HeroStatsDialog = ({ isOpen, onClose, hero, party = null, heroIndex = -1 }) => {
  const statSettings = useStatSettings();
  const breakdown = useMemo(
    () => (isOpen ? statBreakdown(hero, { party, heroIndex, ...statSettings }) : null),
    [isOpen, hero, party, heroIndex, statSettings]
  );
  if (!isOpen || !breakdown) return null;

  const titleId = 'hero-stats-dialog-title';
  const pending = breakdown.skipped.conditional + breakdown.skipped.scoped;
  const { light } = breakdown;
  const potential = Object.values(breakdown.stats).flatMap((row) => row.potentialSources);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      panelClassName="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg border-2 bg-gray-900 p-5 sm:p-6 shadow-2xl"
      panelStyle={{ borderColor: 'var(--dd-gold)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 id={titleId} className="font-darkest text-2xl text-dd-gold tracking-wide">{hero.heroClass}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Max gear ·{' '}
            {Array.isArray(breakdown.estate)
              ? `${breakdown.estate.length} ${breakdown.estate.length === 1 ? 'district' : 'districts'} built`
              : breakdown.estate ? 'estate built' : 'no estate'}
            {statSettings.source === 'save' ? ' (from your save)' : ''} ·{' '}
            {DIFFICULTY_LABEL[breakdown.difficulty] || breakdown.difficulty} ·{' '}
            <span style={{ color: GROUP_COLOURS.light }}>{light.label} light</span>
            {light.source ? ` (${light.source} wants the torch below ${light.below})` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <section className="mb-5">
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Stats</h3>
        <StatRows breakdown={breakdown} size="lg" />
      </section>

      <section className="mb-5">
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Resistances</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {RESISTANCE_ORDER.map(({ key, label, keyword }) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="font-semibold" style={{ color: keywordColour(keyword) }}>{label}</span>
              <span className="tabular-nums text-dd-parchment">{breakdown.resistances[key] ?? '—'}%</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-2">The game also raises resistances with resolve level; that step is in no game file.</p>
      </section>

      <section className="mb-2 space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500">Where the numbers come from</h3>
        {['estate', 'light', 'trinket', 'quirk'].map((group) => {
          const list = breakdown.sources.filter((s) => s.group === group);
          if (!list.length) return null;
          return (
            <div key={group}>
              <h4 className="text-xs font-semibold mb-1" style={{ color: GROUP_COLOURS[group] }}>{GROUP_LABELS[group]}</h4>
              <ul className="space-y-0.5">
                {list.map(({ name, text }, i) => (
                  <li key={`${name}-${i}`} className="text-sm text-dd-parchment flex flex-wrap gap-x-2">
                    <span className="text-dd-gold">{name}</span>
                    <span><Keywords text={text} /></span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {potential.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1" style={{ color: GROUP_COLOURS.skill }}>
              {GROUP_LABELS.skill} <span className="text-gray-500 font-normal">— potential, not in the totals</span>
            </h4>
            <ul className="space-y-0.5">
              {potential.map(({ heroClass, skill, text, self }, i) => (
                <li key={`${skill}-${i}`} className="text-sm text-dd-parchment flex flex-wrap gap-x-2">
                  <span className="text-dd-gold">{self ? skill : `${heroClass} · ${skill}`}</span>
                  <span><Keywords text={text} /></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {pending > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          {pending} conditional {pending === 1 ? 'clause is' : 'clauses are'} not counted — they only apply some of the time.
        </p>
      )}
    </Modal>
  );
};

export default HeroStatsDialog;
