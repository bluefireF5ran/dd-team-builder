import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PartyComposition from '../PartyComposition';
import { EMPTY_HERO } from '../../../constants';

// heroes[0] is rank 1 (front). The grid draws them reversed so rank 4 sits
// leftmost, matching the game — which is exactly why the arrows need a test:
// "left" on screen means a *higher* rank number and a *higher* array index.
const party = () =>
  ['Crusader', 'Hellion', 'Vestal', 'Arbalest'].map((heroClass) => ({ ...EMPTY_HERO, heroClass }));

const setup = (heroes = party()) => {
  const onSwapHeroes = jest.fn();
  render(
    <PartyComposition heroes={heroes} onSwapHeroes={onSwapHeroes} teamName="T" location="The Ruins" />
  );
  return { onSwapHeroes };
};

describe('party reordering', () => {
  it('no longer promises touch dragging it cannot do', () => {
    setup();
    expect(screen.queryByText(/tap and hold/i)).not.toBeInTheDocument();
    // Both the desktop and the narrow-screen copy mention the arrows now.
    expect(screen.getAllByText(/use the arrows/i)).toHaveLength(2);
  });

  it('moves a hero back a rank', () => {
    const { onSwapHeroes } = setup();
    // The Crusader is rank 1, i.e. heroes[0].
    fireEvent.click(screen.getByRole('button', { name: /Move Crusader back to position 2/i }));
    expect(onSwapHeroes).toHaveBeenCalledWith(0, 1);
  });

  it('moves a hero forward a rank', () => {
    const { onSwapHeroes } = setup();
    // The Arbalest is rank 4, i.e. heroes[3].
    fireEvent.click(screen.getByRole('button', { name: /Move Arbalest forward to position 3/i }));
    expect(onSwapHeroes).toHaveBeenCalledWith(3, 2);
  });

  it('cannot push the front hero further forward, or the back one further back', () => {
    setup();
    expect(screen.getByRole('button', { name: /Move Crusader forward/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Move Arbalest back/i })).toBeDisabled();
  });

  it('gives an empty slot no arrows to press', () => {
    setup([{ ...EMPTY_HERO, heroClass: 'Crusader' }, { ...EMPTY_HERO }, { ...EMPTY_HERO }, { ...EMPTY_HERO }]);
    expect(screen.getAllByRole('button', { name: /^Move /i })).toHaveLength(2);
  });

  it('keeps the arrows out of the exported PNG', () => {
    setup();
    // html2canvas is told to skip anything carrying this, because the export is
    // the composition, not the controls.
    const controls = screen.getAllByTestId('reorder-controls');
    expect(controls).toHaveLength(4);
    controls.forEach((group) => expect(group).toHaveAttribute('data-export-ignore', 'true'));
  });
});
