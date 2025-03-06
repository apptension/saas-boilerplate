import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  SortingState,
  TableMeta,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { times } from 'ramda';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { cn } from '../../../lib/utils';
import { Skeleton } from '../../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  skeletonRowContent?: ReactNode;
  meta?: TableMeta<TData>;
  onRowClick?: (row: Row<TData>) => void;
  onSortingChange?: OnChangeFn<SortingState>;
  sorting?: SortingState;
  emptyMessage?: string;
}

const SKELETON_ROWS_AMOUNT = 3;

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  skeletonRowContent,
  meta,
  sorting,
  onSortingChange,
  onRowClick,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    meta,
  });

  const renderRows = () => {
    if (isLoading) {
      return times((index) => {
        return (
          <TableRow key={index}>
            {skeletonRowContent ? (
              skeletonRowContent
            ) : (
              <>
                <TableCell colSpan={columns.length - 1} className="p-[22px] text-center">
                  <Skeleton className="h-5" />
                </TableCell>
                <TableCell className="p-[22px] text-center">
                  <Skeleton className="h-5" />
                </TableCell>
              </>
            )}
          </TableRow>
        );
      }, SKELETON_ROWS_AMOUNT);
    }

    return table.getRowModel().rows?.length ? (
      table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          onClick={() => {
            onRowClick?.(row);
          }}
          className={cn('h-12', onRowClick && 'cursor-pointer')}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {emptyMessage ?? <FormattedMessage id="DataTable / Empty state message" defaultMessage="No results" />}
        </TableCell>
      </TableRow>
    );
  };

  const renderHeader = () => {
    return table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          return (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              className={cn([header.column.columnDef.meta?.headerClassName])}
            >
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          );
        })}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>{renderHeader()}</TableHeader>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>
    </div>
  );
}
