import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RankerApp from '../RankerApp';

beforeEach(() => localStorage.clear());

const startRun = () => {
  fireEvent.click(screen.getByRole('button', { name: /start ranking/i }));
  fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
};

describe('RankerApp', () => {
  it('shows the three categories with their item counts', () => {
    render(<RankerApp />);
    expect(screen.getByText('Ranking Engine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Heroes.*20 items/s })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skills.*140 items/s })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Camp Skills.*80 items/s })).toBeInTheDocument();
  });

  it('asks for confirmation with the item count and comparison estimate', () => {
    render(<RankerApp />);
    fireEvent.click(screen.getByRole('button', { name: /start ranking/i }));
    expect(
      screen.getByText(/You are about to rank 20 heroes\. This will take an estimated \d+ comparisons\./)
    ).toBeInTheDocument();
  });

  it('runs head-to-heads and records a pick', () => {
    render(<RankerApp />);
    startRun();

    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText(/Comparison 1 of ~\d+/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Vanilla class/ })[0]);
    expect(screen.getByText(/Comparison 2 of ~\d+/)).toBeInTheDocument();
  });

  it('supports keyboard picks and undo', () => {
    render(<RankerApp />);
    startRun();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/Comparison 2 of ~\d+/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'u' });
    expect(screen.getByText(/Comparison 1 of ~\d+/)).toBeInTheDocument();
  });

  it('finishes early and shows a ranking flagged as approximate', () => {
    render(<RankerApp />);
    startRun();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.click(screen.getByRole('button', { name: /finish early/i }));

    expect(screen.getByText(/Heroes — final ranking/)).toBeInTheDocument();
    expect(screen.getByText(/approximate/)).toBeInTheDocument();
  });

  it('completes a whole category and reports the exact order', () => {
    render(<RankerApp />);
    startRun();

    let guard = 0;
    while (screen.queryByText('VS') && guard++ < 500) {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
    }

    expect(screen.getByText(/Heroes — final ranking/)).toBeInTheDocument();
    expect(screen.getByText(/exact order/)).toBeInTheDocument();
    expect(screen.getByText(/20 items in \d+ comparisons/)).toBeInTheDocument();
  });

  it('rebuilds the pools when the roster changes', () => {
    render(<RankerApp />);
    fireEvent.click(screen.getByRole('button', { name: /Roster \(20\)/ }));

    fireEvent.click(screen.getByTitle(/^Remove Vestal/));

    expect(screen.getByRole('button', { name: /Heroes.*19 items/s })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skills.*133 items/s })).toBeInTheDocument();
  });
});

describe('RankerApp — generalist mode', () => {
  const goGeneralist = () =>
    fireEvent.click(screen.getByRole('button', { name: /Generalist/ }));

  const names = () =>
    screen.getAllByRole('listitem').map((row) => row.textContent);

  it('swaps the pairwise setup for the four usage categories', () => {
    render(<RankerApp />);
    goGeneralist();

    expect(screen.queryByRole('button', { name: /start ranking/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Trinkets/ })).toBeInTheDocument();
    // Sin numeros a mano: la libreria crece y la taxonomia se reafina, y clavar
    // aqui el recuento solo hace que este test falle por cada comp que se anade.
    expect(screen.getByText(/\d+ comps · \d+ families · \d+ hero slots/)).toBeInTheDocument();
  });

  it('ranks heroes by how much of the library they take up', () => {
    render(<RankerApp />);
    goGeneralist();
    expect(names()[0]).toMatch(/Houndmaster/);
  });

  it('counting comp families instead of slots demotes the heroes carried by one family', () => {
    render(<RankerApp />);
    goGeneralist();
    fireEvent.click(screen.getByRole('button', { name: /Per comp family/ }));

    const top = names().slice(0, 3).join(' ');
    expect(top).toMatch(/Crusader/);
    expect(names()[0]).not.toMatch(/Houndmaster/);
  });

  it('flattening promotes the staple of a rarely played class over a situational pick', () => {
    render(<RankerApp />);
    goGeneralist();
    fireEvent.click(screen.getByRole('button', { name: /^Skills/ }));

    fireEvent.click(screen.getByRole('button', { name: /Raw usage/ }));
    const rawTop = names().slice(0, 5).join(' ');
    expect(rawTop).toMatch(/Hound's Rush/);
    expect(rawTop).toMatch(/Guard Dog/);

    fireEvent.click(screen.getByRole('button', { name: /Adoption rate/ }));
    const flatTop = names().slice(0, 5).join(' ');
    // Guard Dog solo estaba arriba porque el Houndmaster sale mucho: se cae en
    // cuanto se mide "de los que podian, cuantos la cogieron".
    expect(flatTop).not.toMatch(/Guard Dog/);
  });

  it('filters everything down to one class', () => {
    render(<RankerApp />);
    goGeneralist();
    fireEvent.click(screen.getByRole('button', { name: /^Trinkets/ }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Vestal' } });

    const rows = names();
    expect(rows[0]).toMatch(/Atonement Beads|Salacious Diary/);
    rows.forEach((row) => expect(row).toMatch(/of 22$|Vestal|Any class/));
  });
});
