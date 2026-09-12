import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestMapModal from '../QuestMapModal';
import { LOCATIONS, getLocationTheme } from '../../../data/locations';
import { QUEST_MAP_NODES, locationsMissingFromMap, toMapPercent } from '../../../data/questMap';

describe('quest map data', () => {
  // Una zona sin nodo es una zona que el mapa no deja elegir, y el desplegable
  // y el mapa dejarian de ofrecer lo mismo.
  it('places every location on the map', () => {
    expect(locationsMissingFromMap()).toEqual([]);
  });

  it('does not invent locations the app does not have', () => {
    QUEST_MAP_NODES.forEach((node) => expect(LOCATIONS).toContain(node.location));
  });

  it('keeps every pin inside the map', () => {
    QUEST_MAP_NODES.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1920);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1080);
    });
  });

  // Los cuatro Darkest comparten `.quest_map_pos` en el juego (los dibuja en
  // fila desde ese punto); si aqui compartieran posicion se taparian.
  it('gives every pin its own spot', () => {
    const spots = QUEST_MAP_NODES.map(({ x, y }) => `${x},${y}`);
    expect(new Set(spots).size).toBe(spots.length);
  });

  it('converts game coordinates to percentages of the container', () => {
    expect(toMapPercent({ x: 960, y: 540 })).toEqual({ left: '50%', top: '50%' });
  });
});

describe('QuestMapModal', () => {
  const open = (props = {}) =>
    render(
      <QuestMapModal
        isOpen
        onClose={jest.fn()}
        location="The Ruins"
        onSelect={jest.fn()}
        {...props}
      />
    );

  it('renders nothing when closed', () => {
    const { container } = render(<QuestMapModal isOpen={false} location="The Ruins" />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers one pin per location', () => {
    open();
    LOCATIONS.forEach((loc) => {
      expect(screen.getByTitle(loc)).toBeInTheDocument();
    });
  });

  it('selects a location and closes', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    open({ onSelect, onClose });

    fireEvent.click(screen.getByTitle('The Cove'));

    expect(onSelect).toHaveBeenCalledWith('The Cove');
    expect(onClose).toHaveBeenCalled();
  });

  it('marks the current location', () => {
    open({ location: 'The Weald' });
    expect(screen.getByTitle('The Weald')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTitle('The Cove')).not.toHaveAttribute('aria-current');
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    open({ onClose });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  // El arte del mapa vive en el repo externo de assets. Si falta, los pines
  // tienen que seguir estando: la imagen es el decorado, no el mando.
  it('keeps the pins usable when the map art fails to load', () => {
    const onSelect = jest.fn();
    open({ onSelect });

    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('The Warrens'));
    expect(onSelect).toHaveBeenCalledWith('The Warrens');
  });
});

describe('region ink', () => {
  // La paleta va de blanco (Mountain) a negro (Dimensional Havoc). Un color de
  // texto fijo sobre el chip deja uno de los dos extremos ilegible.
  it('reads dark on the pale regions and light on the dark ones', () => {
    expect(getLocationTheme('The Mountain').ink).toBe('#12100e');
    expect(getLocationTheme('Dimensional Havoc').ink).toBe('#F3F4F6');
  });

  it('gives every location an ink', () => {
    LOCATIONS.forEach((loc) => expect(getLocationTheme(loc).ink).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });

  it('falls back to grey for a location it has never heard of', () => {
    expect(getLocationTheme('Nowhere').short).toBe('—');
    expect(getLocationTheme('Nowhere').ink).toBe('#F3F4F6');
  });
});
