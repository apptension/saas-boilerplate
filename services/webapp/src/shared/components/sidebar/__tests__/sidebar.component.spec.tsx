import React from 'react';
import { screen } from '@testing-library/dom';

import { makeContextRenderer } from '../../../utils/testUtils';
import { Sidebar } from '../sidebar.component';
import { prepareState } from '../../../../mocks/store';
import { userProfileFactory } from '../../../../mocks/factories';
import { Role } from '../../../../modules/auth/auth.types';
import { LayoutContext } from '../../../../routes/layout/layout.context';

describe('Sidebar: Component', () => {
  const component = () => (
    <LayoutContext.Provider value={{ isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Sidebar />
    </LayoutContext.Provider>
  );
  const render = makeContextRenderer(component);

  describe('user has admin role', () => {
    const store = prepareState((state) => {
      state.auth.profile = userProfileFactory({ roles: [Role.ADMIN] });
    });

    it('should show link to admin page', () => {
      render({}, { store });
      expect(screen.queryByText(/admin/gi)).toBeInTheDocument();
    });
  });

  describe('user doesnt have admin role', () => {
    const store = prepareState((state) => {
      state.auth.profile = userProfileFactory({ roles: [Role.USER] });
    });

    it('should not show link to admin page', () => {
      render({}, { store });
      expect(screen.queryByText(/admin/gi)).not.toBeInTheDocument();
    });
  });
});
