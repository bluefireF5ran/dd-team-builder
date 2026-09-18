import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SuggestCompModal from '../SuggestCompModal';
import { parseSaveProfile, SAVE_FILES } from '../../../utils/saveParser';
import { RESOLVE_THRESHOLDS } from '../../../data/regionProfiles';

const FIXTURES = path.join(__dirname, '..', '..', '..', 'utils', '__tests__', 'fixtures', 'save');
const read = (name) => fs.readFileSync(path.join(FIXTURES, name));

// Only the files the fixture actually has: it predates `persist.town.json`.
const saveProfile = () =>
  parseSaveProfile(
    Object.fromEntries(
      Object.values(SAVE_FILES)
        .filter((n) => fs.existsSync(path.join(FIXTURES, n)))
        .map((n) => [n, read(n)])
    )
  );

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

    expect(onSuggest.mock.calls[0][1]).toEqual({
      requireOwnedTrinkets: true,
      reequip: true,
      preferRested: true,
      missionTier: null,
      // The fixture is a Darkest save, and the campaign travels with the
      // request because it decides what a hero's XP is worth.
      difficulty: 'darkest'
    });
  });

  it('re-equips from your own trinkets by default, and can be told not to', () => {
    const profile = saveProfile();
    const { onSuggest } = setup({
      saveProfile: { ...profile, ownedTrinkets: ["Ancestor's Bottle"] }
    });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));
    fireEvent.click(screen.getByRole('button', { name: /Re-equip from my trinkets/i }));
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1]).toEqual({
      requireOwnedTrinkets: false,
      reequip: false,
      preferRested: true,
      missionTier: null,
      // The fixture is a Darkest save, and the campaign travels with the
      // request because it decides what a hero's XP is worth.
      difficulty: 'darkest'
    });
  });

  it('leans away from stressed heroes, and can be told not to', () => {
    const profile = saveProfile();
    // One hero at 80, everyone else fresh, so the count on the switch is a
    // fact about the save rather than about the fixture's own stress values.
    const stressed = {
      ...profile,
      heroes: profile.heroes.map((hero, index) => ({ ...hero, stress: index === 0 ? 80 : 0 }))
    };
    const { onSuggest } = setup({ saveProfile: stressed });
    fireEvent.click(screen.getByRole('button', { name: /Use Save Roster/i }));

    // The count is the heroes a player would think twice about, not everyone
    // with a mark on the bar.
    const toggle = screen.getByRole('button', { name: /Favour rested \(1 stressed\)/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1].preferRested).toBe(false);
  });

  it('hides the stress switch when the whole roster is rested', () => {
    const profile = saveProfile();
    setup({
      saveProfile: { ...profile, heroes: profile.heroes.map((hero) => ({ ...hero, stress: 0 })) }
    });
    expect(screen.queryByRole('button', { name: /rested/i })).not.toBeInTheDocument();
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

/**
 * A quest is a difficulty as well as a place: Apprentice takes Resolve 0-2,
 * Veteran 3-4, Champion 5-6. A save holds all three at once, so the roster has
 * to be cut to the run you are actually about to take.
 */
describe('SuggestCompModal mission level', () => {
  // The fixture is week 4 and everybody on it is Resolve 0-2. Levels are given
  // out here so the band being tested is a fact about the test, not about how
  // far that particular save happened to get.
  const levelled = (profile, byClass) => ({
    ...profile,
    heroes: profile.heroes.map((hero) => ({
      ...hero,
      resolveXp: RESOLVE_THRESHOLDS[byClass[hero.heroClass] ?? 0]
    }))
  });

  const mission = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

  it('offers no mission row without a save — there are no levels to read', () => {
    setup();
    expect(screen.queryByRole('button', { name: /^Apprentice/ })).not.toBeInTheDocument();
  });

  it('counts the roster by band before you choose', () => {
    const profile = levelled(saveProfile(), { 'Plague Doctor': 4, Crusader: 5 });
    setup({ saveProfile: profile });
    // Two Plague Doctors are Veteran, one Crusader is Champion, the rest are
    // the recruits the fixture actually has.
    expect(within(mission('Veteran')).getByText('2')).toBeInTheDocument();
    expect(within(mission('Champion')).getByText('1')).toBeInTheDocument();
  });

  it('cuts the roster to the band, and hands the band to the suggester', () => {
    const profile = levelled(saveProfile(), { 'Plague Doctor': 4, Vestal: 3, Crusader: 3, Duelist: 3 });
    const { onSuggest } = setup({ saveProfile: profile });
    fireEvent.click(mission('Veteran'));

    // The fixture has two Plague Doctors, one Crusader and one Duelist at
    // Veteran; everyone else drops off the tiles entirely.
    expect(within(tile('Plague Doctor')).getByText('×2')).toBeInTheDocument();
    expect(tile('Occultist').getAttribute('title')).not.toMatch(/you have \d/);

    fireEvent.click(suggest());
    const [roster, options] = onSuggest.mock.calls[0];
    expect(options.missionTier).toBe('veteran');
    expect(roster.sort()).toEqual(['Crusader', 'Duelist', 'Plague Doctor', 'Plague Doctor']);
  });

  it('gives the whole roster back when the mission is cleared', () => {
    const profile = levelled(saveProfile(), { 'Plague Doctor': 4 });
    const { onSuggest } = setup({ saveProfile: profile });
    fireEvent.click(mission('Veteran'));
    fireEvent.click(mission('Any level'));
    fireEvent.click(suggest());

    expect(onSuggest.mock.calls[0][1].missionTier).toBeNull();
    expect(onSuggest.mock.calls[0][0]).toHaveLength(profile.heroes.length);
  });

  it('widens to whoever may still embark rather than refusing to answer', () => {
    // Everyone on the fixture is Resolve 0-2, so a Champion run has nobody of
    // its own band - and Champion takes anybody, so all nine come along.
    const { showToast, onSuggest } = setup({ saveProfile: saveProfile() });
    fireEvent.click(mission('Champion'));

    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/Only 0 Champion heroes .*still lets in joined them/),
      'warning'
    );
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][0]).toHaveLength(9);
    expect(onSuggest.mock.calls[0][1].missionTier).toBe('champion');
  });

  it('says you have no party when the cap will not let anyone in', () => {
    // Apprentice cannot widen: everyone outside its band is ABOVE it, and the
    // game turns those heroes away. Two heroes is the honest answer.
    const profile = levelled(saveProfile(), { Crusader: 1, Highwayman: 2 });
    const { showToast } = setup({
      saveProfile: {
        ...profile,
        heroes: profile.heroes.map((hero) =>
          ['Crusader', 'Highwayman'].includes(hero.heroClass)
            ? hero
            : { ...hero, resolveXp: RESOLVE_THRESHOLDS[4] }
        )
      }
    });
    fireEvent.click(mission('Apprentice'));

    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/Only 2 of your heroes can go on a Apprentice run/),
      'warning'
    );
    expect(suggest()).toBeDisabled();
  });

  it('reads a Radiant save on Radiant’s own table', () => {
    // 7 XP is Resolve 2 in Radiant and Resolve 1 in Darkest, so the same hero
    // lands in a different band depending on the campaign.
    const profile = saveProfile();
    const sevens = {
      ...profile,
      heroes: profile.heroes.map((hero) => ({ ...hero, resolveXp: 7 }))
    };
    const { unmount } = setup({ saveProfile: { ...sevens, difficulty: 'darkest' } });
    expect(within(mission('Apprentice')).getByText(String(profile.heroes.length))).toBeInTheDocument();
    unmount();

    // Both are Apprentice here; what changes is the level, which Veteran shows
    // by staying empty either way. Assert the campaign reaches the suggester.
    const { onSuggest } = setup({ saveProfile: { ...sevens, difficulty: 'radiant' } });
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1].difficulty).toBe('radiant');
  });

  it('remembers the mission beside the roster it produced', () => {
    const profile = levelled(saveProfile(), { 'Plague Doctor': 4, Vestal: 3, Crusader: 3, Duelist: 3 });
    const { unmount } = setup({ saveProfile: profile });
    fireEvent.click(mission('Veteran'));
    unmount();

    const { onSuggest } = setup({ saveProfile: profile });
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1].missionTier).toBe('veteran');
  });

  it('drops the mission when the import modal hands a roster over', () => {
    const profile = levelled(saveProfile(), { 'Plague Doctor': 4, Vestal: 3, Crusader: 3, Duelist: 3 });
    const { unmount } = setup({ saveProfile: profile });
    fireEvent.click(mission('Veteran'));
    unmount();

    // An explicit list of classes is not a band, so the level filter would be
    // describing a roster that is no longer on screen.
    const { onSuggest } = setup({
      saveProfile: profile,
      initialRoster: ['Jester', 'Jester', 'Jester', 'Jester']
    });
    fireEvent.click(suggest());
    expect(onSuggest.mock.calls[0][1].missionTier).toBeNull();
  });
});
