import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { Login } from '../login.component';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { oAuthLogin } from '../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('Login: Component', () => {
  const component = () => <Login />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('Google login button is clicked', () => {
    it('should trigger google oauth flow', () => {
      render();
      userEvent.click(screen.getByText(/google/gi));
      expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Google));
    });
  });

  describe('Facebook login button is clicked', () => {
    it('should trigger facebook oauth flow', () => {
      render();
      userEvent.click(screen.getByText(/facebook/gi));
      expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Facebook));
    });
  });
});
