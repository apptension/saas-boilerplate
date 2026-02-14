import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { DefaultLocaleRedirect } from '../defaultLocaleRedirect.component';

const mockUseAvailableLocales = jest.fn(() => ({
  defaultLocale: 'en',
  isLoading: false,
}));

jest.mock('@sb/webapp-core/hooks', () => ({
  ...jest.requireActual<typeof import('@sb/webapp-core/hooks')>('@sb/webapp-core/hooks'),
  useAvailableLocales: () => mockUseAvailableLocales(),
}));

const MockNavigate = ({ to }: { to: string }) => (
  <div data-testid="navigate" data-to={to} />
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <MockNavigate to={to} />
  ),
}));

describe('DefaultLocaleRedirect: Component', () => {
  it('should render nothing when loading', async () => {
    mockUseAvailableLocales.mockReturnValue({
      defaultLocale: 'en',
      isLoading: true,
    });

    const { waitForApolloMocks } = render(<DefaultLocaleRedirect />, {
      routerProps: { initialEntries: ['/'] },
    });
    await waitForApolloMocks();

    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to default locale when at root path', async () => {
    mockUseAvailableLocales.mockReturnValue({
      defaultLocale: 'en',
      isLoading: false,
    });

    const { waitForApolloMocks } = render(<DefaultLocaleRedirect />, {
      routerProps: { initialEntries: ['/'] },
    });
    await waitForApolloMocks();

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/en');
  });

  it('should redirect to locale-prefixed path when not at root', async () => {
    mockUseAvailableLocales.mockReturnValue({
      defaultLocale: 'pl',
      isLoading: false,
    });

    const { waitForApolloMocks } = render(<DefaultLocaleRedirect />, {
      routerProps: { initialEntries: ['/profile'] },
    });
    await waitForApolloMocks();

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/pl/profile');
  });

  it('should preserve search params when redirecting', async () => {
    mockUseAvailableLocales.mockReturnValue({
      defaultLocale: 'en',
      isLoading: false,
    });

    const { waitForApolloMocks } = render(<DefaultLocaleRedirect />, {
      routerProps: { initialEntries: ['/?foo=bar'] },
    });
    await waitForApolloMocks();

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/en?foo=bar');
  });
});
