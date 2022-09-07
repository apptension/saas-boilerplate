import { FormattedMessage, IntlProvider } from 'react-intl';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PasswordReset } from '../routes/auth/passwordReset';
import { Role } from '../modules/auth/auth.types';
import { H1 } from '../theme/typography';
import { AuthRoute } from '../shared/components/routes/authRoute';
import { AnonymousRoute } from '../shared/components/routes/anonymousRoute';
import { LANG_PREFIX, RoutesConfig } from './config/routes';
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
    <Routes>
      <Route element={<ValidRoutesProviders />}>
        <Route path={LANG_PREFIX} element={<AnonymousRoute />}>
          <Route path={RoutesConfig.signup} element={<Signup />} />
          <Route path={RoutesConfig.login} element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute />}>
          <Route index element={<Home />} />
          <Route path={RoutesConfig.profile} element={<Profile />} />
          <Route path={RoutesConfig.demoItems} element={<DemoItems />} />
          <Route path={RoutesConfig.demoItem} element={<DemoItem />} />
          <Route path={RoutesConfig.crudDemoItem.index} element={<CrudDemoItem />} />
          <Route path={RoutesConfig.subscriptions.index} element={<Subscriptions />} />
          <Route path={RoutesConfig.subscriptions.changePlan} element={<EditSubscription />} />
          <Route path={RoutesConfig.subscriptions.paymentMethod} element={<EditPaymentMethod />} />
          <Route path={RoutesConfig.subscriptions.cancel} element={<CancelSubscription />} />
          <Route path={RoutesConfig.finances.paymentConfirm} element={<FinancesPaymentConfirm />} />
          <Route path={RoutesConfig.finances.history} element={<TransactionHistory />} />
          <Route path={RoutesConfig.documents} element={<Documents />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path={LANG_PREFIX} element={<AuthRoute allowedRoles={Role.ADMIN} />}>
          <Route
            path={RoutesConfig.admin}
            element={
              <H1>
                <FormattedMessage defaultMessage="This page is only visible for admins" id="Admin / Heading" />
              </H1>
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
