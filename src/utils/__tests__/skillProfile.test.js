import { skillProfile, classProfile } from '../skillProfile';
import { HERO_CLASSES } from '../../data/heroes';

const tags = (cls, skill) => [...(skillProfile(cls, skill)?.tags || [])].sort();

describe('skillProfile', () => {
  it('knows nothing about a skill this app has no data for', () => {
    expect(skillProfile('Crusader', 'Not A Skill')).toBeNull();
    expect(skillProfile('No Such Class', 'Smite')).toBeNull();
  });

  it('reads the plain mechanics off the effect text', () => {
    expect(tags('Crusader', 'Stunning Blow')).toContain('stun');
    expect(tags('Plague Doctor', 'Noxious Blast')).toContain('blight');
    expect(tags('Hellion', 'Wicked Hack')).toContain('damage');
    expect(tags('Highwayman', 'Open Vein')).toContain('bleed');
    expect(tags('Arbalest', "Sniper's Mark")).toContain('mark');
    expect(tags('Vestal', 'Divine Grace')).toContain('heal');
  });

  describe('the three easy false positives', () => {
    it('does not call a resistance buff the thing it resists', () => {
      // Antiquarian: "+15% Bleed Resist, +15% Blight Resist" no sangra a nadie.
      const t = tags('Antiquarian', 'Fortifying Vapours');
      expect(t).not.toContain('bleed');
      expect(t).not.toContain('blight');
    });

    it('does not call a conditional bonus the condition', () => {
      // Bounty Hunter: "+60% DMG vs Stunned" no aturde; "vs Marked" no marca.
      expect(tags('Bounty Hunter', 'Collect Bounty')).not.toContain('stun');
      expect(tags('Arbalest', 'Sniper Shot')).not.toContain('mark');
      expect(tags('Arbalest', 'Sniper Shot')).toContain('markPayoff');
    });

    it('does not call clearing a thing applying it', () => {
      // Arbalest Rallying Flare: "Other Heroes: [Clear Stun, Clear Marked
      // Target]" quita las dos cosas, no las pone.
      const flare = tags('Arbalest', 'Rallying Flare');
      expect(flare).not.toContain('stun');
      expect(flare).not.toContain('mark');
      expect(flare).toContain('cleanse');

      // Plague Doctor Battlefield Medicine: "Cure Blight/Bleed".
      const medicine = tags('Plague Doctor', 'Battlefield Medicine');
      expect(medicine).not.toContain('blight');
      expect(medicine).not.toContain('bleed');
      expect(medicine).toContain('cleanse');
      expect(medicine).toContain('heal');
    });
  });

  describe('the clause prefix decides who it lands on', () => {
    it('separates stress healed from stress paid, in the same skill', () => {
      // Abomination Transform: "Other Heroes: Stress +8" es un coste que paga
      // el equipo. Absolution, en cambio, es "Self: Stress -10".
      expect(tags('Abomination', 'Transform')).toContain('stressCost');
      expect(tags('Abomination', 'Transform')).not.toContain('stressHeal');
      expect(tags('Abomination', 'Absolution')).toContain('stressHeal');
    });

    it('tells moving yourself from moving the enemy', () => {
      expect(tags('Antiquarian', 'Get Down!')).toContain('selfMove');
      expect(tags('Arbalest', 'Bola')).toContain('enemyMove');
      expect(tags('Arbalest', 'Bola')).not.toContain('selfMove');
    });

    it('marking yourself is not marking the enemy', () => {
      const t = tags('Man at Arms', 'Bolster');
      expect(t).not.toContain('mark');
    });
  });

  it('reads ranks rank-1-first, matching the rest of the app', () => {
    // Arbalest Sniper Shot: se lanza desde 3-4 y llega a 2-3-4.
    const shot = skillProfile('Arbalest', 'Sniper Shot');
    expect(shot.launch).toEqual([3, 4]);
    expect(shot.target).toEqual([2, 3, 4]);
    expect(shot.targetKind).toBe('enemy');
  });

  it('a heal that reaches allies is not damage to a target', () => {
    const grace = skillProfile('Vestal', 'Divine Grace');
    expect(grace.targetKind).toBe('ally');
    expect(grace.tags.has('heal')).toBe(true);
    expect(grace.tags.has('healTarget')).toBe(false);
  });

  it('covers every vanilla combat skill', () => {
    const missing = [];
    Object.entries(HERO_CLASSES).forEach(([cls, data]) => {
      (data.skills || []).forEach((skill) => {
        if (!skillProfile(cls, skill)) missing.push(`${cls} :: ${skill}`);
      });
    });
    expect(missing).toEqual([]);
  });
});

describe('classProfile', () => {
  const profileOf = (cls) => classProfile(cls, HERO_CLASSES[cls].skills);

  it('counts what the class can launch from each rank', () => {
    // El Leper es el caso extremo: casi todo su kit sale de rango 1.
    const leper = profileOf('Leper');
    expect(leper.launchableByRank[1].length).toBe(7);
    expect(leper.launchableByRank[4].length).toBe(1);

    // La Arbalest es el espejo.
    const arbalest = profileOf('Arbalest');
    expect(arbalest.launchableByRank[4].length).toBe(7);
    expect(arbalest.launchableByRank[1].length).toBe(2);
  });

  it('finds the dancers by their own movement, not by a list', () => {
    // Estas se colocan solas, asi que la regla de rango no las juzga igual.
    ['Shieldbreaker', 'Jester', 'Grave Robber', 'Highwayman', 'Hellion',
      'Crusader', 'Man at Arms', 'Abomination', 'Antiquarian'].forEach((cls) => {
      expect(profileOf(cls).isDancer).toBe(true);
    });
  });

  it('does not call a class a dancer for moving the enemy', () => {
    ['Arbalest', 'Vestal', 'Leper', 'Plague Doctor', 'Occultist'].forEach((cls) => {
      expect(profileOf(cls).isDancer).toBe(false);
    });
  });
});
