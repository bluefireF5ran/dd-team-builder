// Configuración de assets externos
// Cambia esta URL cuando crees el repositorio de assets

// Para desarrollo local (imágenes en /public)
const LOCAL_ASSETS = '';

// Para producción (repositorio externo de GitHub)
// Formato: https://raw.githubusercontent.com/{usuario}/{repo}/{branch}
const GITHUB_ASSETS = 'https://raw.githubusercontent.com/bluefireF5ran/dd-team-builder-assets/main';

// Cambiar a true cuando el repo de assets esté listo
const USE_EXTERNAL_ASSETS = true;

export const ASSETS_BASE_URL = USE_EXTERNAL_ASSETS ? GITHUB_ASSETS : LOCAL_ASSETS;

// Helper para construir URLs de assets
export const getAssetUrl = (path) => {
  if (!path) return null;
  // Si la ruta ya es absoluta (http/https), devolverla tal cual
  if (path.startsWith('http')) return path;
  // Construir URL completa
  return `${ASSETS_BASE_URL}${path}`;
};
