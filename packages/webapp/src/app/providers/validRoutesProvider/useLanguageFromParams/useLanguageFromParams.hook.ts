import { useEffect } from 'react';

import { useLocale, useLocales } from '../../../../shared/hooks';

export const useLanguageFromParams = () => {
  const { setLanguage } = useLocales();
  const lang = useLocale();

  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
};
