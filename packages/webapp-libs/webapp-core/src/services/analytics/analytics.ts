import { event, initialize, set } from 'react-ga';

import { ENV } from '../../config/env';

type ActionMap = {
  auth:
    | 'log-in'
    | 'log-in-oauth'
    | 'log-out'
    | 'sign-up'
    | 'reset-password'
    | 'reset-password-confirm'
    | 'user-email-confirm'
    | 'otp-disabled'
    | 'otp-validate'
    | 'otp-verify'
    | 'otp-generate';
  crud: 'add' | 'edit' | 'delete';
  payment: 'make-payment';
  subscription: 'change-plan' | 'cancel' | 'add-payment-method' | 'edit-payment-method';
  profile: 'avatar-update' | 'personal-data-update' | 'password-update' | 'setup-2fa' | 'disable-2fa';
  document: 'upload' | 'delete';
};

const isGaInitialized = () => Boolean(ENV.GOOGLE_ANALYTICS_TRACKING_ID);

export const initAnalytics = () => {
  if (isGaInitialized()) initialize(ENV.GOOGLE_ANALYTICS_TRACKING_ID as string);
};

export const trackEvent = <T extends keyof ActionMap>(category: T, action: ActionMap[T], label?: string) => {
  if (isGaInitialized()) event({ category, action, label });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] track event:', category, action, label);
};

export const setUserId = (userId: string | number | null) => {
  if (isGaInitialized()) set({ userId });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] set userId:', userId);
};
