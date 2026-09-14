import { skillSynergies, synergyLines, payoffsOf, enablersOf } from '../skillSynergy';
import { skillHover } from '../hoverInfo';

const hero = (heroClass, activeSkills = []) => ({ heroClass, activeSkills });

describe('the two halves', () => {
  it('reads a payoff from the effect text and an enabler from the skill profile', () => {
    expect(payoffsOf('Arbalest', 'Sniper Shot')).toEqual(['mark']);
    expect(enablersOf('Bounty Hunter', 'Mark for Death')).toEqual(['mark']);
    expect(payoffsOf('Bounty Hunter', 'Finish Him')).toEqual(['stun']);
    expect(enablersOf('Crusader', 'Stunning Blow')).toEqual(['stun']);
  });

  it('does not call a payoff an enabler', () => {
    // "+60% DMG vs Stunned" no aturde, "+100% DMG vs Marked" no marca.
    expect(enablersOf('Bounty Hunter', 'Finish Him')).toEqual([]);
    expect(enablersOf('Arbalest', 'Sniper Shot')).toEqual([]);
  });

  it('finds nothing on a camp skill or an unknown skill', () => {
    expect(payoffsOf('Arbalest', 'Encourage')).toEqual([]);
    expect(payoffsOf('Arbalest', 'Nonexistent')).toEqual([]);
  });
});

describe('skillSynergies', () => {
  const party = [
    hero('Crusader', ['Stunning Blow', 'Smite']),
    hero('Bounty Hunter', ['Mark for Death', 'Finish Him', 'Collect Bounty']),
    hero('Arbalest', ['Sniper Shot']),
    hero('Vestal'),
  ];

  it('tells a payoff who sets it up, across heroes', () => {
    expect(skillSynergies(party, 2, 'Sniper Shot')).toEqual([
      {
        keyword: 'mark',
        role: 'payoff',
        partners: [{ heroIndex: 1, heroClass: 'Bounty Hunter', skill: 'Mark for Death', self: false }],
      },
    ]);
  });

  it('tells an enabler every skill that cashes it in, including its own hero', () => {
    const [mark] = skillSynergies(party, 1, 'Mark for Death');
    expect(mark.role).toBe('enabler');
    expect(mark.partners.map((p) => `${p.heroClass}:${p.skill}:${p.self}`)).toEqual([
      'Bounty Hunter:Collect Bounty:true',
      'Arbalest:Sniper Shot:false',
    ]);
  });

  it('links stun the same way as mark', () => {
    expect(skillSynergies(party, 0, 'Stunning Blow')[0]).toMatchObject({
      keyword: 'stun',
      role: 'enabler',
      partners: [{ heroClass: 'Bounty Hunter', skill: 'Finish Him' }],
    });
  });

  it('judges only the skills actually chosen, never a class kit', () => {
    // La Vestal no lleva nada elegido; un Bounty Hunter sin skills tampoco marca.
    const bare = [hero('Bounty Hunter'), hero('Arbalest', ['Sniper Shot'])];
    expect(skillSynergies(bare, 1, 'Sniper Shot')).toEqual([]);
  });

  it('says nothing for a skill with no partner, or an empty slot', () => {
    expect(skillSynergies(party, 0, 'Smite')).toEqual([]);
    expect(skillSynergies(party, 3, 'Judgement')).toEqual([]);
    expect(skillSynergies([], 0, 'Smite')).toEqual([]);
  });
});

describe('what the hover says', () => {
  const party = [
    hero('Bounty Hunter', ['Mark for Death']),
    hero('Arbalest', ['Sniper Shot', "Sniper's Mark"]),
  ];

  it('names the partner, and calls the hero\'s own skill "own"', () => {
    expect(synergyLines(skillSynergies(party, 1, 'Sniper Shot'))).toEqual([
      "Synergy: Mark set up by Bounty Hunter (Mark for Death), own Sniper's Mark",
    ]);
  });

  it('appears on the skill hover only when the party is given', () => {
    const withParty = skillHover('Sniper Shot', 'Arbalest', { party, heroIndex: 1 });
    expect(withParty.lines.some((l) => /^Synergy: Mark set up by/.test(l))).toBe(true);
    const alone = skillHover('Sniper Shot', 'Arbalest');
    expect(alone.lines.some((l) => /^Synergy/.test(l))).toBe(false);
  });
});
