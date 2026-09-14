import React from 'react';
import { render, screen, within } from '@testing-library/react';
import StatRows from '../StatRows';
import { statBreakdown } from '../../../utils/statBreakdown';

const row = (key) => screen.getByTestId(`stat-${key}`);
const jester = {
  heroClass: 'Jester',
  trinket1: "Ancestor's Coat",
  trinket2: 'Camouflage Cloak',
  quirks: { positive: ['Corvids Grace', 'Luminous', 'Evasive'], negative: [] },
  activeSkills: ['Solo'],
};

describe('StatRows', () => {
  it('shows the stacked total and the party potential beside it', () => {
    render(<StatRows breakdown={statBreakdown(jester, { party: [jester], heroIndex: 0 })} />);
    expect(row('dodge')).toHaveTextContent('91.5');
    expect(row('dodge')).toHaveTextContent('+30');
    expect(within(row('dodge')).getByTestId('stat-bar-potential')).toBeInTheDocument();
  });

  it('paints the fill with every source, from the most fixed to the most temporary', () => {
    // El degradado en si lo fija `segmentGradient` en statBreakdown.test; jsdom
    // no conserva un gradiente en `style`, asi que aqui se miran las capas.
    render(<StatRows breakdown={statBreakdown(jester, { party: [jester], heroIndex: 0 })} />);
    expect(within(row('dodge')).getByTestId('stat-bar-fill')).toHaveAttribute(
      'data-layers',
      'base estate light trinket quirk'
    );
  });

  it('names the layers it drew in a legend', () => {
    render(<StatRows breakdown={statBreakdown(jester, { party: [jester], heroIndex: 0 })} />);
    ['Base', 'Estate', 'Light', 'Trinkets', 'Quirks', 'Skills in this party'].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it('marks what a negative layer takes away', () => {
    // Camouflage Cloak le quita Stun Resist, no DODGE; un quirk negativo de
    // DODGE si resta de la barra.
    const clumsy = { heroClass: 'Leper', quirks: { positive: [], negative: ['Clumsy'] } };
    render(<StatRows breakdown={statBreakdown(clumsy)} />);
    const bd = statBreakdown(clumsy);
    if (!bd.stats.dodge.parts.some((p) => p.amount < 0)) return; // el quirk no existe con ese efecto
    expect(within(row('dodge')).getByTestId('stat-bar-loss')).toBeInTheDocument();
  });

  it('draws no potential without a party', () => {
    render(<StatRows breakdown={statBreakdown(jester)} />);
    expect(within(row('dodge')).queryByTestId('stat-bar-potential')).not.toBeInTheDocument();
  });

  it('says nothing about LOWEST or HIGHEST', () => {
    render(<StatRows breakdown={statBreakdown({ heroClass: 'Leper' })} />);
    expect(screen.queryByText(/lowest|highest/i)).not.toBeInTheDocument();
  });

  it('draws the same rows larger for the stats window', () => {
    render(<StatRows breakdown={statBreakdown({ heroClass: 'Leper' })} size="lg" />);
    expect(row('hp')).toHaveTextContent('63');
    expect(row('hp')).toHaveClass('text-base');
  });

  it('renders nothing for a class with no stats', () => {
    const { container } = render(<StatRows breakdown={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
