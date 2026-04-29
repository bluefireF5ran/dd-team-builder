import React from 'react';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { keys: 'Space / Enter', description: 'Select hero position for swap' },
  { keys: 'Escape', description: 'Cancel hero selection' },
  { keys: 'Ctrl + Z', description: 'Undo last change' },
  { keys: 'Ctrl + Y', description: 'Redo last change' },
  { keys: 'Ctrl + S', description: 'Quick save team' },
  { keys: 'Ctrl + E', description: 'Export as PNG' },
  { keys: 'Ctrl + Shift + C', description: 'Copy team to clipboard' },
];

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 border-2 border-dd-gold rounded-lg p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-darkest text-lg text-dd-gold tracking-wide">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={keys} className="flex items-center justify-between gap-4 py-1.5 border-b border-gray-700 last:border-b-0">
              <span className="text-sm text-gray-300">{description}</span>
              <kbd className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-dd-parchment font-mono whitespace-nowrap">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
