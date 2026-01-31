import { keys } from 'ramda';

// Only import English as fallback - other languages are loaded on-demand from API
import enTranslationMessages from '../translations/en.json';
import { getViteEnv } from './env.vite';

export enum Locale {
  ENGLISH = 'en',
  POLISH = 'pl',
  GERMAN = 'de',
  FRENCH = 'fr',
  SPANISH = 'es',
  CHINESE = 'zh',
  HINDI = 'hi',
  ARABIC = 'ar',
}

export const DEFAULT_LOCALE = Locale.ENGLISH;

export const appLocales = Object.values(Locale);

export interface TranslationMessage {
  defaultMessage: string;
  description?: string;
}

export type TranslationMessagesWithDescriptors = Record<string, TranslationMessage>;

export type TranslationMessages = Record<string, string>;

/**
 * Configuration for remote/dynamic translations.
 */
export interface TranslationsConfig {
  /**
   * Whether to fetch translations from a remote source (API/S3/CDN).
   * When false, only bundled translations are used.
   */
  useRemoteTranslations: boolean;

  /**
   * Whether remote translations are enabled (alias for useRemoteTranslations).
   */
  enabled: boolean;

  /**
   * Base URL for fetching translations.
   * Can be an API endpoint or S3/CloudFront URL.
   */
  translationsBaseUrl: string;

  /**
   * Whether to enable polling for translation updates in development.
   */
  enableDevPolling: boolean;

  /**
   * Whether to enable polling for translation updates (alias for enableDevPolling).
   */
  enablePolling: boolean;

  /**
   * Polling interval in milliseconds.
   */
  pollingInterval: number;
}

/**
 * Get translations configuration from environment variables.
 * 
 * IMPORTANT: Vite statically replaces import.meta.env.* at build time.
 * We must access these values directly (not via dynamic lookup) for the
 * replacement to work correctly.
 */
const getTranslationsConfig = (): TranslationsConfig => {
  // Access Vite env vars via helper (mocked in Jest tests)
  const env = getViteEnv();
  
  const isDev = env.MODE === 'development' || env.DEV === true;

  // Default: always use remote translations since only English is bundled
  // Other languages are stored in the backend translations API
  // Can be disabled via VITE_USE_REMOTE_TRANSLATIONS=false
  const useRemoteEnv = env.VITE_USE_REMOTE_TRANSLATIONS;
  const useRemoteTranslations = useRemoteEnv !== undefined && useRemoteEnv !== '' 
    ? useRemoteEnv === 'true' 
    : true; // Always enable by default - translations are in the API

  // Get translations URL - if not explicitly set, derive from base API URL
  // This is important for production where frontend and backend are on different domains
  let translationsBaseUrl = env.VITE_TRANSLATIONS_URL || '';
  if (!translationsBaseUrl) {
    const baseApiUrl = env.VITE_BASE_API_URL || '/api';
    // If base API URL ends with /api, append /translations
    if (baseApiUrl.endsWith('/api')) {
      translationsBaseUrl = `${baseApiUrl}/translations`;
    } else {
      translationsBaseUrl = `${baseApiUrl}/translations`;
    }
  }

  const enablePolling = isDev && env.VITE_TRANSLATIONS_POLLING === 'true';
  const pollingInterval = 5000; // 5 seconds

  return {
    useRemoteTranslations,
    enabled: useRemoteTranslations, // Alias for compatibility
    translationsBaseUrl,
    enableDevPolling: enablePolling,
    enablePolling, // Alias for compatibility
    pollingInterval,
  };
};

/**
 * Translations configuration.
 * Controlled via environment variables:
 * - VITE_USE_REMOTE_TRANSLATIONS: Enable remote translations (true/false)
 * - VITE_TRANSLATIONS_URL: Base URL for translations
 * - VITE_TRANSLATIONS_POLLING: Enable polling in development (true/false)
 */
export const translationsConfig = getTranslationsConfig();

export const formatTranslationMessages = (
  locale: Locale,
  messages: TranslationMessagesWithDescriptors
): TranslationMessages => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages) : {};

  return keys(messages).reduce((formattedMessages, key) => {
    const formattedMessage =
      !messages[key]?.defaultMessage && locale !== DEFAULT_LOCALE
        ? defaultFormattedMessages[key]
        : messages[key]?.defaultMessage;
    return Object.assign(formattedMessages, { [key]: formattedMessage });
  }, {});
};

/**
 * Bundled translation messages.
 * Only English is bundled as fallback - other languages are loaded on-demand
 * from the translations API to reduce initial bundle size.
 */
const englishMessages = formatTranslationMessages(Locale.ENGLISH, enTranslationMessages);

export const translationMessages: Partial<Record<Locale, TranslationMessages>> & Record<Locale.ENGLISH, TranslationMessages> = {
  [Locale.ENGLISH]: englishMessages,
  // Other locales are loaded on-demand from API
  // Fallback to English if not loaded yet
  [Locale.POLISH]: englishMessages,
  [Locale.GERMAN]: englishMessages,
  [Locale.FRENCH]: englishMessages,
  [Locale.SPANISH]: englishMessages,
  [Locale.CHINESE]: englishMessages,
  [Locale.HINDI]: englishMessages,
  [Locale.ARABIC]: englishMessages,
};
