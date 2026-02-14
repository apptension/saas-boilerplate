import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { SSOError } from '../ssoError.component';

describe('SSOError: Component', () => {
  it('should render error page with generic message when code is generic', async () => {
    const { waitForApolloMocks } = render(<SSOError />, {
      routerProps: {
        initialEntries: ['/en/auth/sso/error?code=generic'],
      },
    });

    await waitForApolloMocks();

    expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
    expect(screen.getByText(/an error occurred during sign-in/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /use another sign in method/i })).toBeInTheDocument();
  });

  it('should show auth_failed message when code is auth_failed', async () => {
    const { waitForApolloMocks } = render(<SSOError />, {
      routerProps: {
        initialEntries: ['/en/auth/sso/error?code=auth_failed'],
      },
    });

    await waitForApolloMocks();

    expect(screen.getByText(/authentication failed. please try again/i)).toBeInTheDocument();
  });

  it('should show domain_not_allowed message when code is domain_not_allowed', async () => {
    const { waitForApolloMocks } = render(<SSOError />, {
      routerProps: {
        initialEntries: ['/en/auth/sso/error?code=domain_not_allowed'],
      },
    });

    await waitForApolloMocks();

    expect(screen.getByText(/your email domain is not authorized/i)).toBeInTheDocument();
  });

  it('should use legacy message param when provided', async () => {
    const { waitForApolloMocks } = render(<SSOError />, {
      routerProps: {
        initialEntries: ['/en/auth/sso/error?code=generic&message=Custom%20error%20message'],
      },
    });

    await waitForApolloMocks();

    expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
  });

  it('should have try again link pointing to login', async () => {
    const { waitForApolloMocks } = render(<SSOError />, {
      routerProps: {
        initialEntries: ['/en/auth/sso/error?code=generic'],
      },
    });

    await waitForApolloMocks();

    const tryAgainLink = screen.getByRole('link', { name: /try again/i });
    expect(tryAgainLink).toHaveAttribute('href', '/en/auth/login');
  });
});
