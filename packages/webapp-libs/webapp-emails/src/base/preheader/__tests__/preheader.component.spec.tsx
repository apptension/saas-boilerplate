import { render, screen } from '@testing-library/react';

import { Preheader } from '../';

describe('Preheader', () => {
  test('renders children', () => {
    render(<Preheader>Preview text</Preheader>);
    expect(screen.getByText(/Preview text/)).toBeInTheDocument();
  });
});
