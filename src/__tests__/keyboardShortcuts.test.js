import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { encodeComp } from '../utils/compLink';

/**
 * Los atajos globales de `App.js`.
 *
 * Eran la superficie de control con menos cobertura de la app y la que peor
 * falla: el guard de Ctrl+Z dentro de un campo de texto esta documentado como
 * un fallo que ya paso -- deshacer la party mientras renombrabas el equipo, sin
 * que se viera hasta mirar las cuatro tarjetas-- y no habia test que lo
 * sujetara.
 *
 * La party se monta por enlace, que es un paso de historial como cualquier
 * otro y no depende de pinchar selectores.
 */

const emptyHero = () => ({
  heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '',
  quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }, diseases: [],
});

const team = {
  teamName: 'Shortcut Party',
  location: 'The Cove',
  heroes: [{ ...emptyHero(), heroClass: 'Crusader', activeSkills: ['Smite'] }, emptyHero(), emptyHero(), emptyHero()],
};

const openWithParty = async () => {
  window.history.replaceState(null, '', '/');
  window.location.hash = '#/comp/' + encodeComp(team);
  render(<App />);
  return screen.findByDisplayValue('Shortcut Party');
};

const press = (key, target = window, extra = {}) => fireEvent.keyDown(target, { key, ctrlKey: true, ...extra });

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  window.location.hash = '';
});

describe('global keyboard shortcuts', () => {
  it('Ctrl+Z undoes the last change and Ctrl+Y redoes it', async () => {
    await openWithParty();

    press('z');
    await waitFor(() => expect(screen.queryByDisplayValue('Shortcut Party')).not.toBeInTheDocument());

    press('y');
    expect(await screen.findByDisplayValue('Shortcut Party')).toBeInTheDocument();
  });

  // Z e Y van en tests separados a proposito: en el mismo test, un Ctrl+Y detras
  // de un Ctrl+Z deshace el deshacer y el test pasaba aunque el guard no
  // estuviera. Se comprobo quitando el guard.
  it('leaves Ctrl+Z to the text field while you are typing in one', async () => {
    const nameField = await openWithParty();

    // El evento nace en el input y sube a window: el atajo tiene que dejarlo pasar.
    press('z', nameField);

    expect(screen.getByDisplayValue('Shortcut Party')).toBeInTheDocument();
  });

  it('leaves Ctrl+Y to the text field too', async () => {
    await openWithParty();
    press('z');
    await waitFor(() => expect(screen.queryByDisplayValue('Shortcut Party')).not.toBeInTheDocument());

    // Tras deshacer, el campo de nombre esta vacio; un Ctrl+Y escrito en el no
    // puede rehacer la party.
    press('y', screen.getByPlaceholderText(/team name/i));

    expect(screen.queryByDisplayValue('Shortcut Party')).not.toBeInTheDocument();
  });

  it('Ctrl+S saves the team to browser storage and says so', async () => {
    await openWithParty();
    press('s');
    expect(await screen.findByText('Team saved to browser storage!')).toBeInTheDocument();
  });

  it('does nothing for a letter without Ctrl', async () => {
    await openWithParty();
    fireEvent.keyDown(window, { key: 'z' });
    expect(screen.getByDisplayValue('Shortcut Party')).toBeInTheDocument();
  });
});
