import { ChangeEvent } from 'react';
import { Locale } from '../../../i18n';
import { Select } from './languageSwitcher.styles';
import { useLanguageRouter } from './useLanguageRouter.hook';

export const LanguageSwitcherComponent = () => {
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
