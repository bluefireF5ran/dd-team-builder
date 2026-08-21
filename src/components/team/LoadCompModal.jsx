import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import CompCard from './CompCard';
import ConfirmDialog from '../common/ConfirmDialog';
import { COMP_LIBRARY } from '../../data/compLibrary';

const LoadCompModal = ({
  isOpen,
  onClose,
  savedTeams = [],
  onLoadSavedTeam,
  onDeleteSavedTeam,
  onLoadPreset,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, teamName: '' });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setSearch('');
  }, [isOpen]);

  const filteredLibrary = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COMP_LIBRARY;
    return COMP_LIBRARY.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const filteredSaved = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return savedTeams;
    return savedTeams.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [search, savedTeams]);

  if (!isOpen) return null;

  const activeList = activeTab === 'saved' ? filteredSaved : filteredLibrary;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative bg-gray-800 border-2 rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
          style={{ borderColor: 'var(--dd-gold)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pb-3">
            <div>
              <h3 className="font-darkest text-lg sm:text-xl text-dd-parchment tracking-wide">Load Comp</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Browse your saved teams or the bundled comp library</p>
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

          <div className="px-4 sm:px-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('saved')}
                type="button"
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-indigo-700/80 border-indigo-600 text-dd-parchment'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:text-dd-parchment'
                }`}
              >
                My Saved Teams ({savedTeams.length})
              </button>
              <button
                onClick={() => setActiveTab('library')}
                type="button"
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  activeTab === 'library'
                    ? 'bg-amber-700/80 border-amber-600 text-dd-parchment'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:text-dd-parchment'
                }`}
              >
                Comp Library ({COMP_LIBRARY.length})
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                aria-label="Search comps"
                className="bg-gray-900 text-dd-parchment pl-8 pr-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-dd-gold text-sm w-full sm:w-56"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3">
            {activeList.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                {activeTab === 'saved' ? 'No saved teams yet.' : 'No comps match your search.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeTab === 'saved'
                  ? filteredSaved.map((team) => (
                      <CompCard
                        key={team.teamName}
                        title={team.teamName}
                        location={team.location}
                        heroes={team.heroes}
                        onLoad={() => {
                          onLoadSavedTeam(team.teamName);
                          onClose();
                        }}
                        onDelete={() => setDeleteConfirm({ isOpen: true, teamName: team.teamName })}
                      />
                    ))
                  : filteredLibrary.map((comp) => (
                      <CompCard
                        key={comp.id}
                        title={comp.name}
                        location={comp.location}
                        heroes={comp.heroes}
                        onLoad={() => {
                          onLoadPreset(comp);
                          showToast?.(`Loaded "${comp.name}"!`, 'success');
                          onClose();
                        }}
                      />
                    ))}
              </div>
            )}
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
