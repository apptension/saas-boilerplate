import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { SignupButtonsVariant, SocialLoginButtons, SocialLoginButtonsProps } from '../socialLoginButtons.component';
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
  const defaultProps: SocialLoginButtonsProps = {
    variant: SignupButtonsVariant.SIGNUP,
  };

  const component = (props: Partial<SocialLoginButtonsProps>) => <SocialLoginButtons {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('log in variant', () => {
    describe('Google log in button is clicked', () => {
      it('should trigger google oauth flow', () => {
        render({ variant: SignupButtonsVariant.LOGIN });
        userEvent.click(screen.getByText(/log in with Google/gi));
        expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Google));
      });
    });

    describe('Facebook log in button is clicked', () => {
      it('should trigger facebook oauth flow', () => {
        render({ variant: SignupButtonsVariant.LOGIN });
        userEvent.click(screen.getByText(/log in with Facebook/gi));
        expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Facebook));
      });
    });
  });

  describe('sign up variant', () => {
    describe('Google sign up button is clicked', () => {
      it('should trigger google oauth flow', () => {
        render({ variant: SignupButtonsVariant.SIGNUP });
        userEvent.click(screen.getByText(/sign up with Google/gi));
        expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Google));
      });
    });

    describe('Facebook sign up button is clicked', () => {
      it('should trigger facebook oauth flow', () => {
        render({ variant: SignupButtonsVariant.SIGNUP });
        userEvent.click(screen.getByText(/sign up with Facebook/gi));
        expect(mockDispatch).toHaveBeenCalledWith(oAuthLogin(OAuthProvider.Facebook));
      });
    });
  });
});
