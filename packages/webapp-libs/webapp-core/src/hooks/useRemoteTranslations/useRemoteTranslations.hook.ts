import { useCallback, useEffect, useState, useMemo } from 'react';

import { Locale, DEFAULT_LOCALE, translationMessages, TranslationMessages } from '../../config/i18n';

export interface RemoteTranslationsConfig {
  /**
   * Base URL for fetching translations.
   * In production, this should point to your S3/CloudFront URL.
   * In development, it can point to the local API.
   */
  translationsBaseUrl: string;

  /**
   * Whether to enable polling for translation updates.
   * Useful for development to see translation changes in real-time.
   */
  enablePolling?: boolean;

  /**
   * Polling interval in milliseconds.
   * Default: 5000 (5 seconds)
   */
  pollingInterval?: number;

  /**
   * Whether remote translations are enabled.
   * When false, only bundled translations are used.
   */
  enabled?: boolean;
}

/**
 * Get environment variable safely across different environments.
 */
// Helper to safely access import.meta (works in both Vite and Jest/Node)
const getImportMeta = (): { env?: Record<string, string> } | undefined => {
  // In Jest/Node, import.meta is not available, so we check via globalThis mock
  if (typeof globalThis !== 'undefined' && (globalThis as any).__importMetaMock) {
    return (globalThis as any).__importMetaMock;
  }
  
  // In Vite, import.meta is available
  try {
    // Use Function constructor to avoid syntax error in Jest
    const getMeta = new Function('return typeof import !== "undefined" ? import.meta : undefined');
    return getMeta();
  } catch {
    return undefined;
  }
};

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Try import.meta.env (Vite) first
  const importMeta = getImportMeta();
  if (importMeta?.env) {
    const value = importMeta.env[key];
    if (value !== undefined) return String(value);
  }
  
  // Node environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

const getDefaultConfig = (): RemoteTranslationsConfig => ({
  translationsBaseUrl: getEnvVar('VITE_TRANSLATIONS_URL', '/api/translations'),
  enablePolling:
    getEnvVar('MODE', getEnvVar('NODE_ENV')) === 'development' &&
    getEnvVar('VITE_TRANSLATIONS_POLLING') === 'true',
  pollingInterval: 5000,
  enabled: getEnvVar('VITE_USE_REMOTE_TRANSLATIONS') === 'true',
});

/**
 * Fetch translations from remote source (API or S3).
 */
async function fetchTranslations(locale: Locale, baseUrl: string): Promise<TranslationMessages> {
  const url = `${baseUrl}/${locale}.json`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    // Add cache-busting in development
    cache: getDefaultConfig().enablePolling ? 'no-cache' : 'default',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

interface UseRemoteTranslationsResult {
  data: TranslationMessages | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to load translations from a remote source.
 *
 * This hook fetches translations from an API or S3 bucket and falls back
 * to bundled translations if the fetch fails.
 *
 * @param locale - The locale to fetch translations for
 * @param config - Configuration options
 * @returns Object with translations data and loading states
 *
 * @example
 * ```tsx
 * const { data: messages, isLoading } = useRemoteTranslations('en', {
 *   translationsBaseUrl: 'https://translations.example.com',
 *   enabled: true,
 * });
 * ```
 */
export function useRemoteTranslations(
  locale: Locale,
  config: Partial<RemoteTranslationsConfig> = {}
): UseRemoteTranslationsResult {
  const mergedConfig = useMemo(
    () => ({
      ...getDefaultConfig(),
      ...config,
    }),
    [config]
  );

  const { translationsBaseUrl, enablePolling, pollingInterval, enabled } = mergedConfig;

  const [data, setData] = useState<TranslationMessages | undefined>(
    translationMessages[locale] || translationMessages[DEFAULT_LOCALE]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setData(translationMessages[locale] || translationMessages[DEFAULT_LOCALE]);
      setIsError(false);
      setError(null);
      return;
    }

    setIsFetching(true);
    setIsError(false);
    setError(null);
    try {
      const translations = await fetchTranslations(locale, translationsBaseUrl);
      setData(translations);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to fetch translations'));
      // Keep using bundled translations as fallback
      setData(translationMessages[locale] || translationMessages[DEFAULT_LOCALE]);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [locale, translationsBaseUrl, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      setIsLoading(true);
      fetchData();
    }
  }, [enabled, fetchData]);

  // Polling
  useEffect(() => {
    if (!enabled || !enablePolling) return;

    const interval = setInterval(fetchData, pollingInterval);
    return () => clearInterval(interval);
  }, [enabled, enablePolling, pollingInterval, fetchData]);

  return {
    data,
    isLoading,
    isError,
    isFetching,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for development-only translation overrides.
 * Allows real-time editing of translations via localStorage or dev tools.
 *
 * @param locale - The locale to get overrides for
 * @returns Object with override values
 */
export function useDevTranslationOverrides(locale: Locale) {
  const [overrides, setOverrides] = useState<Partial<TranslationMessages>>({});

  const isDevMode = useMemo(() => {
    return (
      getEnvVar('MODE', getEnvVar('NODE_ENV')) === 'development' ||
      getEnvVar('NODE_ENV') === 'development'
    );
  }, []);

  useEffect(() => {
    if (!isDevMode) return;

    // Load from localStorage
    const storageKey = `dev_translation_overrides_${locale}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setOverrides(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }

    // Listen for custom events from dev tools
    const handleTranslationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: string }>;
      const { key, value } = customEvent.detail;
      setOverrides((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('translation:update', handleTranslationUpdate);
    return () => {
      window.removeEventListener('translation:update', handleTranslationUpdate);
    };
  }, [locale, isDevMode]);

  const clearOverrides = useCallback(() => {
    localStorage.removeItem(`dev_translation_overrides_${locale}`);
    setOverrides({});
  }, [locale]);

  const setOverride = useCallback(
    (key: string, value: string) => {
      const storageKey = `dev_translation_overrides_${locale}`;
      setOverrides((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [locale]
  );

  return {
    overrides,
    setOverride,
    clearOverrides,
    isDevMode,
  };
}

