import React, { useMemo } from 'react';
import HoverCard from '../common/HoverCard';
import Keywords from '../common/Keywords';
import RankDots, { SKILL_TYPES } from '../common/RankDots';
import { keywordColour } from '../../data/gameColours';
import ImageWithFallback from '../common/ImageWithFallback';
import StatRows from '../hero/StatRows';
import { RESISTANCE_ORDER } from '../../utils/heroStatLine';
import { statBreakdown } from '../../utils/statBreakdown';
import { skillHover, trinketHover } from '../../utils/hoverInfo';
import { getHeroDefinition } from '../../utils/rankerItems';
import { getSkillImagePath, getTrinketImagePath } from '../../utils/imageHelper';

// ---------------------------------------------------------------------------
// Lo que una carta del ranker tiene que decir para que la eleccion sea sobre
// la clase y no sobre el retrato.
//
// Antes una carta era imagen, nombre y "Vanilla class": para decidir entre un
// Leper y un Jester habia que saberse de memoria que uno tiene casi el doble de
// vida (63 a 35) y el otro casi el doble de esquiva (35 a 20), y para decidir
// entre dos skills habia que
// saberse que hacen. Aqui va lo que el resto de la app ya sabe -- estadisticas
// con su barra, resistencias, skills y trinkets de clase con su hover -- sin
// inventar ninguna valoracion: el que ordena sigue siendo Fran.
//
// Todo son `span`: la carta entera es un `<button>` y un `div` dentro no es
// HTML valido.
// ---------------------------------------------------------------------------


const SectionLabel = ({ children }) => (
  <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">{children}</span>
);

const IconStrip = ({ names, srcFor, hoverFor, size }) => (
  <span className="flex flex-wrap gap-1">
    {names.map((name) => (
      <HoverCard key={name} {...hoverFor(name)}>
        <ImageWithFallback
          src={srcFor(name)}
          alt={name}
          loading="lazy"
          decoding="async"
          className={`${size} object-contain rounded-sm border border-gray-700/80 bg-gray-900/60`}
          fallback={
            <span
              className={`${size} flex items-center justify-center rounded-sm border border-gray-700 bg-gray-900 text-[9px] text-gray-500`}
              title={name}
            >
              {name.charAt(0)}
            </span>
          }
        />
      </HoverCard>
    ))}
  </span>
);

/**
 * Una clase: estadisticas a equipo maximo, resistencias base, y el kit.
 *
 * Una clase modded sin estadisticas importadas se queda sin esa seccion en vez
 * de dibujar ceros -- la misma regla que la ficha del heroe.
 */
export const HeroDetails = ({ heroClass }) => {
  // Sin loadout: base + Hacienda + luz radiante, que es lo que distingue a una
  // clase de otra antes de vestirla (el Training Ring da vida al Arbalest y no
  // al Leper).
  const breakdown = useMemo(() => statBreakdown({ heroClass }), [heroClass]);
  const def = getHeroDefinition(heroClass);
  const skills = (def?.skills || []).filter(Boolean);
  const trinkets = (def?.classSpecificTrinkets || []).filter(Boolean);

  return (
    <span className="block w-full text-left space-y-3">
      {breakdown && (
        <span className="block">
          <SectionLabel>Stats at max gear</SectionLabel>
          <StatRows breakdown={breakdown} showLegend={false} />
        </span>
      )}

      {breakdown && (
        <span className="block">
          <SectionLabel>Base resistances</SectionLabel>
          {/* Con poco hueco entre columnas "40% Blight" se lee como una sola
              cosa; cada celda va separada de la siguiente por algo mas que su
              propio numero. */}
          <span className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-0.5 text-[11px] leading-tight">
            {RESISTANCE_ORDER.map(({ key, label, keyword }) => (
              <span key={key} className="flex justify-between gap-2">
                <span style={{ color: keywordColour(keyword) }}>{label}</span>
                <span className="tabular-nums text-gray-300">{breakdown.resistances[key] ?? '—'}%</span>
              </span>
            ))}
          </span>
        </span>
      )}

      {skills.length > 0 && (
        <span className="block">
          <SectionLabel>Skills</SectionLabel>
          <IconStrip
            names={skills}
            size="w-7 h-7 sm:w-8 sm:h-8"
            srcFor={(name) => getSkillImagePath(name, heroClass)}
            hoverFor={(name) => skillHover(name, heroClass)}
          />
        </span>
      )}

      {trinkets.length > 0 && (
        <span className="block">
          <SectionLabel>Class trinkets</SectionLabel>
          <IconStrip
            names={trinkets}
            size="w-6 h-8 sm:w-7 sm:h-9"
            srcFor={(name) => getTrinketImagePath(name, heroClass)}
            hoverFor={(name) => trinketHover(name)}
          />
        </span>
      )}
    </span>
  );
};

/**
 * Una skill o camp skill: su linea de datos y lo que hace.
 *
 * Los nombres del pool estan deduplicados, asi que una skill de combate con el
 * mismo nombre en dos clases se lee como la usa la primera; se dice cual,
 * porque el ACC y los rangos son de esa clase y no de las otras.
 */
export const SkillDetails = ({ item }) => {
  const heroClass = item.classes?.[0];
  const hover = skillHover(item.name, heroClass);
  const lines = (hover.lines || []).filter(Boolean);

  if (!hover.subtitle && !lines.length) {
    return (
      <span className="block text-[11px] text-gray-500 italic">No effect data for this skill yet.</span>
    );
  }

  return (
    <span className="block w-full text-left">
      {(hover.kind || hover.ranks) && (
        <span className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {hover.kind && SKILL_TYPES[hover.kind] && (
            <span className="text-[11px] uppercase tracking-wider font-bold" style={{ color: SKILL_TYPES[hover.kind].colour }}>
              {SKILL_TYPES[hover.kind].label}
            </span>
          )}
          {hover.ranks && <RankDots {...hover.ranks} />}
        </span>
      )}
      {hover.subtitle && (
        <span className="block text-[11px] uppercase tracking-wider text-gray-400 leading-snug">
          {hover.subtitle}
        </span>
      )}
      {lines.length > 0 && (
        <span className="mt-1.5 block space-y-0.5">
          {lines.map((line, i) => (
            <span key={i} className="block text-xs leading-snug text-dd-parchment">
              <Keywords text={line} />
            </span>
          ))}
        </span>
      )}
      {/* Solo combate: una camp skill compartida (Encourage) es la misma en las diecinueve clases. */}
      {item.classes?.length > 1 && item.id?.startsWith('skill:') && (
        <span className="mt-1.5 block text-[10px] text-gray-500">As the {heroClass} uses it.</span>
      )}
    </span>
  );
};
