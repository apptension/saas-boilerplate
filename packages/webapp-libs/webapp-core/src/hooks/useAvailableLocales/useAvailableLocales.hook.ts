import { useState, useEffect, useMemo } from 'react';

import { Locale, DEFAULT_LOCALE, translationsConfig } from '../../config/i18n';

export interface RemoteLocale {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
  rtl: boolean;
  translation_progress: number;
}

/**
 * Static locale metadata for flags and fallback display names.
 */
const LOCALE_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  pl: '🇵🇱',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  pt: '🇵🇹',
  nl: '🇳🇱',
  ru: '🇷🇺',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
  ar: '🇸🇦',
  he: '🇮🇱',
  tr: '🇹🇷',
  sv: '🇸🇪',
  da: '🇩🇰',
  no: '🇳🇴',
  fi: '🇫🇮',
  cs: '🇨🇿',
  uk: '🇺🇦',
  ro: '🇷🇴',
  hu: '🇭🇺',
  el: '🇬🇷',
  th: '🇹🇭',
  vi: '🇻🇳',
  id: '🇮🇩',
  hi: '🇮🇳',
};

const FALLBACK_LOCALES: RemoteLocale[] = [
  {
    id: 1,
    code: 'en',
    name: 'English',
    native_name: 'English',
    is_default: true,
    is_active: true,
    rtl: false,
    translation_progress: 100,
  },
  {
    id: 2,
    code: 'pl',
    name: 'Polish',
    native_name: 'Polski',
    is_default: false,
    is_active: true,
    rtl: false,
    translation_progress: 0,
  },
];

interface UseAvailableLocalesResult {
  locales: RemoteLocale[];
  defaultLocale: string;
  isLoading: boolean;
  isError: boolean;
  getFlag: (code: string) => string;
}

/**
 * Hook to fetch available locales from the translations API.
 *
 * Returns a list of active locales that have translations available,
 * along with the default locale configured in the admin panel.
 */
export function useAvailableLocales(): UseAvailableLocalesResult {
  const [locales, setLocales] = useState<RemoteLocale[]>(FALLBACK_LOCALES);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchLocales = async () => {
      setIsLoading(true);
      try {
        const baseUrl = translationsConfig.translationsBaseUrl || '/api/translations';
        const response = await fetch(`${baseUrl}/locales/`, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch locales: ${response.status}`);
        }

        const data: RemoteLocale[] = await response.json();
        // Only show active locales
        const activeLocales = data.filter((l) => l.is_active);
        if (activeLocales.length > 0) {
          setLocales(activeLocales);
        }
        setIsError(false);
      } catch (error) {
        console.warn('Failed to fetch available locales, using defaults:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocales();
  }, []);

  const getFlag = useMemo(
    () => (code: string) => LOCALE_FLAGS[code] || '🌐',
    []
  );

  // Find the default locale from the fetched locales, or fall back to static default
  const defaultLocale = useMemo(() => {
    const defaultFromApi = locales.find((l) => l.is_default);
    return defaultFromApi?.code || DEFAULT_LOCALE;
  }, [locales]);

  return { locales, defaultLocale, isLoading, isError, getFlag };
}

/**
 * Helper to convert a locale code to a Locale enum value.
 */
export function toLocaleEnum(code: string): Locale {
  const validLocales = Object.values(Locale);
  if (validLocales.includes(code as Locale)) {
    return code as Locale;
  }
  return DEFAULT_LOCALE;
}

