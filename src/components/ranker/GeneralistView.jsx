import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCopy, Download, Scale, Search, SlidersHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import {
  COUNT_UNITS,
  FLATTEN_PRESETS,
  USAGE_CATEGORIES,
  defaultPriorStrength,
  flattenSwing,
  scoreItems
} from '../../utils/generalistStats';
import { getUsageStats } from '../../data/generalistIndex';
import {
  getCampSkillImagePath,
  getHeroImagePath,
  getSkillImagePath,
  getTrinketImagePath,
  isModdedHero
} from '../../utils/imageHelper';
import { GENERALIST_STORAGE_KEY } from '../../config/rankerRoster';

const LIST_STEP = 40;

const TRINKET_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'universal', label: 'Universal' },
  { id: 'class', label: 'Class-specific' }
];

const DEFAULT_SETTINGS = {
  category: 'heroes',
  alpha: 0.5,
  unit: 'slots',
  heroClass: '',
  scope: 'all'
};

const readSettings = () => {
  try {
    const raw = localStorage.getItem(GENERALIST_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/** Para la imagen conviene un duenyo vanilla: los modeados llevan prefijo de mod. */
const preferredOwner = (item) =>
  item.owners.find((name) => !isModdedHero(name)) || item.owners[0] || null;

const imageFor = (item) => {
  const owner = preferredOwner(item);
  if (item.kind === 'heroes') return getHeroImagePath(item.name);
  if (item.kind === 'skills') return getSkillImagePath(item.name, owner);
  if (item.kind === 'campSkills') return getCampSkillImagePath(item.name, owner);
  return getTrinketImagePath(item.name, item.universal ? null : owner);
};

const subtitleFor = (item) => {
  if (item.kind === 'heroes') {
    const best = item.rankCounts.indexOf(Math.max(...item.rankCounts)) + 1;
    const partner = item.partners[0];
    return `${item.comps} comps · usually rank ${best}${partner ? ` · most often with ${partner[0]}` : ''}`;
  }
  if (item.kind === 'trinkets' && item.universal) return 'Any class';
  if (item.owners.length === 1) return item.owners[0];
  if (item.kind === 'trinkets') return item.owners.join(' / ');
  return `Shared — ${item.owners.length} classes`;
};

const percent = (value) => `${Math.round(value * 100)}%`;

const RankDistribution = ({ counts }) => {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  // Se dibuja de 4 a 1 como en la partida y como en PartyComposition.
  return (
    <span className="hidden lg:flex items-end gap-0.5 h-6 w-12 shrink-0" title="Rank 4 → 1">
      {[3, 2, 1, 0].map((index) => (
        <span
          key={index}
          className="flex-1 bg-dd-gold/60 rounded-sm"
          style={{ height: `${Math.max(6, (counts[index] / total) * 100)}%` }}
          title={`Rank ${index + 1}: ${counts[index]}`}
        />
      ))}
    </span>
  );
};

const Row = ({ item, swing, pairwiseRank }) => (
  <li className="flex items-center gap-3 p-2 rounded border border-gray-700/70 bg-gray-800/70">
    <span className="w-7 shrink-0 text-center font-darkest text-lg text-dd-parchment">{item.rank}</span>

    <ImageWithFallback
      src={imageFor(item)}
      alt={item.name}
      className={
        item.kind === 'heroes'
          ? 'w-11 h-11 object-cover rounded-sm border border-gray-700 shrink-0'
          : 'w-11 h-11 object-contain shrink-0'
      }
      fallback={
        <span className="w-11 h-11 shrink-0 flex items-center justify-center rounded-sm border border-gray-700 bg-gray-900 text-gray-600">
          {item.name.charAt(0)}
        </span>
      }
    />

    <span className="min-w-0 flex-1">
      <span className="block text-dd-parchment text-sm truncate font-darkest tracking-wide">
        {item.name}
      </span>
      <span className="block text-[11px] text-gray-400 truncate">{subtitleFor(item)}</span>
      <span className="mt-1 block h-1 rounded-full bg-gray-900/80 overflow-hidden">
        <span
          className="block h-full bg-gradient-to-r from-dd-red to-dd-gold"
          style={{ width: `${Math.max(2, item.relative * 100)}%` }}
        />
      </span>
    </span>

    {item.kind === 'heroes' && <RankDistribution counts={item.rankCounts} />}

    <span className="shrink-0 text-right w-24">
      <span className="block text-dd-gold font-darkest text-base leading-none">
        {percent(item.rate)}
      </span>
      <span className="block text-[10px] text-gray-500 leading-tight">
        {item.picks} of {item.opportunities}
      </span>
    </span>

    <span className="shrink-0 w-14 text-right">
      {swing !== 0 && (
        <span
          className={`inline-flex items-center gap-0.5 text-[10px] ${
            swing > 0 ? 'text-emerald-400' : 'text-torch'
          }`}
          title={
            swing > 0
              ? `Climbs ${swing} places when hero popularity is flattened out`
              : `Falls ${Math.abs(swing)} places when hero popularity is flattened out`
          }
        >
          {swing > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(swing)}
        </span>
      )}
      {pairwiseRank && (
        <span
          className="block text-[10px] text-gray-500"
          title="Your own pairwise ranking put it here"
        >
          you: #{pairwiseRank}
        </span>
      )}
    </span>
  </li>
);

const Toggle = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => (
      <button
        key={option.id}
        onClick={() => onChange(option.id)}
        className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
          value === option.id
            ? 'border-dd-gold bg-dd-gold/15 text-dd-parchment'
            : 'border-gray-700 bg-gray-900/60 text-gray-400 hover:border-dd-gold/50'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const GeneralistView = ({ savedResults = {}, onNotify }) => {
  const stats = useMemo(() => getUsageStats(), []);
  const [settings, setSettings] = useState(readSettings);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(LIST_STEP);

  const { category, alpha, unit, heroClass, scope } = settings;
  const update = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(GENERALIST_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* sin almacenamiento la vista sigue funcionando */
    }
  }, [settings]);

  useEffect(() => setLimit(LIST_STEP), [category, alpha, unit, heroClass, scope, query]);

  const priorStrength = defaultPriorStrength(stats, unit);
  const activeHero = category === 'heroes' ? '' : heroClass;

  const pool = useMemo(() => {
    const items = stats.items[category] || [];
    if (category !== 'trinkets' || scope === 'all') return items;
    return items.filter((item) => (scope === 'universal' ? item.universal : !item.universal));
  }, [stats, category, scope]);

  const scoreOptions = useMemo(
    () => ({
      alpha,
      unit,
      priorStrength,
      heroClass: activeHero || null,
      classUsage: stats.classUsage
    }),
    [alpha, unit, priorStrength, activeHero, stats.classUsage]
  );

  const ranked = useMemo(() => scoreItems(pool, scoreOptions), [pool, scoreOptions]);
  const swings = useMemo(() => flattenSwing(pool, scoreOptions), [pool, scoreOptions]);

  // El ranking por parejas del usuario, para ver donde discrepa con la libreria.
  const pairwisePositions = useMemo(() => {
    const saved = savedResults[category];
    if (!saved) return null;
    return new Map(saved.items.map((entry, index) => [entry.name, index + 1]));
  }, [savedResults, category]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ranked;
    return ranked.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.owners.some((owner) => owner.toLowerCase().includes(needle))
    );
  }, [ranked, query]);

  const visible = filtered.slice(0, limit);
  const meta = USAGE_CATEGORIES.find((c) => c.id === category) || USAGE_CATEGORIES[0];
  const activePreset = FLATTEN_PRESETS.find((p) => Math.abs(p.alpha - alpha) < 0.001);
  const unitMeta = COUNT_UNITS.find((u) => u.id === unit) || COUNT_UNITS[0];

  const asText = () =>
    filtered
      .map(
        (item) =>
          `${item.rank}. ${item.name} — ${item.picks}/${item.opportunities} (${percent(item.rate)})`
      )
      .join('\n');

  const copyText = () => {
    const header = `${meta.label} — generalist ranking (flatten ${alpha.toFixed(2)}, ${unitMeta.label.toLowerCase()}${activeHero ? `, ${activeHero} only` : ''})`;
    navigator.clipboard
      .writeText(`${header}\n\n${asText()}`)
      .then(() => onNotify?.('Ranking copied to clipboard', 'success'))
      .catch(() => onNotify?.('Could not access the clipboard', 'error'));
  };

  const downloadJSON = () => {
    const payload = {
      category,
      source: 'comp-library',
      comps: stats.compCount,
      families: stats.familyCount,
      slots: stats.slotCount,
      settings: { alpha, unit, heroClass: activeHero || null, scope, priorStrength },
      ranking: filtered.map((item) => ({
        rank: item.rank,
        name: item.name,
        picks: item.picks,
        opportunities: item.opportunities,
        rate: Number(item.rate.toFixed(4)),
        score: Number(item.score.toFixed(4)),
        owners: item.owners
      }))
    };
    const uri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `dd_generalist_${category}.json`);
    link.click();
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {USAGE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => update({ category: cat.id })}
            className={`text-left rounded-lg border-2 p-3 transition-all duration-150 ${
              cat.id === category
                ? 'border-dd-gold bg-gray-800/95 shadow-torch'
                : 'border-gray-700 bg-gray-800/70 hover:border-dd-gold/50'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-darkest text-lg text-dd-parchment tracking-wide">{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  cat.id === category ? 'border-dd-gold/60 text-dd-gold' : 'border-gray-600 text-gray-400'
                }`}
              >
                {(stats.items[cat.id] || []).length}
              </span>
            </span>
            <span className="block text-[11px] text-gray-400 mt-1 leading-snug">{cat.blurb}</span>
          </button>
        ))}
      </div>

      <div className="ornate-panel bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-dd-red/30 p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="font-darkest text-lg text-dd-gold tracking-wide inline-flex items-center gap-2">
              <SlidersHorizontal size={15} /> Flatten hero popularity
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-2">
              {activePreset
                ? activePreset.blurb
                : 'Between raw usage and pure adoption rate — the higher the value, the less a class being popular helps its kit.'}
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={alpha}
                onChange={(e) => update({ alpha: Number(e.target.value) })}
                className="flex-1 accent-dd-gold"
                aria-label="Flatten hero popularity"
              />
              <span className="w-10 text-right font-darkest text-dd-gold">{alpha.toFixed(2)}</span>
            </div>
            <div className="mt-2">
              <Toggle
                options={FLATTEN_PRESETS}
                value={activePreset ? activePreset.id : ''}
                onChange={(id) => {
                  const preset = FLATTEN_PRESETS.find((p) => p.id === id);
                  if (preset) update({ alpha: preset.alpha });
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="font-darkest text-lg text-dd-gold tracking-wide inline-flex items-center gap-2">
              <Scale size={15} /> Count each
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{unitMeta.blurb}</p>
            <Toggle options={COUNT_UNITS} value={unit} onChange={(id) => update({ unit: id })} />

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-[11px] text-gray-400">
                <span className="block mb-1">Only what this class can take</span>
                <select
                  value={heroClass}
                  onChange={(e) => update({ heroClass: e.target.value })}
                  disabled={category === 'heroes'}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 disabled:opacity-40"
                >
                  <option value="">Any class</option>
                  {stats.classes.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              {category === 'trinkets' && (
                <div className="text-[11px] text-gray-400">
                  <span className="block mb-1">Trinket pool</span>
                  <Toggle options={TRINKET_SCOPES} value={scope} onChange={(id) => update({ scope: id })} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-700">
          <label className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${meta.label.toLowerCase()}...`}
              className="w-full bg-gray-900 border border-gray-700 rounded pl-8 pr-2 py-1.5 text-xs text-gray-200 placeholder-gray-600"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={copyText}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <ClipboardCopy size={13} /> Copy
            </button>
            <button
              onClick={downloadJSON}
              className="px-3 py-1.5 text-xs rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1.5"
            >
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          {stats.compCount} comps · {stats.familyCount} families · {stats.slotCount} hero slots.
          Rates are smoothed towards the average with a prior worth {priorStrength} observations, so
          a 5-of-5 does not outrank a 50-of-50. The arrow shows how many places an entry moves
          between raw usage and pure adoption rate.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Nothing matches those filters.</p>
      ) : (
        <>
          <ol className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            {visible.map((item) => (
              <Row
                key={item.id}
                item={item}
                swing={swings.get(item.id) || 0}
                pairwiseRank={pairwisePositions ? pairwisePositions.get(item.name) : null}
              />
            ))}
          </ol>
          {visible.length < filtered.length && (
            <div className="text-center">
              <button
                onClick={() => setLimit((n) => n + LIST_STEP)}
                className="px-4 py-2 text-xs rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                Show {Math.min(LIST_STEP, filtered.length - visible.length)} more ({filtered.length -
                  visible.length}{' '}
                left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeneralistView;
