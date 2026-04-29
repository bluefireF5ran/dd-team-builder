import { TEAM_PRESETS } from '../../data/teamPresets';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';

describe('TEAM_PRESETS', () => {
  test('has at least one preset', () => {
    expect(TEAM_PRESETS.length).toBeGreaterThan(0);
  });

  TEAM_PRESETS.forEach((preset, idx) => {
    describe(`Preset: ${preset.name}`, () => {
      test('has a name', () => {
        expect(preset.name).toBeTruthy();
        expect(typeof preset.name).toBe('string');
      });

      test('has a description', () => {
        expect(preset.description).toBeTruthy();
        expect(typeof preset.description).toBe('string');
      });

      test('has a location', () => {
        expect(preset.location).toBeTruthy();
      });

      test('has exactly 4 heroes', () => {
        expect(preset.heroes).toHaveLength(4);
      });

      preset.heroes.forEach((hero, heroIdx) => {
        describe(`Hero ${heroIdx + 1}: ${hero.heroClass}`, () => {
          test('has a valid hero class', () => {
            const allClasses = { ...HERO_CLASSES, ...MODDED_HERO_CLASSES };
            expect(allClasses[hero.heroClass]).toBeDefined();
          });

          test('has exactly 4 active skills', () => {
            expect(hero.activeSkills).toHaveLength(4);
          });

          test('all skills exist in hero skill list', () => {
            const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
            const availableSkills = heroData.skills || [];
            hero.activeSkills.forEach(skill => {
              expect(availableSkills).toContain(skill);
            });
          });

          test('has exactly 4 active camp skills', () => {
            expect(hero.activeCampSkills).toHaveLength(4);
          });

          test('all camp skills exist in hero camp skill list', () => {
            const heroData = HERO_CLASSES[hero.heroClass] || MODDED_HERO_CLASSES[hero.heroClass];
            const availableCampSkills = heroData.campSkills || [];
            hero.activeCampSkills.forEach(skill => {
              expect(availableCampSkills).toContain(skill);
            });
          });

          test('has trinket1 and trinket2', () => {
            expect(hero.trinket1).toBeTruthy();
            expect(hero.trinket2).toBeTruthy();
          });
        });
      });
    });
  });
});
