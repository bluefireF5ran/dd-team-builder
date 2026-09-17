/**
 * Whose video it is: the title and the channel, straight from YouTube.
 *
 * The point of the whole feature is to send people to the guides that taught
 * these comps, and a bare player names the channel in small print at the top and
 * nothing else. This puts the credit in the page, under the video, with a link
 * to the channel.
 *
 * ## oEmbed, not the Data API
 *
 * `youtube.com/oembed` is public, needs no key and answers CORS, so nothing has
 * to be kept secret and there is no quota to run out of in a static app with no
 * server. It returns the title, the channel and the channel's URL for any video
 * that is public and embeddable — which is the same question the player asks, so
 * a video with no credit here is one that would not have played anyway.
 *
 * ## What is trusted
 *
 * Nothing. The id going out is one this app parsed (`videoLink.js`), and the
 * `author_url` coming back is checked to be a YouTube address before it can
 * reach an `href`: it arrives as JSON from the network like any other response,
 * and a URL from the network is not something to click on faith.
 *
 * The cache is for the session and lives in memory. Reopening the same video
 * does not ask again; a reload does, which is one request for a dialog someone
 * deliberately opened.
 */

const ENDPOINT = 'https://www.youtube.com/oembed';

const CHANNEL_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'music.youtube.com']);

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** id -> credit, or null for "asked, and there is nothing to show". */
const cache = new Map();

/** A channel link is only a link if it is YouTube's. */
const channelUrl = (raw) => {
  try {
    const url = new URL(String(raw || ''));
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return CHANNEL_HOSTS.has(url.hostname.toLowerCase().replace(/^www\./, '')) ? url.href : '';
  } catch (e) {
    return '';
  }
};

/** What is already known, without asking anyone. `undefined` means not asked. */
export const peekVideoCredit = (id) => cache.get(id);

/**
 * The credit for a video id, or null when there is none to give.
 *
 * Null covers every way this can come back empty — private, deleted, embedding
 * turned off, no network — because they all mean the same thing here: show the
 * player, say nothing about who made it. A refusal is remembered so a dialog
 * opened twice does not ask twice; a network failure is not, so it can recover.
 *
 * @param {string} id
 * @returns {Promise<{title: string, author: string, authorUrl: string}|null>}
 */
export const fetchVideoCredit = async (id) => {
  if (!VIDEO_ID.test(String(id || ''))) return null;
  if (cache.has(id)) return cache.get(id);

  let data;
  try {
    const watch = `https://www.youtube.com/watch?v=${id}`;
    const response = await fetch(`${ENDPOINT}?format=json&url=${encodeURIComponent(watch)}`);
    if (!response.ok) {
      // A 401/403/404 is an answer: this video has no credit to show, today or
      // in five minutes. Worth remembering.
      cache.set(id, null);
      return null;
    }
    data = await response.json();
  } catch (e) {
    return null;
  }

  const credit = {
    title: String(data?.title || ''),
    author: String(data?.author_name || ''),
    authorUrl: channelUrl(data?.author_url)
  };
  const useful = credit.title || credit.author ? credit : null;
  cache.set(id, useful);
  return useful;
};

/** For tests: the cache is a session, and a test is not one. */
export const forgetVideoCredits = () => cache.clear();
