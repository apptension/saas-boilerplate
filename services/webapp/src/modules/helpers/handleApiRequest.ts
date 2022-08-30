import { StatusCodes } from 'http-status-codes';
import { put } from 'redux-saga/effects';
import { PromiseAction, rejectPromiseAction, resolvePromiseAction } from '../../shared/utils/reduxSagaPromise';
import { snackbarActions } from '../snackbar';
import { RoutesConfig } from '../../app/config/routes';
import { reportError } from '../../shared/utils/reportError';
import { navigate } from './navigate';

export function handleApiRequest<Request, Response>(
  apiCall: (payload: Request) => Promise<Response>,
  {
    onResolve,
    onReject,
    redirectToLoginOnFail,
  }: {
    onResolve?: (response: Response) => Generator;
    onReject?: (error: any) => Generator;
    redirectToLoginOnFail?: boolean;
  } = { redirectToLoginOnFail: true }
) {
  return function* (action: PromiseAction<Request, Response, unknown>) {
    try {
      const res: Response = yield apiCall(action.payload);
      yield resolvePromiseAction<Request, Response, unknown>(action, res);
      yield onResolve?.(res);
    } catch (error) {
      yield rejectPromiseAction<Request, Response, unknown>(action, error);
      yield onReject?.(error);

      // @ts-ignore
      if (error.response?.status !== StatusCodes.BAD_REQUEST) {
        yield put(snackbarActions.showMessage(null));
        reportError(error);
      } else if (redirectToLoginOnFail) {
        yield navigate(RoutesConfig.login);
      }
    }
  };
}
