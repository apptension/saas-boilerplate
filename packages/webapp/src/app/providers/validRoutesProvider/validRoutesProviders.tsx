import { TooltipProvider } from '@sb/webapp-core/components/ui/tooltip';
import { Locale } from '@sb/webapp-core/config/i18n';
import { useLocales, useAvailableLocales } from '@sb/webapp-core/hooks';
import { ResponsiveThemeProvider, DynamicIntlProvider } from '@sb/webapp-core/providers';
import { Toaster } from '@sb/webapp-core/toast';
import { CurrentTenantProvider } from '@sb/webapp-tenants/providers';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { Layout } from '../../../shared/components/layout';
import { useLanguageFromParams } from './useLanguageFromParams';

/**
 * Component to render the page title using useIntl (must be inside IntlProvider)
 */
const PageTitle = () => {
  const intl = useIntl();
  const pageTitle = intl.formatMessage({
    defaultMessage: 'Apptension Boilerplate',
    id: 'App / Page title',
  });

  return <Helmet titleTemplate={`%s - ${pageTitle}`} defaultTitle={pageTitle} />;
};

/**
 * Provides validated routes context with locale, theme, and tenant providers.
 */
export const ValidRoutesProviders = () => {
  useLanguageFromParams();

  const params = useParams();
  const navigate = useNavigate();

  const {
    locales: { language },
    setLanguage,
  } = useLocales();

  // Get the dynamic default locale from the API
  const { defaultLocale, isLoading: localesLoading } = useAvailableLocales();

  useEffect(() => {
    // Wait for locales to load before redirecting
    if (localesLoading) return;

    // If no language in URL params, redirect to the default locale
    if (params.lang === undefined) {
      const targetLocale = defaultLocale;
      const restPath = params['*'] || '';
      const url = `/${targetLocale}/${restPath}`;
      
      // Also set the language in context
      setLanguage(targetLocale as Locale);
      
      navigate(url, { replace: true });
    }
  }, [params, navigate, defaultLocale, localesLoading, setLanguage]);

  // Show nothing while loading locales or if no language is set
  if (localesLoading || !language) {
    return null;
  }

  return (
    <DynamicIntlProvider locale={language as Locale}>
      <>
        <PageTitle />

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
    </DynamicIntlProvider>
  );
};
