import { screen } from '@testing-library/react';

import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { LayoutContext } from '../../layout.context';
import { Sidebar } from '../sidebar.component';

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
      <Sidebar />
    </LayoutContext.Provider>
  );
  describe('user is logged out', () => {
    it('should not show link to dashboard', async () => {
      const { waitForApolloMocks } = render(<Component />);
      await waitForApolloMocks();
      expect(screen.queryByText(/dashboard/gi)).not.toBeInTheDocument();
    });

    it('should show link to privacy policy', async () => {
      render(<Component />);
      expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
    });

    it('should not show link to admin page', async () => {
      const { waitForApolloMocks } = render(<Component />);
      await waitForApolloMocks();
      expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
    });
  });

  describe('user is logged in', () => {
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
        expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
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
