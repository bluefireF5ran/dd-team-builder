import fs from 'fs';
import path from 'path';
import { parseDson, readFields, isDsonBuffer } from '../dson';
import { parseSaveProfile, buildProfile, readSaveFiles, toBuilderHero, SAVE_FILES } from '../saveParser';
import { validateHeroSchema } from '../validation';
import { HERO_CLASSES } from '../../data/heroes';

// A real profile, not a mock: four files out of `Documents/Darkest/profile_7`,
// week 4 of an ordinary campaign with nine living heroes. The point of using a
// real save is that the format's two traps — junk between a name and its
// value, and unaligned booleans — only show up in bytes the game wrote.
const FIXTURES = path.join(__dirname, 'fixtures', 'save');
const read = (name) => fs.readFileSync(path.join(FIXTURES, name));

const buffers = () => ({
  [SAVE_FILES.roster]: read(SAVE_FILES.roster),
  [SAVE_FILES.estate]: read(SAVE_FILES.estate),
  [SAVE_FILES.game]: read(SAVE_FILES.game),
  [SAVE_FILES.campaignLog]: read(SAVE_FILES.campaignLog),
  [SAVE_FILES.town]: read(SAVE_FILES.town)
});

describe('dson', () => {
  it('recognises a save file and rejects anything else', () => {
    expect(isDsonBuffer(read(SAVE_FILES.roster))).toBe(true);
    expect(isDsonBuffer(new Uint8Array([1, 2, 3]))).toBe(false);
    expect(isDsonBuffer(Buffer.from('{"heroes":[]}'))).toBe(false);
  });

  it('throws a readable error rather than returning nonsense', () => {
    expect(() => parseDson(Buffer.from('not a save file at all, but long enough'.repeat(4)))).toThrow(
      /bad magic number/
    );
  });

  it('rebuilds the tree from the object child counts', () => {
    const roster = parseDson(read(SAVE_FILES.roster));
    expect(Object.keys(roster)).toEqual([
      'version',
      'nextGuid',
      'dismissed_hero_count',
      'heroes',
      'last_party',
      'highest_resolve_xp'
    ]);
    expect(Object.keys(roster.heroes)).toHaveLength(9);
  });

  it('skips the junk the game leaves between a name and its value', () => {
    // Every field is framed, and each object's children are counted.
    expect(readFields(read(SAVE_FILES.roster))).toHaveLength(35);

    // `colour_variation`'s gap holds the tail of its own name ("ion"); reading
    // from the end of the name instead of the alignment boundary gives 6910707.
    const hero = parseDson(read(SAVE_FILES.roster)).heroes['1'].hero_file_data.raw_data;
    expect(hero.actor.colour_variation).toBe(0);
    expect(hero.actor.name).toBe('Reynauld');
    expect(hero.heroClass).toBe('crusader');
  });

  it('reads booleans, which are written unaligned', () => {
    const hero = parseDson(read(SAVE_FILES.roster)).heroes['1'].hero_file_data.raw_data;
    expect(hero.is_death_heart_attack_completed).toBe(false);
    expect(hero.visited_deaths_door).toBe(false);
    expect(parseDson(read(SAVE_FILES.game)).inraid).toBe(false);
  });

  it('decodes the save file nested inside each roster entry', () => {
    const roster = parseDson(read(SAVE_FILES.roster));
    // `raw_data` is a whole DSON document of its own, not a byte blob.
    expect(roster.heroes['2'].hero_file_data.raw_data.actor.name).toBe('Dismas');
  });

  it('reads floats only for the fields the game stores as floats', () => {
    const roster = parseDson(read(SAVE_FILES.roster));
    const dismas = roster.heroes['2'].hero_file_data.raw_data;
    expect(dismas.actor.current_hp).toBeCloseTo(27.6, 1);
    // `wallet.amount` is the counter-example: four bytes, but an integer.
    expect(parseDson(read(SAVE_FILES.estate)).wallet['0'].amount).toBe(7210);

    // persist.game.json's play timer is seconds, and reads as 1153022976 if
    // taken for an int - a plausible-looking counter that is nothing of the
    // sort. 1485s of play sits inside the save's 28-minute wall clock.
    expect(parseDson(read(SAVE_FILES.game)).totalelapsed).toBeCloseTo(1485.88, 1);
  });
});

describe('parseSaveProfile', () => {
  it('needs the roster file and says so', () => {
    expect(() => parseSaveProfile({ [SAVE_FILES.game]: read(SAVE_FILES.game) })).toThrow(
      /persist\.roster\.json/
    );
  });

  it('reads the living roster, duplicates and all', () => {
    const profile = parseSaveProfile(buffers());

    expect(profile.heroes.map((h) => h.name)).toEqual([
      'Reynauld',
      'Dismas',
      'Campbell',
      'Bele',
      'Tinel',
      'Briouse',
      'Boisivon',
      'Pastforeire',
      'Perroy'
    ]);
    // Two Plague Doctors are two heroes, not one class ticked once — the whole
    // reason the roster is a list rather than a set of class names.
    expect(profile.heroClassCounts['Plague Doctor']).toBe(2);
    expect(profile.heroClasses).toHaveLength(8);
  });

  it('does not offer heroes that are only mentioned elsewhere in the save', () => {
    const profile = parseSaveProfile(buffers());
    // "Brimou" is in the campaign log as a hero who went on a quest, and the
    // Stage Coach is full of recruits. Neither is on the roster, so neither is
    // importable — this is the bug that scanning for strings could not avoid.
    expect(profile.heroes.some((h) => h.name === 'Brimou')).toBe(false);
    expect(profile.heroes).toHaveLength(9);
  });

  it('resolves internal ids to the app names, with nothing left unmatched', () => {
    const profile = parseSaveProfile(buffers());

    expect(profile.unmatched).toEqual({
      heroClasses: [],
      skills: [],
      campSkills: [],
      quirks: [],
      trinkets: []
    });

    const reynauld = profile.heroes[0];
    expect(reynauld.heroClass).toBe('Crusader');
    expect(reynauld.activeSkills).toEqual([
      'Smite',
      'Zealous Accusation',
      'Stunning Blow',
      'Bulwark of Faith'
    ]);
    expect(reynauld.activeCampSkills).toEqual(['Encourage', 'Stand Tall', 'Zealous Speech']);
    // The same `first_aid` reads as "Wound Care" here and as "First Aid" on a
    // Fire's Edge class, because that is what each one's roster calls it.
    expect(profile.heroes.find((h) => h.name === 'Dismas').activeCampSkills).toContain('Wound Care');
    expect(reynauld.quirks.positive).toEqual(['Warrior of Light', 'Steady']);
    // The save says nothing about which of the three lists a quirk is on, so
    // the name decides: "God Fearing" is a negative quirk in the game.
    expect(reynauld.quirks.negative).toEqual(['God Fearing', 'Kleptomaniac', 'Perfectionist']);
  });

  it('bridges the ids the game renamed after shipping', () => {
    const profile = parseSaveProfile(buffers());
    const dismas = profile.heroes.find((h) => h.name === 'Dismas');
    // `opened_vein`, `take_aim` and `grape_shot_blast` cannot be derived from
    // the display names; `grape_shot_blast` falls out of the squashed-key rule,
    // the other two need src/data/gameIds.js.
    expect(dismas.activeSkills).toEqual([
      'Open Vein',
      'Pistol Shot',
      'Grapeshot Blast',
      'Tracking Shot'
    ]);
    expect(dismas.activeCampSkills).toEqual(['Wound Care', 'Clean Guns', "Bandit's Sense"]);

    const boisivon = profile.heroes.find((h) => h.name === 'Boisivon');
    expect(boisivon.activeCampSkills).toContain('The Cure');

    const tinel = profile.heroes.find((h) => h.name === 'Tinel');
    expect(tinel.activeSkills).toContain('Vulnerability Hex');
  });

  it('keeps every skill of an always-active class', () => {
    const profile = parseSaveProfile(buffers());
    const bele = profile.heroes.find((h) => h.name === 'Bele');
    expect(bele.heroClass).toBe('Duelist');
    // The Duelist fields all seven, and the four-skill cap must not trim her.
    expect(bele.activeSkills).toHaveLength(HERO_CLASSES.Duelist.skills.length);
    expect(bele.activeSkills).toContain('Coup de Grâce');
  });

  it('reads the estate details worth showing', () => {
    const profile = parseSaveProfile(buffers());
    expect(profile.estateName).toBe('Twilight');
    expect(profile.gameMode).toBe('base');
    expect(profile.week).toBe(4);
    expect(profile.inRaid).toBe(false);
    expect(profile.dlc).toContain('crimson_court');
    expect(profile.mods).toEqual(['1154908982']);
  });

  it('imports from the roster file alone', () => {
    const profile = parseSaveProfile({ [SAVE_FILES.roster]: read(SAVE_FILES.roster) });
    expect(profile.heroes).toHaveLength(9);
    expect(profile.estateName).toBe('');
    expect(profile.week).toBeNull();
    expect(profile.ownedTrinkets).toEqual([]);
  });

  it('accepts a full path as the key, the way a directory picker reports it', () => {
    const profile = parseSaveProfile({ 'profile_7/Persist.Roster.json': read(SAVE_FILES.roster) });
    expect(profile.heroes).toHaveLength(9);
  });
});

describe('toBuilderHero', () => {
  it('produces a hero the builder accepts as-is', () => {
    const profile = parseSaveProfile(buffers());
    profile.heroes.forEach((hero) => {
      const { valid, errors } = validateHeroSchema(toBuilderHero(hero));
      expect({ hero: hero.name, valid, errors }).toEqual({ hero: hero.name, valid: true, errors: [] });
    });
  });

  it('copies the lists rather than sharing them with the profile', () => {
    const profile = parseSaveProfile(buffers());
    const built = toBuilderHero(profile.heroes[0]);
    built.activeSkills.push('Holy Lance');
    built.quirks.positive.push('Gifted');
    expect(profile.heroes[0].activeSkills).not.toContain('Holy Lance');
    expect(profile.heroes[0].quirks.positive).not.toContain('Gifted');
  });
});

describe('readSaveFiles', () => {
  // What a directory picker hands over: File objects carrying the path they
  // were found at.
  const fileAt = (relativePath, lastModified = 0) => {
    const name = relativePath.split('/').pop();
    const file = new File([read(name)], name, { type: 'application/octet-stream' });
    Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
    Object.defineProperty(file, 'lastModified', { value: lastModified });
    return file;
  };

  it('ignores everything in the profile folder it has no use for', async () => {
    const buffers = await readSaveFiles([
      fileAt('profile_7/persist.roster.json'),
      fileAt('profile_7/persist.game.json'),
      new File([Buffer.from('x')], 'persist.upgrades.json'),
      new File([Buffer.from('x')], 'novelty_tracker.json')
    ]);
    expect(Object.keys(buffers).sort()).toEqual([SAVE_FILES.game, SAVE_FILES.roster]);
  });

  it('takes the profile, not the backup sitting inside it', async () => {
    // Same basename, one level deeper, and usually weeks older. Taking the last
    // match would silently import a save the player has moved on from.
    const buffers = await readSaveFiles([
      fileAt('profile_7/backup/persist.roster.json', 1000),
      fileAt('profile_7/persist.roster.json', 2000),
      fileAt('profile_7/backup/persist.game.json', 1000)
    ]);
    expect(Object.keys(buffers)).toEqual([SAVE_FILES.roster]);
    expect(parseSaveProfile(buffers).heroes).toHaveLength(9);
  });

  it('takes the most recently played profile when handed the whole Darkest folder', async () => {
    const buffers = await readSaveFiles([
      fileAt('Darkest/profile_1/persist.roster.json', 1000),
      fileAt('Darkest/profile_3/persist.roster.json', 5000),
      fileAt('Darkest/profile_3/persist.game.json', 5000)
    ]);
    expect(Object.keys(buffers).sort()).toEqual([SAVE_FILES.game, SAVE_FILES.roster]);
    expect(parseSaveProfile(buffers).estateName).toBe('Twilight');
  });

  it('still reports the missing roster when the folder holds none', async () => {
    const buffers = await readSaveFiles([fileAt('profile_7/persist.game.json')]);
    expect(() => parseSaveProfile(buffers)).toThrow(/persist\.roster\.json/);
  });
});

describe('the graveyard', () => {
  // A buried hero must never be offered as someone you can field, and the
  // roster file cannot say on its own: it records a status, an activity and a
  // missing-duration, and none of them marks a death.
  //
  // buildProfile takes decoded files, so these can hand it a town object with
  // graveyard records in it. There is no DSON encoder here, and every profile
  // available has an empty graveyard, so this is the only way to exercise it.
  const decoded = (townGraveyard) => ({
    roster: parseDson(read(SAVE_FILES.roster)),
    town: townGraveyard === undefined ? null : { buildings: { graveyard: townGraveyard } }
  });

  it('is empty in this profile, and the real town file changes nothing', () => {
    const profile = parseSaveProfile(buffers());
    expect(profile.graveyard).toEqual([]);
    expect(profile.heroes).toHaveLength(9);
  });

  it('drops a hero the graveyard names', () => {
    // The record layout is unverified, so the walk collects names and guids
    // from anywhere under the node rather than guessing at field names.
    const profile = buildProfile(
      decoded({ records: { 0: { hero_name: 'Campbell', class_id: 'plague_doctor', resolve_level: 2 } } })
    );
    expect(profile.heroes.map((h) => h.name)).not.toContain('Campbell');
    expect(profile.heroes).toHaveLength(8);
    expect(profile.graveyard).toEqual([{ guid: '9', name: 'Campbell', heroClass: 'Plague Doctor' }]);
  });

  it('finds the name however deeply the record nests it', () => {
    const profile = buildProfile(decoded({ a: { b: { c: [{ whatever: 'Boisivon' }] } } }));
    expect(profile.graveyard.map((h) => h.name)).toEqual(['Boisivon']);
  });

  it('drops a hero named only by guid', () => {
    // Guid 27 is Pastforeire.
    const profile = buildProfile(decoded({ records: { 0: { guid: 27 } } }));
    expect(profile.graveyard.map((h) => h.name)).toEqual(['Pastforeire']);
    expect(profile.heroes.map((h) => h.name)).not.toContain('Pastforeire');
  });

  it('buries several at once, matching how they died', () => {
    const profile = buildProfile(
      decoded({ rows: { 0: { name: 'Campbell' }, 1: { name: 'Pastforeire' }, 2: { guid: 26 } } })
    );
    expect(profile.graveyard.map((h) => h.name).sort()).toEqual([
      'Boisivon',
      'Campbell',
      'Pastforeire'
    ]);
    expect(profile.heroes).toHaveLength(6);
  });

  it('does not mistake a level or a week for a guid', () => {
    // The first version of the walk collected every integer, so a record with
    // resolve_level: 2 buried the hero with guid 2 - Dismas, who is alive.
    const profile = buildProfile(
      decoded({ records: { 0: { hero_name: 'Campbell', resolve_level: 2, week_died: 1 } } })
    );
    expect(profile.graveyard.map((h) => h.name)).toEqual(['Campbell']);
    expect(profile.heroes.map((h) => h.name)).toContain('Dismas');
    expect(profile.heroes.map((h) => h.name)).toContain('Reynauld');
  });

  it('takes the class count down with the hero', () => {
    // Two Plague Doctors become one, so a comp fielding two is no longer
    // offered - which is the whole point of excluding them.
    const profile = buildProfile(decoded({ records: { 0: { name: 'Campbell' } } }));
    expect(profile.heroClassCounts['Plague Doctor']).toBe(1);
  });

  it('keeps everyone when there is no town file to read', () => {
    const profile = buildProfile(decoded(undefined));
    expect(profile.heroes).toHaveLength(9);
    expect(profile.graveyard).toEqual([]);
  });

  it('is not upset by an empty graveyard node', () => {
    expect(buildProfile(decoded({})).heroes).toHaveLength(9);
  });
});
