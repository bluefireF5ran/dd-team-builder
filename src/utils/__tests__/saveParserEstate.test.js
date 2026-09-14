import { buildProfile, SAVE_FILES } from '../saveParser';
import { statSettingsFrom } from '../../hooks/useStatSettings';

/**
 * Lo que una partida importada dice de la Hacienda y la dificultad.
 *
 * `testsave/` esta en .gitignore, asi que esto se prueba con el fichero ya
 * decodificado, con la forma que tiene en `persist.town.json`:
 * `districts.buildings.<id>.built`. La partida real de Fran (profile_8) tiene
 * construido solo el Granary, en modo `base`.
 */

const town = (built) => ({
  districts: {
    buildings: Object.fromEntries(
      ['granary', 'illuminators_guild', 'conservatory_of_steel', 'training_ring'].map((id) => [
        id,
        { built: built.includes(id), buffs: {} },
      ])
    ),
  },
});

const profileWith = ({ townData = null, gameMode = 'base' } = {}) =>
  buildProfile({ roster: { heroes: {} }, game: { game_mode: gameMode }, town: townData });

describe('the estate in an imported save', () => {
  it('reads the town file among the save files it takes from a profile folder', () => {
    expect(Object.values(SAVE_FILES)).toContain('persist.town.json');
  });

  it('lists the districts the save has built, and only those', () => {
    expect(profileWith({ townData: town(['granary']) }).districts).toEqual(['granary']);
    expect(profileWith({ townData: town(['training_ring', 'granary']) }).districts).toEqual(['granary', 'training_ring']);
  });

  it('tells "nothing built" apart from "no town file"', () => {
    expect(profileWith({ townData: town([]) }).districts).toEqual([]);
    expect(profileWith().districts).toBeNull();
  });

  it('maps the game mode to a difficulty, and leaves an unknown one unknown', () => {
    expect(profileWith({ gameMode: 'base' }).difficulty).toBe('darkest');
    expect(profileWith({ gameMode: 'radiant' }).difficulty).toBe('radiant');
    expect(profileWith({ gameMode: 'new_game_plus' }).difficulty).toBe('stygian');
    expect(profileWith({ gameMode: 'bloodmoon' }).difficulty).toBe('bloodmoon');
    expect(profileWith({ gameMode: 'something_else' }).difficulty).toBeNull();
  });
});

describe('statSettingsFrom', () => {
  const settings = { difficulty: 'radiant', estateBuilt: false };

  it('uses the settings when there is no save', () => {
    expect(statSettingsFrom(settings)).toEqual({ difficulty: 'radiant', estate: false, source: 'settings' });
  });

  it('lets the save win', () => {
    expect(statSettingsFrom(settings, { difficulty: 'darkest', districts: ['granary'] })).toEqual({
      difficulty: 'darkest',
      estate: ['granary'],
      source: 'save',
    });
  });

  it('takes each half from the save only when the save has it', () => {
    // A save imported before the town file was read: difficulty from the save,
    // districts still from the settings.
    expect(statSettingsFrom(settings, { difficulty: 'darkest', districts: null })).toEqual({
      difficulty: 'darkest',
      estate: false,
      source: 'save',
    });
  });

  it('defaults to Darkest with the estate built', () => {
    expect(statSettingsFrom({})).toEqual({ difficulty: 'darkest', estate: true, source: 'settings' });
  });
});
