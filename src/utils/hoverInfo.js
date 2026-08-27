import { getTrinketEffect } from '../data/trinketEffects';
import { getSkillEffect } from '../data/skillEffects';
import { getQuirkEffect } from '../data/quirkEffects';
import { QUIRK_TONES, quirkTone } from './quirkStyle';

/**
 * Turns a trinket, skill or quirk into the three fields `HoverCard` draws: a
 * title, a one-line subtitle of the "stats" and the effect clauses as separate
 * lines.
 *
 * All three effect stores write their clauses joined with " | ", so splitting
 * there is what turns one dense string into a readable stack.
 */
const clauses = (effect) => (effect ? effect.split('|').map((s) => s.trim()).filter(Boolean) : []);

export function trinketHover(name) {
  const entry = getTrinketEffect(name);
  if (!entry) return { title: name, subtitle: null, lines: [] };
  return { title: name, subtitle: entry.rarity, lines: clauses(entry.effect) };
}

export function skillHover(name, heroClass) {
  const entry = getSkillEffect(name, heroClass);
  if (!entry) return { title: name, subtitle: null, lines: [] };

  const stats = [];
  if (entry.kind === 'camp') {
    if (entry.cost) stats.push(`${entry.cost} time`);
  } else {
    if (entry.type) stats.push(entry.type);
    if (entry.launch) stats.push(`from ${entry.launch}`);
    if (entry.target) stats.push(entry.target === 'Self' ? 'self' : `hits ${entry.target}`);
    if (entry.aoe) stats.push('AoE');
    if (entry.dmg) stats.push(`DMG ${entry.dmg}`);
    if (entry.acc) stats.push(`ACC ${entry.acc}`);
    if (entry.crit) stats.push(`CRIT ${entry.crit}`);
  }
  return { title: name, subtitle: stats.join(' · ') || null, lines: clauses(entry.effect) };
}

export function quirkHover(name, fallbackTone) {
  const entry = getQuirkEffect(name);
  if (!entry) return { title: name, subtitle: null, lines: [] };

  // "Disease · physical", "Prismatic · mental". The tone label carries where
  // the quirk came from, which for a disease is the thing you want first.
  const tone = QUIRK_TONES[quirkTone(name, fallbackTone)];
  const subtitle = [tone?.label, entry.classification].filter(Boolean).join(' · ');
  return { title: name, subtitle: subtitle || null, lines: clauses(entry.effect) };
}
