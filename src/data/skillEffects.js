/**
 * Skill effects - what each combat and camp skill actually does.
 *
 * GENERATED - do not hand-edit. `scripts/importSkillEffects.js` rebuilds it.
 *
 * Combat skills come from a wiki CSV export, which already carries readable
 * effect prose the game only encodes structurally. Fire's Edge (Duelist,
 * Runaway) is missing from that CSV, so those 14 are rendered from the install:
 * `<hero>.info.darkest` for the mechanics, `*.effects.darkest` and the buff
 * tables for the text. Camp skills are not in the CSV at all - all 80 come
 * from `*.camping_skills.json` plus the `camping_skill_*` templates.
 *
 * Combat entries are keyed by class then skill name, because a skill name only
 * means something next to its class. Camp entries are keyed by name alone:
 * Encourage is shared by 16 classes and does the same thing for each.
 *
 * `launch` is the ranks the hero can use it from and `target` the ranks it
 * reaches, both written rank 1 first to match the `heroes[0] = rank 1`
 * convention the rest of the app uses. Combat numbers are the level 5 values.
 *
 * `skillEffects.test.js` pins this against `heroes.js`, so adding a skill
 * without its effect fails the suite rather than showing a bare name on hover.
 */

export const COMBAT_SKILL_EFFECTS = {
  "Abomination": {
    "Transform":     { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Other Heroes: Stress +8,2 Limit: 2 Uses per Battle* (Human→ Beast, Beast→Human) | Self: From Hero: Change to mode: Human, +1 SPD (4 rds), +20% Blight Resist (4 rds), +10% DMG (3 rds), Heal 5 HP, / From Beast: Change to mode: Human, -4 SPD (4 rds)" },
    "Manacles":      { type: "Ranged", launch: "2·3", target: "1·2·3", dmg: "-60%", acc: "115%", crit: "+5%", effect: "Stun (130% base)" },
    "Beast's Bile":  { type: "Ranged", launch: "2·3", target: "2·3", aoe: true, dmg: "-90%", acc: "115%", crit: "+6%", effect: "Blight (140% base) 5 pts/rd for 3 rds, -33% Blight Resist (140% base, 3 rds)" },
    "Absolution":    { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Stress -10 | Heal 5" },
    "Rake":          { type: "Melee", launch: "1·2", target: "1·2", aoe: true, dmg: "-50%", acc: "110%", crit: "+1%", effect: "Self: Rake: +25% DMG (4 rds)" },
    "Rage":          { type: "Melee", launch: "1·2", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+11.5%" },
    "Slam":          { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-25%", acc: "100%", crit: "+5%", effect: "Knockback 2 (140% base), -20 DODGE (140% base, 4 rds), -6 SPD (140% base, 4 rds) | Self: Forward 1" },
  },
  "Antiquarian": {
    "Nervous Stab":          { type: "Melee", launch: "1·2·3·4", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+7%" },
    "Festering Vapours":     { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-75%", acc: "115%", crit: "+4%", effect: "Blight (140% base) 4 pt/rd for 3 rds, -36% Blight Resist (140% base, 3 rds)" },
    "Get Down!":             { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Back 2, +10% Blight Skill Chance, +15 DODGE, +1 SPD (4 rds)" },
    "Flashpowder":           { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-100%", acc: "115%", crit: "+0%", effect: "-15 ACC (140% base, 2 rds), Bypass/Remove Stealth" },
    "Fortifying Vapours":    { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+15% Bleed Resist, +15% Blight Resist(3 rds) | Heal 3-3" },
    "Invigorating Vapours":  { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+10 DODGE (3 rds)" },
    "Protect Me":            { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+8 DODGE (4 rds), +20% PROT (4 rds), Mark Target (3 rds), Force Guard by Ally (2 rds),3 Uses per Battle" },
  },
  "Arbalest": {
    "Sniper Shot":          { type: "Ranged", launch: "3·4", target: "2·3·4", dmg: "+0%", acc: "115%", crit: "+9%", effect: "+100% DMG vs Marked, +13% CRIT vs Marked" },
    "Suppressing Fire":     { type: "Ranged", launch: "3·4", target: "3·4", aoe: true, dmg: "-80%", acc: "115%", crit: "-6%", effect: "-20 ACC (140% base), -19% CRIT (140% base)(2 rds)" },
    "Sniper's Mark":        { type: "Ranged", launch: "3·4", target: "2·3·4", dmg: "-100%", acc: "120%", crit: "+0%", effect: "Mark Target (3 rds), -30 DODGE (140% base, 2 rds)" },
    "Bola":                 { type: "Ranged", launch: "3·4", target: "1·2", aoe: true, dmg: "-50%", acc: "115%", crit: "+6%", effect: "Knockback 1 (105% base)" },
    "Blindfire":            { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-10%", acc: "95%", crit: "+4%", effect: "Random Target | Self: +5 SPD (4 rds)" },
    "Battlefield Bandage":  { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+38% Healing Received (3 rds) | Heal 4-5" },
    "Rallying Flare":       { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", aoe: true, dmg: "-100%", acc: "115%", crit: "+0%", effect: "Bypass/Remove Stealth, Torch +7, Other Heroes: [Clear Stun, Clear Marked Target, Stress -3 (67% chance)]" },
  },
  "Bounty Hunter": {
    "Collect Bounty":  { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "+0%", acc: "105%", crit: "+11%", effect: "+90% DMG vs Marked, +35% DMG vs Human" },
    "Mark for Death":  { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-100%", acc: "120%", crit: "+0%", effect: "Mark Target (3 rds), -20% PROT (140% base, 3 rds) | Self: +5 SPD (2 rds)" },
    "Come Hither":     { type: "Ranged", launch: "1·2·3·4", target: "3·4", dmg: "-80%", acc: "110%", crit: "+4%", effect: "Mark Target (2 rds), Pull 2 (140% base)" },
    "Uppercut":        { type: "Melee", launch: "1·2", target: "1·2", dmg: "-67%", acc: "110%", crit: "+4%", effect: "Knockback 2 (140% base), Stun (140% base)" },
    "Flashbang":       { type: "Ranged", launch: "2·3·4", target: "2·3·4", dmg: "-100%", acc: "115%", crit: "+0%", effect: "Stun (150% base), Shuffle Single (140% base)" },
    "Finish Him":      { type: "Melee", launch: "1·2·3", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+9%", effect: "+60% DMG vs Stunned" },
    "Caltrops":        { type: "Ranged", launch: "2·3·4", target: "3·4", dmg: "-95%", acc: "90%", crit: "+9%", effect: "Bleed (140% base) 4 pts/rd for 3 rds, +20% DMG Taken (140% base), -8 SPD (140% base)(3 rds)" },
  },
  "Crusader": {
    "Smite":               { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "105%", crit: "+4%", effect: "+35% DMG vs Unholy" },
    "Zealous Accusation":  { type: "Ranged", launch: "1·2", target: "1·2", aoe: true, dmg: "-40%", acc: "105%", crit: "+0%" },
    "Stunning Blow":       { type: "Melee", launch: "1·2", target: "1·2", dmg: "-50%", acc: "110%", crit: "+4%", effect: "Stun (140% base)" },
    "Bulwark of Faith":    { type: "Self", launch: "1·2", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Torch +24, Limit: 1 Use per Battle | Self: +30% PROT (1 Battle), Mark Self (1 Battle)" },
    "Battle Heal":         { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Heal 5-6" },
    "Holy Lance":          { type: "Melee", launch: "3·4", target: "2·3·4", dmg: "+0%", acc: "105%", crit: "+10.5%", effect: "+35% DMG vs Unholy | Self: Forward 1" },
    "Inspiring Cry":       { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Stress -8, Torch +10 | Heal 2-2" },
  },
  "Duelist": {
    "Anticipation":   { type: "Ranged", launch: "1·2·3·4", target: "Self", effect: "Stance: defensive/aggressive | Self: Riposte (2 rds) | Change to mode: aggressive | +5% CRIT while Riposte active (4 rds) | Change to mode: defensive | +5 DODGE while Riposte active (4 rds)" },
    "Touché":         { type: "Melee", launch: "1·2·3·4", target: "1·2", dmg: "+0%", acc: "110%", crit: "+5%", effect: "Stance: defensive | Self: +35 DODGE until next Dodge (4 rds)" },
    "Feint":          { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-50%", acc: "115%", crit: "+7%", effect: "Stance: defensive | Self: Mark | Self: Riposte: +35% DMG (4 rds) | -10 ACC vs Marked (3 rds), -30% PROT (3 rds)" },
    "Disengage":      { type: "Melee", launch: "1·2", target: "1·2", dmg: "-50%", acc: "115%", crit: "+3%", effect: "Stance: defensive | Self: +10 ACC (4 rds), +6 SPD (4 rds) | Self: Attacks usable in any position (2 rds), Attacks can target any position (2 rds)" },
    "Flèche":         { type: "Melee", launch: "2·3·4", target: "1·2·3", dmg: "+20%", acc: "110%", crit: "+13%", effect: "Stance: aggressive | Self: Mark" },
    "Coup de Grâce":  { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-60%", acc: "115%", crit: "+11%", effect: "Stance: aggressive | Ignores PROT | Self: Bonus action next turn on kill | Self: +100% CRIT vs Stunned" },
    "The Boot":       { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-40%", acc: "115%", crit: "+5%", effect: "Stance: aggressive | Stun (140% base) | Knockback 1 (150% base)" },
  },
  "Flagellant": {
    "Punish":           { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "115%", crit: "+9%", effect: "Bleed (140% base) 6 pts/rd for 3 rds, -33% Bleed Resist (140% base, 3 rds)" },
    "Rain of Sorrows":  { type: "Melee", launch: "1·2", target: "3·4", aoe: true, dmg: "-67%", acc: "115%", crit: "+6%", effect: "Bleed (140% base) 5 pts/rd for 3 rds, -33% Bleed Resist (140% base, 3 rds)" },
    "Exsanguinate":     { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "110%", crit: "+7%", effect: "Bleed (140% base)9 pts/rd for 3 rds, Limit: 3 Uses per Battle, Only usable below 40% HP | Self: Heal 50% max HP, -25% Healing Skills, -25% Healing Received, -3 SPD(3 rds)" },
    "Reclaim":          { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Bleed (160% base)5 pts/rd for 3 rds | Heal 4 pts/rd for 3 rds" },
    "Redeem":           { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Limit: 2 Uses per Battle, Only usable below 40% HP | Self: Heal 35% max HP, -25% Healing Skills, -25% Healing Received, -3 SPD(3 rds) | Heal 33%max HP" },
    "Endure":           { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "-14 Stress | Self: +6 Stress, +3 SPD (4 rds)" },
    "Suffer":           { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Clear Marked Target, Transfer Blight/Bleed | Self: Mark Self (2 rds), Receive Blight/Bleed, -20% Stress (4 rds), +6% Death Blow Resist (4 rds)" },
  },
  "Grave Robber": {
    "Pick to the Face":  { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-15%", acc: "110%", crit: "+5%", effect: "Armor Piercing" },
    "Lunge":             { type: "Melee", launch: "3·4", target: "1·2·3", dmg: "+40%", acc: "115%", crit: "+12%", effect: "+33% DMG vs Blighted | Self: Forward 2" },
    "Flashing Daggers":  { type: "Ranged", launch: "2·3·4", target: "2·3", aoe: true, dmg: "-33%", acc: "110%", crit: "-1%", effect: "-33% Bleed Resist (140% base, 3 rds)" },
    "Shadow Fade":       { type: "Self", launch: "1·2", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Back 2, Stealth (2 rds), +100% DMG (2 rds), +8% CRIT (2 rds), +15 DODGE (4 rds)" },
    "Thrown Dagger":     { type: "Ranged", launch: "2·3·4", target: "2·3·4", dmg: "-10%", acc: "110%", crit: "+12%", effect: "+40% DMG vs Marked, +33% DMG vs Blighted | Self: +10 ACC (4 rds)" },
    "Poison Darts":      { type: "Ranged", launch: "2·3·4", target: "1·2·3·4", dmg: "-60%", acc: "115%", crit: "+11.5%", effect: "Blight (140% base) 4 pts/rd for 4 rds, -33% Blight Resist (140% base, 3 rds)" },
    "Toxin Trickery":    { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Limit: 1 Use per Battle | Self: Cure Blight/Bleed+13 DODGE+4 SPD(1 Battle)" },
  },
  "Hellion": {
    "Wicked Hack":      { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "105%", crit: "+8%" },
    "Iron Swan":        { type: "Melee", launch: "1", target: "4", dmg: "+0%", acc: "105%", crit: "+9%" },
    "Barbaric YAWP!":   { type: "Melee", launch: "1·2", target: "1·2", aoe: true, dmg: "+0%", acc: "115%", crit: "+0%", effect: "Stun (150% base), Limit:3 Uses per Battle | Self: -20% DMG-3 SPD(3 rds)" },
    "If It Bleeds":     { type: "Melee", launch: "1·2·3", target: "2·3", dmg: "-35%", acc: "105%", crit: "+4%", effect: "Bleed (140% base)4 pts/rd for 3 rds" },
    "Breakthrough":     { type: "Melee", launch: "2·3·4", target: "1·2·3", aoe: true, dmg: "-50%", acc: "105%", crit: "+3%", effect: "Self: Forward 1, -10% DMG, -1 SPD(3 rds)" },
    "Adrenaline Rush":  { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Cure Blight/Bleed, +10 ACC, +30% DMG(4 rds) | Heal 4" },
    "Bleed Out":        { type: "Melee", launch: "1", target: "1", dmg: "+20%", acc: "105%", crit: "+10%", effect: "Bleed (140% base)5 pts/rd for 3 rds | Self: -20% DMG, -3 SPD(3 rds)" },
  },
  "Highwayman": {
    "Wicked Slice":       { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "+15%", acc: "105%", crit: "+9%" },
    "Pistol Shot":        { type: "Ranged", launch: "1·2·3", target: "2·3·4", dmg: "-15%", acc: "105%", crit: "+11.5%", effect: "+50% DMG vs Marked" },
    "Point Blank Shot":   { type: "Ranged", launch: "1", target: "1", dmg: "+50%", acc: "115%", crit: "+9%", effect: "Knockback 1 (140% base) | Self: Back 1" },
    "Grapeshot Blast":    { type: "Ranged", launch: "2·3", target: "1·2·3", aoe: true, dmg: "-50%", acc: "95%", crit: "-5%", effect: "+8% Crits Received (140% base, 3 rds)" },
    "Tracking Shot":      { type: "Ranged", launch: "1·2·3·4", target: "2·3·4", dmg: "-80%", acc: "115%", crit: "+1%", effect: "Bypass/Remove Stealth | Self: +10 ACC, +8% CRIT, +20% DMG(1 Battle)" },
    "Duelist's Advance":  { type: "Melee", launch: "2·3·4", target: "1·2·3", dmg: "-20%", acc: "110%", crit: "+9%", effect: "Forward 1, Activates Riposte (3 rds), Riposte: [-15% DMG, +5% CRIT (3 rds)]" },
    "Open Vein":          { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-15%", acc: "115%", crit: "+4%", effect: "Bleed (140% base) 4 pts/rd for 3 rds, -33% Bleed Resist (140% base), -3 SPD (140% base)(3 rds)" },
  },
  "Houndmaster": {
    "Hound's Rush":    { type: "Ranged", launch: "2·3·4", target: "1·2·3·4", dmg: "+0%", acc: "105%", crit: "+9%", effect: "Bleed (140% base) 2 pts/rd for 3 rds, +35% DMG vs Beast, +100% DMG vs Marked" },
    "Hound's Harry":   { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", aoe: true, dmg: "-75%", acc: "105%", crit: "-1%", effect: "Bleed (150% base)3 pts/rd for 3 rds" },
    "Target Whistle":  { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-100%", acc: "120%", crit: "+0%", effect: "Mark Target (3 rds), -30% PROT (170% base, 4 rds)" },
    "Cry Havoc":       { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Stress -6 (74% base)" },
    "Guard Dog":       { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Guard Ally (2 rds) | Self: +20 DODGE (3 rds)" },
    "Lick Wounds":     { type: "Self", launch: "2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Heal 8" },
    "Blackjack":       { type: "Melee", launch: "1·2", target: "1·2·3", dmg: "-65%", acc: "115%", crit: "+9%", effect: "Stun (150% base)" },
  },
  "Jester": {
    "Dirk Stab":       { type: "Melee", launch: "1·2·3·4", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+9%", effect: "Self: Forward 1, Bypass Guard, Finale: +30% DMG (8 rds)" },
    "Harvest":         { type: "Melee", launch: "2·3", target: "2·3", aoe: true, dmg: "-50%", acc: "110%", crit: "+4%", effect: "Bleed (140% base)4 pts/rd for 3 rds | Self: Finale: +30% DMG (8 rds)" },
    "Finale":          { type: "Melee", launch: "1·2", target: "1·2·3·4", dmg: "+50%", acc: "160%", crit: "+9%", effect: "Self: Back 3, -25 DODGE, -3 SPD, +100% Stress(1 Battle), Limit:1 Use per Battle" },
    "Solo":            { type: "Ranged", launch: "3·4", target: "1·2·3", dmg: "-100%", acc: "145%", crit: "+0%", effect: "Self: Forward 3, Mark Self (3 rds), +30 DODGE (4 rds), Finale: +75% DMG (8 rds), Finale: +8% CRIT (8 rds), Limit:2 Uses per Battle" },
    "Slice Off":       { type: "Melee", launch: "2·3", target: "2·3", dmg: "-33%", acc: "115%", crit: "+12%", effect: "Bleed (140% base)5 pts/rd for 3 rds | Self: Finale: +30% DMG (8 rds)" },
    "Battle Ballad":   { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+10 ACC, +6% CRIT, +4 SPD(4 rds) | Self: Finale: +30% DMG, Finale: +8% CRIT(8 rds)" },
    "Inspiring Tune":  { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Stress -12, -20% Stress | Self: Finale: +30% DMG, Finale: +8% CRIT (8 rds)" },
  },
  "Leper": {
    "Chop":        { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "95%", crit: "+7%" },
    "Hew":         { type: "Melee", launch: "1·2", target: "1·2", aoe: true, dmg: "-50%", acc: "95%", crit: "+0%" },
    "Purge":       { type: "Melee", launch: "1", target: "1", dmg: "-40%", acc: "105%", crit: "+4%", effect: "Knockback 3 (140% base), Clear all Corpses | Self: +5 ACC (4 rds)" },
    "Revenge":     { type: "Self", launch: "1·2·3·4", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: +15 ACC, +35% DMG, +11% CRIT, -10 DODGE, +25% DMG Taken(1 Battle) Limit: 1 Use per Battle" },
    "Withstand":   { type: "Self", launch: "1·2·3", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Mark Self, +30% PROT, +30% (Blight, Bleed, Debuff, Move) Resist(1 Battle), Limit: 1 Use per Battle" },
    "Solemnity":   { type: "Self", launch: "1·2", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Stress -7 | Heal 10" },
    "Intimidate":  { type: "Melee", launch: "1", target: "1·2·3·4", dmg: "-80%", acc: "115%", crit: "+0%", effect: "Bypass/Remove Stealth, -33% DMG (140% base), -5 SPD (140% base)(3 rds) | Self: Mark Self, +4 SPD(4 rds)" },
  },
  "Man at Arms": {
    "Crush":        { type: "Melee", launch: "1·2", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+9%" },
    "Rampart":      { type: "Melee", launch: "1·2·3", target: "1·2", dmg: "-60%", acc: "110%", crit: "+9%", effect: "Knockback 1 (140% base), Stun (140% base) | Self: Forward 1" },
    "Bellow":       { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", aoe: true, dmg: "-100%", acc: "110%", crit: "+0%", effect: "-10 DODGE (140% base), -7 SPD (140% base), +5% Crits Received while Marked (140% base)(3 rds)" },
    "Defender":     { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Guard Ally (3 rds) | Self: +30% PROT (4 rds)" },
    "Retribution":  { type: "Melee", launch: "1·2·3", target: "1·2·3", dmg: "-75%", acc: "105%", crit: "+6.5%", effect: "Self: Mark Self (2 rds), Activates Riposte (3 rds), Riposte: [-20% DMG, +4% CRIT (3 rds)]" },
    "Command":      { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+10 ACC, +8% CRIT, +25% DMG while Guarded(3 rds)" },
    "Bolster":      { type: "-", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+10 DODGE (1 Battle), -20% Stress (1 Battle), Limit: 1 Use per Battle" },
  },
  "Musketeer": {
    "Aimed Shot":     { type: "Ally/Team", launch: "3·4", target: "2·3·4", dmg: "+0%", acc: "115%", crit: "+9%", effect: "+100% DMG vs Marked, +13% CRIT vs Marked" },
    "Smokescreen":    { type: "Ranged", launch: "3·4", target: "3·4", aoe: true, dmg: "-80%", acc: "115%", crit: "-6%", effect: "-20 ACC (140% base), -19% CRIT (140% base)(2 rds)" },
    "Call the Shot":  { type: "Ranged", launch: "3·4", target: "2·3·4", dmg: "-100%", acc: "120%", crit: "+0%", effect: "Mark Target (3 rds), -30 DODGE (140% base, 2 rds)" },
    "Buckshot":       { type: "Ranged", launch: "3·4", target: "1·2", aoe: true, dmg: "-50%", acc: "115%", crit: "+6%", effect: "Knockback 1 (105% base)" },
    "Sidearm":        { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-10%", acc: "95%", crit: "+4%", effect: "Random Target | Self: +5 SPD (4 rds)" },
    "Patch Up":       { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+38% Healing Received (3 rds) | Heal 4-5" },
    "Skeet Shot":     { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", aoe: true, dmg: "-100%", acc: "115%", crit: "+0%", effect: "Bypass/Remove Stealth, Torch +7, Other Heroes: [Clear Stun, Clear Marked Target, Stress -3 (67% chance)]" },
  },
  "Occultist": {
    "Sacrificial Stab":      { type: "Melee", launch: "1·2·3", target: "1·2·3", dmg: "+0%", acc: "100%", crit: "+13%", effect: "+35% DMG vs Eldritch" },
    "Abyssal Artillery":     { type: "Ranged", launch: "3·4", target: "3·4", aoe: true, dmg: "-33%", acc: "105%", crit: "+4%", effect: "+25% DMG vs Eldritch" },
    "Weakening Curse":       { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-75%", acc: "115%", crit: "+9%", effect: "-20% DMG (140% base), -20% PROT (140% base)(3 rds)" },
    "Wyrd Reconstruction":   { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Bleed (85% base)3 pt/rd for 3 rds | Heal 0-22" },
    "Vulnerability Hex":     { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-90%", acc: "115%", crit: "+9%", effect: "Mark Target (3 rds), -20 DODGE (140% base, 3 rds)" },
    "Hands from the Abyss":  { type: "Ranged", launch: "1·2", target: "1·2·3", dmg: "-50%", acc: "110%", crit: "+13%", effect: "Torch -5, Stun (150% base)" },
    "Daemon's Pull":         { type: "Ranged", launch: "2·3·4", target: "3·4", dmg: "-50%", acc: "110%", crit: "+9%", effect: "Pull 2 (140% base), Clear all Corpses" },
  },
  "Plague Doctor": {
    "Noxious Blast":         { type: "Ranged", launch: "2·3·4", target: "1·2", dmg: "-80%", acc: "115%", crit: "+9%", effect: "Blight (140% base),7 pts/rd for 3 rds, -7 ACC (140% base, 3 rds)" },
    "Plague Grenade":        { type: "Ranged", launch: "3·4", target: "3·4", aoe: true, dmg: "-90%", acc: "115%", crit: "+4%", effect: "Blight (140% base)6 pts/rd for 3 rds" },
    "Blinding Gas":          { type: "Ranged", launch: "3·4", target: "3·4", aoe: true, dmg: "-100%", acc: "115%", crit: "+0%", effect: "Stun (140% base), Limit: 3 Uses per Battle" },
    "Incision":              { type: "Ranged", launch: "1·2·3", target: "1·2", dmg: "+0%", acc: "105%", crit: "+9%", effect: "Bleed (140% base)4 pts/rd for 3 rds" },
    "Battlefield Medicine":  { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Cure Blight/Bleed | Heal 3-3" },
    "Emboldening Vapours":   { type: "Ally/Team", launch: "1·2·3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "+25% DMG, +5 SPD(1 Battle), Limit: 2 Uses per Battle" },
    "Disorienting Blast":    { type: "Ranged", launch: "2·3·4", target: "2·3·4", dmg: "-100%", acc: "115%", crit: "+0%", effect: "Shuffle Single (140% base), Stun (140% base), Clear all Corpses" },
  },
  "Runaway": {
    "Searing Strike":   { type: "Melee", launch: "1·2", target: "1·2·3", dmg: "+0%", acc: "105%", crit: "+7%", effect: "Burn 5 pts/rd | Self: +35% DMG vs Burning" },
    "Firefly":          { type: "Ranged", launch: "3·4", target: "2·3·4", dmg: "-75%", acc: "105%", crit: "+10%", effect: "Burn 9 pts/rd (140% base), +50% Burn Decay (2 rds) | Self: +6 Torch" },
    "Run and Hide":     { type: "Ranged", launch: "1·2·3·4", target: "Self", effect: "Self: Stealth (4 rds), Cannot be Stealthed while in position 1 (4 rds), Cannot be Stealthed while in position 2 (4 rds) | Self: Heal 5 pts/rd for 3 rds while Stealthed (3 rds) | Self: +50% Burn Skill Amount while Stealthed (4 rds)" },
    "Ransack":          { type: "Melee", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-10%", acc: "105%", crit: "+7%", effect: "Pull 1 (140% base) | Enemies: Clears corpses | Self: +10 ACC while Stealthed" },
    "Hearthlight":      { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", aoe: true, dmg: "-100%", acc: "120%", crit: "+0%", effect: "Ignores Stealth | Removes Stealth | Self: +8 Torch | Party: +10 ACC (3 rds) | Party: +12% CRIT vs Burning (3 rds)" },
    "Controlled Burn":  { type: "Ranged", launch: "1·2·3", target: "1·2·3", dmg: "-100%", acc: "115%", crit: "+0%", effect: "Ignores Stealth | Burn 4 pts/rd | Self: +6 Torch | Burn 5 pts/rd for 3 rds | 2 uses per battle" },
    "Backdraft":        { type: "Ranged", launch: "1·2·3", target: "1·2", dmg: "-50%", acc: "115%", crit: "+11%", effect: "Requires Burning | Ignores Guard | +25% DMG per Burn stack | Copies Burn to the target behind" },
  },
  "Shieldbreaker": {
    "Pierce":        { type: "Melee", launch: "1·2·3", target: "1·2·3·4", dmg: "-10%", acc: "110%", crit: "+9%", effect: "Armor Piercing | Self: Forward 1" },
    "Puncture":      { type: "Ranged", launch: "1·2·3·4", target: "1·2·3·4", dmg: "-50%", acc: "110%", crit: "+0%", effect: "Bypass Guard / Break Guard, Can't be Guarded (500% base, 2 rds), Pull 2 (140% base), -3 SPD (140% base, 4 rds) | Self: Forward 1" },
    "Adder's Kiss":  { type: "Melee", launch: "1", target: "1·2", dmg: "+0%", acc: "110%", crit: "+9%", effect: "Blight (140% base)5 pts/rd for 3rds | Self: Back 1" },
    "Impale":        { type: "Ranged", launch: "1", target: "1·2·3·4", aoe: true, dmg: "-60%", acc: "110%", crit: "-2%", effect: "Blight (140% base)2 pts/rd for 3 rds | Self: Back 1" },
    "Expose":        { type: "Melee", launch: "1·2·3", target: "1·2·3", dmg: "-40%", acc: "105%", crit: "+6.5%", effect: "Bypass/Remove Stealth, +10% Crits Received (140% base, 3 rds), -8 SPD (140% base, 4 rds) | Self: Back 1" },
    "Captivate":     { type: "Ranged", launch: "2·3", target: "2·3", dmg: "-25%", acc: "105%", crit: "+8%", effect: "+60% DMG vs Marked, Blight (140% base) 5 pts/rd for 3 rds" },
    "Serpent Sway":  { type: "Self", launch: "1·2·3", target: "Self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Self: Forward 1,2 https://darkestdungeon.wiki.gg/wiki/Status_effects#Aegis, +4 SPD (4 rds)" },
  },
  "Vestal": {
    "Mace Bash":       { type: "Melee", launch: "1·2", target: "1·2", dmg: "+0%", acc: "105%", crit: "+4%", effect: "+35% DMG vs Unholy" },
    "Judgement":       { type: "Ranged", launch: "3·4", target: "1·2·3·4", dmg: "-25%", acc: "105%", crit: "+9%", effect: "Self: Heal 9" },
    "Dazzling Light":  { type: "Ranged", launch: "2·3·4", target: "1·2·3", dmg: "-75%", acc: "110%", crit: "+9%", effect: "Torch +6, Stun (140% base)" },
    "Divine Grace":    { type: "Ally/Team", launch: "3·4", target: "ally 1·2·3·4 / self", dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Heal 8-9" },
    "Divine Comfort":  { type: "Ally/Team", launch: "2·3·4", target: "ally 1·2·3·4 / self", aoe: true, dmg: "-100%", acc: "1000%", crit: "+0%", effect: "Heal 4-5" },
    "Illumination":    { type: "Ranged", launch: "1·2·3", target: "1·2·3·4", dmg: "-75%", acc: "110%", crit: "+0%", effect: "Bypass/Remove Stealth, Torch +10, -30 DODGE (140% base, 4 rds)" },
    "Hand of Light":   { type: "Ranged", launch: "1·2", target: "1·2·3", dmg: "-50%", acc: "105%", crit: "+5%", effect: "+35% DMG vs Unholy | Self: +10 ACC+35% DMG(4 rds)" },
  },
};

export const CAMP_SKILL_EFFECTS = {
  "Encourage":                 { cost: 2, effect: "-15 Stress" },
  "Wound Care":                { cost: 2, effect: "Heal 15% HP | Remove Bleeding | Remove Blight" },
  "Pep Talk":                  { cost: 2, effect: "-30% Stress" },
  "Anger Management":          { cost: 3, effect: "Self: +20 Stress | Other heroes: -10 Stress" },
  "Psych Up":                  { cost: 3, effect: "Self: +20% DMG | Other heroes: +10 Stress (not religious) | Other heroes: +20 Stress (religious)" },
  "The Quickening":            { cost: 3, effect: "Self: +5 SPD" },
  "Eldritch Blood":            { cost: 3, effect: "Self: +25% Blight Resist | Self: +25% Bleed Resist | Self: +25% Disease Resist | Self: -30% Stress" },
  "Resupply":                  { cost: 1, effect: "Self: Chance to produce Food / Shovel / Antivenom / Bandage / Medicinal Herbs / Skeleton Key / Holy Water / Torch" },
  "Trinket Scrounge":          { cost: 2, effect: "Self: Chance to produce a trinket" },
  "Strange Powders":           { cost: 2, effect: "+25% Bleed Resist | +25% Blight Resist | +25% Move Resist | +25% Debuff Resist | +25% Disease Resist" },
  "Curious Incantation":       { cost: 1, effect: "Self: -30% Stress" },
  "Field Dressing":            { cost: 2, effect: "(75% chance) Heal 35% HP | (25% chance) Heal 50% HP | Remove Bleeding" },
  "Marching Plan":             { cost: 3, effect: "Other heroes: +2 SPD" },
  "Restring Crossbow":         { cost: 3, effect: "Self: +10 ACC Ranged Skills | Self: +20% DMG Ranged Skills | Self: +7% CRIT Ranged Skills | Self: +2 SPD" },
  "Triage":                    { cost: 3, effect: "Other heroes: Heal 20% HP" },
  "This Is How We Do It":      { cost: 2, effect: "Self: +10 ACC | Self: +7% CRIT" },
  "Tracking":                  { cost: 2, effect: "Self: +10% Chance Party Surprised | Self: +10% Chance Monsters Surprised" },
  "Planned Takedown":          { cost: 4, effect: "Self: +25% DMG vs size 2 | Self: +15 ACC vs size 2" },
  "Scout Ahead":               { cost: 3, effect: "Self: +20% Scouting Chance" },
  "Unshakeable Leader":        { cost: 2, effect: "Self: -30% Stress" },
  "Stand Tall":                { cost: 3, effect: "-15 Stress | Remove Mortality debuffs" },
  "Zealous Speech":            { cost: 5, effect: "Party: -15 Stress | Other heroes: -30% Stress" },
  "Zealous Vigil":             { cost: 4, effect: "Self: -25 Stress | Self: -15 Stress (afflicted) | Self: Prevents nighttime ambush" },
  "First Aid":                 { cost: 2, effect: "Heal 15% HP | Remove Bleeding | Remove Blight" },
  "Meditation":                { cost: 3, effect: "Self: +10 ACC while Riposte active | Self: +10 DODGE while Riposte active" },
  "Preparation":               { cost: 3, effect: "Self: +20% DMG on First Round | Self: +10 DODGE on First Round | Self: +2 SPD on First Round" },
  "Ruthless Instruction":      { cost: 2, effect: "+7% CRIT | +5 SPD | +10 Stress | (50% chance) +10 Stress" },
  "Again!":                    { cost: 1, effect: "Refresh Camping Skill Uses | +15 Stress" },
  "Lash's Anger":              { cost: 1, effect: "Self: +40 Stress" },
  "Lash's Solace":             { cost: 3, effect: "Self: -50 Stress" },
  "Lash's Kiss":               { cost: 3, effect: "Self: Heal 33% HP | Self: Remove Blight | Self: Remove Bleeding | Self: +5 SPD" },
  "Lash's Cure":               { cost: 2, effect: "Self: Remove Disease" },
  "Snuff Box":                 { cost: 3, effect: "Self: Remove Disease | Remove Disease" },
  "Gallows Humor":             { cost: 4, effect: "Self: -25 Stress | Other heroes: (75% chance) -20 Stress | Other heroes: (25% chance) +10 Stress" },
  "Night Moves":               { cost: 2, effect: "Self: +20% Scouting Chance" },
  "Pilfer":                    { cost: 1, effect: "Self: Chance to produce Food / Shovel / Antivenom / Bandage / Medicinal Herbs / Skeleton Key / Holy Water / Torch" },
  "Battle Trance":             { cost: 3, effect: "Self: +10% DMG if in position 1 | Self: -20% DMG if not in position 1" },
  "Reject the Gods":           { cost: 2, effect: "Self: -30 Stress | Other heroes: +7 Stress (not religious) | Other heroes: +15 Stress (religious)" },
  "Revel":                     { cost: 3, effect: "Party: +10 ACC | Party: +5 SPD | Party: -20 Stress | Party: -30% Stress" },
  "Sharpen Spear":             { cost: 3, effect: "Self: +7% CRIT" },
  "Unparalleled Finesse":      { cost: 4, effect: "Self: +10 DODGE | Self: +5 SPD | Self: +10% DMG Melee Skills | Self: +10 ACC Melee Skills" },
  "Clean Guns":                { cost: 4, effect: "Self: +10 ACC Ranged Skills | Self: +20% DMG Ranged Skills | Self: +7% CRIT Ranged Skills" },
  "Bandit's Sense":            { cost: 4, effect: "Self: Prevents nighttime ambush | Self: +10% Chance Party Surprised | Self: +10% Chance Monsters Surprised" },
  "Hound's Watch":             { cost: 4, effect: "Self: +10% Chance Party Surprised | Self: +10% Chance Monsters Surprised | Self: Prevents nighttime ambush" },
  "Therapy Dog":               { cost: 3, effect: "Other heroes: -10 Stress | Other heroes: -30% Stress" },
  "Man's Best Friend":         { cost: 2, effect: "Self: -20 Stress" },
  "Release the Hound":         { cost: 4, effect: "Self: +20% Scouting Chance" },
  "Turn Back Time":            { cost: 3, effect: "-30 Stress | -15 Stress (afflicted)" },
  "Every Rose Has Its Thorn":  { cost: 3, effect: "Other heroes: -15 Stress | Other heroes: -30% Stress" },
  "Tiger's Eye":               { cost: 3, effect: "+10 ACC | +7% CRIT" },
  "Mockery":                   { cost: 2, effect: "+20 Stress | Other heroes: -20 Stress" },
  "Let the Mask Down":         { cost: 1, effect: "Self: -25 Stress | Other heroes: +5 Stress" },
  "Bloody Shroud":             { cost: 2, effect: "Self: +25% Bleed Resist | Self: +25% Blight Resist | Self: +25% Move Resist | Self: +25% Debuff Resist" },
  "Reflection":                { cost: 3, effect: "Self: -20 Stress | Self: +10 ACC | Self: +7% CRIT" },
  "Quarantine":                { cost: 3, effect: "Self: Suffer 20% HP DMG | Other heroes: (50% chance) -20 Stress | Other heroes: (50% chance) -15 Stress" },
  "Maintain Equipment":        { cost: 4, effect: "Self: +10% PROT | Self: +20% DMG" },
  "Tactics":                   { cost: 4, effect: "Party: +10 DODGE | Party: +7% CRIT" },
  "Instruction":               { cost: 3, effect: "+10 ACC | +5 SPD" },
  "Weapons Practice":          { cost: 4, effect: "Other heroes: +20% DMG | Other heroes: (75% chance) +7% CRIT" },
  "Clean Musket":              { cost: 3, effect: "Self: +10 ACC Ranged Skills | Self: +20% DMG Ranged Skills | Self: +7% CRIT Ranged Skills | Self: +2 SPD" },
  "Abandon Hope":              { cost: 1, effect: "Self: -25 Stress | Other heroes: (50% chance) +10 Stress | Other heroes: (50% chance) +5 Stress" },
  "Dark Ritual":               { cost: 3, effect: "Heal 50% HP | Self: Reduce torchlight by 100 | Self: +15 Stress | Remove Mortality debuffs" },
  "Dark Strength":             { cost: 2, effect: "+20% DMG | Self: +15 Stress" },
  "Unspeakable Commune":       { cost: 3, effect: "Other heroes: +7 Stress | Self: Prevents nighttime ambush" },
  "Experimental Vapours":      { cost: 4, effect: "Heal 50% HP | +20% Healing Received" },
  "Leeches":                   { cost: 3, effect: "Heal 15% HP | Remove Blight | Remove Disease" },
  "The Cure":                  { cost: 1, effect: "Self: Remove Disease | Self: +25% Disease Resist" },
  "Self Medicate":             { cost: 3, effect: "Self: -10 Stress | Self: Heal 20% HP | Self: Remove Blight | Self: Remove Bleeding | Self: +10 ACC" },
  "Kindle":                    { cost: 4, effect: "Self: Chance to produce Pile of Ash | Self: Prevents nighttime ambush" },
  "Cauterize":                 { cost: 3, effect: "Remove Disease | Remove Bleeding | Remove Blight | -20% Debuff Resist" },
  "Play with Fire":            { cost: 2, effect: "On Attack Hit: Burn 3 | +10% DMG Taken" },
  "Pick Pocket":               { cost: 1, effect: "Self: Chance to produce Skeleton Key" },
  "Snake Eyes":                { cost: 3, effect: "Other heroes: Armor Piercing: +20%" },
  "Snake Skin":                { cost: 3, effect: "Self: +20% PROT | Self: +20% MAX HP" },
  "Sandstorm":                 { cost: 2, effect: "Can't be Marked" },
  "Adder's Embrace":           { cost: 2, effect: "Self: +20% Blight Skill Chance | Self: +25% Blight Resist" },
  "Bless":                     { cost: 3, effect: "+10 ACC | +10 DODGE" },
  "Chant":                     { cost: 3, effect: "-30% Stress (religious) | -30% Stress (not religious) | -15 Stress (religious) | -5 Stress (not religious)" },
  "Pray":                      { cost: 3, effect: "Other heroes: -15 Stress (religious) | Other heroes: -5 Stress (not religious) | Other heroes: +10% PROT (religious) | Other heroes: +10% PROT (not religious)" },
  "Sanctuary":                 { cost: 4, effect: "Self: Prevents nighttime ambush (religious) | Other heroes: Heal 50% HP (Mortality debuffs) | Other heroes: -25 Stress (Mortality debuffs)" },
};

/**
 * Look up a skill, combat first then camp.
 * @param {string} name - Exact skill name.
 * @param {string} [heroClass] - Needed for combat skills; camp skills are global.
 * @returns {object|null} Null when unknown.
 */
export function getSkillEffect(name, heroClass) {
  if (!name) return null;
  const byClass = heroClass && COMBAT_SKILL_EFFECTS[heroClass];
  if (byClass && byClass[name]) return { kind: 'combat', ...byClass[name] };
  if (CAMP_SKILL_EFFECTS[name]) return { kind: 'camp', ...CAMP_SKILL_EFFECTS[name] };
  return null;
}

/**
 * One-line summary for tooltips, e.g.
 * "Melee - from 2\u00b71 - hits 1\u00b72 - DMG -50% - ACC 115% - CRIT +7% - Stun (130% base)".
 * @param {string} name - Exact skill name.
 * @param {string} [heroClass] - Needed for combat skills.
 * @returns {string} Empty string when the skill has no known effect.
 */
export function getSkillEffectText(name, heroClass) {
  const e = getSkillEffect(name, heroClass);
  if (!e) return '';
  const bits = [];
  if (e.kind === 'camp') {
    if (e.cost) bits.push(`${e.cost} time`);
  } else {
    if (e.type) bits.push(e.type);
    if (e.launch) bits.push(`from ${e.launch}`);
    if (e.target) bits.push(e.target === 'Self' ? 'self' : `hits ${e.target}`);
    if (e.aoe) bits.push('AoE');
    if (e.dmg) bits.push(`DMG ${e.dmg}`);
    if (e.acc) bits.push(`ACC ${e.acc}`);
    if (e.crit) bits.push(`CRIT ${e.crit}`);
  }
  if (e.effect) bits.push(e.effect);
  return bits.join(' \u00b7 ');
}
