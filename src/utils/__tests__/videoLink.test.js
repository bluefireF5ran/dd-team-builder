import { parseVideoLink, isVideoLink, embedUrlFor, watchUrlFor } from '../videoLink';

const ID = 'dQw4w9WgXcQ';

describe('reading a pasted video link', () => {
  test.each([
    ['https://www.youtube.com/watch?v=' + ID, 0],
    ['http://youtube.com/watch?v=' + ID, 0],
    ['https://m.youtube.com/watch?v=' + ID, 0],
    ['https://music.youtube.com/watch?v=' + ID, 0],
    ['https://youtu.be/' + ID, 0],
    ['https://www.youtube.com/embed/' + ID, 0],
    ['https://www.youtube.com/shorts/' + ID, 0],
    ['https://www.youtube.com/live/' + ID, 0],
    ['youtu.be/' + ID, 0],
    [ID, 0]
  ])('%s', (link, start) => {
    expect(parseVideoLink(link)).toEqual({ id: ID, start });
  });

  test('keeps the timestamp, because people link the fight and not the video', () => {
    expect(parseVideoLink(`https://youtu.be/${ID}?t=90`).start).toBe(90);
    expect(parseVideoLink(`https://www.youtube.com/watch?v=${ID}&t=90s`).start).toBe(90);
    expect(parseVideoLink(`https://www.youtube.com/watch?v=${ID}&t=1m30s`).start).toBe(90);
    expect(parseVideoLink(`https://www.youtube.com/watch?v=${ID}&t=1h2m3s`).start).toBe(3723);
    expect(parseVideoLink(`https://www.youtube.com/embed/${ID}?start=45`).start).toBe(45);
  });

  test('a timestamp it cannot read is no timestamp, not a guess', () => {
    expect(parseVideoLink(`https://youtu.be/${ID}?t=soon`).start).toBe(0);
  });

  test('extra query and hash do not get in the way', () => {
    expect(parseVideoLink(`https://www.youtube.com/watch?v=${ID}&list=PLabc&index=2#body`))
      .toEqual({ id: ID, start: 0 });
  });

  test.each([
    ['', 'nothing at all'],
    ['   ', 'blank'],
    ['not a link', 'prose'],
    ['https://vimeo.com/123456789', 'another site'],
    ['https://youtube.com.evil.example/watch?v=' + ID, 'a host that only looks like YouTube'],
    ['https://www.youtube.com/watch?v=short', 'an id that is not eleven characters'],
    ['https://www.youtube.com/results?search_query=darkest', 'a page with no video in it'],
    // eslint-disable-next-line no-script-url
    ['javascript:alert(1)', 'a script'],
    ['data:text/html,<script>alert(1)</script>', 'a data URL']
  ])('%s is not a video (%s)', (link) => {
    expect(parseVideoLink(link)).toBeNull();
    expect(isVideoLink(link)).toBe(false);
  });
});

describe('what the app actually renders', () => {
  test('the player is rebuilt from the id, never from the pasted string', () => {
    const url = embedUrlFor(`https://www.youtube.com/watch?v=${ID}&list=PLabc`);
    expect(url).toBe(`https://www.youtube-nocookie.com/embed/${ID}?rel=0&modestbranding=1`);
    expect(url).not.toContain('PLabc');
  });

  test('the player starts where the link said', () => {
    expect(embedUrlFor(`https://youtu.be/${ID}?t=1m30s`)).toContain('&start=90');
    expect(watchUrlFor(`https://youtu.be/${ID}?t=1m30s`)).toBe(`https://www.youtube.com/watch?v=${ID}&t=90s`);
  });

  test('nothing to play means no URL to render', () => {
    expect(embedUrlFor('https://vimeo.com/1')).toBe('');
    expect(watchUrlFor('')).toBe('');
  });
});
