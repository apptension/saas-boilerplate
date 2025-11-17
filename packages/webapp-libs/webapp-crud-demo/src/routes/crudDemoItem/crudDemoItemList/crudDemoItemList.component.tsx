import { CrudDemoItemListQueryQuery, getFragmentData, gql, pageCursorsFragment } from '@sb/webapp-api-client/graphql';
import { usePagedPaginatedQuery } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { TableFooter } from '@sb/webapp-core/components/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { Database, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

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
  const intl = useIntl();
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <FormattedMessage id="CrudDemoItemList / Items title" defaultMessage="Items" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                id="CrudDemoItemList / Items description"
                defaultMessage="Manage your CRUD example items"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
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
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage id="CrudDemoItemList / Empty title" defaultMessage="No items yet" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              <FormattedMessage
                id="CrudDemoItemList / Empty description"
                defaultMessage="Get started by creating your first CRUD example item"
              />
            </p>
            <Link
              to={generateLocalePath(RoutesConfig.crudDemoItem.add)}
              variant={ButtonVariant.PRIMARY}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <FormattedMessage id="CrudDemoItemList / Add first item" defaultMessage="Add your first item" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'CRUD Example Items',
          id: 'CrudDemoItemList / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage id="CrudDemoItemList / Title" defaultMessage="CRUD Example Items" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              id="CrudDemoItemList / Subheader"
              defaultMessage="Interactive CRUD example to explore and understand features"
            />
          </Paragraph>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Link
            to={generateLocalePath(RoutesConfig.crudDemoItem.add)}
            variant={ButtonVariant.PRIMARY}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <ListSkeleton />
        ) : (
          <>
            {renderList()}
            {data?.allCrudDemoItems && data.allCrudDemoItems.edges.length > 0 && (
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
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};
