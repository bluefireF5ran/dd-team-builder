import {
  MODDED_COMBAT_SKILL_EFFECTS,
  MODDED_CAMP_SKILL_EFFECTS,
  MODDED_TRINKET_EFFECTS,
  MODDED_TRINKET_SETS,
  MODDED_HAND_AUTHORED,
  getModdedSkillEffect,
  getModdedTrinketEffect,
  getTrinketSet,
  getSetBonus,
} from '../moddedEffects';
import {
  MODDED_COMBAT_SKILL_EFFECTS_GENERATED,
  MODDED_TRINKET_EFFECTS_GENERATED,
} from '../moddedEffectsGenerated';
import { MODDED_HERO_CLASSES } from '../modded_heroes';
import { COMMON_VANILLA_CAMP_SKILLS } from '../../constants';

/**
 * Dos niveles de exigencia, porque hay dos formas de llegar a este fichero.
 *
 * `MODDED_HAND_AUTHORED` se escribio a mano, a proposito y entero, asi que se
 * le pide COMPLETITUD: las siete skills, las camp no vanilla y los trinkets de
 * clase. Esa es la regla que tenia todo el fichero cuando Sibyl era la unica
 * clase cubierta.
 *
 * Lo generado por `scripts/importModdedEffects.js` no puede cumplir eso y no
 * deberia fingirlo: solo se renderiza lo que el mod instalado deja leer, una
 * skill puede no producir texto legible, y los trinkets todavia no los genera
 * nadie. Pedirle completitud convertiria "instalar un mod mas" en "suite roja".
 *
 * Lo que SI se le exige, y es lo que cazaba bugs de verdad, es que **nada de lo
 * que describe se invente un nombre**: un nombre que no esta en el roster de su
 * clase es exactamente el bug de `Snakeskin` -- la carta decia 4/4 y ningun
 * boton se encendia, porque el contador lee el array y los botones el roster, y
 * nadie comparaba los dos.
 */
const handAuthored = MODDED_HAND_AUTHORED;
const generated = Object.keys(MODDED_COMBAT_SKILL_EFFECTS_GENERATED);
const coveredClasses = Object.keys(MODDED_COMBAT_SKILL_EFFECTS);

describe('modded effects, hand-authored classes', () => {
  it('names classes the app actually carries', () => {
    const unknown = handAuthored.filter((c) => !MODDED_HERO_CLASSES[c]);
    expect(unknown).toEqual([]);
  });

  it('covers every combat skill', () => {
    const missing = [];
    handAuthored.forEach((heroClass) => {
      (MODDED_HERO_CLASSES[heroClass]?.skills || []).forEach((skill) => {
        if (!MODDED_COMBAT_SKILL_EFFECTS[heroClass]?.[skill]) missing.push(`${heroClass}: ${skill}`);
      });
    });
    expect(missing).toEqual([]);
  });

  it('covers every non-vanilla camp skill', () => {
    const missing = [];
    handAuthored.forEach((heroClass) => {
      const def = MODDED_HERO_CLASSES[heroClass] || {};
      (def.campSkills || []).forEach((skill) => {
        const isVanilla = (def.vanillaCampSkills || []).includes(skill)
          || COMMON_VANILLA_CAMP_SKILLS.includes(skill);
        if (!isVanilla && !MODDED_CAMP_SKILL_EFFECTS[skill]) missing.push(`${heroClass}: ${skill}`);
      });
    });
    expect(missing).toEqual([]);
  });

  it('covers every class-specific trinket', () => {
    const missing = [];
    handAuthored.forEach((heroClass) => {
      (MODDED_HERO_CLASSES[heroClass]?.classSpecificTrinkets || []).forEach((trinket) => {
        if (!MODDED_TRINKET_EFFECTS[trinket]) missing.push(`${heroClass}: ${trinket}`);
      });
    });
    expect(missing).toEqual([]);
  });
});

describe('modded effects, generated classes', () => {
  it('only describes classes the app carries', () => {
    const unknown = generated.filter((c) => !MODDED_HERO_CLASSES[c]);
    expect(unknown).toEqual([]);
  });

  // El generador nunca debe inventar un nombre: el join id -> nombre sale del
  // manifiesto de `importModdedHeroes`, asi que un nombre fuera del roster
  // significa que los dos ficheros se han ido separando.
  it('never describes a skill its class does not have', () => {
    const orphans = [];
    generated.forEach((heroClass) => {
      const roster = new Set(MODDED_HERO_CLASSES[heroClass]?.skills || []);
      Object.keys(MODDED_COMBAT_SKILL_EFFECTS_GENERATED[heroClass]).forEach((name) => {
        if (!roster.has(name)) orphans.push(`${heroClass}: ${name}`);
      });
    });
    expect(orphans).toEqual([]);
  });

  it('describes at least one skill for every class it lists', () => {
    const empty = generated.filter(
      (c) => Object.keys(MODDED_COMBAT_SKILL_EFFECTS_GENERATED[c]).length === 0
    );
    expect(empty).toEqual([]);
  });

  // Un numero de cuatro cifras es la senal de que la escala se leyo mal -- el
  // `-9900% CRIT` que salia antes de que `scaledBuff` mirase la magnitud.
  it('renders no absurd percentage', () => {
    const absurd = [];
    generated.forEach((heroClass) => {
      Object.entries(MODDED_COMBAT_SKILL_EFFECTS_GENERATED[heroClass]).forEach(([name, v]) => {
        if (/[+-]?\d{5,}\s*%/.test(v.effect || '')) absurd.push(`${heroClass}: ${name}`);
      });
    });
    expect(absurd).toEqual([]);
  });

  // Restos de plantilla que el juego nunca escribe pero los mods si.
  it('leaks no template artefacts into the text', () => {
    const dirty = [];
    generated.forEach((heroClass) => {
      Object.entries(MODDED_COMBAT_SKILL_EFFECTS_GENERATED[heroClass]).forEach(([name, v]) => {
        const e = v.effect || '';
        if (/%%/.test(e)) dirty.push(`${heroClass}: ${name} (%%)`);
        if (/[​-‏⁠﻿]/.test(e)) dirty.push(`${heroClass}: ${name} (zero-width)`);
        if (/(Self|Party|Enemies):\s*\1:/.test(e)) dirty.push(`${heroClass}: ${name} (doubled target)`);
      });
    });
    expect(dirty).toEqual([]);
  });
});

describe('modded trinkets, generated', () => {
  const entries = Object.entries(MODDED_TRINKET_EFFECTS_GENERATED);

  it('gives every trinket a readable effect', () => {
    const empty = entries.filter(([, v]) => !v.effect || !v.effect.trim()).map(([n]) => n);
    expect(empty).toEqual([]);
  });

  /**
   * `limit` es cuantas copias deja tener el juego, y lo lee
   * `resolveTrinketClashes` para no vestir el mismo objeto en dos heroes. Es
   * propiedad del objeto, no de su tier -- la rareza no vale de sustituto --
   * asi que tiene que venir de la entrada del mod y ser un entero.
   */
  it('reads limit as a whole number when the entry states one', () => {
    const bad = entries
      .filter(([, v]) => v.limit !== undefined && !Number.isInteger(v.limit))
      .map(([n]) => n);
    expect(bad).toEqual([]);
  });

  it('names a rarity or says null, never an empty string', () => {
    const bad = entries.filter(([, v]) => v.rarity === '' || v.rarity === undefined).map(([n]) => n);
    expect(bad).toEqual([]);
  });

  it('leaks no template artefacts into the text', () => {
    const dirty = [];
    entries.forEach(([name, v]) => {
      const e = v.effect || '';
      if (/%%/.test(e)) dirty.push(`${name} (%%)`);
      if (/[\u200b-\u200f\u2060\ufeff]/.test(e)) dirty.push(`${name} (zero-width)`);
      if (/(Self|Party|Enemies):\s*\1:/.test(e)) dirty.push(`${name} (doubled target)`);
      if (/[+-]?\d{5,}\s*%/.test(e)) dirty.push(`${name} (absurd %)`);
    });
    expect(dirty).toEqual([]);
  });

  // Una entrada con `buffs: []` y todo colgando de un disparador es el caso que
  // `importTrinketEffects.js` documenta como Flickering Lamplight, y los mods lo
  // usan mucho mas que el juego base. Leer solo `buffs` la dejaria sin texto.
  it('renders a trinket whose whole effect hangs off a trigger', () => {
    const triggered = entries.filter(([, v]) => /^On |^When |^After |^Hero Killed/.test(v.effect || ''));
    expect(triggered.length).toBeGreaterThan(0);
  });
});

describe('modded effects, the merged view', () => {
  // Lo escrito a mano gana. Si el generador cubriese Sibyl algun dia, la
  // lectura comprobada tiene que seguir siendo la que se ve.
  it('prefers the hand-authored entry over the generated one', () => {
    const sibyl = MODDED_COMBAT_SKILL_EFFECTS.Sibyl;
    expect(sibyl.Alignment.effect).toContain('cycle stance');
  });

  it('keeps the generated classes alongside the hand-authored ones', () => {
    expect(coveredClasses).toEqual(expect.arrayContaining(handAuthored));
    expect(coveredClasses.length).toBeGreaterThanOrEqual(generated.length);
  });

  it('describes no camp skill that no covered class carries', () => {
    const campRoster = new Set(coveredClasses.flatMap((c) => MODDED_HERO_CLASSES[c]?.campSkills || []));
    const orphans = Object.keys(MODDED_CAMP_SKILL_EFFECTS).filter((n) => !campRoster.has(n));
    expect(orphans).toEqual([]);
  });

  /**
   * La fusion de trinkets es por CAMPO. La entrada a mano de `Bottled Twilight`
   * es mejor prosa -- dice la condicion que el generador pierde -- pero no
   * anota `limit`, y un reemplazo entero lo borraria. `limit` es lo que lee
   * `resolveTrinketClashes` para no vestir el mismo objeto en dos heroes.
   */
  it('keeps the hand-written text and the generated limit together', () => {
    const t = MODDED_TRINKET_EFFECTS['Bottled Twilight'];
    expect(t.effect).toContain('Always CRIT');
    expect(t.limit).toBe(1);
  });

  it('leaves no modded trinket without a copy limit', () => {
    const missing = Object.entries(MODDED_TRINKET_EFFECTS)
      .filter(([, v]) => v.limit === undefined)
      .map(([n]) => n);
    expect(missing).toEqual([]);
  });

  it('describes no trinket that no covered class carries', () => {
    const trinketRoster = new Set(
      coveredClasses.flatMap((c) => MODDED_HERO_CLASSES[c]?.classSpecificTrinkets || [])
    );
    const orphans = Object.keys(MODDED_TRINKET_EFFECTS).filter((n) => !trinketRoster.has(n));
    expect(orphans).toEqual([]);
  });
});

describe('the lookups', () => {
  it('finds a combat skill by class and name', () => {
    const found = getModdedSkillEffect('Alignment', 'Sibyl');
    expect(found).toMatchObject({ kind: 'combat' });
  });

  it('finds a camp skill by name alone', () => {
    const found = getModdedSkillEffect('Panacea');
    expect(found).toMatchObject({ kind: 'camp' });
  });

  it('returns null for a name nothing describes', () => {
    expect(getModdedSkillEffect('Nothing At All', 'Sibyl')).toBeNull();
    expect(getModdedTrinketEffect('Nothing At All')).toBeNull();
    expect(getModdedSkillEffect(null)).toBeNull();
  });

  it('finds a modded trinket', () => {
    expect(getModdedTrinketEffect('Petal Pouch')).toMatchObject({ rarity: 'Common' });
  });
});

describe('trinket sets', () => {
  it('every modded set has exactly two members and a bonus', () => {
    Object.entries(MODDED_TRINKET_SETS).forEach(([id, set]) => {
      expect(set.members).toHaveLength(2);
      expect(typeof set.bonus).toBe('string');
      expect(set.bonus.length).toBeGreaterThan(0);
      expect(typeof id).toBe('string');
    });
  });

  it('reports a set as active only when both halves are equipped', () => {
    const [a, b] = MODDED_TRINKET_SETS.cc_sibyl_ms.members;
    expect(getSetBonus(a, b)).toMatchObject({ active: true });
    expect(getSetBonus(a, 'Petal Pouch')).toMatchObject({ active: false });
  });

  it('finds the set a single trinket belongs to', () => {
    const [a] = MODDED_TRINKET_SETS.cc_sibyl_ms.members;
    expect(getTrinketSet(a)).toMatchObject({ id: 'cc_sibyl_ms' });
    expect(getTrinketSet('Petal Pouch')).toBeNull();
  });
});
