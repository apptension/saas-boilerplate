import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';
import { Home } from '../home.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { Role } from '../../../modules/auth/auth.types';
import { userProfileFactory } from '../../../mocks/factories';

describe('Home: Component', () => {
  const component = () => <Home />;
  const render = makeContextRenderer(component);

  describe('user has admin role', () => {
    const store = prepareState((state) => {
      state.auth.profile = userProfileFactory({ roles: [Role.ADMIN] });
    });

    it('should show link to admin page', () => {
      const { history, pushSpy } = spiedHistory();
      render({}, { store, router: { history } });
      userEvent.click(screen.getByText(/admin/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/admin');
    });
  });

  describe('user doesnt have admin role', () => {
    const store = prepareState((state) => {
      state.auth.profile = userProfileFactory({ roles: [Role.USER] });
    });

    it('should not show link to admin page', () => {
      render({}, { store });
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });
});
