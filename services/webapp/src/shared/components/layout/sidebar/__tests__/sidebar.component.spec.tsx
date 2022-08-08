import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { Sidebar } from '../sidebar.component';
import { prepareState } from '../../../../../mocks/store';
import { loggedOutAuthFactory, userProfileFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { LayoutContext } from '../../layout.context';

describe('Sidebar: Component', () => {
  const component = () => (
    <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Sidebar />
    </LayoutContext.Provider>
  );
  const render = makeContextRenderer(component);

  describe('user is logged out', () => {
    const store = prepareState((state) => {
      state.auth = loggedOutAuthFactory();
    });

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
      const store = prepareState((state) => {
        state.auth.profile = userProfileFactory({ roles: [Role.USER] });
      });

      it('should show link to dashboard', () => {
        render({}, { store });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
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

    describe('with admin role', () => {
      const store = prepareState((state) => {
        state.auth.profile = userProfileFactory({ roles: [Role.ADMIN] });
      });

      it('should show link to dashboard', () => {
        render({}, { store });
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      it('should show link to privacy policy', () => {
        render({}, { store });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should show link to admin page', () => {
        render({}, { store });
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });
});
