import { useState, useCallback } from 'react';
import { PARTY_CONFIG, EMPTY_HERO } from '../constants';
import { saveTeamToFile, loadTeamFromFile } from '../utils/storageHelper';

export const useTeam = () => {
  const [teamName, setTeamName] = useState('My Team');
  const [location, setLocation] = useState('The Ruins');
  const [heroes, setHeroes] = useState(
    Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }))
  );

  const updateHero = useCallback((index, updatedHero) => {
    setHeroes(prev => {
      const newHeroes = [...prev];
      newHeroes[index] = updatedHero;
      return newHeroes;
    });
  }, []);

  const saveTeam = useCallback(() => {
    saveTeamToFile(teamName, location, heroes);
  }, [teamName, location, heroes]);

  const loadTeam = useCallback(async (file) => {
    try {
      const team = await loadTeamFromFile(file);
      setTeamName(team.teamName || 'My Team');
      setLocation(team.location || 'The Ruins');
      setHeroes(team.heroes || Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO })));
      return true;
    } catch (error) {
      alert(`Error loading team: ${error.message}`);
      return false;
    }
  }, []);

  return {
    teamName,
    setTeamName,
    location,
    setLocation,
    heroes,
    updateHero,
    saveTeam,
    loadTeam
  };
};