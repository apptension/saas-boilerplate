// @ts-nocheck

export const ENV = {
  BASE_API_URL: process.env.VITE_BASE_API_URL ?? '/api',
  ENVIRONMENT_NAME: process.env.VITE_ENVIRONMENT_NAME,
  SENTRY_DSN: process.env.VITE_SENTRY_DSN,
  WEB_APP_URL: process.env.VITE_WEB_APP_URL ?? '',
  EMAIL_ASSETS_URL: process.env.VITE_EMAIL_ASSETS_URL ?? '/email-assets',
  PUBLIC_URL: process.env.PUBLIC_URL,
  CONTENTFUL_SPACE: process.env.VITE_CONTENTFUL_SPACE,
  CONTENTFUL_ENV: process.env.VITE_CONTENTFUL_ENV,
  CONTENTFUL_TOKEN: process.env.VITE_CONTENTFUL_TOKEN,
  STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  GOOGLE_ANALYTICS_TRACKING_ID: process.env.VITE_GOOGLE_ANALYTICS_TRACKING_ID,
  
  // Enterprise Authentication Feature Flags
  // Set these in your environment to enable/disable enterprise auth features
  ENABLE_SSO: process.env.VITE_ENABLE_SSO !== 'false', // Default: enabled
  ENABLE_PASSKEYS: process.env.VITE_ENABLE_PASSKEYS !== 'false', // Default: enabled  
  ENABLE_SOCIAL_LOGIN: process.env.VITE_ENABLE_SOCIAL_LOGIN !== 'false', // Default: enabled
  ENABLE_PASSWORD_LOGIN: process.env.VITE_ENABLE_PASSWORD_LOGIN !== 'false', // Default: enabled
};
