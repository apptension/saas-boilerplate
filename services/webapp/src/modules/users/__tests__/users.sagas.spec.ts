import { expectSaga } from 'redux-saga-test-plan';

import { times } from 'ramda';
import { watchUsers } from '../users.sagas';
import { usersActions } from '..';
import { userFactory } from '../../../mocks/factories';
import { mockGetUsers } from '../../../mocks/server/handlers';
import { server } from '../../../mocks/server';

const usersMock = times(() => userFactory(), 10);

describe('Users: sagas', () => {
  const defaultState = {};

  it('should fetch users', async () => {
    server.use(mockGetUsers(usersMock));

    await expectSaga(watchUsers)
      .withState(defaultState)
      .put(usersActions.fetchUsers.resolved(usersMock))
      .dispatch(usersActions.fetchUsers())
      .silentRun();
  });
});
