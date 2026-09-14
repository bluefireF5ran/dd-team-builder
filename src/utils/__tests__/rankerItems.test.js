import { buildItems } from '../rankerItems';
import { skillHover } from '../hoverInfo';

// Skills are pooled by name, and the card draws a shared name as its first
// owner uses it. Armor and Leper (Rework) are modded classes with a Chop of
// their own and no imported stats.
describe('buildItems — a skill name several classes share', () => {
  const chopFrom = (roster) => buildItems('skills', roster).find((item) => item.name === 'Chop');

  it('puts the vanilla owner first, whatever order the roster lists', () => {
    const chop = chopFrom(['Armor', 'Leper (Rework)', 'Leper']);
    expect(chop.classes).toEqual(['Leper', 'Armor', 'Leper (Rework)']);
    expect(chop.modded).toBe(false);
    expect(chop.subtitle).toBe('Shared — 3 classes');
  });

  it("so the card rolls the Leper's own damage", () => {
    const [owner] = chopFrom(['Armor', 'Leper']).classes;
    expect(skillHover('Chop', owner).subtitle).toMatch(/^DMG 13-26 · /);
  });

  it('keeps roster order among the modded owners', () => {
    expect(chopFrom(['Leper (Rework)', 'Armor', 'Leper']).classes).toEqual(['Leper', 'Leper (Rework)', 'Armor']);
  });
});
