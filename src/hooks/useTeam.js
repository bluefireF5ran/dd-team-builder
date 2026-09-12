import { useState, useCallback, useEffect, useRef } from 'react';
import { PARTY_CONFIG } from '../constants';
import { savePresetToFile, loadTeamFromFile, saveTeamToLocalStorage, loadTeamsFromLocalStorage, deleteTeamFromLocalStorage, saveAllTeamsToFile, importTeamsFromFile, saveDraftTeam, loadDraftTeam } from '../utils/storageHelper';
import { toCompFileName2 } from '../utils/compNaming2';
import { getRawComps, getCompNamer, getCompFileKeys } from '../data/compIndex';
import { generateRandomTeam, generateRandomTeamFromRoster } from '../utils/randomTeam';
import { validateTeamSchema } from '../utils/validation';
import { canonicalizeTeam, canonicalizeHero } from '../utils/nameNormalizer';
import { createEmptyHero } from '../utils/heroHelper';
import { compClassKey } from '../utils/compIdentity';
import { rememberPendingComp } from '../utils/pendingComps';

const MAX_HISTORY = 20;

/** Cuatro huecos vacios e independientes: nada compartido entre ellos. */
const emptyParty = () => Array(PARTY_CONFIG.MAX_HEROES).fill(null).map(createEmptyHero);

/**
 * El equipo que se esta construyendo. Lo que NO vive aqui son las preferencias
 * (tema, contenido modded/backer/enfermedades, orden por defecto): esas son de
 * `useSettings`, porque sobreviven a la comp que tengas abierta.
 */
const cloneComp = (comp) => ({
  teamName: comp.teamName,
  location: comp.location,
  heroes: JSON.parse(JSON.stringify(comp.heroes))
});

export const useTeam = ({ defaultLocation = 'The Ruins' } = {}) => {
  // El borrador de la sesion anterior, leido UNA vez: `useState(fn)` solo llama
  // al inicializador en el primer render.
  const [draft] = useState(loadDraftTeam);

  const [teamName, setTeamNameState] = useState(() => draft?.teamName || 'My Team');
  const [location, setLocationState] = useState(() => draft?.location || defaultLocation);
  const [savedTeams, setSavedTeams] = useState([]);
  const [heroes, setHeroes] = useState(() => draft?.heroes || emptyParty());

  /**
   * Undo/redo sobre la COMP entera, no solo sobre los heroes.
   *
   * Antes el historial solo guardaba `heroes`, asi que deshacer despues de
   * cargar una comp te devolvia la party vieja con el nombre y la mazmorra de
   * la nueva: un estado que nunca existio. `TeamControls` ya prometia "This can
   * be undone with Ctrl+Z" para acciones que cambian las tres cosas.
   *
   * Y vive en estado, no en un ref. Un ref no programa render, asi que los
   * botones de deshacer/rehacer solo acertaban su estado `disabled` de rebote,
   * porque el `setHeroes` de al lado provocaba el render. Escribir el historial
   * DENTRO del updater de `setHeroes` era peor: React invoca los updaters dos
   * veces bajo StrictMode, asi que una sola edicion podia apilar dos entradas.
   */
  const [history, setHistory] = useState({ past: [], future: [] });

  /**
   * La comp vigente, para los callbacks, que asi no se recrean en cada tecla.
   *
   * Se mantiene al dia en cada escritura, no solo en render, porque React
   * agrupa las actualizaciones: dos `updateHero` seguidos en el mismo tick leen
   * el ref antes de que haya habido render, y sin eso el segundo pisaba al
   * primero. Es lo que daban gratis los updaters funcionales que esto sustituye.
   * La asignacion en render cubre el caso restante: que el estado cambie por
   * fuera (un `defaultLocation` nuevo, o React reusando el hook).
   */
  const compRef = useRef(null);
  compRef.current = { teamName, location, heroes };
  const historyRef = useRef(history);
  historyRef.current = history;

  /**
   * Aplica un cambio a la comp y lo apila en el historial como UN paso.
   * `producer` recibe la comp actual y devuelve lo que cambia de ella.
   */
  /**
   * Renombrar y cambiar de mazmorra NO son pasos de historial: escribir en el
   * campo del nombre apilaria una entrada por tecla. Pero si tienen que
   * actualizar `compRef`, o el siguiente `commit` -- que puede caer en el mismo
   * tick, antes de que haya habido render-- guardaria en el historial un nombre
   * viejo y ademas lo devolveria al estado, deshaciendo lo que acabas de teclear.
   */
  const setTeamName = useCallback((name) => {
    compRef.current = { ...compRef.current, teamName: name };
    setTeamNameState(name);
  }, []);

  const setLocation = useCallback((next) => {
    compRef.current = { ...compRef.current, location: next };
    setLocationState(next);
  }, []);

  const commit = useCallback((producer) => {
    const current = compRef.current;
    const patch = typeof producer === 'function' ? producer(current) : producer;
    if (!patch) return;
    const next = { ...current, ...patch };
    compRef.current = next;

    setHistory((prev) => ({
      past: [...prev.past, cloneComp(current)].slice(-MAX_HISTORY),
      future: []
    }));
    setTeamNameState(next.teamName);
    setLocationState(next.location);
    setHeroes(next.heroes);
  }, []);

  const travel = useCallback((direction) => {
    const { past, future } = historyRef.current;
    const stack = direction === 'undo' ? past : future;
    if (!stack.length) return;

    const target = stack[stack.length - 1];
    const current = cloneComp(compRef.current);
    compRef.current = target;
    setHistory(
      direction === 'undo'
        ? { past: past.slice(0, -1), future: [...future, current] }
        : { past: [...past, current], future: future.slice(0, -1) }
    );
    setTeamNameState(target.teamName);
    setLocationState(target.location);
    setHeroes(target.heroes);
  }, []);

  const undo = useCallback(() => travel('undo'), [travel]);
  const redo = useCallback(() => travel('redo'), [travel]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Load saved teams from localStorage on mount
  useEffect(() => {
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  /**
   * Autoguardado del borrador. Con retardo porque `teamName` cambia en cada
   * tecla y esto serializa cuatro heroes; el ultimo estado en reposo es el que
   * queda escrito.
   */
  useEffect(() => {
    const id = setTimeout(() => saveDraftTeam(teamName, location, heroes), 400);
    return () => clearTimeout(id);
  }, [teamName, location, heroes]);

  const updateHero = useCallback((index, updatedHero) => {
    commit(({ heroes: prev }) => {
      const newHeroes = [...prev];
      newHeroes[index] = updatedHero;
      return { heroes: newHeroes };
    });
  }, [commit]);

  /**
   * Drops a run of heroes into the party from rank 1 onwards, in one undoable
   * step. The Import Save modal hands over up to four at a time and a per-slot
   * `updateHero` loop would leave four entries in the history for what the
   * player did once. Slots past the end are left alone: sending two heroes
   * fills ranks 1 and 2 and does not wipe the back line.
   */
  const placeHeroes = useCallback((incoming) => {
    if (!Array.isArray(incoming) || !incoming.length) return;
    commit(({ heroes: prev }) => {
      const next = [...prev];
      incoming.slice(0, PARTY_CONFIG.MAX_HEROES).forEach((hero, index) => {
        next[index] = canonicalizeHero(hero);
      });
      return { heroes: next };
    });
  }, [commit]);

  // Swap two heroes (for drag & drop)
  const swapHeroes = useCallback((fromIndex, toIndex) => {
    commit(({ heroes: prev }) => {
      const newHeroes = [...prev];
      const temp = newHeroes[fromIndex];
      newHeroes[fromIndex] = newHeroes[toIndex];
      newHeroes[toIndex] = temp;
      return { heroes: newHeroes };
    });
  }, [commit]);

  /**
   * Guardar en el navegador, con TU nombre. La otra mitad del guardado (el
   * fichero de comp preset, con el nombre que le da la taxonomia) es
   * `savePresetFile`: son dos destinos con dos nombres, no dos formatos.
   */
  const saveTeam = useCallback(() => {
    const result = saveTeamToLocalStorage(teamName, location, heroes);
    setSavedTeams(loadTeamsFromLocalStorage());
    return result;
  }, [teamName, location, heroes]);

  /**
   * Que nombre le daria la taxonomia a este equipo, sin guardar nada. Es lo que
   * el dialogo de guardado ensena antes de que elijas destino.
   *
   * El nombre y el fichero salen de sitios distintos a proposito (el porque
   * esta en `compNaming2.js`): el nombre dice el PLAN y lo comparten varias
   * comps, asi que quien tiene que ser unico es el fichero, y ese lo decide el
   * REPARTO. Por eso la escalera necesita saber que ficheros hay ya en disco.
   *
   * Ojo: `getCompNamer` memoiza el NOMBRADOR, no la carga. `compIndex` importa
   * el barril de presets de forma estatica, asi que los bytes de las comps ya
   * estan en el bundle principal antes de que nadie abra nada; lo que se ahorra
   * la primera vez es medir los 16 ejes de las 461.
   */
  const describePreset = useCallback(() => {
    const comp = { teamName, alias: '', location, heroes };
    const record = getCompNamer().nameFor(comp);
    // El nombre que le pusiste no se pierde: pasa a alias. Salvo que ya fuera un
    // nombre de la taxonomia -- el suyo o el de otra comp, que ahora los nombres
    // se comparten a proposito--, porque entonces no es tuyo y guardar dos veces
    // dejaria un alias que no cuenta nada.
    const taxonomic = teamName === record.name
      || getRawComps().some((c) => c.teamName === teamName);
    return {
      name: record.name,
      alias: taxonomic ? '' : teamName,
      // De donde sale la ranura 1: `stack`, `engine`, `shape` o `even`. El
      // dialogo solo avisa de `even`, que es la comp que no destaca en nada.
      kind: record.kind,
      fileName: toCompFileName2(comp, record.name, getCompFileKeys()),
      location,
      heroes
    };
  }, [teamName, location, heroes]);

  /**
   * Descarga el .json ya nombrado, listo para src/data/presetComps.
   *
   * Y la apunta como pendiente. El fichero acaba de salir del navegador: hasta
   * que no lo sueltes en la carpeta y no se regenere el index, esta comp no
   * existe para la app, y el generador -- que solo ofrece comps NUEVAS-- te la
   * volveria a proponer. Se apunta aqui, que es el unico sitio por el que pasa
   * una comp camino de la libreria. Ver `pendingComps`.
   */
  const savePresetFile = useCallback(() => {
    const preset = describePreset();
    savePresetToFile(preset);
    rememberPendingComp(compClassKey(preset.heroes));
    return preset;
  }, [describePreset]);

  const teamExists = useCallback((name) => {
    const teams = loadTeamsFromLocalStorage();
    return teams.some(t => t.teamName === name);
  }, []);

  const loadTeam = useCallback(async (file) => {
    const team = await loadTeamFromFile(file);
    commit({
      teamName: team.teamName || 'My Team',
      location: team.location || defaultLocation,
      heroes: team.heroes || emptyParty()
    });
    return true;
  }, [commit, defaultLocation]);

  const loadSavedTeam = useCallback((savedTeamName) => {
    const teams = loadTeamsFromLocalStorage();
    const stored = teams.find(t => t.teamName === savedTeamName);
    // Equipos guardados antes de un renombrado (p. ej. "Vvulf's Tassle") se
    // normalizan al cargarlos.
    const team = stored && canonicalizeTeam(stored);
    // Devuelve si lo ha encontrado: otra pestana pudo borrarlo, y cerrar el
    // modal sin decir nada hacia que un fallo y un exito se vieran igual.
    if (!team) return false;

    commit({
      teamName: team.teamName,
      location: team.location || defaultLocation,
      heroes: team.heroes || emptyParty()
    });
    return true;
  }, [commit, defaultLocation]);

  const deleteSavedTeam = useCallback((savedTeamName) => {
    deleteTeamFromLocalStorage(savedTeamName);
    setSavedTeams(loadTeamsFromLocalStorage());
  }, []);

  /** El interruptor de modded es una preferencia, asi que llega como argumento. */
  const randomizeTeam = useCallback((showModdedHeroes = false) => {
    commit({ heroes: generateRandomTeam(showModdedHeroes) });
  }, [commit]);

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

    // Nombre, mazmorra y heroes entran como UN paso: los tres cambian a la vez
    // y deshacer tiene que devolver los tres, no dejarte la party anterior
    // firmada con el nombre de la sugerencia.
    commit((current) => ({
      teamName: suggestedHeroes.teamName || current.teamName,
      location: suggestedHeroes.location || current.location,
      heroes: suggestedHeroes
    }));

    return {
      teamName: suggestedHeroes.teamName,
      location: suggestedHeroes.location,
      assignedHeroes: suggestedHeroes.assignedHeroes || [],
      stressedHeroes: suggestedHeroes.stressedHeroes || [],
      missingTrinkets: suggestedHeroes.missingTrinkets || [],
      trinketSwaps: suggestedHeroes.trinketSwaps || [],
      unequipped: suggestedHeroes.unequipped || 0,
      warning: suggestedHeroes.warning || '',
      fromPreset: !!suggestedHeroes.fromPreset
    };
  }, [commit]);

  /**
   * Deja en la party una comp recien construida por `compGenerator`.
   *
   * Se nombra con el mismo motor que el resto (`compNaming2`), asi que llega ya
   * como `Plan: Matiz` y comparable con la libreria en vez de como "Random
   * Team". Un paso de historial, como cargar una comp.
   */
  const placeGeneratedComp = useCallback((comp) => {
    if (!comp || !Array.isArray(comp.heroes)) return null;
    const heroes = comp.heroes.map(canonicalizeHero);
    const named = getCompNamer().nameFor(
      { teamName: '', alias: '', location: comp.location || defaultLocation, heroes }
    );

    commit({
      teamName: named.name,
      location: comp.location || defaultLocation,
      heroes
    });

    return { teamName: named.name, kind: named.kind };
  }, [commit, defaultLocation]);

  /**
   * La puerta unica para una comp que viene de fuera.
   *
   * Da igual si llega del portapapeles o de un enlace compartido: los dos son
   * bytes que ha escrito otro, y los dos entran por aqui. Canonicalizar ANTES
   * de validar repara grafias y alias (la clase 'sibyl_ms' del mod -> 'Sibyl')
   * para que los limites del esquema se comprueben ya con los datos que la app
   * reconoce -- sin eso, el roster de 7 skills de Sibyl choca contra el tope de
   * 4 y se rechaza una comp valida.
   *
   * Un `commit`, asi que deshacer devuelve la comp anterior entera: nombre,
   * mazmorra y los cuatro heroes.
   */
  const applyImportedTeam = useCallback((raw) => {
    const team = canonicalizeTeam(raw);
    const { valid, errors } = validateTeamSchema(team);
    if (!valid) {
      throw new Error('Invalid team data: ' + errors.join(', '));
    }
    commit({
      teamName: team.teamName || 'My Team',
      location: team.location || defaultLocation,
      heroes: team.heroes || emptyParty()
    });
    return team;
  }, [commit, defaultLocation]);

  const importFromClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    return applyImportedTeam(JSON.parse(text));
  }, [applyImportedTeam]);

  const loadPreset = useCallback((preset) => {
    commit({
      teamName: preset.name,
      location: preset.location || defaultLocation,
      // Clonar: los heroes del preset son objetos compartidos del bundle.
      // Se canonicaliza por si el preset trae una grafía antigua de algún nombre.
      heroes: JSON.parse(JSON.stringify(preset.heroes)).map(canonicalizeHero)
    });
  }, [commit, defaultLocation]);

  const backupAllTeams = useCallback(() => {
    return saveAllTeamsToFile();
  }, []);

  const importBackup = useCallback(async (file) => {
    const result = await importTeamsFromFile(file);
    setSavedTeams(loadTeamsFromLocalStorage());
    return result;
  }, []);

  const clearTeam = useCallback(() => {
    commit({ teamName: 'My Team', location: defaultLocation, heroes: emptyParty() });
  }, [commit, defaultLocation]);

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
    placeGeneratedComp,
    undo,
    redo,
    canUndo,
    canRedo,
    importFromClipboard,
    applyImportedTeam,
    teamExists,
    describePreset,
    savePresetFile,
    loadPreset,
    backupAllTeams,
    importBackup,
    clearTeam
  };
};
