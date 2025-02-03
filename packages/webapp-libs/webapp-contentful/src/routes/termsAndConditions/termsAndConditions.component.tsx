import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client';
import { MarkdownPage } from '@sb/webapp-core/components/markdownPage';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { configContentfulAppQuery } from '../../config';

export const TermsAndConditions = () => {
  const { data, loading } = useQuery(configContentfulAppQuery, {
    context: { schemaType: SchemaType.Contentful },
  });

  if (loading) {
    return null;
  }
  return (
    <PageLayout className="lg:max-w-4xl">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Static pages</AlertTitle>
        <AlertDescription className="space-y-4">
          <div>This is an example of the static page with the content managed via Contentful CMS.</div>
        </AlertDescription>
      </Alert>
      <MarkdownPage markdown={data?.appConfigCollection?.items?.[0]?.termsAndConditions} />
    </PageLayout>
  );
};
