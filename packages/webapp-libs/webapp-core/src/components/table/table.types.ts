import '@tanstack/react-table';
import { RowData } from '@tanstack/react-table';

export enum TABLE_FILTER_TYPES {
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

export type FilterValue = string | boolean | string[] | undefined;

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
  }
}
