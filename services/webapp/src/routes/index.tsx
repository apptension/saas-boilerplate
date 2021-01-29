import React, { ComponentProps } from 'react';
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import { HelmetProvider } from 'react-helmet-async';
import { DEFAULT_LOCALE, appLocales, translationMessages } from '../i18n';
import { asyncComponent } from '../shared/utils/asyncComponent';
import { AppComponent as App } from './app.component';
import { ROUTES } from './app.constants';
import { useProfileStartup } from './useStartup';
//<-- IMPORT ROUTE -->

const Home = asyncComponent(() => import('./home'), 'Home');
const NotFound = asyncComponent(() => import('./notFound'), 'NotFound');
const Signup = asyncComponent(() => import('./auth/signup'), 'Signup');
const Login = asyncComponent(() => import('./auth/login'), 'Login');
const Profile = asyncComponent(() => import('./profile'), 'Profile');
const ConfirmEmail = asyncComponent(() => import('./auth/confirmEmail'), 'ConfirmEmail');

const AuthRoute = ({ children, ...props }: ComponentProps<typeof Route>) => {
  useProfileStartup();
  return <Route {...props}>{children}</Route>;
};

const MatchedLanguageComponent = () => {
  const match = useRouteMatch();
  return (
    <App>
      <Switch>
        <AuthRoute exact path={`${match.path}${ROUTES.home}`}>
          <Home />
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.profile}`}>
          <Profile />
        </AuthRoute>
        <Route exact path={`${match.path}${ROUTES.signup}`}>
          <Signup />
        </Route>
        <Route exact path={`${match.path}${ROUTES.login}`}>
          <Login />
        </Route>
        <Route exact path={`${match.path}${ROUTES.confirmEmail}`}>
          <ConfirmEmail />
        </Route>
        <Route exact path={`${match.path}${ROUTES.confirmEmailClear}`}>
          <ConfirmEmail />
        </Route>
        {/* <-- INJECT ROUTE --> */}

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </App>
  );
};

export default () => {
  return (
    <HelmetProvider>
      <Switch>
        <Route exact path="/">
          <Redirect to={DEFAULT_LOCALE} />
        </Route>

        <Route path={`/:lang(${appLocales.join('|')})`}>
          <MatchedLanguageComponent />
        </Route>

        <IntlProvider key={DEFAULT_LOCALE} locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
          <Route>
            <NotFound />
          </Route>
        </IntlProvider>
      </Switch>
    </HelmetProvider>
  );
};
