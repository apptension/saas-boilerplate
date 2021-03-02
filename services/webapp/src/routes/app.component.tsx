import React, { Fragment, ReactNode } from 'react';
import '../theme/styled.d';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { ApolloProvider } from '@apollo/client';

import { translationMessages } from '../i18n';
import { GlobalStyle } from '../theme/global';
import { localesSelectors } from '../modules/locales';
import { ResponsiveThemeProvider } from '../shared/components/responsiveThemeProvider';
import { apolloClient } from '../shared/services/contentful';
import { selectIsLoggedIn } from '../modules/auth/auth.selectors';
import { useStartup } from './useStartup';
import { useLanguageFromParams } from './useLanguageFromParams';
import { Layout, Content, Header, Sidebar } from './app.styles';

export interface AppComponentProps {
  children?: ReactNode;
}

export const AppComponent = ({ children }: AppComponentProps) => {
  useStartup();
  useLanguageFromParams();
  const isUserLoggedIn = useSelector(selectIsLoggedIn);

  const language = useSelector(localesSelectors.selectLocalesLanguage);

  if (!language) {
    return null;
  }

  return (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <ApolloProvider client={apolloClient}>
        <Fragment>
          <FormattedMessage defaultMessage="Apptension Boilerplate" description="App / Page title">
            {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
          </FormattedMessage>

          <GlobalStyle />

          <ResponsiveThemeProvider>
            <Layout>
              <Header />
              {isUserLoggedIn && <Sidebar />}
              <Content>{React.Children.only(children)}</Content>
            </Layout>
          </ResponsiveThemeProvider>
        </Fragment>
      </ApolloProvider>
    </IntlProvider>
  );
};
