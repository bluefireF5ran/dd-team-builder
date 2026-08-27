import {
  COMBAT_SKILL_EFFECTS,
  CAMP_SKILL_EFFECTS,
  getSkillEffect,
  getSkillEffectText,
} from '../skillEffects';
import { HERO_CLASSES } from '../heroes';

const classes = Object.entries(HERO_CLASSES);
const allCampNames = [...new Set(classes.flatMap(([, d]) => d.campSkills || []))];

describe('skill effect coverage', () => {
  // heroes.js owns the roster and this file the effects; the two can drift, and
  // this is what notices. A skill added without its effect fails here rather
  // than showing a bare name when the icon is hovered.
  it('describes every combat skill of every class', () => {
    const missing = [];
    classes.forEach(([heroClass, data]) => {
      (data.skills || []).forEach((skill) => {
        if (!COMBAT_SKILL_EFFECTS[heroClass] || !COMBAT_SKILL_EFFECTS[heroClass][skill]) {
          missing.push(`${heroClass}: ${skill}`);
        }
      });
    });
    expect(missing).toEqual([]);
  });

  it('describes every camp skill', () => {
    expect(allCampNames.filter((name) => !CAMP_SKILL_EFFECTS[name])).toEqual([]);
  });

  it('does not describe skills that no longer exist', () => {
    const orphans = [];
    Object.entries(COMBAT_SKILL_EFFECTS).forEach(([heroClass, skills]) => {
      const roster = new Set((HERO_CLASSES[heroClass] || {}).skills || []);
      Object.keys(skills).forEach((name) => {
        if (!roster.has(name)) orphans.push(`${heroClass}: ${name}`);
      });
    });
    const campRoster = new Set(allCampNames);
    Object.keys(CAMP_SKILL_EFFECTS).forEach((name) => {
      if (!campRoster.has(name)) orphans.push(`camp: ${name}`);
    });
    expect(orphans).toEqual([]);
  });

  it('covers all 20 classes', () => {
    expect(Object.keys(COMBAT_SKILL_EFFECTS).sort()).toEqual(
      classes.map(([name]) => name).sort()
    );
  });
});

describe('skill effect shape', () => {
  const combatEntries = Object.entries(COMBAT_SKILL_EFFECTS)
    .flatMap(([heroClass, skills]) => Object.entries(skills).map(([name, e]) => [`${heroClass}/${name}`, e]));
  const allEntries = [...combatEntries, ...Object.entries(CAMP_SKILL_EFFECTS)];

  it('leaves no unfilled format specifier or markup behind', () => {
    // The text is rendered through the game's own tooltip templates, which are
    // printf-style and carry {?token} argument markers and colour tags.
    const bad = allEntries
      .filter(([, e]) => /%[ds]|\{\?|colour_start|colour_end/.test(e.effect || ''))
      .map(([k, e]) => `${k}: ${e.effect}`);
    expect(bad).toEqual([]);
  });

  it("writes CRIT, not the game's internal CRT", () => {
    expect(allEntries.filter(([, e]) => /\bCRT\b/.test(e.effect || '')).map(([k]) => k)).toEqual([]);
  });

  it('never emits an empty clause between separators', () => {
    const bad = allEntries
      .filter(([, e]) => (e.effect || '').split('|').some((p) => p.trim() === '' && e.effect))
      .map(([k, e]) => `${k}: ${e.effect}`);
    expect(bad).toEqual([]);
  });

  it('gives every camp skill a cost and an effect', () => {
    const bad = Object.entries(CAMP_SKILL_EFFECTS)
      .filter(([, e]) => !e.effect || typeof e.cost !== 'number')
      .map(([k]) => k);
    expect(bad).toEqual([]);
  });

  it('writes ranks rank-1-first, matching the heroes[0] = rank 1 convention', () => {
    // Sniper Shot is fired from the back two ranks and cannot reach rank 1.
    expect(COMBAT_SKILL_EFFECTS.Arbalest['Sniper Shot']).toMatchObject({
      launch: '3·4',
      target: '2·3·4',
    });
  });
});

describe('getSkillEffect', () => {
  it('finds a combat skill under its class', () => {
    expect(getSkillEffect('Smite', 'Crusader')).toMatchObject({ kind: 'combat', type: 'Melee' });
  });

  it('needs the class, because a skill name only means something next to one', () => {
    expect(getSkillEffect('Smite')).toBeNull();
    expect(getSkillEffect('Smite', 'Vestal')).toBeNull();
  });

  it('finds a camp skill by name alone', () => {
    expect(getSkillEffect('Encourage')).toMatchObject({ kind: 'camp', cost: 2 });
    expect(getSkillEffect('Encourage', 'Crusader')).toMatchObject({ kind: 'camp' });
  });

  it('renders the Fire\'s Edge skills the CSV never had', () => {
    // Duelist and Runaway come from the install rather than the wiki export.
    expect(getSkillEffect('Coup de Grâce', 'Duelist').effect).toContain('Ignores PROT');
    expect(getSkillEffect('Searing Strike', 'Runaway').effect).toContain('Burn 5 pts/rd');
  });

  it('returns null for an unknown or empty name', () => {
    expect(getSkillEffect('Not A Skill', 'Crusader')).toBeNull();
    expect(getSkillEffect('')).toBeNull();
    expect(getSkillEffect(undefined)).toBeNull();
  });
});

describe('getSkillEffectText', () => {
  it('leads with the mechanics, then the effect', () => {
    const text = getSkillEffectText('Sniper Shot', 'Arbalest');
    expect(text).toBe(
      'Ranged · from 3·4 · hits 2·3·4 · DMG +0% · ACC 115% · CRIT +9% · +100% DMG vs Marked, +13% CRIT vs Marked'
    );
  });

  it('gives a camp skill its time cost', () => {
    expect(getSkillEffectText('Encourage')).toBe('2 time · -15 Stress');
  });

  it('returns an empty string for an unknown skill so callers fall back to the name', () => {
    expect(getSkillEffectText('Not A Skill', 'Crusader')).toBe('');
  });
});
