import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VideoModal from '../VideoModal';
import { forgetVideoCredits } from '../../../utils/videoCredit';

const VIDEO = 'https://youtu.be/dQw4w9WgXcQ';

const OEMBED = {
  title: 'Money Quartet, Rot run',
  author_name: 'Some Dungeoneer',
  author_url: 'https://www.youtube.com/@somedungeoneer'
};

const player = () => screen.queryByTitle('Money Quartet: Rot');

const open = (over = {}) =>
  render(<VideoModal isOpen onClose={jest.fn()} video={VIDEO} title="Money Quartet: Rot" {...over} />);

describe('VideoModal', () => {
  beforeEach(() => {
    forgetVideoCredits();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => OEMBED });
  });

  afterEach(() => {
    delete global.fetch;
  });

  /**
   * La regla de toda la funcionalidad: una comp que nadie ha abierto no le pide
   * nada a YouTube -- ni el reproductor ni el credito.
   */
  test('asks YouTube for nothing while it is closed', () => {
    open({ isOpen: false });
    expect(player()).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('credits the channel under the player, with a link to it', async () => {
    open();
    expect(await screen.findByText('Money Quartet, Rot run')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Some Dungeoneer' }))
      .toHaveAttribute('href', 'https://www.youtube.com/@somedungeoneer');
  });

  test('plays it anyway when YouTube has nothing to say about it', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => null });
    open();

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(player()).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dungeoneer/i })).toBeNull();
  });

  test('a link it cannot play is no dialog at all', () => {
    open({ video: 'https://vimeo.com/123456789' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
