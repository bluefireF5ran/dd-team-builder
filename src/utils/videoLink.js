/**
 * The guide video a comp can carry.
 *
 * A comp says what to bring; it does not say how the eight turns actually go.
 * That is what a link to someone running it adds, and it is why this is one
 * field on the comp rather than a note in the name: it has to survive being
 * saved, shared and dropped into the library like everything else about a comp.
 *
 * ## Why an id and not the URL
 *
 * The field holds whatever the user pasted, and **nothing renders that string**.
 * A URL from a chat window is a stranger's bytes: `javascript:` in an `href` is
 * a script, and any host in an `<iframe src>` is a third party running code on
 * the page. So the only thing that leaves here is an eleven-character id, and
 * both URLs the app uses are rebuilt from it — a pasted link that is not
 * YouTube parses to null and the play button never appears.
 *
 * The embed goes to `youtube-nocookie.com`, which is the same player without the
 * ad-profile cookie for someone who only came to see a party comp.
 *
 * ## What counts as a link
 *
 * Every shape YouTube itself hands out (`watch?v=`, `youtu.be/`, `/embed/`,
 * `/shorts/`, `/live/`), plus a bare id, because that is what you get pasting
 * from some clients. The timestamp comes with it: people link the fight, not
 * the video, and dropping `t=` would land every viewer back at the intro.
 */

/** YouTube ids are eleven characters of base64url, always. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

// `youtu.be` is handled separately (the id is its whole path); the rest all put
// it in the same two places. `www.` is stripped before the lookup.
const HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com'
]);

const PATH_ID = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/;

/**
 * Seconds from YouTube's own time spellings: `90`, `90s`, `1m30s`, `1h2m3s`.
 *
 * Anything else is no timestamp rather than a guess — starting the video in the
 * wrong place is worse than starting it at the beginning.
 */
const toSeconds = (raw) => {
  const text = String(raw == null ? '' : raw).trim().toLowerCase();
  if (!text) return 0;
  if (/^\d+$/.test(text)) return Number(text);
  const parts = text.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!parts || !parts.slice(1).some(Boolean)) return 0;
  return Number(parts[1] || 0) * 3600 + Number(parts[2] || 0) * 60 + Number(parts[3] || 0);
};

const idFromUrl = (url) => {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0];
  if (!HOSTS.has(host)) return '';
  if (url.pathname === '/watch') return url.searchParams.get('v') || '';
  const path = url.pathname.match(PATH_ID);
  return path ? path[1] : '';
};

/**
 * What a pasted string points at, or null when it points at nothing we can play.
 *
 * @param {string} raw
 * @returns {{id: string, start: number}|null}
 */
export const parseVideoLink = (raw) => {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return null;
  if (VIDEO_ID.test(text)) return { id: text, start: 0 };

  let url;
  try {
    // A pasted link often arrives without its scheme ("youtu.be/…"), and `URL`
    // throws on that rather than assuming one.
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
  } catch (e) {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const id = idFromUrl(url);
  if (!VIDEO_ID.test(id)) return null;
  return { id, start: toSeconds(url.searchParams.get('t') || url.searchParams.get('start')) };
};

/** Whether the app would offer to play this. Empty is not an error, just nothing. */
export const isVideoLink = (raw) => parseVideoLink(raw) !== null;

/** The player, rebuilt from the id — never the string that was pasted. */
export const embedUrlFor = (video) => {
  const parsed = video && video.id ? video : parseVideoLink(video);
  if (!parsed) return '';
  const start = parsed.start ? `&start=${parsed.start}` : '';
  return `https://www.youtube-nocookie.com/embed/${parsed.id}?rel=0&modestbranding=1${start}`;
};

/** The same video on YouTube itself, for the "open it there" escape hatch. */
export const watchUrlFor = (video) => {
  const parsed = video && video.id ? video : parseVideoLink(video);
  if (!parsed) return '';
  const start = parsed.start ? `&t=${parsed.start}s` : '';
  return `https://www.youtube.com/watch?v=${parsed.id}${start}`;
};
