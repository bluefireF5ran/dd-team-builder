import React, { useRef, useState } from 'react';
import { downloadJSON } from '../../utils/download';
import { buildRankingPayload } from '../../utils/rankerExport';
import { ClipboardCopy, Download, Image as ImageIcon, RotateCcw, Save } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { getHeroImagePath } from '../../utils/imageHelper';

const MEDALS = ['#D4AF37', '#C0C0C0', '#CD7F32'];

// A comp has no single portrait, so its row shows the FORMATION -- four
// portraits in rank order, which is what identifies a party at a glance.
const Formation = ({ heroes, size = 'w-9 h-9' }) => (
  <span className="flex items-center gap-1 shrink-0">
    {heroes.map((hero, i) => (
      <ImageWithFallback
        key={`${hero.heroClass}-${i}`}
        src={getHeroImagePath(hero.heroClass)}
        alt={hero.heroClass}
        title={`${i + 1}. ${hero.heroClass}`}
        className={`${size} object-cover rounded-sm border border-gray-700 bg-gray-900`}
        fallback={
          <span
            className={`${size} flex items-center justify-center rounded-sm border border-gray-700 bg-gray-900 text-[10px] text-gray-500`}
            title={hero.heroClass}
          >
            {hero.heroClass.charAt(0)}
          </span>
        }
      />
    ))}
  </span>
);

const RankRow = ({ item, position, category }) => {
  const medal = MEDALS[position - 1];
  return (
    <div
      className="flex items-center gap-3 p-2 rounded border bg-gray-800/70"
      style={{ borderColor: medal ? medal : 'rgba(75,85,99,0.6)' }}
    >
      <span
        className="w-8 shrink-0 text-center font-darkest text-lg"
        style={{ color: medal || 'var(--dd-parchment)' }}
      >
        {position}
      </span>
      {item.heroes ? (
        <Formation heroes={item.heroes} />
      ) : (
      <ImageWithFallback
        src={item.image}
        alt={item.name}
        className={
          category === 'heroes'
            ? 'w-12 h-12 object-cover rounded-sm border border-gray-700 shrink-0'
            : 'w-12 h-12 object-contain shrink-0'
        }
        fallback={
          <span className="w-12 h-12 shrink-0 flex items-center justify-center rounded-sm border border-gray-700 bg-gray-900 text-gray-400">
            {item.name.charAt(0)}
          </span>
        }
      />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-dd-parchment text-sm truncate font-darkest tracking-wide">
          {item.name}
        </span>
        <span className="block text-[11px] text-gray-400 truncate">{item.subtitle}</span>
      </span>
      {category !== 'heroes' && !item.heroes && item.heroImage && (
        <ImageWithFallback
          src={item.heroImage}
          alt=""
          aria-hidden="true"
          className="w-8 h-8 object-cover rounded-sm border border-gray-700 shrink-0 opacity-80"
          fallback={null}
        />
      )}
    </div>
  );
};

const Podium = ({ items, category }) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 items-end">
    {[1, 0, 2].map((index) => {
      const item = items[index];
      if (!item) return <div key={index} />;
      const heights = ['h-56 sm:h-72', 'h-44 sm:h-56', 'h-40 sm:h-48'];
      return (
        <div
          key={item.id}
          className={`relative rounded-lg border-2 bg-gray-800/80 overflow-hidden flex flex-col items-center justify-end p-3 ${heights[index]}`}
          style={{ borderColor: MEDALS[index] }}
        >
          {category !== 'heroes' && item.heroImage && (
            <ImageWithFallback
              src={item.heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-15"
              fallback={null}
            />
          )}
          {item.heroes && (
            <span className="absolute inset-x-0 bottom-16 z-10 flex justify-center">
              <Formation heroes={item.heroes} size="w-8 h-8 sm:w-10 sm:h-10" />
            </span>
          )}
          <span
            className="absolute top-2 left-2 font-darkest text-2xl sm:text-3xl z-10"
            style={{ color: MEDALS[index] }}
          >
            {index + 1}
          </span>
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className={
              category === 'heroes'
                ? 'relative z-10 w-full h-full object-contain'
                : 'relative z-10 w-20 h-20 sm:w-28 sm:h-28 object-contain my-auto'
            }
            fallback={
              <span className="relative z-10 my-auto text-4xl text-gray-400">{item.name.charAt(0)}</span>
            }
          />
          <span className="relative z-10 text-center mt-2">
            <span className="block font-darkest text-sm sm:text-base text-dd-parchment leading-tight">
              {item.name}
            </span>
            <span className="block text-[10px] text-gray-400 truncate">{item.subtitle}</span>
          </span>
        </div>
      );
    })}
  </div>
);

const ResultsView = ({
  category,
  categoryLabel,
  ranking,
  comparisons,
  exact,
  onRestart,
  onBackToSetup,
  onSave,
  onNotify
}) => {
  const boardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  const asText = () =>
    ranking.map((item, i) => `${i + 1}. ${item.name}${item.subtitle ? ` (${item.subtitle})` : ''}`).join('\n');

  const copyText = () => {
    navigator.clipboard
      .writeText(`${categoryLabel} ranking\n\n${asText()}`)
      .then(() => onNotify?.('Ranking copied to clipboard', 'success'))
      .catch(() => onNotify?.('Could not access the clipboard', 'error'));
  };

  const handleDownloadJSON = () => {
    downloadJSON(
      `dd_ranking_${category}.json`,
      buildRankingPayload({ category, ranking, exact, comparisons })
    );
  };

  const downloadPNG = async () => {
    if (!boardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      // Ver App.js: html2canvas-pro es el que entiende los colores oklab/oklch
      // que emite Tailwind 4.
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: '#1f2937',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `dd_ranking_${category}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      onNotify?.('Could not export the image', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    onSave?.();
    setSaved(true);
    onNotify?.('Ranking saved', 'success');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="ornate-panel bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-dd-red/30 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-darkest text-2xl text-dd-gold tracking-wide">
              {categoryLabel} — final ranking
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {ranking.length} items in {comparisons} comparisons ·{' '}
              {exact ? (
                <span className="text-dd-gold">exact order</span>
              ) : (
                <span className="text-torch">approximate — stopped before every position was resolved</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={saved}
                className="px-3 py-1.5 text-xs rounded border border-dd-gold/50 bg-dd-gold/20 hover:bg-dd-gold/30 disabled:opacity-50 text-dd-gold transition-colors inline-flex items-center gap-1.5"
              >
                <Save size={13} /> {saved ? 'Saved' : 'Save'}
              </button>
            )}
            <button
              onClick={copyText}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <ClipboardCopy size={13} /> Copy
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <Download size={13} /> JSON
            </button>
            <button
              onClick={downloadPNG}
              disabled={isExporting}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <ImageIcon size={13} /> {isExporting ? 'Exporting...' : 'PNG'}
            </button>
            <button
              onClick={onRestart}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Rank again
            </button>
            <button
              onClick={onBackToSetup}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              Setup
            </button>
          </div>
        </div>
      </div>

      <div ref={boardRef} className="bg-gray-800/60 rounded-lg p-4">
        <Podium items={ranking} category={category} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {ranking.map((item, index) => (
            <RankRow key={item.id} item={item} position={index + 1} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
