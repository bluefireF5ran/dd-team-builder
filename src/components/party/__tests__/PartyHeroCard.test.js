import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PartyHeroCard from '../PartyHeroCard';
import { EMPTY_HERO } from '../../../constants';

// The real component loads portraits from the assets repo; the alt text is all
// these tests need, and it is also what identifies each icon.
jest.mock('../../common/ImageWithFallback', () => {
  return function MockImageWithFallback({ alt }) {
    return <img alt={alt} />;
  };
});

// React's onMouseEnter does not bubble, so the event has to be aimed at the
// HoverCard wrapper rather than the icon inside it.
/* eslint-disable testing-library/no-node-access */
const hover = (el) => fireEvent.mouseEnter(el.closest('span') || el);
/* eslint-enable testing-library/no-node-access */

const crusader = {
  ...EMPTY_HERO,
  heroClass: 'Crusader',
  activeSkills: ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance'],
  activeCampSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Zealous Vigil'],
  trinket1: 'Holy Orders',
  trinket2: 'Focus Ring',
};

describe('PartyHeroCard hover cards', () => {
  it('opens nothing until an icon is hovered', () => {
    render(<PartyHeroCard hero={crusader} position={1} />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('describes a combat skill: how it is used, then what it does', () => {
    render(<PartyHeroCard hero={crusader} position={1} />);
    hover(screen.getByAltText('Smite'));

    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('Smite')).toBeInTheDocument();
    // Smite is a front-rank melee attack that reaches the front two enemies.
    expect(within(card).getByText('Melee · from 1·2 · hits 1·2 · DMG +0% · ACC 105% · CRIT +4%'))
      .toBeInTheDocument();
    expect(within(card).getByText(/Unholy/)).toBeInTheDocument();
  });

  it('describes a camp skill by its time cost', () => {
    render(<PartyHeroCard hero={crusader} position={1} />);
    hover(screen.getByAltText('Encourage'));

    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('Encourage')).toBeInTheDocument();
    expect(within(card).getByText('2 time')).toBeInTheDocument();
    expect(within(card).getByText('-15 Stress')).toBeInTheDocument();
  });

  it('describes a trinket by rarity, one line per clause', () => {
    render(<PartyHeroCard hero={crusader} position={1} />);
    hover(screen.getByAltText('Holy Orders'));

    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('Very Rare')).toBeInTheDocument();
    ['+15% Virtue Chance', '-20% Stress', '+12% Death Blow Resist'].forEach((clause) => {
      expect(within(card).getByText(clause)).toBeInTheDocument();
    });
  });

  it('reads a skill against the hero holding it, not the name alone', () => {
    // Battle Ballad belongs to the Jester; the Crusader has no such skill, and
    // the lookup must not fall through to some other class's entry.
    render(<PartyHeroCard hero={{ ...crusader, activeSkills: ['Battle Ballad'] }} position={1} />);
    hover(screen.getByAltText('Battle Ballad'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('draws a disease as a green quirk chip, next to the other two lists', () => {
    // Diseases are their own list on the hero but the same chip on the card:
    // colour is what says which list a name came out of.
    render(<PartyHeroCard hero={{ ...crusader, quirks: { positive: ['Tough'], negative: ['Fragile'] }, diseases: ['Tapeworm'] }} position={1} />);

    expect(screen.getByTitle('Tough')).toHaveClass('text-yellow-300');
    expect(screen.getByTitle('Fragile')).toHaveClass('text-red-300');
    expect(screen.getByTitle('Tapeworm')).toHaveClass('text-green-300');
  });

  it("keeps a Color of Madness quirk's own colour inside the positive list", () => {
    render(<PartyHeroCard hero={{ ...crusader, quirks: { positive: ['Prismatic Calm'], negative: ['Corvids Blindness'] } }} position={1} />);

    expect(screen.getByTitle('Prismatic Calm')).toHaveClass('text-sky-300');
    expect(screen.getByTitle('Corvids Blindness')).toHaveClass('text-purple-300');
  });

  it('opens a card on a quirk too, with what it does', () => {
    render(<PartyHeroCard hero={{ ...crusader, diseases: ['Tapeworm'] }} position={1} />);
    hover(screen.getByTitle('Tapeworm'));

    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('Disease · physical')).toBeInTheDocument();
    expect(within(card).getByText('+100% Food Consumed')).toBeInTheDocument();
  });

  it('escapes the card that would otherwise draw over it', () => {
    // The icons carry a hover transform and a dragged card carries opacity;
    // either creates a stacking context that traps a fixed child whatever its
    // z-index. The panel is portalled to the body so it cannot be trapped.
    const { container } = render(<PartyHeroCard hero={crusader} position={1} />);
    hover(screen.getByAltText('Smite'));

    const card = screen.getByRole('tooltip');
    expect(container).not.toContainElement(card);
  });
});
