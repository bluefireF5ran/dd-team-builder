import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LoadCompModal from '../LoadCompModal';
import { COMP_LIBRARY } from '../../../data/compLibrary';

const savedTeams = [
  {
    teamName: 'My Cove Run',
    location: 'The Cove',
    savedAt: '2026-01-02T00:00:00.000Z',
    heroes: [
      { heroClass: 'Vestal', activeSkills: ['Divine Grace'], activeCampSkills: [], quirks: { positive: [], negative: [] } },
      { heroClass: 'Arbalest', activeSkills: [], activeCampSkills: [], quirks: { positive: [], negative: [] } },
      { heroClass: 'Crusader', activeSkills: [], activeCampSkills: [], quirks: { positive: [], negative: [] } },
      { heroClass: 'Leper', activeSkills: [], activeCampSkills: [], quirks: { positive: [], negative: [] } }
    ]
  },
  {
    teamName: 'Old Warrens Party',
    location: 'The Warrens',
    savedAt: '2026-03-04T00:00:00.000Z',
    heroes: [
      { heroClass: 'Occultist', activeSkills: [], activeCampSkills: [], quirks: { positive: [], negative: [] } }
    ]
  }
];

const setup = (props = {}) => {
  const handlers = {
    onClose: jest.fn(),
    onLoadSavedTeam: jest.fn(),
    onDeleteSavedTeam: jest.fn(),
    onLoadPreset: jest.fn(),
    showToast: jest.fn()
  };
  const utils = render(<LoadCompModal isOpen={true} savedTeams={savedTeams} {...handlers} {...props} />);
  return { ...utils, ...handlers };
};

/** Las tarjetas son botones "Load X": contarlas es contar la pagina. */
const cards = () => screen.getAllByTitle(/^Load /);

const searchBox = () => screen.getByLabelText('Search comps');

// Pie de la rejilla: "1-24 of 33 (of 144)". Es el unico span cuyo texto empieza
// por el rango, asi que el selector no depende de la maquetacion de alrededor.
const RANGE = /^\d+–\d+ of \d+/;
const summary = () => screen.getByText(RANGE, { selector: 'span' }).textContent;
const shownTotal = () => Number(summary().match(/of (\d+)/)[1]);
const total = COMP_LIBRARY.length;

describe('LoadCompModal', () => {
  test('renders nothing when closed', () => {
    const { container } = render(<LoadCompModal isOpen={false} onClose={jest.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  test('paginates instead of dumping the whole library at once', () => {
    setup();
    expect(cards()).toHaveLength(24);
    expect(summary()).toBe(`1–24 of ${total}`);
  });

  test('page 2 shows the next slice', () => {
    setup();
    const firstOnPage1 = cards()[0].getAttribute('title');
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(summary()).toBe(`25–48 of ${total}`);
    expect(cards()[0].getAttribute('title')).not.toBe(firstOnPage1);
  });

  test('page size control can show everything', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Comps per page'), { target: { value: '0' } });
    expect(cards()).toHaveLength(total);
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
  });

  test('search matches a hero class that is not in the name', () => {
    setup();
    fireEvent.change(searchBox(), { target: { value: 'antiquarian' } });
    expect(shownTotal()).toBeGreaterThan(0);
    expect(shownTotal()).toBeLessThan(total);
  });

  test('search terms are AND, not OR', () => {
    setup();
    fireEvent.change(searchBox(), { target: { value: 'houndmaster' } });
    const hound = shownTotal();
    fireEvent.change(searchBox(), { target: { value: 'houndmaster antiquarian' } });
    expect(shownTotal()).toBeLessThan(hound);
  });

  test('searching resets to page 1', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Next page'));
    fireEvent.change(searchBox(), { target: { value: 'a' } });
    expect(summary()).toMatch(/^1–/);
  });

  test('a hero filter chip narrows the list and reports its count', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    const chip = screen.getByTitle(/^Antiquarian \(\d+ comps?\)$/);
    const expected = Number(chip.getAttribute('title').match(/\((\d+)/)[1]);
    fireEvent.click(chip);
    expect(shownTotal()).toBe(expected);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('clearing filters restores the full list', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    fireEvent.click(screen.getByTitle(/^Antiquarian \(/));
    fireEvent.click(screen.getByRole('button', { name: /Clear 1 filter/ }));
    expect(summary()).toBe(`1–24 of ${total}`);
  });

  test('changing the sort reorders the first page', () => {
    setup();
    const byName = cards()[0].getAttribute('title');
    fireEvent.change(screen.getByLabelText('Sort comps'), { target: { value: 'backline' } });
    expect(cards()[0].getAttribute('title')).not.toBe(byName);
  });

  test('"recently saved" is offered only on the saved tab', () => {
    setup();
    const sort = screen.getByLabelText('Sort comps');
    expect(within(sort).queryByText('Recently saved')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /My Teams/ }));
    expect(within(sort).getByText('Recently saved')).toBeInTheDocument();
  });

  test('the saved tab lists saved teams and loads one by name', () => {
    const { onLoadSavedTeam, onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: /My Teams/ }));
    expect(cards()).toHaveLength(2);
    fireEvent.click(screen.getByTitle('Load My Cove Run'));
    expect(onLoadSavedTeam).toHaveBeenCalledWith('My Cove Run');
    expect(onClose).toHaveBeenCalled();
  });

  test('loading a library comp passes the comp itself, not just a name', () => {
    const { onLoadPreset, showToast } = setup();
    const first = cards()[0];
    const name = first.getAttribute('title').replace(/^Load /, '');
    fireEvent.click(first);
    expect(onLoadPreset).toHaveBeenCalledWith(expect.objectContaining({ name, heroes: expect.any(Array) }));
    expect(showToast).toHaveBeenCalledWith(`Loaded "${name}"!`, 'success');
  });

  test('only saved comps offer delete', () => {
    setup();
    expect(screen.queryByTitle('Delete team')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /My Teams/ }));
    expect(screen.getAllByTitle('Delete team')).toHaveLength(2);
  });

  test('deleting a saved team asks first', () => {
    const { onDeleteSavedTeam } = setup();
    fireEvent.click(screen.getByRole('button', { name: /My Teams/ }));
    fireEvent.click(screen.getAllByTitle('Delete team')[0]);
    expect(onDeleteSavedTeam).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Delete'));
    expect(onDeleteSavedTeam).toHaveBeenCalledTimes(1);
  });

  test('an empty result offers a way out', () => {
    setup();
    fireEvent.change(searchBox(), { target: { value: 'zzzzz' } });
    expect(screen.getByText(/No comps match this search/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset'));
    expect(summary()).toBe(`1–24 of ${total}`);
  });

  test('switching tabs drops filters that belong to the other tab', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    fireEvent.click(screen.getByTitle(/^Antiquarian \(/));
    fireEvent.click(screen.getByRole('button', { name: /My Teams/ }));
    expect(screen.queryByRole('button', { name: /Clear 1 filter/ })).not.toBeInTheDocument();
  });

  test('arrow keys page through, but not while typing in the search box', () => {
    setup();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(summary()).toMatch(/^25–48/);
    fireEvent.keyDown(searchBox(), { key: 'ArrowLeft' });
    expect(summary()).toMatch(/^25–48/);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(summary()).toMatch(/^1–24/);
  });

  test('escape closes', () => {
    const { onClose } = setup();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('every card shows four rank slots, so icons cannot spill the row', () => {
    setup();
    expect(within(cards()[0]).getAllByTitle(/^Rank [1-4]:/)).toHaveLength(4);
  });

  // The library used to know nothing about what you own: 177 comps, no hint
  // which of them you could actually put in the field.
  describe('with an imported save', () => {
    const saveProfile = {
      // One of each: enough for an ordinary comp, not enough for a quartet.
      heroes: ['Crusader', 'Vestal', 'Hellion', 'Jester', 'Arbalest', 'Occultist'].map(
        (heroClass) => ({ heroClass, activity: '', isMissing: false })
      )
    };

    test('offers no roster judgement without a save', () => {
      setup();
      expect(screen.queryByRole('button', { name: /Can field/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/needs \d/i)).not.toBeInTheDocument();
    });

    test('marks the comps you are short of, and says by how much', () => {
      setup({ saveProfile });
      // Ballad Quartet is four Jesters and this roster has one.
      const badges = screen.getAllByText(/^needs /);
      expect(badges.length).toBeGreaterThan(0);
      expect(badges.some((b) => /needs 3× Jester/.test(b.textContent))).toBe(true);
    });

    test('Can field hides everything the roster cannot put out', () => {
      setup({ saveProfile });
      fireEvent.click(screen.getByRole('button', { name: /Can field/i }));
      expect(screen.queryByText(/^needs /)).not.toBeInTheDocument();
    });
  });
});
