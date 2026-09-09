import { validateTeamSchema } from './validation';
import { canonicalizeTeam } from './nameNormalizer';
import { downloadJSON } from './download';

const STORAGE_KEY = 'dd_team_builder_teams';

/**
 * El equipo que estas construyendo ahora mismo, que no es lo mismo que un
 * equipo guardado: no tiene tu nombre puesto ni aparece en "My Teams", solo
 * sobrevive a recargar la pagina. Iba sin guardar en ninguna parte, asi que un
 * F5 se llevaba la party entera mientras el README prometia autoguardado.
 *
 * Versionado desde el principio -- como `dd_save_profile_v1` -- para que un
 * cambio de forma pueda ignorar el borrador viejo en vez de intentar leerlo.
 */
const DRAFT_KEY = 'dd_draft_team_v1';

/**
 * Descarga la comp con el nombre que le da la taxonomia, lista para soltarla en
 * src/data/presetComps. `teamName` es el nombre taxonomico y `alias` el que le
 * habia puesto el usuario, que es como la recuerda y como la va a buscar.
 * El formato es el mismo que lee `loadTeamFromFile`, asi que tambien se puede
 * volver a importar sin pasar por el repo.
 */
export const savePresetToFile = ({ name, alias, fileName, location, heroes }) => {
  const body = { teamName: name };
  if (alias) body.alias = alias;
  body.location = location;
  body.heroes = heroes;

  downloadJSON(fileName, body);
};

export const loadTeamFromFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Canonicalizar antes de validar: los alias (p. ej. la clase 'sibyl_ms'
        // del mod -> 'Sibyl') deben resolverse para que los límites del esquema
        // se comprueben con los datos que la app reconoce.
        const team = canonicalizeTeam(JSON.parse(event.target.result));
        const { valid, errors } = validateTeamSchema(team);
        if (!valid) {
          reject(new Error('Invalid team file: ' + errors.join(', ')));
          return;
        }
        resolve(team);
      } catch (error) {
        reject(new Error('Invalid team file format'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// LocalStorage functions
/**
 * Guarda en el navegador y CUENTA lo que ha pasado, que no siempre es "bien".
 *
 * Con la cuota llena hay tres finales distintos y el usuario tiene que poder
 * distinguirlos: se guardo; se guardo pero hubo que tirar el equipo mas
 * antiguo para hacer sitio; o no se guardo. Antes devolvia un booleano que
 * nadie miraba, asi que las tres salidas se anunciaban igual ("Saved!") y el
 * borrado del equipo mas viejo era completamente silencioso.
 *
 * @returns {{ok: boolean, prunedTeam: string|null}}
 */
export const saveTeamToLocalStorage = (teamName, location, heroes) => {
  try {
    const existingTeams = loadTeamsFromLocalStorage();
    const teamIndex = existingTeams.findIndex(t => t.teamName === teamName);
    const newTeam = {
      teamName,
      location,
      heroes,
      savedAt: new Date().toISOString()
    };

    if (teamIndex >= 0) {
      existingTeams[teamIndex] = newTeam;
    } else {
      existingTeams.push(newTeam);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTeams));
    } catch (quotaError) {
      // Handle quota exceeded: try pruning oldest team and retry
      if (quotaError.name === 'QuotaExceededError' || quotaError.code === 22) {
        if (existingTeams.length > 1) {
          const [oldest] = existingTeams.splice(0, 1);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTeams));
          } catch (retryError) {
            console.error('Storage still full after pruning:', retryError);
            return { ok: false, prunedTeam: null };
          }
          return { ok: true, prunedTeam: oldest?.teamName || null };
        }
        console.error('Storage quota exceeded:', quotaError);
        return { ok: false, prunedTeam: null };
      }
      throw quotaError;
    }
    return { ok: true, prunedTeam: null };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { ok: false, prunedTeam: null };
  }
};

export const loadTeamsFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    // `JSON.parse` devuelve lo que haya: si esa clave alguna vez guarda un
    // objeto, `savedTeams` deja de ser un array y el siguiente `.map` en
    // TeamControls o LoadCompModal tumba la pagina entera. Lo unico que hay
    // entre eso y una pantalla en blanco es el ErrorBoundary.
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

/**
 * Guarda el borrador. Silencioso a proposito: es un autoguardado, y molestar
 * con un toast cada vez que el disco esta lleno mientras escribes seria peor
 * que perderlo. El guardado explicito (`saveTeamToLocalStorage`) si lo cuenta.
 */
export const saveDraftTeam = (teamName, location, heroes) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ teamName, location, heroes }));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Lee el borrador, o null si no hay o no se puede confiar en el.
 *
 * Se valida y se canonicaliza igual que un fichero importado: es el camino de
 * entrada MENOS fiable de todos -- bytes escritos por una version anterior de
 * la app, semanas atras-- y hasta ahora los de localStorage eran justo los que
 * nadie comprobaba.
 */
export const loadDraftTeam = () => {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    const team = canonicalizeTeam(JSON.parse(stored));
    if (!team || typeof team !== 'object' || !Array.isArray(team.heroes)) return null;
    const { valid } = validateTeamSchema(team);
    return valid ? team : null;
  } catch (error) {
    console.error('Error loading the draft team:', error);
    return null;
  }
};


export const deleteTeamFromLocalStorage = (teamName) => {
  try {
    const existingTeams = loadTeamsFromLocalStorage();
    const filteredTeams = existingTeams.filter(t => t.teamName !== teamName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTeams));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
};

export const saveAllTeamsToFile = () => {
  const teams = loadTeamsFromLocalStorage();
  if (teams.length === 0) return false;
  downloadJSON('dd_teams_backup.json', { version: 1, teams });
  return true;
};

export const importTeamsFromFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Support both single team and multi-team formats
        let teams;
        if (Array.isArray(data)) {
          teams = data;
        } else if (data.teams && Array.isArray(data.teams)) {
          teams = data.teams;
        } else {
          // Single team file
          teams = [data];
        }
        // Validate each team
        const validTeams = [];
        const errors = [];
        teams.forEach((team, idx) => {
          const canon = canonicalizeTeam(team);
          const { valid, errors: teamErrors } = validateTeamSchema(canon);
          if (valid) {
            validTeams.push(canon);
          } else {
            errors.push(`Team ${idx + 1}: ${teamErrors.join(', ')}`);
          }
        });
        if (validTeams.length === 0) {
          reject(new Error('No valid teams found in file'));
          return;
        }
        // Import, skipping duplicates by name
        const existing = loadTeamsFromLocalStorage();
        const existingNames = new Set(existing.map(t => t.teamName));
        let imported = 0;
        validTeams.forEach(team => {
          if (!existingNames.has(team.teamName)) {
            existing.push(team);
            existingNames.add(team.teamName);
            imported++;
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        resolve({ total: validTeams.length, imported, skipped: validTeams.length - imported });
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
