/**
 * Turn a game/mod string-table entry into the name the app displays.
 *
 * Combat skills and hero classes ship Title Case already ("Bulwark of Faith"),
 * but camp skills ship SHOUTED ("REJECT THE GODS") because the game draws them
 * on a banner. Title-casing those has to reproduce the names the app already
 * uses for the 80 vanilla camp skills, which pins three rules: small words stay
 * lowercase unless they lead, an apostrophe does not start a new word
 * ("Bandit's", never "Bandit'S"), and a string that already carries a lowercase
 * letter was written mixed-case on purpose and is left alone.
 */
const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor', 'of',
  'on', 'or', 'the', 'to', 'with', 'vs',
]);

function titleCase(raw) {
  const s = (raw || '').trim();
  if (!s) return s;
  // Already mixed case: the author chose it.
  if (/[a-z]/.test(s)) return s;

  const words = s.toLowerCase().split(/(\s+)/);
  let wordIndex = 0;
  const total = words.filter((w) => !/^\s+$/.test(w)).length;
  return words.map((w) => {
    if (/^\s+$/.test(w)) return w;
    const i = wordIndex++;
    const cap = (t) => t.replace(/^([^a-z]*)([a-z])/, (m, p, c) => p + c.toUpperCase());
    // Hyphenated words capitalise both halves ("Self-Medicate").
    const capParts = (t) => t.split('-').map(cap).join('-');
    if (i !== 0 && i !== total - 1 && SMALL_WORDS.has(w.replace(/[^a-z]/g, ''))) return w;
    return capParts(w);
  }).join('');
}

/** Loose key for "is this the same name?" comparisons across sources. */
function nameKey(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

module.exports = { titleCase, nameKey, SMALL_WORDS };
