// @ts-nocheck
import { asyncComponent } from '../shared/utils/asyncComponent';

export const Home = asyncComponent(() => import('./home'), 'Home');
export const NotFound = asyncComponent(() => import('./notFound'), 'NotFound');
export const Signup = asyncComponent(() => import('./auth/signup'), 'Signup');
export const Login = asyncComponent(() => import('./auth/login'), 'Login');
export const Profile = asyncComponent(() => import('./profile'), 'Profile');
export const ConfirmEmail = asyncComponent(() => import('./auth/confirmEmail'), 'ConfirmEmail');
export const PrivacyPolicy = asyncComponent(() => import('./privacyPolicy'), 'PrivacyPolicy');
export const TermsAndConditions = asyncComponent(() => import('./termsAndConditions'), 'TermsAndConditions');
export const DemoItems = asyncComponent(() => import('./demoItems'), 'DemoItems');
export const DemoItem = asyncComponent(() => import('./demoItem'), 'DemoItem');
export const CrudDemoItem = asyncComponent(() => import('./crudDemoItem'), 'CrudDemoItem');
export const FinancesPaymentConfirm = asyncComponent(() => import('./finances/paymentConfirm'), 'PaymentConfirm');
export const Subscriptions = asyncComponent(() => import('./finances/subscriptions'), 'Subscriptions');
export const EditSubscription = asyncComponent(() => import('./finances/editSubscription'), 'EditSubscription');
export const EditPaymentMethod = asyncComponent(() => import('./finances/editPaymentMethod'), 'EditPaymentMethod');
export const CancelSubscription = asyncComponent(() => import('./finances/cancelSubscription'), 'CancelSubscription');
export const TransactionHistory = asyncComponent(() => import('./finances/transactionHistory'), 'TransactionHistory');
//<-- IMPORT ROUTE -->
