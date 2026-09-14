/**
 * The parties a save actually took out, from `persist.campaign_log.json`.
 *
 * The log keeps every expedition week by week: the heroes (name, roster guid,
 * class, whether they died), the dungeon, its difficulty and length. It keeps
 * no skills and no trinkets, so this is who went, not what they wore.
 *
 * Classes and dungeons are stored as the game's string hash (`h * 53 + char`,
 * as a signed 32-bit int), which matched `crusader` and `highwayman` on Fran's
 * save. Each expedition is written twice, once as it starts and once as it
 * ends, and the pair is folded into one.
 */
import { HERO_CLASSES } from '../data/heroes';

/** The game's string hash. */
export const ddHash = (text) => {
  let hash = 0;
  for (const char of String(text)) hash = (hash * 53 + char.charCodeAt(0)) | 0;
  return hash;
};

const CLASS_BY_HASH = new Map(
  Object.keys(HERO_CLASSES).map((name) => [ddHash(name.toLowerCase().replace(/ /g, '_')), name])
);

const DUNGEON_BY_HASH = new Map(
  [
    ['crypts', 'The Ruins'],
    ['warrens', 'The Warrens'],
    ['weald', 'The Weald'],
    ['cove', 'The Cove'],
    ['courtyard', 'The Courtyard'],
    ['darkestdungeon', 'Darkest Dungeon'],
    ['farm', 'The Farmstead']
  ].map(([id, label]) => [ddHash(id), label])
);

/**
 * @param {object} log decoded `persist.campaign_log.json`
 * @returns {{week: number, dungeon: string|null, level: number, length: number,
 *   heroes: {guid: string, name: string, heroClass: string|null, died: boolean}[]}[]}
 */
export const readExpeditions = (log) => {
  const out = [];
  const seen = new Set();
  Object.entries(log?.chapters || {}).forEach(([week, chapter]) => {
    Object.values(chapter || {}).forEach((entry) => {
      if (!entry || !entry.heroes || entry.quest_id === undefined) return;
      const heroes = Object.values(entry.heroes).map((hero) => ({
        guid: String(hero.guid),
        name: hero.name || '',
        heroClass: CLASS_BY_HASH.get(hero.class) || null,
        died: !!hero.died
      }));
      const key = `${entry.quest_id}|${heroes.map((h) => h.guid).sort().join(',')}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        week: Number(week),
        dungeon: DUNGEON_BY_HASH.get(entry.dungeon_type) || null,
        level: entry.difficulty,
        length: entry.length,
        heroes
      });
    });
  });
  return out;
};
