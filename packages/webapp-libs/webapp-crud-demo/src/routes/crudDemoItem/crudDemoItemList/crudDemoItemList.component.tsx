import { CrudDemoItemListQueryQuery, gql } from '@sb/webapp-api-client/graphql';
import { usePaginatedQuery } from '@sb/webapp-api-client/hooks';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Pagination } from '@sb/webapp-core/components/pagination';
import { Card, CardContent } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { PlusCircle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemListItem } from './crudDemoItemListItem';
import { ListSkeleton } from './listSkeleton';

export const crudDemoItemListQuery = gql(/* GraphQL */ `
  query crudDemoItemListQuery($tenantId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
    allCrudDemoItems(tenantId: $tenantId, first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          ...crudDemoItemListItem
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`);
export const ITEMS_PER_PAGE = 8;

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { data: currentTenant } = useCurrentTenant();

  const { data, loading, hasNext, hasPrevious, loadNext, loadPrevious } = usePaginatedQuery<
    CrudDemoItemListQueryQuery,
    { tenantId: string },
    typeof crudDemoItemListQuery
  >(crudDemoItemListQuery, {
    hookOptions: {
      variables: {
        first: ITEMS_PER_PAGE,
        tenantId: currentTenant?.id ?? '',
      },
      skip: !currentTenant,
    },
    dataKey: 'allCrudDemoItems',
  });

  const renderList = () => {
    if (data) {
      if (data.allCrudDemoItems && data.allCrudDemoItems.edges.length <= 0) return renderEmptyList();

      return (
        <Card className="mt-4">
          <CardContent>
            <ul className="w-full mt-4 rounded [&>li]:border-b [&>li:last-child]:border-none">
              {mapConnection(
                (node) => (
                  <CrudDemoItemListItem item={node} key={node.id} />
                ),
                data.allCrudDemoItems
              )}
            </ul>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderEmptyList = () => {
    return (
      <Card className="mt-4">
        <CardContent>
          <ul className="flex items-center justify-center w-full mt-4 rounded [&>li]:border-b [&>li]:border-slate-200 [&>li:last-child]:border-none">
            <li className="py-16">
              <h3 className="text-muted-foreground">
                <FormattedMessage id="CrudDemoItemList / Headline" defaultMessage="Empty list" />
              </h3>
            </li>
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage id="CrudDemoItemList / Title" defaultMessage="CRUD Example Items" />}
        subheader={
          <FormattedMessage
            id="CrudDemoItemList / Subheader"
            defaultMessage="Interactive CRUD example to explore and understand features"
          />
        }
      />

      <Link
        to={generateLocalePath(RoutesConfig.crudDemoItem.add)}
        variant={ButtonVariant.PRIMARY}
        icon={<PlusCircle className="mr-2 h-4 w-4" />}
      >
        <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
      </Link>

      {loading ? (
        <ListSkeleton />
      ) : (
        <>
          {renderList()}
          <Pagination hasNext={hasNext} hasPrevious={hasPrevious} loadNext={loadNext} loadPrevious={loadPrevious} />
        </>
      )}
    </PageLayout>
  );
};
