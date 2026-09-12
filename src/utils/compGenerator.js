/**
 * Construir una comp, en vez de buscarla.
 *
 * `suggestTeam` busca en `COMP_LIBRARY`, asi que solo puede devolver lo que ya
 * estaba. Y la libreria esta repartida como esta: 97 de 704 ranuras son
 * Houndmaster y 9 son Duelist, asi que con un roster que no tenga a los de
 * siempre el sugeridor no tiene nada que ofrecer. Esto responde a la misma
 * pregunta desde el otro lado -- que party TIENE SENTIDO con estos heroes--
 * usando las reglas del juego en vez del recuento de una libreria.
 *
 * ## Que se optimiza
 *
 * Una party es cuatro clases Y sus sitios, y las dos cosas se eligen a la vez:
 * la misma clase vale mucho o nada segun el rango (`launchableByRank` del Leper
 * es 7/5/2/1). El criterio sale de `partyCoverage`, o sea de `skillProfile`:
 *
 *   - **llegar a los cuatro rangos enemigos**, que es lo que decide si la comp
 *     puede pelear siquiera
 *   - **curar**, **quitar estres**, y **al menos una de** aturdir / veneno /
 *     sangrado, porque solo pegar fuerte no es un plan
 *   - **que cada heroe pueda usar sus skills desde donde esta** (`rankLegal`)
 *
 * Y cuando todo eso empata --pasa entre dos clases de fondo, que lanzan lo
 * mismo desde el 3 y desde el 4-- desempata `rankHomeMiss`, o sea donde pone la
 * libreria a cada clase. Solo desempata: ver `HOME_RANK_WEIGHT`.
 *
 * ## Por que no es un algoritmo voraz a secas
 *
 * Un voraz determinista con el mismo roster devuelve siempre la misma comp, y
 * "generame otra" tiene que poder dar otra. Se hacen varios intentos con el
 * orden barajado y gana el mejor, asi que la variedad sale del proceso y no de
 * meter ruido en la nota. `rng` se inyecta para que los tests sean
 * deterministas sin apagar esa variedad.
 *
 * ## Que cuenta como comp nueva
 *
 * Las cuatro clases, y ya. Ni el orden ni la region: *"si ya tengo una comp
 * para las Ruinas, puedo hacer una parecida para los Warrens"*, y eso no es una
 * comp nueva. Devolver algo que ya esta escrito en la libreria es el unico
 * resultado que este generador no puede dar, porque es justo lo que
 * `suggestTeam` ya hacia. La regla vive en `compIdentity.js`.
 *
 * Cuando la busqueda solo encuentra comps que ya existen -- pasa con un roster
 * corto, donde apenas hay repartos posibles-- entra `diversify`, que cambia UN
 * heroe por otro del roster hasta dar con un reparto que no este. Es lo mismo
 * que haria alguien a mano, y es determinista: no depende de tener suerte en
 * los intentos.
 */
import { PARTY_CONFIG } from '../constants';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';
import { bisLoadout, rankHomeMiss } from '../data/bisIndex';
import { classProfile, skillProfile } from './skillProfile';
import { partyCoverage } from './synergyHelper';
import { toRosterCounts, countOf } from './rosterAvailability';
import { compClassKey, knownCompKeys } from './compIdentity';
import { regionFit, bestRegionFor } from './regionFit';
import { getTrinketLimit } from '../data/trinketEffects';

/**
 * Dos heroes de la misma clase en la misma party.
 *
 * La libreria las tiene a proposito -- Ballad Quartet son cuatro Bufones y ahi
 * esta la gracia-- pero son comps *especiales*, elegidas a mano por lo que
 * hace la repeticion. El generador no las elige por eso: le salen porque el
 * roster tiene dos Cruzados y uno cabe en el hueco, que no es lo mismo. Asi
 * que se escriben, se cargan y se juegan, pero no se sugieren.
 *
 * `compClassKey` ya viene normalizado y ordenado, asi que las dos copias caen
 * juntas y basta con mirar al vecino.
 */
const repeatsAClass = (key) => {
  const classes = key.split('|');
  return classes.some((name, i) => i > 0 && name === classes[i - 1]);
};

const MAX_HEROES = PARTY_CONFIG.MAX_HEROES;
const ATTEMPTS = 60;
// A veces se coge el segundo mejor candidato en vez del mejor. Es lo unico que
// hay de azar, y esta ahi por una razon concreta: buscar el optimo y quedarse
// solo con el devuelve SIEMPRE la misma comp para el mismo roster, y "dame
// otra" tiene que poder dar otra. Los intentos se guardan todos y se ordenan
// por nota, asi que esto ensancha el abanico sin bajar el techo.
const EXPLORE = 0.35;
// Cuantos candidatos se puntuan a fondo en cada rango.
//
// Puntuar una party no es gratis y sin tope el coste crece con el roster:
// 60 intentos x 4 rangos x N clases son 240*N partys puntuadas. Con las 20
// vanilla no se nota; con 644 clases modded en `modded_heroes.js`, un roster de
// 200 heroes tardaba cuatro segundos por sugerencia.
//
// 24 esta por encima de las 20 vanilla a proposito: un roster normal --las
// vanilla mas unas cuantas modded-- cabe entero, no se muestrea nada y sale
// exactamente la misma comp que antes. Solo los rosters grandes recortan, y el
// recorte sale del barajado que ya habia, asi que la muestra es aleatoria y sin
// sesgo: entre 60 intentos, una clase que merezca el sitio aparece de sobra.
const CANDIDATES_PER_RANK = 24;

/**
 * La region de una comp cuando no hay ninguna que elegir.
 *
 * `bestRegionFor` compara perfiles, asi que sin perfiles no tiene nada que
 * decir. Pasa con una libreria vacia o si `regionProfiles.js` se quedara sin
 * datos, y en ese caso vale mas devolver la region de siempre que un hueco.
 */
const FALLBACK_LOCATION = 'The Ruins';

const classData = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

/**
 * Cuanto le pega esta clase a este rango, de 0 a 1: que parte de su kit puede
 * lanzar desde ahi. Es la version continua de la regla de 3 de 4, y sirve para
 * ORDENAR candidatos antes de que la regla decida si valen.
 */
const rankFit = (heroClass, rank) => {
  const data = classData(heroClass);
  const kit = data?.skills || [];
  if (!kit.length) return 0;
  const profile = classProfile(heroClass, kit);
  if (!profile.known) return 0.5; // clase modded sin datos: ni a favor ni en contra
  return profile.launchableByRank[rank].length / profile.known;
};

const heroFromBuild = (build) => ({
  heroClass: build.heroClass,
  activeSkills: build.activeSkills,
  activeCampSkills: build.activeCampSkills,
  trinket1: build.trinket1,
  trinket2: build.trinket2,
  quirks: { positive: [...build.quirks.positive], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: []
});

/**
 * Que rangos enemigos alcanza la party, de los cuatro.
 *
 * Solo cuenta el alcance OFENSIVO, y solo el de las skills que el heroe puede
 * lanzar desde donde esta: una cura que llega al aliado 4 no responde "¿podemos
 * tocar la fila de atras?", y una skill que no puede usar tampoco. Misma regla
 * que `rankValidity`.
 */
const enemyReach = (heroes) => {
  const reached = new Set();
  heroes.forEach((hero, index) => {
    if (!hero?.heroClass) return;
    const rank = index + 1;
    (hero.activeSkills || []).forEach((name) => {
      const profile = skillProfile(hero.heroClass, name);
      if (!profile || profile.targetKind !== 'enemy') return;
      if (!profile.launch.includes(rank)) return;
      profile.target.forEach((target) => reached.add(target));
    });
  });
  return reached;
};

/**
 * Skills que un heroe NO puede lanzar desde donde esta, y heroes que no pueden
 * lanzar ninguna.
 *
 * Las dos cuentan, y por separado. Solo castigar al heroe totalmente atrapado
 * dejaba pasar una Arbalest en rango 2 con dos de cuatro skills muertas: no
 * esta rota del todo, pero esta mal puesta, y la regla de Fran es justo sobre
 * ese caso intermedio.
 */
const rankMisfit = (heroes) => {
  let unusable = 0;
  let stranded = 0;
  heroes.forEach((hero, index) => {
    const skills = hero?.heroClass ? hero.activeSkills || [] : [];
    if (!skills.length) return;
    const rank = index + 1;
    const known = skills.filter((name) => skillProfile(hero.heroClass, name));
    if (!known.length) return;
    const usable = known.filter((name) => skillProfile(hero.heroClass, name).launch.includes(rank));
    unusable += known.length - usable.length;
    if (!usable.length) stranded += 1;
  });
  return { unusable, stranded };
};

/**
 * Lo que cuesta plantar a un heroe lejos del sitio donde la libreria lo pone.
 *
 * `rankMisfit` ya castiga estar donde no puedes lanzar tus skills, pero eso no
 * distingue entre dos sitios desde los que puedes lanzarlas todas, y hay
 * clases de fondo para las que el 3 y el 4 son legales y aun asi no son lo
 * mismo. Entre Arbalest 4 / Musketeer 3 y Arbalest 3 / Musketeer 4 la
 * cobertura y la legalidad daban igual, asi que decidia el barajado -- y salia
 * lo contrario de lo que dicen las 191 fichas de las dos.
 *
 * Tres puntos como mucho por heroe, o sea lo que descuenta UNA skill que no
 * puede lanzar: suficiente para deshacer un empate, incapaz de comprar una
 * cura (20) ni de tapar un heroe atrapado (-50). Sigue siendo un generador de
 * comps nuevas y no un loro de la libreria; la libreria solo desempata.
 */
const HOME_RANK_WEIGHT = 3;

/**
 * La nota de una party ya montada. Mas alto es mejor.
 *
 * Los pesos son un orden de importancia, no una medida: llegar a los cuatro
 * rangos vale mas que llevar un aturdidor, y un heroe que no puede actuar
 * descuenta mas de lo que suma cualquier extra, porque es una party rota.
 *
 * `location` es opcional y suma lo que diga `regionFit`: si el veneno prende
 * aqui, si el sangrado esta desperdiciado, si automarcarse se paga. Sin region
 * la nota es la de siempre --lo que se mide es si la party puede pelear, y eso
 * es cierto en cualquier sitio-- que es como se puntua mientras se monta,
 * porque hasta que no esta entera no se sabe adonde conviene llevarla.
 */
export const scoreParty = (heroes, location = null) => {
  const coverage = partyCoverage(heroes);
  const filled = coverage.size;
  if (!filled) return 0;

  let score = 0;
  score += (enemyReach(heroes).size / 4) * 40;
  score += coverage.has('heal') ? 20 : 0;
  score += coverage.has('stressHeal') || coverage.has('camp:stressHeal') ? 15 : 0;
  score += ['stun', 'blight', 'bleed'].some((tag) => coverage.has(tag)) ? 10 : 0;
  score += coverage.has('mark') && coverage.has('markPayoff') ? 8 : 0;
  score += coverage.has('guard') ? 4 : 0;

  const misfit = rankMisfit(heroes);
  score -= misfit.stranded * 50;
  score -= misfit.unusable * 3;

  heroes.forEach((hero, index) => {
    if (!hero?.heroClass) return;
    score -= HOME_RANK_WEIGHT * rankHomeMiss(hero.heroClass, index + 1);
  });

  if (location) score += regionFit(heroes, location);

  return score;
};

/**
 * Pasada de mejora: probar cada intercambio de dos sitios y quedarse con los
 * que suban la nota.
 *
 * Rellenar del rango 1 al 4 nunca reconsidera, asi que si la Arbalest entra en
 * el 2 porque en ese momento era la mejor, ahi se queda aunque luego se libere
 * el 4. Son seis parejas: se prueban todas. Al cambiar de sitio hay que
 * RECONSTRUIR la loadout, porque la recomendacion depende del rango.
 */
const improveBySwapping = (heroes) => {
  let current = heroes;
  // La nota de la party actual no cambia mientras no se acepte un cambio, asi
  // que se calcula una vez por pasada y no seis. `scoreParty` no es gratis y
  // esto se llama una vez por intento.
  let currentScore = scoreParty(current);
  let improving = true;

  while (improving) {
    improving = false;
    for (let a = 0; a < MAX_HEROES && !improving; a += 1) {
      for (let b = a + 1; b < MAX_HEROES && !improving; b += 1) {
        if (!current[a]?.heroClass && !current[b]?.heroClass) continue;
        const next = [...current];
        const rebuild = (hero, rank) => {
          if (!hero?.heroClass) return hero;
          const build = bisLoadout(hero.heroClass, rank);
          return build ? heroFromBuild(build) : hero;
        };
        next[a] = rebuild(current[b], a + 1);
        next[b] = rebuild(current[a], b + 1);
        const nextScore = scoreParty(next);
        if (nextScore > currentScore) {
          current = next;
          currentScore = nextScore;
          improving = true;
        }
      }
    }
  }

  return current;
};

/**
 * Reparte los trinkets de los que solo hay UNO.
 *
 * `bisLoadout` contesta por heroe y por rango, y hace bien: la mejor pieza para
 * un Abomination de rango 2 es la que es, la lleve otro o no. Pero una party no
 * es cuatro respuestas independientes -- es un equipo saliendo del pueblo con
 * UN inventario--, y el juego marca cuantas copias deja tener a la vez
 * (`getTrinketLimit`, que sale de `.entries.trinkets.json`). De `Ancestor's Map`
 * hay una, asi que dos heroes no pueden salir con ella; de `Bleed Charm` hay las
 * que quieras, asi que pueden.
 *
 * **El limite es por objeto, no por rareza ni por hueco.** Dos trinkets
 * ancestrales DISTINTOS en la misma party son legales, y los dos en el mismo
 * heroe tambien: lo unico que no cabe es la misma pieza dos veces.
 *
 * Quien la reclama mas arriba en SU cola se la queda, y el resto baja al
 * siguiente que pueda llevar -- al tercero si el segundo tambien esta cogido.
 * Es lo que haria cualquiera repartiendo el bagaje, y es determinista: el orden
 * sale de las colas, no de en que orden se monto la party.
 */
export const resolveTrinketClashes = (heroes) => {
  const claims = [];
  heroes.forEach((hero, index) => {
    if (!hero?.heroClass) return;
    const options = bisLoadout(hero.heroClass, index + 1)?.trinketOptions || [];
    [hero.trinket1, hero.trinket2].forEach((name, slot) => {
      if (!name) return;
      const rank = options.indexOf(name);
      // Uno que no este en su cola se reclama el ultimo: no se sabe si lo
      // quiere, solo que lo lleva puesto.
      claims.push({ index, slot, name, options, rank: rank < 0 ? options.length : rank });
    });
  });
  if (!claims.length) return heroes;

  const used = new Map();
  const mine = new Map();
  const given = new Map();

  [...claims]
    .sort((a, b) => a.rank - b.rank || a.index - b.index || a.slot - b.slot)
    .forEach((claim) => {
      const already = mine.get(claim.index) || new Set();
      const free = (name) =>
        Boolean(name) && !already.has(name) && (used.get(name) || 0) < getTrinketLimit(name);

      // El suyo si puede; si no, el primero de su cola que quede libre. Si no
      // queda ninguno se deja el hueco vacio, que es mas honesto que repetir
      // una pieza que no existe dos veces.
      const pick = free(claim.name) ? claim.name : claim.options.find(free) || '';
      if (pick) {
        used.set(pick, (used.get(pick) || 0) + 1);
        already.add(pick);
      }
      mine.set(claim.index, already);
      given.set(`${claim.index}|${claim.slot}`, pick);
    });

  return heroes.map((hero, index) => {
    if (!hero?.heroClass) return hero;
    const first = given.has(`${index}|0`) ? given.get(`${index}|0`) : hero.trinket1;
    const second = given.has(`${index}|1`) ? given.get(`${index}|1`) : hero.trinket2;
    if (first === hero.trinket1 && second === hero.trinket2) return hero;
    return { ...hero, trinket1: first, trinket2: second };
  });
};

const shuffled = (list, rng) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};


const EMPTY_SLOT = () => ({
  heroClass: '',
  activeSkills: [],
  activeCampSkills: [],
  trinket1: '',
  trinket2: '',
  quirks: { positive: [], negative: [] },
  lockedQuirks: { positive: [], negative: [] },
  diseases: []
});

/** Reconstruye la loadout de un heroe para el rango en el que acaba de caer. */
const buildAt = (heroClass, rank) => {
  const build = bisLoadout(heroClass, rank);
  return build ? heroFromBuild(build) : null;
};

/**
 * Cambia UN heroe por otro del roster hasta dar con un reparto que no exista.
 *
 * Es la salida cuando la busqueda solo encuentra comps ya escritas, que es lo
 * que pasa con un roster corto: con cinco heroes hay cinco repartos posibles y
 * si cuatro estan en la libreria, barajar mas no va a descubrir el quinto. Se
 * prueban todas las sustituciones (4 ranuras x clases disponibles), se
 * reconstruye la loadout de quien entra y se ordena por nota, asi que la comp
 * nueva es la mejor de las nuevas y no la primera que aparezca.
 */
const diversify = (heroes, available, counts, wanted, place) => {
  const results = [];

  for (let slot = 0; slot < MAX_HEROES; slot += 1) {
    available.forEach((name) => {
      if (heroes[slot]?.heroClass === name) return;
      const next = [...heroes];
      const replacement = buildAt(name, slot + 1);
      if (!replacement) return;
      next[slot] = replacement;

      // Sustituir puede pedir mas copias de una clase de las que hay.
      const used = new Map();
      next.forEach((hero) => {
        if (hero?.heroClass) used.set(hero.heroClass, (used.get(hero.heroClass) || 0) + 1);
      });
      const overdrawn = [...used.entries()].some(([cls, n]) => n > countOf(counts, cls));
      if (overdrawn) return;

      const swapped = improveBySwapping(next);
      if (!wanted(compClassKey(swapped))) return;
      const improved = resolveTrinketClashes(swapped);
      const where = place(improved);
      results.push({ heroes: improved, location: where, score: scoreParty(improved, where) });
    });
  }

  return results.sort((a, b) => b.score - a.score);
};

/**
 * Monta varias partys distintas con lo que hay en el roster, de mejor a peor.
 *
 * @param {object} options
 * @param {string[]|Map} options.roster  clases disponibles, con repeticiones
 * @param {string} [options.location]  para forzar una region. Sin ella se elige
 *   la que mejor le siente a cada comp (`bestRegionFor`), que es lo que se
 *   quiere casi siempre: una comp se construye PARA un sitio, y devolver todo
 *   etiquetado "The Ruins" era una mentira comoda.
 * @param {number} [options.count]       cuantas alternativas distintas devolver
 * @param {boolean} [options.excludeKnown]  descartar los repartos que ya estan
 *   en la libreria, en el orden y la region que sea. Por defecto si: pedir una
 *   comp nueva y recibir una que ya tienes es el fallo que esto arregla.
 * @param {boolean} [options.allowRepeatClass]  permitir dos heroes de la misma
 *   clase. Por defecto no (ver `repeatsAClass`).
 * @param {function} [options.rng]       para tests deterministas
 * @returns {{heroes, location, score, coverage}[]} de mejor a peor
 */
export const generateComps = ({
  roster,
  location = null,
  count = 3,
  excludeKnown = true,
  allowRepeatClass = false,
  rng = Math.random
} = {}) => {
  const counts = toRosterCounts(roster);
  const available = [...counts.values()].map((entry) => entry.name).filter((name) => classData(name));
  if (available.length === 0) return [];

  // Distintas por REPARTO DE CLASES, no por colocacion: los mismos cuatro
  // heroes en otro orden son la misma comp (ver `compIdentity`), asi que dos
  // intentos que llegan al mismo reparto son un solo resultado y gana el mejor
  // colocado de los dos.
  // Donde va cada comp. Se decide con la party YA montada, porque la region que
  // le conviene depende de lo que acabe llevando: hasta que no estan las cuatro
  // no se sabe si es una comp de veneno o de sangrado.
  const place = (heroes) => location || bestRegionFor(heroes)?.location || FALLBACK_LOCATION;

  const found = new Map();
  const keep = (raw) => {
    const key = compClassKey(raw);
    if (!key) return;
    // El reparto de unicos va DESPUES de la pasada de intercambios, porque cada
    // intercambio reconstruye la loadout desde `bisLoadout` y volveria a poner
    // la misma pieza en dos sitios.
    const heroes = resolveTrinketClashes(raw);
    const where = place(heroes);
    const entry = { heroes, location: where, score: scoreParty(heroes, where) };
    const previous = found.get(key);
    if (!previous || entry.score > previous.score) found.set(key, entry);
  };

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const remaining = new Map(available.map((name) => [name, countOf(counts, name)]));
    const heroes = [];

    for (let rank = 1; rank <= MAX_HEROES; rank += 1) {
      const candidates = shuffled(
        available.filter((name) => (remaining.get(name) || 0) > 0),
        rng
      ).slice(0, CANDIDATES_PER_RANK);
      if (!candidates.length) break;

      // Se prueba cada candidato en este rango y se queda el que mas sube la
      // nota de la party a medio montar -- la cobertura solo se puede juzgar
      // sobre el conjunto, no clase a clase.
      const ranked = candidates
        .map((name) => {
          const build = bisLoadout(name, rank);
          if (!build) return null;
          const trial = [...heroes, heroFromBuild(build)];
          return {
            build,
            value: scoreParty(trial) + rankFit(name, rank) * 5 + (build.rankLegal ? 5 : 0)
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.value - a.value);

      const pick =
        ranked.length > 1 && rng() < EXPLORE ? ranked[1].build : ranked[0]?.build;
      if (!pick) break;
      heroes.push(heroFromBuild(pick));
      remaining.set(pick.heroClass, (remaining.get(pick.heroClass) || 1) - 1);
    }

    while (heroes.length < MAX_HEROES) heroes.push(EMPTY_SLOT());

    keep(improveBySwapping(heroes));
  }

  const isNew = (key) => Boolean(key) && !(excludeKnown && knownCompKeys().has(key));
  const wanted = (key) => isNew(key) && (allowRepeatClass || !repeatsAClass(key));
  const fresh = [...found.entries()].filter(([key]) => wanted(key)).map(([, entry]) => entry);

  // Solo salieron repartos que ya estaban escritos. Pasa con rosters cortos, y
  // barajar mas no lo arregla: hay que cambiar un heroe a proposito.
  if (!fresh.length && excludeKnown) {
    const seen = new Set();
    [...found.values()]
      .sort((a, b) => b.score - a.score)
      .forEach((entry) => {
        diversify(entry.heroes, available, counts, wanted, place).forEach((candidate) => {
          const key = compClassKey(candidate.heroes);
          if (seen.has(key)) return;
          seen.add(key);
          fresh.push(candidate);
        });
      });
  }

  return fresh
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((comp) => ({ ...comp, coverage: partyCoverage(comp.heroes) }));
};

/**
 * La mejor de todas, que es lo que quiere quien solo pide una.
 *
 * `null` cuando no hay ninguna comp NUEVA que montar -- porque el roster no da
 * para cuatro, o porque todo lo que da ya esta en la libreria. Quien llama
 * tiene que decirlo, no callarselo.
 */
export const generateComp = (options = {}) => generateComps({ ...options, count: 1 })[0] || null;
