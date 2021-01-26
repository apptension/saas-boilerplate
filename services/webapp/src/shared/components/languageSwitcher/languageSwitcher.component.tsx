import React from 'react';

import { Select } from './languageSwitcher.styles';
import { useLanguageRouter } from './useLanguageRouter.hook';

export const LanguageSwitcherComponent = () => {
  const [{ language, locales }, changeLanguage] = useLanguageRouter();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => changeLanguage(e.target.value);

  return (
    <Select value={language || ''} onChange={handleChange}>
      {locales.map(locale => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </Select>
  );
};
