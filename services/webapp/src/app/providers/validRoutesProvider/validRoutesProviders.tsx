import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { localesSelectors } from '../../../modules/locales';
import { translationMessages } from '../../config/i18n';
import { GlobalStyle } from '../../../theme/global';
import { ResponsiveThemeProvider } from '../responsiveThemeProvider';
import { Layout } from '../../../shared/components/layout';
import { useLanguageFromParams } from './useLanguageFromParams';

export const ValidRoutesProviders = () => {
  useLanguageFromParams();

  const language = useSelector(localesSelectors.selectLocalesLanguage);

  if (!language) {
    return null;
  }

  return (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <>
        <FormattedMessage defaultMessage="Apptension Boilerplate" id="App / Page title">
          {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
        </FormattedMessage>

        <GlobalStyle />

        <ResponsiveThemeProvider>
          <Layout>
            <Outlet />
          </Layout>
        </ResponsiveThemeProvider>
      </>
    </IntlProvider>
  );
};
