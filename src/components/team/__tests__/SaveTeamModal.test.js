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

/**
 * Sustituir una comp que ya existe, en vez de bajar una casi igual.
 *
 * `describePreset().updates` trae las candidatas -- misma region y las mismas
 * cuatro clases -- y el dialogo solo ofrece la opcion cuando hay alguna: sin
 * coincidencias no hay nada que sustituir y una tercera fila vacia solo
 * estorbaria.
 */
const withUpdates = (updates) => ({ ...preset, updates });

// El fichero que se sustituye NO tiene por que llamarse como se llamaria esta
// comp si fuese nueva: el que ya existe cedio su peldano en su dia y sigue
// viviendo donde vive. Por eso la clave del fixture es distinta de `fileName`.
const ONE = [{
  key: 'The_Quarry__Sand__Contract_Hound_Money_Snipe',
  teamName: 'The Quarry: Sand',
  alias: 'my old hound team',
  location: 'The Warrens',
  heroes: [],
}];

describe('replacing a comp the library already has', () => {
  it('does not offer the option when nothing matches', () => {
    setup({ describePreset: jest.fn(() => withUpdates([])) });
    expect(screen.queryByText('Update an existing comp')).not.toBeInTheDocument();
  });

  it('offers it when a comp shares the region and the four classes', () => {
    setup({ describePreset: jest.fn(() => withUpdates(ONE)) });
    expect(screen.getByText('Update an existing comp')).toBeInTheDocument();
    expect(screen.getByText(/The_Quarry__Sand__Contract_Hound_Money_Snipe\.json/)).toBeInTheDocument();
  });

  it('saves under the existing comp rather than as a new one', () => {
    const handlers = setup({ describePreset: jest.fn(() => withUpdates(ONE)) });
    fireEvent.click(screen.getByText('Update an existing comp'));
    fireEvent.click(screen.getByRole('button', { name: 'Replace it' }));
    expect(handlers.onSavePresetFile).toHaveBeenCalledWith(ONE[0]);
  });

  it('still downloads a new comp when the preset row is the one chosen', () => {
    const handlers = setup({ describePreset: jest.fn(() => withUpdates(ONE)) });
    clickPreset();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(handlers.onSavePresetFile).toHaveBeenCalledWith(undefined);
  });

  // El nombre no se vuelve a derivar al sustituir, y decirlo evita la sorpresa
  // de ver un nombre viejo sobre una party que ha cambiado.
  it('says the taxonomy is not re-run on a replacement', () => {
    setup({ describePreset: jest.fn(() => withUpdates(ONE)) });
    fireEvent.click(screen.getByText('Update an existing comp'));
    expect(screen.getByText(/keeps its\s+name until/i)).toBeInTheDocument();
  });

  it('lets you pick when two comps match', () => {
    const two = [
      ONE[0],
      { key: 'Other_File__Keen__Contract_Hound_Money_Snipe', teamName: 'Other Name', alias: '', location: 'The Warrens', heroes: [] },
    ];
    const handlers = setup({ describePreset: jest.fn(() => withUpdates(two)) });
    fireEvent.click(screen.getByText('Update an existing comp'));
    fireEvent.click(screen.getByText('Other Name'));
    fireEvent.click(screen.getByRole('button', { name: 'Replace it' }));
    expect(handlers.onSavePresetFile).toHaveBeenCalledWith(two[1]);
  });
});
