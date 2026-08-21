import { HERO_SPECIFIC_TRINKETS } from './hero_specific_trinkets';

export const HERO_CLASSES = {
  'Abomination': {
    skills: ['Transform', 'Manacles', 'Beast\'s Bile', 'Absolution', 'Rake', 'Rage', 'Slam'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Anger Management', 'Psych Up', 'The Quickening', 'Eldritch Blood'],
    image: 'abomination.png',
    alwaysActive: true,
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Abomination'] || []
  },
  'Antiquarian': {
    skills: ['Nervous Stab', 'Festering Vapours', 'Get Down!', 'Flashpowder', 'Fortifying Vapours', 'Invigorating Vapours', 'Protect Me'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Resupply', 'Trinket Scrounge', 'Strange Powders', 'Curious Incantation'],
    image: 'antiquarian.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Antiquarian'] || []
  },
  'Arbalest': {
    skills: ['Sniper Shot', 'Suppressing Fire', 'Sniper\'s Mark', 'Bola', 'Blindfire', 'Battlefield Bandage', 'Rallying Flare'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Field Dressing', 'Marching Plan', 'Restring Crossbow', 'Triage'],
    image: 'arbalest.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Arbalest'] || []
  },
  'Bounty Hunter': {
    skills: ['Collect Bounty', 'Mark for Death', 'Come Hither', 'Uppercut', 'Flashbang', 'Finish Him', 'Caltrops'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'This Is How We Do It', 'Tracking', 'Planned Takedown', 'Scout Ahead'],
    image: 'bounty_hunter.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Bounty Hunter'] || []
  },
  'Crusader': {
    skills: ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Bulwark of Faith', 'Battle Heal', 'Holy Lance', 'Inspiring Cry'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Unshakeable Leader', 'Stand Tall', 'Zealous Speech', 'Zealous Vigil'],
    image: 'crusader.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Crusader'] || []
  },
  'Duelist': {
    skills: ['Anticipation', 'Touché', 'Feint', 'Disengage', 'Flèche', 'Coup de Grâce', 'The Boot'],
    campSkills: ['Encourage', 'First Aid', 'Pep Talk', 'Meditation', 'Preparation', 'Ruthless Instruction', 'Again!'],
    image: 'duelist.png',
    alwaysActive: true,
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Duelist'] || []
  },
  'Flagellant': {
    skills: ['Punish', 'Rain of Sorrows', 'Exsanguinate', 'Reclaim', 'Redeem', 'Endure', 'Suffer'],
    campSkills: ['Lash\'s Anger', 'Lash\'s Solace', 'Lash\'s Kiss', 'Lash\'s Cure'],
    image: 'flagellant.png',
    alwaysActive: true,
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Flagellant'] || []
  },
  'Grave Robber': {
    skills: ['Pick to the Face', 'Lunge', 'Flashing Daggers',  'Shadow Fade', 'Thrown Dagger', 'Poison Darts', 'Toxin Trickery'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Snuff Box', 'Gallows Humor', 'Night Moves', 'Pilfer'],
    image: 'grave_robber.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Grave Robber'] || []
  },
  'Hellion': {
    skills: ['Wicked Hack', 'Iron Swan', 'Barbaric YAWP!', 'If It Bleeds', 'Breakthrough', 'Adrenaline Rush', 'Bleed Out'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Battle Trance', 'Reject the Gods', 'Revel', 'Sharpen Spear'],
    image: 'hellion.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Hellion'] || []
  },
  'Highwayman': {
    skills: ['Wicked Slice', 'Pistol Shot', 'Point Blank Shot', 'Grapeshot Blast', 'Tracking Shot', 'Duelist\'s Advance', 'Open Vein'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Gallows Humor', 'Unparalleled Finesse', 'Clean Guns', 'Bandit\'s Sense'],
    image: 'highwayman.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Highwayman'] || []
  },
  'Houndmaster': {
    skills: ['Hound\'s Rush', 'Hound\'s Harry', 'Target Whistle', 'Cry Havoc', 'Guard Dog', 'Lick Wounds', 'Blackjack'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Hound\'s Watch', 'Therapy Dog', 'Man\'s Best Friend', 'Release the Hound'],
    image: 'houndmaster.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Houndmaster'] || []
  },
  'Jester': {
    skills: ['Dirk Stab', 'Harvest', 'Finale', 'Solo', 'Slice Off', 'Battle Ballad', 'Inspiring Tune'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Turn Back Time', 'Every Rose Has Its Thorn', 'Tiger\'s Eye', 'Mockery'],
    image: 'jester.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Jester'] || []
  },
  'Leper': {
    skills: ['Chop', 'Hew', 'Purge', 'Revenge', 'Withstand', 'Solemnity', 'Intimidate'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Let the Mask Down', 'Bloody Shroud', 'Reflection', 'Quarantine'],
    image: 'leper.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Leper'] || []
  },
  'Man at Arms': {
    skills: ['Crush', 'Rampart', 'Bellow', 'Defender', 'Retribution', 'Command', 'Bolster'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Maintain Equipment', 'Tactics', 'Instruction', 'Weapons Practice'],
    image: 'man_at_arms.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Man at Arms'] || []
  },
  'Musketeer': {
    skills: ['Aimed Shot', 'Smokescreen', 'Call the Shot', 'Buckshot', 'Sidearm', 'Patch Up', 'Skeet Shot'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Field Dressing', 'Marching Plan', 'Clean Musket', 'Triage'],
    image: 'musketeer.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Musketeer'] || []
  },
  'Occultist': {
    skills: ['Sacrificial Stab', 'Abyssal Artillery',  'Weakening Curse', 'Wyrd Reconstruction', 'Vulnerability Hex', 'Hands from the Abyss', 'Daemon\'s Pull'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Abandon Hope', 'Dark Ritual', 'Dark Strength', 'Unspeakable Commune'],
    image: 'occultist.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Occultist'] || []
  },
  'Plague Doctor': {
    skills: ['Noxious Blast', 'Plague Grenade', 'Blinding Gas', 'Incision', 'Battlefield Medicine', 'Emboldening Vapours', 'Disorienting Blast'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Experimental Vapours', 'Leeches', 'The Cure', 'Self Medicate'],
    image: 'plague_doctor.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Plague Doctor'] || []
  },
  'Runaway': {
    skills: ['Searing Strike', 'Firefly', 'Run and Hide', 'Ransack', 'Hearthlight', 'Controlled Burn', 'Backdraft'],
    campSkills: ['Encourage', 'First Aid', 'Pep Talk', 'Kindle', 'Cauterize', 'Play with Fire', 'Pick Pocket'],
    image: 'runaway.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Runaway'] || []
  },
  'Shieldbreaker': {
    skills: ['Pierce', 'Puncture', 'Adder\'s Kiss', 'Impale', 'Expose', 'Captivate', 'Serpent Sway'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Snake Eyes', 'Snake Skin', 'Sandstorm', 'Adder\'s Embrace'],
    image: 'shieldbreaker.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Shieldbreaker'] || []
  },
  'Vestal': {
    skills: ['Mace Bash', 'Judgement', 'Dazzling Light', 'Divine Grace', 'Divine Comfort', 'Illumination', 'Hand of Light'],
    campSkills: ['Encourage', 'Wound Care', 'Pep Talk', 'Bless', 'Chant', 'Pray', 'Sanctuary'],
    image: 'vestal.png',
    classSpecificTrinkets: HERO_SPECIFIC_TRINKETS['Vestal'] || []
  }
};
