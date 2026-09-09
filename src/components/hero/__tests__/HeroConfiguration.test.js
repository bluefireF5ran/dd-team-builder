import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import HeroConfiguration from '../HeroConfiguration';
import { EMPTY_HERO } from '../../../constants';
import { MODDED_HERO_CLASSES } from '../../../data/modded_heroes';

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
    expect(screen.getByTestId('hero-status')).toHaveAttribute('data-status', 'incomplete');
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
    expect(screen.getByTestId('hero-status')).toHaveAttribute('data-status', 'ready');
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

  describe('hero clipboard', () => {
    const vestal = {
      ...EMPTY_HERO,
      heroClass: 'Vestal',
      activeSkills: ['Judgement', 'Divine Grace'],
      trinket1: "Junia's Head"
    };

    afterEach(() => { delete navigator.clipboard; });

    test('copy is offered only once a hero is picked, paste always', () => {
      const { rerender } = render(<HeroConfiguration {...defaultProps} />);
      expect(screen.queryByLabelText('Copy hero loadout')).not.toBeInTheDocument();
      // Pegar en un hueco vacio es justo el caso de mover un heroe entre comps.
      expect(screen.getByLabelText('Paste hero loadout')).toBeInTheDocument();

      rerender(<HeroConfiguration {...defaultProps} hero={vestal} />);
      expect(screen.getByLabelText('Copy hero loadout')).toBeInTheDocument();
    });

    test('copying writes the loadout and says so', async () => {
      const writeText = jest.fn().mockResolvedValue();
      navigator.clipboard = { writeText };
      const showToast = jest.fn();
      render(<HeroConfiguration {...defaultProps} hero={vestal} showToast={showToast} />);

      fireEvent.click(screen.getByLabelText('Copy hero loadout'));
      await waitFor(() => expect(writeText).toHaveBeenCalled());
      expect(JSON.parse(writeText.mock.calls[0][0]).hero.trinket1).toBe("Junia's Head");
      expect(showToast).toHaveBeenCalledWith('Vestal loadout copied!', 'success');
    });

    test('pasting into an empty slot applies straight away', async () => {
      navigator.clipboard = { readText: jest.fn().mockResolvedValue(JSON.stringify(vestal)) };
      const onUpdate = jest.fn();
      const showToast = jest.fn();
      render(<HeroConfiguration {...defaultProps} onUpdate={onUpdate} showToast={showToast} />);

      fireEvent.click(screen.getByLabelText('Paste hero loadout'));
      await waitFor(() => expect(onUpdate).toHaveBeenCalled());
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ heroClass: 'Vestal', trinket1: "Junia's Head" }));
      expect(showToast).toHaveBeenCalledWith('Pasted Vestal into position #1!', 'success');
    });

    test('pasting over a configured hero asks first', async () => {
      navigator.clipboard = { readText: jest.fn().mockResolvedValue(JSON.stringify(vestal)) };
      const onUpdate = jest.fn();
      const configured = { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite'] };
      render(<HeroConfiguration {...defaultProps} hero={configured} onUpdate={onUpdate} />);

      fireEvent.click(screen.getByLabelText('Paste hero loadout'));
      await screen.findByText('Paste Over Hero');
      expect(onUpdate).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText('Continue'));
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ heroClass: 'Vestal' }));
    });

    test('cancelling the overwrite leaves the hero alone', async () => {
      navigator.clipboard = { readText: jest.fn().mockResolvedValue(JSON.stringify(vestal)) };
      const onUpdate = jest.fn();
      const configured = { ...EMPTY_HERO, heroClass: 'Crusader', activeSkills: ['Smite'] };
      render(<HeroConfiguration {...defaultProps} hero={configured} onUpdate={onUpdate} />);

      fireEvent.click(screen.getByLabelText('Paste hero loadout'));
      await screen.findByText('Paste Over Hero');
      fireEvent.click(screen.getByText('Cancel'));
      expect(onUpdate).not.toHaveBeenCalled();
    });

    test('a bad clipboard reports why and changes nothing', async () => {
      navigator.clipboard = { readText: jest.fn().mockResolvedValue('not json') };
      const onUpdate = jest.fn();
      const showToast = jest.fn();
      render(<HeroConfiguration {...defaultProps} onUpdate={onUpdate} showToast={showToast} />);

      fireEvent.click(screen.getByLabelText('Paste hero loadout'));
      await waitFor(() => expect(showToast).toHaveBeenCalled());
      expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/does not contain a hero/i), 'error');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    test('warns when a pasted modded hero cannot be edited yet', async () => {
      const modded = { ...EMPTY_HERO, heroClass: Object.keys(MODDED_HERO_CLASSES)[0] };
      navigator.clipboard = { readText: jest.fn().mockResolvedValue(JSON.stringify(modded)) };
      const showToast = jest.fn();
      render(<HeroConfiguration {...defaultProps} showModdedHeroes={false} showToast={showToast} />);

      fireEvent.click(screen.getByLabelText('Paste hero loadout'));
      await waitFor(() => expect(showToast).toHaveBeenCalledTimes(2));
      expect(showToast).toHaveBeenLastCalledWith(expect.stringMatching(/enable modded heroes/i), 'error');
    });
  });

  describe('trinket effects', () => {
    // 'Holy Orders' is the Crusader's Very Rare; 'Flickering Lamplight' is the
    // Fire's Edge generic the game ships with an empty buff list, so it has no
    // entry at all and exercises the name-only fallback.
    const withTrinket = (trinket1) => ({ ...EMPTY_HERO, heroClass: 'Crusader', trinket1 });
    const HOLY_ORDERS = '+15% Virtue Chance | -20% Stress | +12% Death Blow Resist'
      + ' | -20% Blight Resist | -20% Bleed Resist';
    // The handler sits on HoverCard's own span, and React's onMouseEnter does
    // not bubble, so the event has to be aimed at the wrapper rather than the
    // icon or button inside it.
    // With nothing to show HoverCard renders its child bare, so there may be no
    // wrapper at all - hovering the element itself is then the honest gesture.
    // Walking to the wrapper is the point: no query can express "the element
    // carrying the handler", and firing at the child would test nothing.
    /* eslint-disable testing-library/no-node-access */
    const hover = (el) => fireEvent.mouseEnter(el.closest('span') || el);
    const unhover = (el) => fireEvent.mouseLeave(el.closest('span') || el);
    /* eslint-enable testing-library/no-node-access */

    test('shows the effect beneath an equipped trinket', () => {
      render(<HeroConfiguration {...defaultProps} hero={withTrinket('Holy Orders')} />);
      // The name resolves twice (the mocked image renders its alt as text), so
      // the effect line is the assertion that actually pins the new markup.
      expect(screen.getAllByText('Holy Orders').length).toBeGreaterThan(0);
      expect(screen.getByText(HOLY_ORDERS)).toBeInTheDocument();
    });

    test('hovering the equipped slot opens a card with rarity and every clause', () => {
      render(<HeroConfiguration {...defaultProps} hero={withTrinket('Holy Orders')} />);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      hover(screen.getByTitle('Holy Orders'));
      const card = screen.getByRole('tooltip');
      expect(within(card).getByText('Very Rare')).toBeInTheDocument();
      // The card splits the effect on " | " so each clause is its own line.
      HOLY_ORDERS.split(' | ').forEach((clause) => {
        expect(within(card).getByText(clause)).toBeInTheDocument();
      });

      unhover(screen.getByTitle('Holy Orders'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    test('opens no card for a trinket with no known effect', () => {
      render(<HeroConfiguration {...defaultProps} hero={withTrinket('Flickering Lamplight')} />);
      hover(screen.getByTitle('Flickering Lamplight'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    test('shows effects on the cards in the trinket picker', () => {
      render(<HeroConfiguration {...defaultProps} hero={{ ...EMPTY_HERO, heroClass: 'Crusader' }} />);
      fireEvent.click(screen.getByText('Trinket 1'));

      // The picker may list the same trinket under both Recommended and Class
      // Specific, so this asserts presence rather than a single match.
      expect(screen.getAllByText(HOLY_ORDERS).length).toBeGreaterThan(0);

      hover(screen.getAllByTitle('Holy Orders')[0]);
      expect(within(screen.getByRole('tooltip')).getByText('Very Rare')).toBeInTheDocument();
    });
  });

  describe('build for this rank', () => {
    const bare = (heroClass) => ({ ...EMPTY_HERO, heroClass });

    it('is not offered until a class is picked', () => {
      render(<HeroConfiguration {...defaultProps} />);
      expect(screen.queryByLabelText(/Build for rank/)).not.toBeInTheDocument();
    });

    it('fills an empty hero without asking', () => {
      const onUpdate = jest.fn();
      render(
        <HeroConfiguration {...defaultProps} hero={bare('Vestal')} position={3} onUpdate={onUpdate} />
      );
      fireEvent.click(screen.getByLabelText('Build for rank 3'));

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const built = onUpdate.mock.calls[0][0];
      expect(built.activeSkills).toHaveLength(4);
      expect(built.activeCampSkills).toHaveLength(4);
      expect(built.trinket1).toBeTruthy();
    });

    it('builds the same class differently at rank 1 and rank 4', () => {
      const atRank = (position) => {
        const onUpdate = jest.fn();
        const view = render(
          <HeroConfiguration
            {...defaultProps}
            hero={bare('Occultist')}
            position={position}
            onUpdate={onUpdate}
          />
        );
        fireEvent.click(screen.getByLabelText(`Build for rank ${position}`));
        view.unmount();
        return onUpdate.mock.calls[0][0].activeSkills;
      };
      expect(atRank(1)).not.toEqual(atRank(4));
    });

    it('asks before overwriting a hero that is already configured', () => {
      const onUpdate = jest.fn();
      render(
        <HeroConfiguration
          {...defaultProps}
          hero={{ ...bare('Vestal'), activeSkills: ['Judgement'] }}
          position={2}
          onUpdate={onUpdate}
        />
      );
      fireEvent.click(screen.getByLabelText('Build for rank 2'));

      expect(onUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('Build for this rank')).toBeInTheDocument();
    });

    it('keeps a locked quirk, because the game will not let you drop it', () => {
      const onUpdate = jest.fn();
      render(
        <HeroConfiguration
          {...defaultProps}
          hero={{
            ...bare('Vestal'),
            quirks: { positive: ['Quick Reflexes'], negative: [] },
            lockedQuirks: { positive: ['Quick Reflexes'], negative: [] }
          }}
          position={3}
          onUpdate={onUpdate}
        />
      );
      fireEvent.click(screen.getByLabelText('Build for rank 3'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      const built = onUpdate.mock.calls[0][0];
      expect(built.quirks.positive).toContain('Quick Reflexes');
    });
  });
});

describe('HeroConfiguration quirks, diseases and auto-sort', () => {
  const crusader = { ...EMPTY_HERO, heroClass: 'Crusader' };
  const props = { position: 1, onUpdate: jest.fn(), showBackerTrinkets: false, showModdedHeroes: false };

  beforeEach(() => { jest.clearAllMocks(); });

  const addButtons = () => screen.getAllByText('+ Add');

  test('the quirk picker opens as a grid of effects, not a bare name list', () => {
    render(<HeroConfiguration {...props} hero={crusader} />);
    fireEvent.click(addButtons()[0]);

    expect(screen.getByText('Select Positive Quirk')).toBeInTheDocument();
    // '+10% MAX HP' is Tough; the old dropdown showed the name alone.
    expect(screen.getAllByText('+10% MAX HP').length).toBeGreaterThan(0);
  });

  test('choosing a quirk adds it to the right list', () => {
    const onUpdate = jest.fn();
    render(<HeroConfiguration {...props} hero={crusader} onUpdate={onUpdate} />);

    fireEvent.click(addButtons()[0]);
    fireEvent.click(screen.getAllByTitle('Tough')[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ quirks: { positive: ['Tough'], negative: [] } })
    );
  });

  describe('diseases', () => {
    test('are not offered until the setting is on', () => {
      render(<HeroConfiguration {...props} hero={crusader} />);
      expect(screen.queryByText('Diseases')).not.toBeInTheDocument();
    });

    test('get their own list once the setting is on', () => {
      render(<HeroConfiguration {...props} hero={crusader} showDiseases />);
      expect(screen.getByText('Diseases')).toBeInTheDocument();
      // Three lists now: positive, negative, diseases.
      expect(addButtons()).toHaveLength(3);
    });

    test('land in their own field rather than among the negative quirks', () => {
      const onUpdate = jest.fn();
      render(<HeroConfiguration {...props} hero={crusader} showDiseases onUpdate={onUpdate} />);

      fireEvent.click(addButtons()[2]);
      fireEvent.click(screen.getAllByTitle('Tapeworm')[0]);

      const updated = onUpdate.mock.calls[0][0];
      expect(updated.diseases).toEqual(['Tapeworm']);
      expect(updated.quirks.negative).toEqual([]);
    });

    test('a comp that already carries one still shows it with the setting off', () => {
      // Turning the switch off must never hide data that is really there.
      render(<HeroConfiguration {...props} hero={{ ...crusader, diseases: ['Tapeworm'] }} />);
      expect(screen.getByText('Diseases')).toBeInTheDocument();
      expect(screen.getByText('Tapeworm')).toBeInTheDocument();
      // ...but it cannot be added to, since the content is switched off.
      expect(addButtons()).toHaveLength(2);
    });

    test('cannot be locked, because a disease is cured rather than pinned', () => {
      render(<HeroConfiguration {...props} hero={{ ...crusader, diseases: ['Tapeworm'] }} showDiseases />);
      expect(screen.queryByLabelText('Lock Tapeworm')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Remove Tapeworm')).toBeInTheDocument();
    });
  });

  describe('auto-sort skills', () => {
    // Crusader skills in declared order: Smite, Zealous Accusation, Stunning
    // Blow, Holy Lance, Battle Heal, Inspiring Cry, Bulwark of Faith.
    const outOfOrder = { ...crusader, activeSkills: ['Holy Lance', 'Smite'] };

    test('leaves click order alone when the setting is off', () => {
      const onUpdate = jest.fn();
      render(<HeroConfiguration {...props} hero={outOfOrder} onUpdate={onUpdate} />);

      fireEvent.click(screen.getByText('Stunning Blow'));
      expect(onUpdate.mock.calls[0][0].activeSkills).toEqual(['Holy Lance', 'Smite', 'Stunning Blow']);
    });

    test('sorts into the class order when the setting is on', () => {
      const onUpdate = jest.fn();
      render(<HeroConfiguration {...props} hero={outOfOrder} onUpdate={onUpdate} autoSortSkills />);

      fireEvent.click(screen.getByText('Stunning Blow'));
      expect(onUpdate.mock.calls[0][0].activeSkills).toEqual(['Smite', 'Stunning Blow', 'Holy Lance']);
    });

    test('sorts camp skills the same way', () => {
      const onUpdate = jest.fn();
      const hero = { ...crusader, activeCampSkills: ['Zealous Vigil', 'Encourage'] };
      render(<HeroConfiguration {...props} hero={hero} onUpdate={onUpdate} autoSortSkills />);

      fireEvent.click(screen.getByText('Pep Talk'));
      expect(onUpdate.mock.calls[0][0].activeCampSkills).toEqual(['Encourage', 'Pep Talk', 'Zealous Vigil']);
    });

    test('touches nothing until a slot actually changes', () => {
      // A comp loaded with a deliberate order keeps it: rendering with the
      // setting on must not fire an update of its own.
      const onUpdate = jest.fn();
      render(<HeroConfiguration {...props} hero={outOfOrder} onUpdate={onUpdate} autoSortSkills />);
      expect(onUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('Holy Lance')).toBeInTheDocument();
    });
  });
});
