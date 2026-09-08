import React from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';

/**
 * The list was missing three of its own entries — the comp library's arrow-key
 * pagination, "Escape closes any dialog", and the whole ranker keymap — and the
 * dialog itself did not close on Escape, which is a funny thing for the
 * keyboard help to get wrong. Both fixed; it uses the shared `Modal` now, so
 * Escape, the focus trap and focus restore come for free.
 */
const SECTIONS = [
  {
    title: 'Anywhere',
    shortcuts: [
      { keys: 'Escape', description: 'Close any dialog' },
      { keys: 'Ctrl + Z', description: 'Undo last change' },
      { keys: 'Ctrl + Y', description: 'Redo last change' },
      { keys: 'Ctrl + S', description: 'Quick save team' },
      { keys: 'Ctrl + E', description: 'Export as PNG' },
      { keys: 'Ctrl + Shift + C', description: 'Copy team to clipboard' }
    ]
  },
  {
    title: 'Party composition',
    shortcuts: [
      { keys: 'Space / Enter', description: 'Select a position, then a second to swap' },
      { keys: 'Escape', description: 'Cancel the selection' }
    ]
  },
  {
    title: 'Comp library',
    shortcuts: [{ keys: '← / →', description: 'Previous / next page' }]
  },
  {
    title: 'Ranking engine',
    shortcuts: [
      { keys: '1 / 2', description: 'Pick the left or right item' },
      { keys: '← / →', description: 'Pick the left or right item' },
      { keys: 'U', description: 'Undo the last pick' }
    ]
  }
];

const KeyboardShortcuts = ({ isOpen, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    labelledBy="shortcuts-title"
    panelClassName="bg-gray-800 border-2 border-dd-gold rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 id="shortcuts-title" className="font-darkest text-lg text-dd-gold tracking-wide">
        Keyboard Shortcuts
      </h3>
      <button
        onClick={onClose}
        aria-label="Close"
        className="p-1 text-gray-400 hover:text-white transition-colors"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>

    <div className="space-y-4">
      {SECTIONS.map(({ title, shortcuts }) => (
        <div key={title}>
          <h4 className="font-darkest text-xs uppercase tracking-wider text-gray-400 mb-1.5">
            {title}
          </h4>
          <div className="space-y-2">
            {shortcuts.map(({ keys, description }) => (
              <div
                key={`${title}-${keys}-${description}`}
                className="flex items-center justify-between gap-4 py-1.5 border-b border-gray-700 last:border-b-0"
              >
                <span className="text-sm text-gray-300">{description}</span>
                <kbd className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-dd-parchment font-mono whitespace-nowrap">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Modal>
);

export default KeyboardShortcuts;
