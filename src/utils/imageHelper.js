import { BACKER_TRINKETS } from '../data/backer_trinkets';
import { MODDED_HERO_CLASSES, MODDED_GENERAL_TRINKETS } from '../data/modded_heroes';
import { COMMON_VANILLA_CAMP_SKILLS } from '../constants';
import { getAssetUrl } from '../config/assets';

// Función para convertir nombres a formato de archivo
export const toImageFileName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/'/g, '')
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
  
  // Verificar si es un trinket general modded
  if (MODDED_GENERAL_TRINKETS.includes(trinketName)) {
    return getAssetUrl(`/images/modded/trinkets/${fileName}.png`);
  }
  
  // Trinket vanilla por defecto
  return getAssetUrl(`/images/trinkets/${fileName}.png`);
};