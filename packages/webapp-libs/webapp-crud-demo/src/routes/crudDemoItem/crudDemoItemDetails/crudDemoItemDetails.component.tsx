import { useQuery } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { ArrowLeft, Database } from 'lucide-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { RoutesConfig } from '../../../config/routes';

export const crudDemoItemDetailsQuery = gql(/* GraphQL */ `
  query crudDemoItemDetailsQuery($id: ID!, $tenantId: ID!) {
    crudDemoItem(id: $id, tenantId: $tenantId) {
      id
      name
    }
  }
`);

export const CrudDemoItemDetails = () => {
  type Params = {
    id: string;
  };
  const { id } = useParams<keyof Params>() as Params;
  const { data: currentTenant } = useCurrentTenant();
  const { toast } = useToast();
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const errorMessage = intl.formatMessage({
    id: 'CrudDemoItem / CrudDemoItemDetails / ErrorMessage',
    defaultMessage: 'Failed to load item details',
  });

  const { loading, data, error } = useQuery(crudDemoItemDetailsQuery, {
    variables: {
      id,
      tenantId: currentTenant?.id || '',
    },
    skip: !currentTenant,
  });

  useEffect(() => {
    if (error) {
      toast({ description: errorMessage, variant: 'destructive' });
      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    }
  }, [error, toast, navigate, errorMessage]);

  if (loading) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-48" />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const itemData = data?.crudDemoItem;

  if (!itemData) {
    return null;
  }

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Item Details',
          id: 'CrudDemoItemDetails / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateLocalePath(RoutesConfig.crudDemoItem.list)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to items" id="CrudDemoItemDetails / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{itemData.name}</h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="View item details" id="CrudDemoItemDetails / Description" />
          </Paragraph>
        </div>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <FormattedMessage defaultMessage="Item Information" id="CrudDemoItemDetails / Card title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Details about this CRUD example item"
                id="CrudDemoItemDetails / Card description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                <FormattedMessage defaultMessage="Name:" id="CrudDemoItemDetails / Name label" />
              </div>
              <Paragraph className="text-base font-semibold">{itemData.name}</Paragraph>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
