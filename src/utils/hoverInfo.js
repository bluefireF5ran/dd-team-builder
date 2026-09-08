import React from 'react';
import { getTrinketEffect } from '../data/trinketEffects';
import { getSkillEffect } from '../data/skillEffects';
import { getSkillTier, getSkillTierMeta } from '../data/skillTiers';
import { getQuirkEffect } from '../data/quirkEffects';
import { getModdedSkillEffect, getModdedTrinketEffect, getSetBonus } from '../data/moddedEffects';
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

// A set bonus rendered as one hover line: gold when both members are equipped,
// grey and struck through when only this one is.
function setLine(set, name) {
  const missing = set.members.find((m) => m !== name) || 'both parts';
  const label = set.active ? `${set.label} bonus` : `${set.label} — needs ${missing}`;
  return React.createElement(
    'span',
    { className: set.active ? 'block text-dd-gold' : 'block text-gray-500 line-through' },
    `${label}: ${set.bonus}`
  );
}

export function trinketHover(name, otherTrinket) {
  const entry = getTrinketEffect(name) || getModdedTrinketEffect(name);
  const set = getSetBonus(name, otherTrinket);
  if (!entry && !set) return { title: name, subtitle: null, lines: [] };
  const lines = entry ? clauses(entry.effect) : [];
  if (set) lines.push(setLine(set, name));
  return { title: name, subtitle: entry ? entry.rarity : 'Set trinket', lines };
}

/**
 * @param {string} name - Exact skill name.
 * @param {string} [heroClass] - Needed for combat skills.
 * @param {object} [options]
 * @param {boolean} [options.showTier] - Append the community tier to the
 *   subtitle. Opt-in, because the tier is an opinion and the setting that
 *   turns it on is off by default; callers that never got it keep their card.
 */
export function skillHover(name, heroClass, { showTier = false } = {}) {
  const entry = getSkillEffect(name, heroClass) || getModdedSkillEffect(name, heroClass);
  const tier = showTier ? getSkillTierMeta(getSkillTier(heroClass, name)) : null;
  const tierText = tier ? `Tier ${tier.id} — ${tier.label}` : null;
  // An untiered skill still deserves its stats, and a tiered one with no known
  // effect still deserves the tier.
  if (!entry) return { title: name, subtitle: tierText, lines: [] };

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
  if (tierText) stats.push(tierText);
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
