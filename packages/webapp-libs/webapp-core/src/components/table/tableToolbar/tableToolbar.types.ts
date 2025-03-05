import { ComponentType } from 'react';

import { FilterValue, TABLE_FILTER_TYPES } from '../table.types';

export interface TableToolbarValues {
  search?: string;
  date?: string;
  [key: string]: FilterValue;
}
export interface TableToolbarFilterConfig {
  id: string;
  label: string;
  type: TABLE_FILTER_TYPES;
  options?: { label: string; value: FilterValue; icon?: ComponentType<{ className?: string }> }[];
  switchLabel?: string;
}

export interface TableToolbarConfig {
  enableSearch?: boolean;
  enableDatePicker?: boolean;
  filters?: TableToolbarFilterConfig[];
}
