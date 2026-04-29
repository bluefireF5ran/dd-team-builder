import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  test('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog isOpen={false} title="Test" message="Msg" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  test('renders title and message when open', () => {
    render(
      <ConfirmDialog isOpen={true} title="Delete Item" message="Are you sure?" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog isOpen={true} title="Test" message="Msg" onConfirm={onConfirm} onCancel={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog isOpen={true} title="Test" message="Msg" onConfirm={jest.fn()} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('renders custom confirm label', () => {
    render(
      <ConfirmDialog isOpen={true} title="Test" message="Msg" confirmLabel="Delete" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
