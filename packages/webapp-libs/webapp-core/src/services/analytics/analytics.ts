import { event, initialize, set } from 'react-ga';

import { ENV } from '../../config/env';

export type eventType = 'log-in' | 'log-in-oauth' | 'log-out' | 'sign-up';
export type eventCategory = 'auth';

const isGaInitialized = () => Boolean(ENV.ENVIRONMENT_NAME === 'production' && ENV.GOOGLE_ANALYTICS_TRACKING_ID);

export const initAnalytics = () => {
  if (isGaInitialized()) initialize(ENV.GOOGLE_ANALYTICS_TRACKING_ID);
};

export const trackEvent = (category: eventCategory, action: eventType, label?: string) => {
  if (isGaInitialized()) event({ category, action, label });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] track event:', category, action, label);
};

export const setUserId = (userId: string | number | null) => {
  if (isGaInitialized()) set({ userId });

  if (ENV.ENVIRONMENT_NAME === 'local') console.log('[Analytics] set userId:', userId);
};
