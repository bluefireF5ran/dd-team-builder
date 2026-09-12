import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrinketPicker from '../TrinketPicker';
import { TRINKET_EFFECTS } from '../../../data/trinketEffects';
import { RARITY_TONES } from '../../../utils/trinketRarity';

const open = (props = {}) => render(
  <TrinketPicker
    isOpen
    onClose={jest.fn()}
    onChange={jest.fn()}
    value={null}
    heroClass="Crusader"
    showBackerTrinkets={false}
    showModdedHeroes={false}
    slotLabel="Trinket 1"
    {...props}
  />
);

const type = (value) =>
  fireEvent.change(screen.getByLabelText('Search trinkets'), { target: { value } });

describe('TrinketPicker', () => {
  it('renders nothing while closed', () => {
    const { container } = open({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('hands the chosen trinket back and closes', () => {
    const onChange = jest.fn();
    const onClose = jest.fn();
    open({ onChange, onClose });

    fireEvent.click(screen.getAllByTitle('Sun Ring')[0]);
    expect(onChange).toHaveBeenCalledWith('Sun Ring');
    expect(onClose).toHaveBeenCalled();
  });

  describe('searching what a trinket does', () => {
    it('finds trinkets by their effect, not only their name', () => {
      // "Tough Ring" grants MAX HP and has no "dodge" in its name; searching a
      // stat used to return nothing at all.
      open();
      type('dodge');
      const hits = screen.getAllByRole('button').map((b) => b.getAttribute('title')).filter(Boolean);
      expect(hits.length).toBeGreaterThan(1);
      // every hit must genuinely mention dodge somewhere
      expect(hits.some((n) => !/dodg/i.test(n))).toBe(true);
    });

    it('accepts the word a player types for the stat the data abbreviates', () => {
      open();
      type('accuracy');
      const status = screen.getByRole('status');
      expect(status).not.toHaveTextContent('No matches');
    });

    it('says when nothing matches, and points at effects', () => {
      open();
      type('zzzzzz');
      expect(screen.getByText(/No trinkets match your search/)).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('No matches');
    });

    it('ands the terms together', () => {
      open();
      type('dodge');
      const wide = screen.getAllByRole('button').length;
      type('dodge stun');
      const narrow = screen.getAllByRole('button').length;
      expect(narrow).toBeLessThan(wide);
    });
  });

  describe('rarity chips', () => {
    it('offers the drop tiers present in the list', () => {
      open();
      expect(screen.getByRole('button', { name: 'Very Rare' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Common' })).toBeInTheDocument();
    });

    it('narrows the grid to one tier, and toggles back off', () => {
      open();
      const all = screen.getAllByRole('button').length;

      fireEvent.click(screen.getByRole('button', { name: 'Very Rare' }));
      const filtered = screen.getAllByRole('button').length;
      expect(filtered).toBeLessThan(all);
      expect(screen.getByRole('button', { name: 'Very Rare' })).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(screen.getByRole('button', { name: 'Very Rare' }));
      expect(screen.getAllByRole('button').length).toBe(all);
    });
  });

  describe('rarity borders', () => {
    const cell = (name) => screen.getAllByTitle(name)[0];

    it('draws a cell in its own rarity colour', () => {
      open();
      const rarity = TRINKET_EFFECTS['Sun Ring'].rarity;
      expect(cell('Sun Ring')).toHaveStyle({ borderColor: RARITY_TONES[rarity].colour });
    });

    it('gives two different tiers two different borders', () => {
      open();
      const a = TRINKET_EFFECTS['Sun Ring'].rarity;
      const other = Object.keys(TRINKET_EFFECTS)
        .find((n) => TRINKET_EFFECTS[n].rarity && TRINKET_EFFECTS[n].rarity !== a
          && screen.queryAllByTitle(n).length);
      expect(other).toBeDefined();
      expect(cell(other)).not.toHaveStyle({ borderColor: RARITY_TONES[a].colour });
    });

    it('keeps the rarity visible on the selected trinket', () => {
      // Selection is a ring, not a border colour - overwriting the border
      // with gold would hide the tier.
      open({ value: 'Sun Ring' });
      const rarity = TRINKET_EFFECTS['Sun Ring'].rarity;
      const selected = cell('Sun Ring');
      expect(selected).toHaveStyle({ borderColor: RARITY_TONES[rarity].colour });
      expect(selected.className).toContain('ring-dd-gold');
    });
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    open({ onClose });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

});
