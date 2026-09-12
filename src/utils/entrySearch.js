import { nameKey, getNameAliases } from './nameNormalizer';

/**
 * Search that matches what a thing *does*, not only what it is called.
 *
 * The pickers used to filter on the name alone, which is the one thing a
 * player looking for "something that gives dodge" does not know. Every trinket
 * and quirk already carries a generated effect line (`trinketEffects.js`,
 * `quirkEffects.js`) - this makes that line searchable, so "dodge" finds the
 * 60-odd trinkets that grant it instead of only `Dodgy Cloak`.
 *
 * Four rules, because each one is a way the naive filter got it wrong:
 *
 * 1. **Terms are AND-ed, and each may land in a different field.** "dodge crit"
 *    means both, not the literal string - nothing in the game reads
 *    "dodge crit", so a substring match found nothing.
 * 2. **The game's abbreviations are not what players type.** The data says
 *    `ACC`, `PROT`, `DMG`; players type "accuracy", "armor", "damage". Those
 *    are the same query, so they are the same token here.
 * 3. **A name hit outranks an effect hit.** Typing "sun" must put `Sun Ring`
 *    above every trinket whose effect happens to mention sunlight.
 * 4. **A leading `+` or `-` filters on the sign.** `+dodge` is "grants dodge",
 *    `-dodge` is "costs dodge", a bare `dodge` is either. The sign is read per
 *    *segment* of the effect, so it is the sign on that stat rather than one
 *    found anywhere in the line.
 *
 * One caveat about the sign filter: it matches the sign **as written**, which
 * is not the same thing as good-for-you. `+30% Stress` is written positive and
 * is a downside; `Crits Received Chance: +6%` is a debuff carrying a `+`. Same
 * trap `skillProfile.js` documents - the filter answers "which way does the
 * number point", not "is this good".
 */

// Words players use interchangeably for the same mechanic. Each group is
// mutually substitutable: any member as a query finds any member in the text.
const SYNONYM_GROUPS = [
  ['acc', 'accuracy'],
  ['dmg', 'damage'],
  ['prot', 'protection', 'armor', 'armour'],
  ['spd', 'speed'],
  ['hp', 'health'],
  ['crit', 'critical'],
  ['res', 'resist', 'resistance'],
  ['blight', 'poison'],
  ['bleed', 'bleeding'],
  ['burn', 'burning'],
  ['heal', 'healing', 'restoration'],
  ['stun', 'daze', 'dazed'],
  ['mark', 'marked'],
  ['move', 'movement'],
  ['scout', 'scouting'],
  ['virtue', 'virtuous'],
  ['affliction', 'afflicted'],
  ['deathblow', 'death blow'],
  ['dot', 'over time'],
];

// token -> every token it may stand in for (itself included).
const EXPANSIONS = new Map();
SYNONYM_GROUPS.forEach((group) => {
  const keys = group.map(nameKey).filter(Boolean);
  keys.forEach((k) => {
    const seen = EXPANSIONS.get(k) || [];
    EXPANSIONS.set(k, [...new Set([...seen, ...keys])]);
  });
});

/**
 * The query, split into the terms a match has to account for.
 *
 * A term is `{ text, sign }`. A leading `+` or `-` on a token is a **sign
 * filter**, not punctuation: `+dodge` means "a clause that grants dodge" and
 * `-dodge` means one that costs it, where a bare `dodge` means either. Without
 * it, looking for a dodge trinket returned the ones that take dodge away
 * alongside the ones that give it.
 */
export const searchTerms = (query) => {
  const raw = String(query == null ? '' : query).trim();
  if (!raw) return [];
  return raw.split(/\s+/).flatMap((token) => {
    const signed = /^([+-])(.+)$/.exec(token);
    const text = nameKey(signed ? signed[2] : token);
    // A token can still normalize to several words ("max-hp"), and the sign
    // covers the token as a whole, so it stays one phrase term.
    return text ? [{ text, sign: signed ? signed[1] : null }] : [];
  });
};

const expand = (text) => EXPANSIONS.get(text) || [text];

// A term lands if the text carries it or any word it stands in for. Synonyms
// are whole-token comparisons on a normalized string, so "hp" does not match
// the "hp" inside some longer word by accident.
const lands = (haystack, term) =>
  expand(term.text).some((t) => (t.includes(' ') ? haystack.includes(t) : hasToken(haystack, t)));

// Where one clause ends and the next begins, for the purpose of reading a
// sign. `" | "` separates clauses, but a rendered effect also joins its own
// bits with commas - `On Monster Kill: Self: -2% Stress, +2 ACC` carries both
// signs in one clause, and splitting only on the pipe would let `+stress`
// match it off the `+2 ACC` half.
const SEGMENT = /\s*\|\s*|,\s*/;
const SIGNED_NUMBER = /([+-])\s*\d/g;

/**
 * The effect, as segments that each know which signs they carry.
 *
 * The sign has to be read before `nameKey` runs, because normalizing strips
 * `+` and `-` along with the rest of the punctuation.
 */
export const effectSegments = (effect) =>
  String(effect || '')
    .split(SEGMENT)
    .map((segment) => {
      const signs = new Set();
      let m;
      SIGNED_NUMBER.lastIndex = 0;
      while ((m = SIGNED_NUMBER.exec(segment))) signs.add(m[1]);
      return { keyed: nameKey(segment), signs };
    })
    .filter((s) => s.keyed);

const hasToken = (haystack, token) => {
  // `haystack` is nameKey output: lowercase words separated by single spaces.
  // A prefix match is what makes typing feel live ("acc" -> "accuracy",
  // "dodg" -> "dodge") without matching mid-word noise.
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(token, from);
    if (at < 0) return false;
    if (at === 0 || haystack[at - 1] === ' ') return true;
    from = at + 1;
  }
};

const SCORE = {
  exactName: 1000,
  namePrefix: 700,
  namePhrase: 500,
  nameTerms: 300,
  effect: 100,
};

/**
 * How well one entry answers a query.
 *
 * Returns `null` when it does not match at all, otherwise `{ score, inName,
 * inEffect }` - the flags let a caller show *why* something matched, which is
 * the difference between a mystifying result list and an obvious one.
 */
export const matchEntry = (query, { name, effect = '', tags = [] }) => {
  const terms = searchTerms(query);
  if (!terms.length) return { score: 0, inName: false, inEffect: false };

  const aliases = getNameAliases(name) || [];
  // The primary name decides exact/prefix rank; aliases only need to make a
  // term land, so a misspelling still finds the trinket without outranking
  // the trinket actually called that.
  const primary = nameKey(name);
  const nameHay = [name, ...aliases].map(nameKey).join(' ');
  const effectHay = [effect, ...tags].map(nameKey).join(' ');
  const segments = effectSegments(effect);

  let inName = false;
  let inEffect = false;

  // Rule 1: every term has to land somewhere, or this is not a match.
  for (const term of terms) {
    if (term.sign) {
      // A signed term is a question about the effect, so the name is not
      // consulted: `+dodge` asks what the trinket does, not what it is called.
      // It needs one segment that both mentions the term and carries the sign,
      // which is what keeps `+dodge` off a `-10 DODGE` trinket.
      if (!segments.some((s) => s.signs.has(term.sign) && lands(s.keyed, term))) return null;
      inEffect = true;
      continue;
    }
    const hitName = lands(nameHay, term);
    const hitEffect = lands(effectHay, term);
    if (!hitName && !hitEffect) return null;
    inName = inName || hitName;
    inEffect = inEffect || hitEffect;
  }

  // Rank on the unsigned terms only: a query that is all signs is asking about
  // the effect, so there is no name match to promote it over.
  const plainTerms = terms.filter((t) => !t.sign);
  const phrase = plainTerms.map((t) => t.text).join(' ');
  let score = SCORE.effect;
  if (phrase) {
    if (primary === phrase) score = SCORE.exactName;
    else if (primary.startsWith(phrase)) score = SCORE.namePrefix;
    else if (primary.includes(phrase)) score = SCORE.namePhrase;
    else if (plainTerms.every((t) => lands(nameHay, t))) score = SCORE.nameTerms;
  }

  return { score, inName, inEffect };
};

/**
 * Filter and rank a list of names.
 *
 * `describe(name)` supplies the searchable text for one entry. With no query
 * the list comes back untouched - the curated order of a section (the
 * recommended quirks are in usage order, not alphabetical) is worth more than
 * any ranking we could apply.
 */
export const searchEntries = (names, query, describe) => {
  const list = names || [];
  if (!searchTerms(query).length) return list.map((name) => ({ name, match: null }));

  return list
    .map((name, index) => ({ name, index, match: matchEntry(query, describe(name)) }))
    .filter((row) => row.match)
    .sort((a, b) => b.match.score - a.match.score || a.index - b.index)
    .map(({ name, match }) => ({ name, match }));
};
