import { UNAUTHORIZED } from 'http-status-codes';
import { put } from 'redux-saga/effects';
import { PromiseAction, rejectPromiseAction, resolvePromiseAction } from '../../shared/utils/reduxSagaPromise';
import { snackbarActions } from '../snackbar';
import { ROUTES } from '../../routes/app.constants';
import { reportError } from '../../shared/utils/reportError';
import { navigate } from './navigate';

function* handleApiError(error: any) {
  if (error.response?.status === UNAUTHORIZED) {
    yield navigate(ROUTES.login);
  } else {
    yield put(snackbarActions.showMessage(null));
    reportError(error);
  }
}

export function handleApiRequest<Request, Response>(
  apiCall: (payload: Request) => Promise<Response>,
  resolveHandler?: (response: Response) => Generator,
  rejectHandler?: (error: any) => Generator
) {
  return function* (action: PromiseAction<Request, Response>) {
    try {
      const res: Response = yield apiCall(action.payload);
      yield resolvePromiseAction(action, res);
      yield resolveHandler?.(res);
    } catch (error) {
      yield handleApiError(error);
      yield rejectPromiseAction(action, error);
      yield rejectHandler?.(error);
    }
  };
}
