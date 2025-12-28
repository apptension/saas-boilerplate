import { keys } from 'ramda';

import enTranslationMessages from '../translations/en.json';
import plTranslationMessages from '../translations/pl.json';
import deTranslationMessages from '../translations/de.json';
import frTranslationMessages from '../translations/fr.json';
import esTranslationMessages from '../translations/es.json';

export enum Locale {
  ENGLISH = 'en',
  POLISH = 'pl',
  GERMAN = 'de',
  FRENCH = 'fr',
  SPANISH = 'es',
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
   * Base URL for fetching translations.
   * Can be an API endpoint or S3/CloudFront URL.
   */
  translationsBaseUrl: string;

  /**
   * Whether to enable polling for translation updates in development.
   */
  enableDevPolling: boolean;
}

/**
 * Get translations configuration from environment variables.
 */
const getTranslationsConfig = (): TranslationsConfig => {
  // Handle both Vite (import.meta.env) and Node (process.env) environments
  const getEnv = (key: string, defaultValue: string = ''): string => {
     
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env) {
      return meta.env[key] || defaultValue;
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  };

   
  const meta = import.meta as any;
  const isDev =
    (typeof meta !== 'undefined' && meta.env?.MODE === 'development') ||
    (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'development');

  // Default: use remote translations in production, configurable in development
  const useRemote = getEnv('VITE_USE_REMOTE_TRANSLATIONS');
  const useRemoteTranslations = useRemote !== '' ? useRemote === 'true' : !isDev;

  return {
    useRemoteTranslations,
    translationsBaseUrl: getEnv('VITE_TRANSLATIONS_URL', '/api/translations'),
    enableDevPolling: isDev && getEnv('VITE_TRANSLATIONS_POLLING') === 'true',
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
 * These are compiled into the application and serve as fallback
 * when remote translations are not available.
 */
export const translationMessages: Record<Locale, TranslationMessages> = {
  [Locale.ENGLISH]: formatTranslationMessages(Locale.ENGLISH, enTranslationMessages),
  [Locale.POLISH]: formatTranslationMessages(Locale.POLISH, plTranslationMessages),
  [Locale.GERMAN]: formatTranslationMessages(Locale.GERMAN, deTranslationMessages),
  [Locale.FRENCH]: formatTranslationMessages(Locale.FRENCH, frTranslationMessages),
  [Locale.SPANISH]: formatTranslationMessages(Locale.SPANISH, esTranslationMessages),
};
