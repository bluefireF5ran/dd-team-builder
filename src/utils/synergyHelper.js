/**
 * Advisory notes about a party, in the panel under the composition.
 *
 * The rank checks come first and come from `rankValidity`, which reads the
 * launch/target data the game itself uses. Everything after them used to be a
 * guess over class names; it is now read from `skillProfile`, which derives
 * what a skill does from the same generated data.
 *
 * The tables this replaced were small and wrong in the ways small tables go
 * wrong. `HEALER_CLASSES` held two names, so the Musketeer's `Patch Up` and the
 * Runaway's `Run and Hide` did not exist; the derived list finds 19 healing
 * skills across 13 classes. Stress healing was the literal
 * `['Jester', 'Crusader', 'Houndmaster', 'Leper']`, which missed the
 * Abomination, the Arbalest, the Flagellant and the Musketeer. And the Plague
 * Doctor's entry read `Battle Medicine` while the skill is called
 * `Battlefield Medicine`, so that one never matched anything at all.
 *
 * ## Potential and actual
 *
 * A hero with no skills chosen yet is judged on their class's whole kit; one
 * who has chosen skills is judged on what they chose. Picking a Vestal should
 * not immediately read as "no healer", and a Vestal carrying four non-healing
 * skills should not read as one. The switch is per hero, so half-built parties
 * behave sensibly.
 */
import { rankWarnings } from './rankValidity';
import { skillProfile } from './skillProfile';
import { HERO_CLASSES } from '../data/heroes';
import { MODDED_HERO_CLASSES } from '../data/modded_heroes';

const classData = (heroClass) => HERO_CLASSES[heroClass] || MODDED_HERO_CLASSES[heroClass];

/**
 * Las skills por las que se juzga a un heroe: las que lleva, o el kit entero
 * de su clase si todavia no ha elegido ninguna.
 */
const judgedSkills = (hero) => {
  const chosen = (hero.activeSkills || []).filter(Boolean);
  if (chosen.length) return { skills: chosen, assumed: false };
  return { skills: classData(hero.heroClass)?.skills || [], assumed: true };
};

const tagsCache = new Map();

/**
 * Lo que sabe hacer un heroe, por etiqueta.
 *
 * Memoizado por clase + skills + skills de campamento, que es todo lo que mira:
 * dos heroes con la misma loadout tienen las mismas etiquetas, esten en la
 * party que esten. Importa porque el generador de comps puntua miles de partys
 * por sugerencia y la inmensa mayoria repiten heroes -- la Vestal de rango 3 es
 * literalmente la misma en todas--, asi que sin cache se recalculaba lo mismo
 * una y otra vez.
 *
 * El Set se comparte, asi que quien lo recibe solo lo lee (`partyCoverage` lo
 * recorre, no lo toca).
 */
const tagsOf = (hero) => {
  const camp = (hero.activeCampSkills || []).filter(Boolean);
  const { skills, assumed } = judgedSkills(hero);
  const key = `${hero.heroClass}\u0000${skills.join(',')}\u0000${camp.join(',')}`;
  const cached = tagsCache.get(key);
  if (cached) return cached;

  const tags = new Set();
  skills.forEach((name) => {
    const profile = skillProfile(hero.heroClass, name);
    if (profile) profile.tags.forEach((tag) => tags.add(tag));
  });
  camp.forEach((name) => {
    const profile = skillProfile(hero.heroClass, name);
    if (profile) profile.tags.forEach((tag) => tags.add(`camp:${tag}`));
  });

  const result = { tags, assumed };
  tagsCache.set(key, result);
  return result;
};

/**
 * Que sabe hacer esta party, por etiqueta.
 *
 * Se devuelve entero (no solo los avisos) porque lo van a leer tambien el
 * generador de comps y las loadouts recomendadas: es la misma pregunta.
 */
export const partyCoverage = (heroes) => {
  const filled = (heroes || []).filter((hero) => hero && hero.heroClass);
  const byTag = new Map();
  const assumedClasses = [];

  filled.forEach((hero, index) => {
    const { tags, assumed } = tagsOf(hero);
    if (assumed) assumedClasses.push(hero.heroClass);
    tags.forEach((tag) => {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push({ heroClass: hero.heroClass, rank: index + 1 });
    });
  });

  return {
    size: filled.length,
    classes: filled.map((hero) => hero.heroClass),
    byTag,
    assumedClasses,
    has: (tag) => byTag.has(tag),
    countOf: (tag) => (byTag.get(tag) || []).length
  };
};

/** "Vestal, Crusader" a partir de las entradas de una etiqueta. */
const namesFor = (coverage, tag) =>
  [...new Set((coverage.byTag.get(tag) || []).map((entry) => entry.heroClass))].join(', ');

export const analyzeSynergy = (heroes) => {
  // A problem and a compliment used to share one list, so "Mark synergy" came
  // back in the same amber as a hero who cannot act. They are different claims
  // and the panel colours them apart, so they are collected apart. `notes`
  // stays as the two of them together, which is what the count is counting.
  const warnings = [];
  const insights = [];
  let level = 'good';
  const raise = (next) => {
    if (next === 'danger') level = 'danger';
    else if (level === 'good') level = next;
  };

  // Rank problems are checked before anything else, and even for a party of
  // one: a Leper dropped into rank 4 is already wrong, and saying so while
  // there is still an empty slot beside them is the useful moment.
  rankWarnings(heroes).forEach((warning) => {
    warnings.push(warning.text);
    raise(warning.kind === 'stranded' ? 'danger' : 'warning');
  });

  const coverage = partyCoverage(heroes);
  if (coverage.size < 2) return { level, notes: [...warnings], warnings, insights };

  // Duplicate classes stay a roster question, not a skill one.
  const duplicates = coverage.classes.filter((c, i) => coverage.classes.indexOf(c) !== i);
  if (duplicates.length) {
    warnings.push(`Duplicate class: ${[...new Set(duplicates)].join(', ')}`);
    raise('warning');
  }

  const healers = coverage.countOf('heal');
  if (healers === 0) {
    warnings.push('Nothing in the party heals HP');
    raise('warning');
  } else if (healers >= 3) {
    // Tres es exceso; dos es la norma de muchas comps buenas y avisar de eso
    // era ruido.
    warnings.push(`Three or more heroes heal (${namesFor(coverage, 'heal')}) — the party may lack damage`);
    raise('warning');
  }

  if (coverage.size >= 4 && !coverage.has('stressHeal') && !coverage.has('camp:stressHeal')) {
    warnings.push('No stress healing, in battle or in camp — long dungeons may be risky');
    raise('warning');
  }

  // Mark: marcar sin nadie que lo aproveche es gastar un turno en nada, y es
  // un fallo mas util de senalar que la sinergia cuando si esta.
  if (coverage.has('mark') && coverage.has('markPayoff')) {
    insights.push(`Mark synergy: ${namesFor(coverage, 'mark')} marks, ${namesFor(coverage, 'markPayoff')} cashes it in`);
  } else if (coverage.has('mark')) {
    warnings.push(`${namesFor(coverage, 'mark')} marks, but nothing in the party hits harder on a marked target`);
    raise('warning');
  } else if (coverage.has('markPayoff')) {
    warnings.push(`${namesFor(coverage, 'markPayoff')} hits harder on a marked target, but nothing here marks`);
    raise('warning');
  }

  if (coverage.size >= 4) {
    const pressure = ['stun', 'blight', 'bleed'].filter((tag) => coverage.has(tag));
    if (!pressure.length) {
      warnings.push('No stun, blight or bleed — nothing but straight damage');
      raise('warning');
    }
  }

  if (coverage.assumedClasses.length) {
    insights.push(
      `Judged on the full kit for ${[...new Set(coverage.assumedClasses)].join(', ')} — no skills chosen yet`
    );
  }

  return { level, notes: [...warnings, ...insights], warnings, insights };
};
