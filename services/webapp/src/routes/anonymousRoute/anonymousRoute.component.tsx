import { ComponentProps, useLayoutEffect } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGenerateLocalePath } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../app.constants';
import { selectIsLoggedIn } from '../../modules/auth/auth.selectors';
import { selectIsProfileStartupCompleted } from '../../modules/startup/startup.selectors';

export const AnonymousRoute = ({ children, ...props }: ComponentProps<typeof Route>) => {
  const history = useHistory();
  const generateLocalePath = useGenerateLocalePath();
  const isProfileStartupCompleted = useSelector(selectIsProfileStartupCompleted);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useLayoutEffect(() => {
    if (isLoggedIn) {
      history.push(generateLocalePath(ROUTES.home));
    }
  }, [isLoggedIn, history, generateLocalePath]);

  return isLoggedIn || !isProfileStartupCompleted ? null : <Route {...props}>{children}</Route>;
};
