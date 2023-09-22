import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { useMediaQuery } from '@sb/webapp-core/hooks';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../../app/config/routes';
import { Role } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { LayoutContext } from '../../layout.context';
import { Sidebar } from '../sidebar.component';

jest.mock('@sb/webapp-core/hooks', () => {
  const requireActual = jest.requireActual('@sb/webapp-core/hooks');
  const useMediaQuery = jest.fn();
  useMediaQuery.mockImplementation(() => ({
    matches: true,
  }));
  return {
    ...requireActual,
    useMediaQuery,
  };
});

const mockedUseMediaQuery = useMediaQuery as jest.Mock;

const getApolloMocks = (role: Role = Role.USER) => [
  fillCommonQueryWithUser(
    currentUserFactory({
      roles: [role],
    })
  ),
];

describe('Sidebar: Component', () => {
  const Component = () => (
    <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Routes>
        <Route path="/" element={<Sidebar />} />
        <Route path={getLocalePath(RoutesConfig.home)} element={<span>Home mock route</span>} />
      </Routes>
    </LayoutContext.Provider>
  );
  describe('user is logged out', () => {
    it('should not show link to dashboard', async () => {
      const { waitForApolloMocks } = render(<Component />);
      await waitForApolloMocks();
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });

    it('should show link to privacy policy', async () => {
      render(<Component />);
      expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
    });

    it('should not show link to admin page', async () => {
      const { waitForApolloMocks } = render(<Component />);
      await waitForApolloMocks();
      expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    });
  });

  describe('user is logged in', () => {
    it('should open homepage when clicked on "home" link', async () => {
      const apolloMocks = getApolloMocks();
      const { waitForApolloMocks } = render(<Component />, { apolloMocks });
      await waitForApolloMocks();

      await userEvent.click(await screen.findByLabelText(/home/i));
      expect(screen.getByText('Home mock route')).toBeInTheDocument();
    });

    describe('with user role', () => {
      it('should show link to dashboard', async () => {
        const apolloMocks = getApolloMocks();
        render(<Component />, { apolloMocks });
        expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', async () => {
        const apolloMocks = getApolloMocks();
        render(<Component />, { apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show link to admin page', async () => {
        const apolloMocks = getApolloMocks();
        const { waitForApolloMocks } = render(<Component />, { apolloMocks });
        await waitForApolloMocks();
        expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
      });

      describe('on desktop', () => {
        it('should not show profile and logout link', async () => {
          const apolloMocks = getApolloMocks();
          const { waitForApolloMocks } = render(<Component />, { apolloMocks });
          await waitForApolloMocks();
          expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();
          expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
        });
      });

      describe('on mobile', () => {
        beforeEach(() => {
          mockedUseMediaQuery.mockImplementation(() => ({
            matches: false,
          }));
        });
        it('should show profile and logout link', async () => {
          const apolloMocks = getApolloMocks();
          const { waitForApolloMocks } = render(<Component />, { apolloMocks });
          await waitForApolloMocks();
          expect(await screen.findByText(/profile/i)).toBeInTheDocument();
          expect(await screen.findByText(/logout/i)).toBeInTheDocument();
        });
      });
    });

    describe('with admin role', () => {
      it('should show link to dashboard', async () => {
        const apolloMocks = getApolloMocks(Role.ADMIN);
        render(<Component />, { apolloMocks });
        expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', async () => {
        const apolloMocks = getApolloMocks(Role.ADMIN);
        render(<Component />, { apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should show link to admin page', async () => {
        const apolloMocks = getApolloMocks(Role.ADMIN);
        render(<Component />, { apolloMocks });
        expect(await screen.findByText(/admin/i)).toBeInTheDocument();
      });
    });
  });
});
