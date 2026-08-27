import React, { memo } from 'react';
import { X } from 'lucide-react';
import { getHeroImagePath } from '../../utils/imageHelper';
import { getLocationTheme } from '../../data/locations';
import ImageWithFallback from '../common/ImageWithFallback';

// Panel de facetas. Cada fila es una faceta y cada chip lleva su recuento: un
// chip a 0 no aparece, asi que lo que se ve siempre devuelve resultados.
// Dentro de una faceta los chips suman (OR); entre facetas se cruzan (AND).
// Los heroes son la excepcion deliberada: marcar dos significa "los dos", que es
// como se busca una pareja concreta.

const Chip = ({ active, onClick, children, title, style, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-pressed={active}
    className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
      active
        ? 'text-dd-parchment border-transparent'
        : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:text-dd-parchment hover:border-gray-500'
    } ${className}`}
    style={active ? style : undefined}
  >
    {children}
  </button>
);

const Row = ({ label, children }) => (
  <div className="flex gap-2 items-start">
    <span className="text-[10px] uppercase tracking-wider text-gray-500 w-14 shrink-0 pt-1">{label}</span>
    <div className="flex flex-wrap gap-1 flex-1">{children}</div>
  </div>
);

const CompFilters = ({ facets, filters, onToggle, onClear, activeCount }) => {
  const isOn = (key, id) => filters[key].includes(id);

  return (
    <div className="space-y-2 p-3 rounded border border-gray-700 bg-gray-900/40">
      {facets.regions.length > 1 && (
        <Row label="Region">
          {facets.regions.map(({ id, count }) => {
            const theme = getLocationTheme(id);
            return (
              <Chip
                key={id}
                active={isOn('regions', id)}
                onClick={() => onToggle('regions', id)}
                title={id}
                style={{ background: theme.accent, color: theme.ink }}
              >
                {theme.short} <span className="opacity-70">{count}</span>
              </Chip>
            );
          })}
        </Row>
      )}

      {facets.heroes.length > 0 && (
        <Row label="Heroes">
          {facets.heroes.map(({ id, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => onToggle('heroes', id)}
              aria-pressed={isOn('heroes', id)}
              title={`${id} (${count} comp${count === 1 ? '' : 's'})`}
              className={`relative w-8 h-8 rounded overflow-hidden border transition-all ${
                isOn('heroes', id)
                  ? 'border-dd-gold ring-1 ring-dd-gold/60 opacity-100'
                  : 'border-gray-700 opacity-55 hover:opacity-100 hover:border-gray-500'
              }`}
            >
              <ImageWithFallback
                src={getHeroImagePath(id)}
                alt={id}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain bg-gray-800"
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-[10px] text-gray-400">
                    {id.charAt(0)}
                  </div>
                }
              />
            </button>
          ))}
        </Row>
      )}

      {facets.families.length > 1 && (
        <Row label="Family">
          {facets.families.map(({ id, count }) => (
            <Chip
              key={id}
              active={isOn('families', id)}
              onClick={() => onToggle('families', id)}
              style={{ background: 'var(--dd-gold)', color: '#12100e' }}
            >
              {id} <span className="opacity-70">{count}</span>
            </Chip>
          ))}
        </Row>
      )}

      {facets.flags.length > 0 && (
        <Row label="Tags">
          {facets.flags.map(({ id, label, hint, count }) => (
            <Chip
              key={id}
              active={isOn('flags', id)}
              onClick={() => onToggle('flags', id)}
              title={hint}
              style={{ background: '#4338ca' }}
            >
              {label} <span className="opacity-70">{count}</span>
            </Chip>
          ))}
        </Row>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-dd-parchment transition-colors"
        >
          <X size={12} /> Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
};

export default memo(CompFilters);
