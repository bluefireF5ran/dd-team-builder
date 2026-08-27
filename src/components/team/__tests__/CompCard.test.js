import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CompCard from '../CompCard';
import PartyComposition from '../../party/PartyComposition';
import { buildCompEntry } from '../../../utils/compFilters';

const hero = (heroClass) => ({
  heroClass,
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] }
});

// Vanguardia -> retaguardia, que es como se guarda una comp.
const PARTY = ['Leper', 'Crusader', 'Arbalest', 'Vestal'];

const entry = buildCompEntry({
  id: 'test',
  name: 'Holy Hymn: Royal',
  alias: 'Big Lad',
  location: 'The Cove',
  heroes: PARTY.map(hero)
});

/** Orden de izquierda a derecha de los retratos de la tarjeta. */
const cardOrder = () =>
  screen.getAllByTitle(/^Rank [1-4]: /).map((el) => el.getAttribute('title'));

describe('CompCard', () => {
  test('shows rank 4 leftmost, so the card reads like the party view', () => {
    render(<CompCard comp={entry} onLoad={jest.fn()} />);
    expect(cardOrder()).toEqual([
      'Rank 4: Vestal',
      'Rank 3: Arbalest',
      'Rank 2: Crusader',
      'Rank 1: Leper'
    ]);
  });

  test('lays the party out in the same order PartyComposition does', () => {
    // La prueba de verdad: si alguien invierte uno de los dos, esto salta.
    render(<PartyComposition heroes={PARTY.map(hero)} teamName="t" location="The Cove" onSwapHeroes={jest.fn()} />);
    const partyOrder = screen
      .getAllByRole('listitem')
      .map((el) => el.getAttribute('aria-label').replace(/^Position (\d): (\w+).*$/, 'Rank $1: $2'));
    expect(partyOrder).toEqual([
      'Rank 4: Vestal',
      'Rank 3: Arbalest',
      'Rank 2: Crusader',
      'Rank 1: Leper'
    ]);
  });

  test('keeps ranks in place when a slot is empty', () => {
    const holed = buildCompEntry({
      id: 'holed',
      name: 'Ragged Band',
      location: 'The Ruins',
      heroes: [hero('Leper'), null, null, hero('Vestal')]
    });
    render(<CompCard comp={holed} onLoad={jest.fn()} />);
    expect(cardOrder()).toEqual([
      'Rank 4: Vestal',
      'Rank 3: empty',
      'Rank 2: empty',
      'Rank 1: Leper'
    ]);
  });

  test('splits the taxonomic name and shows the author alias', () => {
    render(<CompCard comp={entry} onLoad={jest.fn()} />);
    const card = screen.getByTitle('Load Holy Hymn: Royal');
    expect(within(card).getByTitle('Holy Hymn: Royal')).toHaveTextContent('Holy Hymn: Royal');
    expect(within(card).getByTitle('Big Lad')).toBeInTheDocument();
  });

  test('carries the zone colour and short label', () => {
    render(<CompCard comp={entry} onLoad={jest.fn()} />);
    expect(screen.getByTitle('The Cove')).toHaveTextContent('Cove');
  });

  test('load fires once, and delete does not also load', () => {
    const onLoad = jest.fn();
    const onDelete = jest.fn();
    render(<CompCard comp={entry} onLoad={onLoad} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete team'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onLoad).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Load Holy Hymn: Royal'));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});
