import React from 'react';
import { Route, Switch, Redirect, useRouteMatch, useLocation } from 'react-router-dom';
import { FormattedMessage, IntlProvider } from 'react-intl';

import { HelmetProvider } from 'react-helmet-async';
import { appLocales, DEFAULT_LOCALE, translationMessages } from '../i18n';
import { asyncComponent } from '../shared/utils/asyncComponent';
import { H1 } from '../theme/typography';
import { Role } from '../modules/auth/auth.types';
import { AppComponent as App } from './app.component';
import { ROUTES } from './app.constants';
import { PasswordReset } from './auth/passwordReset';
import { AuthRoute } from './authRoute';

const Home = asyncComponent(() => import('./home'), 'Home');
const NotFound = asyncComponent(() => import('./notFound'), 'NotFound');
const Signup = asyncComponent(() => import('./auth/signup'), 'Signup');
const Login = asyncComponent(() => import('./auth/login'), 'Login');
const Profile = asyncComponent(() => import('./profile'), 'Profile');
const ConfirmEmail = asyncComponent(() => import('./auth/confirmEmail'), 'ConfirmEmail');
const PrivacyPolicy = asyncComponent(() => import('./privacyPolicy'), 'PrivacyPolicy');
const TermsAndConditions = asyncComponent(() => import('./termsAndConditions'), 'TermsAndConditions');
const DemoItems = asyncComponent(() => import('./demoItems'), 'DemoItems');
const DemoItem = asyncComponent(() => import('./demoItem'), 'DemoItem');
const CrudDemoItemList = asyncComponent(() => import('./crudDemoItem/crudDemoItemList'), 'CrudDemoItemList');
const CrudDemoItemDetails = asyncComponent(() => import('./crudDemoItem/crudDemoItemDetails'), 'CrudDemoItemDetails');
const AddCrudDemoItem = asyncComponent(() => import('./crudDemoItem/addCrudDemoItem'), 'AddCrudDemoItem');
const EditCrudDemoItem = asyncComponent(() => import('./crudDemoItem/editCrudDemoItem'), 'EditCrudDemoItem');
//<-- IMPORT ROUTE -->

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
        <AuthRoute exact path={`${match.path}${ROUTES.demoItems}`}>
          <DemoItems />
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.demoItem}`}>
          <DemoItem />
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
        <Route exact path={`${match.path}${ROUTES.privacyPolicy}`}>
          <PrivacyPolicy />
        </Route>
        <Route exact path={`${match.path}${ROUTES.termsAndConditions}`}>
          <TermsAndConditions />
        </Route>
        <Route path={`${match.path}${ROUTES.passwordReset.index}`}>
          <PasswordReset />
        </Route>
        <AuthRoute path={`${match.path}${ROUTES.admin}`} allowedRoles={Role.ADMIN}>
          <H1>
            <FormattedMessage defaultMessage="This page is only visible for admins" description="Admin / Heading" />
          </H1>
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.crudDemoItem.list}`}>
          <CrudDemoItemList />
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.crudDemoItem.add}`}>
          <AddCrudDemoItem />
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.crudDemoItem.details}`}>
          <CrudDemoItemDetails />
        </AuthRoute>
        <AuthRoute exact path={`${match.path}${ROUTES.crudDemoItem.edit}`}>
          <EditCrudDemoItem />
        </AuthRoute>
        {/* <-- INJECT ROUTE --> */}

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </App>
  );
};

export default () => {
  const { pathname, search } = useLocation();

  return (
    <HelmetProvider>
      <Switch>
        <Route path={`/:lang(${appLocales.join('|')})`}>
          <MatchedLanguageComponent />
        </Route>

        <Route path="/">
          <Redirect to={`/${DEFAULT_LOCALE}${pathname}${search}`} />
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
