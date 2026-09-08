import {
  parseRanks,
  getSkillRanks,
  isSkillUsableAt,
  heroRankReport,
  partyRankReport,
  rankWarnings
} from '../rankValidity';
import { EMPTY_HERO } from '../../constants';

const hero = (heroClass, activeSkills) => ({ ...EMPTY_HERO, heroClass, activeSkills });

describe('parseRanks', () => {
  it('reads the dot-separated form the data is written in', () => {
    expect(parseRanks('1·2·3·4')).toEqual([1, 2, 3, 4]);
    expect(parseRanks('3·4')).toEqual([3, 4]);
    expect(parseRanks('1')).toEqual([1]);
  });

  it('pulls the ranks out of the ally and self forms', () => {
    expect(parseRanks('ally 1·2·3·4 / self')).toEqual([1, 2, 3, 4]);
    expect(parseRanks('Self')).toEqual([]);
  });

  it('is not upset by nothing', () => {
    expect(parseRanks(undefined)).toEqual([]);
    expect(parseRanks('')).toEqual([]);
  });
});

describe('getSkillRanks', () => {
  it('reads real skills out of the generated data', () => {
    // Leper's Hew: a front-line swing, front-line only.
    expect(getSkillRanks('Leper', 'Hew')).toEqual({
      launch: [1, 2],
      target: [1, 2],
      kind: 'enemy'
    });
  });

  it('tells an ally-target skill from an enemy-target one', () => {
    expect(getSkillRanks('Vestal', 'Divine Grace').kind).toBe('ally');
    expect(getSkillRanks('Arbalest', 'Sniper Shot').kind).toBe('enemy');
  });

  it('returns null for a skill it has never heard of, rather than guessing', () => {
    expect(getSkillRanks('Leper', 'Not A Real Skill')).toBeNull();
    expect(getSkillRanks('Some Modded Class', 'Whatever')).toBeNull();
  });

  it('refuses camp skills, which have no rank at all', () => {
    expect(getSkillRanks('Crusader', 'Encourage')).toBeNull();
  });
});

describe('isSkillUsableAt', () => {
  it('answers the question the app never asked', () => {
    expect(isSkillUsableAt('Leper', 'Hew', 1)).toBe(true);
    expect(isSkillUsableAt('Leper', 'Hew', 4)).toBe(false);
    expect(isSkillUsableAt('Arbalest', 'Sniper Shot', 4)).toBe(true);
  });

  it('says null when it does not know', () => {
    expect(isSkillUsableAt('Leper', 'Not A Real Skill', 1)).toBeNull();
  });
});

describe('heroRankReport', () => {
  it('splits a hero\'s skills by where they are standing', () => {
    const leper = hero('Leper', ['Hew', 'Chop', 'Purge', 'Solemnity']);

    const front = heroRankReport(leper, 1);
    expect(front.unusable).toHaveLength(0);
    expect(front.usable.length).toBeGreaterThan(0);

    const back = heroRankReport(leper, 4);
    expect(back.usable).toHaveLength(0);
    expect(back.unusable.map((s) => s.name)).toEqual(['Hew', 'Chop', 'Purge', 'Solemnity']);
    // The report says where it *could* have been used from.
    expect(back.unusable[0].launch).toEqual([1, 2]);
  });

  it('counts only enemy reach, not healing reach', () => {
    // Divine Grace targets allies; it must not make the party look like it can
    // hit the enemy back line.
    const vestal = hero('Vestal', ['Divine Grace']);
    expect(heroRankReport(vestal, 3).reaches).toEqual([]);

    const arbalest = hero('Arbalest', ['Sniper Shot']);
    expect(heroRankReport(arbalest, 4).reaches).toEqual([2, 3, 4]);
  });

  it('files unrecognised skills as unknown, never as broken', () => {
    const report = heroRankReport(hero('Leper', ['Hew', 'Mystery Skill']), 1);
    expect(report.unknown).toEqual(['Mystery Skill']);
    expect(report.unusable).toHaveLength(0);
  });

  it('is quiet about an empty slot', () => {
    expect(heroRankReport({ ...EMPTY_HERO }, 1)).toEqual({
      rank: 1,
      usable: [],
      unusable: [],
      unknown: [],
      reaches: []
    });
  });
});

describe('partyRankReport', () => {
  it('reads index 0 as rank 1, front to back', () => {
    // Leper at the front is fine; the same Leper at index 3 is rank 4.
    const skills = ['Hew', 'Chop', 'Purge', 'Withstand'];
    const front = partyRankReport([hero('Leper', skills), null, null, null]);
    expect(front.perHero[0].rank).toBe(1);
    expect(front.perHero[0].unusable).toHaveLength(0);

    const back = partyRankReport([null, null, null, hero('Leper', skills)]);
    expect(back.perHero[3].rank).toBe(4);
    expect(back.perHero[3].unusable.length).toBeGreaterThan(0);
  });

  it('names the heroes who cannot act at all', () => {
    const party = [
      hero('Crusader', ['Smite']), // rank 1, launches from 1-2
      hero('Hellion', ['Wicked Hack']), // rank 2, launches from 1-2
      hero('Vestal', ['Judgement']), // rank 3, launches from 3-4
      hero('Leper', ['Hew', 'Chop']) // rank 4, launches from 1-2 only
    ];
    const report = partyRankReport(party);
    // A rank-4 Leper with only melee swings is the canonical mistake.
    expect(report.strandedHeroes.map((h) => h.heroClass)).toEqual(['Leper']);
  });

  it('reports the enemy ranks nothing reaches', () => {
    // Four front-line-only heroes: the enemy back line is untouchable.
    const melee = [
      hero('Leper', ['Hew']),
      hero('Crusader', ['Smite']),
      hero('Hellion', ['Wicked Hack']),
      hero('Abomination', ['Rake'])
    ];
    const report = partyRankReport(melee);
    expect(report.unreachable).toContain(4);
    expect(report.reachable).not.toContain(4);
  });

  it('stays silent about coverage until the party is full', () => {
    // Three empty slots is not a coverage problem, it is an unfinished party.
    const report = partyRankReport([hero('Leper', ['Hew']), null, null, null]);
    expect(report.unreachable).toEqual([]);
  });
});

describe('rankWarnings', () => {
  it('says nothing about a party that works', () => {
    // Iron Swan launches from rank 1 only, so the Hellion has to lead.
    const good = [
      hero('Hellion', ['Wicked Hack', 'Iron Swan']),
      hero('Crusader', ['Smite', 'Stunning Blow']),
      hero('Vestal', ['Dazzling Light', 'Divine Grace']),
      hero('Arbalest', ['Sniper Shot', 'Suppressing Fire'])
    ];
    expect(rankWarnings(good)).toEqual([]);
  });

  it('is specific about what is wrong and where', () => {
    const bad = [
      hero('Crusader', ['Smite']),
      hero('Hellion', ['Wicked Hack']),
      hero('Vestal', ['Judgement']),
      hero('Leper', ['Hew', 'Chop'])
    ];
    const warnings = rankWarnings(bad);
    const stranded = warnings.find((w) => w.kind === 'stranded');
    expect(stranded.text).toBe('Leper can use none of their 2 skills from rank 4.');
    expect(stranded.index).toBe(3);
  });

  it('counts partial breakage without crying wolf', () => {
    const party = [
      hero('Leper', ['Hew', 'Chop', 'Solemnity', 'Withstand']),
      hero('Crusader', ['Smite']),
      hero('Vestal', ['Dazzling Light']),
      hero('Arbalest', ['Sniper Shot'])
    ];
    // Everything the Leper has works from rank 1, so no warning for them.
    expect(rankWarnings(party).some((w) => w.heroClass === 'Leper')).toBe(false);
  });

  it('says nothing at all about an empty party', () => {
    expect(rankWarnings([])).toEqual([]);
    expect(rankWarnings(null)).toEqual([]);
  });
});
