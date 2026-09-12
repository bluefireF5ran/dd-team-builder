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

describe('lo que hace falta para juzgar una region', () => {
  // Las tres etiquetas que `regionFit` cruza con `regionProfiles`.

  it("reads `Self: Mark` as self-marking, not just `Mark Self`", () => {
    // El juego escribe lo mismo de las dos formas y el Duelist usa la segunda
    // en `Feint` y en `Fleche`. Leyendo solo `Mark Self` la clase que mas se
    // automarca del juego se quedaba sin la etiqueta -- y con ella se decide si
    // conviene llevarla a una region que pega mas fuerte a los marcados.
    expect(tags('Duelist', 'Feint')).toContain('markSelf');
    expect(tags('Duelist', 'Flèche')).toContain('markSelf');
    expect(tags('Leper', 'Withstand')).toContain('markSelf');
  });

  it('does not confuse hitting a marked enemy with marking yourself', () => {
    // `vs Marked` es una bonificacion condicional, y `Mark Target` marca al
    // otro. Ninguna de las dos te marca a ti.
    expect(tags('Bounty Hunter', 'Collect Bounty')).toContain('markPayoff');
    expect(tags('Bounty Hunter', 'Collect Bounty')).not.toContain('markSelf');
    expect(tags('Arbalest', "Sniper's Mark")).toContain('mark');
    expect(tags('Arbalest', "Sniper's Mark")).not.toContain('markSelf');
  });

  it('carries the enemy type inside the tag, and reads Human as man', () => {
    // El bono solo existe si la region trae ese bicho, asi que el tipo tiene
    // que viajar con la etiqueta. Las skills dicen "Human" y los ficheros del
    // juego `.id "man"`.
    expect(tags('Crusader', 'Smite')).toContain('bonus:unholy');
    expect(tags('Occultist', 'Sacrificial Stab')).toContain('bonus:eldritch');
    expect(tags('Houndmaster', "Hound's Rush")).toContain('bonus:beast');
    expect(tags('Bounty Hunter', 'Collect Bounty')).toContain('bonus:man');
  });

  it('reads every bonus on the line, not just the first', () => {
    // `Collect Bounty` es `+90% DMG vs Marked, +35% DMG vs Human`: quedandose
    // con la primera coincidencia, el tipo de bicho se perdia detras de una
    // condicion de combate.
    const bonuses = tags('Bounty Hunter', 'Collect Bounty').filter((tag) => tag.startsWith('bonus:'));
    expect(bonuses).toEqual(['bonus:man']);
  });

  it('marks a debuff on the enemy and not one the hero pays himself', () => {
    expect(tags('Occultist', 'Weakening Curse')).toContain('debuff');
    expect(tags('Houndmaster', 'Target Whistle')).toContain('debuff');
    // `Self: ... -4 SPD` del `Transform` es el precio de transformarse.
    expect(tags('Abomination', 'Transform')).not.toContain('debuff');
    // Y el `-15% DMG` del `Duelist's Advance` va dentro de `Riposte: [...]`:
    // describe lo flojo que pega SU contraataque, no una debilidad del enemigo.
    expect(tags('Highwayman', "Duelist's Advance")).not.toContain('debuff');
  });
});

describe('el cache de skillProfile', () => {
  // Memoizarlo es lo que baja una sugerencia de comp de ocho segundos a medio
  // segundo, y el precio es que el objeto se comparte. Estas dos cosas son las
  // que hay que no romper.
  it('devuelve siempre el mismo objeto para la misma skill', () => {
    expect(skillProfile('Vestal', 'Judgement')).toBe(skillProfile('Vestal', 'Judgement'));
  });

  it('guarda la respuesta por clase, no por nombre de skill', () => {
    // Las skills de combate son de su clase (`getSkillEffect` las busca dentro
    // de ella), asi que la clave del cache tiene que llevarla: `Judgement` es de
    // la Vestal y preguntando por el Leper no puede salir la de ella.
    expect(skillProfile('Vestal', 'Judgement')).not.toBeNull();
    expect(skillProfile('Leper', 'Judgement')).toBeNull();
    expect(skillProfile('Vestal', 'Judgement')).not.toBeNull();
  });

  it('se acuerda tambien de lo que no conoce', () => {
    // El `null` de una clase modded sin datos es el caso mas frecuente y el mas
    // caro (falla en las dos tablas), asi que tambien se cachea.
    expect(skillProfile('Clase Que No Existe', 'Skill Que No Existe')).toBeNull();
    expect(skillProfile('Clase Que No Existe', 'Skill Que No Existe')).toBeNull();
  });
});
