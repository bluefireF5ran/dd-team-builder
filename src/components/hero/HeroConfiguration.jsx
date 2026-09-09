import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSkillRanks, reachableRanks } from '../../utils/rankValidity';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, ClipboardPaste, RotateCcw, Sparkles, UserPlus, X } from 'lucide-react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';
import { validateHero } from '../../utils/validation';
import { hasHeroConfiguration, sortToRoster } from '../../utils/heroHelper';
import { HERO_CONFIG } from '../../constants';
import { copyTextToClipboard, parseHeroClipboard, readClipboardText, serializeHero } from '../../utils/heroClipboard';
import { getTrinketImagePath } from '../../utils/imageHelper';
import { getTrinketEffect } from '../../data/trinketEffects';
import { getModdedTrinketEffect, getSetBonus } from '../../data/moddedEffects';
import { getSkillTier, getSkillTierMeta } from '../../data/skillTiers';
import { bisLoadout, MIN_LIBRARY_SAMPLES } from '../../data/bisIndex';
import { skillHover, trinketHover } from '../../utils/hoverInfo';
import ImageWithFallback from '../common/ImageWithFallback';
import ConfirmDialog from '../common/ConfirmDialog';
import HoverCard from '../common/HoverCard';
import HeroSelector from './HeroSelector';
import TrinketPicker from './TrinketPicker';
import QuirkSlot from '../quirks/QuirkSlot';
import QuirkPicker from '../quirks/QuirkPicker';

// The community tier, when the setting asks for it. Untiered skills - camp
// skills, modded classes and the three classes the tier list skipped - render
// nothing at all rather than an empty slot.
const SkillTierBadge = ({ tier }) => {
  const meta = getSkillTierMeta(tier);
  if (!meta) return null;
  return (
    <span
      className={`flex-shrink-0 px-1.5 rounded border text-[10px] leading-4 font-bold ${meta.badge}`}
      title={`Tier ${meta.id} — ${meta.label}`}
    >
      {meta.id}
    </span>
  );
};

const HeroConfiguration = ({
  hero,
  position,
  onUpdate,
  showBackerTrinkets,
  showModdedHeroes,
  ownedTrinkets,
  ownedTrinketsOnly,
  onToggleOwnedTrinketsOnly,
  showDiseases = false,
  showCrimsonCourt = false,
  autoSortSkills = false,
  showSkillTiers = false,
  showToast
}) => {
  // Which list the picker is open on: 'positive' | 'negative' | 'disease' | null.
  const [quirkPicker, setQuirkPicker] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, title: '', message: '' });
  const [trinketPickerSlot, setTrinketPickerSlot] = useState(null); // 1 | 2 | null
  const allHeroClasses = useMemo(() => {
    if (showModdedHeroes) {
      return { ...HERO_CLASSES, ...MODDED_HERO_CLASSES };
    }
    return HERO_CLASSES;
  }, [showModdedHeroes]);

  // Where this hero can get to on their own. A skill that only launches from
  // rank 3 is not a mistake in the hands of someone holding Shadow Fade; the
  // panel says so rather than putting a warning ring round it.
  const reachable = useMemo(
    () => reachableRanks(hero, position),
    [hero, position]
  );

  const validation = validateHero(hero);
  const heroData = allHeroClasses[hero.heroClass];
  const isAlwaysActive = heroData?.alwaysActive || false;

  // Auto-activar todas las skills si el héroe tiene alwaysActive
  useEffect(() => {
    if (hero.heroClass && isAlwaysActive && heroData) {
      const allSkills = heroData.skills || [];
      const currentSkills = hero.activeSkills || [];
      
      // Solo actualizar si no están todas activas
      if (currentSkills.length !== allSkills.length) {
        onUpdate({ ...hero, activeSkills: allSkills });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero.heroClass, isAlwaysActive]);

  const updateHero = useCallback((field, value) => {
    onUpdate({ ...hero, [field]: value });
  }, [hero, onUpdate]);

  const doChangeHeroClass = (newClass) => {
    const newHeroData = allHeroClasses[newClass];
    const activeSkills = newHeroData?.alwaysActive ? (newHeroData.skills || []) : [];

    onUpdate({
      heroClass: newClass,
      activeSkills: activeSkills,
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] },
      diseases: []
    });
  };

  const handleHeroClassChange = (newClass) => {
    if (hero.heroClass && hero.heroClass !== newClass) {
      const hasConfiguration =
        (hero.activeSkills && hero.activeSkills.length > 0) ||
        (hero.activeCampSkills && hero.activeCampSkills.length > 0) ||
        hero.trinket1 || hero.trinket2 ||
        (hero.quirks?.positive && hero.quirks.positive.length > 0) ||
        (hero.quirks?.negative && hero.quirks.negative.length > 0);

      if (hasConfiguration) {
        setConfirmState({
          isOpen: true,
          action: () => doChangeHeroClass(newClass),
          title: 'Change Hero Class',
          message: 'Changing hero class will reset all configuration (skills, camp skills, trinkets, and quirks). Continue?'
        });
        return;
      }
    }

    doChangeHeroClass(newClass);
  };

  const doResetConfiguration = () => {
    onUpdate({
      heroClass: '',
      activeSkills: [],
      activeCampSkills: [],
      trinket1: '',
      trinket2: '',
      quirks: { positive: [], negative: [] },
      lockedQuirks: { positive: [], negative: [] },
      diseases: []
    });
  };

  const handleResetConfiguration = () => {
    setConfirmState({
      isOpen: true,
      action: doResetConfiguration,
      title: 'Reset Configuration',
      message: 'This will reset all configuration for this hero (skills, camp skills, trinkets, and quirks). Continue?'
    });
  };

  /**
   * Rellena el heroe con la loadout recomendada PARA SU RANGO.
   *
   * `position` es el rango, no el indice de la tarjeta (App las pinta al reves
   * y pasa `4 - idx`), y es justo el dato que hace util a la recomendacion: la
   * misma clase se construye distinto delante y detras.
   */
  const doFillBestInSlot = () => {
    const build = bisLoadout(hero.heroClass, position);
    if (!build) return;

    onUpdate({
      ...hero,
      activeSkills: build.activeSkills,
      activeCampSkills: build.activeCampSkills,
      trinket1: build.trinket1,
      trinket2: build.trinket2,
      // Las quirks se sugieren; las que ya tuviera bloqueadas mandan, porque en
      // el juego no se pueden quitar.
      quirks: {
        positive: [...new Set([...(hero.lockedQuirks?.positive || []), ...build.quirks.positive])]
          .slice(0, HERO_CONFIG.MAX_POSITIVE_QUIRKS),
        negative: hero.quirks?.negative || []
      }
    });

    const where = build.samples >= MIN_LIBRARY_SAMPLES
      ? `from ${build.samples} comps that run ${hero.heroClass} at rank ${position}`
      : `from the trained model — the library has ${build.samples || 'no'} comps for rank ${position}`;
    showToast?.(`${hero.heroClass} built for rank ${position}, ${where}.`, 'success');

    if (!build.rankLegal) {
      showToast?.(
        `${hero.heroClass} can only use ${build.activeSkills.filter((n) => getSkillRanks(hero.heroClass, n)?.launch.includes(position)).length} of these from rank ${position} — the class has little to do here.`,
        'warning'
      );
    }
  };

  const handleFillBestInSlot = () => {
    if (hasHeroConfiguration(hero)) {
      setConfirmState({
        isOpen: true,
        action: doFillBestInSlot,
        title: 'Build for this rank',
        message: `Replace this ${hero.heroClass}'s skills, camp skills and trinkets with the recommended build for rank ${position}?`
      });
      return;
    }
    doFillBestInSlot();
  };

  const handleCopyHero = async () => {
    const ok = await copyTextToClipboard(serializeHero(hero));
    showToast?.(
      ok ? `${hero.heroClass} loadout copied!` : 'Failed to copy to clipboard.',
      ok ? 'success' : 'error'
    );
  };

  const doPasteHero = (pasted) => {
    onUpdate(pasted);
    showToast?.(`Pasted ${pasted.heroClass} into position #${position}!`, 'success');
    // Pegar una clase modded con el interruptor apagado deja una tarjeta sin
    // skills que tocar: los datos son validos, pero no se pueden editar.
    if (MODDED_HERO_CLASSES[pasted.heroClass] && !showModdedHeroes) {
      showToast?.(`${pasted.heroClass} is modded — enable modded heroes to edit it.`, 'error');
    }
  };

  const handlePasteHero = async () => {
    let pasted;
    try {
      pasted = parseHeroClipboard(await readClipboardText());
    } catch (error) {
      showToast?.(error.message, 'error');
      return;
    }

    // Sobrescribir un heroe ya configurado se pregunta, igual que cambiarle la clase.
    if (hasHeroConfiguration(hero)) {
      setConfirmState({
        isOpen: true,
        action: () => doPasteHero(pasted),
        title: 'Paste Over Hero',
        message: `Replace this ${hero.heroClass || 'hero'} with the ${pasted.heroClass} on your clipboard? Its current skills, trinkets and quirks will be lost.`
      });
      return;
    }

    doPasteHero(pasted);
  };

  // El auto-ordenado se aplica AQUI y solo aqui: cambiar un hueco reordena, pero
  // abrir una comp guardada la deja exactamente como se guardo.
  const applySkillOrder = useCallback(
    (selected, roster) => (autoSortSkills ? sortToRoster(selected, roster) : selected),
    [autoSortSkills]
  );

  const toggleSkill = useCallback((skill) => {
    // Si es alwaysActive, no permitir toggle
    if (isAlwaysActive) return;

    const activeSkills = hero.activeSkills || [];
    const newActive = activeSkills.includes(skill)
      ? activeSkills.filter(s => s !== skill)
      : activeSkills.length < HERO_CONFIG.MAX_SKILLS
      ? [...activeSkills, skill]
      : activeSkills;
    updateHero('activeSkills', applySkillOrder(newActive, heroData?.skills));
  }, [hero, isAlwaysActive, updateHero, applySkillOrder, heroData]);

  const toggleCampSkill = useCallback((skill) => {
    const activeCamp = hero.activeCampSkills || [];
    const newActive = activeCamp.includes(skill)
      ? activeCamp.filter(s => s !== skill)
      : activeCamp.length < HERO_CONFIG.MAX_CAMP_SKILLS
      ? [...activeCamp, skill]
      : activeCamp;
    updateHero('activeCampSkills', applySkillOrder(newActive, heroData?.campSkills));
  }, [hero, updateHero, applySkillOrder, heroData]);

  const addQuirk = useCallback((quirk, kind) => {
    // Las enfermedades son su propia lista de tres, no dos rarezas negativas mas.
    if (kind === 'disease') {
      const current = hero.diseases || [];
      if (current.length < HERO_CONFIG.MAX_DISEASES && !current.includes(quirk)) {
        updateHero('diseases', [...current, quirk]);
      }
      return;
    }

    const quirks = hero.quirks || { positive: [], negative: [] };
    const current = quirks[kind] || [];
    const max = kind === 'positive' ? HERO_CONFIG.MAX_POSITIVE_QUIRKS : HERO_CONFIG.MAX_NEGATIVE_QUIRKS;

    if (current.length < max && !current.includes(quirk)) {
      updateHero('quirks', { ...quirks, [kind]: [...current, quirk] });
    }
  }, [hero, updateHero]);

  const removeQuirk = useCallback((quirk, kind) => {
    if (kind === 'disease') {
      updateHero('diseases', (hero.diseases || []).filter(d => d !== quirk));
      return;
    }

    const quirks = hero.quirks || { positive: [], negative: [] };
    const locks = hero.lockedQuirks || { positive: [], negative: [] };

    // Update both quirks and lockedQuirks in a single update to avoid race conditions
    onUpdate({
      ...hero,
      quirks: {
        ...quirks,
        [kind]: quirks[kind].filter(q => q !== quirk)
      },
      lockedQuirks: {
        ...locks,
        [kind]: locks[kind].filter(q => q !== quirk)
      }
    });
  }, [hero, onUpdate, updateHero]);

  const toggleQuirkLock = useCallback((quirk, isPositive) => {
    const locks = hero.lockedQuirks || { positive: [], negative: [] };
    const type = isPositive ? 'positive' : 'negative';
    const current = locks[type] || [];

    const newLocks = current.includes(quirk)
      ? current.filter(q => q !== quirk)
      : current.length < HERO_CONFIG.MAX_LOCKED_QUIRKS
      ? [...current, quirk]
      : current;

    updateHero('lockedQuirks', { ...locks, [type]: newLocks });
  }, [hero, updateHero]);

  const heroSkills = heroData?.skills || [];
  const heroCampSkills = heroData?.campSkills || [];
  const activeSkills = hero.activeSkills || [];
  const activeCampSkills = hero.activeCampSkills || [];

  // Una skill guardada con una grafía que la clase no tiene cuenta para el
  // contador y no enciende ningún botón: la tarjeta decía "Selected: 4/4" con
  // los siete botones apagados y nada explicaba por qué. Los alias de clase
  // (`CLASS_NAME_ALIASES`) arreglan las que conocemos; esto hace visible
  // cualquier otra en vez de dejarla muda.
  const unmatchedSkills = activeSkills.filter((s) => s && !heroSkills.includes(s));
  const unmatchedCampSkills = activeCampSkills.filter((s) => s && !heroCampSkills.includes(s));
  const quirks = hero.quirks || { positive: [], negative: [] };
  const lockedQuirks = hero.lockedQuirks || { positive: [], negative: [] };
  const diseases = hero.diseases || [];

  const slots = (list, count) => Array(count).fill(null).map((_, i) => list[i] || null);
  const positiveSlots = slots(quirks.positive, HERO_CONFIG.MAX_POSITIVE_QUIRKS);
  const negativeSlots = slots(quirks.negative, HERO_CONFIG.MAX_NEGATIVE_QUIRKS);
  const diseaseSlots = slots(diseases, HERO_CONFIG.MAX_DISEASES);

  // Lo ya elegido no se vuelve a ofrecer en el selector.
  const takenByPicker = { positive: quirks.positive, negative: quirks.negative, disease: diseases };

  return (
    <div className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 sm:p-4 border-2 transition-all duration-300 ${
      validation.isComplete ? 'border-green-700/80 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
      validation.hasClass ? 'border-yellow-700/80' : 
      'border-gray-700'
    }`}>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
          <span className="text-lg sm:text-2xl font-bold text-dd-gold font-darkest tracking-wide">#{position}</span>
          
          <HeroSelector
            value={hero.heroClass}
            onChange={handleHeroClassChange}
            className="flex-1 min-w-[150px]"
            showModdedHeroes={showModdedHeroes}
          />
          
          {hero.heroClass && (
            <>
            <button
              onClick={handleFillBestInSlot}
              className="p-1.5 sm:p-2 rounded bg-gray-700/80 hover:bg-dd-gold/30 text-gray-300 hover:text-dd-gold border border-gray-600 transition-colors"
              title={`Build ${hero.heroClass} for rank #${position}`}
              aria-label={`Build for rank ${position}`}
            >
              <Sparkles size={16} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleCopyHero}
              className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-dd-parchment rounded transition-colors border border-gray-600"
              title={`Copy ${hero.heroClass} loadout to clipboard`}
              aria-label="Copy hero loadout"
            >
              <Copy size={16} className="sm:w-5 sm:h-5" />
            </button>
            </>
          )}

          {/* Pegar tambien en un hueco vacio: mover un heroe a otra comp es el caso. */}
          <button
            onClick={handlePasteHero}
            className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-dd-parchment rounded transition-colors border border-gray-600"
            title={`Paste a hero loadout into position #${position}`}
            aria-label="Paste hero loadout"
          >
            <ClipboardPaste size={16} className="sm:w-5 sm:h-5" />
          </button>

          {hero.heroClass && (
            <button
              onClick={handleResetConfiguration}
              className="p-1.5 sm:p-2 bg-red-700/80 hover:bg-red-600 text-dd-parchment rounded transition-colors border border-red-600"
              title="Reset Configuration"
              aria-label="Reset hero configuration"
            >
              <RotateCcw size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* The word is `hidden lg:inline`, so under 1024px the state is a
              colour and an icon. aria-label carries it at every width, and
              data-status gives the tests something better to assert on than a
              Tailwind class name. */}
          {hero.heroClass && !validation.isComplete && (
            <div
              data-testid="hero-status"
              data-status="incomplete"
              aria-label="Hero incomplete"
              className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400 text-xs sm:text-sm"
            >
              <AlertTriangle size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden lg:inline">Incomplete</span>
            </div>
          )}

          {hero.heroClass && validation.isComplete && (
            <div
              data-testid="hero-status"
              data-status="ready"
              aria-label="Hero ready"
              className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-900/30 border border-green-700/50 rounded text-green-400 text-xs sm:text-sm"
            >
              <span aria-hidden="true">✓</span>
              <span className="hidden lg:inline">Ready</span>
            </div>
          )}

          {hero.heroClass && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors ml-auto sm:ml-0"
              aria-label={isExpanded ? 'Collapse hero configuration' : 'Expand hero configuration'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>
      </div>

      {!hero.heroClass && (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-gray-500">
          <UserPlus size={32} className="mb-2 opacity-40" />
          <p className="text-sm italic">Select a hero for position #{position}</p>
        </div>
      )}

      {hero.heroClass && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100 mt-3 sm:mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-dd-parchment mb-2 text-base sm:text-lg font-darkest tracking-wide">
                Combat Skills {isAlwaysActive ? '(7)' : '(4)'}
              </h4>
              <div className="space-y-1 max-h-[200px] sm:max-h-none overflow-y-auto">
                {heroSkills.map(skill => {
                  const isActive = activeSkills.includes(skill);
                  // `position` IS the rank: App renders the cards reversed and
                  // passes 4-idx, so #1 is the front line. null means this app
                  // has no rank data for the skill, which is not a fault.
                  const ranks = getSkillRanks(hero.heroClass, skill);
                  const outOfRank = isActive && ranks && !ranks.launch.includes(position);
                  const afterMoving = outOfRank && ranks.launch.some((r) => reachable.includes(r));
                  return (
                    <HoverCard
                      key={skill}
                      className="w-full"
                      {...skillHover(skill, hero.heroClass, { showTier: showSkillTiers })}
                    >
                      <button
                        onClick={() => toggleSkill(skill)}
                        disabled={isAlwaysActive}
                        aria-pressed={isActive}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors text-left flex items-center justify-between gap-2 ${
                          isActive
                            ? 'bg-green-700/80 hover:bg-green-600 text-dd-parchment font-semibold border border-green-600'
                            : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        } ${isAlwaysActive ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <span className="min-w-0 truncate">{skill}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          {outOfRank && (
                            <span
                              className="text-[10px] leading-none px-1 py-0.5 rounded bg-gray-900/70 border border-gray-500/60 text-gray-300"
                              title={
                                afterMoving
                                  ? `Launches from rank ${ranks.launch.join(' or ')}, which this hero can step into`
                                  : `Launches from rank ${ranks.launch.join(' or ')} — something will have to move them there`
                              }
                            >
                              rank {ranks.launch.join('·')}
                            </span>
                          )}
                          {showSkillTiers && <SkillTierBadge tier={getSkillTier(hero.heroClass, skill)} />}
                        </span>
                      </button>
                    </HoverCard>
                  );
                })}
              </div>
              {!isAlwaysActive && (
                <SelectionCount
                  selected={activeSkills.length}
                  max={4}
                  unmatched={unmatchedSkills}
                  noun="combat skill"
                />
              )}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Camp Skills (4)</h4>
              <div className="space-y-1 max-h-[150px] sm:max-h-none overflow-y-auto">
                {heroCampSkills.map(skill => {
                  const isActive = activeCampSkills.includes(skill);
                  return (
                    <HoverCard key={skill} className="w-full" {...skillHover(skill, hero.heroClass)}>
                      <button
                        onClick={() => toggleCampSkill(skill)}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors text-left ${
                          isActive
                            ? 'bg-purple-700/80 hover:bg-purple-600 text-dd-parchment font-semibold border border-purple-600'
                            : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {skill}
                      </button>
                    </HoverCard>
                  );
                })}
              </div>
              <SelectionCount
                selected={activeCampSkills.length}
                max={4}
                unmatched={unmatchedCampSkills}
                noun="camp skill"
              />
            </div>

            <div>
              <h4 className="font-semibold text-amber-400 mb-2 text-base sm:text-lg font-darkest tracking-wide">Trinkets</h4>
              <div className="space-y-2">
                <TrinketSlotButton
                  trinketName={hero.trinket1}
                  otherTrinketName={hero.trinket2}
                  heroClass={hero.heroClass}
                  placeholder="Trinket 1"
                  onOpen={() => setTrinketPickerSlot(1)}
                  onClear={() => updateHero('trinket1', '')}
                />
                <TrinketSlotButton
                  trinketName={hero.trinket2}
                  otherTrinketName={hero.trinket1}
                  heroClass={hero.heroClass}
                  placeholder="Trinket 2"
                  onOpen={() => setTrinketPickerSlot(2)}
                  onClear={() => updateHero('trinket2', '')}
                />
                <TrinketSetLine trinket1={hero.trinket1} trinket2={hero.trinket2} />
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
            <QuirkList
              title="Positive Quirks"
              heading="text-yellow-400"
              kind="positive"
              slots={positiveSlots}
              filled={quirks.positive}
              locked={lockedQuirks.positive}
              max={HERO_CONFIG.MAX_POSITIVE_QUIRKS}
              addClass="bg-yellow-700/80 hover:bg-yellow-600 border-yellow-600"
              onOpenPicker={setQuirkPicker}
              onToggleLock={(q) => toggleQuirkLock(q, true)}
              onRemove={removeQuirk}
            />

            <QuirkList
              title="Negative Quirks"
              heading="text-red-400"
              kind="negative"
              slots={negativeSlots}
              filled={quirks.negative}
              locked={lockedQuirks.negative}
              max={HERO_CONFIG.MAX_NEGATIVE_QUIRKS}
              addClass="bg-red-700/80 hover:bg-red-600 border-red-600"
              onOpenPicker={setQuirkPicker}
              onToggleLock={(q) => toggleQuirkLock(q, false)}
              onRemove={removeQuirk}
            />

            {/* Optional content, same as modded heroes and backer trinkets: off
                by default, and a comp that carries diseases still shows them. */}
            {(showDiseases || diseases.length > 0) && (
              <QuirkList
                title="Diseases"
                heading="text-green-400"
                kind="disease"
                slots={diseaseSlots}
                filled={diseases}
                max={HERO_CONFIG.MAX_DISEASES}
                addClass="bg-green-700/80 hover:bg-green-600 border-green-600"
                // Locking is a Sanitarium quirk treatment; a disease is cured,
                // never pinned, so the lock would be a button that means nothing.
                canLock={false}
                canAdd={showDiseases}
                onOpenPicker={setQuirkPicker}
                onRemove={removeQuirk}
              />
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Continue"
        isDestructive={true}
        onConfirm={() => {
          confirmState.action?.();
          setConfirmState({ isOpen: false, action: null, title: '', message: '' });
        }}
        onCancel={() => setConfirmState({ isOpen: false, action: null, title: '', message: '' })}
      />

      <QuirkPicker
        isOpen={quirkPicker !== null}
        onClose={() => setQuirkPicker(null)}
        onSelect={(name) => addQuirk(name, quirkPicker)}
        kind={quirkPicker || 'positive'}
        heroClass={hero.heroClass}
        showCrimsonCourt={showCrimsonCourt}
        taken={takenByPicker[quirkPicker] || []}
      />

      <TrinketPicker
        isOpen={trinketPickerSlot !== null}
        onClose={() => setTrinketPickerSlot(null)}
        value={trinketPickerSlot === 1 ? hero.trinket1 : hero.trinket2}
        onChange={(v) => updateHero(trinketPickerSlot === 1 ? 'trinket1' : 'trinket2', v)}
        heroClass={hero.heroClass}
        showBackerTrinkets={showBackerTrinkets}
        showModdedHeroes={showModdedHeroes}
        ownedTrinkets={ownedTrinkets}
        ownedOnly={ownedTrinketsOnly}
        onToggleOwnedOnly={onToggleOwnedTrinketsOnly}
        slotLabel={trinketPickerSlot === 1 ? 'Trinket 1' : 'Trinket 2'}
      />
    </div>
  );
};

/**
 * One titled list of quirk slots with an Add button under it. The three lists
 * differ only in colour, capacity and whether a slot can be locked, so they are
 * one component - which is also what keeps a disease looking like a quirk.
 */
/**
 * "Selected: N/4", y el porqué cuando N no cuadra con lo que se ve encendido.
 *
 * El contador mira el array del héroe y los botones miran el roster de la
 * clase, así que un nombre que la clase no tiene sumaba al total sin encender
 * nada. Nombrarlo es la única salida honesta: borrarlo perdería datos de una
 * comp de un mod que esta build no lleva, y no contarlo mentiría sobre lo que
 * el héroe tiene guardado.
 */
const SelectionCount = ({ selected, max, unmatched = [], noun }) => (
  <div className="mt-1">
    <p className="text-[10px] sm:text-xs text-gray-400">
      Selected: {selected}/{max}
    </p>
    {unmatched.length > 0 && (
      <p
        className="text-[10px] sm:text-xs text-amber-400"
        title={`Saved on this hero but not in the ${noun} list for this class, so no button is highlighted.`}
      >
        {unmatched.length} not in this class&apos;s list: {unmatched.join(', ')}
      </p>
    )}
  </div>
);

const QuirkList = ({
  title,
  heading,
  kind,
  slots,
  filled,
  locked = [],
  max,
  addClass,
  canLock = true,
  canAdd = true,
  onOpenPicker,
  onToggleLock,
  onRemove
}) => (
  <div>
    <h4 className={`font-semibold mb-2 text-base sm:text-lg font-darkest tracking-wide ${heading}`}>{title}</h4>
    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
      {slots.map((quirk, idx) => (
        <QuirkSlot
          key={`${kind}-${idx}-${quirk || 'empty'}`}
          quirk={quirk}
          tone={kind}
          canLock={canLock}
          isLocked={!!quirk && locked.includes(quirk)}
          onToggleLock={() => { if (quirk) onToggleLock?.(quirk); }}
          onRemove={() => { if (quirk) onRemove(quirk, kind); }}
        />
      ))}
    </div>
    {canAdd && filled.length < max && (
      <button
        type="button"
        onClick={() => onOpenPicker(kind)}
        className={`w-full mt-2 px-2 sm:px-3 py-1.5 sm:py-2 text-dd-parchment rounded text-xs sm:text-sm border transition-colors ${addClass}`}
      >
        + Add
      </button>
    )}
  </div>
);

// The set bonus for the equipped pair: gold when both members are on, grey and
// struck through when only one is (so you can see what the second half buys).
const TrinketSetLine = ({ trinket1, trinket2 }) => {
  const set = getSetBonus(trinket1, trinket2);
  if (!set) return null;
  const missing = set.members.find((m) => m !== trinket1 && m !== trinket2);
  return (
    <p
      className={`text-[11px] leading-tight px-1 ${
        set.active ? 'text-dd-gold' : 'text-gray-500 line-through'
      }`}
    >
      <span className="font-darkest tracking-wide">{set.label}</span>
      {!set.active && missing && <span className="no-underline"> (needs {missing})</span>}
      {' — '}
      {set.bonus}
    </p>
  );
};

const TrinketSlotButton = ({ trinketName, otherTrinketName, heroClass, placeholder, onOpen, onClear }) => {
  // Modded trinkets, and the handful the game ships with no buffs, have no
  // effect text — the slot then reads exactly as it did before, name only.
  const trinketEffect = getTrinketEffect(trinketName) || getModdedTrinketEffect(trinketName);

  return (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <HoverCard className="flex-1 min-w-0" {...(trinketName ? trinketHover(trinketName, otherTrinketName) : {})}>
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      title={trinketName || placeholder}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex-1 flex items-center gap-2 bg-gray-800/80 px-2 py-1.5 rounded border-2 border-gray-700 hover:border-dd-gold/50 cursor-pointer transition-colors min-w-0"
    >
      {trinketName ? (
        <>
          <ImageWithFallback
            src={getTrinketImagePath(trinketName, heroClass)}
            alt={trinketName}
            loading="lazy"
            decoding="async"
            className="w-7 h-10 sm:w-8 sm:h-11 object-contain flex-shrink-0"
            fallback={
              <div className="w-7 h-10 sm:w-8 sm:h-11 flex items-center justify-center bg-amber-900/30 text-amber-300 text-[9px] flex-shrink-0">
                ?
              </div>
            }
          />
          <span className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm text-dd-parchment truncate">{trinketName}</span>
            {trinketEffect && (
              <span className="block text-[10px] sm:text-[11px] text-gray-400 leading-tight line-clamp-2">
                {trinketEffect.effect}
              </span>
            )}
          </span>
        </>
      ) : (
        <span className="text-xs sm:text-sm text-gray-500">{placeholder}</span>
      )}
    </div>
    </HoverCard>
    {trinketName && (
      <button
        onClick={onClear}
        type="button"
        className="p-1.5 sm:p-2 bg-red-700/80 hover:bg-red-600 rounded transition-colors border border-red-600 flex-shrink-0"
        title="Clear"
      >
        <X size={14} className="text-dd-parchment" />
      </button>
    )}
  </div>
  );
};

export default HeroConfiguration;