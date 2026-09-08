import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', isDestructive = false }) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    // autoFocus off: the Cancel button is focused above, and on a destructive
    // dialog the safe option is the one that should be under the return key.
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      labelledBy="confirm-title"
      autoFocus={false}
      panelClassName="bg-gray-800 border-2 rounded-lg p-6 max-w-md w-full shadow-2xl"
    >
      <div style={{ borderColor: isDestructive ? 'var(--dd-red)' : 'var(--dd-gold)' }}>
        <div className="flex items-start gap-3 mb-4">
          {isDestructive && (
            <AlertTriangle size={24} className="text-dd-red-light flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 id="confirm-title" className="font-darkest text-lg text-dd-parchment tracking-wide">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded border transition-colors text-sm font-semibold ${
              isDestructive
                ? 'bg-dd-red hover:bg-red-700 text-white border-red-600'
                : 'bg-dd-gold/20 hover:bg-dd-gold/30 text-dd-gold border-dd-gold/50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
