/**
 * Turns a Darkest Dungeon save profile into the things this app can build with:
 * the heroes you actually own, and the trinkets you actually have.
 *
 * The important word is *own*. A save mentions far more heroes than your
 * roster — the four recruits waiting in the Stage Coach, the names in the
 * campaign log, the dead in the graveyard — and a scan for printable strings
 * cannot tell them apart, which is why the old loader offered you heroes you
 * had buried. `persist.roster.json` holds the living roster and nothing else,
 * so reading it structurally answers the question exactly.
 *
 * Which file answers what:
 *
 * | file | what is taken |
 * | --- | --- |
 * | `persist.roster.json` | the living roster: class, name, resolve XP, stress, quirks, skills, equipped trinkets |
 * | `persist.estate.json` | the trinket inventory |
 * | `persist.game.json` | estate name, game mode, DLC and applied mods |
 * | `persist.campaign_log.json` | the week number |
 *
 * Only the roster is required; a profile missing the rest still imports, with
 * the corresponding fields left empty.
 *
 * Names arrive as internal ids (`man_at_arms`, `god_fearing`) and are resolved
 * against the app's own rosters — see `src/data/gameIds.js` for the five that
 * need a rename table. **Nothing unrecognised is invented or dropped silently**:
 * it goes into `unmatched` so the UI can say how many it could not place.
 */

import { parseDson, isDsonBuffer } from './dson';
import { nameKey } from './nameNormalizer';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../data/modded_heroes';
import { TRINKETS } from '../data/trinkets';
import { BACKER_TRINKETS } from '../data/backer_trinkets';
import { POSITIVE_QUIRKS, NEGATIVE_QUIRKS } from '../data/quirks';
import { ALL_DISEASES } from '../data/diseases';
import { COMMON_VANILLA_CAMP_SKILLS, HERO_CONFIG, EMPTY_HERO } from '../constants';
import { SKILL_ID_RENAMES, CAMP_SKILL_ID_RENAMES, TRINKET_ID_RENAMES } from '../data/gameIds';

export const SAVE_FILES = {
  roster: 'persist.roster.json',
  estate: 'persist.estate.json',
  game: 'persist.game.json',
  campaignLog: 'persist.campaign_log.json'
};

/**
 * `roster.status` on a hero entry. Verified against a save with eight deaths:
 * the set of `DEAD` heroes matched persist.campaign_log.json's `died: true`
 * records exactly, in both directions, and `IN_PARTY` matched
 * `last_party.last_party_guids`.
 */
export const ROSTER_STATUS = {
  IN_ROSTER: 0,
  IN_PARTY: 1,
  DEAD: 3
};

/** The one file without which there is nothing to import. */
export const REQUIRED_SAVE_FILE = SAVE_FILES.roster;

// --- id resolution ---------------------------------------------------------

// `nameKey` already folds case, accents, apostrophes and punctuation, so
// `coup_de_grace` and "Coup de Grâce" meet in the middle. The squashed variant
// closes the remaining gap where the game words a name as one token and the
// app as two ("Grapeshot Blast" vs `grape_shot_blast`).
const squash = (key) => key.replace(/ /g, '');

const buildIndex = (...lists) => {
  const index = new Map();
  lists.forEach((list) => {
    (list || []).forEach((name) => {
      const key = nameKey(name);
      if (!key) return;
      if (!index.has(key)) index.set(key, name);
      const squashed = squash(key);
      if (!index.has(squashed)) index.set(squashed, name);
    });
  });
  return index;
};

const lookup = (index, id) => {
  if (typeof id !== 'string' || !id) return null;
  const key = nameKey(id);
  return index.get(key) || index.get(squash(key)) || null;
};

/**
 * A rename only wins if the class really has that skill, so ids one class
 * reuses for something else can never be mis-resolved by the flat table.
 */
const lookupWithRenames = (index, id, renames) => {
  const direct = lookup(index, id);
  if (direct) return direct;
  const renamed = renames[id];
  return renamed && index.has(nameKey(renamed)) ? renamed : null;
};

const HERO_CLASS_INDEX = buildIndex(Object.keys(HERO_CLASSES), Object.keys(MODDED_HERO_CLASSES));

const QUIRK_KINDS = [
  ['positive', POSITIVE_QUIRKS],
  ['negative', NEGATIVE_QUIRKS],
  ['disease', ALL_DISEASES]
];

// One index per kind, because the save says nothing about which of the three
// lists a quirk id belongs to — the name is what decides.
const QUIRK_INDEXES = QUIRK_KINDS.map(([kind, list]) => [kind, buildIndex(list)]);

const TRINKET_INDEX = buildIndex(
  TRINKETS,
  ...Object.values(HERO_CLASSES).map((data) => data.classSpecificTrinkets),
  ...Object.values(MODDED_HERO_CLASSES).map((data) => data.classSpecificTrinkets),
  MODDED_GENERAL_TRINKETS,
  BACKER_TRINKETS
);

const classIndexCache = new Map();

const getClassIndexes = (heroClass) => {
  if (classIndexCache.has(heroClass)) return classIndexCache.get(heroClass);
  const data = HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];
  const indexes = {
    skills: buildIndex(data?.skills),
    campSkills: buildIndex(data?.campSkills, COMMON_VANILLA_CAMP_SKILLS),
    trinkets: buildIndex(data?.classSpecificTrinkets)
  };
  classIndexCache.set(heroClass, indexes);
  return indexes;
};

// --- reading the save ------------------------------------------------------

/**
 * The game writes an inventory as `{ items: { '0': { id, type, amount } } }`.
 * Neither test save had a trinket in it, so this stays deliberately loose: any
 * string `id` counts, and a bare string entry counts too.
 */
const readItemIds = (container) => {
  const items = container?.items;
  if (!items || typeof items !== 'object') return [];
  return Object.values(items)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof item.id === 'string') return item.id;
      return null;
    })
    .filter(Boolean);
};

const cap = (list, max) => (list.length > max ? list.slice(0, max) : list);

/**
 * Who the Graveyard holds.
 *
 * **The dead stay in `persist.roster.json`, marked `roster.status: 3`.** They
 * are not moved anywhere, and `persist.town.json`'s `graveyard` building is not
 * where to look — it decodes as empty even in a save with eight buried heroes,
 * which is exactly the trap this code fell into first: an earlier version
 * walked that node, found nothing, and happily offered the dead as heroes you
 * could field.
 *
 * Confirmed on a save with eight deaths: the `status === 3` set matched
 * `persist.campaign_log.json`'s `died: true` records exactly, in both
 * directions. `status === 1` is the party currently selected for a quest —
 * those heroes are alive and stay.
 */
const isDeadEntry = (data) => data?.['roster.status'] === ROSTER_STATUS.DEAD;

const readHero = (guid, entry, unmatched) => {
  const data = entry?.hero_file_data?.raw_data;
  if (!data || typeof data !== 'object') return null;

  const classId = typeof data.heroClass === 'string' ? data.heroClass : '';
  const heroClass = lookup(HERO_CLASS_INDEX, classId);
  if (!heroClass) {
    if (classId) unmatched.heroClasses.push(classId);
    return null;
  }

  const indexes = getClassIndexes(heroClass);

  const activeSkills = [];
  Object.keys(data.skills?.selected_combat_skills || {}).forEach((id) => {
    const name = lookupWithRenames(indexes.skills, id, SKILL_ID_RENAMES);
    if (name) activeSkills.push(name);
    else unmatched.skills.push(id);
  });

  const activeCampSkills = [];
  Object.keys(data.skills?.selected_camping_skills || {}).forEach((id) => {
    const name = lookupWithRenames(indexes.campSkills, id, CAMP_SKILL_ID_RENAMES);
    if (name) activeCampSkills.push(name);
    else unmatched.campSkills.push(id);
  });

  const quirks = { positive: [], negative: [] };
  const lockedQuirks = { positive: [], negative: [] };
  const diseases = [];

  Object.entries(data.quirks || {}).forEach(([id, state]) => {
    const hit = QUIRK_INDEXES.reduce(
      (found, [kind, index]) => found || (lookup(index, id) ? { kind, name: lookup(index, id) } : null),
      null
    );
    if (!hit) {
      unmatched.quirks.push(id);
      return;
    }
    // The game keeps diseases in the same map as quirks; the app keeps them in
    // their own three slots, so they are split apart here.
    if (hit.kind === 'disease') {
      diseases.push(hit.name);
      return;
    }
    quirks[hit.kind].push(hit.name);
    if (state?.is_locked) lockedQuirks[hit.kind].push(hit.name);
  });

  const equipped = readItemIds(data.trinkets).map((id) => {
    const name = lookup(indexes.trinkets, id) || lookup(TRINKET_INDEX, id) || TRINKET_ID_RENAMES[id];
    if (!name) unmatched.trinkets.push(id);
    return name || null;
  }).filter(Boolean);

  const isAlwaysActive = !!(HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass])?.alwaysActive;
  const maxSkills = isAlwaysActive
    ? (HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass])?.skills?.length || HERO_CONFIG.MAX_SKILLS
    : HERO_CONFIG.MAX_SKILLS;

  return {
    guid: String(guid),
    name: typeof data.actor?.name === 'string' ? data.actor.name : '',
    heroClass,
    // Raw resolve XP as the game stores it. The level thresholds live in the
    // game install, which this app does not read, so no level is invented.
    resolveXp: Number.isFinite(data.resolveXp) ? data.resolveXp : 0,
    stress: Number.isFinite(data.m_Stress) ? Math.round(data.m_Stress) : 0,
    currentHp: Number.isFinite(data.actor?.current_hp) ? Math.round(data.actor.current_hp) : null,
    weaponRank: data.weapon_rank || 0,
    armourRank: data.armour_rank || 0,
    // Non-empty while the hero is locked into an Abbey/Tavern/Sanitarium slot.
    activity: typeof data['roster.building_name'] === 'string' ? data['roster.building_name'] : '',
    isMissing: (data['roster.missing_duration'] || 0) > 0,
    activeSkills: cap(activeSkills, maxSkills),
    activeCampSkills: cap(activeCampSkills, HERO_CONFIG.MAX_CAMP_SKILLS),
    trinket1: equipped[0] || '',
    trinket2: equipped[1] || '',
    quirks: {
      positive: cap(quirks.positive, HERO_CONFIG.MAX_POSITIVE_QUIRKS),
      negative: cap(quirks.negative, HERO_CONFIG.MAX_NEGATIVE_QUIRKS)
    },
    lockedQuirks: {
      positive: cap(lockedQuirks.positive, HERO_CONFIG.MAX_LOCKED_QUIRKS),
      negative: cap(lockedQuirks.negative, HERO_CONFIG.MAX_LOCKED_QUIRKS)
    },
    diseases: cap(diseases, HERO_CONFIG.MAX_DISEASES)
  };
};

const readNamedList = (container) =>
  Object.values(container || {})
    .map((item) => (typeof item?.name === 'string' ? item.name : null))
    .filter(Boolean);

const decode = (buffer, label) => {
  try {
    return parseDson(buffer);
  } catch (error) {
    throw new Error(`${label} is not a readable Darkest Dungeon save file.`);
  }
};

/**
 * @param {Object} buffers filename (any case) -> ArrayBuffer / Uint8Array
 * @returns a profile: heroes, owned trinkets, estate details and what could
 *          not be matched.
 */
export const parseSaveProfile = (buffers) => {
  const byName = new Map(
    Object.entries(buffers || {}).map(([name, buffer]) => [name.toLowerCase().split(/[\\/]/).pop(), buffer])
  );
  const get = (name) => byName.get(name.toLowerCase());

  const rosterBuffer = get(SAVE_FILES.roster);
  if (!rosterBuffer) {
    throw new Error(`No ${SAVE_FILES.roster} found. Pick a profile folder, or that file inside it.`);
  }

  const roster = decode(rosterBuffer, SAVE_FILES.roster);
  const estateBuffer = get(SAVE_FILES.estate);
  const gameBuffer = get(SAVE_FILES.game);
  const logBuffer = get(SAVE_FILES.campaignLog);

  return buildProfile({
    roster,
    estate: estateBuffer ? decode(estateBuffer, SAVE_FILES.estate) : null,
    game: gameBuffer ? decode(gameBuffer, SAVE_FILES.game) : null,
    log: logBuffer ? decode(logBuffer, SAVE_FILES.campaignLog) : null,
    files: [...byName.keys()].sort()
  });
};

/**
 * The profile, built from already-decoded save files.
 *
 * Split out from `parseSaveProfile` so the parts that need a *particular* save
 * state can be tested without one: there is no DSON encoder here, so a case
 * the available saves do not cover has to be handed in already decoded.
 */
export const buildProfile = ({ roster, estate = null, game = null, log = null, files = [] }) => {
  const unmatched = { heroClasses: [], skills: [], campSkills: [], quirks: [], trinkets: [] };

  const allHeroes = Object.entries(roster.heroes || {})
    .map(([guid, entry]) => ({
      hero: readHero(guid, entry, unmatched),
      dead: isDeadEntry(entry?.hero_file_data?.raw_data)
    }))
    .filter((row) => row.hero);

  // Split rather than filter, so the count can be reported: quietly returning
  // 32 heroes from a 40-hero roster would read as a parsing failure.
  const heroes = allHeroes.filter((row) => !row.dead).map((row) => row.hero);
  const graveyard = allHeroes
    .filter((row) => row.dead)
    .map(({ hero }) => ({ guid: hero.guid, name: hero.name, heroClass: hero.heroClass }));

  const inventory = readItemIds(estate?.trinkets).map((id) => {
    const name = lookup(TRINKET_INDEX, id) || TRINKET_ID_RENAMES[id];
    if (!name) unmatched.trinkets.push(id);
    return name || null;
  }).filter(Boolean);

  // What you can equip is the estate's inventory plus whatever is already on a
  // hero — in the game those are the same pool, just in two places.
  const ownedTrinkets = [
    ...new Set([...inventory, ...heroes.flatMap((hero) => [hero.trinket1, hero.trinket2].filter(Boolean))])
  ].sort();

  const heroClassCounts = heroes.reduce((counts, hero) => {
    counts[hero.heroClass] = (counts[hero.heroClass] || 0) + 1;
    return counts;
  }, {});

  return {
    estateName: typeof game?.estatename === 'string' ? game.estatename : '',
    gameMode: typeof game?.game_mode === 'string' ? game.game_mode : '',
    savedAt: typeof game?.date_time === 'string' ? game.date_time : '',
    week: Number.isFinite(log?.total_weeks) ? log.total_weeks : null,
    inRaid: game?.inraid === true,
    dlc: readNamedList(game?.dlc),
    mods: readNamedList(game?.applied_ugcs_1_0),
    heroes,
    // Heroes carrying roster.status 3. Their equipped trinkets are gone with
    // them, which falls out of ownedTrinkets being built from `heroes`.
    graveyard,
    heroClasses: Object.keys(heroClassCounts).sort(),
    heroClassCounts,
    ownedTrinkets,
    // Deduped: one id repeated across nine heroes is one thing to report.
    unmatched: Object.fromEntries(
      Object.entries(unmatched).map(([key, ids]) => [key, [...new Set(ids)].sort()])
    ),
    files
  };
};

/** The imported hero, in the exact shape the builder's slots use. */
export const toBuilderHero = (hero) => ({
  ...EMPTY_HERO,
  heroClass: hero.heroClass,
  activeSkills: [...hero.activeSkills],
  activeCampSkills: [...hero.activeCampSkills],
  trinket1: hero.trinket1,
  trinket2: hero.trinket2,
  quirks: { positive: [...hero.quirks.positive], negative: [...hero.quirks.negative] },
  lockedQuirks: {
    positive: [...hero.lockedQuirks.positive],
    negative: [...hero.lockedQuirks.negative]
  },
  diseases: [...hero.diseases]
});

const readAsArrayBuffer = (file) =>
  typeof file.arrayBuffer === 'function'
    ? file.arrayBuffer()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsArrayBuffer(file);
      });

const directoryOf = (file) => {
  const relative = file.webkitRelativePath || '';
  return relative.includes('/') ? relative.slice(0, relative.lastIndexOf('/')) : '';
};

/**
 * Picks the one profile out of a directory selection.
 *
 * Two things make this more than a filter. A profile folder holds its own
 * `backup/` copy of every file — same basenames, older bytes — so taking the
 * last match would quietly import a save from before the last few weeks. And a
 * player who picks `Darkest/` rather than `Darkest/profile_3` hands over every
 * profile at once.
 *
 * So: group by folder, keep only folders that actually hold a roster, and take
 * the shallowest one — the backup is a level deeper than the profile it
 * belongs to. Between profiles at the same depth the most recently written
 * roster wins, which is the one being played.
 */
const chooseProfileFiles = (fileList) => {
  const wanted = new Set(Object.values(SAVE_FILES));
  const groups = new Map();

  [...(fileList || [])].forEach((file) => {
    const name = file.name.toLowerCase();
    if (!wanted.has(name)) return;
    const directory = directoryOf(file);
    if (!groups.has(directory)) groups.set(directory, new Map());
    // Within one folder a basename appears once; keep the first either way.
    if (!groups.get(directory).has(name)) groups.get(directory).set(name, file);
  });

  const candidates = [...groups.entries()]
    .filter(([, files]) => files.has(SAVE_FILES.roster))
    .sort(([dirA, filesA], [dirB, filesB]) => {
      const depth = (dir) => (dir ? dir.split('/').length : 0);
      return (
        depth(dirA) - depth(dirB) ||
        (filesB.get(SAVE_FILES.roster).lastModified || 0) -
          (filesA.get(SAVE_FILES.roster).lastModified || 0)
      );
    });

  // No roster anywhere: hand back whatever was picked so `parseSaveProfile`
  // raises the one error that says which file is missing.
  if (!candidates.length) {
    return [...groups.values()].flatMap((files) => [...files.values()]);
  }
  return [...candidates[0][1].values()];
};

/**
 * Reads a `<input type="file" multiple webkitdirectory>` selection. Only the
 * four files above are read: a profile folder also holds map, quest and
 * upgrade data that is of no use here and would be wasted work.
 */
export const readSaveFiles = async (fileList) => {
  const files = chooseProfileFiles(fileList);
  const buffers = {};
  await Promise.all(
    files.map(async (file) => {
      buffers[file.name.toLowerCase()] = await readAsArrayBuffer(file);
    })
  );
  return buffers;
};

/** Convenience for the file picker: read the selection and parse it. */
export const parseSaveFileList = async (fileList) => parseSaveProfile(await readSaveFiles(fileList));

export { isDsonBuffer };
