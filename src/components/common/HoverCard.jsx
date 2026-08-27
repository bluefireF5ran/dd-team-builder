import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A hover panel for the small icons - trinkets, combat skills, camp skills.
 *
 * The panel is `position: fixed`, placed from the trigger's bounding rect, and
 * **rendered through a portal into document.body**. Both halves are needed:
 * fixed positioning escapes the grids and cards that clip their overflow, and
 * the portal escapes their stacking contexts. A party card that is mid-drag
 * carries `opacity`, and the icons carry a hover `transform` - either one
 * creates a stacking context that traps a fixed child no matter its z-index,
 * which is what left the panel drawing behind the neighbouring hero cards.
 *
 * It opens on hover and on keyboard focus, and carries `pointer-events: none`
 * so it can never swallow a click or a drag - the party cards are
 * drag-and-drop targets.
 *
 * With no `lines` and no `subtitle` there is nothing worth showing, so the
 * child renders untouched and no wrapper is introduced.
 */
const MARGIN = 8;
const WIDTH = 260;
// Above z-50, the app's modal layer.
const LAYER = 9999;

const HoverCard = ({ title, subtitle, lines = [], className = '', children }) => {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  const open = useCallback(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect());
  }, []);
  const close = useCallback(() => setRect(null), []);

  const body = (lines || []).filter(Boolean);
  if (!title || (!body.length && !subtitle)) return children;

  let style = null;
  if (rect) {
    // Prefer above the icon; drop below when the top of the viewport is close.
    const above = rect.top > 160;
    const left = Math.min(
      Math.max(MARGIN, rect.left + rect.width / 2 - WIDTH / 2),
      Math.max(MARGIN, window.innerWidth - WIDTH - MARGIN)
    );
    style = {
      position: 'fixed',
      left,
      width: WIDTH,
      ...(above ? { bottom: window.innerHeight - rect.top + MARGIN } : { top: rect.bottom + MARGIN }),
    };
  }

  const panel = rect && (
    <span
      role="tooltip"
      style={{ ...style, zIndex: LAYER, pointerEvents: 'none' }}
      className="block rounded border border-dd-gold/60 bg-gray-900 px-3 py-2 shadow-xl shadow-black/60"
    >
      <span className="block font-darkest tracking-wide text-sm text-dd-gold">{title}</span>
      {subtitle && (
        <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-gray-400">{subtitle}</span>
      )}
      {body.length > 0 && (
        <span className="mt-1.5 block space-y-0.5">
          {body.map((line, i) => (
            <span key={i} className="block text-[11px] leading-snug text-dd-parchment">
              {line}
            </span>
          ))}
        </span>
      )}
    </span>
  );

  return (
    <span
      ref={ref}
      className={`inline-flex ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {panel && createPortal(panel, document.body)}
    </span>
  );
};

export default HoverCard;
