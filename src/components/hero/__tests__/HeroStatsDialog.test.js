import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroStatsDialog from '../HeroStatsDialog';
import { StatSettingsContext } from '../../../hooks/useStatSettings';

// La ventana lee dificultad y estate del contexto, como las barras y los hovers:
// cambiar el ajuste tiene que cambiar los numeros, y la cabecera tiene que decir
// con cuales se han calculado.

const openWith = (value) =>
  render(
    <StatSettingsContext.Provider value={value}>
      <HeroStatsDialog isOpen onClose={jest.fn()} hero={{ heroClass: 'Jester' }} />
    </StatSettingsContext.Provider>
  );

describe('HeroStatsDialog and the stat settings', () => {
  it('uses the Cartographer\'s table for the chosen difficulty when the estate is built', () => {
    openWith({ difficulty: 'radiant', estate: true });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('estate built');
    expect(dialog).toHaveTextContent('Radiant');
    expect(dialog).toHaveTextContent("+10 DODGE (Cartographer's Camp)");
    expect(dialog).toHaveTextContent('Académie Duello');
  });

  it('drops the districts and uses the base torchlight without the estate', () => {
    openWith({ difficulty: 'darkest', estate: false });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('no estate');
    expect(dialog).toHaveTextContent('+4 DODGE (torchlight)');
    expect(dialog).not.toHaveTextContent('Académie Duello');
  });

  it('defaults to Darkest with the estate built when nothing provides settings', () => {
    render(<HeroStatsDialog isOpen onClose={jest.fn()} hero={{ heroClass: 'Jester' }} />);
    expect(screen.getByRole('dialog')).toHaveTextContent("+7.5 DODGE (Cartographer's Camp)");
  });
});
