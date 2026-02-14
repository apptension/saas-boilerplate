import { render, screen } from '@testing-library/react';

import { Text } from '../';

describe('Text', () => {
  test('renders default variant', () => {
    render(<Text>Default text</Text>);
    expect(screen.getByText('Default text')).toBeInTheDocument();
  });

  test('renders secondary variant', () => {
    render(<Text variant="secondary">Secondary</Text>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  test('renders muted variant', () => {
    render(<Text variant="muted">Muted</Text>);
    expect(screen.getByText('Muted')).toBeInTheDocument();
  });

  test('renders small variant', () => {
    render(<Text variant="small">Small</Text>);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  test('renders with left alignment', () => {
    render(<Text align="left">Left</Text>);
    expect(screen.getByText('Left')).toBeInTheDocument();
  });

  test('renders with right alignment', () => {
    render(<Text align="right">Right</Text>);
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
