import { TEAM_PRESETS } from './teamPresets';
import { PRESET_COMP_ENTRIES } from './presetComps/index';
import { canonicalizeHero } from '../utils/nameNormalizer';

const normalizeOfficialPreset = (preset, index) => ({
  id: `preset:${index}`,
  name: preset.name,
  description: preset.description || null,
  location: preset.location || 'The Ruins',
  heroes: (preset.heroes || []).map(canonicalizeHero),
  source: 'official'
});

const normalizeCommunityComp = (raw, key) => ({
  id: `set:${key}`,
  name: raw.teamName,
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
