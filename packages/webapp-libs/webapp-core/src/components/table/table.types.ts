export enum TABLE_FILTER_TYPES {
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

export type FilterValue = string | boolean | string[] | undefined;
