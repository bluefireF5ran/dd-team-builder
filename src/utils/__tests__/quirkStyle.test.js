import { quirkTone, toneClasses, quirkClasses, QUIRK_TONES } from '../quirkStyle';

describe('quirkTone', () => {
  it('colours a plain quirk by the side it is on', () => {
    expect(quirkTone('Tough')).toBe('positive');
    expect(quirkTone('Fragile', 'negative')).toBe('negative');
  });

  it('colours a disease green and the Crimson Curse red', () => {
    expect(quirkTone('Tapeworm')).toBe('disease');
    expect(quirkTone('Grey Rot')).toBe('disease');
    expect(quirkTone('Crimson Curse')).toBe('crimson');
    expect(quirkTone('Crimson Curse (blood lust!)')).toBe('crimson');
  });

  it('lets the Color of Madness sets keep their own colour', () => {
    // Both sit in the ordinary positive/negative lists, so without this they
    // would be indistinguishable from any other quirk.
    expect(quirkTone('Prismatic Calm')).toBe('prismatic');
    expect(quirkTone('Corvids Eye')).toBe('corvid');
    // A corvid quirk is negative and still purple: the set wins over the side.
    expect(quirkTone('Corvids Blindness', 'negative')).toBe('corvid');
  });

  it('falls back to the list a name came out of when it knows nothing', () => {
    // A modded or misspelt quirk still has to draw as the slot it sits in.
    expect(quirkTone('Some Modded Quirk', 'negative')).toBe('negative');
    expect(quirkTone('Some Modded Quirk', 'disease')).toBe('disease');
    expect(quirkTone('Some Modded Quirk')).toBe('positive');
  });

  it('survives an empty name rather than throwing', () => {
    expect(quirkTone(null, 'positive')).toBe('positive');
    expect(quirkTone(undefined)).toBe('positive');
  });
});

describe('tone classes', () => {
  it('gives every tone the four class bundles the UI asks for', () => {
    Object.entries(QUIRK_TONES).forEach(([name, tone]) => {
      expect({ name, keys: Object.keys(tone).sort() })
        .toEqual({ name, keys: ['card', 'chip', 'heading', 'label', 'slot', 'text'] });
    });
  });

  it('writes class names out in full, because Tailwind scans for them literally', () => {
    // A template-built class (`bg-${x}-900/40`) never reaches the stylesheet.
    Object.values(QUIRK_TONES).forEach((tone) => {
      expect(tone.slot).not.toContain('${');
      expect(tone.chip).not.toContain('${');
    });
  });

  it('never hands back undefined for an unknown tone', () => {
    expect(toneClasses('nonsense')).toBe(QUIRK_TONES.positive);
  });

  it('resolves a name straight to its classes', () => {
    expect(quirkClasses('Tapeworm')).toBe(QUIRK_TONES.disease);
    expect(quirkClasses('Prismatic Speed')).toBe(QUIRK_TONES.prismatic);
  });
});
