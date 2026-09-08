import { TEAM_PRESETS } from './teamPresets';
import { PRESET_COMP_ENTRIES } from './presetComps/index';
import { canonicalizeHero } from '../utils/nameNormalizer';

const normalizeOfficialPreset = (preset, index) => ({
  id: `preset:${index}`,
  name: preset.name,
  alias: '',
  description: preset.description || null,
  location: preset.location || 'The Ruins',
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
  heroes: (raw.heroes || []).map(canonicalizeHero),
  source: 'community'
});

const officialComps = TEAM_PRESETS.map(normalizeOfficialPreset);
const communityComps = PRESET_COMP_ENTRIES.map(({ key, data }) => normalizeCommunityComp(data, key));

export const COMP_LIBRARY = [...officialComps, ...communityComps].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const getCompById = (id) => COMP_LIBRARY.find((comp) => comp.id === id);
