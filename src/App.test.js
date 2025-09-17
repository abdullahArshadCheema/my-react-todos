import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // isolate localStorage state per test
  window.localStorage.clear();
});

test('shows Intro on first visit and proceeds on Get started', () => {
  render(<App />);
  expect(screen.getByText(/Focus on what matters/i)).toBeInTheDocument();
  const btn = screen.getByRole('button', { name: /get started/i });
  fireEvent.click(btn);
  expect(screen.queryByText(/Focus on what matters/i)).not.toBeInTheDocument();
  // Now TodoList title visible
  expect(screen.getByText(/To-Do List/i)).toBeInTheDocument();
  // Flag persisted
  expect(window.localStorage.getItem('seenIntro')).toBe('true');
});

test('skips Intro when seenIntro is true', () => {
  window.localStorage.setItem('seenIntro', 'true');
  render(<App />);
  expect(screen.queryByText(/Focus on what matters/i)).not.toBeInTheDocument();
  expect(screen.getByText(/To-Do List/i)).toBeInTheDocument();
});
