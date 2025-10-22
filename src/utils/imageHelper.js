// Función para convertir nombres a formato de archivo
export const toImageFileName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/'/g, '') // Eliminar apóstrofes
    .replace(/\s+/g, '_') // Espacios a guiones bajos
    .replace(/[^\w_]/g, ''); // Eliminar caracteres especiales excepto guiones bajos
};

// Rutas de imágenes
export const getHeroImagePath = (heroClass) => {
  if (!heroClass) return null;
  const fileName = toImageFileName(heroClass);
  return `/images/heroes/${fileName}.png`;
};

export const getSkillImagePath = (skillName) => {
  if (!skillName) return null;
  const fileName = toImageFileName(skillName);
  return `/images/skills/${fileName}.png`;
};

export const getCampSkillImagePath = (skillName) => {
  if (!skillName) return null;
  const fileName = toImageFileName(skillName);
  return `/images/camp_skills/${fileName}.png`;
};

export const getTrinketImagePath = (trinketName) => {
  if (!trinketName) return null;
  const fileName = toImageFileName(trinketName);
  return `/images/trinkets/${fileName}.png`;
};