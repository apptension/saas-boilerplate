import { useCallback } from 'react';
import { snackbarActions } from '../../../modules/snackbar';
import { useAsyncDispatch } from '../../utils/reduxSagaPromise';

export const useSnackbar = () => {
  const dispatch = useAsyncDispatch();

  const showMessage = useCallback(
    async (message: string | null) => {
      await dispatch(snackbarActions.showMessage(message));
    },
    [dispatch]
  );

  return { showMessage };
};
