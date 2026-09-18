import React, { useMemo } from 'react';
import { ExternalLink, X } from 'lucide-react';
import Modal from './Modal';
import { parseVideoLink, embedUrlFor, watchUrlFor } from '../../utils/videoLink';
import { useVideoCredit } from '../../hooks/useVideoCredit';

/**
 * The guide video of a comp, played without leaving the comp.
 *
 * Opening YouTube in another tab was the cheaper option and it loses the thing
 * the video is for: you watch a run to copy what it does with the party you are
 * looking at, and that comparison does not survive a tab change.
 *
 * Two things are deliberate:
 *
 * - **The iframe only exists while the dialog is open.** `Modal` renders nothing
 *   when closed, so no player, no third-party request and no cookie for a card
 *   nobody clicked — which is also why the card shows a play button rather than
 *   a thumbnail.
 * - **Neither URL is the string the user pasted.** Both are rebuilt from the
 *   eleven-character id (`videoLink.js`), so a link that is not a YouTube video
 *   cannot reach an `href` or a `src`; it simply has nothing to open and this
 *   renders null.
 *
 * Under the player goes the credit: the video's own title and the channel that
 * made it, linked. The comp names the party; this names the person the comp came
 * from, which is the point of carrying a video at all. It arrives from YouTube's
 * oEmbed endpoint and only once the dialog is open - see `useVideoCredit`.
 */
const VideoModal = ({ isOpen, onClose, video, title = 'Guide video' }) => {
  const parsed = useMemo(() => parseVideoLink(video), [video]);
  const credit = useVideoCredit(video, isOpen && !!parsed);

  return (
    <Modal
      isOpen={isOpen && !!parsed}
      onClose={onClose}
      labelledBy="video-modal-title"
      panelClassName="bg-gray-800 border-2 rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden"
      panelStyle={{ borderColor: 'var(--dd-gold)' }}
    >
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-700">
        <h3 id="video-modal-title" className="font-darkest text-dd-parchment tracking-wide truncate">
          {title}
        </h3>
        <a
          href={watchUrlFor(parsed)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-dd-gold hover:border-dd-gold/60 transition-colors"
          title="Open on YouTube"
        >
          <ExternalLink size={13} />
          YouTube
        </a>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded text-gray-400 hover:text-dd-parchment hover:bg-black/40 transition-colors"
          aria-label="Close the video"
        >
          <X size={18} />
        </button>
      </div>

      <div className="aspect-video bg-black">
        <iframe
          src={embedUrlFor(parsed)}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {credit && (
        <div className="px-3 sm:px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
          <span className="text-dd-parchment">{credit.title}</span>
          {credit.author && (
            <>
              {' — by '}
              {credit.authorUrl ? (
                <a
                  href={credit.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dd-gold hover:underline"
                >
                  {credit.author}
                </a>
              ) : (
                <span className="text-dd-gold">{credit.author}</span>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default VideoModal;
