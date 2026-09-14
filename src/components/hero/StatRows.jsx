import React from 'react';
import {
  BAR_STATS, GROUP_COLOURS, GROUP_LABELS, barGeometry, segmentGradient, statScale,
} from '../../utils/statBreakdown';

/**
 * Las filas de estadisticas, cada una una barra apilada por fuentes
 * (`statBreakdown`).
 *
 * - **La base** se pinta en la rampa rojo-verde de siempre: dice si la CLASE
 *   anda alta o baja en eso entre las veinte.
 * - **Cada capa fija** (Hacienda, luz, trinkets, quirks) empuja la barra en su
 *   color, con una transicion corta entre uno y otro.
 * - **A rayas**, lo que las skills de la party pueden darle ademas.
 * - **Rayado rojo**, lo que una capa negativa le quita.
 *
 * La barra va de 0 a lo mejor que una clase puede tener vestida
 * (`statScale`), no al maximo de las clases desnudas: si no, el heroe mejor
 * equipado es el que se sale.
 *
 * No hay etiquetas LOWEST / HIGHEST: se quitaron porque el color bastaba.
 */
const SIZES = {
  sm: {
    rows: 'space-y-1.5', row: 'gap-2 text-[11px]', label: 'text-[10px] w-12', value: 'w-12',
    bar: 'w-24 sm:w-32 h-2.5', potential: 'text-[10px]', legend: 'text-[10px]',
  },
  lg: {
    rows: 'space-y-3', row: 'gap-3 text-base', label: 'text-xs w-14 sm:w-16', value: 'w-14 sm:w-20',
    bar: 'w-36 sm:w-64 h-4', potential: 'text-xs', legend: 'text-xs',
  },
};

const STRIPES = `repeating-linear-gradient(135deg, ${GROUP_COLOURS.skill} 0 3px, transparent 3px 6px)`;
const HATCH = `repeating-linear-gradient(45deg, ${GROUP_COLOURS.loss} 0 2px, rgba(0,0,0,0.55) 2px 4px)`;

const summaryOf = (row, suffix) =>
  [
    `Base ${row.base}${suffix}`,
    ...row.parts.map((p) => `${GROUP_LABELS[p.group]} ${p.amount > 0 ? '+' : ''}${p.amount}`),
    row.potential ? `${GROUP_LABELS.skill} +${row.potential}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

const StackedBar = ({ row, max, size, suffix }) => {
  const g = barGeometry(row, max);
  return (
    <span
      className={`relative inline-block align-middle rounded bg-gray-700/80 overflow-hidden ${SIZES[size].bar}`}
      title={summaryOf(row, suffix)}
    >
      <span
        data-testid="stat-bar-fill"
        // Las capas dibujadas, legibles sin CSS: jsdom descarta un degradado en
        // `style.background`, asi que los tests miran esto.
        data-layers={g.segments.map((seg) => seg.group).join(' ')}
        className="absolute inset-y-0 left-0"
        style={{ width: `${g.positiveEnd}%`, background: segmentGradient(g.segments, row.baseColour, g.positiveEnd) }}
      />
      {g.totalEnd < g.positiveEnd && (
        <span
          data-testid="stat-bar-loss"
          className="absolute inset-y-0"
          style={{ left: `${g.totalEnd}%`, width: `${g.positiveEnd - g.totalEnd}%`, background: HATCH }}
        />
      )}
      {g.potentialEnd > g.positiveEnd && (
        <span
          data-testid="stat-bar-potential"
          className="absolute inset-y-0"
          style={{ left: `${g.positiveEnd}%`, width: `${g.potentialEnd - g.positiveEnd}%`, background: STRIPES }}
        />
      )}
    </span>
  );
};

const Legend = ({ breakdown, size }) => {
  const rows = Object.values(breakdown.stats);
  const groups = ['estate', 'light', 'trinket', 'quirk'].filter((group) =>
    rows.some((row) => row.parts.some((p) => p.group === group && p.amount > 0))
  );
  const hasPotential = rows.some((row) => row.potential > 0);
  const hasLoss = rows.some((row) => row.parts.some((p) => p.amount < 0));
  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-gray-500 ${SIZES[size].legend}`}>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-2 rounded-sm" style={{ background: 'linear-gradient(90deg, hsl(0,65%,45%), hsl(120,65%,45%))' }} />
        Base
      </span>
      {groups.map((group) => (
        <span key={group} className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: GROUP_COLOURS[group] }} />
          {GROUP_LABELS[group]}
        </span>
      ))}
      {hasPotential && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: STRIPES }} />
          {GROUP_LABELS.skill}
        </span>
      )}
      {hasLoss && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: HATCH }} />
          Lost
        </span>
      )}
    </span>
  );
};

/**
 * @param {{ breakdown: ReturnType<import('../../utils/statBreakdown').statBreakdown>,
 *           size?: 'sm'|'lg', showLegend?: boolean }} props
 */
const StatRows = ({ breakdown, size = 'sm', showLegend = true }) => {
  if (!breakdown) return null;
  const sizeKey = SIZES[size] ? size : 'sm';
  const s = SIZES[sizeKey];
  const scale = statScale(breakdown.difficulty);

  return (
    <span className={`block ${s.rows}`}>
      {BAR_STATS.map(({ key, label, suffix }) => {
        const row = breakdown.stats[key];
        const value = key === 'dmg' ? `${breakdown.total.dmgMin}-${breakdown.total.dmgMax}` : `${row.total}${suffix}`;
        const potential = row.potentialPercent ? `+${row.potentialPercent}%` : row.potential ? `+${row.potential}` : null;
        return (
          <span key={key} data-testid={`stat-${key}`} className={`flex items-center leading-none ${s.row}`}>
            <span className={`text-gray-500 uppercase tracking-wider shrink-0 ${s.label}`}>{label}</span>
            <span className={`shrink-0 tabular-nums text-gray-200 ${s.value}`}>{value}</span>
            <StackedBar row={row} max={scale[key]} size={sizeKey} suffix={suffix} />
            {potential && (
              <span
                className={`tabular-nums font-semibold ${s.potential}`}
                style={{ color: GROUP_COLOURS.skill }}
                title={row.potentialSources.map((p) => `${p.self ? 'own' : p.heroClass} ${p.skill}: ${p.text}`).join('\n')}
              >
                {potential}
              </span>
            )}
          </span>
        );
      })}
      {showLegend && <Legend breakdown={breakdown} size={sizeKey} />}
    </span>
  );
};

export default StatRows;
