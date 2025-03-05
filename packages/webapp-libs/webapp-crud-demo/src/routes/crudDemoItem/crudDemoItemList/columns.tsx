import { CrudDemoItemListItemFragment, CurrentUserType, TenantType } from '@sb/webapp-api-client';
import { ColumnDef, DataTableColumnHeader } from '@sb/webapp-core/components/table';
import { FormattedMessage } from 'react-intl';

import { CrudDemoItemListRowActions } from './crudDemoItemListRowActions';

export const columns: ColumnDef<CrudDemoItemListItemFragment>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={<FormattedMessage defaultMessage="Id" id="CrudDemoItemList / Table / Id" />}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue('id')}</span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={<FormattedMessage defaultMessage="Name" id="CrudDemoItemList / Table / Name" />}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={<FormattedMessage defaultMessage="Created by" id="CrudDemoItemList / Table / Created By" />}
      />
    ),
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as CurrentUserType;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {createdBy.firstName} {createdBy.lastName!}
          </span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'tenant',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={<FormattedMessage defaultMessage="Organization" id="CrudDemoItemList / Table / Organization" />}
      />
    ),
    cell: ({ row }) => {
      const tenant = row.getValue('tenant') as TenantType;

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{tenant.name}</span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <CrudDemoItemListRowActions id={row.original.id} />,
  },
];
