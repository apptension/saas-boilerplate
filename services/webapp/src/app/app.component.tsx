import { FormattedMessage, IntlProvider } from 'react-intl';
import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import { PasswordReset } from '../routes/auth/passwordReset';
import { Role } from '../modules/auth/auth.types';
import { H1 } from '../theme/typography';
import { AuthRoute } from '../shared/components/routes/authRoute';
import { AnonymousRoute } from '../shared/components/routes/anonymousRoute';
import { contentfulRelayEnvironment } from '../shared/services/contentful/relayEnvironment';
import { LANG_PREFIX, Routes } from './config/routes';
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
    <RouterRoutes>
      <Route element={<ValidRoutesProviders />}>
        <Route path={LANG_PREFIX} element={<AnonymousRoute />}>
          <Route path={Routes.signup} element={<Signup />} />
          <Route path={Routes.login} element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute />}>
          <Route index element={<Home />} />
          <Route path={Routes.profile} element={<Profile />} />
          <Route path={Routes.demoItems} element={
            <RelayEnvironmentProvider environment={contentfulRelayEnvironment}>
              <DemoItems />
            </RelayEnvironmentProvider>
          } />
          <Route path={Routes.demoItem} element={
            <RelayEnvironmentProvider environment={contentfulRelayEnvironment}>
              <DemoItem />
            </RelayEnvironmentProvider>
          } />
          <Route path={Routes.crudDemoItem.index} element={<CrudDemoItem />} />
          <Route path={Routes.subscriptions.index} element={<Subscriptions />} />
          <Route path={Routes.subscriptions.changePlan} element={<EditSubscription />} />
          <Route path={Routes.subscriptions.paymentMethod} element={<EditPaymentMethod />} />
          <Route path={Routes.subscriptions.cancel} element={<CancelSubscription />} />
          <Route path={Routes.finances.paymentConfirm} element={<FinancesPaymentConfirm />} />
          <Route path={Routes.finances.history} element={<TransactionHistory />} />
          <Route path={Routes.documents} element={<Documents />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute allowedRoles={Role.ADMIN} />}>
          <Route path={Routes.admin} element={
            <H1>
              <FormattedMessage defaultMessage="This page is only visible for admins" description="Admin / Heading" />
            </H1>
          } />
        </Route>

        <Route path={LANG_PREFIX}>
          <Route path={Routes.confirmEmail} element={<ConfirmEmail />} />
          <Route path={Routes.privacyPolicy} element={<PrivacyPolicy />} />
          <Route path={Routes.termsAndConditions} element={<TermsAndConditions />} />
          <Route path={Routes.passwordReset.index} element={<PasswordReset />} />
        </Route>

        {/* <-- INJECT ROUTE --> */}

        <Route path="*" element={
          <IntlProvider key={DEFAULT_LOCALE} locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
            <NotFound/>
          </IntlProvider>
        }/>
      </Route>

      <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}${pathname}${search}`}/>} />
    </RouterRoutes>
  );
};
