import { REGION_PROFILES, RESOLVE_THRESHOLDS, resolveLevel, getRegionProfile } from '../regionProfiles';
import { LOCATIONS } from '../locations';
import { COMP_REGIONS } from '../../config/rankerRoster';

describe('region profiles', () => {
  it('names only locations the app knows', () => {
    Object.keys(REGION_PROFILES).forEach((name) => expect(LOCATIONS).toContain(name));
  });

  it('covers every region the comp library is ranked in', () => {
    // Si una region se puede ordenar es que tiene comps, y una comp se
    // construye PARA una region: sin perfil no hay contra que juzgarla.
    COMP_REGIONS.forEach((region) => expect(REGION_PROFILES[region]).toBeDefined());
  });

  it('leaves out the places whose fights are scripted', () => {
    // La Darkest Dungeon trae una tabla con un bicho y la Granja dos: sus
    // peleas no se sortean asi. Callarse es mejor que inventar una media.
    expect(REGION_PROFILES['The Darkest Dungeon I']).toBeUndefined();
    expect(REGION_PROFILES['The Farmstead']).toBeUndefined();
    expect(getRegionProfile('The Courtyard')).toBeNull();
  });

  it('reads the way the game actually plays', () => {
    // Cuatro hechos que cualquiera que haya jugado reconoce, y que salen solos
    // de las tablas: no hay ninguna lista escrita a mano detras.
    const ruins = REGION_PROFILES['The Ruins'];
    const warrens = REGION_PROFILES['The Warrens'];
    const cove = REGION_PROFILES['The Cove'];

    // Los esqueletos llevan `bleed_resist 200%`: sangrar en las Ruinas es tirar
    // el turno, y sangrar en la Guarida no.
    expect(ruins.resist.bleed).toBeGreaterThan(100);
    expect(warrens.resist.bleed).toBeLessThan(ruins.resist.bleed);

    // Las Ruinas son de impios, que es lo que enciende al Crusader y al Occultist.
    expect(ruins.typeMix.unholy).toBeGreaterThan(50);
    // La Cala es de eldritch.
    expect(cove.typeMix.eldritch).toBeGreaterThan(50);
    // Y el veneno va peor en la Guarida que en las Ruinas.
    expect(warrens.resist.blight).toBeGreaterThan(ruins.resist.blight);
  });

  it('gives every profile a full set of resistances and a party size', () => {
    Object.entries(REGION_PROFILES).forEach(([name, profile]) => {
      ['stun', 'blight', 'bleed', 'debuff', 'move'].forEach((key) => {
        expect(typeof profile.resist[key]).toBe('number');
      });
      expect(profile.avgPartySize).toBeGreaterThan(1);
      expect(profile.avgPartySize).toBeLessThanOrEqual(4);
      expect(Object.keys(profile.typeMix).length).toBeGreaterThan(0);
      expect(name).toBeTruthy();
    });
  });
});

describe('resolveLevel', () => {
  it('reads the game thresholds', () => {
    expect(RESOLVE_THRESHOLDS[0]).toBe(0);
    expect(RESOLVE_THRESHOLDS.length).toBeGreaterThan(5);
  });

  it('turns raw XP into the level the game shows', () => {
    expect(resolveLevel(0)).toBe(0);
    expect(resolveLevel(2)).toBe(1);
    expect(resolveLevel(5)).toBe(1);
    expect(resolveLevel(6)).toBe(2);
    expect(resolveLevel(1000)).toBe(RESOLVE_THRESHOLDS.length - 1);
  });

  it('says nothing when it has nothing to read', () => {
    expect(resolveLevel(undefined)).toBeNull();
    expect(resolveLevel(null)).toBeNull();
    expect(resolveLevel('6')).toBeNull();
  });
});
