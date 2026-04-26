import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /Darkest Dungeon/i });
  expect(titleElement).toBeInTheDocument();
});