import { DemoItem, DemoItems, PrivacyPolicy, TermsAndConditions } from '@sb/webapp-contentful/routes';
import { DEFAULT_LOCALE, translationMessages } from '@sb/webapp-core/config/i18n';
import { typography } from '@sb/webapp-core/theme';
import { CrudDemoItem } from '@sb/webapp-crud-demo/routes';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Role } from '../modules/auth/auth.types';
import { PasswordReset } from '../routes/auth/passwordReset';
import ValidateOtp from '../routes/auth/validateOtp';
import { ActiveSubscriptionContext } from '../routes/finances/activeSubscriptionContext/activeSubscriptionContext.component';
import { AnonymousRoute } from '../shared/components/routes/anonymousRoute';
import { AuthRoute } from '../shared/components/routes/authRoute';
import {
  CancelSubscription,
  ConfirmEmail,
  Documents,
  EditPaymentMethod,
  EditSubscription,
  FinancesPaymentConfirm,
  Home,
  Login,
  Logout,
  NotFound,
  Profile,
  Signup,
  Subscriptions,
  TransactionHistory, //<-- IMPORT ROUTE COMPONENT -->
} from './asyncComponents';
import { LANG_PREFIX, RoutesConfig } from './config/routes';
import { ValidRoutesProviders } from './providers';

export const App = () => {
  const { pathname, search } = useLocation();

  return (
    <Routes>
      <Route element={<ValidRoutesProviders />}>
        <Route path={LANG_PREFIX}>
          <Route path={RoutesConfig.logout} element={<Logout />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AnonymousRoute />}>
          <Route path={RoutesConfig.signup} element={<Signup />} />
          <Route path={RoutesConfig.login} element={<Login />} />
          <Route path={RoutesConfig.validateOtp} element={<ValidateOtp />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute />}>
          <Route index element={<Home />} />
          <Route path={RoutesConfig.profile} element={<Profile />} />
          <Route path={RoutesConfig.demoItems} element={<DemoItems />} />
          <Route path={RoutesConfig.demoItem} element={<DemoItem routesConfig={RoutesConfig} />} />
          <Route path={RoutesConfig.crudDemoItem.index} element={<CrudDemoItem routesConfig={RoutesConfig} />} />
          <Route element={<ActiveSubscriptionContext />}>
            <Route path={RoutesConfig.subscriptions.index} element={<Subscriptions />} />
            <Route path={RoutesConfig.subscriptions.changePlan} element={<EditSubscription />} />
            <Route path={RoutesConfig.subscriptions.paymentMethod} element={<EditPaymentMethod />} />
            <Route path={RoutesConfig.subscriptions.cancel} element={<CancelSubscription />} />
          </Route>
          <Route path={RoutesConfig.finances.paymentConfirm} element={<FinancesPaymentConfirm />} />
          <Route path={RoutesConfig.finances.history} element={<TransactionHistory />} />
          <Route path={RoutesConfig.documents} element={<Documents />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute allowedRoles={Role.ADMIN} />}>
          <Route
            path={RoutesConfig.admin}
            element={
              <typography.H1>
                <FormattedMessage defaultMessage="This page is only visible for admins" id="Admin / Heading" />
              </typography.H1>
            }
          />
        </Route>

        <Route path={LANG_PREFIX}>
          <Route path={RoutesConfig.confirmEmail} element={<ConfirmEmail />} />
          <Route path={RoutesConfig.privacyPolicy} element={<PrivacyPolicy />} />
          <Route path={RoutesConfig.termsAndConditions} element={<TermsAndConditions />} />
          <Route path={RoutesConfig.passwordReset.index} element={<PasswordReset />} />
        </Route>

        {/* <-- INJECT ROUTE --> */}

        <Route
          path="*"
          element={
            <IntlProvider key={DEFAULT_LOCALE} locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
              <NotFound />
            </IntlProvider>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}${pathname}${search}`} />} />
    </Routes>
  );
};

export default App;
