/**
 * A comp in a URL, so it can be pasted where people actually talk.
 *
 * Sharing a party used to mean a PNG or a `.json` download, and neither one
 * *opens* as a comp for whoever receives it: the picture cannot be edited and
 * the file has to be saved, found and imported. A link opens the builder with
 * the party already in it.
 *
 * ## Why the payload is not JSON
 *
 * Because it has to survive being pasted. Measured over the 467 bundled comps,
 * base64url of:
 *
 * | shape | median | p95 | max |
 * | --- | --- | --- | --- |
 * | the comp's own JSON | 2079 | 2239 | 2567 |
 * | JSON with one-letter keys | 1315 | 1508 | 1847 |
 * | **this** | **971** | **1142** | **1456** |
 *
 * JSON spends most of its bytes on quotes, braces and key names, and a comp is
 * a fixed shape — four heroes, ten fields each — so the field names carry no
 * information. Positional text drops all of it.
 *
 * A per-payload string dictionary was tried and made things *worse* (median
 * 1360): the repeated camp skills it collapses do not pay for the array of
 * words plus the indices, and base64 inflates whatever is left by a third.
 *
 * Real compression would roughly halve it again (`deflate` puts the p95 at
 * 736), and it is deliberately not used: `CompressionStream` is async, and it
 * does not exist in jsdom, so the encoder would be untestable in the suite that
 * has to guarantee a link still opens. **The version marker is what keeps that
 * door open** — a `2` payload can be deflate and old `1` links keep working.
 *
 * ## Names, not indices
 *
 * The obvious way to make this tiny is to write the index of a skill in its
 * class's roster. It is also how a link goes stale: reorder `heroes.js`, and
 * every link ever shared now describes a different party, silently and
 * plausibly. The same reason `heroClass` is a string everywhere else in this
 * app — see the rule in AGENTS.md, *Class names are the key*.
 */

/**
 * The payload's first field. Bump it when the SHAPE changes, and keep the old
 * reader: a link someone posted a year ago is a promise.
 */
export const COMP_LINK_VERSION = '1';

/** The route a link lands on. */
export const COMP_LINK_ROUTE = '#/comp/';

// Field separators, innermost last. All four are absent from every one of the
// 772 distinct names the bundled library uses, so escaping never fires in
// practice — it is here because a mod may ship anything.
const HERO = '~';
const FIELD = '|';
const ITEM = ',';
const ESCAPE_CHARS = /[\\~|,]/g;

const esc = (s) => String(s == null ? '' : s).replace(ESCAPE_CHARS, (c) => '\\' + c);

/**
 * Split on a delimiter the writer may have escaped, **keeping the escapes**.
 *
 * A plain `split` would cut `Boots \, Spurs` in half. Walking the string fixes
 * that, but the backslashes have to survive the cut: the payload nests three
 * deep (heroes, then fields, then items), so a split that also unescaped would
 * strip the inner delimiters' protection on the way through the outer one, and
 * `Boots, Spurs` would come back as `Boots` at the next level down.
 *
 * That is exactly the bug the delimiter test caught. Unescaping therefore
 * happens once, at the leaf, in `unesc`.
 */
const splitEscaped = (text, delim) => {
  const out = [];
  let buf = '';
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '\\') {
      buf += c;
      i += 1;
      if (i < text.length) buf += text[i];
    } else if (c === delim) {
      out.push(buf);
      buf = '';
    } else {
      buf += c;
    }
  }
  out.push(buf);
  return out;
};

/** The leaf step: a backslash always takes the next character literally. */
const unesc = (s) => String(s == null ? '' : s).replace(/\\([\s\S])/g, '$1');

const list = (a) => (Array.isArray(a) ? a : []).map(esc).join(ITEM);
const unlist = (s) => (s ? splitEscaped(s, ITEM).map(unesc).filter(Boolean) : []);

// The hero's ten fields, in a fixed order. Trailing empties are trimmed off the
// wire and restored on the way back, which is most of what makes a party of
// plain heroes short.
const encodeHero = (h) => {
  const hero = h || {};
  const quirks = hero.quirks || {};
  const locked = hero.lockedQuirks || {};
  return [
    esc(hero.heroClass),
    list(hero.activeSkills),
    list(hero.activeCampSkills),
    esc(hero.trinket1),
    esc(hero.trinket2),
    list(quirks.positive),
    list(quirks.negative),
    list(locked.positive),
    list(locked.negative),
    list(hero.diseases),
  ].join(FIELD).replace(/\|+$/, '');
};

const decodeHero = (text) => {
  const f = splitEscaped(text, FIELD);
  const at = (i) => unesc(f[i] || '');
  return {
    heroClass: at(0),
    activeSkills: unlist(at(1)),
    activeCampSkills: unlist(at(2)),
    trinket1: at(3),
    trinket2: at(4),
    quirks: { positive: unlist(at(5)), negative: unlist(at(6)) },
    lockedQuirks: { positive: unlist(at(7)), negative: unlist(at(8)) },
    diseases: unlist(at(9)),
  };
};

/**
 * UTF-8 through `btoa`, which only speaks latin-1.
 *
 * `TextEncoder` would be the obvious tool and is **not defined in jsdom**, so
 * using it would mean the link tests could not run. `encodeURIComponent` does
 * the UTF-8 work in every environment, and this walks its output back into the
 * byte string `btoa` wants. It matters for real names: Touché, Flèche,
 * Coup de Grâce.
 */
const toBinary = (text) =>
  encodeURIComponent(text).replace(/%([0-9A-F]{2})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)));

const fromBinary = (binary) =>
  decodeURIComponent(
    binary.replace(/[\s\S]/g, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
  );

const base64url = (text) =>
  btoa(toBinary(text)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const unBase64url = (payload) => {
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  return fromBinary(atob(padded + '='.repeat((4 - (padded.length % 4)) % 4)));
};

/**
 * A comp as one URL-safe string.
 *
 * @param {{teamName?: string, location?: string, heroes?: object[]}} team
 * @returns {string} base64url payload, no scheme or host
 */
export const encodeComp = (team) => {
  const t = team || {};
  const heroes = Array.isArray(t.heroes) ? t.heroes : [];
  const body = [COMP_LINK_VERSION, esc(t.teamName), esc(t.location)]
    .concat(heroes.map(encodeHero))
    .join(HERO);
  return base64url(body);
};

/**
 * The comp a payload describes, or null if it does not describe one.
 *
 * **Null rather than a throw, and null rather than a guess.** This reads a
 * string a stranger put in a chat window; the only two honest outcomes are a
 * comp and "that is not a comp". Nothing here canonicalises or validates —
 * `useTeam` runs the decoded object through `canonicalizeTeam` and
 * `validateTeamSchema`, the same path a pasted file takes, so a link cannot
 * reach the party by a softer route than a file does.
 */
export const decodeComp = (payload) => {
  if (typeof payload !== 'string' || !payload) return null;
  let body;
  try {
    body = unBase64url(payload.trim());
  } catch (e) {
    return null;
  }
  if (!body) return null;

  const parts = splitEscaped(body, HERO);
  // An unknown version is a link from a newer build. Refusing it is the point:
  // reading it with these rules would produce a plausible wrong party.
  if (parts[0] !== COMP_LINK_VERSION) return null;

  const heroes = parts.slice(3).map(decodeHero);
  if (!heroes.length) return null;
  return {
    teamName: unesc(parts[1] || ''),
    location: unesc(parts[2] || ''),
    heroes,
  };
};

/**
 * The full link for a comp, against the page the app is served from.
 *
 * The hash is deliberate: it keeps this a static app. Nothing on the server has
 * to know the route, which is the same reason `#/ranker` is a hash.
 */
export const compLinkFor = (team, href) => {
  const base = String(href || '').split('#')[0];
  return `${base}${COMP_LINK_ROUTE}${encodeComp(team)}`;
};

/** The payload in a hash, or null when the hash is not a comp link. */
export const compPayloadFromHash = (hash) => {
  const h = String(hash || '');
  if (!h.startsWith(COMP_LINK_ROUTE)) return null;
  return h.slice(COMP_LINK_ROUTE.length) || null;
};
