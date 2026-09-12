import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveTeamModal from '../SaveTeamModal';

// Un preset ya nombrado por la taxonomia: es lo que `useTeam.describePreset`
// devuelve, y lo unico que el dialogo necesita saber del motor de nombres.
//
// El fichero NO es el nombre con guiones, y por eso el fixture los pone
// distintos: el nombre dice el plan y lo comparten varias comps, el fichero
// lleva detras el reparto de clases porque es el que tiene que ser unico.
const preset = {
  name: 'The Quarry: Keen',
  alias: 'my hound team',
  kind: 'engine',
  fileName: 'The_Quarry__Keen__Contract_Hound_Money_Snipe.json'
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
    expect(screen.getByText(/The Quarry: Keen/)).toBeInTheDocument();
    expect(screen.getByText('The_Quarry__Keen__Contract_Hound_Money_Snipe.json')).toBeInTheDocument();
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

  it('flags the comp the taxonomy could not call anything in particular', () => {
    // `even` es el unico `kind` que se avisa: ni motor ni figura destacan, asi
    // que el nombre habla de lo repartida que esta y no de un plan.
    setup({ describePreset: () => ({ ...preset, name: 'Sound Company', kind: 'even' }) });
    clickPreset();
    expect(screen.getByText(/Nothing this party does stands out/)).toBeInTheDocument();
  });

  it('says nothing of the sort when the name does carry a plan', () => {
    setup();
    clickPreset();
    expect(screen.queryByText(/Nothing this party does stands out/)).not.toBeInTheDocument();
  });

  it('does not name the comp until it is opened', () => {
    const describePreset = jest.fn(() => preset);
    render(<SaveTeamModal isOpen={false} teamName="x" describePreset={describePreset} />);
    expect(describePreset).not.toHaveBeenCalled();
  });
});
