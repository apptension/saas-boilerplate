import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../../utils/testUtils';
import { Header } from '../header.component';
import { prepareState } from '../../../../../mocks/store';
import { loggedInAuthFactory, userProfileFactory } from '../../../../../mocks/factories';
import { logout } from '../../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('Header: Component', () => {
  const component = () => <Header />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('user is logged in', () => {
    const store = prepareState((state) => {
      state.auth = loggedInAuthFactory({ profile: userProfileFactory({ email: 'user@mail.com' }) });
    });

    it('should open homepage when clicked on "home" link', async () => {
      const { pushSpy, history } = spiedHistory();
      render({}, { store, router: { history } });

      userEvent.click(screen.getByLabelText(/home/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/');
    });

    it('should not display "profile" link', () => {
      render();
      expect(screen.queryByText(/profile/gi)).not.toBeInTheDocument();
    });

    it('should not display "logout" link', () => {
      render();
      expect(screen.queryByText(/log out/gi)).not.toBeInTheDocument();
    });

    it('should open profile when clicked on "profile" link', async () => {
      const { pushSpy, history } = spiedHistory();
      render({}, { store, router: { history } });

      userEvent.click(screen.getByLabelText(/open profile menu/gi));
      userEvent.click(screen.getByText(/profile/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/profile');
    });

    it('should dispatch logout action when clicking on "logout" button', () => {
      render({}, { store });
      userEvent.click(screen.getByLabelText(/open profile menu/gi));
      userEvent.click(screen.getByText(/log out/gi));
      expect(mockDispatch).toHaveBeenCalledWith(logout());
    });
  });

  describe('user is logged out', () => {
    it('should not display "home" link', async () => {
      render();
      expect(screen.queryByText(/home/gi)).not.toBeInTheDocument();
    });

    it('should not display avatar', () => {
      render();
      expect(screen.queryByLabelText(/open profile menu/gi)).not.toBeInTheDocument();
    });
  });
});
