import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { getHeroImagePath } from '../../utils/imageHelper';
import ImageWithFallback from '../common/ImageWithFallback';

// Los retratos van en una rejilla de 4 columnas, NO en una fila de anchos fijos:
// asi cada uno mide un cuarto de la tarjeta y nunca se sale de ella, aunque la
// rejilla cambie de columnas. `aspect-square` + `overflow-hidden` los mantiene
// cuadrados y `object-contain` evita recortar retratos que no lo sean.
//
// El array de heroes va de vanguardia a retaguardia (heroes[0] es el rango 1),
// pero PartyComposition lo pinta al reves para dejar la retaguardia a la
// izquierda. La tarjeta hace lo mismo: una comp se ve igual aqui que en la party.
const SLOTS = [3, 2, 1, 0];

/** Chips del pie: primero las mecanicas, luego los avisos que cambian el plan. */
const FLAG_CHIPS = {
  dupe: { label: 'x2', tone: 'text-sky-300 border-sky-800/70 bg-sky-950/40' },
  trio: { label: 'x3', tone: 'text-sky-300 border-sky-800/70 bg-sky-950/40' },
  quartet: { label: 'x4', tone: 'text-sky-300 border-sky-800/70 bg-sky-950/40' },
  modded: { label: 'mod', tone: 'text-fuchsia-300 border-fuchsia-800/70 bg-fuchsia-950/40' },
  'no-heal': { label: 'no heal', tone: 'text-red-300 border-red-900/70 bg-red-950/40' },
  'no-stress-heal': { label: 'no stress', tone: 'text-orange-300 border-orange-900/70 bg-orange-950/40' },
  incomplete: { label: 'partial', tone: 'text-amber-300 border-amber-800/70 bg-amber-950/40' }
};

// `dupe` y su tamano concreto dicen lo mismo: se muestra solo el tamano.
const flagChipsFor = (flags = []) => {
  const size = ['quartet', 'trio'].find((f) => flags.includes(f)) || (flags.includes('twin') ? 'dupe' : null);
  return [size, 'modded', 'no-heal', 'no-stress-heal', 'incomplete'].filter((f) => f && (f === size || flags.includes(f)));
};

const CompCard = ({ comp, onLoad, onDelete }) => {
  const { name, family, variant, alias, location, heroes = [], theme, mechanics = [], flags = [] } = comp;
  const chips = flagChipsFor(flags);
  const mechChips = mechanics.slice(0, 2);

  return (
    <div
      className="group relative bg-gray-900/60 border border-gray-700 hover:border-dd-gold/60 rounded-lg overflow-hidden transition-colors focus-within:border-dd-gold/60"
      // El color de la zona entra por el borde izquierdo y un velo muy tenue:
      // basta para agrupar de un vistazo sin competir con los retratos.
      style={{ borderLeft: `3px solid ${theme.accent}`, background: `linear-gradient(100deg, ${theme.accent}14, transparent 55%)` }}
    >
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-1 right-1 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-black/40 transition-colors z-10"
          title="Delete team"
          type="button"
        >
          <Trash2 size={13} />
        </button>
      )}

      <button onClick={onLoad} className="w-full text-left p-2.5" type="button" title={`Load ${name}`}>
        <div className="font-darkest text-[13px] leading-tight truncate pr-4" title={name}>
          <span className="text-dd-parchment">{family || name}</span>
          {variant && <span className="text-dd-gold">: {variant}</span>}
        </div>

        <div className="h-4 mt-0.5">
          {alias && <div className="text-[10px] text-gray-500 italic truncate" title={alias}>&ldquo;{alias}&rdquo;</div>}
        </div>

        <div className="grid grid-cols-4 gap-1 mt-1.5">
          {SLOTS.map((slot) => {
            const rank = slot + 1;
            const hero = heroes[slot];
            return (
              <div
                key={rank}
                className="relative aspect-square rounded overflow-hidden bg-gray-800/60 border border-gray-700"
                title={hero?.heroClass ? `Rank ${rank}: ${hero.heroClass}` : `Rank ${rank}: empty`}
              >
                {hero?.heroClass ? (
                  <ImageWithFallback
                    src={getHeroImagePath(hero.heroClass)}
                    alt={hero.heroClass}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                        {hero.heroClass.charAt(0)}
                      </div>
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">-</div>
                )}
                <span className="absolute bottom-0 right-0 px-1 text-[8px] leading-[1.4] text-gray-400 bg-black/60 rounded-tl">
                  {rank}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1 mt-1.5 min-h-[16px] overflow-hidden">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 shrink-0" title={location || 'No region'}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: theme.accent }} />
            {theme.short}
          </span>
          {mechChips.map((m) => (
            <span key={m.tag} className="text-[10px] px-1 rounded border border-gray-700 bg-gray-800/60 text-gray-400 truncate">
              {m.label}
            </span>
          ))}
          {chips.map((f) => (
            <span key={f} className={`text-[10px] px-1 rounded border shrink-0 ${FLAG_CHIPS[f].tone}`} title={f}>
              {FLAG_CHIPS[f].label}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
};

export default memo(CompCard);
