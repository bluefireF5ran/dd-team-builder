import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from '../Modal';

const Dialog = ({ onClose = () => {}, ...props }) => (
  <Modal isOpen onClose={onClose} labelledBy="t" {...props}>
    <h3 id="t">A dialog</h3>
    <button>first</button>
    <button disabled>disabled</button>
    <button>last</button>
  </Modal>
);

describe('Modal', () => {
  it('is announced as a dialog, which seven of the nine hand-rolled ones were not', () => {
    render(<Dialog />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('A dialog');
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    render(<Dialog onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on a backdrop click but not on a click inside', () => {
    const onClose = jest.fn();
    render(<Dialog onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'first' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('wraps Tab round instead of letting it escape to the page behind', () => {
    render(<Dialog />);
    const first = screen.getByRole('button', { name: 'first' });
    const last = screen.getByRole('button', { name: 'last' });

    last.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('never wraps onto a disabled control', () => {
    // A disabled Suggest button sits in the DOM the whole time the roster is
    // too small; landing on it would strand the user mid-tab.
    render(<Dialog />);
    screen.getByRole('button', { name: 'last' }).focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'disabled', hidden: true })).not.toHaveFocus();
  });

  it('gives focus back to whatever opened it', () => {
    // Closing the trinket picker used to drop you at <body>, so the next Tab
    // restarted at the top of the page rather than at the slot you came from.
    render(<button>opener</button>);
    const opener = screen.getByRole('button', { name: 'opener' });
    opener.focus();

    const { unmount } = render(<Dialog />);
    screen.getByRole('button', { name: 'first' }).focus();
    expect(opener).not.toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();
  });

  it('moves focus into itself on open', async () => {
    render(<button>opener</button>);
    screen.getByRole('button', { name: 'opener' }).focus();
    render(<Dialog />);
    // The initial focus is deferred a frame so a child's own autoFocus wins.
    await waitFor(() => expect(screen.getByRole('button', { name: 'first' })).toHaveFocus());
  });

  it('renders nothing at all when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} label="x">
        <button>hidden</button>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'hidden' })).not.toBeInTheDocument();
  });
});
