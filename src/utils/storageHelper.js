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