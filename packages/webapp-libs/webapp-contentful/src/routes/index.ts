import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const PrivacyPolicy = asyncComponent(() => import('./privacyPolicy'));
export const TermsAndConditions = asyncComponent(() => import('./termsAndConditions'));
export const DemoItem = asyncComponent(() => import('./demoItem'));
export const DemoItems = asyncComponent(() => import('./demoItems'));
