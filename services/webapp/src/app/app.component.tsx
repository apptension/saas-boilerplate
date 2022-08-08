import { FormattedMessage, IntlProvider } from 'react-intl';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import { path } from '../shared/utils/path';
import { PasswordReset } from '../routes/auth/passwordReset';
import { Role } from '../modules/auth/auth.types';
import { H1 } from '../theme/typography';
import { AuthRoute } from '../shared/components/routes/authRoute';
import { AnonymousRoute } from '../shared/components/routes/anonymousRoute';
import { contentfulRelayEnvironment } from '../shared/services/contentful/relayEnvironment';
import { ROUTES } from './config/routes';
import { DEFAULT_LOCALE, translationMessages } from './config/i18n';
import {
  CancelSubscription,
  ConfirmEmail,
  CrudDemoItem,
  DemoItem,
  DemoItems,
  Documents,
  EditPaymentMethod,
  EditSubscription,
  FinancesPaymentConfirm,
  Home,
  Login,
  NotFound,
  PrivacyPolicy,
  Profile,
  Signup,
  Subscriptions,
  TermsAndConditions,
  TransactionHistory,
} from './asyncComponents';
import { ValidRoutesProviders } from './providers/validRoutesProvider';

export const App = () => {
  const { pathname, search } = useLocation();

  return (
    <Switch>
      <Route path={path('')}>
        <ValidRoutesProviders>
          <Switch>
            <AuthRoute exact path={ROUTES.home}>
              <Home />
            </AuthRoute>
            <AuthRoute exact path={ROUTES.profile}>
              <Profile />
            </AuthRoute>
            <AuthRoute exact path={ROUTES.demoItems}>
              <RelayEnvironmentProvider environment={contentfulRelayEnvironment}>
                <DemoItems />
              </RelayEnvironmentProvider>
            </AuthRoute>
            <AuthRoute exact path={ROUTES.demoItem}>
              <RelayEnvironmentProvider environment={contentfulRelayEnvironment}>
                <DemoItem />
              </RelayEnvironmentProvider>
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
                <FormattedMessage defaultMessage="This page is only visible for admins" description="Admin / Heading" />
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
        </ValidRoutesProviders>
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
  );
};
