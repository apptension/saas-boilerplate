import { useLocales } from '@saas-boilerplate-app/webapp-core/hooks';
import { useEffect } from 'react';

import { useLocale } from '../../../../shared/hooks';

export const useLanguageFromParams = () => {
  const { setLanguage } = useLocales();
  const lang = useLocale();

  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
};
