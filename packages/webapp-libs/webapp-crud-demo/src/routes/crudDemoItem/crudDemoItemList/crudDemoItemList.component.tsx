import {
  CrudDemoItemListItemFragment,
  CrudDemoItemListQueryQuery,
  getFragmentData,
  gql,
  pageCursorsFragment,
} from '@sb/webapp-api-client/graphql';
import { usePagedPaginatedQuery } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { TableFooter } from '@sb/webapp-core/components/table';
import { DataTable, Row } from '@sb/webapp-core/components/table/dataTable';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { PlusCircle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { columns } from './columns';
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
  const generateTenantPath = useGenerateTenantPath();
  const navigate = useNavigate();

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
  const dataList = data?.allCrudDemoItems?.edges.map((edge) => edge?.node as CrudDemoItemListItemFragment) || [];
  const handleRowClick = (row: Row<CrudDemoItemListItemFragment>) => {
    navigate(generateTenantPath(RoutesConfig.crudDemoItem.details, { id: row.getValue('id') }));
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
          <DataTable data={dataList} columns={columns} onRowClick={handleRowClick} />
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
