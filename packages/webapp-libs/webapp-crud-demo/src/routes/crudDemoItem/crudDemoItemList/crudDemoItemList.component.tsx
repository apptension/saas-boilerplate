import {
  CrudDemoItemListItemFragment,
  CrudDemoItemListQueryQuery,
  CrudDemoItemSort,
  getFragmentData,
  pageCursorsFragment,
} from '@sb/webapp-api-client/graphql';
import { usePagedPaginatedQuery } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import {
  DataTable,
  OnChangeFn,
  Row,
  SortingState,
  TableFooter,
  TableToolbar,
  TableToolbarConfig,
} from '@sb/webapp-core/components/table';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { columns } from './columns';
import { crudDemoItemListQuery } from './crudDemoItemList.graphql';

type CrudDemoItemListSearchParams = {
  search?: string;
  sort?: CrudDemoItemSort;
  cursor?: string;
  pageSize?: string;
};

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { data: currentTenant } = useCurrentTenant();
  const generateTenantPath = useGenerateTenantPath();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const toolbarConfig: TableToolbarConfig = {
    enableSearch: true,
  };

  const {
    data,
    loading,
    pageSize,
    onPageClick,
    handlePageSizeChange,
    toolbarSearchParams,
    onSearchReset,
    onSearchChangeWithCursorClear,
  } = usePagedPaginatedQuery<
    CrudDemoItemListQueryQuery,
    { tenantId: string } & Omit<CrudDemoItemListSearchParams, 'cursor'>,
    CrudDemoItemListSearchParams,
    typeof crudDemoItemListQuery
  >(crudDemoItemListQuery, {
    hookOptions: {
      variables: {
        tenantId: currentTenant?.id ?? '',
        sort: sorting[0]?.desc && sorting[0]?.id === 'name' ? CrudDemoItemSort.NAME_DESC : CrudDemoItemSort.NAME_ASC,
      },
      skip: !currentTenant,
    },
    transformVariables: (params) => ({
      search: params?.search as string,
    }),
    dataKey: 'allCrudDemoItems',
  });
  const pageCursors = getFragmentData(pageCursorsFragment, data?.allCrudDemoItems?.pageCursors);
  const dataList = data?.allCrudDemoItems?.edges.map((edge) => edge?.node as CrudDemoItemListItemFragment) || [];
  const handleRowClick = (row: Row<CrudDemoItemListItemFragment>) => {
    navigate(generateTenantPath(RoutesConfig.crudDemoItem.details, { id: row.getValue('id') }));
  };
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(typeof updater === 'function' ? updater(sorting) : updater);
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

      <TableToolbar
        onUpdate={onSearchChangeWithCursorClear}
        onReset={onSearchReset}
        values={toolbarSearchParams}
        config={toolbarConfig}
      />
      <DataTable
        data={dataList}
        columns={columns}
        onRowClick={handleRowClick}
        onSortingChange={handleSortingChange}
        sorting={sorting}
        isLoading={loading}
      />
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
    </PageLayout>
  );
};
