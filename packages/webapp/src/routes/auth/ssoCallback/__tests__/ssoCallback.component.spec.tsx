import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { SSOCallback } from '../ssoCallback.component';

jest.mock('@sb/webapp-core/services/analytics');

const mockNavigate = jest.fn();
const mockSetItem = jest.fn();
const originalLocation = window.location;

const mockUseSearchParams = jest.fn(() => [
  new URLSearchParams('?access=access-token&refresh=refresh-token'),
]);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

beforeEach(() => {
  mockNavigate.mockReset();
  mockSetItem.mockReset();
  Object.defineProperty(window, 'localStorage', {
    value: { setItem: mockSetItem, getItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(), length: 0, key: jest.fn() },
    writable: true,
  });
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '' },
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
});

describe('SSOCallback: Component', () => {
  it('should store tokens and redirect when access and refresh tokens are present', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?access=access-token&refresh=refresh-token&next=%2Fen%2Fprofile'),
    ]);

    render(<SSOCallback />, {
      routerProps: createMockRouterProps(`auth/sso/callback`, {}),
    });

    await screen.findByText(/completing sign in/i);

    expect(mockSetItem).toHaveBeenCalledWith('token', 'access-token');
    expect(mockSetItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    expect(trackEvent).toHaveBeenCalledWith('auth', 'sso-login');
    expect(window.location.href).toBe('/en/profile');
  });

  it('should show error when access token is missing', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?refresh=refresh-token'),
    ]);

    render(<SSOCallback />, {
      routerProps: createMockRouterProps(`auth/sso/callback`, {}),
    });

    expect(await screen.findByText(/missing authentication tokens/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /return to login/i })).toBeInTheDocument();
  });

  it('should show error when refresh token is missing', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?access=access-token'),
    ]);

    render(<SSOCallback />, {
      routerProps: createMockRouterProps(`auth/sso/callback`, {}),
    });

    expect(await screen.findByText(/missing authentication tokens/i)).toBeInTheDocument();
  });

  it('should navigate to login when return to login is clicked', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?refresh=refresh-token'),
    ]);

    render(<SSOCallback />, {
      routerProps: createMockRouterProps(`auth/sso/callback`, {}),
    });

    const returnButton = await screen.findByRole('button', { name: /return to login/i });
    await userEvent.click(returnButton);

    expect(mockNavigate).toHaveBeenCalledWith('/en/auth/login');
  });
});
