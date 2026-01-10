import { useState, useCallback, useEffect } from 'react';
import { PARTY_CONFIG, EMPTY_HERO } from '../constants';
import { saveTeamToFile, loadTeamFromFile, saveTeamToLocalStorage, loadTeamsFromLocalStorage, deleteTeamFromLocalStorage } from '../utils/storageHelper';

export const useTeam = () => {
  const [teamName, setTeamName] = useState('My Team');
  const [location, setLocation] = useState('The Ruins');
  const [showBackerTrinkets, setShowBackerTrinkets] = useState(false);
  const [showModdedHeroes, setShowModdedHeroes] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);
  const [heroes, setHeroes] = useState(
    Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }))
  );

  // Load saved teams from localStorage on mount
  useEffect(() => {
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  const updateHero = useCallback((index, updatedHero) => {
    setHeroes(prev => {
      const newHeroes = [...prev];
      newHeroes[index] = updatedHero;
      return newHeroes;
    });
  }, []);

  // Swap two heroes (for drag & drop)
  const swapHeroes = useCallback((fromIndex, toIndex) => {
    setHeroes(prev => {
      const newHeroes = [...prev];
      const temp = newHeroes[fromIndex];
      newHeroes[fromIndex] = newHeroes[toIndex];
      newHeroes[toIndex] = temp;
      return newHeroes;
    });
  }, []);

  const saveTeam = useCallback((saveToFile = true) => {
    // Always save to localStorage
    saveTeamToLocalStorage(teamName, location, heroes);
    setSavedTeams(loadTeamsFromLocalStorage());
    
    // Optionally also save to file
    if (saveToFile) {
      saveTeamToFile(teamName, location, heroes);
    }
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

  const loadSavedTeam = useCallback((savedTeamName) => {
    const teams = loadTeamsFromLocalStorage();
    const team = teams.find(t => t.teamName === savedTeamName);
    if (team) {
      setTeamName(team.teamName);
      setLocation(team.location || 'The Ruins');
      setHeroes(team.heroes || Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO })));
    }
  }, []);

  const deleteSavedTeam = useCallback((savedTeamName) => {
    deleteTeamFromLocalStorage(savedTeamName);
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  const toggleBackerTrinkets = useCallback(() => {
    setShowBackerTrinkets(prev => !prev);
  }, []);

  const toggleModdedHeroes = useCallback(() => {
    setShowModdedHeroes(prev => !prev);
  }, []);

  return {
    teamName,
    setTeamName,
    location,
    setLocation,
    heroes,
    updateHero,
    swapHeroes,
    saveTeam,
    loadTeam,
    savedTeams,
    loadSavedTeam,
    deleteSavedTeam,
    showBackerTrinkets,
    toggleBackerTrinkets,
    showModdedHeroes,
    toggleModdedHeroes
  };
};