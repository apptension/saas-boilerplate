import { ChangeEvent } from 'react';
import { Locale } from '../../../app/config/i18n';
import { Select } from './languageSwitcher.styles';
import { useLanguageRouter } from './languageSwitcher.hooks';

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
