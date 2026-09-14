import React from 'react';

/**
 * Desde donde se lanza una skill y a quien alcanza, en puntos, como el juego.
 *
 *   [4 3 2 1]  →  [1 2 3 4]
 *    tu fila       la del enemigo
 *
 * El juego dibuja puntos sin numero, y leerlos exige saberse que el rango 1 es
 * el del centro. Aqui cada punto lleva su numero: el dibujo del juego y el
 * texto a la vez. Los tuyos van de 4 a 1 porque tu fila mira a la derecha y el
 * 1 es el que esta junto al enemigo.
 *
 * - **Desde**: dorado.
 * - **Al enemigo**: rojo.
 * - **A un aliado**: verde, y en TU orden (4 3 2 1). El juego no dibuja a quien
 *   alcanza una skill de apoyo; el mod "Friendly Target UI" (workshop 2191394645)
 *   lo arregla con puntos verdes delante del nombre, y ese verde (115 201 73) es
 *   el que se usa aqui.
 * - **AoE**: los puntos alcanzados van unidos por una barra, que es como el
 *   juego (y el mod, con `¤¦¤¦¤`) dice "a todos a la vez".
 * - **Self**: una pastilla "self" en lugar de puntos.
 */
const LAUNCH = '#d8ac55';
const ENEMY = '#e5483a';
const ALLY = '#73c949';
const HERO_ORDER = [4, 3, 2, 1];
const ENEMY_ORDER = [1, 2, 3, 4];

/** El tipo de una skill como etiqueta y color, para el hover. */
export const SKILL_TYPES = {
  Melee: { label: 'Melee', colour: '#e8875e' },
  Ranged: { label: 'Ranged', colour: '#7db4e6' },
  Self: { label: 'Self', colour: '#d8c07a' },
  'Ally/Team': { label: 'Ally', colour: ALLY },
  Heal: { label: 'Ally', colour: ALLY },
};

const Dot = ({ rank, on, colour, joined }) => (
  <span className="relative flex items-center" data-rank={rank} data-on={on ? 'true' : 'false'}>
    {joined && (
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 -translate-y-1/2 w-1.5 h-[3px]"
        style={{ background: colour }}
      />
    )}
    <span
      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none border"
      style={
        on
          ? { background: colour, borderColor: colour, color: '#111827' }
          : { borderColor: '#4b5563', color: '#6b7280' }
      }
    >
      {rank}
    </span>
  </span>
);

const Group = ({ order, on, colour, aoe = false, testId }) => (
  <span className="flex items-center gap-1.5" data-testid={testId}>
    {order.map((rank, i) => (
      <Dot
        key={rank}
        rank={rank}
        on={on.includes(rank)}
        colour={colour}
        joined={aoe && i > 0 && on.includes(rank) && on.includes(order[i - 1])}
      />
    ))}
  </span>
);

export const rankDotsLabel = ({ launch = [], target = [], targetKind = 'none', aoe = false }) => {
  const from = launch.length ? `From rank ${launch.join(', ')}` : '';
  let to = '';
  if (targetKind === 'enemy') to = `hits enemy rank ${target.join(', ')}`;
  if (targetKind === 'ally') to = `targets ally rank ${target.join(', ')}`;
  if (targetKind === 'self') to = 'targets self';
  return [from, to].filter(Boolean).join(' · ') + (aoe && targetKind !== 'self' ? ' (all at once)' : '');
};

const RankDots = ({ launch = [], target = [], targetKind = 'none', aoe = false }) => {
  if (!launch.length && !target.length && targetKind !== 'self') return null;
  return (
    <span
      role="img"
      aria-label={rankDotsLabel({ launch, target, targetKind, aoe })}
      className="flex items-center gap-2"
    >
      <Group order={HERO_ORDER} on={launch} colour={LAUNCH} testId="rank-launch" />
      <span aria-hidden="true" className="text-gray-500 text-xs leading-none">→</span>
      {targetKind === 'enemy' && <Group order={ENEMY_ORDER} on={target} colour={ENEMY} aoe={aoe} testId="rank-target" />}
      {targetKind === 'ally' && <Group order={HERO_ORDER} on={target} colour={ALLY} aoe={aoe} testId="rank-target" />}
      {targetKind === 'self' && (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none"
          style={{ background: ALLY, color: '#111827' }}
          data-testid="rank-target"
        >
          self
        </span>
      )}
    </span>
  );
};

export default RankDots;
