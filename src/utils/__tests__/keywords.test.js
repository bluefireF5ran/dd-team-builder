import { keywordSegments, KEYWORDS } from '../keywords';
import { KEYWORD_COLOURS } from '../../data/gameColours';

const marked = (text) => keywordSegments(text).filter((s) => s.keyword).map((s) => [s.text, s.keyword]);

describe('keywordSegments', () => {
  it('rebuilds the original text exactly', () => {
    const text = 'Mark Target (3 rds), -30 DODGE (140% base, 2 rds) | Self: Forward 1';
    expect(keywordSegments(text).map((s) => s.text).join('')).toBe(text);
  });

  it('links the two halves of a synergy by giving them the same keyword', () => {
    expect(marked('Mark Target (3 rds)')).toEqual([['Mark Target', 'mark']]);
    expect(marked('+100% DMG vs Marked, +13% CRIT vs Marked')).toEqual([
      ['Marked', 'mark'],
      ['Marked', 'mark'],
    ]);
    expect(marked('Stun (140% base)')).toEqual([['Stun', 'stun']]);
    expect(marked('+60% DMG vs Stunned')).toEqual([['Stunned', 'stun']]);
  });

  it('colours the condition inside a resistance, which is what ties a trinket to a skill', () => {
    expect(marked('+20% Blight Resist')).toEqual([['Blight', 'blight']]);
    expect(marked('+15% Bleed Resist')).toEqual([['Bleed', 'bleed']]);
  });

  it('conjugates the way the game writes it', () => {
    expect(marked('Remove Bleeding')).toEqual([['Bleeding', 'bleed']]);
    expect(marked('+25% DMG vs Blighted')).toEqual([['Blighted', 'blight']]);
    expect(marked('Heal 4-5 | +38% Healing Received')).toEqual([
      ['Heal', 'healhp'],
      ['Healing', 'healhp'],
    ]);
  });

  it('only calls Back and Forward a move when a distance follows, and a move of your own', () => {
    expect(marked('Self: Back 2')).toEqual([['Back', 'selfMove']]);
    expect(marked('Turn Back Time')).toEqual([]);
    expect(marked('Knockback 2 (140% base), Pull 2')).toEqual([
      ['Knockback', 'move'],
      ['Pull', 'move'],
    ]);
  });

  it('does not read Buff inside Debuff, or Stun inside a longer word', () => {
    expect(marked('+10% Debuff Skill Chance')).toEqual([['Debuff', 'debuff']]);
    expect(marked('Stunning Blow')).toEqual([]);
  });

  it('colours the second-round keywords as their own things', () => {
    expect(marked('Controlled Burn 5 pts/rd for 3 rds')).toEqual([['Controlled Burn', 'controlledBurn']]);
    expect(marked('Burn 4 pts/rd')).toEqual([['Burn', 'burn']]);
    expect(marked('Ignores Stealth | Removes Stealth')).toEqual([
      ['Ignores Stealth', 'bypass'],
      ['Removes Stealth', 'bypass'],
    ]);
    expect(marked('Self: Stealth (4 rds)')).toEqual([['Stealth', 'stealth']]);
    expect(marked('Self: Forward 1, +2 Block, +4 SPD')).toEqual([
      ['Forward', 'selfMove'],
      ['Block', 'block'],
    ]);
    expect(marked('Self: +6 Torch')).toEqual([['Torch', 'torch']]);
  });

  it('returns nothing for something that is not text', () => {
    expect(keywordSegments(null)).toEqual([]);
    expect(keywordSegments('')).toEqual([]);
  });

  it('has a game colour for every keyword it can produce', () => {
    KEYWORDS.forEach((k) => expect(KEYWORD_COLOURS[k]).toBeDefined());
  });
});
