import { trinketHover } from '../hoverInfo';

// The set line depends on BOTH equipped trinkets - trinketHover takes the other
// slot's trinket as its second arg. Without it the bonus can only ever read as
// inactive, which is the bug this pins.
describe('trinketHover set line', () => {
  const lastLine = (name, other) => {
    const { lines } = trinketHover(name, other);
    return lines[lines.length - 1];
  };

  it('marks the set active (gold) when both members are the equipped pair', () => {
    const node = lastLine('Shameful Shroud', 'Osmond Chains');
    expect(node).toEqual(expect.objectContaining({
      props: expect.objectContaining({ className: expect.stringContaining('text-dd-gold') }),
    }));
    expect(node.props.className).not.toContain('line-through');
  });

  it('marks the set inactive (struck through) when only one member is equipped', () => {
    const node = lastLine('Shameful Shroud', 'Bag of Marbles');
    expect(node.props.className).toContain('line-through');
    expect(node.props.children).toContain('Osmond Chains');
  });

  it('also reads inactive when the other slot is empty', () => {
    const node = lastLine('Shameful Shroud', undefined);
    expect(node.props.className).toContain('line-through');
  });

  it('covers modded sets through the same path', () => {
    const node = lastLine('Bloody Soil', 'Sun-bleached Hairlock');
    expect(node.props.className).toContain('text-dd-gold');
  });

  it('adds no set line for a trinket that is not in any set', () => {
    const { lines } = trinketHover('Bag of Marbles', 'Lock of Fury');
    expect(lines.every((l) => typeof l === 'string')).toBe(true);
  });
});
