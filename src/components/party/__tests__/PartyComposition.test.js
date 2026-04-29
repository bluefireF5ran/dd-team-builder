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

  test('shows synergy indicator when heroes are selected', () => {
    const heroes = Array(4).fill(null).map(() => ({ ...EMPTY_HERO }));
    // Use duplicate class to guarantee a warning
    heroes[0].heroClass = 'Crusader';
    heroes[1].heroClass = 'Crusader';
    heroes[2].heroClass = 'Hellion';
    heroes[3].heroClass = 'Grave Robber';
    render(<PartyComposition {...defaultProps} heroes={heroes} />);
    // Should show synergy section with duplicate class warning
    const synergyText = screen.queryByText(/Team Synergy|Team Warnings|Issues Detected/);
    expect(synergyText).toBeInTheDocument();
  });
});
