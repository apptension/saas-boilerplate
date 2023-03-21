import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const Home = asyncComponent(() => import('../routes/home'));
export const NotFound = asyncComponent(() => import('../routes/notFound'));
export const Signup = asyncComponent(() => import('../routes/auth/signup'));
export const Login = asyncComponent(() => import('../routes/auth/login'));
export const Logout = asyncComponent(() => import('../routes/auth/logout'));
export const Profile = asyncComponent(() => import('../routes/profile'));
export const ConfirmEmail = asyncComponent(() => import('../routes/auth/confirmEmail'));
export const FinancesPaymentConfirm = asyncComponent(() => import('../routes/finances/paymentConfirm'));
export const Subscriptions = asyncComponent(() => import('../routes/finances/subscriptions'));
export const EditSubscription = asyncComponent(() => import('../routes/finances/editSubscription'));
export const EditPaymentMethod = asyncComponent(() => import('../routes/finances/editPaymentMethod'));
export const CancelSubscription = asyncComponent(() => import('../routes/finances/cancelSubscription'));
export const TransactionHistory = asyncComponent(() => import('../routes/finances/transactionHistory'));
export const Documents = asyncComponent(() => import('../routes/documents'));
//<-- IMPORT ROUTE -->
