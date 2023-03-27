import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const Home = asyncComponent(() => import('../routes/home'));
export const NotFound = asyncComponent(() => import('../routes/notFound'));
export const Signup = asyncComponent(() => import('../routes/auth/signup'));
export const Login = asyncComponent(() => import('../routes/auth/login'));
export const Logout = asyncComponent(() => import('../routes/auth/logout'));
export const Profile = asyncComponent(() => import('../routes/profile'));
export const ConfirmEmail = asyncComponent(() => import('../routes/auth/confirmEmail'));
//<-- IMPORT ROUTE -->
