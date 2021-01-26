import { all, takeLatest } from 'redux-saga/effects';

import { reportError } from '../../shared/utils/reportError';
import { users } from '../../shared/services/api';
import { PromiseAction, rejectPromiseAction, resolvePromiseAction } from '../../shared/utils/reduxSagaPromise';
import * as actions from './users.actions';
import { User } from './users.types';

function* fetchUsers(action: PromiseAction<void, User[]>) {
  try {
    const data = yield users.list();
    yield resolvePromiseAction(action, data);
  } catch (error) {
    reportError(error);
    yield rejectPromiseAction(action, error);
  }
}

export function* watchUsers() {
  yield all([takeLatest(actions.fetchUsers, fetchUsers)]);
}
