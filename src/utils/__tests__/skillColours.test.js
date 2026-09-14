import { skillFrame, frameBackground } from '../skillColours';
import { EFFECT_COLOURS, effectColour, shade } from '../../data/gameColours';

const cats = (heroClass, skill) => skillFrame(heroClass, skill).categories;

// Los casos son los que Fran describio para la comp "Money Quartet: Rot":
// cuatro Antiquarian, cada skill con su color.
describe('what an Antiquarian skill is painted as', () => {
  it('greys a bread-and-butter hit with no effect', () => {
    expect(cats('Antiquarian', 'Nervous Stab')).toEqual(['plain']);
    expect(skillFrame('Antiquarian', 'Nervous Stab').background).toBe(EFFECT_COLOURS.plain);
  });

  it('paints Festering Vapours blight, then a darker blight for the resist it strips', () => {
    expect(cats('Antiquarian', 'Festering Vapours')).toEqual(['blight', 'resistDown:blight']);
    const { colours, background } = skillFrame('Antiquarian', 'Festering Vapours');
    expect(colours[0]).toBe(EFFECT_COLOURS.blight);
    expect(colours[1]).toBe(effectColour('resistDown:blight'));
    expect(background).toMatch(/^linear-gradient\(135deg/);
  });

  it('tells moving yourself apart from moving the enemy', () => {
    expect(cats('Antiquarian', 'Get Down!')).toEqual(['selfMove', 'buff']);
    expect(cats('Abomination', 'Slam')).toEqual(expect.arrayContaining(['enemyMove', 'selfMove']));
    expect(effectColour('selfMove')).not.toBe(effectColour('enemyMove'));
  });

  it('paints revealing an enemy as a bypass, apart from stealthing yourself and not as a cleanse', () => {
    expect(cats('Antiquarian', 'Flashpowder')).toEqual(['debuff', 'bypass']);
    expect(effectColour('bypass')).not.toBe(effectColour('stealth'));
  });

  it('paints Fortifying Vapours as a heal plus the resists it grants, lighter than the family', () => {
    expect(cats('Antiquarian', 'Fortifying Vapours')).toEqual(['heal', 'resistUp:blight', 'resistUp:bleed']);
    expect(effectColour('resistUp:blight')).not.toBe(EFFECT_COLOURS.blight);
  });

  it('paints Invigorating Vapours as a buff', () => {
    expect(cats('Antiquarian', 'Invigorating Vapours')).toEqual(['buff']);
  });

  it('paints Protect Me as guard and buff, and does not read its Mark as marking an enemy', () => {
    expect(cats('Antiquarian', 'Protect Me')).toEqual(['guard', 'buff']);
    expect(effectColour('guard')).not.toBe(effectColour('buff'));
  });
});

// La segunda ronda de Fran: lo que se quedaba sin color.
describe('what used to have no colour', () => {
  it('paints the price a skill makes you pay', () => {
    expect(cats('Jester', 'Finale')).toEqual(['selfMove', 'selfDebuff']);
    expect(cats('Hellion', 'Barbaric YAWP!')).toEqual(['stun', 'selfDebuff']);
    expect(cats('Flagellant', 'Redeem')).toEqual(['heal', 'selfDebuff']);
  });

  it('paints bleeding yourself apart from bleeding an enemy', () => {
    expect(cats('Flagellant', 'Reclaim')).toEqual(['heal', 'selfBleed']);
    expect(effectColour('selfBleed')).not.toBe(effectColour('bleed'));
  });

  it('paints the Shieldbreaker\'s Block, now that Serpent Sway says it', () => {
    expect(cats('Shieldbreaker', 'Serpent Sway')).toEqual(['block', 'selfMove', 'buff']);
  });

  it('paints Controlled Burn as its own thing beside the ordinary burn', () => {
    expect(cats('Runaway', 'Controlled Burn')).toEqual(['burn', 'controlledBurn', 'bypass', 'torch']);
    expect(effectColour('controlledBurn')).not.toBe(effectColour('burn'));
  });

  it('paints what feeds the burn, and +DMG per burn stack as extra damage', () => {
    expect(cats('Runaway', 'Firefly')).toEqual(['burn', 'burnBoost', 'torch']);
    expect(cats('Runaway', 'Backdraft')).toEqual(['burn', 'bypass', 'bonus']);
  });

  it('reads Party: as your side and Ignores/Removes Stealth as a bypass', () => {
    expect(cats('Runaway', 'Hearthlight')).toEqual(['bypass', 'buff', 'torch', 'bonus']);
  });

  it('reads armour piercing and crits received', () => {
    expect(cats('Shieldbreaker', 'Pierce')).toEqual(['bypass', 'selfMove']);
    expect(cats('Shieldbreaker', 'Expose')).toEqual(['debuff', 'bypass', 'selfMove']);
  });
});

describe('the rest of the vocabulary', () => {
  it('gives a payoff its own colour', () => {
    expect(cats('Arbalest', 'Sniper Shot')).toEqual(['bonus']);
  });

  it('reads a mark on an enemy as a mark, with what else it does', () => {
    expect(cats('Bounty Hunter', 'Mark for Death')).toEqual(['mark', 'debuff', 'buff']);
    expect(effectColour('mark')).not.toBe(effectColour('bleed'));
  });

  it('paints a stun', () => {
    expect(cats('Crusader', 'Stunning Blow')).toEqual(['stun']);
  });

  it('is plain for a skill it does not know', () => {
    expect(cats('Nobody', 'Nothing')).toEqual(['plain']);
  });
});

/**
 * Fran vio el stun y la antorcha casi iguales, y el daño extra cerca de los
 * dos. Se mide en Lab (CIE76), que es suficiente para decir "se distinguen".
 */
describe('colours that must not be confused', () => {
  const lab = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const lin = (c) => { c /= 255; return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92; };
    const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(lin);
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
    const Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
    const Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  };
  const distance = (a, b) => {
    const [p, q] = [lab(effectColour(a)), lab(effectColour(b))];
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  };

  it.each([
    ['stun', 'torch'],
    ['stun', 'bonus'],
    ['torch', 'bonus'],
    ['burn', 'torch'],
    ['burn', 'controlledBurn'],
    ['bleed', 'mark'],
    ['heal', 'blight'],
    ['stealth', 'riposte'],
    ['buff', 'guard'],
    ['block', 'guard'],
    ['debuff', 'selfDebuff'],
  ])('%s and %s', (a, b) => {
    expect(distance(a, b)).toBeGreaterThan(20);
  });
});

describe('frameBackground', () => {
  it('is a flat colour for one effect and a diagonal split for more', () => {
    expect(frameBackground(['#111111'])).toBe('#111111');
    expect(frameBackground(['#111111', '#222222'])).toBe(
      'linear-gradient(135deg, #111111 0%, #111111 62%, #222222 78%, #222222 100%)'
    );
    expect(frameBackground(['#1', '#2', '#3'])).toMatch(/#1 0%.*#2 54%.*#3 100%/);
    expect(frameBackground([])).toBe(EFFECT_COLOURS.plain);
  });

  it('shades a resist from its family', () => {
    expect(effectColour('resistDown:blight')).toBe(shade(EFFECT_COLOURS.blight, -0.35));
  });
});
