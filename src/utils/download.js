/**
 * Handing the browser a JSON file to save.
 *
 * There were four copies of this, all building a `data:` URI:
 *
 *     'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload))
 *
 * That works until the payload is big. `encodeURIComponent` roughly triples the
 * byte count — every `"`, `{` and space becomes a three-character escape — and
 * browsers cap `data:` navigations (Chrome at about 2 MB). **The largest export
 * this app produces is the comp ranking, which carries a full party loadout for
 * every comp in a region, and that is exactly the file the sibling RL project
 * reads.** The failure mode is a download that is silently refused or truncated,
 * which is the worst way for that hand-off to break.
 *
 * A `Blob` has no such limit and skips the encoding entirely.
 *
 * The `data:` path is kept as a fallback purely for environments without
 * `URL.createObjectURL` — jsdom, notably, so the storage tests still exercise
 * the real function rather than a mock.
 */

const OBJECT_URL_LIFETIME_MS = 60_000;

const supportsObjectUrl = () =>
  typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

/**
 * The file ends with a newline, because a comp exported here is meant to be
 * dropped into `src/data/presetComps` and committed: `JSON.stringify` stops at
 * the closing brace, so every downloaded comp used to land a line short of the
 * 477 already there and show up as a whole-line diff on `}` the next time it
 * was touched. Nothing reads these files by byte count, and a trailing newline
 * is whitespace to every JSON parser.
 *
 * @param {string} fileName what the browser should call it
 * @param {unknown} payload anything JSON-serialisable; written pretty-printed
 * @returns {boolean} whether the download was started
 */
export const downloadJSON = (fileName, payload) => {
  const text = JSON.stringify(payload, null, 2) + '\n';
  const link = document.createElement('a');
  link.setAttribute('download', fileName);

  if (supportsObjectUrl()) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    link.setAttribute('href', url);
    link.click();
    // Revoking immediately can race the download in some browsers; revoking
    // never leaks the blob for the life of the tab. A timer is the usual
    // compromise.
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_LIFETIME_MS);
    return true;
  }

  link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  link.click();
  return true;
};

export default downloadJSON;
