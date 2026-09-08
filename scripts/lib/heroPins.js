/**
 * Which hero inside a mod folder an app class means, where nothing can work it
 * out.
 *
 * `pickHero` resolves almost every class on its own — by the `heroId` already in
 * the data file, by the mod's own class name, or by which hero's skills the
 * class already lists. What it cannot resolve is a mod that ships **two heroes
 * and no english at all**: there is no name to match and no named skill to
 * count. Three of those are installed, and the app happens to carry hand-written
 * english for them, so the answer exists — it is just not in the mod.
 *
 * Each pin is checked, not guessed: replaying the old scraper's ordering against
 * the pinned hero reproduces exactly the list of names already in the app, which
 * is what puts each of them back on the right skill id. See `pairAppNames`.
 *
 * Keyed by class name. The importer writes the resolved `heroId` into
 * `modded_heroes.js`, so a pin is only read once — after that the data file
 * carries the answer.
 */
module.exports = {
  // 3631649848 ships `deovolente` (9 skills) and `Mesmer` (13). The app's
  // thirteen names replay against Mesmer exactly.
  'Illusionist': 'Mesmer',
  'Illusionist (3631649848)': 'Mesmer',

  // 3315284734 ships `onikenshi` (7 skills) and `unicorn` (8). The app's fifteen
  // names replay against onikenshi's string table, which carries eight
  // stance-variant entries beyond the seven-skill kit.
  'Oni Swordsman': 'onikenshi',
  'Oni Swordsman (3315284734)': 'onikenshi',

  // 2879322922 ships `collector` (7) and `collector_battle` (7, the transformed
  // state). The app's fifteen names replay against `collector`.
  'The Collector': 'collector',
  'The Collector (2879322922)': 'collector',

  // 3397134362 is a 21-hero compilation, and the app carries nine of its classes
  // under names that share no letters with the folder ids. The mod names its
  // heroes in Chinese only, so neither the name nor the skills can match them
  // up; each of these is the obvious reading of the app's own name.
  'Battle Priest': 'exorcist',
  'Battle Priest (3397134362)': 'exorcist',
  'Blood Hunter (CN)': 'bloodyhunter',
  'Blood Hunter (CN) (3397134362)': 'bloodyhunter',
  'Crusader (Kaze)': 'CrusaderRemakeFromKaze',
  'Crusader (Kaze) (3397134362)': 'CrusaderRemakeFromKaze',
  'Plague Doctor (WC2)': 'wc_plague_doctor',
  'Plague Doctor Fanatic': 'wc_plague_doctor',

  // 3378560396 is the same compilation re-uploaded with nine of the heroes.
  'Blood Hunter (CN2)': 'bloodyhunter',

  // Deliberately absent: `Unicorn (Rework)`, the second hero of 3315284734.
  // Its eight app names replay to nine ids, so they cannot be laid onto the kit
  // without guessing which one is missing — and the mod is chinese-only, so
  // pinning it would replace working english with the mod's own names. It keeps
  // what it has and stays out of the asset export.
};
