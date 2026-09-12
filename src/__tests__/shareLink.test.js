import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { encodeComp } from '../utils/compLink';

/**
 * Abrir una comp que llega por enlace, a nivel de app.
 *
 * `compLink.test.js` ya fija el formato. Lo que se comprueba aqui son las tres
 * reglas del lado de la app, que son las que se rompen en silencio: el hash se
 * limpia, una party montada no se pisa sin preguntar, y lo que entra pasa por
 * la misma validacion que un fichero pegado.
 */

const comp = (over = {}) => ({
  teamName: 'Shared Comp',
  location: 'The Cove',
  heroes: [
    {
      heroClass: 'Crusader',
      activeSkills: ['Smite'],
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] },
      diseases: [],
    },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }, diseases: [] },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }, diseases: [] },
    { heroClass: '', activeSkills: [], activeCampSkills: [], trinket1: '', trinket2: '', quirks: { positive: [], negative: [] }, lockedQuirks: { positive: [], negative: [] }, diseases: [] },
  ],
  ...over,
});

const openWithLink = (team) => {
  window.history.replaceState(null, '', '/');
  window.location.hash = '#/comp/' + encodeComp(team);
  return render(<App />);
};

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  window.location.hash = '';
});

describe('opening a comp from a link', () => {
  it('loads it into an empty builder without asking', async () => {
    openWithLink(comp());
    expect(await screen.findByDisplayValue('Shared Comp')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * Si el hash se queda, un F5 vuelve a importar y se lleva por delante lo que
   * hayas tocado desde que abriste el enlace. Ese es el fallo que no se ve.
   */
  it('clears the hash so a refresh does not import again', async () => {
    openWithLink(comp());
    await screen.findByDisplayValue('Shared Comp');
    await waitFor(() => expect(window.location.hash).toBe(''));
  });

  it('says so when the link is not a comp it can read', async () => {
    window.history.replaceState(null, '', '/');
    window.location.hash = '#/comp/not-a-real-payload';
    render(<App />);
    expect(await screen.findByText(/not a comp this build can read/i)).toBeInTheDocument();
  });

  it('leaves an ordinary visit alone', () => {
    window.history.replaceState(null, '', '/');
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('when a party is already built', () => {
  const seedDraft = () => {
    localStorage.setItem('dd_draft_team_v1', JSON.stringify({
      teamName: 'My Own Work',
      location: 'The Ruins',
      heroes: comp().heroes.map((h, i) => (i === 0 ? { ...h, heroClass: 'Hellion' } : h)),
    }));
  };

  it('asks before replacing it', async () => {
    seedDraft();
    openWithLink(comp());
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/will replace the party you have now/i)).toBeInTheDocument();
    // Y no la ha tocado todavia.
    expect(screen.getByDisplayValue('My Own Work')).toBeInTheDocument();
  });

  it('keeps the existing party when the answer is no', async () => {
    seedDraft();
    openWithLink(comp());
    fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('My Own Work')).toBeInTheDocument();
  });

  it('replaces it when the answer is yes', async () => {
    seedDraft();
    openWithLink(comp());
    fireEvent.click(await screen.findByRole('button', { name: /load it/i }));
    expect(await screen.findByDisplayValue('Shared Comp')).toBeInTheDocument();
  });
});
