import { waitFor } from '@testing-library/react';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { ConfirmEmail } from '../confirmEmail.component';
import { ROUTES } from '../../../../app/config/routes';
import { confirmEmail } from '../../../../modules/auth/auth.actions';
import { snackbarActions } from '../../../../modules/snackbar';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory } from '../../../../mocks/factories';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const user = 'user_id';
const token = 'token';
const confirmTokenRoute = `/en/auth/confirm/${user}/${token}`;
const confirmTokenRouteNoToken = `/en/auth/confirm`;

const store = prepareState((state) => {
  state.auth = loggedOutAuthFactory();
  state.startup.profileStartupCompleted = true;
});

describe('ConfirmEmail: Component', () => {
  const component = () => <ConfirmEmail />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should call confirm token action', async () => {
    mockDispatch.mockResolvedValue({ isError: false });
    render({}, { store, router: { url: confirmTokenRoute, routePath: ROUTES.confirmEmail } });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(confirmEmail({ token, user }));
    });
  });

  it('should hide token and user from URL', async () => {
    mockDispatch.mockResolvedValue({
      isError: false,
    });
    const { pushSpy, history } = spiedHistory(confirmTokenRoute);
    render({}, { store, router: { history, routePath: ROUTES.confirmEmail } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
    });
  });

  describe('token is invalid', () => {
    it('should redirect to login show invalid token error', async () => {
      mockDispatch.mockResolvedValue({
        isError: true,
      });
      const { history, pushSpy } = spiedHistory(confirmTokenRoute);
      render({}, { store, router: { history, routePath: ROUTES.confirmEmail } });
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Invalid token.'));
        expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
      });
    });
  });

  describe('token is valid', () => {
    describe('user is logged out', () => {
      it('should redirect to login and show success message', async () => {
        mockDispatch.mockResolvedValue({ isError: false });
        const { history, pushSpy } = spiedHistory(confirmTokenRoute);
        render({}, { store, router: { history, routePath: ROUTES.confirmEmail } });
        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalledWith(
            snackbarActions.showMessage('Congratulations! Now you can log in.')
          );
          expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
        });
      });
    });

    describe('user is logged in', () => {
      const store = prepareState((state) => {
        state.auth = loggedInAuthFactory();
        state.startup.profileStartupCompleted = true;
      });

      it('should redirect to login and show success message', async () => {
        mockDispatch.mockResolvedValue({ isError: false });
        const { history, pushSpy } = spiedHistory(confirmTokenRoute);
        render({}, { store, router: { history, routePath: ROUTES.confirmEmail } });
        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalledWith(
            snackbarActions.showMessage('Congratulations! Your email has been confirmed.')
          );
          expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
        });
      });
    });
  });

  describe('token is missing from URL', () => {
    it('should redirect to login and show invalid token error', async () => {
      const { history, pushSpy } = spiedHistory(confirmTokenRouteNoToken);
      render({}, { store, router: { history, routePath: ROUTES.confirmEmail } });
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Invalid token.'));
        expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
      });
    });
  });
});
