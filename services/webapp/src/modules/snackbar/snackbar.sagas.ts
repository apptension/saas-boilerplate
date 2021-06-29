import { all, takeEvery, delay, select, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { reportError } from '../../shared/utils/reportError';
import * as snackbarActions from './snackbar.actions';
import { selectLastSnackbarMessageId } from './snackbar.selectors';

const MESSAGE_ONSCREEN_TIME = 5000;

function* showMessage({ payload }: PayloadAction<string | null>) {
  try {
    const lastMessageId: number = yield select(selectLastSnackbarMessageId);
    const newMessageId = lastMessageId + 1;

    yield put(snackbarActions.showMessage.resolved({ text: payload, id: newMessageId }));
    yield delay(MESSAGE_ONSCREEN_TIME);
    yield put(snackbarActions.hideMessage(newMessageId));
  } catch (error) {
    yield put(snackbarActions.showMessage.rejected(error));
    reportError(error);
  }
}

export function* watchSnackbar() {
  yield all([takeEvery(snackbarActions.showMessage, showMessage)]);
}
