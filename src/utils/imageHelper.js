import { BACKER_TRINKETS } from '../data/backer_trinkets';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS, MODDED_GENERAL_TRINKET_MODS } from '../data/modded_heroes';
import { COMMON_VANILLA_CAMP_SKILLS } from '../constants';
import { getAssetUrl } from '../config/assets';

// Nombres cuyo asset está subido con otra grafía. La clave es el nombre
// canónico que se muestra en la UI; el valor, el nombre de archivo real.
const IMAGE_FILE_NAME_OVERRIDES = {
  "Vvulf's Tassel": 'vvulfs_tassle',
  "Ancestor's Moustache Cream": 'ancestors_mustache_cream',
  "Hunter's Talon": 'hunters_talons',
  'The Tempting Goblet': 'tempting_goblet',
  "Thing's Crystalline Fang": 'crystalline_fang',
  "Thing's Phase Shifting Hide": 'phase_shifting_hide',
  "AJ's Growling Tome of Maddness": 'ajs_growling_tome_of_madness',
  'Crest of the 1100': 'crest_of_1100',
  'K Scorpio Necklase': 'k_scorpio_necklace',
  "Tome of Agh'Be": 'tome_of_agh_be',
  // Estos no son cambios de nombre: el asset se guardó sin el guion (o sin la
  // tilde) y toImageFileName sí los conserva.
  'Oath-breakers Sheathe': 'oathbreakers_sheathe',
  'Rough-hewn Heart': 'roughhewn_heart',
  'Skin-bound Volume': 'skinbound_volume',
  'Double-Edged Pendant': 'double_edged_pendant',
  'Blood-red Coin': 'blood_red_coin',
  'Minié Ball': 'mini_ball'
};

// Función para convertir nombres a formato de archivo
export const toImageFileName = (name) => {
  if (!name) return '';

  if (IMAGE_FILE_NAME_OVERRIDES[name]) return IMAGE_FILE_NAME_OVERRIDES[name];

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2018\u2019\u201A\u201B\u02BC\u02B9\u2032\u00B4\u0060]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^-\w_]/g, '')
    .replace(/^_+|_+$/g, '');
};

// Obtener el modId de un héroe
const getModIdFromHeroClass = (heroClass) => {
  const moddedHero = MODDED_HERO_CLASSES[heroClass];
  return moddedHero?.modId || null;
};

// Verificar si un héroe es modded
export const isModdedHero = (heroClass) => {
  return !!MODDED_HERO_CLASSES[heroClass];
};

// Rutas de imágenes
export const getHeroImagePath = (heroClass) => {
  if (!heroClass) return null;
  
  if (isModdedHero(heroClass)) {
    const moddedHero = MODDED_HERO_CLASSES[heroClass];
    const fileName = moddedHero?.image || `${toImageFileName(heroClass)}.png`;
    return getAssetUrl(`/images/modded/heroes/${fileName}`);
  }
  
  const fileName = toImageFileName(heroClass);
  return getAssetUrl(`/images/heroes/${fileName}.png`);
};

export const getSkillImagePath = (skillName, heroClass = null) => {
  if (!skillName) return null;
  
  const modId = heroClass ? getModIdFromHeroClass(heroClass) : null;
  const fileName = toImageFileName(skillName);
  
  // Si es un héroe modded, usar carpeta modded/skills con prefijo
  if (modId) {
    return getAssetUrl(`/images/modded/skills/${modId}_${fileName}.png`);
  }
  
  return getAssetUrl(`/images/skills/${fileName}.png`);
};

export const getCampSkillImagePath = (skillName, heroClass = null) => {
  if (!skillName) return null;
  
  const fileName = toImageFileName(skillName);
  
  // Si es un héroe modded, verificar si la camp skill es vanilla
  if (heroClass && isModdedHero(heroClass)) {
    const moddedHero = MODDED_HERO_CLASSES[heroClass];
    
    // Si está en vanillaCampSkills o es una skill vanilla común, usar imagen vanilla
    if (moddedHero.vanillaCampSkills?.includes(skillName) || COMMON_VANILLA_CAMP_SKILLS.includes(skillName)) {
      return getAssetUrl(`/images/camp_skills/${fileName}.png`);
    }
    
    // Si no, usar la imagen modded con prefijo
    const modId = moddedHero.modId;
    return getAssetUrl(`/images/modded/camp_skills/${modId}_${fileName}.png`);
  }
  
  // Para héroes vanilla, siempre usar carpeta vanilla
  return getAssetUrl(`/images/camp_skills/${fileName}.png`);
};

export const getTrinketImagePath = (trinketName, heroClass = null) => {
  if (!trinketName) return null;
  const fileName = toImageFileName(trinketName);
  
  // Verificar si es un backer trinket
  if (BACKER_TRINKETS.includes(trinketName)) {
    return getAssetUrl(`/images/backer_trinkets/${fileName}.png`);
  }
  
  // Verificar si es un trinket específico de clase modded
  if (heroClass && isModdedHero(heroClass)) {
    const moddedHero = MODDED_HERO_CLASSES[heroClass];
    if (moddedHero.classSpecificTrinkets?.includes(trinketName)) {
      return getAssetUrl(`/images/modded/trinkets/class_specific/${moddedHero.modId}_${fileName}.png`);
    }
  }
  
  // Verificar si es un trinket general modded. Lleva prefijo de modId igual que
  // el resto de assets modded: el nombre por sí solo no es único entre 800 mods.
  if (MODDED_GENERAL_TRINKETS.includes(trinketName)) {
    const modId = MODDED_GENERAL_TRINKET_MODS[trinketName];
    return getAssetUrl(`/images/modded/trinkets/${modId ? `${modId}_` : ''}${fileName}.png`);
  }
  
  // Trinket vanilla por defecto
  return getAssetUrl(`/images/trinkets/${fileName}.png`);
};