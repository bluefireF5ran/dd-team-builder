import {
  MODDED_COMBAT_SKILL_EFFECTS,
  MODDED_CAMP_SKILL_EFFECTS,
  MODDED_TRINKET_EFFECTS,
  MODDED_TRINKET_SETS,
  getModdedSkillEffect,
  getModdedTrinketEffect,
  getTrinketSet,
  getSetBonus,
} from '../moddedEffects';
import { MODDED_HERO_CLASSES } from '../modded_heroes';
import { COMMON_VANILLA_CAMP_SKILLS } from '../../constants';

// Only the modded classes this file actually covers are pinned - the rest of
// the modded roster has no effect data yet and that is not a failure. Adding a
// class to MODDED_COMBAT_SKILL_EFFECTS opts it into every check below.
const coveredClasses = Object.keys(MODDED_COMBAT_SKILL_EFFECTS);

describe('modded effect coverage', () => {
  it('covers every combat skill of every covered class', () => {
    const missing = [];
    coveredClasses.forEach((heroClass) => {
      const roster = MODDED_HERO_CLASSES[heroClass]?.skills || [];
      roster.forEach((skill) => {
        if (!MODDED_COMBAT_SKILL_EFFECTS[heroClass][skill]) missing.push(`${heroClass}: ${skill}`);
      });
    });
    expect(missing).toEqual([]);
  });

  it('covers every non-vanilla camp skill of every covered class', () => {
    const missing = [];
    coveredClasses.forEach((heroClass) => {
      const def = MODDED_HERO_CLASSES[heroClass] || {};
      (def.campSkills || []).forEach((skill) => {
        const isVanilla = (def.vanillaCampSkills || []).includes(skill)
          || COMMON_VANILLA_CAMP_SKILLS.includes(skill);
        if (!isVanilla && !MODDED_CAMP_SKILL_EFFECTS[skill]) missing.push(`${heroClass}: ${skill}`);
      });
    });
    expect(missing).toEqual([]);
  });

  it('covers every class-specific trinket of every covered class', () => {
    const missing = [];
    coveredClasses.forEach((heroClass) => {
      (MODDED_HERO_CLASSES[heroClass]?.classSpecificTrinkets || []).forEach((trinket) => {
        if (!MODDED_TRINKET_EFFECTS[trinket]) missing.push(`${heroClass}: ${trinket}`);
      });
    });
    expect(missing).toEqual([]);
  });

  it('describes nothing that is not on a covered roster', () => {
    const skillRoster = new Set(coveredClasses.flatMap((c) => MODDED_HERO_CLASSES[c]?.skills || []));
    const campRoster = new Set(coveredClasses.flatMap((c) => MODDED_HERO_CLASSES[c]?.campSkills || []));
    const trinketRoster = new Set(
      coveredClasses.flatMap((c) => MODDED_HERO_CLASSES[c]?.classSpecificTrinkets || [])
    );
    const orphans = [];
    Object.entries(MODDED_COMBAT_SKILL_EFFECTS).forEach(([heroClass, skills]) => {
      Object.keys(skills).forEach((name) => {
        if (!skillRoster.has(name)) orphans.push(`combat ${heroClass}: ${name}`);
      });
    });
    Object.keys(MODDED_CAMP_SKILL_EFFECTS).forEach((name) => {
      if (!campRoster.has(name)) orphans.push(`camp: ${name}`);
    });
    Object.keys(MODDED_TRINKET_EFFECTS).forEach((name) => {
      if (!trinketRoster.has(name)) orphans.push(`trinket: ${name}`);
    });
    expect(orphans).toEqual([]);
  });
});

describe('modded effect lookups', () => {
  it('tags combat vs camp skills', () => {
    expect(getModdedSkillEffect('Alignment', 'Sibyl')).toMatchObject({ kind: 'combat' });
    expect(getModdedSkillEffect('Garden Harvest', 'Sibyl')).toMatchObject({ kind: 'camp' });
    expect(getModdedSkillEffect('Alignment')).toBeNull();
    expect(getModdedSkillEffect('Nonexistent', 'Sibyl')).toBeNull();
  });

  it('returns trinket effects with a rarity', () => {
    expect(getModdedTrinketEffect('Bottled Twilight')).toMatchObject({ rarity: expect.any(String) });
    expect(getModdedTrinketEffect('Nonexistent')).toBeNull();
  });
});

describe('modded set bonuses', () => {
  it('every modded set has two roster members and a bonus', () => {
    coveredClasses.forEach((heroClass) => {
      const trinkets = new Set(MODDED_HERO_CLASSES[heroClass]?.classSpecificTrinkets || []);
      Object.values(MODDED_TRINKET_SETS).forEach((set) => {
        if (!set.members.some((m) => trinkets.has(m))) return;
        expect(set.members).toHaveLength(2);
        set.members.forEach((m) => expect(trinkets.has(m)).toBe(true));
        expect(set.bonus).toBeTruthy();
      });
    });
  });

  it('getSetBonus covers the Sibyl set and still resolves vanilla sets', () => {
    expect(getSetBonus('Sun-bleached Hairlock', 'Bloody Soil')).toMatchObject({ active: true });
    expect(getSetBonus('Sun-bleached Hairlock', 'Petal Pouch')).toMatchObject({ active: false });
    expect(getSetBonus('Shameful Shroud', 'Osmond Chains')).toMatchObject({ active: true });
    expect(getTrinketSet('Bloody Soil')).toMatchObject({ label: 'Crimson Court Set' });
    expect(getSetBonus('Petal Pouch', 'Lunar Veil')).toBeNull();
  });
});
