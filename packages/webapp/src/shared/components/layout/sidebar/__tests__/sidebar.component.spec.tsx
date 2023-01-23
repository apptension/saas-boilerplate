import { screen } from '@testing-library/react';

import { render } from '../../../../../tests/utils/rendering';
import { Sidebar } from '../sidebar.component';
import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { LayoutContext } from '../../layout.context';
import { getRelayEnv as getBaseRelayEnv } from '../../../../../tests/utils/relay';

const getRelayEnv = (role: Role = Role.USER) =>
  getBaseRelayEnv(
    currentUserFactory({
      roles: [role],
    })
  );

describe('Sidebar: Component', () => {
  const Component = () => (
    <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Sidebar />
    </LayoutContext.Provider>
  );
  describe('user is logged out', () => {
    it('should not show link to dashboard', () => {
      render(<Component />);
      expect(screen.queryByText(/dashboard/gi)).not.toBeInTheDocument();
    });

    it('should show link to privacy policy', () => {
      render(<Component />);
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    });

    it('should not show link to admin page', () => {
      render(<Component />);
      expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
    });
  });

  describe('user is logged in', () => {
    describe('with user role', () => {
      it('should show link to dashboard', () => {
        const relayEnvironment = getRelayEnv();
        render(<Component />, { relayEnvironment });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', () => {
        const relayEnvironment = getRelayEnv();
        render(<Component />, { relayEnvironment });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show link to admin page', () => {
        const relayEnvironment = getRelayEnv();
        render(<Component />, { relayEnvironment });
        expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
      });
    });

    describe('with admin role', () => {
      it('should show link to dashboard', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render(<Component />, { relayEnvironment });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render(<Component />, { relayEnvironment });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should show link to admin page', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render(<Component />, { relayEnvironment });
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });
});
