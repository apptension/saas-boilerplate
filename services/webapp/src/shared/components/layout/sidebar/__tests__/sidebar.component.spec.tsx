import { screen } from '@testing-library/react';

import { makeContextRenderer } from '../../../../utils/testUtils';
import { Sidebar } from '../sidebar.component';
import { prepareState } from '../../../../../mocks/store';
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
  const component = () => (
    <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Sidebar />
    </LayoutContext.Provider>
  );
  const render = makeContextRenderer(component);

  describe('user is logged out', () => {
    const store = prepareState((state) => state);

    it('should not show link to dashboard', () => {
      render({}, { store });
      expect(screen.queryByText(/dashboard/gi)).not.toBeInTheDocument();
    });

    it('should show link to privacy policy', () => {
      render({}, { store });
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    });

    it('should not show link to admin page', () => {
      render({}, { store });
      expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
    });
  });

  describe('user is logged in', () => {
    describe('with user role', () => {
      it('should show link to dashboard', () => {
        const relayEnvironment = getRelayEnv();
        render({}, { relayEnvironment });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', () => {
        const relayEnvironment = getRelayEnv();
        render({}, { relayEnvironment });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show link to admin page', () => {
        const relayEnvironment = getRelayEnv();
        render({}, { relayEnvironment });
        expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
      });
    });

    describe('with admin role', () => {
      it('should show link to dashboard', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render({}, { relayEnvironment });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render({}, { relayEnvironment });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should show link to admin page', () => {
        const relayEnvironment = getRelayEnv(Role.ADMIN);
        render({}, { relayEnvironment });
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });
});
