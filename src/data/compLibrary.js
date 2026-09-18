import { TEAM_PRESETS } from './teamPresets';
import { PRESET_COMP_ENTRIES } from './presetComps/index';
import { canonicalizeHero } from '../utils/nameNormalizer';

/**
 * Ojo: esto CONSTRUYE un objeto nuevo, no extiende el de origen. Todo campo que
 * no se nombre aqui existe en el .json y no llega ni a la tarjeta ni a la party:
 * es lo que le paso al video, que se guardaba, se compartia y se cargaba bien
 * por todas partes menos justo por la libreria. Campo nuevo en una comp, linea
 * nueva en los dos normalizadores.
 */
const normalizeOfficialPreset = (preset, index) => ({
  id: `preset:${index}`,
  name: preset.name,
  alias: '',
  description: preset.description || null,
  location: preset.location || 'The Ruins',
  video: preset.video || '',
  heroes: (preset.heroes || []).map(canonicalizeHero),
  source: 'official'
});

const normalizeCommunityComp = (raw, key) => ({
  id: `set:${key}`,
  name: raw.teamName,
  // El nombre de autor ("Clown Fiesta") no aparece en el nombre taxonomico pero
  // sigue siendo como el usuario recuerda la comp: se muestra y se busca.
  alias: raw.alias || '',
  description: null,
  location: raw.location || 'The Ruins',
  // El enlace a alguien jugandola, si el fichero lo trae. Ver el aviso de
  // arriba: sin esta linea la comp se carga sin video y no hay nada que
  // reproducir en ninguna parte de la pagina.
  video: raw.video || '',
  heroes: (raw.heroes || []).map(canonicalizeHero),
  source: 'community'
});

const officialComps = TEAM_PRESETS.map(normalizeOfficialPreset);
const communityComps = PRESET_COMP_ENTRIES.map(({ key, data }) => normalizeCommunityComp(data, key));

export const COMP_LIBRARY = [...officialComps, ...communityComps].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const getCompById = (id) => COMP_LIBRARY.find((comp) => comp.id === id);
