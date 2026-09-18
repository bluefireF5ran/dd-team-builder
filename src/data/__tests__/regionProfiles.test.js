import {
  REGION_PROFILES,
  RESOLVE_THRESHOLDS,
  RESOLVE_THRESHOLDS_BY_MODE,
  QUEST_RESOLVE_CAPS,
  QUEST_RESOLVE_CAPS_BY_MODE,
  UNDER_LEVEL_COST,
  resolveLevel,
  getRegionProfile
} from '../regionProfiles';
import { LOCATIONS } from '../locations';
import { COMP_REGIONS } from '../../config/rankerRoster';

/**
 * Los sitios que nunca van a tener perfil, porque sus peleas no se sortean.
 *
 * La Darkest Dungeon trae una tabla con un bicho y la Granja dos: emitir "media
 * de party 1" seria mentir con aplomo, y la regla en todo este repo es que
 * callarse gana a adivinar.
 *
 * El Patio estuvo aqui y ya no. No era una region guionizada: el importador
 * miraba en `<dlc>/<id>/dungeons` y sus tablas viven en
 * `<dlc>/580100_crimson_court/features/crimson_court/dungeons/`, cuatro
 * carpetas mas adentro. Eran 263 filas y 47 bichos que nadie leia.
 */
const NEVER_PROFILED = ['The Farmstead', 'The Darkest Dungeon I'];

describe('region profiles', () => {
  it('names only locations the app knows', () => {
    Object.keys(REGION_PROFILES).forEach((name) => expect(LOCATIONS).toContain(name));
  });

  it('covers every region the comp library is ranked in', () => {
    // Si una region se puede ordenar es que tiene comps, y una comp se
    // construye PARA una region: sin perfil no hay contra que juzgarla.
    //
    // Lo que este test NO puede hacer es recortar `COMP_REGIONS` hasta que
    // cuadre. Esa lista enciende los botones del ranker, asi que filtrarla por
    // "tiene perfil" habria dejado las comps del Patio sin poder ordenarse --
    // y las habria dejado fuera para tapar un fallo de rutas del importador.
    const missing = COMP_REGIONS.filter((region) => !REGION_PROFILES[region]);
    expect(missing).toEqual([]);
  });

  it('leaves out the places whose fights are scripted', () => {
    NEVER_PROFILED.forEach((region) => expect(getRegionProfile(region)).toBeNull());
  });

  it('reads the Crimson Court, which lives four folders deeper than the rest', () => {
    // El caso que costo una suite en rojo: el Patio existe, tiene 47 bichos, y
    // resiste todo -- 75 de aturdimiento y 79 de veneno, los peores del juego.
    const courtyard = getRegionProfile('The Courtyard');
    expect(courtyard).not.toBeNull();
    expect(courtyard.enemies).toBeGreaterThan(40);
    expect(courtyard.typeMix.vampire).toBeGreaterThan(50);
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
  it('reads the HERO table, which has one entry per Resolve level', () => {
    // Seven, for Resolve 0-6. This read `progression.json`'s
    // `dungeon.level_threshold_table` for months -- eight entries of the
    // *dungeon* ladder -- and every imported hero came out a level or two
    // above what the game showed them as.
    expect(RESOLVE_THRESHOLDS).toEqual([0, 2, 8, 14, 24, 36, 48]);
  });

  it('turns raw XP into the level the game shows', () => {
    expect(resolveLevel(0)).toBe(0);
    expect(resolveLevel(2)).toBe(1);
    expect(resolveLevel(7)).toBe(1);
    expect(resolveLevel(8)).toBe(2);
    expect(resolveLevel(14)).toBe(3);
    expect(resolveLevel(1000)).toBe(RESOLVE_THRESHOLDS.length - 1);
  });

  it('levels a Radiant save on Radiant’s own table', () => {
    // Radiant needs 7 for Resolve 2 where Darkest needs 8, so the same save XP
    // is a different hero depending on the campaign it was started in.
    expect(RESOLVE_THRESHOLDS_BY_MODE.radiant).toEqual([0, 2, 7, 13, 21, 29, 40]);
    expect(resolveLevel(7, 'radiant')).toBe(2);
    expect(resolveLevel(7, 'darkest')).toBe(1);
    // Stygian overrides neither table, so it levels exactly like Darkest.
    expect(RESOLVE_THRESHOLDS_BY_MODE.stygian).toEqual(RESOLVE_THRESHOLDS);
    // And an unknown mode falls back rather than guessing.
    expect(resolveLevel(7, 'bloodmoon')).toBe(1);
  });

  it('carries the game’s own quest caps, which are a maximum', () => {
    // Indexed by dungeon level: Apprentice is 1, Veteran 3, Champion 5. 99 is
    // the game's way of writing "no restriction".
    expect(QUEST_RESOLVE_CAPS[1]).toBe(2);
    expect(QUEST_RESOLVE_CAPS[3]).toBe(4);
    expect(QUEST_RESOLVE_CAPS[5]).toBe(99);
    // Radiant lets a hero two levels above the quest in.
    expect(QUEST_RESOLVE_CAPS_BY_MODE.radiant[1]).toBe(4);
    expect(QUEST_RESOLVE_CAPS_BY_MODE.radiant[3]).toBe(6);
  });

  it('prices going in under-levelled, and it is not a flat 20 a level', () => {
    expect(UNDER_LEVEL_COST.starting).toEqual([0, 20, 30, 40, 50, 60, 70]);
    expect(UNDER_LEVEL_COST.stressTaken).toEqual([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5]);
  });

  it('says nothing when it has nothing to read', () => {
    expect(resolveLevel(undefined)).toBeNull();
    expect(resolveLevel(null)).toBeNull();
    expect(resolveLevel('6')).toBeNull();
  });
});
