import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { OAuthProvider } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { SignupButtonsVariant, SocialLoginButtons, SocialLoginButtonsProps } from '../socialLoginButtons.component';

const mockOAuthLogin = jest.fn();
jest.mock('@sb/webapp-api-client/api/auth', () => {
  return {
    ...jest.requireActual<NodeModule>('@sb/webapp-api-client/api/auth'),
    useOAuthLogin: () => mockOAuthLogin,
  };
});

describe('SocialLoginButtons: Component', () => {
  const defaultProps: SocialLoginButtonsProps = {
    variant: SignupButtonsVariant.SIGNUP,
  };

  const Component = (props: Partial<SocialLoginButtonsProps>) => <SocialLoginButtons {...defaultProps} {...props} />;

  describe('log in variant', () => {
    describe('Google log in button is clicked', () => {
      it('should trigger google oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.LOGIN} />);
        await userEvent.click(await screen.findByText(/Log in with Google/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Google);
      });
    });

    describe('Facebook log in button is clicked', () => {
      it('should trigger facebook oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.LOGIN} />);
        await userEvent.click(await screen.findByText(/Log in with Facebook/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Facebook);
      });
    });
  });

  describe('sign up variant', () => {
    describe('Google sign up button is clicked', () => {
      it('should trigger google oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.SIGNUP} />);
        await userEvent.click(await screen.findByText(/Sign up with Google/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Google);
      });
    });

    describe('Facebook sign up button is clicked', () => {
      it('should trigger facebook oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.SIGNUP} />);
        await userEvent.click(await screen.findByText(/Sign up with Facebook/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Facebook);
      });
    });
  });
});
