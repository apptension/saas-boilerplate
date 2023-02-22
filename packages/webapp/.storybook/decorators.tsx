import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { DEFAULT_LOCALE, translationMessages } from '../src/app/config/i18n';
import { ResponsiveThemeProvider } from '../src/app/providers';
import { GlobalStyle } from '../src/theme/global';
import { initializeFontFace } from '../src/theme/initializeFontFace';

export { default as withRouter } from 'storybook-react-router';

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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    initializeFontFace();
  }, []);

  return story();
};
