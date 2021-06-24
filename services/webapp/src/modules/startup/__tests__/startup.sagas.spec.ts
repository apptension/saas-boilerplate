import { expectSaga } from 'redux-saga-test-plan';
import { identity } from 'ramda';
import { watchStartup } from '../startup.sagas';
import { startupActions } from '..';
import { authActions } from '../../auth';
import { prepareState } from '../../../mocks/store';
import { userProfileFactory } from '../../../mocks/factories';

describe('Startup: sagas', () => {
  const defaultState = prepareState(identity);

  describe('startupProfile', () => {
    describe('profile startup was not completed', () => {
      it('should fetch user profile', async () => {
        await expectSaga(watchStartup)
          .withState(defaultState)
          .dispatch(startupActions.startup())
          .put(authActions.fetchProfile())
          .not.put(startupActions.completeProfileStartup())
          .silentRun();
      });

      it('should complete profile startup after fetching is done', async () => {
        await expectSaga(watchStartup)
          .withState(defaultState)
          .dispatch(startupActions.startup())
          .dispatch(authActions.fetchProfile.resolved(userProfileFactory()))
          .put(startupActions.completeProfileStartup())
          .silentRun();
      });
    });

    describe('profile startup was already completed', () => {
      it('should not fetch user profile', async () => {
        const state = prepareState((state) => {
          state.startup.profileStartupCompleted = true;
        });

        await expectSaga(watchStartup)
          .withState(state)
          .dispatch(startupActions.startup())
          .not.put(authActions.fetchProfile())
          .silentRun();
      });
    });
  });
});
