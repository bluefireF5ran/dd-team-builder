import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RankDots, { rankDotsLabel } from '../RankDots';
import { skillProfile } from '../../../utils/skillProfile';

const ranksOf = (heroClass, skill) => {
  const p = skillProfile(heroClass, skill);
  return { launch: p.launch, target: p.target, targetKind: p.targetKind, aoe: p.aoe };
};

const lit = (testId) =>
  within(screen.getByTestId(testId))
    .getAllByText(/^[1-4]$/)
    .filter((dot) => dot.parentElement.dataset.on === 'true') // eslint-disable-line testing-library/no-node-access
    .map((dot) => Number(dot.textContent));

describe('RankDots', () => {
  it('lights where an enemy-targeting skill launches from and what it reaches', () => {
    render(<RankDots {...ranksOf('Arbalest', 'Sniper Shot')} />);
    expect(screen.getByRole('img', { name: 'From rank 3, 4 · hits enemy rank 2, 3, 4' })).toBeInTheDocument();
    // Tu fila se lee 4 3 2 1; la del enemigo 1 2 3 4.
    expect(lit('rank-launch')).toEqual([4, 3]);
    expect(lit('rank-target')).toEqual([2, 3, 4]);
  });

  it('draws an ally skill\'s targets on your own side, in your order', () => {
    render(<RankDots {...ranksOf('Arbalest', 'Battlefield Bandage')} />);
    expect(screen.getByRole('img', { name: /targets ally rank 1, 2, 3, 4/ })).toBeInTheDocument();
    expect(lit('rank-target')).toEqual([4, 3, 2, 1]);
  });

  it('says an AoE hits them all at once', () => {
    expect(rankDotsLabel(ranksOf('Arbalest', 'Suppressing Fire'))).toBe(
      'From rank 3, 4 · hits enemy rank 3, 4 (all at once)'
    );
  });

  it('draws a self-only skill as "self"', () => {
    render(<RankDots {...ranksOf('Antiquarian', 'Get Down!')} />);
    expect(within(screen.getByTestId('rank-target')).getByText('self')).toBeInTheDocument();
  });

  it('draws nothing when nothing is known', () => {
    const { container } = render(<RankDots />);
    expect(container).toBeEmptyDOMElement();
  });
});
