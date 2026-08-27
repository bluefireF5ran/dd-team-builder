import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HoverCard from '../HoverCard';

const lines = ['+10% DMG', '-1 SPD'];

// The open/close handlers sit on HoverCard's own wrapper span, and React's
// onMouseEnter does not bubble, so events have to be aimed at the wrapper
// rather than at the icon inside it. No query can express "the element
// carrying the handler", and firing at the child would test nothing.
/* eslint-disable testing-library/no-node-access, testing-library/no-container */
const wrapperOf = (el) => el.parentElement;
const hasNoWrapper = (container) => container.querySelector('span') === null;
/* eslint-enable testing-library/no-node-access, testing-library/no-container */

describe('HoverCard', () => {
  it('shows nothing until hovered, then the title, subtitle and every line', () => {
    render(
      <HoverCard title="Lock of Fury" subtitle="Rare" lines={lines}>
        <button type="button">icon</button>
      </HoverCard>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(wrapperOf(screen.getByText('icon')));
    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('Lock of Fury')).toBeInTheDocument();
    expect(within(card).getByText('Rare')).toBeInTheDocument();
    lines.forEach((l) => expect(within(card).getByText(l)).toBeInTheDocument());
  });

  it('closes again on mouse leave', () => {
    render(<HoverCard title="X" lines={lines}><span>icon</span></HoverCard>);
    const trigger = wrapperOf(screen.getByText('icon'));
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on keyboard focus too, so it is not mouse-only', () => {
    render(<HoverCard title="X" lines={lines}><button type="button">icon</button></HoverCard>);
    fireEvent.focus(wrapperOf(screen.getByText('icon')));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('renders the child untouched when there is nothing worth showing', () => {
    // No wrapper at all, so nothing changes layout and no empty panel can open.
    const { container } = render(
      <HoverCard title="Flickering Lamplight" lines={[]}>
        <button type="button">icon</button>
      </HoverCard>
    );
    expect(hasNoWrapper(container)).toBe(true);
    fireEvent.mouseEnter(screen.getByText('icon'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('drops blank lines rather than drawing empty rows', () => {
    render(<HoverCard title="X" lines={['a', '', null, 'b']}><span>icon</span></HoverCard>);
    fireEvent.mouseEnter(wrapperOf(screen.getByText('icon')));
    const card = screen.getByRole('tooltip');
    expect(within(card).getByText('a')).toBeInTheDocument();
    expect(within(card).getByText('b')).toBeInTheDocument();
  });

  it('cannot swallow a click or a drag aimed at what is underneath', () => {
    render(<HoverCard title="X" lines={lines}><span>icon</span></HoverCard>);
    fireEvent.mouseEnter(wrapperOf(screen.getByText('icon')));
    expect(screen.getByRole('tooltip')).toHaveStyle({ pointerEvents: 'none' });
  });
});
