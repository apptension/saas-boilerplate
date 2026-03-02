import { ReactNode, useMemo } from 'react';
import { IntlProvider, IntlConfig } from 'react-intl';

import { Locale, DEFAULT_LOCALE, translationMessages, TranslationMessages, translationsConfig } from '../../config/i18n';
import { useRemoteTranslations, useDevTranslationOverrides } from '../../hooks/useRemoteTranslations';

export interface DynamicIntlProviderProps {
  /**
   * The locale to use for translations.
   */
  locale: Locale;

  /**
   * React children to render.
   */
  children: ReactNode;

  /**
   * Optional callback for handling translation errors.
   * If not provided, errors are logged in development only.
   */
  onError?: IntlConfig['onError'];

  /**
   * Optional override for remote translations base URL.
   */
  translationsBaseUrl?: string;
}

/**
 * Dynamic IntlProvider that can load translations from a remote source.
 *
 * This provider extends the standard IntlProvider with:
 * - Remote translation loading from S3/CDN
 * - Fallback to bundled translations
 * - Development mode polling for live translation updates
 * - Development mode translation overrides via localStorage
 *
 * Configuration is controlled via environment variables:
 * - VITE_USE_REMOTE_TRANSLATIONS: Enable remote translations (true/false)
 * - VITE_TRANSLATIONS_URL: Base URL for translations API/CDN
 * - VITE_TRANSLATIONS_POLLING: Enable polling in development (true/false)
 *
 * @example
 * ```tsx
 * <DynamicIntlProvider locale={Locale.ENGLISH}>
 *   <App />
 * </DynamicIntlProvider>
 * ```
 */
export const DynamicIntlProvider = ({
  locale,
  children,
  onError,
  translationsBaseUrl,
}: DynamicIntlProviderProps) => {
  // Fetch remote translations if enabled
  const {
    data: remoteMessages,
    isError,
    isFetching,
  } = useRemoteTranslations(locale, {
    enabled: translationsConfig.useRemoteTranslations,
    translationsBaseUrl: translationsBaseUrl || translationsConfig.translationsBaseUrl,
  });

  // Get development overrides
  const { overrides, isDevMode } = useDevTranslationOverrides(locale);

  // Merge translations: bundled -> remote -> dev overrides
  const messages = useMemo((): TranslationMessages => {
    // Start with bundled translations as base
    const mergedMessages: TranslationMessages = {
      ...(translationMessages[locale] || translationMessages[DEFAULT_LOCALE]),
    };

    // Apply remote translations if available and no error
    if (translationsConfig.useRemoteTranslations && remoteMessages && !isError) {
      Object.entries(remoteMessages).forEach(([key, value]) => {
        if (value !== undefined) {
          mergedMessages[key] = value;
        }
      });
    }

    // Apply development overrides (highest priority)
    if (isDevMode && Object.keys(overrides).length > 0) {
      Object.entries(overrides).forEach(([key, value]) => {
        if (value !== undefined) {
          mergedMessages[key] = value;
        }
      });
    }

    return mergedMessages;
  }, [locale, remoteMessages, isError, overrides, isDevMode]);

  // Default error handler - only log in development
  const handleError: IntlConfig['onError'] = useMemo(() => {
    if (onError) return onError;

    return (err) => {
      // Only log missing translations in development
      if (isDevMode) {
        if (err.code === 'MISSING_TRANSLATION') {
          // Log as warning, not error - missing translations are expected during development
          console.debug(`Missing translation: ${err.message}`);
        } else {
          console.warn('IntlProvider error:', err);
        }
      }
    };
  }, [onError, isDevMode]);

  // Generate a unique key to force re-render when messages change
  const providerKey = useMemo(() => {
    const messagesPreview = JSON.stringify(messages).slice(0, 100);
    return `${locale}-${messagesPreview}`;
  }, [locale, messages]);

  return (
    <IntlProvider
      key={providerKey}
      locale={locale}
      messages={messages}
      defaultLocale={DEFAULT_LOCALE}
      onError={handleError}
    >
      {children}
    </IntlProvider>
  );
};

export default DynamicIntlProvider;

