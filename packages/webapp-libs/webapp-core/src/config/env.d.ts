/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL: string;
  readonly VITE_ENVIRONMENT_NAME: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_WEB_APP_URL: string;
  readonly VITE_EMAIL_ASSETS_URL: string;
  readonly VITE_CONTENTFUL_SPACE: string;
  readonly VITE_CONTENTFUL_ENV: string;
  readonly VITE_CONTENTFUL_TOKEN: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_GOOGLE_ANALYTICS_TRACKING_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
