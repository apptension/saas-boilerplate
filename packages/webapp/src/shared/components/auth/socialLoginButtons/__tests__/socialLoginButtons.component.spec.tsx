import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { OAuthProvider } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { SignupButtonsVariant, SocialLoginButtons, SocialLoginButtonsProps } from '../socialLoginButtons.component';

const mockOAuthLogin = jest.fn();
jest.mock('../../../../../modules/auth/auth.hooks', () => {
  return {
    ...jest.requireActual<NodeModule>('../../../../../modules/auth/auth.hooks'),
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
        await userEvent.click(screen.getByText(/log in with Google/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Google);
      });
    });

    describe('Facebook log in button is clicked', () => {
      it('should trigger facebook oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.LOGIN} />);
        await userEvent.click(screen.getByText(/log in with Facebook/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Facebook);
      });
    });
  });

  describe('sign up variant', () => {
    describe('Google sign up button is clicked', () => {
      it('should trigger google oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.SIGNUP} />);
        await userEvent.click(screen.getByText(/sign up with Google/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Google);
      });
    });

    describe('Facebook sign up button is clicked', () => {
      it('should trigger facebook oauth flow', async () => {
        render(<Component variant={SignupButtonsVariant.SIGNUP} />);
        await userEvent.click(screen.getByText(/sign up with Facebook/i));
        expect(mockOAuthLogin).toHaveBeenCalledWith(OAuthProvider.Facebook);
      });
    });
  });
});
