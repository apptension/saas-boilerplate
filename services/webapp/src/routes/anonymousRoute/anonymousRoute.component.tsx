import React, { ComponentProps, useLayoutEffect } from 'react';

import { Route, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocaleUrl } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../app.constants';
import { selectIsLoggedIn } from '../../modules/auth/auth.selectors';
import { selectIsProfileStartupCompleted } from '../../modules/startup/startup.selectors';

export const AnonymousRoute = ({ children, ...props }: ComponentProps<typeof Route>) => {
  const history = useHistory();
  const fallbackUrl = useLocaleUrl(ROUTES.home);
  const isProfileStartupCompleted = useSelector(selectIsProfileStartupCompleted);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useLayoutEffect(() => {
    if (isLoggedIn) {
      history.push(fallbackUrl);
    }
  }, [isLoggedIn, history, fallbackUrl]);

  return isLoggedIn || !isProfileStartupCompleted ? null : <Route {...props}>{children}</Route>;
};
