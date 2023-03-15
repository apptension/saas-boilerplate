import { useLocales } from '@sb/webapp-core/hooks';
import { useEffect } from 'react';

import { useLocale } from '../../../../shared/hooks';

export const useLanguageFromParams = () => {
  const { setLanguage } = useLocales();
  const lang = useLocale();

  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
};
