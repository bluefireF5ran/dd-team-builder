import { substituteTrinkets, canEquip } from '../trinketSubstitution';
import { trinketProfile } from '../trinketProfile';

const hero = (heroClass, trinket1 = '', trinket2 = '') => ({ heroClass, trinket1, trinket2 });

describe('canEquip', () => {
  it('keeps a class trinket on its class', () => {
    // Handing the Crusader's Holy Orders to a Vestal is not a substitution, it
    // is a comp you cannot field.
    expect(canEquip('Holy Orders', 'Crusader')).toBe(true);
    expect(canEquip('Holy Orders', 'Vestal')).toBe(false);
  });

  it('lets anyone wear a general trinket', () => {
    // Legendary Bracer reads like a class item and is not one.
    expect(canEquip('Sun Ring', 'Vestal')).toBe(true);
    expect(canEquip('Legendary Bracer', 'Vestal')).toBe(true);
  });

  it('does not block a trinket it has never heard of', () => {
    expect(canEquip('Some Modded Trinket', 'Vestal')).toBe(true);
  });
});

describe('substituteTrinkets', () => {
  it('keeps a trinket the comp asked for when you own it', () => {
    const party = [hero('Vestal', 'Sun Ring', 'Sun Cloak')];
    const out = substituteTrinkets(party, ['Sun Ring', 'Sun Cloak']);
    expect(out.heroes[0]).toMatchObject({ trinket1: 'Sun Ring', trinket2: 'Sun Cloak' });
    expect(out.swaps).toEqual([]);
    expect(out.unfilled).toBe(0);
  });

  it('substitutes something that does the same job', () => {
    // Quickening Satchel is pure speed; Feather Crystal covers it and adds dodge.
    const out = substituteTrinkets([hero('Grave Robber', 'Quickening Satchel')], ['Feather Crystal']);
    expect(out.heroes[0].trinket1).toBe('Feather Crystal');
    expect(out.swaps[0]).toMatchObject({ wanted: 'Quickening Satchel', got: 'Feather Crystal' });
    expect(out.swaps[0].score).toBeGreaterThan(0.5);
  });

  it('leaves a slot empty rather than offering what you do not own', () => {
    // Nothing in the inventory does this job, and a comp you cannot equip is
    // not advice.
    const out = substituteTrinkets([hero('Vestal', 'Quickening Satchel')], ['Bloodied Fetish']);
    expect(out.heroes[0].trinket1).toBe('');
    expect(out.unfilled).toBe(1);
  });

  it('never gives the same trinket to two heroes', () => {
    // A trinket is a physical item, and you own one.
    const party = [hero('Grave Robber', 'Quickening Satchel'), hero('Hellion', 'Quickening Satchel')];
    const out = substituteTrinkets(party, ['Feather Crystal']);
    const used = out.heroes.map((h) => h.trinket1).filter(Boolean);
    expect(used).toEqual(['Feather Crystal']);
    expect(new Set(used).size).toBe(used.length);
    expect(out.unfilled).toBe(1);
  });

  it('never gives the same trinket to both slots of one hero', () => {
    const out = substituteTrinkets(
      [hero('Grave Robber', 'Quickening Satchel', 'Quickening Satchel')],
      ['Feather Crystal']
    );
    expect(out.heroes[0].trinket2).not.toBe(out.heroes[0].trinket1);
  });

  it('does not lose a trinket it decided not to equip', () => {
    // Consuming the pool before the duplicate check spent the item without
    // equipping it, so it vanished from the party and the inventory alike.
    const party = [hero('Grave Robber', 'Quickening Satchel', 'Quickening Satchel'), hero('Hellion', 'Quickening Satchel')];
    const out = substituteTrinkets(party, ['Feather Crystal']);
    const used = out.heroes.flatMap((h) => [h.trinket1, h.trinket2]).filter(Boolean);
    expect(used).toEqual(['Feather Crystal']);
  });

  it('will not put a class trinket on the wrong class', () => {
    // Shameful Shroud is stress relief plus dodge; Holy Orders covers the
    // stress half of that, so it is a real stand-in - for a Crusader only.
    const onCrusader = substituteTrinkets([hero('Crusader', 'Shameful Shroud')], ['Holy Orders']);
    expect(onCrusader.heroes[0].trinket1).toBe('Holy Orders');

    const onVestal = substituteTrinkets([hero('Vestal', 'Shameful Shroud')], ['Holy Orders']);
    expect(onVestal.heroes[0].trinket1).toBe('');
    expect(onVestal.unfilled).toBe(1);
  });

  it('will not chase a downside the comp merely accepted', () => {
    // Berserk Charm is damage and speed bought with stress and accuracy. A
    // trinket offering stress relief covers none of what it was there for.
    const out = substituteTrinkets([hero('Crusader', 'Berserk Charm')], ['Holy Orders']);
    expect(out.heroes[0].trinket1).toBe('');
  });

  it('gives a contested trinket to whoever matches it best', () => {
    // Filled best-match-first across the party, not hero by hero, so rank 1
    // cannot take what rank 2 needed more.
    const party = [hero('Hellion', 'Bloodied Fetish'), hero('Grave Robber', 'Quickening Satchel')];
    const out = substituteTrinkets(party, ['Feather Crystal']);
    expect(out.heroes[1].trinket1).toBe('Feather Crystal');
    expect(out.heroes[0].trinket1).toBe('');
  });

  it('clears the comp trinkets when the inventory is empty', () => {
    const out = substituteTrinkets([hero('Vestal', 'Sun Ring', 'Sun Cloak')], []);
    expect(out.heroes[0]).toMatchObject({ trinket1: '', trinket2: '' });
    expect(out.unfilled).toBe(2);
  });

  it('ignores empty slots and empty heroes', () => {
    const out = substituteTrinkets([hero(''), hero('Vestal')], ['Sun Ring']);
    expect(out.swaps).toEqual([]);
    expect(out.unfilled).toBe(0);
  });

  it('reports what it swapped so the change can be explained', () => {
    const out = substituteTrinkets([hero('Grave Robber', 'Quickening Satchel')], ['Feather Crystal']);
    expect(out.swaps[0]).toEqual({
      index: 0,
      heroClass: 'Grave Robber',
      wanted: 'Quickening Satchel',
      got: 'Feather Crystal',
      score: expect.any(Number)
    });
    // And the thing it picked really is a speed trinket.
    expect(trinketProfile('Feather Crystal').get('spd')).toBeGreaterThan(0);
  });
});
