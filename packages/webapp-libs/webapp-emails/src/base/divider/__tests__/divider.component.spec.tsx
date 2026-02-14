import { render } from '@testing-library/react';

import { Divider } from '../';

describe('Divider', () => {
  test('renders divider', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with sm spacing', () => {
    const { container } = render(<Divider spacing="sm" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with lg spacing', () => {
    const { container } = render(<Divider spacing="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
