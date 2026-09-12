import {
  RARITY_TONES, NO_RARITY, withAlpha, trinketRarity, rarityTone, trinketTone, rarityBorderStyle
} from '../trinketRarity';
import { TRINKET_EFFECTS } from '../../data/trinketEffects';
import { MODDED_TRINKET_EFFECTS } from '../../data/moddedEffects';
import { MODDED_TRINKET_EFFECTS_GENERATED } from '../../data/moddedEffectsGenerated';

const raritiesOf = (store) => Object.values(store).map((e) => e.rarity).filter(Boolean);

/**
 * Los tiers que la paleta TIENE que cubrir: los del juego y los escritos a mano.
 *
 * Es un conjunto CERRADO -- el juego tiene los tiers que tiene -- y por eso se
 * puede exigir en los dos sentidos: sin tono, un trinket se dibujaria como "sin
 * rareza" sin avisar, que es el bug que esto vigila.
 *
 * Los generados no entran, y no es pereza. Un mod se inventa el tier que quiere
 * (`Kuuga TH`, `Boar Beach`, `Messiah Joke`): son 17 hoy y serian otros manana
 * con instalar otra cosa, asi que exigirles tono convierte "suscribirse a un
 * mod" en "suite roja", y ponerles uno a ojo seria inventar una jerarquia que
 * el mod no declara. Lo que si se les exige esta abajo: degradar limpiamente.
 */
const GENERATED_RARITIES = new Set(raritiesOf(MODDED_TRINKET_EFFECTS_GENERATED));
const handAuthoredModded = Object.fromEntries(
  Object.entries(MODDED_TRINKET_EFFECTS).filter(([name]) => !MODDED_TRINKET_EFFECTS_GENERATED[name])
);
const RARITIES_IN_DATA = [...new Set([
  ...raritiesOf(TRINKET_EFFECTS),
  ...raritiesOf(handAuthoredModded),
])];

const rgb = (hex) => {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m.slice(1).map((h) => parseInt(h, 16));
};

describe('the palette covers the data', () => {
  it('has a tone for every rarity any trinket actually has', () => {
    const missing = RARITIES_IN_DATA.filter((r) => !RARITY_TONES[r]);
    expect(missing).toEqual([]);
  });

  it('carries no tone the data never uses', () => {
    const orphans = Object.keys(RARITY_TONES).filter((r) => !RARITIES_IN_DATA.includes(r));
    expect(orphans).toEqual([]);
  });

  // Un tier que un mod se invento no tiene tono y no debe tenerlo: se dibuja
  // como "sin tier", que es la respuesta honesta, y nunca revienta.
  it('degrades a rarity a mod invented to no tier', () => {
    const unknown = [...GENERATED_RARITIES].filter((r) => !RARITY_TONES[r]);
    unknown.forEach((r) => {
      expect(rarityTone(r)).toBe(NO_RARITY);
    });
    expect(rarityTone('Kuuga TH')).toBe(NO_RARITY);
    expect(rarityTone(null)).toBe(NO_RARITY);
  });

  it('still draws a border for a trinket whose tier nothing knows', () => {
    const style = rarityBorderStyle('a trinket that does not exist');
    expect(style).toEqual(expect.objectContaining({ borderColor: expect.any(String) }));
  });

  it('gives every tone a label and a six-digit hex', () => {
    Object.entries(RARITY_TONES).forEach(([rarity, tone]) => {
      expect({ rarity, label: typeof tone.label, colour: tone.colour })
        .toEqual({ rarity, label: 'string', colour: expect.stringMatching(/^#[0-9a-f]{6}$/i) });
    });
  });
});

describe('the tiers are told apart', () => {
  // The six drop tiers are the ones a player reads constantly, so they get the
  // strict check: no two may be close enough to confuse at a glance.
  const DROP_TIERS = ['Very Common', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Ancestral'];

  const distance = (a, b) => {
    const [r1, g1, b1] = rgb(a);
    const [r2, g2, b2] = rgb(b);
    // Weighted euclidean: green carries the most perceived brightness, blue
    // the least, so a plain RGB distance overstates how different two blues are.
    return Math.sqrt(2 * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + 3 * (b1 - b2) ** 2);
  };

  it('keeps the six drop tiers far apart', () => {
    const tooClose = [];
    DROP_TIERS.forEach((a, i) => DROP_TIERS.slice(i + 1).forEach((b) => {
      const d = distance(RARITY_TONES[a].colour, RARITY_TONES[b].colour);
      if (d < 150) tooClose.push(`${a} vs ${b} (${Math.round(d)})`);
    }));
    expect(tooClose).toEqual([]);
  });

  it('never gives two different rarities the same colour, bar the deliberate pairs', () => {
    // `Set` and `Fire's Edge` are the same DLC and share a colour on purpose.
    const SHARED = [["Fire's Edge", 'Set']];
    const byColour = new Map();
    Object.entries(RARITY_TONES).forEach(([rarity, { colour }]) => {
      const key = colour.toLowerCase();
      byColour.set(key, [...(byColour.get(key) || []), rarity]);
    });
    const clashes = [...byColour.values()]
      .filter((names) => names.length > 1)
      .filter((names) => !SHARED.some((pair) => pair.length === names.length
        && pair.every((n) => names.includes(n))));
    expect(clashes).toEqual([]);
  });

  it('keeps every other pair distinguishable too', () => {
    // Looser than the drop tiers: these turn up rarely and usually alone, but
    // a near-duplicate would still make the border say nothing.
    const SHARED = new Set(["Fire's Edge|Set"]);
    const names = Object.keys(RARITY_TONES);
    const tooClose = [];
    names.forEach((a, i) => names.slice(i + 1).forEach((b) => {
      if (SHARED.has([a, b].sort().join('|'))) return;
      const d = distance(RARITY_TONES[a].colour, RARITY_TONES[b].colour);
      if (d < 50) tooClose.push(`${a} vs ${b} (${Math.round(d)})`);
    }));
    expect(tooClose).toEqual([]);
  });

  it('is legible on the app\'s dark background', () => {
    // Nothing so dark it reads as "no border" against gray-800 (#1f2937).
    const dim = Object.entries(RARITY_TONES).filter(([, { colour }]) => {
      const [r, g, b] = rgb(colour);
      return (0.299 * r + 0.587 * g + 0.114 * b) < 70;
    });
    expect(dim.map(([r]) => r)).toEqual([]);
  });
});

describe('resolving a trinket', () => {
  it('reads the rarity off the generated effect data', () => {
    expect(trinketRarity('Sun Ring')).toBe(TRINKET_EFFECTS['Sun Ring'].rarity);
    expect(trinketTone('Sun Ring').colour).toBe(RARITY_TONES[TRINKET_EFFECTS['Sun Ring'].rarity].colour);
  });

  it('finds a modded trinket the generated data has never heard of', () => {
    const modded = Object.keys(MODDED_TRINKET_EFFECTS)[0];
    expect(TRINKET_EFFECTS[modded]).toBeUndefined();
    expect(trinketRarity(modded)).toBe(MODDED_TRINKET_EFFECTS[modded].rarity);
  });

  it('falls back rather than inventing a tier for the Sunstone chain', () => {
    // It transforms instead of dropping at a tier, so `rarity` is null.
    expect(trinketRarity('Inert Sunstone')).toBeNull();
    expect(trinketTone('Inert Sunstone')).toBe(NO_RARITY);
  });

  it('falls back for a name it has never heard of', () => {
    expect(trinketRarity('Not A Trinket')).toBeNull();
    expect(rarityTone('Not A Tier')).toBe(NO_RARITY);
  });
});

describe('rarityBorderStyle', () => {
  it('gives just a border colour by default', () => {
    expect(rarityBorderStyle('Sun Ring')).toEqual({
      borderColor: RARITY_TONES[TRINKET_EFFECTS['Sun Ring'].rarity].colour
    });
  });

  it('adds a wash of the same colour when asked', () => {
    const style = rarityBorderStyle('Sun Ring', { tint: 0.1 });
    expect(style.backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\.1\)$/);
  });
});

describe('withAlpha', () => {
  it('turns a hex into rgba', () => {
    expect(withAlpha('#3FA45B', 0.25)).toBe('rgba(63, 164, 91, 0.25)');
  });

  it('survives junk rather than emitting invalid css', () => {
    expect(withAlpha(undefined, 0.5)).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    expect(withAlpha('not a colour', 0.5)).toMatch(/^rgba\(/);
  });
});
