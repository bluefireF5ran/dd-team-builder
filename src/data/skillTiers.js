/**
 * Combat skill tiers - one community tier list, transcribed.
 *
 * The source is an image (`dd-team-builder-assets/images/tierlist/tierlist.png`):
 * 119 skill icons dropped into five tiers, no names written anywhere. It was read
 * back by matching every tile against the vanilla skill icons in the assets repo,
 * so what is stored here is one person's opinion, not anything the game asserts.
 * That is also why it is off by default - see `showSkillTiers` in `useSettings`.
 *
 * **Only 17 classes are covered: 17 x 7 = the 119 tiles exactly.** The author left
 * Musketeer, Duelist and Runaway out of the list entirely, so they are absent here
 * rather than untiered-by-accident. Musketeer is NOT folded into Arbalest even
 * though they share most of an icon set - their kits differ, and inventing a tier
 * is worse than showing none. Camp skills and modded classes are not tiered either.
 * `getSkillTier` returns null for all of them and every caller degrades to no badge.
 *
 * Six skills share pixel-identical art with another skill, so the icon alone could
 * not place them. Four were settled by the missing classes (Arbalest's `Battlefield
 * Bandage` over Musketeer's `Patch Up`; `Abyssal Artillery` over the stray
 * `occultist.ability.two.png` duplicate). `Protect Me` and `Withstand` both landed
 * in B, so their split changes nothing. `Solemnity`/`Lick Wounds` and `Mark for
 * Death`/`Sniper's Mark` were Fran's call.
 *
 * Keyed class then skill, matching `skillEffects.js`: a skill name only means
 * something next to its class.
 */

/**
 * The five tiers, worst last. `label` is the tier list's own wording.
 *
 * Tailwind scans source text for class names, so `badge` is written out in full -
 * a template-built one (`bg-${colour}-500/20`) never reaches the stylesheet.
 */
export const SKILL_TIERS = [
  { id: 'S', label: 'Game-breaking',              badge: 'bg-red-500/20 text-red-300 border-red-500/60' },
  { id: 'A', label: 'Very powerful',              badge: 'bg-orange-500/20 text-orange-300 border-orange-500/60' },
  { id: 'B', label: 'Would be criminal to call bad', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/60' },
  { id: 'C', label: 'Possibly decent',            badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/60' },
  { id: 'D', label: 'Niche or worse',             badge: 'bg-lime-500/20 text-lime-300 border-lime-500/60' }
];

export const SKILL_TIER_BY_CLASS = {
  "Abomination": {
    "Transform":    "A",
    "Manacles":     "A",
    "Beast's Bile": "B",
    "Absolution":   "A",
    "Rake":         "B",
    "Rage":         "A",
    "Slam":         "B",
  },
  "Antiquarian": {
    "Nervous Stab":         "C",
    "Festering Vapours":    "B",
    "Get Down!":            "C",
    "Flashpowder":          "B",
    "Fortifying Vapours":   "C",
    "Invigorating Vapours": "S",
    "Protect Me":           "B",
  },
  "Arbalest": {
    "Sniper Shot":         "A",
    "Suppressing Fire":    "A",
    "Sniper's Mark":       "C",
    "Bola":                "B",
    "Blindfire":           "C",
    "Battlefield Bandage": "A",
    "Rallying Flare":      "B",
  },
  "Bounty Hunter": {
    "Collect Bounty": "A",
    "Mark for Death": "B",
    "Come Hither":    "B",
    "Uppercut":       "B",
    "Flashbang":      "B",
    "Finish Him":     "A",
    "Caltrops":       "C",
  },
  "Crusader": {
    "Smite":              "B",
    "Zealous Accusation": "D",
    "Stunning Blow":      "B",
    "Bulwark of Faith":   "C",
    "Battle Heal":        "B",
    "Holy Lance":         "A",
    "Inspiring Cry":      "A",
  },
  "Flagellant": {
    "Punish":          "B",
    "Rain of Sorrows": "B",
    "Exsanguinate":    "C",
    "Reclaim":         "A",
    "Redeem":          "A",
    "Endure":          "B",
    "Suffer":          "D",
  },
  "Grave Robber": {
    "Pick to the Face": "B",
    "Lunge":            "A",
    "Flashing Daggers": "C",
    "Shadow Fade":      "B",
    "Thrown Dagger":    "B",
    "Poison Darts":     "B",
    "Toxin Trickery":   "B",
  },
  "Hellion": {
    "Wicked Hack":     "B",
    "Iron Swan":       "B",
    "Barbaric YAWP!":  "B",
    "If It Bleeds":    "A",
    "Breakthrough":    "D",
    "Adrenaline Rush": "C",
    "Bleed Out":       "D",
  },
  "Highwayman": {
    "Wicked Slice":      "D",
    "Pistol Shot":       "B",
    "Point Blank Shot":  "C",
    "Grapeshot Blast":   "B",
    "Tracking Shot":     "C",
    "Duelist's Advance": "B",
    "Open Vein":         "A",
  },
  "Houndmaster": {
    "Hound's Rush":   "B",
    "Hound's Harry":  "D",
    "Target Whistle": "A",
    "Cry Havoc":      "B",
    "Guard Dog":      "S",
    "Lick Wounds":    "C",
    "Blackjack":      "A",
  },
  "Jester": {
    "Dirk Stab":      "B",
    "Harvest":        "C",
    "Finale":         "A",
    "Solo":           "S",
    "Slice Off":      "B",
    "Battle Ballad":  "C",
    "Inspiring Tune": "A",
  },
  "Leper": {
    "Chop":       "B",
    "Hew":        "C",
    "Purge":      "B",
    "Revenge":    "D",
    "Withstand":  "B",
    "Solemnity":  "A",
    "Intimidate": "S",
  },
  "Man at Arms": {
    "Crush":       "B",
    "Rampart":     "B",
    "Bellow":      "A",
    "Defender":    "A",
    "Retribution": "C",
    "Command":     "A",
    "Bolster":     "C",
  },
  "Occultist": {
    "Sacrificial Stab":     "C",
    "Abyssal Artillery":    "D",
    "Weakening Curse":      "A",
    "Wyrd Reconstruction":  "B",
    "Vulnerability Hex":    "A",
    "Hands from the Abyss": "S",
    "Daemon's Pull":        "B",
  },
  "Plague Doctor": {
    "Noxious Blast":        "A",
    "Plague Grenade":       "A",
    "Blinding Gas":         "A",
    "Incision":             "C",
    "Battlefield Medicine": "A",
    "Emboldening Vapours":  "C",
    "Disorienting Blast":   "A",
  },
  "Shieldbreaker": {
    "Pierce":       "A",
    "Puncture":     "A",
    "Adder's Kiss": "B",
    "Impale":       "D",
    "Expose":       "A",
    "Captivate":    "C",
    "Serpent Sway": "A",
  },
  "Vestal": {
    "Mace Bash":      "C",
    "Judgement":      "C",
    "Dazzling Light": "B",
    "Divine Grace":   "B",
    "Divine Comfort": "B",
    "Illumination":   "D",
    "Hand of Light":  "D",
  },
};

/**
 * The tier a class's combat skill sits in.
 * @param {string} heroClass - Exact class name, e.g. 'Houndmaster'.
 * @param {string} skill - Exact skill name.
 * @returns {string|null} 'S'|'A'|'B'|'C'|'D', or null when untiered - a camp
 *   skill, a modded class, or one of the three classes the list skipped.
 */
export function getSkillTier(heroClass, skill) {
  if (!heroClass || !skill) return null;
  return SKILL_TIER_BY_CLASS[heroClass]?.[skill] || null;
}

/**
 * The tier's display data, for anything drawing a badge.
 * @param {string} tier - A tier id.
 * @returns {{id: string, label: string, badge: string}|null}
 */
export function getSkillTierMeta(tier) {
  return SKILL_TIERS.find((t) => t.id === tier) || null;
}
