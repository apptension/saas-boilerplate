import { TooltipProvider } from '@sb/webapp-core/components/ui/tooltip';
import { translationMessages } from '@sb/webapp-core/config/i18n';
import { useLocales } from '@sb/webapp-core/hooks';
import { ResponsiveThemeProvider } from '@sb/webapp-core/providers';
import { Toaster } from '@sb/webapp-core/toast';
import { CurrentTenantProvider } from '@sb/webapp-tenants/providers';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { Layout } from '../../../shared/components/layout';
import { useLanguageFromParams } from './useLanguageFromParams';

/**
 *
 * @constructor
 *
 * @category Component
 */
export const ValidRoutesProviders = () => {
  useLanguageFromParams();

  const params = useParams();
  const navigate = useNavigate();

  const {
    locales: { language },
  } = useLocales();

  useEffect(() => {
    if (language && params.lang === undefined) {
      const url = `/${language}/${params['*']}`;
      navigate(url, { replace: true });
    }
  }, [language, params, navigate]);

  return !language ? null : (
    <IntlProvider key={language} locale={language} messages={translationMessages[language]}>
      <>
        <FormattedMessage defaultMessage="Apptension Boilerplate" id="App / Page title">
          {([pageTitle]: [string]) => <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />}
        </FormattedMessage>

        <ResponsiveThemeProvider>
          <CurrentTenantProvider>
            <TooltipProvider>
              <Layout>
                <Outlet />
              </Layout>
            </TooltipProvider>
          </CurrentTenantProvider>
        </ResponsiveThemeProvider>

        <Toaster />
      </>
    </IntlProvider>
  );
};
