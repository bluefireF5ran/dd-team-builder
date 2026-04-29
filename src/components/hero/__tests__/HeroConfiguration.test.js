import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroConfiguration from '../HeroConfiguration';
import { EMPTY_HERO } from '../../../constants';

// Mock ImageWithFallback to avoid image loading issues
jest.mock('../../common/ImageWithFallback', () => {
  return function MockImageWithFallback({ alt }) {
    return <div data-testid="hero-image">{alt}</div>;
  };
});

describe('HeroConfiguration', () => {
  const defaultProps = {
    hero: { ...EMPTY_HERO },
    position: 1,
    onUpdate: jest.fn(),
    showBackerTrinkets: false,
    showModdedHeroes: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders position number', () => {
    render(<HeroConfiguration {...defaultProps} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  test('shows placeholder when no hero selected', () => {
    render(<HeroConfiguration {...defaultProps} />);
    expect(screen.getByText(/Select a hero for position #1/)).toBeInTheDocument();
  });

  test('shows hero selector', () => {
    render(<HeroConfiguration {...defaultProps} />);
    expect(screen.getByText('Select Hero')).toBeInTheDocument();
  });

  test('shows combat skills section when hero is selected', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    expect(screen.getByText(/Combat Skills/)).toBeInTheDocument();
  });

  test('shows camp skills section when hero is selected', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    expect(screen.getByText(/Camp Skills/)).toBeInTheDocument();
  });

  test('shows trinkets section when hero is selected', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    expect(screen.getByText('Trinkets')).toBeInTheDocument();
  });

  test('shows quirks sections when hero is selected', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    expect(screen.getByText('Positive Quirks')).toBeInTheDocument();
    expect(screen.getByText('Negative Quirks')).toBeInTheDocument();
  });

  test('shows reset button when hero is selected', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    expect(screen.getByLabelText('Reset hero configuration')).toBeInTheDocument();
  });

  test('does not show reset button when no hero selected', () => {
    render(<HeroConfiguration {...defaultProps} />);
    expect(screen.queryByLabelText('Reset hero configuration')).not.toBeInTheDocument();
  });

  test('shows incomplete badge when hero is selected but not fully configured', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    // Should show alert icon (Incomplete badge is visible on all sizes now)
    const alertIcon = document.querySelector('.text-yellow-400');
    expect(alertIcon).toBeInTheDocument();
  });

  test('shows ready badge when hero is fully configured', () => {
    const hero = {
      ...EMPTY_HERO,
      heroClass: 'Crusader',
      activeSkills: ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance'],
      activeCampSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Zealous Vigil'],
      trinket1: 'Focus Ring',
      trinket2: 'Holy Orders',
    };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);
    // Should show check mark (Ready badge)
    const readyBadge = document.querySelector('.text-green-400');
    expect(readyBadge).toBeInTheDocument();
  });

  test('collapse/expand toggle works', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const toggleBtn = screen.getByLabelText('Collapse hero configuration');
    fireEvent.click(toggleBtn);

    expect(screen.getByLabelText('Expand hero configuration')).toBeInTheDocument();
  });

  test('toggling a skill calls onUpdate', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const smiteBtn = screen.getByText('Smite');
    fireEvent.click(smiteBtn);

    expect(defaultProps.onUpdate).toHaveBeenCalledTimes(1);
    const updatedHero = defaultProps.onUpdate.mock.calls[0][0];
    expect(updatedHero.activeSkills).toContain('Smite');
  });

  test('reset button shows confirm dialog', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const resetBtn = screen.getByLabelText('Reset hero configuration');
    fireEvent.click(resetBtn);

    expect(screen.getByText('Reset Configuration')).toBeInTheDocument();
    expect(screen.getByText(/This will reset all configuration/)).toBeInTheDocument();
  });

  test('confirm reset calls onUpdate with empty hero', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite'] };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const resetBtn = screen.getByLabelText('Reset hero configuration');
    fireEvent.click(resetBtn);

    const confirmBtn = screen.getByText('Continue');
    fireEvent.click(confirmBtn);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ heroClass: '', activeSkills: [] })
    );
  });

  test('cancel reset does not call onUpdate', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const resetBtn = screen.getByLabelText('Reset hero configuration');
    fireEvent.click(resetBtn);

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    // onUpdate should only have been called from the initial render effects, not from reset
    // Actually it shouldn't have been called at all since we cancelled
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });

  test('can add a positive quirk', () => {
    const hero = { ...EMPTY_HERO, heroClass: 'Crusader' };
    render(<HeroConfiguration {...defaultProps} hero={hero} />);

    const addBtn = screen.getAllByText('+ Add')[0]; // First + Add is for positive quirks
    fireEvent.click(addBtn);

    // Should show quirk selector
    expect(screen.getByPlaceholderText('Search quirks...')).toBeInTheDocument();
  });
});
