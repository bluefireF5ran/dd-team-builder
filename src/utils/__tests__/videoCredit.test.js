import { fetchVideoCredit, peekVideoCredit, forgetVideoCredits } from '../videoCredit';

const ID = 'dQw4w9WgXcQ';

const answer = (body, ok = true) => ({ ok, json: async () => body });

const OEMBED = {
  title: 'Money Quartet, Rot run',
  author_name: 'Some Dungeoneer',
  author_url: 'https://www.youtube.com/@somedungeoneer'
};

describe('who the video belongs to', () => {
  beforeEach(() => {
    forgetVideoCredits();
    global.fetch = jest.fn().mockResolvedValue(answer(OEMBED));
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('asks YouTube about the video the id names', async () => {
    await fetchVideoCredit(ID);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ID}`)}`
    );
  });

  test('gives back the title and the channel', async () => {
    expect(await fetchVideoCredit(ID)).toEqual({
      title: 'Money Quartet, Rot run',
      author: 'Some Dungeoneer',
      authorUrl: 'https://www.youtube.com/@somedungeoneer'
    });
  });

  test('asks once per session, however many times the dialog is opened', async () => {
    await fetchVideoCredit(ID);
    await fetchVideoCredit(ID);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(peekVideoCredit(ID)).toMatchObject({ author: 'Some Dungeoneer' });
  });

  // El id lo produce videoLink; esto es el cinturon: nada que no sea un id sale
  // a la red.
  test('does not ask about something that is not a video id', async () => {
    expect(await fetchVideoCredit('../../etc/passwd')).toBeNull();
    expect(await fetchVideoCredit('')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  /**
   * Privado, borrado o con la incrustacion desactivada: las tres dan lo mismo
   * aqui -- ensenar el reproductor y no decir de quien es --, y las tres son una
   * respuesta, asi que se recuerdan.
   */
  test('remembers a refusal instead of asking again', async () => {
    global.fetch.mockResolvedValue(answer(null, false));
    expect(await fetchVideoCredit(ID)).toBeNull();
    expect(await fetchVideoCredit(ID)).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('a network failure is not an answer, so it can be asked again', async () => {
    global.fetch.mockRejectedValue(new Error('offline'));
    expect(await fetchVideoCredit(ID)).toBeNull();
    expect(peekVideoCredit(ID)).toBeUndefined();

    global.fetch.mockResolvedValue(answer(OEMBED));
    expect(await fetchVideoCredit(ID)).toMatchObject({ author: 'Some Dungeoneer' });
  });

  // La respuesta viene de la red: una URL de la red no se clica por fe.
  test('refuses a channel link that does not go to YouTube', async () => {
    global.fetch.mockResolvedValue(answer({ ...OEMBED, author_url: 'https://evil.example/pwn' }));
    expect(await fetchVideoCredit(ID)).toMatchObject({ author: 'Some Dungeoneer', authorUrl: '' });
  });

  test('refuses a channel link that is not even a link', async () => {
    // eslint-disable-next-line no-script-url
    global.fetch.mockResolvedValue(answer({ ...OEMBED, author_url: 'javascript:alert(1)' }));
    expect((await fetchVideoCredit(ID)).authorUrl).toBe('');
  });

  test('says nothing rather than showing an empty byline', async () => {
    global.fetch.mockResolvedValue(answer({ title: '', author_name: '' }));
    expect(await fetchVideoCredit(ID)).toBeNull();
  });
});
