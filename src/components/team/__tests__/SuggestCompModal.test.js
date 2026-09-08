import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SuggestCompModal from '../SuggestCompModal';
import { parseSaveProfile, SAVE_FILES } from '../../../utils/saveParser';

const FIXTURES = path.join(__dirname, '..', '..', '..', 'utils', '__tests__', 'fixtures', 'save');
const read = (name) => fs.readFileSync(path.join(FIXTURES, name));

const saveProfile = () =>
  parseSaveProfile(Object.fromEntries(Object.values(SAVE_FILES).map((n) => [n, read(n)])));

const setup = (props = {}) => {
  const handlers = { onClose: jest.fn(), onSuggest: jest.fn(), showToast: jest.fn() };
  const view = render(<SuggestCompModal isOpen {...handlers} {...props} />);
  return { ...handlers, ...view };
};

// Each tile is a button labelled with the class name (plus its count badge).
const tile = (name) => screen.getByRole('button', { name: new RegExp(`^${name}`) });
const suggest = () => screen.getByRole('button', { name: /Suggest Comp/i });
const clear = () => fireEvent.click(screen.getByRole('button', { name: /Clear/i }));

beforeEach(() => localStorage.clear());

describe('SuggestCompModal roster counts', () => {
  it('counts how many of a class you have, not just whether you have one', () => {
    const { onSuggest } = setup();
    clear();

    fireEvent.click(tile('Jester'));
    expect(within(tile('Jester')).queryByText('×2')).not.toBeInTheDocument();

    fireEvent.click(tile('Jester'));
    expect(within(tile('Jester')).getByText('×2')).toBeInTheDocument();

    fireEvent.click(tile('Crusader'));
    fireEvent.click(tile('Vestal'));
    fireEvent.click(suggest());

    const [roster] = onSuggest.mock.calls[0];
    expect(roster.filter((name) => name === 'Jester')).toHaveLength(2);
    expect(roster).toHaveLength(4);
  });

  it('cycles back to none rather than trapping a hero at four', () => {
    setup();
    clear();
    // 1, 2, 3, 4, then off again.
    for (let i = 0; i < 4; i++) fireEvent.click(tile('Hellion'));
    expect(within(tile('Hellion')).getByText('×4')).toBeInTheDocument();
    fireEvent.click(tile('Hellion'));
    expect(within(tile('Hellion')).queryByText('×4')).not.toBeInTheDocument();
    expect(suggest()).toBeDisabled();
  });

  it('will not let a class go past a full party', () => {
    setup();
    clear();
    for (let i = 0; i < 9; i++) fireEvent.click(tile('Leper'));
    // Nine clicks is two full cycles minus one, so the count is 4, not 9.
    expect(within(tile('Leper')).getByText('×4')).toBeInTheDocument();
  });

  it('needs four heroes, counting duplicates', () => {
    const { onSuggest, showToast } = setup();
    clear();
    fireEvent.click(tile('Jester'));
    fireEvent.click(tile('Jester'));
    fireEvent.click(tile('Jester'));
    expect(suggest()).toBeDisabled();

    fireEvent.click(tile('Jester'));
    expect(suggest()).not.toBeDisabled();
    fireEvent.click(suggest());
    expect(showToast).not.toHaveBeenCalledWith(expect.stringMatching(/at least 4/), 'warning');
    expect(onSuggest.mock.calls[0][0]).toEqual(['Jester', 'Jester', 'Jester', 'Jester']);
  });

  it('remembers the counts, not just the classes', () => {
    const { unmount } = setup();
    clear();
    fireEvent.click(tile('Arbalest'));
    fireEvent.click(tile('Arbalest'));
    unmount();

    setup();
    expect(within(tile('Arbalest')).getByText('×2')).toBeInTheDocument();
  });
});

describe('SuggestCompModal with an imported save', () => {
  it('loads one entry per hero, so the two Plague Doctors count twice', () => {
    const { onSuggest } = setup({ saveProfile: saveProfile() });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));

    expect(within(tile('Plague Doctor')).getByText('×2')).toBeInTheDocument();
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][0].filter((n) => n === 'Plague Doctor')).toHaveLength(2);
  });

  it('offers no save-roster button without a save', () => {
    setup();
    expect(screen.queryByRole('button', { name: /Use Save Roster/i })).not.toBeInTheDocument();
  });

  it('leaves out heroes locked in a building, and puts them back on request', () => {
    const profile = saveProfile();
    const busy = {
      ...profile,
      heroes: profile.heroes.map((hero) =>
        hero.name === 'Campbell' ? { ...hero, activity: 'abbey' } : hero
      )
    };
    setup({ saveProfile: busy });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));

    // Campbell is in the Abbey this week, so only one Plague Doctor is free.
    expect(within(tile('Plague Doctor')).queryByText('×2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Skip 1 busy in town/i }));
    expect(within(tile('Plague Doctor')).getByText('×2')).toBeInTheDocument();
  });

  it('hides the busy switch when nobody is busy', () => {
    setup({ saveProfile: saveProfile() });
    expect(screen.queryByRole('button', { name: /busy in town/i })).not.toBeInTheDocument();
  });

  it('passes the trinket requirement through to the suggester', () => {
    const profile = saveProfile();
    const { onSuggest } = setup({
      saveProfile: { ...profile, ownedTrinkets: ["Ancestor's Bottle"] }
    });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));
    fireEvent.click(screen.getByRole('button', { name: /Only comps I can fully equip/i }));
    fireEvent.click(suggest());

    expect(onSuggest.mock.calls[0][1]).toEqual({ requireOwnedTrinkets: true, reequip: true });
  });

  it('re-equips from your own trinkets by default, and can be told not to', () => {
    const profile = saveProfile();
    const { onSuggest } = setup({
      saveProfile: { ...profile, ownedTrinkets: ["Ancestor's Bottle"] }
    });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));
    fireEvent.click(screen.getByRole('button', { name: /Re-equip from my trinkets/i }));
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1]).toEqual({ requireOwnedTrinkets: false, reequip: false });
  });

  it('offers no trinket switches without an inventory', () => {
    setup({ saveProfile: saveProfile() });
    expect(screen.queryByRole('button', { name: /Re-equip/i })).not.toBeInTheDocument();
  });

  it('hides the trinket switch when the inventory is empty', () => {
    // Both test saves are early-game with nothing in the estate.
    setup({ saveProfile: saveProfile() });
    expect(screen.queryByRole('button', { name: /fully equip/i })).not.toBeInTheDocument();
  });
});
