import { expectSaga } from 'redux-saga-test-plan';
import { identity } from 'ramda';
import { watchAuth } from '../auth.sagas';
import { browserHistory } from '../../../shared/utils/history';
import { prepareState } from '../../../mocks/store';
import { OAuthProvider } from '../auth.types';
import { authActions } from '..';
import { apiURL } from '../../../shared/services/api/helpers';

jest.mock('../../../shared/utils/history');

describe('Auth: sagas', () => {
  const defaultState = prepareState(identity);
  const mockHistoryPush = browserHistory.push as jest.Mock;

  const originalLocation = window.location;
  const locationAssignSpy = jest.fn();

  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    window.location = {
      ...originalLocation,
      assign: locationAssignSpy,
    };
  });

  afterAll(() => (window.location = originalLocation));

  beforeEach(() => {
    mockHistoryPush.mockReset();
    locationAssignSpy.mockReset();
  });

  describe('oAuthLogin', () => {
    describe('for google provider', () => {
      it('should redirect to google OAuth url', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .dispatch(authActions.oAuthLogin(OAuthProvider.Google))
          .silentRun();
        const encodedNextUrl = encodeURIComponent('http://localhost');
        expect(locationAssignSpy).toHaveBeenCalledWith(
          apiURL(`/auth/social/login/google-oauth2?next=${encodedNextUrl}`)
        );
      });
    });

    describe('for facebook provider', () => {
      it('should redirect to facebook OAuth url', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .dispatch(authActions.oAuthLogin(OAuthProvider.Facebook))
          .silentRun();
        const encodedNextUrl = encodeURIComponent('http://localhost');
        expect(locationAssignSpy).toHaveBeenCalledWith(apiURL(`/auth/social/login/facebook?next=${encodedNextUrl}`));
      });
    });
  });
});
