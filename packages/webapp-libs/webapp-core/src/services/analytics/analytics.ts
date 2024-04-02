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
  tenant: 'add' | 'edit' | 'delete';
  tenantInvitation: 'invite' | 'accept' | 'decline';
};

export const isAvailable = () => Boolean(ENV.GOOGLE_ANALYTICS_TRACKING_ID);

export const getTrackingId = () => ENV.GOOGLE_ANALYTICS_TRACKING_ID;

export const trackEvent = <T extends keyof ActionMap>(category: T, action: ActionMap[T], label?: string) => {
  if (isAvailable() && window.gtag) window.gtag('event', action, { event_category: category, event_label: label });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] track event:', category, action, label);
};

export const setUserId = (userId: string | number | null) => {
  if (isAvailable() && window.gtag) window.gtag('set', { user_id: userId });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] set userId:', userId);
};
