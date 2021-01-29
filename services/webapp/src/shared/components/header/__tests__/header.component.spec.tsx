import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../utils/testUtils';
import { Header } from '../header.component';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory, userProfileFactory } from '../../../../mocks/factories';

describe('Header: Component', () => {
  const component = () => <Header />;
  const render = makeContextRenderer(component);

  describe('user is logged in', () => {
    const store = prepareState((state) => {
      state.auth = loggedInAuthFactory({ profile: userProfileFactory({ email: 'user@mail.com' }) });
    });

    it('should open profile when clicked on "profile" link', async () => {
      const { pushSpy, history } = spiedHistory();
      render({}, { store, router: { history } });

      userEvent.click(screen.getByText(/my profile \(user@mail\.com\)/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/profile');
    });
  });

  describe('user is logged out', () => {
    it('should not display "profile" link', () => {
      render();
      expect(screen.queryByText(/my profile \(user@mail\.com\)/gi)).not.toBeInTheDocument();
    });
  });
});
