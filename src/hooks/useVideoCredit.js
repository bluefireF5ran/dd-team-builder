import { useEffect, useMemo, useState } from 'react';
import { parseVideoLink } from '../utils/videoLink';
import { fetchVideoCredit, peekVideoCredit } from '../utils/videoCredit';

/**
 * Who made the video, once someone is actually watching it.
 *
 * `active` is the whole design. The credit costs a request to YouTube, and the
 * rule the rest of this feature follows is that a comp nobody opened costs
 * nothing: pass `isOpen`, and a library page of 24 cards asks for nothing until
 * one of them is played.
 *
 * It only ever sets state when there is a credit to show, so a video with none
 * — or a browser with no network — is a component that never re-renders.
 */
export const useVideoCredit = (video, active = true) => {
  const id = useMemo(() => parseVideoLink(video)?.id || '', [video]);
  // Lo ya sabido entra en el primer render: reabrir el mismo video no parpadea.
  const [credit, setCredit] = useState(() => peekVideoCredit(id) || null);

  useEffect(() => {
    if (!active || !id) return undefined;

    // Un video distinto empieza sin credito: sin esto, el del anterior se
    // quedaria puesto debajo del nuevo mientras llega el suyo.
    const known = peekVideoCredit(id);
    setCredit(known || null);
    if (known !== undefined) return undefined;

    let alive = true;
    fetchVideoCredit(id).then((found) => {
      if (alive && found) setCredit(found);
    });
    return () => { alive = false; };
  }, [id, active]);

  return id ? credit : null;
};
