import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Badge } from '../badge';

describe('Badge: Component', () => {
  it('should render the badge with default variant', async () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should render with success variant', async () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should render with destructive variant', async () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should render with warning variant', async () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-100');
  });

  it('should render with info variant', async () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('should render with muted variant', async () => {
    render(<Badge variant="muted">Muted</Badge>);
    const badge = screen.getByText('Muted');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-muted');
  });

  it('should apply custom className', async () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });
});



