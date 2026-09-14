/**
 * Which installed mod an app class is, where its own `modId` points at an
 * upload that is no longer on disk.
 *
 * A popular class gets uploaded again - a port, a translation, a rebalance -
 * under a new mod id. When the app carries the class from upload A and only
 * upload B is installed, nothing can match the two: `modId` says A, and A is
 * not there. The importer keeps the class as-is (it cannot verify it) and adds
 * B beside it as `<name> (<modId>)`, so the roster ends up with the character
 * twice - once as content that is not installed, once as the content that is.
 *
 * A pin says which installed upload a class means. The class is then rebuilt
 * from the mod actually on disk, and B is no longer new, so it is not added.
 *
 * Each pin here was checked the same way: the installed mod ships a hero whose
 * id is the one the class already carries (`heroId`), which is what `pickHero`
 * resolves on, and the kit is the same size. Two are a choice rather than a
 * match, and both are noted below.
 *
 * Keyed by class name, valued by the installed mod id. Unlike `heroPins`, this
 * is read on every run: the data file keeps the resolved `modId`, so a pin that
 * has done its job looks like a no-op until the class is uploaded again.
 */
module.exports = {
  'Falconer': '1089257023',
  'Thrall': '1175904375',
  'Seraph': '1221097087',
  'Monk': '1442225067',
  'Bogatyr': '1976300413',
  'Ringmaster': '2325415039',
  'Dredge': '2865308693',
  'Exanimate': '2998367658',
  'Gunwitch': '3181881842',
  'Estranged': '3371578144',
  'Aesthete': '3409701879',
  'Ripperkin': '3427245711',

  // `wraith_ms` is the installed hero, and the app has both `Wraith` (hero id
  // `wraith`, another class entirely) and `Wraith Ms`. The pin goes on the one
  // that carries the id; without it the name fallback would take `Wraith`.
  'Wraith Ms': '1697037179',

  // 3280389755 ships `VH_oni`, which the app already carries as `Vh Oni`. Its
  // own name for the class is Marauder, and that is what would be added.
  'Vh Oni': '3280389755',

  // Two app classes claim hero id `lamia`: `Lamia` (7 skills) and
  // `Lamia (2907034480)` (8, from a different upload). The installed kit is 7.
  'Lamia': '1130829365',

  // Same again for `commandant`: the app has `Commandant` (8 skills, upload
  // 2903347408) and a lower-case `commandant` (7). The installed kit is 7, so
  // the pin puts the installed content under the readable name and the eighth
  // skill goes with the upload that is not installed.
  'Commandant': '2472629364',
};
