import { DEFAULT_LOCALE, translationMessages } from '@sb/webapp-core/config/i18n';
import { ResponsiveThemeProvider } from '@sb/webapp-core/providers';
import { global as globalTheme } from '@sb/webapp-core/theme';
import { StoryFn } from '@storybook/react';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { initializeFontFace } from '../src/app/utils/initializeFontFace';

export const withTheme = () => (StoryComponent: StoryFn) =>
  (
    <ResponsiveThemeProvider>
      <>
        <globalTheme.GlobalStyle />
        <StoryComponent />
      </>
    </ResponsiveThemeProvider>
  );

export const withIntl = (StoryComponent: StoryFn) => (
  <IntlProvider locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
    <StoryComponent />
  </IntlProvider>
);

export const withFontFace = (StoryComponent: StoryFn) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    initializeFontFace();
  }, []);

  return <StoryComponent />;
};
