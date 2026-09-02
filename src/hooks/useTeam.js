import { useState, useCallback, useEffect, useRef } from 'react';
import { PARTY_CONFIG } from '../constants';
import { savePresetToFile, loadTeamFromFile, saveTeamToLocalStorage, loadTeamsFromLocalStorage, deleteTeamFromLocalStorage, saveAllTeamsToFile, importTeamsFromFile } from '../utils/storageHelper';
import { nameCompAgainst, toCompFileName } from '../utils/compNaming';
import { getRawComps } from '../data/compIndex';
import { generateRandomTeam, generateRandomTeamFromRoster } from '../utils/randomTeam';
import { validateTeamSchema } from '../utils/validation';
import { canonicalizeTeam, canonicalizeHero } from '../utils/nameNormalizer';
import { createEmptyHero } from '../utils/heroHelper';

const MAX_HISTORY = 20;

/** Cuatro huecos vacios e independientes: nada compartido entre ellos. */
const emptyParty = () => Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(createEmptyHero);

/**
 * El equipo que se esta construyendo. Lo que NO vive aqui son las preferencias
 * (tema, contenido modded/backer/enfermedades, orden por defecto): esas son de
 * `useSettings`, porque sobreviven a la comp que tengas abierta.
 */
export const useTeam = ({ defaultLocation = 'The Ruins' } = {}) => {
  const [teamName, setTeamName] = useState('My Team');
  const [location, setLocation] = useState(defaultLocation);
  const [savedTeams, setSavedTeams] = useState([]);
  const [heroes, setHeroes] = useState(emptyParty);

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

  /**
   * Drops a run of heroes into the party from rank 1 onwards, in one undoable
   * step. The Import Save modal hands over up to four at a time and a per-slot
   * `updateHero` loop would leave four entries in the history for what the
   * player did once. Slots past the end are left alone: sending two heroes
   * fills ranks 1 and 2 and does not wipe the back line.
   */
  const placeHeroes = useCallback((incoming) => {
    if (!Array.isArray(incoming) || !incoming.length) return;
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      if (historyRef.current.past.length > MAX_HISTORY) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
      const next = [...prev];
      incoming.slice(0, PARTY_CONFIG.MAX_HEROES).forEach((hero, index) => {
        next[index] = canonicalizeHero(hero);
      });
      return next;
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

  /**
   * Guardar en el navegador, con TU nombre. La otra mitad del guardado (el
   * fichero de comp preset, con el nombre que le da la taxonomia) es
   * `savePresetFile`: son dos destinos con dos nombres, no dos formatos.
   */
  const saveTeam = useCallback(() => {
    saveTeamToLocalStorage(teamName, location, heroes);
    setSavedTeams(loadTeamsFromLocalStorage());
  }, [teamName, location, heroes]);

  /**
   * Que nombre le daria la taxonomia a este equipo, sin guardar nada. Es lo que
   * el dialogo de guardado ensena antes de que elijas destino.
   *
   * La libreria del bundle se carga aqui y no al arrancar (mismo criterio que
   * compIndex): quien nunca guarda un preset no paga por 157 comps.
   */
  const describePreset = useCallback(() => {
    const comp = { teamName, alias: '', location, heroes };
    const record = nameCompAgainst(comp, getRawComps());
    return {
      name: record.name,
      // El nombre que le pusiste no se pierde: pasa a alias, salvo que ya fuera
      // el taxonomico (guardar dos veces no debe dejar un alias que se repite).
      alias: record.alias,
      family: record.family.name,
      variant: record.variant,
      familySource: record.family.source,
      fileName: toCompFileName(record.name),
      location,
      heroes
    };
  }, [teamName, location, heroes]);

  /** Descarga el .json ya nombrado, listo para src/data/presetComps. */
  const savePresetFile = useCallback(() => {
    const preset = describePreset();
    savePresetToFile(preset);
    return preset;
  }, [describePreset]);

  const teamExists = useCallback((name) => {
    const teams = loadTeamsFromLocalStorage();
    return teams.some(t => t.teamName === name);
  }, []);

  const loadTeam = useCallback(async (file) => {
    const team = await loadTeamFromFile(file);
    setTeamName(team.teamName || 'My Team');
    setLocation(team.location || defaultLocation);
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return team.heroes || emptyParty();
    });
    return true;
  }, [defaultLocation]);

  const loadSavedTeam = useCallback((savedTeamName) => {
    const teams = loadTeamsFromLocalStorage();
    const stored = teams.find(t => t.teamName === savedTeamName);
    // Equipos guardados antes de un renombrado (p. ej. "Vvulf's Tassle") se
    // normalizan al cargarlos.
    const team = stored && canonicalizeTeam(stored);
    if (team) {
      setTeamName(team.teamName);
      setLocation(team.location || defaultLocation);
      setHeroes(prev => {
        historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
        historyRef.current.future = [];
        return team.heroes || emptyParty();
      });
    }
  }, [defaultLocation]);

  const deleteSavedTeam = useCallback((savedTeamName) => {
    deleteTeamFromLocalStorage(savedTeamName);
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  /** El interruptor de modded es una preferencia, asi que llega como argumento. */
  const randomizeTeam = useCallback((showModdedHeroes = false) => {
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return generateRandomTeam(showModdedHeroes);
    });
  }, []);

  /**
   * Genera una comp de preset (o fallback) con los héroes que el roster tiene
   * de verdad: `rosterHeroNames` cuenta repeticiones, así que una comp de dos
   * Doctores sólo sale si tienes dos.
   *
   * Devuelve lo que ha pasado (qué héroes tuyos la visten, qué trinkets te
   * faltan, si hubo que ceder en algo) para que quien llama lo pueda contar.
   */
  const suggestTeam = useCallback((rosterHeroNames, showModdedHeroes = false, options = {}) => {
    const suggestedHeroes = generateRandomTeamFromRoster(rosterHeroNames, showModdedHeroes, options);

    if (suggestedHeroes.teamName) {
      setTeamName(suggestedHeroes.teamName);
    }
    if (suggestedHeroes.location) {
      setLocation(suggestedHeroes.location);
    }

    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return suggestedHeroes;
    });

    return {
      teamName: suggestedHeroes.teamName,
      location: suggestedHeroes.location,
      assignedHeroes: suggestedHeroes.assignedHeroes || [],
      missingTrinkets: suggestedHeroes.missingTrinkets || [],
      warning: suggestedHeroes.warning || '',
      fromPreset: !!suggestedHeroes.fromPreset
    };
  }, []);

  const importFromClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    const raw = JSON.parse(text);
    // Canonicalizar antes de validar: repara grafías y alias (p. ej. la clase
    // 'sibyl_ms' del mod -> 'Sibyl') para que los límites del esquema se
    // comprueben ya con los datos que la app reconoce.
    const team = canonicalizeTeam(raw);
    const { valid, errors } = validateTeamSchema(team);
    if (!valid) {
      throw new Error('Invalid team data: ' + errors.join(', '));
    }
    setTeamName(team.teamName || 'My Team');
    setLocation(team.location || defaultLocation);
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      return team.heroes || emptyParty();
    });
  }, [defaultLocation]);

  const loadPreset = useCallback((preset) => {
    setTeamName(preset.name);
    setLocation(preset.location || defaultLocation);
    setHeroes(prev => {
      historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
      historyRef.current.future = [];
      // Clonar: los heroes del preset son objetos compartidos del bundle.
      // Se canonicaliza por si el preset trae una grafía antigua de algún nombre.
      return JSON.parse(JSON.stringify(preset.heroes)).map(canonicalizeHero);
    });
  }, [defaultLocation]);

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
      return emptyParty();
    });
    setTeamName('My Team');
    setLocation(defaultLocation);
  }, [defaultLocation]);

  return {
    teamName,
    setTeamName,
    location,
    setLocation,
    heroes,
    updateHero,
    placeHeroes,
    swapHeroes,
    saveTeam,
    loadTeam,
    savedTeams,
    loadSavedTeam,
    deleteSavedTeam,
    randomizeTeam,
    suggestTeam,
    undo,
    redo,
    canUndo,
    canRedo,
    importFromClipboard,
    teamExists,
    describePreset,
    savePresetFile,
    loadPreset,
    backupAllTeams,
    importBackup,
    clearTeam
  };
};
