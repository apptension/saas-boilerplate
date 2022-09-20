// @ts-nocheck
import { asyncComponent } from '../shared/utils/asyncComponent';

export const Home = asyncComponent(() => import('../routes/home'), 'Home');
export const NotFound = asyncComponent(() => import('../routes/notFound'), 'NotFound');
export const Signup = asyncComponent(() => import('../routes/auth/signup'), 'Signup');
export const Login = asyncComponent(() => import('../routes/auth/login'), 'Login');
export const Logout = asyncComponent(() => import('../routes/auth/logout'), 'Logout');
export const Profile = asyncComponent(() => import('../routes/profile'), 'Profile');
export const ConfirmEmail = asyncComponent(() => import('../routes/auth/confirmEmail'), 'ConfirmEmail');
export const PrivacyPolicy = asyncComponent(() => import('../routes/privacyPolicy'), 'PrivacyPolicy');
export const TermsAndConditions = asyncComponent(() => import('../routes/termsAndConditions'), 'TermsAndConditions');
export const DemoItems = asyncComponent(() => import('../routes/demoItems'), 'DemoItems');
export const DemoItem = asyncComponent(() => import('../routes/demoItem'), 'DemoItem');
export const CrudDemoItem = asyncComponent(() => import('../routes/crudDemoItem'), 'CrudDemoItem');
export const FinancesPaymentConfirm = asyncComponent(
  () => import('../routes/finances/paymentConfirm'),
  'PaymentConfirm'
);
export const Subscriptions = asyncComponent(() => import('../routes/finances/subscriptions'), 'Subscriptions');
export const EditSubscription = asyncComponent(() => import('../routes/finances/editSubscription'), 'EditSubscription');
export const EditPaymentMethod = asyncComponent(
  () => import('../routes/finances/editPaymentMethod'),
  'EditPaymentMethod'
);
export const CancelSubscription = asyncComponent(
  () => import('../routes/finances/cancelSubscription'),
  'CancelSubscription'
);
export const TransactionHistory = asyncComponent(
  () => import('../routes/finances/transactionHistory'),
  'TransactionHistory'
);
export const Documents = asyncComponent(() => import('../routes/documents'), 'Documents');
//<-- IMPORT ROUTE -->
