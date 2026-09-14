import { skillHover } from '../hoverInfo';

// El hover dice la tirada y el critico total, no los modificadores de la skill.
// Crusader a equipo maximo: DMG 10-19, CRIT 7% (heroStats.js), +1% CRIT de la
// luz radiante con el Cartographer's Camp (Darkest). Ningun distrito le da DMG
// ni CRIT.
describe('skillHover — the roll, not the modifier', () => {
  it('turns +0% DMG and +4% CRIT into the Crusader\'s own numbers', () => {
    const card = skillHover('Smite', 'Crusader');
    expect(card.subtitle).toBe('DMG 10-19 · ACC 105% · CRIT 12%');
  });

  it('rounds a reduced roll up, the way the game rounds hero damage', () => {
    // -50%: 10 -> 5, 19 -> 9.5 -> 10.
    expect(skillHover('Stunning Blow', 'Crusader').subtitle).toMatch(/^DMG 5-10 · /);
  });

  it("adds the hero's +% DMG to the skill's modifier instead of multiplying the two", () => {
    // Lock of Fury, +10% DMG. On Stunning Blow (-50%) that is -40% of the base:
    // 10 x 0.6 = 6 and 19 x 0.6 = 11.4 -> 12. Multiplying would roll the
    // trinket first (11-21) and halve that, 6-11.
    const hero = { heroClass: 'Crusader', trinket1: 'Lock of Fury' };
    expect(skillHover('Stunning Blow', 'Crusader', { hero }).subtitle).toMatch(/^DMG 6-12 · /);
    // At +0% the two readings agree: 11-21.
    expect(skillHover('Smite', 'Crusader', { hero }).subtitle).toMatch(/^DMG 11-21 · /);
  });

  it('says nothing about damage or crit on a skill that does not roll', () => {
    const card = skillHover('Battle Heal', 'Crusader');
    expect(card.subtitle || '').not.toMatch(/DMG|CRIT/);
  });

  it('hands the type and ranks to the card to draw, instead of spelling them out', () => {
    const card = skillHover('Smite', 'Crusader');
    expect(card.kind).toBe('Melee');
    expect(card.ranks).toEqual({ launch: [1, 2], target: [1, 2], targetKind: 'enemy', aoe: false });
    expect(card.subtitle).not.toMatch(/from|hits|Melee/);
  });

  it('gives a camp skill no type and no ranks', () => {
    const card = skillHover('Encourage', 'Crusader');
    expect(card.kind).toBeNull();
    expect(card.ranks).toBeNull();
    expect(card.subtitle).toBe('2 time');
  });
});
