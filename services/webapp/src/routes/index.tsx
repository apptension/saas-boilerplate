import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { HelmetProvider } from 'react-helmet-async';
import { ApolloProvider } from '@apollo/client';
import { DEFAULT_LOCALE, translationMessages } from '../i18n';
import { H1 } from '../theme/typography';
import { Role } from '../modules/auth/auth.types';
import { apolloClient as contentfulApolloClient } from '../shared/services/contentful';
import { path } from '../shared/utils/path';
import { AppComponent as App } from './app.component';
import { ROUTES } from './app.constants';
import { PasswordReset } from './auth/passwordReset';
import { AuthRoute } from './authRoute';
import { AnonymousRoute } from './anonymousRoute';
import {
  Home,
  NotFound,
  Signup,
  Login,
  Profile,
  ConfirmEmail,
  PrivacyPolicy,
  TermsAndConditions,
  DemoItems,
  DemoItem,
  CrudDemoItem,
  FinancesPaymentConfirm,
  Subscriptions,
  EditSubscription,
  EditPaymentMethod,
  CancelSubscription,
  TransactionHistory,
  Documents,
} from './asyncComponents';

export default () => {
  const { pathname, search } = useLocation();

  return (
    <HelmetProvider>
      <Switch>
        <Route path={path('')}>
          <App>
            <Switch>
              <AuthRoute exact path={ROUTES.home}>
                <Home />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.profile}>
                <Profile />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.demoItems}>
                <ApolloProvider client={contentfulApolloClient}>
                  <DemoItems />
                </ApolloProvider>
              </AuthRoute>
              <AuthRoute exact path={ROUTES.demoItem}>
                <ApolloProvider client={contentfulApolloClient}>
                  <DemoItem />
                </ApolloProvider>
              </AuthRoute>
              <AnonymousRoute exact path={ROUTES.signup}>
                <Signup />
              </AnonymousRoute>
              <AnonymousRoute exact path={ROUTES.login}>
                <Login />
              </AnonymousRoute>
              <Route exact path={ROUTES.confirmEmail}>
                <ConfirmEmail />
              </Route>
              <Route exact path={ROUTES.privacyPolicy}>
                <PrivacyPolicy />
              </Route>
              <Route exact path={ROUTES.termsAndConditions}>
                <TermsAndConditions />
              </Route>
              <Route path={ROUTES.passwordReset.index}>
                <PasswordReset />
              </Route>
              <AuthRoute path={ROUTES.admin} allowedRoles={Role.ADMIN}>
                <H1>
                  <FormattedMessage
                    defaultMessage="This page is only visible for admins"
                    description="Admin / Heading"
                  />
                </H1>
              </AuthRoute>

              <AuthRoute path={ROUTES.crudDemoItem.index}>
                <CrudDemoItem />
              </AuthRoute>

              <AuthRoute exact path={ROUTES.finances.paymentConfirm}>
                <FinancesPaymentConfirm />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.subscriptions.index}>
                <Subscriptions />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.subscriptions.changePlan}>
                <EditSubscription />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.subscriptions.paymentMethod}>
                <EditPaymentMethod />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.subscriptions.cancel}>
                <CancelSubscription />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.finances.history}>
                <TransactionHistory />
              </AuthRoute>
              <AuthRoute exact path={ROUTES.documents}>
                <Documents />
              </AuthRoute>
              {/* <-- INJECT ROUTE --> */}

              <Route>
                <NotFound />
              </Route>
            </Switch>
          </App>
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
