import { translationMessages } from '@saas-boilerplate-app/webapp-core/config/i18n';
import { useLocales } from '@saas-boilerplate-app/webapp-core/hooks';
import { ResponsiveThemeProvider } from '@saas-boilerplate-app/webapp-core/providers';
import { global } from '@saas-boilerplate-app/webapp-core/theme';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { Outlet } from 'react-router-dom';

import { Layout } from '../../../shared/components/layout';
import { useLanguageFromParams } from './useLanguageFromParams';

export const ValidRoutesProviders = () => {
  useLanguageFromParams();

  const {
    locales: { language },
  } = useLocales();

  if (!language) {
    return null;
  }

  return (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <>
        <FormattedMessage defaultMessage="Apptension Boilerplate" id="App / Page title">
          {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
        </FormattedMessage>

        <global.GlobalStyle />

        <ResponsiveThemeProvider>
          <Layout>
            <Outlet />
          </Layout>
        </ResponsiveThemeProvider>
      </>
    </IntlProvider>
  );
};
