import { analyzeSynergy } from '../synergyHelper';
import { rankWarnings } from '../rankValidity';
import { PRESET_COMP_ENTRIES } from '../../data/presetComps';
import { EMPTY_HERO } from '../../constants';

const party = (...specs) =>
  Array.from({ length: 4 }, (_, i) => {
    const spec = specs[i];
    if (!spec) return { ...EMPTY_HERO };
    const [heroClass, activeSkills = []] = spec;
    return { ...EMPTY_HERO, heroClass, activeSkills };
  });

describe('analyzeSynergy', () => {
  test('says nothing about an empty team', () => {
    const result = analyzeSynergy(party());
    expect(result.level).toBe('good');
    expect(result.notes).toHaveLength(0);
  });

  test('says nothing about a single hero who can fight', () => {
    const result = analyzeSynergy(party(['Crusader', ['Smite', 'Stunning Blow']]));
    expect(result.level).toBe('good');
    expect(result.warnings).toHaveLength(0);
  });

  describe('a hero who cannot act', () => {
    test('is the one thing worth a warning', () => {
      const heroes = party(
        ['Crusader', ['Smite']],
        ['Hellion', ['Wicked Hack']],
        ['Vestal', ['Judgement']],
        ['Leper', ['Hew', 'Chop']] // rank 4, and both swings launch from 1-2
      );
      const result = analyzeSynergy(heroes);
      expect(result.level).toBe('danger');
      expect(result.warnings).toEqual(['Leper can use none of their 2 skills from rank 4.']);
    });

    test('is called out before the party is even half built', () => {
      // One misplaced hero is already wrong; waiting for a fourth to say so
      // would be waiting until it is harder to fix.
      const heroes = party(null, null, null, ['Leper', ['Hew']]);
      expect(analyzeSynergy(heroes).level).toBe('danger');
      expect(analyzeSynergy(heroes).warnings[0]).toContain('rank 4');
    });

    test('is not confused with a hero who has no skills chosen yet', () => {
      expect(analyzeSynergy(party(['Leper', []])).warnings).toHaveLength(0);
    });
  });

  describe('what it deliberately no longer says', () => {
    // Every one of these fired on preset comps that work. See the file header
    // in synergyHelper.js for the counts.
    test('duplicate classes are a strategy, not a mistake', () => {
      const quartet = party(
        ['Crusader', ['Smite', 'Stunning Blow', 'Holy Lance', 'Inspiring Cry']],
        ['Crusader', ['Smite', 'Stunning Blow', 'Holy Lance', 'Inspiring Cry']],
        ['Crusader', ['Smite', 'Battle Heal', 'Holy Lance', 'Inspiring Cry']],
        ['Crusader', ['Smite', 'Battle Heal', 'Holy Lance', 'Inspiring Cry']]
      );
      expect(analyzeSynergy(quartet).notes).toHaveLength(0);
    });

    test('a party with no Vestal and no Occultist is left alone', () => {
      const heroes = party(
        ['Hellion', ['Wicked Hack', 'Iron Swan']],
        ['Crusader', ['Smite', 'Stunning Blow']],
        ['Grave Robber', ['Lunge', 'Poison Darts']],
        ['Arbalest', ['Sniper Shot', 'Suppressing Fire']]
      );
      expect(analyzeSynergy(heroes).warnings).toHaveLength(0);
    });

    test('two healers is not an accusation', () => {
      const heroes = party(
        ['Crusader', ['Smite', 'Stunning Blow']],
        ['Hellion', ['Wicked Hack', 'Iron Swan']],
        ['Vestal', ['Judgement', 'Divine Grace']],
        ['Occultist', ['Sacrificial Stab', 'Wyrd Reconstruction']]
      );
      expect(analyzeSynergy(heroes).warnings).toHaveLength(0);
    });

    test('a party that only threatens the enemy front line is left alone', () => {
      // A Lunge quartet kills what is in front and lets the back walk forward.
      const heroes = party(
        ['Grave Robber', ['Pick to the Face', 'Lunge', 'Shadow Fade', 'Toxin Trickery']],
        ['Grave Robber', ['Pick to the Face', 'Lunge', 'Shadow Fade', 'Toxin Trickery']],
        ['Grave Robber', ['Pick to the Face', 'Lunge', 'Shadow Fade', 'Toxin Trickery']],
        ['Grave Robber', ['Pick to the Face', 'Lunge', 'Shadow Fade', 'Toxin Trickery']]
      );
      expect(analyzeSynergy(heroes).warnings).toHaveLength(0);
    });
  });

  describe('mark synergy', () => {
    test('reads the equipped skills, not the class names', () => {
      const heroes = party(
        ['Crusader', ['Smite', 'Stunning Blow']],
        ['Bounty Hunter', ['Mark for Death', 'Collect Bounty']],
        ['Vestal', ['Judgement', 'Divine Grace']],
        ['Arbalest', ['Sniper Shot', "Sniper's Mark"]]
      );
      expect(analyzeSynergy(heroes).insights[0]).toMatch(/^Mark synergy:/);
    });

    test('stays quiet when the classes are there but the skills are not', () => {
      // The old version congratulated this party. Neither hero can mark.
      const heroes = party(
        ['Crusader', ['Smite', 'Stunning Blow']],
        ['Bounty Hunter', ['Uppercut', 'Flashbang']],
        ['Vestal', ['Judgement', 'Divine Grace']],
        ['Arbalest', ['Suppressing Fire', 'Battlefield Bandage']]
      );
      expect(analyzeSynergy(heroes).insights).toHaveLength(0);
    });

    test('does not count the Antiquarian painting an ally for cover', () => {
      // Protect Me says "Mark Target" too, but the target is an ally.
      const heroes = party(
        ['Highwayman', ['Pistol Shot', 'Open Vein']],
        ['Antiquarian', ['Protect Me', 'Festering Vapours']],
        ['Vestal', ['Judgement', 'Divine Grace']],
        ['Arbalest', ['Suppressing Fire', 'Battlefield Bandage']]
      );
      expect(analyzeSynergy(heroes).insights).toHaveLength(0);
    });

    test('is an insight, never a warning', () => {
      const heroes = party(
        ['Crusader', ['Smite', 'Stunning Blow']],
        ['Bounty Hunter', ['Mark for Death', 'Collect Bounty']],
        ['Vestal', ['Judgement', 'Divine Grace']],
        ['Arbalest', ['Sniper Shot', "Sniper's Mark"]]
      );
      const result = analyzeSynergy(heroes);
      expect(result.level).toBe('good');
      expect(result.warnings).toHaveLength(0);
    });
  });
});

/**
 * The line this whole rework was drawn against. `data/presetComps` is a
 * library of teams that are known to work, so anything the warning system says
 * about one of them is the warning system being wrong. The old rules had
 * something to complain about in 170 of the 177.
 */
describe('the preset comps are valid, and the warnings must agree', () => {
  test('there are presets to check', () => {
    expect(PRESET_COMP_ENTRIES.length).toBeGreaterThan(100);
  });

  test.each(PRESET_COMP_ENTRIES.map(({ key, data }) => [key, data]))(
    '%s draws no warning',
    (key, data) => {
      expect(analyzeSynergy(data.heroes).warnings).toEqual([]);
      expect(rankWarnings(data.heroes)).toEqual([]);
    }
  );
});
