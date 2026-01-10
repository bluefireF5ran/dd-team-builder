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
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTeams));
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