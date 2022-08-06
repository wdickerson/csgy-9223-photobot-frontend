import { render, screen } from '@testing-library/react';
import App from './App';

test('renders post question button', () => {
  render(<App />);
  const linkElement = screen.getByText(/Post Question/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders show answers button', () => {
  render(<App />);
  const linkElement = screen.getByText(/Show Answers/i);
  expect(linkElement).toBeInTheDocument();
});
