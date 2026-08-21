import { useState, useCallback, useEffect, useRef } from 'react';
import { PARTY_CONFIG, EMPTY_HERO } from '../constants';
import { saveTeamToFile, loadTeamFromFile, saveTeamToLocalStorage, loadTeamsFromLocalStorage, deleteTeamFromLocalStorage, saveAllTeamsToFile, importTeamsFromFile } from '../utils/storageHelper';
import { generateRandomTeam } from '../utils/randomTeam';
import { validateTeamSchema } from '../utils/validation';
import { canonicalizeTeam } from '../utils/nameNormalizer';

const MAX_HISTORY = 20;

export const useTeam = () => {
  const [teamName, setTeamName] = useState('My Team');
  const [location, setLocation] = useState('The Ruins');
  const [showBackerTrinkets, setShowBackerTrinkets] = useState(false);
  const [showModdedHeroes, setShowModdedHeroes] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);
  const [heroes, setHeroes] = useState(
    Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }))
  );

  // Undo/Redo history
  const historyRef = useRef({ past: [], future: [] });
  const skipHistoryRef = useRef(false);

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return;
    const previous = past.pop();
    future.push(JSON.parse(JSON.stringify(heroes)));
    skipHistoryRef.current = true;
    setHeroes(previous);
  }, [heroes]);

  const redo = useCallback(() => {
    const { future } = historyRef.current;
    if (future.length === 0) return;
    const next = future.pop();
    historyRef.current.past.push(JSON.parse(JSON.stringify(heroes)));
    skipHistoryRef.current = true;
    setHeroes(next);
  }, [heroes]);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  // Load saved teams from localStorage on mount
  useEffect(() => {
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  const updateHero = useCallback((index, updatedHero) => {
    setHeroes(prev => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      if (!skipHistoryRef.current) {
        historyRef.current.past.push(snapshot);
        if (historyRef.current.past.length > MAX_HISTORY) {
          historyRef.current.past.shift();
        }
        historyRef.current.future = [];
      }
      skipHistoryRef.current = false;
      const newHeroes = [...prev];
      newHeroes[index] = updatedHero;
      return newHeroes;
    });
  }, []);

  // Swap two heroes (for drag & drop)
  const swapHeroes = useCallback((fromIndex, toIndex) => {
    setHeroes(prev => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      historyRef.current.past.push(snapshot);
      if (historyRef.current.past.length > MAX_HISTORY) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
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

  const teamExists = useCallback((name) => {
    const teams = loadTeamsFromLocalStorage();
    return teams.some(t => t.teamName === name);
  }, []);

  const loadTeam = useCallback(async (file) => {
    const team = await loadTeamFromFile(file);
    setTeamName(team.teamName || 'My Team');
    setLocation(team.location || 'The Ruins');
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return team.heroes || Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }));
    });
    return true;
  }, []);

  const loadSavedTeam = useCallback((savedTeamName) => {
    const teams = loadTeamsFromLocalStorage();
    const team = teams.find(t => t.teamName === savedTeamName);
    if (team) {
      setTeamName(team.teamName);
      setLocation(team.location || 'The Ruins');
      setHeroes(prev => {
        historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
        historyRef.current.future = [];
        return team.heroes || Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }));
      });
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

  const randomizeTeam = useCallback(() => {
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return generateRandomTeam(showModdedHeroes);
    });
  }, [showModdedHeroes]);

  const importFromClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    const raw = JSON.parse(text);
    const { valid, errors } = validateTeamSchema(raw);
    if (!valid) {
      throw new Error('Invalid team data: ' + errors.join(', '));
    }
    const team = canonicalizeTeam(raw);
    setTeamName(team.teamName || 'My Team');
    setLocation(team.location || 'The Ruins');
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return team.heroes || Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }));
    });
  }, []);

  const loadPreset = useCallback((preset) => {
    setTeamName(preset.name);
    setLocation(preset.location || 'The Ruins');
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      // Clonar: los heroes del preset son objetos compartidos del bundle.
      return JSON.parse(JSON.stringify(preset.heroes));
    });
  }, []);

  const backupAllTeams = useCallback(() => {
    return saveAllTeamsToFile();
  }, []);

  const importBackup = useCallback(async (file) => {
    const result = await importTeamsFromFile(file);
    setSavedTeams(loadTeamsFromLocalStorage());
    return result;
  }, []);

  const clearTeam = useCallback(() => {
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(() => ({ ...EMPTY_HERO }));
    });
    setTeamName('My Team');
    setLocation('The Ruins');
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
    toggleModdedHeroes,
    randomizeTeam,
    undo,
    redo,
    canUndo,
    canRedo,
    importFromClipboard,
    teamExists,
    loadPreset,
    backupAllTeams,
    importBackup,
    clearTeam
  };
};
