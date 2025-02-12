import { CrudDemoItemListQueryQuery, getFragmentData, gql, pageCursorsFragment } from '@sb/webapp-api-client/graphql';
import { usePagedPaginatedQuery } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { TableFooter } from '@sb/webapp-core/components/table';
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
  query CrudDemoItemListQuery($tenantId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
    allCrudDemoItems(tenantId: $tenantId, first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          ...crudDemoItemListItem
        }
      }
      pageCursors {
        ...pageCursorsFragment
      }
    }
  }
`);

type CrudDemoItemListSearchParams = {
  cursor?: string;
  pageSize?: string;
};

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { data: currentTenant } = useCurrentTenant();

  const { data, loading, pageSize, onPageClick, handlePageSizeChange } = usePagedPaginatedQuery<
    CrudDemoItemListQueryQuery,
    { tenantId: string } & Omit<CrudDemoItemListSearchParams, 'cursor'>,
    CrudDemoItemListSearchParams,
    typeof crudDemoItemListQuery
  >(crudDemoItemListQuery, {
    hookOptions: {
      variables: {
        tenantId: currentTenant?.id ?? '',
      },
      skip: !currentTenant,
    },
    dataKey: 'allCrudDemoItems',
  });
  const pageCursors = getFragmentData(pageCursorsFragment, data?.allCrudDemoItems?.pageCursors);

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
          <TableFooter
            pageSize={pageSize}
            pagination={{
              around: pageCursors?.around,
              first: pageCursors?.first,
              last: pageCursors?.last,
              next: pageCursors?.next,
              previous: pageCursors?.previous,
              onPageClick: onPageClick,
            }}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </PageLayout>
  );
};
