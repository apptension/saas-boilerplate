import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { snackbarActions } from '../../../modules/snackbar';

export const useSnackbar = () => {
  const dispatch = useDispatch();

  const showMessage = useCallback(
    (message: string | null) => {
      dispatch(snackbarActions.showMessage(message));
    },
    [dispatch]
  );

  return { showMessage };
};
