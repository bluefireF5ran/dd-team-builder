import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import CompCard from './CompCard';
import { toRosterCounts, missingForComp, rosterFromHeroes } from '../../utils/rosterAvailability';
import CompFilters from './CompFilters';
import ConfirmDialog from '../common/ConfirmDialog';
import { getCompEntries } from '../../data/compIndex';
import {
  SORT_OPTIONS,
  buildCompEntry,
  buildFacets,
  filterComps,
  normalizeSavedTeam,
  sortComps
} from '../../utils/compFilters';
import { PAGE_SIZES } from '../../constants';

// 4 columnas x 6 filas. Pintar las 139 comps de golpe son ~550 retratos pedidos
// a la vez al repo de assets, que es de donde venia el tiron al abrir el modal.
const DEFAULT_PAGE_SIZE = 24;

const EMPTY_FILTERS = { heroes: [], regions: [], families: [], flags: [] };

const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

const LoadCompModal = ({
  isOpen,
  onClose,
  savedTeams = [],
  onLoadSavedTeam,
  onDeleteSavedTeam,
  onLoadPreset,
  showToast,
  // Los ajustes deciden con que orden y cuantas por pagina se abre.
  defaultSort = 'name',
  defaultPageSize = DEFAULT_PAGE_SIZE,
  // La partida importada, si la hay. Sin ella la libreria no hace ninguna
  // afirmacion sobre lo que puedes o no puedes formar.
  saveProfile = null
}) => {
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');
  const [sortId, setSortId] = useState(defaultSort);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, teamName: '' });
  const [onlyFieldable, setOnlyFieldable] = useState(false);

  // Cuenta por clase de los heroes vivos, incluidos los ocupados en el pueblo:
  // aqui se esta planificando, no saliendo esta semana.
  const rosterCounts = useMemo(
    () => (saveProfile ? toRosterCounts(rosterFromHeroes(saveProfile.heroes, { includeBusy: true })) : null),
    [saveProfile]
  );

  // El indice de la libreria se construye la primera vez que se abre el modal,
  // no al arrancar la app: quien nunca abre la libreria no lo paga.
  const libraryEntries = useMemo(() => (isOpen ? getCompEntries() : []), [isOpen]);
  const savedEntries = useMemo(
    () => (isOpen ? savedTeams.map((t) => buildCompEntry(normalizeSavedTeam(t))) : []),
    [isOpen, savedTeams]
  );

  const allEntries = activeTab === 'saved' ? savedEntries : libraryEntries;

  const filtered = useMemo(
    () =>
      sortComps(
        filterComps(allEntries, {
          ...filters,
          query: search,
          rosterCounts: onlyFieldable ? rosterCounts : null
        }),
        sortId
      ),
    [allEntries, filters, search, sortId, onlyFieldable, rosterCounts]
  );

  /**
   * Recuentos de cada chip sobre lo que de verdad queda por elegir.
   * Region y familia se cuentan IGNORANDO su propia faceta (son alternativas: hay
   * que poder cambiar de region sin vaciar la lista). Heroes y tags se cuentan CON
   * ella aplicada, porque ahi sumar significa "y ademas", y el numero que interesa
   * es cuantas comps quedarian al anadir ese heroe a los ya elegidos.
   */
  const facets = useMemo(() => {
    if (!isOpen) return { heroes: [], regions: [], families: [], flags: [] };
    const withQuery = (overrides) => filterComps(allEntries, { ...filters, ...overrides, query: search });
    return {
      heroes: buildFacets(withQuery({})).heroes,
      flags: buildFacets(withQuery({})).flags,
      regions: buildFacets(withQuery({ regions: [] })).regions,
      families: buildFacets(withQuery({ families: [] })).families
    };
  }, [isOpen, allEntries, filters, search]);

  const activeFilterCount =
    filters.heroes.length + filters.regions.length + filters.families.length + filters.flags.length;

  const perPage = pageSize || filtered.length || 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  const sortOptions = useMemo(
    () => SORT_OPTIONS.filter((o) => !o.savedOnly || activeTab === 'saved'),
    [activeTab]
  );

  // Abrir la libreria la devuelve a como la dejaste configurada en ajustes, no
  // a como la dejaste la ultima vez: eso es lo que significa "por defecto".
  const resetView = useCallback(() => {
    setSearch('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setSortId(defaultSort);
    setPageSize(defaultPageSize);
  }, [defaultSort, defaultPageSize]);

  const handleToggleFilter = useCallback((key, id) => {
    setFilters((prev) => ({ ...prev, [key]: toggleIn(prev[key], id) }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const handleTab = useCallback((tab) => {
    setActiveTab(tab);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    // "Recently saved" solo existe en la pestana de guardados.
    setSortId((prev) => (prev === 'recent' && tab !== 'saved' ? defaultSort : prev));
  }, [defaultSort]);

  useEffect(() => {
    if (isOpen) {
      resetView();
      setActiveTab('library');
    }
  }, [isOpen, resetView]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      // Flechas para pasar pagina, salvo mientras se escribe en el buscador.
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight') setPage((p) => Math.min(p + 1, pageCount));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, pageCount]);

  if (!isOpen) return null;

  const tabButton = (id, label, count, tone) => (
    <button
      onClick={() => handleTab(id)}
      type="button"
      className={`px-3 py-1.5 rounded text-sm border transition-colors ${
        activeTab === id ? tone : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:text-dd-parchment'
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  const pageNumbers = () => {
    // Ventana deslizante de 5: con 6+ paginas la lista entera no aporta nada.
    const span = 5;
    let first = Math.max(1, currentPage - Math.floor(span / 2));
    const last = Math.min(pageCount, first + span - 1);
    first = Math.max(1, last - span + 1);
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative bg-gray-800 border-2 rounded-lg shadow-2xl w-full max-w-[76rem] max-h-[92vh] flex flex-col"
          style={{ borderColor: 'var(--dd-gold)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
            <div>
              <h3 className="font-darkest text-lg sm:text-xl text-dd-parchment tracking-wide">Comp Library</h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Search by name, hero, family, mechanic, skill or trinket
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-dd-parchment transition-colors"
              aria-label="Close"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 sm:px-5 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {tabButton('library', 'Library', libraryEntries.length, 'bg-amber-700/80 border-amber-600 text-dd-parchment')}
              {tabButton('saved', 'My Teams', savedTeams.length, 'bg-indigo-700/80 border-indigo-600 text-dd-parchment')}
              {rosterCounts && (
                <button
                  type="button"
                  onClick={() => { setOnlyFieldable((v) => !v); setPage(1); }}
                  aria-pressed={onlyFieldable}
                  title="Only comps your imported roster has the heroes for"
                  className={`px-2.5 py-1.5 text-xs rounded border transition-colors inline-flex items-center gap-1.5 ${
                    onlyFieldable
                      ? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-300'
                      : 'border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Users size={12} /> Can field
                </button>
              )}

              <div className="relative flex-1 min-w-[10rem]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="hound mark ruins, Focus Ring, Clown Fiesta..."
                  aria-label="Search comps"
                  className="bg-gray-900 text-dd-parchment pl-8 pr-7 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm w-full"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-dd-parchment"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-colors ${
                  showFilters || activeFilterCount
                    ? 'bg-gray-700 border-dd-gold/60 text-dd-parchment'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:text-dd-parchment'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="px-1.5 rounded-full bg-dd-gold text-gray-900 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={sortId}
                onChange={(e) => { setSortId(e.target.value); setPage(1); }}
                aria-label="Sort comps"
                className="bg-gray-900 text-dd-parchment px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>

            {showFilters && (
              <CompFilters
                facets={facets}
                filters={filters}
                onToggle={handleToggleFilter}
                onClear={handleClearFilters}
                activeCount={activeFilterCount}
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3">
            {visible.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-10">
                {activeTab === 'saved' && !savedTeams.length ? (
                  'No saved teams yet.'
                ) : (
                  <>
                    No comps match this search.
                    <button
                      type="button"
                      onClick={resetView}
                      className="ml-2 text-dd-gold hover:underline"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {visible.map((comp) => (
                  <CompCard
                    key={comp.id}
                    comp={comp}
                    missing={rosterCounts ? missingForComp(comp, rosterCounts) : null}
                    onLoad={() => {
                      if (comp.source === 'saved') {
                        // Otra pestana pudo borrarlo entre abrir el modal y
                        // pulsar: sin este aviso, cargar y fallar se veian
                        // exactamente igual (el modal se cerraba y ya).
                        const loaded = onLoadSavedTeam(comp.name);
                        showToast?.(
                          loaded === false
                            ? `"${comp.name}" is no longer in browser storage.`
                            : `Loaded "${comp.name}"!`,
                          loaded === false ? 'error' : 'success'
                        );
                      } else {
                        onLoadPreset(comp);
                        showToast?.(`Loaded "${comp.name}"!`, 'success');
                      }
                      onClose();
                    }}
                    onDelete={
                      comp.source === 'saved'
                        ? () => setDeleteConfirm({ isOpen: true, teamName: comp.name })
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              {filtered.length === 0
                ? 'No results'
                : `${start + 1}–${Math.min(start + perPage, filtered.length)} of ${filtered.length}`}
              {filtered.length !== allEntries.length && (
                <span className="text-gray-600"> (of {allEntries.length})</span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                aria-label="Comps per page"
                className="bg-gray-900 text-gray-300 px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-xs"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n === 0 ? 'Show all' : `${n} / page`}</option>
                ))}
              </select>

              {pageCount > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="p-1 rounded border border-gray-700 text-gray-400 enabled:hover:text-dd-parchment enabled:hover:border-gray-500 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {pageNumbers().map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === currentPage ? 'page' : undefined}
                      className={`w-6 h-6 rounded text-xs border transition-colors ${
                        n === currentPage
                          ? 'bg-dd-gold text-gray-900 border-dd-gold font-bold'
                          : 'border-gray-700 text-gray-400 hover:text-dd-parchment hover:border-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    aria-label="Next page"
                    className="p-1 rounded border border-gray-700 text-gray-400 enabled:hover:text-dd-parchment enabled:hover:border-gray-500 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Team"
        message={`Delete "${deleteConfirm.teamName}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          onDeleteSavedTeam(deleteConfirm.teamName);
          setDeleteConfirm({ isOpen: false, teamName: '' });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, teamName: '' })}
      />
    </>,
    document.body
  );
};

export default LoadCompModal;
