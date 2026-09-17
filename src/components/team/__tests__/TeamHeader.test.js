import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamHeader from '../TeamHeader';

const props = (over = {}) => ({
  teamName: 'Bleed Stack',
  onTeamNameChange: jest.fn(),
  location: 'The Ruins',
  onLocationChange: jest.fn(),
  video: '',
  onVideoChange: jest.fn(),
  ...over
});

// Anclado: el boton de al lado se llama "Watch the guide video".
const field = () => screen.getByLabelText(/^guide video/i);
const watchButton = () => screen.getByRole('button', { name: /watch the guide video/i });
// El reproductor se busca por su titulo, que es el nombre de la comp: es lo
// unico que dice de que party es ese video.
const player = () => screen.queryByTitle('Bleed Stack');

describe('the guide video field', () => {
  test('hands back what was pasted, so the comp owns it', () => {
    const onVideoChange = jest.fn();
    render(<TeamHeader {...props({ onVideoChange })} />);

    fireEvent.change(field(), { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
    expect(onVideoChange).toHaveBeenCalledWith('https://youtu.be/dQw4w9WgXcQ');
  });

  test('has nothing to play until there is a link', () => {
    render(<TeamHeader {...props()} />);
    expect(watchButton()).toBeDisabled();
    expect(player()).toBeNull();
  });

  /**
   * El reproductor no existe hasta que se pulsa: mientras el dialogo esta
   * cerrado no hay iframe, y por tanto ninguna peticion a YouTube.
   */
  test('plays it in the app, from the id and not from the pasted string', () => {
    render(<TeamHeader {...props({ video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s&list=PLabc' })} />);
    expect(player()).toBeNull();

    fireEvent.click(watchButton());

    expect(player()).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&start=90'
    );
    expect(player().getAttribute('src')).not.toContain('PLabc');
    expect(screen.getByRole('dialog')).toHaveTextContent('Bleed Stack');
  });

  // El campo guarda lo que escribas -- es tuyo -- pero dice claramente que de
  // ahi no va a salir ningun video.
  test('says so when what is in it is not a YouTube link', () => {
    render(<TeamHeader {...props({ video: 'https://vimeo.com/123456789' })} />);
    expect(watchButton()).toBeDisabled();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/not a YouTube link/i)).toBeInTheDocument();
  });

  test('an empty field is not a mistake', () => {
    render(<TeamHeader {...props({ video: '   ' })} />);
    expect(screen.queryByText(/not a YouTube link/i)).toBeNull();
    expect(field()).toHaveAttribute('aria-invalid', 'false');
  });
});
