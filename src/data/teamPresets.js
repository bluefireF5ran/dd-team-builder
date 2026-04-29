import { EMPTY_HERO } from '../constants';

const createHero = (heroClass, activeSkills, activeCampSkills, trinket1 = '', trinket2 = '', positiveQuirks = [], negativeQuirks = []) => ({
  ...EMPTY_HERO,
  heroClass,
  activeSkills,
  activeCampSkills,
  trinket1,
  trinket2,
  quirks: { positive: positiveQuirks, negative: negativeQuirks },
  lockedQuirks: { positive: [], negative: [] }
});

export const TEAM_PRESETS = [
  {
    name: 'Ruins Speed Run',
    description: 'Fast clear team for The Ruins with stun and damage',
    location: 'The Ruins',
    heroes: [
      createHero('Crusader', ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance'], ['Encourage', 'Wound Care', 'Pep Talk', 'Zealous Vigil'], 'Focus Ring', 'Holy Orders'),
      createHero('Vestal', ['Judgment', 'Dazzling Light', 'Divine Grace', 'Divine Comfort'], ['Encourage', 'Wound Care', 'Pep Talk', 'Pray'], 'Junia\'s Head', 'Surgical Gloves'),
      createHero('Plague Doctor', ['Noxious Blast', 'Plague Grenade', 'Blinding Gas', 'Battlefield Medicine'], ['Encourage', 'Wound Care', 'Pep Talk', 'The Cure'], 'Blasphemous Vial', 'Stun Amulet'),
      createHero('Hellion', ['Wicked Hack', 'Iron Swan', 'Barbaric YAWP!', 'If It Bleeds'], ['Encourage', 'Wound Care', 'Pep Talk', 'Battle Trance'], 'Hell\'s Hairpin', 'Berserk Charm')
    ]
  },
  {
    name: 'Mark Party',
    description: 'Mark-based damage team with high burst potential',
    location: 'The Weald',
    heroes: [
      createHero('Bounty Hunter', ['Collect Bounty', 'Mark for Death', 'Come Hither', 'Finish Him'], ['Encourage', 'Wound Care', 'Pep Talk', 'Planned Takedown'], 'Focus Ring', 'Legendary Bracer'),
      createHero('Arbalest', ['Sniper Shot', 'Suppressing Fire', 'Sniper\'s Mark', 'Battlefield Bandage'], ['Encourage', 'Wound Care', 'Pep Talk', 'Triage'], 'Rampart Shield', 'Glittering Spaulders'),
      createHero('Houndmaster', ['Hound\'s Rush', 'Target Whistle', 'Guard Dog', 'Lick Wounds'], ['Encourage', 'Wound Care', 'Pep Talk', 'Hound\'s Watch'], 'Spiked Collar', 'Protective Collar'),
      createHero('Occultist', ['Sacrificial Stab', 'Wyrd Reconstruction', 'Vulnerability Hex', 'Weakening Curse'], ['Encourage', 'Wound Care', 'Pep Talk', 'Dark Ritual'], 'Vial of Sand', 'Book of Sanity')
    ]
  },
  {
    name: 'Tank & Spank',
    description: 'Durable frontline with healing and stress management',
    location: 'The Warrens',
    heroes: [
      createHero('Man at Arms', ['Crush', 'Defender', 'Bellow', 'Rampart'], ['Encourage', 'Wound Care', 'Pep Talk', 'Weapons Practice'], 'Cleansing Eyepatch', 'Guardian\'s Shield'),
      createHero('Crusader', ['Smite', 'Stunning Blow', 'Bulwark of Faith', 'Battle Heal'], ['Encourage', 'Wound Care', 'Pep Talk', 'Unshakeable Leader'], 'Knight\'s Crest', 'Focus Ring'),
      createHero('Vestal', ['Judgment', 'Dazzling Light', 'Divine Grace', 'Divine Comfort'], ['Encourage', 'Wound Care', 'Pep Talk', 'Sanctuary'], 'Tome of Holy Healing', 'Surgical Gloves'),
      createHero('Jester', ['Slice Off', 'Solo', 'Battle Ballad', 'Finale'], ['Encourage', 'Wound Care', 'Pep Talk', 'Turn Back Time'], 'Bright Tambourine', 'Ancestor\'s Coat')
    ]
  },
  {
    name: 'Bleed Squad',
    description: 'Bleed-focused team for sustained damage output',
    location: 'The Courtyard',
    heroes: [
      createHero('Flagellant', ['Punish', 'Rain of Sorrows', 'Exsanguinate', 'Redeem'], ['Lash\'s Anger', 'Lash\'s Solace', 'Lash\'s Kiss', 'Lash\'s Cure'], 'Eternity\'s Collar', 'Bleed Charm'),
      createHero('Hellion', ['Wicked Hack', 'Iron Swan', 'If It Bleeds', 'Bleed Out'], ['Encourage', 'Wound Care', 'Pep Talk', 'Revel'], 'Hell\'s Hairpin', 'Berserk Charm'),
      createHero('Houndmaster', ['Hound\'s Rush', 'Target Whistle', 'Guard Dog', 'Cry Havoc'], ['Encourage', 'Wound Care', 'Pep Talk', 'Hound\'s Watch'], 'Spiked Collar', 'Protective Collar'),
      createHero('Plague Doctor', ['Noxious Blast', 'Plague Grenade', 'Battlefield Medicine', 'Emboldening Vapours'], ['Encourage', 'Wound Care', 'Pep Talk', 'The Cure'], 'Blasphemous Vial', 'Stun Amulet')
    ]
  },
  {
    name: 'Darkest Dungeon Ready',
    description: 'Balanced team designed for Darkest Dungeon quests',
    location: 'The Darkest Dungeon I',
    heroes: [
      createHero('Man at Arms', ['Crush', 'Command', 'Bellow', 'Rampart'], ['Encourage', 'Wound Care', 'Pep Talk', 'Weapons Practice'], 'Cleansing Eyepatch', 'Guardian\'s Shield'),
      createHero('Arbalest', ['Sniper Shot', 'Suppressing Fire', 'Sniper\'s Mark', 'Battlefield Bandage'], ['Encourage', 'Wound Care', 'Pep Talk', 'Triage'], 'Rampart Shield', 'Glittering Spaulders'),
      createHero('Vestal', ['Judgment', 'Dazzling Light', 'Divine Grace', 'Divine Comfort'], ['Encourage', 'Wound Care', 'Pep Talk', 'Sanctuary'], 'Tome of Holy Healing', 'Surgical Gloves'),
      createHero('Houndmaster', ['Hound\'s Rush', 'Target Whistle', 'Guard Dog', 'Lick Wounds'], ['Encourage', 'Wound Care', 'Pep Talk', 'Hound\'s Watch'], 'Spiked Collar', 'Protective Collar')
    ]
  },
  {
    name: 'Stun Lock Party',
    description: 'Maximum stun potential to control every fight',
    location: 'The Cove',
    heroes: [
      createHero('Plague Doctor', ['Noxious Blast', 'Blinding Gas', 'Incision', 'Battlefield Medicine'], ['Encourage', 'Wound Care', 'Pep Talk', 'The Cure'], 'Blasphemous Vial', 'Stun Amulet'),
      createHero('Bounty Hunter', ['Collect Bounty', 'Uppercut', 'Flashbang', 'Finish Him'], ['Encourage', 'Wound Care', 'Pep Talk', 'Planned Takedown'], 'Focus Ring', 'Legendary Bracer'),
      createHero('Vestal', ['Judgment', 'Dazzling Light', 'Divine Grace', 'Divine Comfort'], ['Encourage', 'Wound Care', 'Pep Talk', 'Pray'], 'Junia\'s Head', 'Surgical Gloves'),
      createHero('Crusader', ['Smite', 'Zealous Accusation', 'Stunning Blow', 'Holy Lance'], ['Encourage', 'Wound Care', 'Pep Talk', 'Zealous Vigil'], 'Focus Ring', 'Holy Orders')
    ]
  }
];
