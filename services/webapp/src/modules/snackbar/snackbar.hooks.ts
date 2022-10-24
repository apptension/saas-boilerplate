import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectLastSnackbarMessageId } from './snackbar.selectors';
import * as snackbarActions from './snackbar.actions';
import { Message } from './snackbar.types';

const DEFAULT_MESSAGE_ONSCREEN_TIME = 5000;

export const useSnackbar = () => {
  const dispatch = useDispatch();
  const lastMessageId = useSelector(selectLastSnackbarMessageId);

  const showMessage = useCallback(
    (text: Message['text'], { hideDelay = DEFAULT_MESSAGE_ONSCREEN_TIME }: { hideDelay?: number } = {}) => {
      const newMessageId = lastMessageId + 1;
      dispatch(snackbarActions.showMessage({ text, id: newMessageId }));

      setTimeout(() => {
        dispatch(snackbarActions.hideMessage(newMessageId));
      }, hideDelay);
    },
    [lastMessageId, dispatch]
  );

  return { showMessage };
};
