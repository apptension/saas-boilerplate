/**
 * Jest mock for env.vite.ts
 * Returns test environment values instead of import.meta.env
 */

const testEnv = {
  MODE: 'test',
  DEV: false,
  PROD: false,
  VITE_BASE_API_URL: '/api',
  VITE_ENVIRONMENT_NAME: 'test',
  VITE_SENTRY_DSN: '',
  VITE_WEB_APP_URL: 'http://localhost:5173',
  VITE_EMAIL_ASSETS_URL: '/email-assets',
  VITE_CONTENTFUL_SPACE: '',
  VITE_CONTENTFUL_ENV: '',
  VITE_CONTENTFUL_TOKEN: '',
  VITE_STRIPE_PUBLISHABLE_KEY: '',
  VITE_GOOGLE_ANALYTICS_TRACKING_ID: '',
  VITE_ENABLE_SSO: 'true',
  VITE_ENABLE_PASSKEYS: 'true',
  VITE_ENABLE_SOCIAL_LOGIN: 'true',
  VITE_ENABLE_PASSWORD_LOGIN: 'true',
  VITE_USE_REMOTE_TRANSLATIONS: 'false',
  VITE_TRANSLATIONS_URL: '/api/translations',
  VITE_TRANSLATIONS_POLLING: 'false',
};

export const getViteEnv = () => testEnv;
