import {
  skillAlwaysHits, skillAccuracy, skillChanceBonuses, ALWAYS_HITS_AT,
} from '../skillAccuracy';
import { skillHover } from '../hoverInfo';
import { COMBAT_SKILL_EFFECTS } from '../../data/skillEffects';

const hero = (over = {}) => ({
  heroClass: 'Crusader',
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: [],
  ...over,
});

const entry = (cls, name) => COMBAT_SKILL_EFFECTS[cls][name];

describe('the skills that make no attack roll', () => {
  /**
   * `ACC 1000%` no es una punteria, es como la fuente dice "aqui no hay
   * tirada". Las 35 que lo llevan tambien traen `dmg -100%` y ningun CRIT: son
   * las curaciones, los buffs y los guards.
   */
  it('reads the sentinel as "no attack roll"', () => {
    expect(skillAlwaysHits(entry('Crusader', 'Battle Heal'))).toBe(true);
    expect(skillAlwaysHits(entry('Crusader', 'Bulwark of Faith'))).toBe(true);
  });

  it('leaves an ordinary attack alone', () => {
    expect(skillAlwaysHits(entry('Crusader', 'Smite'))).toBe(false);
    expect(skillAlwaysHits(entry('Crusader', 'Stunning Blow'))).toBe(false);
  });

  /**
   * El CSV etiqueta `Aimed Shot` del Mosquetero como `Ally/Team` y le da 115%
   * de punteria: es un ataque mal clasificado. Leer la ACC en vez del tipo es
   * lo que hace que la regla sobreviva a esa fila.
   */
  it('is not fooled by a mislabelled support skill', () => {
    const aimed = entry('Musketeer', 'Aimed Shot');
    expect(aimed.type).toBe('Ally/Team');
    expect(skillAlwaysHits(aimed)).toBe(false);
  });

  it('every sentinel skill also carries the other two placeholders', () => {
    const odd = [];
    Object.entries(COMBAT_SKILL_EFFECTS).forEach(([cls, skills]) => {
      Object.entries(skills).forEach(([name, e]) => {
        if (!skillAlwaysHits(e)) return;
        if (e.dmg !== '-100%') odd.push(`${cls}/${name}: dmg ${e.dmg}`);
        if (e.crit && e.crit !== '+0%') odd.push(`${cls}/${name}: crit ${e.crit}`);
      });
    });
    expect(odd).toEqual([]);
  });

  it('uses a threshold well above any real accuracy in the game', () => {
    const real = [];
    Object.values(COMBAT_SKILL_EFFECTS).forEach((skills) => {
      Object.values(skills).forEach((e) => {
        const n = Number(String(e.acc || '').replace('%', ''));
        if (Number.isFinite(n) && n < ALWAYS_HITS_AT) real.push(n);
      });
    });
    expect(Math.max(...real)).toBeLessThan(ALWAYS_HITS_AT);
  });
});

describe('the hover card', () => {
  it('says nothing about accuracy on a skill that cannot miss', () => {
    const card = skillHover('Battle Heal', 'Crusader');
    expect(card.subtitle).not.toMatch(/ACC/);
    expect(card.subtitle).not.toMatch(/1000/);
  });

  // Los otros dos marcadores de posicion tampoco: `-100% DMG` y `+0% CRIT` en
  // una curacion invitan a compararlos con los numeros de la skill de al lado.
  it('drops the DMG and CRIT placeholders with it', () => {
    const card = skillHover('Battle Heal', 'Crusader');
    expect(card.subtitle).not.toMatch(/DMG/);
    expect(card.subtitle).not.toMatch(/CRIT/);
  });

  it('keeps every number on a real attack', () => {
    const card = skillHover('Smite', 'Crusader');
    expect(card.subtitle).toMatch(/ACC 105%/);
    expect(card.subtitle).toMatch(/CRIT/);
  });
});

describe('what the hero does to a skill', () => {
  it('shows the accuracy the hero actually has', () => {
    // `Focus Ring` es "+10 ACC | +5% CRIT | -8 DODGE".
    const card = skillHover('Smite', 'Crusader', { hero: hero({ trinket1: 'Focus Ring' }) });
    expect(card.subtitle).toMatch(/ACC 115%/);
    expect(card.subtitle).toMatch(/105%/);
    expect(card.lines.join(' ')).toMatch(/\+10 ACC — Focus Ring/);
  });

  it('leaves the printed accuracy alone when the hero carries nothing', () => {
    const card = skillHover('Smite', 'Crusader', { hero: hero() });
    expect(card.subtitle).toMatch(/ACC 105%/);
    expect(card.subtitle).not.toMatch(/\(/);
  });

  /**
   * Un `+10% Stun Skill Chance` solo cuenta en una skill que aturde. Las
   * etiquetas de `skillProfile` son las que dicen cuales.
   */
  it('shows a chance bonus only on a skill it applies to', () => {
    const withStone = hero({ trinket1: 'Stun Stone' });
    const stuns = skillHover('Stunning Blow', 'Crusader', { hero: withStone });
    const doesNot = skillHover('Smite', 'Crusader', { hero: withStone });
    expect(stuns.lines.join(' ')).toMatch(/\+10% Stun Chance — Stun Stone/);
    expect(doesNot.lines.join(' ')).not.toMatch(/Stun Chance/);
  });

  it('adds two sources of the same bonus together', () => {
    const both = hero({ trinket1: 'Stun Stone', trinket2: 'Dazzling Charm' });
    const rows = skillChanceBonuses(entry('Crusader', 'Stunning Blow'), 'Crusader', 'Stunning Blow', both);
    expect(rows).toEqual([expect.objectContaining({ label: 'Stun', amount: 20 })]);
    expect(rows[0].sources).toEqual(['Stun Stone', 'Dazzling Charm']);
  });

  /**
   * Una clausula condicional es cierta a veces. Sumarla al total afirmaria algo
   * falso, asi que se deja fuera, igual que en `heroStatLine`.
   */
  it('does not fold a conditional accuracy bonus into the total', () => {
    const acc = skillAccuracy(entry('Crusader', 'Smite'), hero({ trinket1: 'Camouflage Cloak' }));
    expect(acc.delta).toBe(0);
  });

  it('returns null for a camp skill, which has no accuracy at all', () => {
    expect(skillAccuracy({ kind: 'camp', cost: 2 }, hero())).toBeNull();
    expect(skillChanceBonuses({ kind: 'camp' }, 'Crusader', 'Encourage', hero())).toEqual([]);
  });
});

/**
 * El caso que destapo el fallo, tal cual se pregunto.
 *
 * `Bedtime Story` (Arbalest, CC Set) lleva "+35% Debuff Skill Chance" y
 * "+35% Move Skill Chance". En el juego las dos cuentan, cada una en su skill:
 *
 *   · Suppressing Fire aplica "-20 ACC, -19% CRIT" -> es un DEBUFF
 *   · Bola aplica "Knockback 1"                    -> es un MOVE
 *
 * La primera no salia, porque `debuff skill chance` estaba excluido a mano con
 * el argumento de que "ninguna etiqueta dice que una skill debuffea". La
 * etiqueta existe: `skillProfile('Arbalest','Suppressing Fire')` devuelve
 * `debuff, damage, aoe`. Era una limitacion afirmada sin comprobarla.
 */
describe('Bedtime Story on the Arbalest', () => {
  const arb = (trinket) => ({
    heroClass: 'Arbalest',
    trinket1: trinket,
    trinket2: '',
    quirks: { positive: [], negative: [] },
    lockedQuirks: { positive: [], negative: [] },
    diseases: [],
  });

  it('carries both chance bonuses', () => {
    const { TRINKET_EFFECTS } = require('../../data/trinketEffects');
    expect(TRINKET_EFFECTS['Bedtime Story'].effect).toMatch(/\+35% Debuff Skill Chance/);
    expect(TRINKET_EFFECTS['Bedtime Story'].effect).toMatch(/\+35% Move Skill Chance/);
  });

  it('applies the debuff bonus to Suppressing Fire', () => {
    const card = skillHover('Suppressing Fire', 'Arbalest', { hero: arb('Bedtime Story') });
    expect(card.lines.join(' ')).toMatch(/\+35% Debuff Chance — Bedtime Story/);
  });

  it('applies the move bonus to Bola', () => {
    const card = skillHover('Bola', 'Arbalest', { hero: arb('Bedtime Story') });
    expect(card.lines.join(' ')).toMatch(/\+35% Move Chance — Bedtime Story/);
  });

  // Y no se las pega a una skill que no hace ninguna de las dos cosas.
  it('leaves a plain attack alone', () => {
    const card = skillHover('Sniper Shot', 'Arbalest', { hero: arb('Bedtime Story') });
    expect(card.lines.join(' ')).not.toMatch(/Chance —/);
  });

  /**
   * Los otros dos clausulas de Bedtime Story son "vs Marked": condicionales, y
   * por eso no se suman al total de ACC aunque el trinket las lleve.
   */
  it('does not fold its "vs Marked" accuracy into the total', () => {
    const card = skillHover('Sniper Shot', 'Arbalest', { hero: arb('Bedtime Story') });
    expect(card.subtitle).not.toMatch(/ACC \d+% \(/);
  });
});

