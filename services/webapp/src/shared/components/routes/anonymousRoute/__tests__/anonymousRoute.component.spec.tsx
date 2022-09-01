import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { RelayMockEnvironment } from 'relay-test-utils';
import { AnonymousRoute } from '../anonymousRoute.component';
import { makeContextRenderer, packHistoryArgs, spiedHistory } from '../../../../utils/testUtils';
import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';

const mockDispatch = jest.fn();
jest.mock('../../../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  ...jest.requireActual<NodeModule>('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('AnonymousRoute: Component', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const component = () => <AnonymousRoute />;
  const routerContext = {
    children: <Route path="*" element={<span data-testid="content" />} />,
    routePath: '*',
  };
  const render = makeContextRenderer(component, {
    router: routerContext,
  });

  describe('user is logged out', () => {
    it('should render content', () => {
      const { pushSpy, history } = spiedHistory();
      render({}, { router: { ...routerContext, history } });
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(pushSpy).not.toHaveBeenCalledWith(...packHistoryArgs('/en/home'));
    });
  });

  describe('user is logged in', () => {
    it('should redirect to homepage', () => {
      const relayEnvironment = (env: RelayMockEnvironment) => {
        fillCommonQueryWithUser(
          env,
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        );
      };
      const { pushSpy, history } = spiedHistory();
      render({}, { router: { history }, relayEnvironment });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/'));
    });
  });
});
