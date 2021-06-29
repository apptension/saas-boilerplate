import { screen } from '@testing-library/react';
import { AnonymousRoute } from '../anonymousRoute.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory } from '../../../mocks/factories';

const mockDispatch = jest.fn();
jest.mock('../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  ...jest.requireActual<NodeModule>('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('AnonymousRoute: Component', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const component = () => (
    <AnonymousRoute>
      <span data-testid="content" />
    </AnonymousRoute>
  );
  const render = makeContextRenderer(component);

  describe('user is logged out', () => {
    it('should render content', () => {
      const store = prepareState((state) => {
        state.startup.profileStartupCompleted = true;
        state.auth = loggedOutAuthFactory();
      });
      const { pushSpy, history } = spiedHistory();
      render({}, { store, router: { history } });
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(pushSpy).not.toHaveBeenCalledWith('/en/home');
    });
  });

  describe('user is logged in', () => {
    it('should redirect to homepage', () => {
      const store = prepareState((state) => {
        state.startup.profileStartupCompleted = true;
        state.auth = loggedInAuthFactory();
      });
      const { pushSpy, history } = spiedHistory();
      render({}, { store, router: { history } });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(pushSpy).toHaveBeenCalledWith('/en/');
    });
  });
});
