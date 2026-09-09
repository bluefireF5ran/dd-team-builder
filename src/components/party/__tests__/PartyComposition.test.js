import React from 'react';
import { render, screen } from '@testing-library/react';
import PartyComposition from '../PartyComposition';
import { EMPTY_HERO } from '../../../constants';

describe('PartyComposition', () => {
  const defaultProps = {
    heroes: Array(4).fill(null).map(() => ({ ...EMPTY_HERO })),
    onSwapHeroes: jest.fn(),
    teamName: 'Test Team',
    location: 'The Ruins'
  };

  test('renders team name and location', () => {
    render(<PartyComposition {...defaultProps} />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.getByText('The Ruins')).toBeInTheDocument();
  });

  test('renders Party Composition heading', () => {
    render(<PartyComposition {...defaultProps} />);
    expect(screen.getByText('Party Composition')).toBeInTheDocument();
  });

  test('renders 4 hero position cards', () => {
    render(<PartyComposition {...defaultProps} />);
    // Check that 4 hero cards are rendered via role="listitem"
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  test('shows hero class names when heroes are selected', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    heroes[0].heroClass = 'Crusader';
    heroes[3].heroClass = 'Vestal';
    render(<PartyComposition {...defaultProps} heroes={heroes} />);
    expect(screen.getByText(/Crusader/)).toBeInTheDocument();
    expect(screen.getByText(/Vestal/)).toBeInTheDocument();
  });

  // Two Crusaders and no healer used to be enough to light this panel up. It
  // is a working party, so the panel stays dark.
  test('says nothing about a party with nothing wrong with it', () => {
    const heroes = [
      { ...EMPTY_HERO, heroClass: 'Hellion', activeSkills: ['Wicked Hack', 'Iron Swan'] },
      { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite', 'Stunning Blow'] },
      { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Holy Lance', 'Battle Heal'] },
      { ...EMPTY_HERO, heroClass: 'Grave Robber', activeSkills: ['Poison Darts', 'Thrown Dagger'] }
    ];
    render(<PartyComposition {...defaultProps} heroes={heroes} />);
    expect(screen.queryByText(/Team Synergy|Issues Detected/)).not.toBeInTheDocument();
  });

  test('shows the panel for a hero who cannot act from their rank', () => {
    const heroes = [
      { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite'] },
      { ...EMPTY_HERO, heroClass: 'Hellion', activeSkills: ['Wicked Hack'] },
      { ...EMPTY_HERO, heroClass: 'Vestal', activeSkills: ['Judgement'] },
      { ...EMPTY_HERO, heroClass: 'Leper', activeSkills: ['Hew', 'Chop'] }
    ];
    render(<PartyComposition {...defaultProps} heroes={heroes} />);
    expect(screen.getByText('Issues Detected')).toBeInTheDocument();
  });
});
