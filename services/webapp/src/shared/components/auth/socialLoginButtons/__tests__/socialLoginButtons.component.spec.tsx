import React from 'react';

import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { SocialLoginButtons } from '../socialLoginButtons.component';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { oAuthLogin } from '../../../../../modules/auth/auth.actions';
import { OAuthProvider } from '../../../../../modules/auth/auth.types';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('SocialLoginButtons: Component', () => {
  const component = () => <SocialLoginButtons />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('Google login button is clicked', () => {
    it('should trigger google oauth flow', () => {
      render();
      userEvent.click(screen.getByText(/login with Google/gi));
      expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Google));
    });
  });

  describe('Facebook login button is clicked', () => {
    it('should trigger facebook oauth flow', () => {
      render();
      userEvent.click(screen.getByText(/login with Facebook/gi));
      expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Facebook));
    });
  });
});
