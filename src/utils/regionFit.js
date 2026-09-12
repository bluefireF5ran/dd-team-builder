/**
 * Que tal le sienta una region a una party, y cual le sienta mejor.
 *
 * `scoreParty` mide si una party puede pelear: si llega a los cuatro rangos, si
 * cura, si cada heroe puede usar su kit desde donde esta. Todo eso es igual de
 * cierto en cualquier sitio. Pero una comp no se juega en el vacio --se
 * construye PARA una region-- y lo que cambia de una a otra no es poco:
 *
 *   - Un esqueleto lleva `bleed_resist 200%`, asi que la media de las Ruinas es
 *     151: **sangrar alli es tirar el turno**. En la Guarida es 44.
 *   - El veneno va al reves: 35 en las Ruinas, 62 en la Guarida y el Bosque, 79
 *     en el Patio.
 *   - El 61% de lo que sale en las Ruinas es impio, que es justo lo que enciende
 *     el `+35% DMG vs Unholy` del Cruzado y de la Vestal. En la Guarida es 4%.
 *   - Y el 27.5% de los bichos de las Ruinas pegan MAS FUERTE a un heroe
 *     marcado, asi que llevar ahi a quien se automarca --el Duelist lo hace en
 *     `Feint` y en `Fleche`, y siendo clase de postura las lleva siempre-- se
 *     paga. En la Cala son el 11.1%.
 *
 * Nada de esto esta escrito a mano: sale de `regionProfiles.js`, que
 * `importRegionProfiles` deriva de las mash tables del juego.
 *
 * ## Como se puntua
 *
 * Cada factor es **cuanto invierte la party** por **cuanto le sirve aqui**.
 *
 * Lo que invierte: cuantas skills de esa clase lleva, contando solo las que
 * puede lanzar desde su rango --una skill que no puede usar no sangra a nadie,
 * la misma regla que `enemyReach`-- y saturando a las tres, porque la cuarta ya
 * no cambia el plan.
 *
 * Lo que le sirve: `1 - resistencia/100`, o sea que parte de lo que tira acaba
 * prendiendo. 151 de sangrado da cero. No hay que normalizar entre regiones
 * porque ya es la escala del propio juego.
 *
 * ## Por que los pesos son pequenos
 *
 * Esto no elige la party, elige su ETIQUETA. Para una party dada todo lo demas
 * de `scoreParty` vale igual en las seis regiones, asi que cualquier diferencia
 * por pequena que sea decide cual gana. Entre dos partys DISTINTAS, en cambio,
 * llegar a los cuatro rangos (40) o llevar cura (20) tienen que seguir pesando
 * mucho mas que si el veneno prende algo mejor.
 */
import { getRegionProfile, REGION_PROFILES } from '../data/regionProfiles';
import { LOCATIONS } from '../data/locations';
import { getRawComps } from '../data/compIndex';
import { skillProfile } from './skillProfile';

/**
 * Lo que vale cada factor cuando la party va a fondo y la region no se resiste.
 *
 * Los pesos salen de **cuanto se diferencian las regiones en ese eje**, no de lo
 * importante que suene el efecto, porque un eje en el que todas las regiones
 * miden casi igual no puede decidir nada: solo mete ruido proporcional a su
 * peso. Contando lo que de verdad varia `1 - resistencia/100` entre las seis:
 *
 *     sangrado  0.56    (44 en la Guarida, 151 en las Ruinas)
 *     veneno    0.46    (33 en el Hamlet, 79 en el Patio)
 *     aturdir   0.31    (44 a 75)
 *     mover     0.25    (39 a 64)
 *     debuff    0.20    (37 a 57)
 *
 * Con 6/6/2/1/1 las dos DoT mueven mas de tres puntos y las otras tres menos de
 * 0.7 entre todas, que es la jerarquia que se quiere. Repartiendo mas parejo
 * pasaba lo contrario: una party de veneno acumulaba tres aturdimientos y tres
 * debuffs que valian lo mismo en todas partes, y esa suma casi constante tapaba
 * la unica diferencia que importaba -- las Ruinas y la Cala quedaban a 0.07 la
 * una de la otra para una comp de veneno.
 */
const WEIGHTS = { bleed: 6, blight: 6, stun: 2, debuff: 1, move: 1 };

/**
 * Pegar mas fuerte a lo que mas sale por aqui (`+35% DMG vs Unholy`).
 *
 * El reparto de tipos varia de 0 a 61%, asi que con 3 mueve casi dos puntos:
 * por debajo de las DoT y por encima de todo lo demas, que es donde le toca.
 */
const TYPE_BONUS = 3;

/**
 * Lo que cuesta automarcarse donde los bichos castigan la marca.
 *
 * De 11.1% en la Cala a 29.8% en la Guarida, o sea un punto de diferencia con
 * peso 5. Es una preferencia, no una prohibicion: el Duelist se automarca en
 * dos de sus siete skills y sigue siendo un buen heroe en la Guarida, solo que
 * ahi lo paga y en la Cala no.
 */
const MARK_PENALTY = 5;

/** A partir de tres skills del mismo tipo, la party ya va a fondo. */
const FULL_INVESTMENT = 3;

/**
 * Cuantas comps escritas hacen falta para que una region cuente como sitio al
 * que Fran lleva partys. El mismo umbral que el ranker (`MIN_COMPS_TO_RANK`) y
 * por la misma razon: una sola comp es una anecdota, no una costumbre.
 */
const MIN_COMPS_TO_CHOOSE = 4;

const investment = (count) => Math.min(count, FULL_INVESTMENT) / FULL_INVESTMENT;

/**
 * Que parte de lo que tiras llega a prender, de 0 a 1.
 *
 * La resistencia del juego pasa de 100 a proposito --el esqueleto tiene 200 de
 * sangrado-- y ahi la respuesta es cero, no un numero negativo: no existe
 * sangrar menos que nada.
 */
const landRate = (resist) =>
  typeof resist === 'number' ? Math.max(0, Math.min(1, 1 - resist / 100)) : 0;

/**
 * Que trae la party, contado en skills lanzables desde donde esta cada heroe.
 *
 * Se cuenta por SKILL y no por heroe: un Plague Doctor con dos venenos apuesta
 * mas por el veneno que uno que lleve solo `Noxious Blast`, y esa diferencia es
 * justo la que decide si merece la pena bajar al Patio, donde el veneno tiene
 * 79 de resistencia.
 */
const partyTally = (heroes) => {
  const counts = { bleed: 0, blight: 0, stun: 0, debuff: 0, move: 0, markSelf: 0 };
  const bonusVs = new Map();

  (heroes || []).forEach((hero, index) => {
    if (!hero?.heroClass) return;
    const rank = index + 1;
    (hero.activeSkills || []).forEach((name) => {
      const profile = skillProfile(hero.heroClass, name);
      if (!profile || !profile.launch.includes(rank)) return;

      if (profile.tags.has('bleed')) counts.bleed += 1;
      if (profile.tags.has('blight')) counts.blight += 1;
      if (profile.tags.has('stun')) counts.stun += 1;
      if (profile.tags.has('debuff')) counts.debuff += 1;
      if (profile.tags.has('enemyMove')) counts.move += 1;
      if (profile.tags.has('markSelf')) counts.markSelf += 1;

      profile.tags.forEach((tag) => {
        if (!tag.startsWith('bonus:')) return;
        const type = tag.slice('bonus:'.length);
        bonusVs.set(type, (bonusVs.get(type) || 0) + 1);
      });
    });
  });

  return { counts, bonusVs };
};

/**
 * Los sumandos de la nota, con nombre, para poder DECIR por que.
 *
 * Un numero suelto no sirve de nada en la UI: "The Warrens" no explica nada y
 * "your bleed lands here, 44% resist" si.
 */
export const regionFitBreakdown = (heroes, location) => {
  const profile = getRegionProfile(location);
  if (!profile) return [];

  const { counts, bonusVs } = partyTally(heroes);
  const rows = [];

  Object.entries(WEIGHTS).forEach(([kind, weight]) => {
    const invested = investment(counts[kind]);
    if (!invested) return;
    const resist = profile.resist?.[kind];
    rows.push({
      kind,
      points: weight * invested * landRate(resist),
      detail: `${counts[kind]} ${kind} skill(s), ${resist}% resist here`
    });
  });

  bonusVs.forEach((count, type) => {
    const share = (profile.typeMix?.[type] || 0) / 100;
    rows.push({
      kind: `vs ${type}`,
      points: TYPE_BONUS * investment(count) * share,
      detail: `${count} skill(s), ${Math.round(share * 100)}% of what shows up is ${type}`
    });
  });

  if (counts.markSelf) {
    rows.push({
      kind: 'self-mark',
      points: -MARK_PENALTY * investment(counts.markSelf) * ((profile.markPunish || 0) / 100),
      detail: `${counts.markSelf} self-marking skill(s), ${profile.markPunish}% of enemies hit a marked hero harder`
    });
  }

  return rows.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
};

/**
 * Cuanto suma esta region a esta party. Cero si no hay perfil que mirar.
 *
 * Nunca acusa: una region sin perfil --la Granja, la Darkest Dungeon-- no opina,
 * igual que una clase modded sin datos en `skillProfile`.
 */
export const regionFit = (heroes, location) =>
  regionFitBreakdown(heroes, location).reduce((total, row) => total + row.points, 0);

let candidateCache = null;

/**
 * Las regiones entre las que se elige.
 *
 * Dos condiciones, y las dos derivadas: **tener perfil**, porque sin el no hay
 * nada que comparar, y **que Fran escriba comps para ellas**. Lo segundo deja
 * fuera al Hamlet, que tiene perfil --la defensa contra Vvulf es una pelea de
 * verdad, en un sitio de verdad-- pero no es un sitio al que se decida ir con
 * una comp, y cuyos numeros ademas son casi calcados a los de las Ruinas. Una
 * lista fija diria lo mismo hoy y mentiria en cuanto la libreria creciera.
 */
const candidateRegions = () => {
  if (candidateCache) return candidateCache;

  const written = new Map();
  getRawComps().forEach((comp) => {
    if (!comp.location) return;
    written.set(comp.location, (written.get(comp.location) || 0) + 1);
  });

  const profiled = Object.keys(REGION_PROFILES);
  const built = profiled.filter((name) => (written.get(name) || 0) >= MIN_COMPS_TO_CHOOSE);

  // Una libreria recien empezada no tiene comps de nada, y quedarse sin
  // candidatas seria peor que elegir entre todas.
  candidateCache = (built.length ? built : profiled).sort(
    (a, b) => LOCATIONS.indexOf(a) - LOCATIONS.indexOf(b)
  );
  return candidateCache;
};

/**
 * La region que mejor le sienta a esta party, o `null` si no hay ninguna.
 *
 * Los empates se rompen por el orden del mapa y no por el del objeto, para que
 * la respuesta no dependa de en que orden escribiera el importador.
 */
export const bestRegionFor = (heroes) => {
  let best = null;
  candidateRegions().forEach((location) => {
    const score = regionFit(heroes, location);
    if (!best || score > best.score) best = { location, score };
  });
  return best;
};

/** Solo para los tests: olvida las regiones candidatas ya calculadas. */
export const resetRegionFitCache = () => {
  candidateCache = null;
};
