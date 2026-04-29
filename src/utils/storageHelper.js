import { validateTeamSchema } from './validation';

const STORAGE_KEY = 'dd_team_builder_teams';

export const saveTeamToFile = (teamName, location, heroes) => {
  const team = { teamName, location, heroes };
  const dataStr = JSON.stringify(team, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `${teamName.replace(/\s+/g, '_')}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
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
        const team = JSON.parse(event.target.result);
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
          existingTeams.shift(); // Remove oldest
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTeams));
          } catch (retryError) {
            console.error('Storage still full after pruning:', retryError);
            return false;
          }
        } else {
          console.error('Storage quota exceeded:', quotaError);
          return false;
        }
      } else {
        throw quotaError;
      }
    }
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadTeamsFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
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
  const dataStr = JSON.stringify({ version: 1, teams }, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', 'dd_teams_backup.json');
  link.click();
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
          const { valid, errors: teamErrors } = validateTeamSchema(team);
          if (valid) {
            validTeams.push(team);
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
