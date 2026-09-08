import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * The shell every dialog in this app wants, in one place.
 *
 * There were nine hand-rolled copies of roughly the same twenty lines, and they
 * had drifted apart in exactly the ways you would expect:
 *
 * - `KeyboardShortcuts` did not close on Escape — the dialog documenting the
 *   keyboard was the one that ignored it.
 * - Two of the nine set `role="dialog"`; the other seven were, to a screen
 *   reader, an anonymous pile of divs on top of the page.
 * - **None trapped focus.** Tab from the last control walked straight into the
 *   builder behind, still fully reachable, while the dialog stayed open.
 * - **None restored focus on close.** Closing the trinket picker dropped you at
 *   `<body>`, so the next Tab restarted at the top of the page rather than at
 *   the slot you had just come from.
 *
 * The trap is deliberately simple: it does not reorder anything or inject
 * sentinels, it just wraps Tab around the focusable elements it finds when Tab
 * is pressed. Querying on each keypress rather than on mount is what makes it
 * work for dialogs whose contents change — a search box that filters a grid
 * changes what is focusable on every keystroke.
 */

// `:not([disabled])` matters: a disabled Suggest button is in the DOM the whole
// time a roster is too small, and wrapping onto it would strand the user.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
  isOpen,
  onClose,
  labelledBy,
  label,
  children,
  className = '',
  panelClassName = '',
  /** Set false for a dialog whose own content manages the initial focus. */
  autoFocus = true
}) => {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      // Not `offsetParent`: jsdom does no layout, so that is null for
      // everything and the trap would find nothing under test. Computed style
      // is right in a browser and merely permissive in jsdom, which is the
      // safe way round. The visible target here is the `hidden` file input
      // that several dialogs keep behind a styled label.
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    // Remember where the user was, so closing puts them back rather than at
    // the top of the document.
    returnFocusRef.current = document.activeElement;

    if (autoFocus) {
      // After paint, so a child's own autoFocus wins if it has one.
      const id = requestAnimationFrame(() => {
        if (!panelRef.current) return;
        if (panelRef.current.contains(document.activeElement)) return;
        const target = panelRef.current.querySelector(FOCUSABLE);
        (target || panelRef.current).focus();
      });
      return () => {
        cancelAnimationFrame(id);
        const previous = returnFocusRef.current;
        if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
          previous.focus();
        }
      };
    }

    return () => {
      const previous = returnFocusRef.current;
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [isOpen, autoFocus]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        className={`relative outline-none ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
