import { Route, Switch, useRouteMatch } from 'react-router-dom';
import React from 'react';
import { ROUTES } from '../../app.constants';
import { asyncComponent } from '../../../shared/utils/asyncComponent';

// @ts-ignore
const PasswordResetRequest = asyncComponent(() => import('./passwordResetRequest'), 'PasswordResetRequest');
// @ts-ignore
const PasswordResetConfirm = asyncComponent(() => import('./passwordResetConfirm'), 'PasswordResetConfirm');

export const PasswordReset = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <PasswordResetRequest />
      </Route>
      <Route exact path={`${match.path}${ROUTES.passwordReset.getRelativeUrl('confirm')}`}>
        <PasswordResetConfirm />
      </Route>
    </Switch>
  );
};
