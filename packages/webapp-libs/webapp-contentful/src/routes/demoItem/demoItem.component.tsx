import { useQuery } from '@apollo/client/react';
import { SchemaType } from '@sb/webapp-api-client';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardHeader } from '@sb/webapp-core/components/ui/card';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { AlertCircle, ArrowLeft, ExternalLink, FileText, Info, RefreshCw } from 'lucide-react';
import { FC, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import { demoItemQuery } from './demoItem.graphql';
import { DemoItemContent } from './demoItemContent.component';

type Params = { id: string };

type DemoItemProps = {
  routesConfig: {
    notFound: string;
    list: string;
  };
};

const LoadingSkeleton = () => (
  <PageLayout>
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  </PageLayout>
);

type ErrorStateProps = {
  error: Error;
  onRetry: () => void;
  listPath: string;
  isRefetching: boolean;
};

const NotConfiguredState: FC<{ listPath: string }> = ({ listPath }) => {
  const generateLocalePath = useGenerateLocalePath();

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="space-y-4">
          <Link
            to={generateLocalePath(listPath)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to content items" id="Contentful Item / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Content Item" id="Contentful Item / Title" />
            </h1>
          </div>
        </div>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4 mb-4">
                <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <FormattedMessage
                  defaultMessage="Contentful Not Configured"
                  id="Contentful Item / Not configured title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                <FormattedMessage
                  defaultMessage="This content item cannot be loaded because Contentful is not configured. This is an optional feature - configure it in your environment variables when you're ready."
                  id="Contentful Item / Not configured description"
                />
              </p>
              <Link
                to={generateLocalePath(listPath)}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <FormattedMessage defaultMessage="Return to list" id="Contentful Item / Return to list" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

const ErrorState: FC<ErrorStateProps> = ({ error, onRetry, listPath, isRefetching }) => {
  const generateLocalePath = useGenerateLocalePath();

  // Check if this is a configuration/network error
  const isConfigError =
    (error && 'networkError' in error && error.networkError) ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch');

  if (isConfigError) {
    return <NotConfiguredState listPath={listPath} />;
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="space-y-4">
          <Link
            to={generateLocalePath(listPath)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to content items" id="Contentful Item / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Content Item" id="Contentful Item / Error Title" />
            </h1>
          </div>
        </div>

        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">
            <FormattedMessage
              defaultMessage="Unable to load content item"
              id="Contentful Item / Error title"
            />
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              <FormattedMessage
                defaultMessage="There was an error loading this item from Contentful."
                id="Contentful Item / Error description"
              />
            </p>
            {error.message && (
              <p className="text-xs font-mono bg-background/50 p-2 rounded border">
                {error.message}
              </p>
            )}
            <div className="flex gap-4">
              <button
                onClick={onRetry}
                disabled={isRefetching}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                <FormattedMessage defaultMessage="Try again" id="Contentful Item / Retry button" />
              </button>
              <a
                href="https://www.contentful.com/developers/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FormattedMessage defaultMessage="Documentation" id="Contentful Item / Docs link" />
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </PageLayout>
  );
};

export const DemoItem: FC<DemoItemProps> = ({ routesConfig }) => {
  const { id } = useParams<Params>() as Params;
  const { data, loading, error, refetch, networkStatus } = useQuery(demoItemQuery, {
    variables: { id },
    context: { schemaType: SchemaType.Contentful },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  const isRefetching = networkStatus === 4; // NetworkStatus.refetch
  const isLoading = loading && !isRefetching && !data && !error;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        listPath={routesConfig.list}
        isRefetching={isRefetching}
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DemoItemContent data={data} routesConfig={routesConfig} />
    </Suspense>
  );
};
