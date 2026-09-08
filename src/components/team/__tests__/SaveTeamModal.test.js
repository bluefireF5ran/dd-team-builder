import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveTeamModal from '../SaveTeamModal';

// Un preset ya nombrado por la taxonomia: es lo que `useTeam.describePreset`
// devuelve, y lo unico que el dialogo necesita saber del motor de nombres.
const preset = {
  name: 'Marked Prey: Royal & Bulwark',
  alias: 'my hound team',
  family: 'Marked Prey',
  variant: 'Royal & Bulwark',
  familySource: 'signature',
  fileName: 'Marked_Prey__Royal_&_Bulwark.json'
};

const setup = (props = {}) => {
  const handlers = {
    onClose: jest.fn(),
    onSaveToBrowser: jest.fn(),
    onSavePresetFile: jest.fn(),
    describePreset: jest.fn(() => preset),
    teamExists: jest.fn(() => false)
  };
  render(<SaveTeamModal isOpen teamName="my hound team" {...handlers} {...props} />);
  return handlers;
};

const clickPreset = () => fireEvent.click(screen.getByText('Preset comp file'));

describe('SaveTeamModal', () => {
  it('offers both destinations and starts on browser storage', () => {
    setup();
    expect(screen.getByText('Browser storage')).toBeInTheDocument();
    expect(screen.getByText('Preset comp file')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows the taxonomic name and file before you commit to the preset', () => {
    // El nombre es justo lo que cambia respecto a lo que escribiste, asi que
    // tiene que verse ANTES de pulsar, no despues en un toast.
    setup();
    clickPreset();
    expect(screen.getByText(/Marked Prey: Royal & Bulwark/)).toBeInTheDocument();
    expect(screen.getByText('Marked_Prey__Royal_&_Bulwark.json')).toBeInTheDocument();
    expect(screen.getByText(/Your name is kept as the alias/)).toHaveTextContent('my hound team');
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
  });

  it('routes each destination to its own handler', () => {
    const handlers = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handlers.onSaveToBrowser).toHaveBeenCalledTimes(1);
    expect(handlers.onSavePresetFile).not.toHaveBeenCalled();

    clickPreset();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(handlers.onSavePresetFile).toHaveBeenCalledTimes(1);
  });

  it('warns that browser storage overwrites a team of the same name', () => {
    setup({ teamExists: () => true });
    expect(screen.getByText(/already saved. Saving overwrites it/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Overwrite' })).toBeInTheDocument();
    // Ese aviso es del navegador: el fichero de preset no pisa nada.
    clickPreset();
    expect(screen.queryByText(/Saving overwrites it/)).not.toBeInTheDocument();
  });

  it('flags a preset whose family came from the mechanic, not a signature', () => {
    setup({ describePreset: () => ({ ...preset, family: 'Hammer Fall', familySource: 'mechanic' }) });
    clickPreset();
    expect(screen.getByText(/No family signature matched/)).toBeInTheDocument();
  });

  it('does not name the comp until it is opened', () => {
    const describePreset = jest.fn(() => preset);
    render(<SaveTeamModal isOpen={false} teamName="x" describePreset={describePreset} />);
    expect(describePreset).not.toHaveBeenCalled();
  });
});
