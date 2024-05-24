import { useLocale, useLocales } from '@sb/webapp-core/hooks';
import { useEffect } from 'react';

export const useLanguageFromParams = () => {
  const { setLanguage } = useLocales();
  const lang = useLocale();

  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
};
