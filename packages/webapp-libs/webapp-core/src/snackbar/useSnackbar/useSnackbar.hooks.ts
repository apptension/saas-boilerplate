import { useCallback, useContext, useEffect, useRef } from 'react';

import { Message, SnackbarContext } from '../snackbarProvider';

const DEFAULT_MESSAGE_ONSCREEN_TIME = 5000;

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) throw new Error('SnackbarContext used outside of Provider');

  const { snackbar, dispatch } = context;

  const ref = useRef({
    lastMessageId: snackbar.lastMessageId,
  });

  useEffect(() => {
    ref.current.lastMessageId = snackbar.lastMessageId;
  }, [snackbar.lastMessageId]);

  const showMessage = useCallback(
    (text: Message['text'], { hideDelay = DEFAULT_MESSAGE_ONSCREEN_TIME }: { hideDelay?: number } = {}) => {
      const newMessageId = ++ref.current.lastMessageId;
      dispatch({ type: 'SHOW_MESSAGE', payload: { id: newMessageId, text } });

      setTimeout(() => {
        dispatch({ type: 'HIDE_MESSAGE', payload: newMessageId });
      }, hideDelay);
    },
    [dispatch]
  );

  const hideMessage = useCallback(
    (id: number) => {
      dispatch({ type: 'HIDE_MESSAGE', payload: id });
    },
    [dispatch]
  );

  return { snackbar, hideMessage, showMessage };
};
