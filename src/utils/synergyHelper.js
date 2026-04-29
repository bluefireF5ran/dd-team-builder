const HEALER_CLASSES = ['Vestal', 'Occultist'];
const HEALER_SKILLS = {
  'Vestal': ['Divine Grace', 'Divine Comfort'],
  'Occultist': ['Wyrd Reconstruction'],
  'Plague Doctor': ['Battle Medicine'],
  'Flagellant': ['Redeem'],
  'Crusader': ['Battle Heal'],
  'Arbalest': ['Battlefield Bandage'],
  'Houndmaster': ['Lick Wounds'],
};

const MARK_ABILITIES = {
  'Bounty Hunter': ['Mark for Death'],
  'Arbalest': ['Sniper\'s Mark'],
  'Houndmaster': ['Target Strike'],
  'Occultist': ['Vulnerability Hex'],
};

const MARK_BONUS_ABILITIES = {
  'Bounty Hunter': ['Collect Bounty', 'Finish Him'],
  'Arbalest': ['Sniper Shot'],
  'Houndmaster': ['Hound\'s Rush'],
};

export const analyzeSynergy = (heroes) => {
  const notes = [];
  let level = 'good';

  const filledHeroes = heroes.filter(h => h.heroClass);
  if (filledHeroes.length < 2) {
    return { level: 'good', notes: [] };
  }

  const classNames = filledHeroes.map(h => h.heroClass);
  const uniqueClasses = new Set(classNames);

  // Check for duplicate classes
  if (uniqueClasses.size < classNames.length) {
    const duplicates = classNames.filter((c, i) => classNames.indexOf(c) !== i);
    const uniqueDupes = [...new Set(duplicates)];
    notes.push(`Duplicate class: ${uniqueDupes.join(', ')}`);
    level = 'warning';
  }

  // Check for healer presence
  const healerCount = classNames.filter(c => HEALER_CLASSES.includes(c)).length;
  const hasSecondaryHealer = filledHeroes.some(h => {
    const secondarySkills = HEALER_SKILLS[h.heroClass];
    if (!secondarySkills) return false;
    return secondarySkills.some(s => (h.activeSkills || []).includes(s));
  });

  if (healerCount === 0 && !hasSecondaryHealer) {
    notes.push('No dedicated healer — consider adding a Vestal or Occultist');
    level = level === 'danger' ? 'danger' : 'warning';
  } else if (healerCount >= 2) {
    notes.push('Multiple healers — team may lack damage');
    level = level === 'danger' ? 'danger' : 'warning';
  }

  // Check for mark synergy
  const hasMarker = classNames.some(c => MARK_ABILITIES[c]);
  const hasMarkBenefit = classNames.some(c => MARK_BONUS_ABILITIES[c]);
  if (hasMarker && hasMarkBenefit) {
    notes.push('Mark synergy detected!');
  }

  // Check for stress healers
  const stressHealers = classNames.filter(c =>
    ['Jester', 'Crusader', 'Houndmaster', 'Leper'].includes(c)
  );
  if (stressHealers.length === 0 && filledHeroes.length >= 4) {
    notes.push('No stress healer — long dungeons may be risky');
    if (level === 'good') level = 'warning';
  }

  return { level, notes };
};
