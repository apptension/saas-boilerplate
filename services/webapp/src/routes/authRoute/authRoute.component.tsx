import React, { ComponentProps, useEffect } from 'react';

import { Route, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProfileStartup } from '../useStartup';
import { selectIsProfileStartupCompleted } from '../../modules/startup/startup.selectors';
import { Role } from '../../modules/auth/auth.types';
import { useRoleAccessCheck } from '../../shared/hooks/useRoleAccessCheck';
import { useLocaleUrl } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../app.constants';
import { renderWhenTrue } from '../../shared/utils/rendering';

export interface AuthRouteProps {
  allowedRoles?: Role | Role[];
}

export const AuthRoute = ({
  children,
  allowedRoles = [Role.ADMIN, Role.USER],
  ...props
}: ComponentProps<typeof Route> & AuthRouteProps) => {
  const history = useHistory();
  useProfileStartup();
  const isProfileStartupCompleted = useSelector(selectIsProfileStartupCompleted);
  const { isAllowed } = useRoleAccessCheck(allowedRoles);
  const fallbackUrl = useLocaleUrl(ROUTES.notFound);

  useEffect(() => {
    if (isProfileStartupCompleted && !isAllowed) {
      history.push(fallbackUrl);
    }
  }, [isProfileStartupCompleted, isAllowed, history, fallbackUrl]);

  const renderRoute = () => <Route {...props}>{children}</Route>;
  return renderWhenTrue(renderRoute)(isProfileStartupCompleted && isAllowed);
};
