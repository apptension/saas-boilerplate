import { render, screen } from '@testing-library/react';

import { NotificationErrorBoundary } from '../notificationErrorBoundary.component';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('NotificationErrorBoundary: Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', () => {
    render(
      <NotificationErrorBoundary>
        <span data-testid="child">Content</span>
      </NotificationErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render null when child throws', () => {
    const { container } = render(
      <NotificationErrorBoundary>
        <ThrowError />
      </NotificationErrorBoundary>
    );

    expect(container.firstChild).toBeNull();
  });
});
