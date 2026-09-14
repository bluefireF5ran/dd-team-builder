import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from '../SettingsModal';
import { DEFAULT_SETTINGS } from '../../../hooks/useSettings';

/**
 * El panel de ajustes era el unico fichero sin una sola linea cubierta, y es el
 * que decide lo que el resto de la app ensena: contenido opcional, orden de la
 * libreria, donde empieza una comp nueva. Esto no persigue cobertura - fija las
 * tres cosas que romperse aqui es invisible desde cualquier otro test:
 *
 *   · el dialogo se anuncia como tal (llego con la migracion a `Modal`),
 *   · un interruptor llama a `toggleSetting` con SU clave y no con la de al lado,
 *   · un desplegable manda el valor elegido a `setSetting`.
 */

const open = (props = {}) => {
  const api = {
    onClose: jest.fn(),
    setSetting: jest.fn(),
    toggleSetting: jest.fn(),
    resetSettings: jest.fn()
  };
  render(<SettingsModal isOpen settings={DEFAULT_SETTINGS} {...api} {...props} />);
  return api;
};

describe('SettingsModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <SettingsModal
        isOpen={false}
        onClose={jest.fn()}
        settings={DEFAULT_SETTINGS}
        setSetting={jest.fn()}
        toggleSetting={jest.fn()}
        resetSettings={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('announces itself as a dialog named by its own heading', () => {
    open();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { onClose } = open();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  // Cada interruptor tiene que llevar SU clave. Son ocho seguidos con el mismo
  // aspecto, y cruzar dos de ellos no rompe ningun otro test.
  it.each([
    ['Modded heroes', 'showModdedHeroes'],
    ['Backer trinkets', 'showBackerTrinkets'],
    ['Diseases', 'showDiseases'],
    ['Auto-sort skills', 'autoSortSkills'],
    ['Skill tiers', 'showSkillTiers'],
    ['Estate districts built', 'estateBuilt']
  ])('toggles %s through its own key', (label, key) => {
    const { toggleSetting } = open();
    fireEvent.click(screen.getByLabelText(label));
    expect(toggleSetting).toHaveBeenCalledWith(key);
  });

  it('offers the four difficulties, Darkest by default, and sends the choice to setSetting', () => {
    const { setSetting } = open();
    const select = screen.getByLabelText('Difficulty');
    expect(select).toHaveValue('darkest');
    expect(screen.getAllByRole('option', { name: /^(Radiant|Darkest|Stygian|Bloodmoon)$/ })).toHaveLength(4);
    fireEvent.change(select, { target: { value: 'radiant' } });
    expect(setSetting).toHaveBeenCalledWith('difficulty', 'radiant');
  });

  it('starts with the estate built', () => {
    open();
    expect(screen.getByLabelText('Estate districts built')).toHaveAttribute('aria-checked', 'true');
  });

  // Con una partida importada, la dificultad y los distritos salen de ella y
  // ganan a los ajustes: el control lo dice y no se deja tocar.
  it('shows what an imported save says, and locks the controls it overrides', () => {
    open({ saveProfile: { difficulty: 'radiant', districts: ['granary', 'spire_of_hope'] } });

    const difficulty = screen.getByLabelText('Difficulty');
    expect(difficulty).toHaveValue('radiant');
    expect(difficulty).toBeDisabled();
    expect(screen.getByText('From your imported save: Radiant.')).toBeInTheDocument();

    expect(screen.getByLabelText('Estate districts built')).toBeDisabled();
    // Los nombres del juego, no los ids: `spire_of_hope` es The Red Hook.
    expect(screen.getByText('From your imported save: Granary, The Red Hook built.')).toBeInTheDocument();
  });

  it('keeps the settings in charge for a save imported before districts were read', () => {
    open({ saveProfile: { difficulty: 'darkest', districts: null } });
    expect(screen.getByLabelText('Difficulty')).toBeDisabled();
    expect(screen.getByLabelText('Estate districts built')).toBeEnabled();
  });

  it('sends a chosen location to setSetting', () => {
    const { setSetting } = open();
    const select = screen.getByLabelText('Default location');
    fireEvent.change(select, { target: { value: 'The Cove' } });
    expect(setSetting).toHaveBeenCalledWith('defaultLocation', 'The Cove');
  });

  /**
   * Crimson Court cuelga de Diseases: solo, conmutaria una lista que no se esta
   * dibujando. Los dos sitios donde vive resuelven eso de forma distinta **a
   * proposito**, y es facil confundirlos:
   *
   *   · la fila de `TeamControls` lo ESCONDE hasta que Diseases esta encendido,
   *     porque ahi el espacio de cabecera es caro;
   *   · este panel lo deja visible y DESACTIVADO, porque un ajuste que
   *     desaparece es un ajuste que parece perdido.
   *
   * Asi que aqui se comprueba el desactivado, no la ausencia.
   */
  it('disables Crimson Court while Diseases is off', () => {
    open({ settings: { ...DEFAULT_SETTINGS, showDiseases: false } });
    expect(screen.getByLabelText('Crimson Court diseases')).toBeDisabled();
  });

  it('enables Crimson Court once Diseases is on', () => {
    open({ settings: { ...DEFAULT_SETTINGS, showDiseases: true } });
    expect(screen.getByLabelText('Crimson Court diseases')).toBeEnabled();
  });
});
