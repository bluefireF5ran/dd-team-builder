import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ImportSaveModal from '../ImportSaveModal';
import { parseSaveProfile, SAVE_FILES } from '../../../utils/saveParser';

const FIXTURES = path.join(__dirname, '..', '..', '..', 'utils', '__tests__', 'fixtures', 'save');
const read = (name) => fs.readFileSync(path.join(FIXTURES, name));

const profile = () =>
  parseSaveProfile(
    Object.fromEntries(Object.values(SAVE_FILES).map((name) => [name, read(name)]))
  );

const setup = (props = {}) => {
  const handlers = {
    onClose: jest.fn(),
    onImportFiles: jest.fn(),
    onClearProfile: jest.fn(),
    onSendToParty: jest.fn(),
    onUseAsRoster: jest.fn(),
    showToast: jest.fn()
  };
  const view = render(<ImportSaveModal isOpen {...handlers} profile={profile()} {...props} />);
  return { ...handlers, ...view };
};

// A function matcher rather than a regex: the row's accessible name is its
// own text; a backslash-b inside a template literal is a backspace character
// rather than a word boundary, so the regex this replaced matched nothing.
const rowFor = (name) =>
  screen.getByRole('button', { name: (accessibleName) => accessibleName.includes(name) });

describe('ImportSaveModal', () => {
  it('tells you where the save is when there is nothing imported yet', () => {
    setup({ profile: null });
    expect(screen.getByText(/Pick your profile folder/i)).toBeInTheDocument();
    expect(screen.getByText(/Documents\\Darkest\\profile_0/)).toBeInTheDocument();
    // Nothing is uploaded anywhere, and the modal says so.
    expect(screen.getByText(/read in your browser/i)).toBeInTheDocument();
  });

  it('lists every living hero, including two of the same class', () => {
    setup();
    expect(screen.getByText('Reynauld')).toBeInTheDocument();
    // Campbell and Boisivon are both Plague Doctors: two rows, because they are
    // two different heroes with different quirks.
    expect(screen.getByText('Campbell')).toBeInTheDocument();
    expect(screen.getByText('Boisivon')).toBeInTheDocument();
    expect(screen.getAllByText('Plague Doctor')).toHaveLength(2);
  });

  it('shows what each hero is carrying, not just the class', () => {
    setup();
    const reynauld = rowFor('Reynauld');
    expect(within(reynauld).getByText('Crusader')).toBeInTheDocument();
    // El nivel se deriva de `level_threshold_table` ([0,2,6,...]): 2 XP es
    // resolve 1. Antes solo se podia ensenar el XP crudo, porque la tabla vive
    // en la instalacion del juego y esta app no la leia.
    expect(within(reynauld).getByText('Lv 1 · XP 2')).toBeInTheDocument();
    expect(within(reynauld).getByText('God Fearing')).toBeInTheDocument();
    expect(within(reynauld).getByText('Warrior of Light')).toBeInTheDocument();
  });

  it('filters on anything written on the card', () => {
    setup();
    const search = screen.getByPlaceholderText(/Filter by name/i);

    fireEvent.change(search, { target: { value: 'occultist' } });
    expect(screen.getByText('Tinel')).toBeInTheDocument();
    expect(screen.queryByText('Reynauld')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'kleptomaniac' } });
    expect(screen.getByText('Reynauld')).toBeInTheDocument();
    expect(screen.queryByText('Tinel')).not.toBeInTheDocument();
  });

  it('sends heroes to the party in the order they were picked', () => {
    const { onSendToParty } = setup();

    fireEvent.click(rowFor('Briouse')); // rank 1
    fireEvent.click(rowFor('Reynauld')); // rank 2
    fireEvent.click(rowFor('Campbell')); // rank 3
    fireEvent.click(screen.getByRole('button', { name: /Send to party/i }));

    const [sent] = onSendToParty.mock.calls[0];
    // heroes[0] is rank 1, front to back — the same convention the party view
    // and the comp library use.
    expect(sent.map((hero) => hero.heroClass)).toEqual(['Man at Arms', 'Crusader', 'Plague Doctor']);
    expect(sent[1].activeSkills).toContain('Bulwark of Faith');
    // Sending three fills three ranks and leaves the fourth alone.
    expect(sent).toHaveLength(3);
  });

  it('shows the rank a picked hero will stand in', () => {
    setup();
    fireEvent.click(rowFor('Perroy'));
    expect(within(rowFor('Perroy')).getByText('1')).toBeInTheDocument();
    fireEvent.click(rowFor('Bele'));
    expect(within(rowFor('Bele')).getByText('2')).toBeInTheDocument();
  });

  it('never picks more than a party', () => {
    const { onSendToParty } = setup();
    ['Reynauld', 'Dismas', 'Campbell', 'Bele', 'Tinel'].forEach((name) => fireEvent.click(rowFor(name)));
    fireEvent.click(screen.getByRole('button', { name: /Send to party/i }));
    expect(onSendToParty.mock.calls[0][0]).toHaveLength(4);
  });

  it('un-picks on a second click', () => {
    setup();
    fireEvent.click(rowFor('Dismas'));
    fireEvent.click(rowFor('Dismas'));
    expect(screen.getByRole('button', { name: /Send to party/i })).toBeDisabled();
  });

  it('hands over one entry per hero, so duplicates survive', () => {
    const { onUseAsRoster } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Use as suggest roster/i }));
    // Nine heroes, not eight classes: the two Plague Doctors have to arrive as
    // two or the comps that field two of a class stay unreachable.
    expect(onUseAsRoster).toHaveBeenCalledWith([
      'Crusader',
      'Highwayman',
      'Plague Doctor',
      'Duelist',
      'Occultist',
      'Man at Arms',
      'Plague Doctor',
      'Antiquarian',
      'Arbalest'
    ]);
  });

  it('reports names it could not place instead of dropping them quietly', () => {
    const clean = profile();
    expect(screen.queryByText(/had no match/i)).not.toBeInTheDocument();

    setup({
      profile: { ...clean, unmatched: { ...clean.unmatched, heroClasses: ['some_modded_class'] } }
    });
    expect(screen.getByText(/1 name in this save had no match/i)).toBeInTheDocument();
    expect(screen.getByText(/some_modded_class/)).toBeInTheDocument();
  });
});
