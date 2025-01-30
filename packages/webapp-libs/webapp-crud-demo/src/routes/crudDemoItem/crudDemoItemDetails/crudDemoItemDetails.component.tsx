import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Separator } from '@sb/webapp-core/components/separator';
import { Skeleton } from '@sb/webapp-core/components/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';

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
  const notFoundMessage = intl.formatMessage({
    id: 'CrudDemoItem / CrudDemoItemDetails / NotFoundMessage',
    defaultMessage: 'The requested item does not exist',
  });

  const { loading, data } = useQuery(crudDemoItemDetailsQuery, {
    variables: {
      id,
      tenantId: currentTenant?.id || '',
    },
    onError: (error) => {
      if (error.message.includes('No CrudDemoItem matches the given query')) {
        toast({ description: notFoundMessage, variant: 'destructive' });
      } else {
        toast({ description: errorMessage, variant: 'destructive' });
      }
      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    },
    skip: !currentTenant,
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="flex w-full justify-between items-center">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-8" />
        </div>
        <Separator />
      </PageLayout>
    );
  }

  const itemData = data?.crudDemoItem;

  return (
    <PageLayout>
      <PageHeadline hasBackButton header={itemData?.name} />
    </PageLayout>
  );
};
