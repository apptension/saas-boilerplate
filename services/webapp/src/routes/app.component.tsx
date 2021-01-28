import React, { Fragment, ReactNode } from 'react';
import '../theme/styled.d';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';

import { translationMessages } from '../i18n';
import { GlobalStyle } from '../theme/global';
import { localesSelectors } from '../modules/locales';
import { ResponsiveThemeProvider } from '../shared/components/responsiveThemeProvider';
import { useStartup } from './useStartup';
import { useLanguageFromParams } from './useLanguageFromParams';

export interface AppComponentProps {
  children?: ReactNode;
}

export const AppComponent = ({ children }: AppComponentProps) => {
  useStartup();
  useLanguageFromParams();

  const language = useSelector(localesSelectors.selectLocalesLanguage);

  if (!language) {
    return null;
  }

  return (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <Fragment>
        <FormattedMessage defaultMessage="Apptension Boilerplate" description="App / Page title">
          {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
        </FormattedMessage>

        <GlobalStyle />
        <ResponsiveThemeProvider>{React.Children.only(children)}</ResponsiveThemeProvider>
      </Fragment>
    </IntlProvider>
  );
};
