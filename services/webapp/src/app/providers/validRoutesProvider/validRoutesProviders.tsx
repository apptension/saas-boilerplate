import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { RelayEnvironmentProvider } from 'react-relay';
import { Helmet } from 'react-helmet-async';
import { localesSelectors } from '../../../modules/locales';
import { translationMessages } from '../../config/i18n';
import { relayEnvironment } from '../../../shared/services/graphqlApi/relayEnvironment';
import { GlobalStyle } from '../../../theme/global';
import { ResponsiveThemeProvider } from '../responsiveThemeProvider';
import { Layout } from '../../../shared/components/layout';
import { useStartup } from './useStartup';
import { useLanguageFromParams } from './useLanguageFromParams';

export const ValidRoutesProviders = () => {
  useStartup();
  useLanguageFromParams();

  const language = useSelector(localesSelectors.selectLocalesLanguage);

  if (!language) {
    return null;
  }

  return (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <>
          <FormattedMessage defaultMessage="Apptension Boilerplate" description="App / Page title">
            {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
          </FormattedMessage>

          <GlobalStyle />

          <ResponsiveThemeProvider>
            <Layout>
              <Outlet />
            </Layout>
          </ResponsiveThemeProvider>
        </>
      </RelayEnvironmentProvider>
    </IntlProvider>
  );
};
