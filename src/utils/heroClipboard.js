// Copiar y pegar UN heroe entre comps.
//
// El portapapeles es texto plano y compartido con todo lo demas, asi que lo que
// se pega puede ser cualquier cosa. La regla aqui es no adivinar nunca: o el
// texto es un heroe reconocible y valido, o se falla con un mensaje que diga que
// hacer. Pegar medio loadout sin avisar es peor que no pegar nada.

import { EMPTY_HERO } from '../constants';
import { canonicalizeHero } from './nameNormalizer';
import { validateHeroSchema } from './validation';

/** Marca del formato propio, para distinguirlo de un JSON cualquiera. */
export const HERO_CLIPBOARD_KIND = 'dd-team-builder/hero';

/**
 * Copia quedandose SOLO con los campos de un heroe. Lo que venga de fuera puede
 * traer cualquier otra cosa y no tiene por que acabar en el estado de la app.
 * Presupone tipos ya validados: no llamar antes de validateHeroSchema.
 */
const pickHeroFields = (hero) => ({
  heroClass: hero.heroClass,
  activeSkills: [...hero.activeSkills],
  activeCampSkills: [...hero.activeCampSkills],
  trinket1: hero.trinket1 || '',
  trinket2: hero.trinket2 || '',
  quirks: {
    positive: [...hero.quirks.positive],
    negative: [...hero.quirks.negative]
  },
  lockedQuirks: {
    positive: [...hero.lockedQuirks.positive],
    negative: [...hero.lockedQuirks.negative]
  },
  diseases: [...hero.diseases]
});

/**
 * Rellena solo lo AUSENTE con los valores por defecto. Lo que venga presente se
 * deja tal cual, con su tipo original, para que la validacion pueda cazarlo: si
 * aqui se coaccionara, un `activeSkills: "Smite"` se colaria troceado en letras.
 */
const withDefaults = (hero) => ({
  ...EMPTY_HERO,
  ...hero,
  quirks: hero.quirks === undefined ? { ...EMPTY_HERO.quirks } : hero.quirks,
  lockedQuirks: hero.lockedQuirks === undefined ? { ...EMPTY_HERO.lockedQuirks } : hero.lockedQuirks,
  diseases: hero.diseases === undefined ? [] : hero.diseases
});

/** Lo que se escribe en el portapapeles: legible, y con la clase a la vista. */
export const serializeHero = (hero) =>
  JSON.stringify({ kind: HERO_CLIPBOARD_KIND, version: 1, hero: pickHeroFields(withDefaults(hero || {})) }, null, 2);

/**
 * Lee un heroe del texto del portapapeles. Acepta el formato propio y tambien un
 * objeto de heroe pelado (el que sale de un JSON de equipo), que es lo que
 * alguien pegaria a mano. Lanza con un mensaje accionable si no lo es.
 */
export const parseHeroClipboard = (text) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Clipboard is empty. Copy a hero first.');

  let raw;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    throw new Error('Clipboard does not contain a hero. Copy one with the hero copy button.');
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Clipboard does not contain a hero.');
  }

  // Un equipo entero tiene su propio boton de pegar; decirlo es mas util que
  // elegir un heroe de los cuatro por el usuario.
  if (Array.isArray(raw.heroes)) {
    throw new Error('That is a whole team. Use the team paste button instead.');
  }

  const hero = raw.kind === HERO_CLIPBOARD_KIND ? raw.hero : raw;
  if (!hero || typeof hero !== 'object' || typeof hero.heroClass !== 'string' || !hero.heroClass) {
    throw new Error('Clipboard does not contain a hero.');
  }

  const filled = withDefaults(hero);
  const { valid, errors } = validateHeroSchema(filled);
  if (!valid) throw new Error(`Invalid hero data: ${errors.join(', ')}`);

  // Igual que al cargar un preset: normaliza grafias antiguas de skills y trinkets.
  return canonicalizeHero(pickHeroFields(filled));
};

/**
 * Escribe texto en el portapapeles, con el apaño del textarea para navegadores
 * sin Clipboard API o sin permiso. Devuelve true si alguna de las dos coló.
 */
export const copyTextToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
};

/** Lee el portapapeles, traduciendo el fallo de permiso a algo accionable. */
export const readClipboardText = async () => {
  if (!navigator.clipboard?.readText) {
    throw new Error('This browser will not let the page read the clipboard.');
  }
  try {
    return await navigator.clipboard.readText();
  } catch {
    throw new Error('Could not read the clipboard. Allow clipboard access and try again.');
  }
};
