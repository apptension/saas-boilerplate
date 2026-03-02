import { NetworkStatus } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { SchemaType } from '@sb/webapp-api-client/graphql';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { AlertCircle, ExternalLink, FileText, Info, RefreshCw } from 'lucide-react';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAllQuery } from './demoItems.graphql';
import { ListSkeleton } from './listSkeleton';

export const DemoItems = () => {
  const intl = useIntl();
  const { data, loading, error, refetch, networkStatus } = useQuery(demoItemsAllQuery, {
    context: { schemaType: SchemaType.Contentful },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  const items = data?.demoItemCollection?.items;
  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isLoading = loading && !isRefetching && !data && !error;

  const renderNotConfigured = () => {
    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4 mb-4">
              <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage
                defaultMessage="Contentful Integration Not Configured"
                id="Contentful Items / Not configured title"
              />
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg">
              <FormattedMessage
                defaultMessage="This demo showcases integration with Contentful headless CMS. It's an optional feature - you can configure it when you're ready, or skip it if you don't need CMS functionality."
                id="Contentful Items / Not configured description"
              />
            </p>

            <div className="bg-background rounded-lg border p-4 text-left w-full max-w-lg mt-2">
              <p className="text-sm font-medium mb-3">
                <FormattedMessage
                  defaultMessage="To enable this feature:"
                  id="Contentful Items / Setup title"
                />
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  <FormattedMessage
                    defaultMessage="Create a free Contentful account at contentful.com"
                    id="Contentful Items / Setup step 1"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="Set up a space and create the 'demoItem' content type"
                    id="Contentful Items / Setup step 2"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="Add these environment variables to your .env file:"
                    id="Contentful Items / Setup step 3"
                  />
                  <code className="block mt-1 ml-4 p-2 bg-muted rounded text-xs font-mono">
                    VITE_CONTENTFUL_SPACE=your_space_id
                    <br />
                    VITE_CONTENTFUL_TOKEN=your_token
                  </code>
                </li>
              </ol>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.contentful.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FormattedMessage defaultMessage="Visit Contentful" id="Contentful Items / Visit link" />
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.contentful.com/developers/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FormattedMessage defaultMessage="Documentation" id="Contentful Items / Docs link" />
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-6 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <FormattedMessage
                defaultMessage="Check again"
                id="Contentful Items / Check again button"
              />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderError = () => {
    // Check if this is a configuration/network error (Contentful not set up)
    const isConfigError =
      (error && 'networkError' in error && error.networkError) ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('network') ||
      error?.message?.includes('Failed to fetch');

    if (isConfigError) {
      return renderNotConfigured();
    }

    // Show actual error for other cases
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-semibold">
          <FormattedMessage
            defaultMessage="Unable to load content items"
            id="Contentful Items / Error title"
          />
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            <FormattedMessage
              defaultMessage="There was an error loading items from Contentful."
              id="Contentful Items / Error description"
            />
          </p>
          {error?.message && (
            <p className="text-xs font-mono bg-background/50 p-2 rounded border">
              {error.message}
            </p>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <FormattedMessage defaultMessage="Try again" id="Contentful Items / Retry button" />
          </button>
        </AlertDescription>
      </Alert>
    );
  };

  const renderEmptyList = () => {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage defaultMessage="No content items found" id="Contentful Items / Empty title" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              <FormattedMessage
                defaultMessage="Your Contentful space is connected but has no 'demoItem' entries yet. Add some items in Contentful to see them here."
                id="Contentful Items / Empty description"
              />
            </p>
            <a
              href="https://app.contentful.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <FormattedMessage defaultMessage="Open Contentful dashboard" id="Contentful Items / Open dashboard" />
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderList = () => {
    if (!items || items.length === 0) {
      return renderEmptyList();
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <FormattedMessage id="Contentful Items / Card title" defaultMessage="Content Items" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              id="Contentful Items / Card description"
              defaultMessage="Items managed in Contentful CMS. Click the star to mark as favorite."
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {items.map((demoItem) => {
              if (!demoItem) return null;
              return (
                <Suspense key={demoItem.sys.id} fallback={null}>
                  <DemoItemListItem item={demoItem} id={demoItem.sys.id} />
                </Suspense>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Content Items',
          id: 'Contentful Items / Page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Content Items" id="Contentful Items / Title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="This demo page showcases integration with Contentful headless CMS. Items can be synchronized with your application's database, enabling business logic integration with CMS-managed content."
              id="Contentful Items / Subheader"
            />
          </Paragraph>
        </div>

        {/* Content */}
        {error ? (
          renderError()
        ) : isLoading ? (
          <ListSkeleton />
        ) : (
          renderList()
        )}
      </div>
    </PageLayout>
  );
};
