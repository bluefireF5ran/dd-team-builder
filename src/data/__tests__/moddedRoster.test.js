import fs from 'fs';
import path from 'path';
import * as moddedHeroes from '../modded_heroes';
import {
  afterModdedRosterFor,
  getModdedHeroClasses,
  getModdedRosterVersion,
  heroesNeedModdedRoster,
  installModdedRoster,
  isModdedRosterLoaded,
  isPossiblyModdedClass,
  loadModdedRoster,
  memoByModdedRoster,
  resetModdedRosterForTests,
  subscribeModdedRoster
} from '../moddedRoster';
import { canonicalizeHeroClass } from '../../utils/nameNormalizer';
import { canEquip } from '../../utils/trinketSubstitution';
import { getHeroImagePath } from '../../utils/imageHelper';
import { loadTeamFromFile } from '../../utils/storageHelper';

// setupTests installs the roster for every suite; these start without it, the
// way the app does.
beforeEach(() => resetModdedRosterForTests());
afterAll(() => installModdedRoster(moddedHeroes));

const blankHero = () => ({
  heroClass: '',
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: []
});

describe('the modded roster registry', () => {
  it('is empty until loaded, then carries the real roster', async () => {
    expect(isModdedRosterLoaded()).toBe(false);
    expect(getModdedHeroClasses().Sibyl).toBeUndefined();

    await loadModdedRoster();

    expect(isModdedRosterLoaded()).toBe(true);
    expect(getModdedHeroClasses().Sibyl).toBe(moddedHeroes.MODDED_HERO_CLASSES.Sibyl);
  });

  it('fetches once however many callers ask at the same time', async () => {
    const heard = jest.fn();
    const unsubscribe = subscribeModdedRoster(heard);
    const before = getModdedRosterVersion();

    const [first, second] = await Promise.all([loadModdedRoster(), loadModdedRoster()]);
    unsubscribe();

    expect(first).toBe(second);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(getModdedRosterVersion()).toBe(before + 1);
  });

  it('rebuilds a derived value once the roster arrives, and not before', async () => {
    const build = jest.fn(() => Object.keys(getModdedHeroClasses()).length);
    const count = memoByModdedRoster(build);
    expect(count()).toBe(0);
    expect(count()).toBe(0);
    expect(build).toHaveBeenCalledTimes(1);

    await loadModdedRoster();

    expect(count()).toBeGreaterThan(600);
    expect(build).toHaveBeenCalledTimes(2);
  });

  it('tells a vanilla class from one that might be modded, spelling aside', () => {
    ['Leper', 'leper', 'Man-at-Arms', 'plague_doctor', 'Bounty Hunter'].forEach((name) =>
      expect(isPossiblyModdedClass(name)).toBe(false)
    );
    ['Sibyl', 'sibyl_ms', 'Leper (Rework)'].forEach((name) => expect(isPossiblyModdedClass(name)).toBe(true));
    expect(isPossiblyModdedClass('')).toBe(false);
    expect(heroesNeedModdedRoster([{ heroClass: 'Crusader' }, blankHero(), null])).toBe(false);
    expect(heroesNeedModdedRoster([{ heroClass: 'Crusader' }, { heroClass: 'Sibyl' }])).toBe(true);
  });

  it('runs a vanilla task at once, and a modded one only after the fetch', async () => {
    // Synchronous on purpose: loading a vanilla comp must stay as immediate as
    // it always was.
    expect(afterModdedRosterFor([{ heroClass: 'Vestal' }], () => 'done')).toBe('done');
    expect(isModdedRosterLoaded()).toBe(false);

    const seen = [];
    const pending = afterModdedRosterFor([{ heroClass: 'Sibyl' }], () => {
      seen.push(isModdedRosterLoaded());
      return 'sibyl';
    });
    expect(seen).toEqual([]);

    await expect(pending).resolves.toBe('sibyl');
    expect(seen).toEqual([true]);
  });
});

describe('what changes once the roster lands', () => {
  it('canonicalizes a modded class only with the roster', async () => {
    expect(canonicalizeHeroClass('sibyl')).toBe('sibyl');
    await loadModdedRoster();
    expect(canonicalizeHeroClass('sibyl')).toBe('Sibyl');
  });

  it('draws a modded portrait from the modded folder only with the roster', async () => {
    expect(getHeroImagePath('Sibyl')).not.toMatch(/\/modded\//);
    await loadModdedRoster();
    expect(getHeroImagePath('Sibyl')).toMatch(/\/modded\/heroes\//);
  });

  it('locks a modded class trinket to its class once the roster is there', async () => {
    await loadModdedRoster();
    const locked = moddedHeroes.MODDED_HERO_CLASSES.Sibyl.classSpecificTrinkets.find(
      (name) => !canEquip(name, 'Jester') && canEquip(name, 'Sibyl')
    );
    expect(locked).toBeTruthy();

    resetModdedRosterForTests();
    expect(canEquip(locked, 'Jester')).toBe(true);

    await loadModdedRoster();
    expect(canEquip(locked, 'Jester')).toBe(false);
  });

  it('reads a team file naming a modded class only after fetching the roster', async () => {
    const body = {
      teamName: 'Moon',
      location: 'The Ruins',
      heroes: [{ ...blankHero(), heroClass: 'sibyl' }, blankHero(), blankHero(), blankHero()]
    };
    const file = new File([JSON.stringify(body)], 'moon.json', { type: 'application/json' });

    const team = await loadTeamFromFile(file);

    expect(isModdedRosterLoaded()).toBe(true);
    expect(team.heroes[0].heroClass).toBe('Sibyl');
  });
});

describe('the bundle boundary', () => {
  // One static import of modded_heroes.js anywhere in the app puts all of it
  // back into main.js. Tests may import it; the app goes through moddedRoster.
  it('is crossed by no app module; the registry only imports it on demand', () => {
    const SRC = path.join(__dirname, '..', '..');
    const offenders = [];
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['__tests__', '__oracle__'].includes(entry.name)) walk(full);
          return;
        }
        if (!/\.jsx?$/.test(entry.name) || entry.name === 'setupTests.js') return;
        const text = fs.readFileSync(full, 'utf8');
        if (/from\s+['"][^'"]*modded_heroes['"]|require\(\s*['"][^'"]*modded_heroes['"]\s*\)/.test(text)) {
          offenders.push(path.relative(SRC, full));
        }
      });
    walk(SRC);
    expect(offenders).toEqual([]);
  });
});
