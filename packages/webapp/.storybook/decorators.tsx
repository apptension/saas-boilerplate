import { DEFAULT_LOCALE, translationMessages } from '@sb/webapp-core/config/i18n';
import { ResponsiveThemeProvider } from '@sb/webapp-core/providers';
import { global as globalTheme, initializeFontFace } from '@sb/webapp-core/theme';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';

export { default as withRouter } from 'storybook-react-router';

export const withTheme = (theme) => (story) =>
  (
    <ResponsiveThemeProvider>
      <>
        <globalTheme.GlobalStyle />
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    initializeFontFace();
  }, []);

  return story();
};
