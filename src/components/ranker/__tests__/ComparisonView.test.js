import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ComparisonView from '../ComparisonView';
import { buildItems, getModdedHeroNames } from '../../../utils/rankerItems';
import { getHeroStats } from '../../../data/heroStats';

// La carta tiene que decir lo bastante para elegir sobre la clase y no sobre
// el retrato. Estos tests fijan QUE se dice, no como se pinta.

const showPair = (left, right, category, onPick = jest.fn()) => {
  render(
    <ComparisonView
      category={category}
      categoryLabel="Items"
      blurb="Which is better?"
      pair={{ left, right }}
      progress={{ done: 0, total: 10, percent: 0 }}
      onPick={onPick}
      onUndo={jest.fn()}
      canUndo={false}
      onFinishEarly={jest.fn()}
      onQuit={jest.fn()}
    />
  );
  return onPick;
};

const itemNamed = (category, heroes, name) =>
  buildItems(category, heroes).find((item) => item.name === name);

const cardFor = (name) =>
  screen.getAllByRole('button').find((b) => within(b).queryByText(name, { selector: 'span' }));

describe('ComparisonView — hero cards', () => {
  it('shows each class its stats, resistances, skills and class trinkets', () => {
    const [leper, jester] = ['Leper', 'Jester'].map((n) => itemNamed('heroes', [n], n));
    showPair(leper, jester, 'heroes');

    const leperCard = within(cardFor('Leper'));
    expect(leperCard.getByText('Stats at max gear')).toBeInTheDocument();
    expect(leperCard.getByText('HP')).toBeInTheDocument();
    // Literal, no leido del mismo dato que pinta la carta: el Leper a equipo
    // maximo tiene 63 de vida en el juego.
    expect(leperCard.getByText('63')).toBeInTheDocument();
    expect(leperCard.getByText('Base resistances')).toBeInTheDocument();
    expect(leperCard.getByText('Blight')).toBeInTheDocument();
    expect(leperCard.getByAltText('Chop')).toBeInTheDocument();
    expect(leperCard.getByText('Class trinkets')).toBeInTheDocument();

    expect(within(cardFor('Jester')).getByAltText('Finale')).toBeInTheDocument();
  });

  it('still picks on click, and hovering a skill inside the card does not', () => {
    const [leper, jester] = ['Leper', 'Jester'].map((n) => itemNamed('heroes', [n], n));
    const onPick = showPair(leper, jester, 'heroes');

    fireEvent.mouseEnter(within(cardFor('Leper')).getByAltText('Chop'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Chop');
    expect(onPick).not.toHaveBeenCalled();

    fireEvent.click(cardFor('Jester'));
    expect(onPick).toHaveBeenCalledWith('right');
  });

  it('opens a class\'s stats larger without picking it, and the arrows do not pick behind it', () => {
    const [leper, jester] = ['Leper', 'Jester'].map((n) => itemNamed('heroes', [n], n));
    const onPick = showPair(leper, jester, 'heroes');

    fireEvent.click(screen.getByRole('button', { name: /Open Leper stats larger/ }));
    const dialog = screen.getByRole('dialog', { name: 'Leper' });
    expect(within(dialog).getByTestId('stat-hp')).toHaveTextContent('63');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: '2' });
    expect(onPick).not.toHaveBeenCalled();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onPick).toHaveBeenCalledWith('left');
  });

  it('draws no stats for a modded class nobody imported, rather than zeroes', () => {
    const unknown = getModdedHeroNames().find((n) => !getHeroStats(n));
    if (!unknown) return; // every modded class has stats: nothing to guard
    const leper = itemNamed('heroes', ['Leper'], 'Leper');
    showPair(itemNamed('heroes', [unknown], unknown), leper, 'heroes');

    expect(within(cardFor(unknown)).queryByText('Stats at max gear')).not.toBeInTheDocument();
    expect(within(cardFor('Leper')).getByText('Stats at max gear')).toBeInTheDocument();
  });
});

describe('ComparisonView — comp cards', () => {
  const hero = (heroClass, activeSkills, extra = {}) => ({
    heroClass, activeSkills, activeCampSkills: [], trinket1: '', trinket2: '',
    quirks: { positive: [], negative: [] }, ...extra,
  });
  const comp = (name, heroes) => ({ id: `comp:${name}`, name, subtitle: 'The Ruins', location: 'The Ruins', heroes });

  const left = comp('Marked Volley', [
    hero('Bounty Hunter', ['Mark for Death'], { trinket1: 'Holy Orders' }),
    hero('Arbalest', ['Sniper Shot']),
  ]);
  const right = comp('Stone Wall', [hero('Crusader', ['Smite']), hero('Leper', ['Chop'])]);

  it('hovers a skill with the real card, naming the teammate it fits with, without picking', () => {
    const onPick = showPair(left, right, 'comps');
    fireEvent.mouseEnter(within(cardFor('Marked Volley')).getByAltText('Sniper Shot'));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Synergy: Mark set up by Bounty Hunter (Mark for Death)');
    expect(onPick).not.toHaveBeenCalled();
  });

  it('hovers a trinket with its rarity and effect', () => {
    showPair(left, right, 'comps');
    fireEvent.mouseEnter(within(cardFor('Marked Volley')).getByAltText('Holy Orders'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Very Rare');
  });
});

describe('ComparisonView — skill cards', () => {
  it('says what a combat skill does, not just its name', () => {
    const smite = itemNamed('skills', ['Crusader'], 'Smite');
    const stun = itemNamed('skills', ['Crusader'], 'Stunning Blow');
    showPair(smite, stun, 'skills');

    expect(within(cardFor('Smite')).getByText(/ACC 105%/)).toBeInTheDocument();
    expect(cardFor('Stunning Blow')).toHaveTextContent(/Stun \(\d+% base\)/);
    // "Stun" sale en el color del juego, no como prosa gris.
    expect(
      within(cardFor('Stunning Blow')).getByText('Stun', { selector: '[data-keyword="stun"]' })
    ).toBeInTheDocument();
  });

  it('says what a camp skill costs and does', () => {
    const encourage = itemNamed('campSkills', ['Crusader'], 'Encourage');
    const vigil = itemNamed('campSkills', ['Crusader'], 'Zealous Vigil');
    showPair(encourage, vigil, 'campSkills');

    expect(within(cardFor('Encourage')).getByText(/time/)).toBeInTheDocument();
    expect(within(cardFor('Encourage')).getByText(/stress/i)).toBeInTheDocument();
  });

  it('does not claim a shared camp skill is read as one class uses it', () => {
    const encourage = buildItems('campSkills', ['Crusader', 'Vestal']).find((i) => i.name === 'Encourage');
    const smite = itemNamed('skills', ['Crusader'], 'Smite');
    showPair(encourage, smite, 'campSkills');

    expect(screen.queryByText(/uses it/)).not.toBeInTheDocument();
  });
});
