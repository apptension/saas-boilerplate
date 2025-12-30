import { useQuery } from '@apollo/client/react';
import { ApolloErrorLike } from '@sb/webapp-api-client/api/apolloError.types';
import { SchemaType } from '@sb/webapp-api-client';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardHeader } from '@sb/webapp-core/components/ui/card';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { AlertCircle, ExternalLink, FileText, Info, RefreshCw, Scale } from 'lucide-react';
import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import ReactMarkdown from 'react-markdown';

import { configContentfulAppQuery } from '../../config';

const LoadingSkeleton = () => (
  <PageLayout>
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-6 w-96" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  </PageLayout>
);

type NotConfiguredStateProps = {
  onRetry?: () => void;
  isRefetching?: boolean;
};

const NotConfiguredState: FC<NotConfiguredStateProps> = ({ onRetry, isRefetching }) => {
  const envFilePath = 'packages/webapp/.env';
  const docsUrl =
    'https://docs.demo.saas.apptension.com/working-with-sb/contentful/configure-contentful-integration';

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Terms and Conditions" id="Terms And Conditions / Title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Legal terms for using our service"
              id="Terms And Conditions / Description"
            />
          </Paragraph>
        </div>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4 mb-4">
                <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <FormattedMessage
                  defaultMessage="Contentful Integration Not Configured"
                  id="Terms And Conditions / Not configured title"
                />
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg">
                <FormattedMessage
                  defaultMessage="This page displays content managed via Contentful CMS. To enable it, you need to configure the Contentful integration."
                  id="Terms And Conditions / Not configured description"
                />
              </p>

              <div className="w-full max-w-lg text-left space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    <FormattedMessage
                      defaultMessage="Quick Setup"
                      id="Terms And Conditions / Quick setup title"
                    />
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                    <li>
                      <FormattedMessage
                        defaultMessage="Create a Contentful account and space at {link}"
                        id="Terms And Conditions / Setup step 1"
                        values={{
                          link: (
                            <a
                              href="https://www.contentful.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              contentful.com
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ),
                        }}
                      />
                    </li>
                    <li>
                      <FormattedMessage
                        defaultMessage="Add these environment variables to {file}:"
                        id="Terms And Conditions / Setup step 2"
                        values={{
                          file: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{envFilePath}</code>,
                        }}
                      />
                      <code className="block mt-2 ml-4 p-3 bg-muted rounded text-xs font-mono whitespace-pre">
                        VITE_CONTENTFUL_SPACE=your_space_id{'\n'}
                        VITE_CONTENTFUL_TOKEN=your_access_token{'\n'}
                        VITE_CONTENTFUL_ENV=master
                      </code>
                    </li>
                    <li>
                      <FormattedMessage
                        defaultMessage="Create an AppConfig content type with a 'termsAndConditions' field (Long text, Markdown)"
                        id="Terms And Conditions / Setup step 3"
                      />
                    </li>
                    <li>
                      <FormattedMessage
                        defaultMessage="Restart the development server"
                        id="Terms And Conditions / Setup step 4"
                      />
                    </li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      disabled={isRefetching}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                      <FormattedMessage defaultMessage="Retry" id="Terms And Conditions / Retry button" />
                    </button>
                  )}
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <FormattedMessage
                      defaultMessage="View Full Documentation"
                      id="Terms And Conditions / Docs link"
                    />
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

type ErrorStateProps = {
  error: Error | ApolloErrorLike;
  onRetry: () => void;
  isRefetching: boolean;
};

const ErrorState: FC<ErrorStateProps> = ({ error, onRetry, isRefetching }) => {
  // Check if this is a configuration/network error (Contentful not set up)
  // Only check network errors - don't check env vars here as that's a build-time concern
  const apolloError = error as ApolloErrorLike;
  const isNetworkError =
    apolloError?.networkError ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch');

  if (isNetworkError) {
    return <NotConfiguredState onRetry={onRetry} isRefetching={isRefetching} />;
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Terms and Conditions" id="Terms And Conditions / Title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Legal terms for using our service"
              id="Terms And Conditions / Description"
            />
          </Paragraph>
        </div>

        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">
            <FormattedMessage
              defaultMessage="Unable to load terms and conditions"
              id="Terms And Conditions / Error title"
            />
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              <FormattedMessage
                defaultMessage="There was an error loading this content from Contentful."
                id="Terms And Conditions / Error description"
              />
            </p>
            {error.message && (
              <p className="text-xs font-mono bg-background/50 p-2 rounded border">{error.message}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={onRetry}
                disabled={isRefetching}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                <FormattedMessage defaultMessage="Try again" id="Terms And Conditions / Retry button" />
              </button>
              <a
                href="https://www.contentful.com/developers/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm hover:underline"
              >
                <FormattedMessage defaultMessage="Contentful Documentation" id="Terms And Conditions / Docs link" />
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </PageLayout>
  );
};

type ContentStateProps = {
  markdown: string;
};

const ContentState: FC<ContentStateProps> = ({ markdown }) => {
  const intl = useIntl();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Terms and Conditions',
          id: 'Terms And Conditions / Page title',
        })}
      />
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Terms and Conditions" id="Terms And Conditions / Title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Legal terms for using our service"
              id="Terms And Conditions / Description"
            />
          </Paragraph>
        </div>

        <Card>
          <CardContent className="py-6">
            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
              {markdown}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

const EmptyContentState: FC = () => {
  const intl = useIntl();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Terms and Conditions',
          id: 'Terms And Conditions / Page title',
        })}
      />
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Terms and Conditions" id="Terms And Conditions / Title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Legal terms for using our service"
              id="Terms And Conditions / Description"
            />
          </Paragraph>
        </div>

        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-4 mb-4">
                <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <FormattedMessage
                  defaultMessage="No Content Available"
                  id="Terms And Conditions / Empty title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                <FormattedMessage
                  defaultMessage="The terms and conditions content hasn't been added yet. Please add content to the 'termsAndConditions' field in your Contentful AppConfig entry."
                  id="Terms And Conditions / Empty description"
                />
              </p>
              <a
                href="https://app.contentful.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <FormattedMessage defaultMessage="Open Contentful" id="Terms And Conditions / Open Contentful" />
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export const TermsAndConditions = () => {
  const { data, loading, error, refetch, networkStatus } = useQuery(configContentfulAppQuery, {
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
    return <ErrorState error={error} onRetry={() => refetch()} isRefetching={isRefetching} />;
  }

  const markdown = data?.appConfigCollection?.items?.[0]?.termsAndConditions;

  if (!markdown) {
    return <EmptyContentState />;
  }

  return <ContentState markdown={markdown} />;
};
