import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { startupActions } from '../../modules/startup';
import initializeFontFace from '../../theme/initializeFontFace';

export const useStartup = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startupActions.startup());
    initializeFontFace();
  }, [dispatch]);
};
