import { Locale } from '@sb/webapp-core/config/i18n';
import { ChangeEvent } from 'react';

import { useLanguageRouter } from './languageSwitcher.hooks';
import { Select } from './languageSwitcher.styles';

export const LanguageSwitcher = () => {
  const [{ language, locales }, changeLanguage] = useLanguageRouter();
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => changeLanguage(e.target.value as Locale);

  return (
    <Select value={language || ''} onChange={handleChange}>
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </Select>
  );
};
