import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { UI_CONFIG } from '../../constants';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'border-green-500 bg-green-900/90 text-green-300',
  error: 'border-red-500 bg-red-900/90 text-red-300',
  warning: 'border-yellow-500 bg-yellow-900/90 text-yellow-300',
};

const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = ICONS[type] || ICONS.success;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, UI_CONFIG.TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    // Every save, import, paste failure and suggest warning in the app arrives
    // through here, and none of it was announced. An error interrupts; the
    // rest waits for a pause, which is what `polite` is for.
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-sm transition-all duration-300 ${
        COLORS[type]
      } ${isVisible ? 'opacity-100 translate-y-0 -translate-x-1/2' : 'opacity-0 translate-y-4 -translate-x-1/2'}`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
