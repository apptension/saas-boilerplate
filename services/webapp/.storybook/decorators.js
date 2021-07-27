import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { ResponsiveThemeProvider } from '../src/app/providers/responsiveThemeProvider';
export { default as withRouter } from 'storybook-react-router';
import { GlobalStyle } from '../src/theme/global';
import { DEFAULT_LOCALE, translationMessages } from '../src/app/config/i18n';
import { initializeFontFace } from '../src/theme/initializeFontFace';

export const withTheme = (theme) => (story) =>
  (
    <ResponsiveThemeProvider>
      <>
        <GlobalStyle />
        {story()}
      </>
    </ResponsiveThemeProvider>
  );

export const withIntl = (story) => (
  <IntlProvider locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
    {story()}
  </IntlProvider>
);

export const withFontFace = (story) => {
  useEffect(() => {
    initializeFontFace();
  }, []);

  return story();
};
