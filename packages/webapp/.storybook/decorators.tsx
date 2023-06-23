import { DEFAULT_LOCALE, translationMessages } from '@sb/webapp-core/config/i18n';
import { StoryFn } from '@storybook/react';
import { IntlProvider } from 'react-intl';

export const withIntl = (StoryComponent: StoryFn) => (
  <IntlProvider locale={DEFAULT_LOCALE} messages={translationMessages[DEFAULT_LOCALE]}>
    <StoryComponent />
  </IntlProvider>
);
