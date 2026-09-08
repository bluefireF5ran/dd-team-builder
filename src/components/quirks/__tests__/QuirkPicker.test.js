import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import QuirkPicker from '../QuirkPicker';
import { getRecommendedQuirks } from '../../../data/recommendations';
import { CRIMSON_COURT_DISEASES } from '../../../data/diseases';
import { QUIRK_EFFECTS } from '../../../data/quirkEffects';

const open = (props = {}) => render(
  <QuirkPicker
    isOpen
    onClose={jest.fn()}
    onSelect={jest.fn()}
    kind="positive"
    heroClass="Crusader"
    showCrimsonCourt={false}
    taken={[]}
    {...props}
  />
);

// The section heading and its grid are siblings, so "the cards under this
// heading" means the heading's parent.
/* eslint-disable testing-library/no-node-access */
const section = (label) => screen.getByText(label).parentElement;
/* eslint-enable testing-library/no-node-access */

describe('QuirkPicker', () => {
  it('renders nothing while closed', () => {
    const { container } = open({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows what a quirk does, not just its name', () => {
    // This is the whole point of replacing the dropdown: the old one listed 91
    // names and nothing else.
    open();
    expect(screen.getAllByText(QUIRK_EFFECTS.Tough.effect).length).toBeGreaterThan(0);
  });

  it('recommends at most five, in the order the library uses them', () => {
    open();
    const recommended = getRecommendedQuirks('Crusader').positive;
    expect(recommended.length).toBeLessThanOrEqual(5);

    const names = within(section('Recommended'))
      .getAllByRole('button')
      .map((b) => b.getAttribute('title'));
    expect(names).toEqual(recommended);
  });

  it('splits the rest by the physical / mental / in-town grouping', () => {
    open();
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Mental')).toBeInTheDocument();
    expect(screen.getByText('In Town & At Curios')).toBeInTheDocument();
  });

  it('does not offer a quirk the hero already has', () => {
    open({ taken: ['Tough'] });
    expect(screen.queryByTitle('Tough')).not.toBeInTheDocument();
  });

  it('hands the chosen name back and closes', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    open({ onSelect, onClose });

    fireEvent.click(screen.getAllByTitle('Tough')[0]);
    expect(onSelect).toHaveBeenCalledWith('Tough');
    expect(onClose).toHaveBeenCalled();
  });

  it('filters on typing, and says so when nothing matches', () => {
    open();
    fireEvent.change(screen.getByPlaceholderText('Search quirks...'), { target: { value: 'tough' } });
    expect(screen.getAllByTitle('Tough').length).toBeGreaterThan(0);
    expect(screen.queryByTitle('Fragile')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search quirks...'), { target: { value: 'zzzz' } });
    expect(screen.getByText(/No quirks match your search/)).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    open({ onClose });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  describe('diseases', () => {
    it('offers the plain diseases and no recommendations', () => {
      // Nothing in the comp library carries a disease, so a "Recommended"
      // heading here would always be empty.
      open({ kind: 'disease' });
      expect(screen.getByText('Diseases')).toBeInTheDocument();
      expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
      expect(screen.getAllByTitle('Tapeworm').length).toBeGreaterThan(0);
    });

    it('keeps the Crimson Court behind its own switch', () => {
      open({ kind: 'disease', showCrimsonCourt: false });
      CRIMSON_COURT_DISEASES.forEach((d) => {
        expect(screen.queryByTitle(d)).not.toBeInTheDocument();
      });
    });

    it('offers the Crimson Court once the switch is on', () => {
      open({ kind: 'disease', showCrimsonCourt: true });
      expect(screen.getByText('Crimson Court')).toBeInTheDocument();
      CRIMSON_COURT_DISEASES.forEach((d) => {
        expect(screen.getAllByTitle(d).length).toBeGreaterThan(0);
      });
    });
  });
});
