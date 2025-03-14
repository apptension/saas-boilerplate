import debounce from 'lodash.debounce';
import { X } from 'lucide-react';
import { filter, isEmpty } from 'ramda';
import { ChangeEvent, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button } from '../../../components/buttons';
import { cn } from '../../../lib/utils';
import { FilterValue } from '../table.types';
import { TableToolbarFacetedFilter } from '../tableToolbarFacetedFilter';
import { TableToolbarConfig, TableToolbarValues } from './tableToolbar.types';

export interface TableToolbarProps<T extends TableToolbarValues> extends HTMLAttributes<HTMLDivElement> {
  config?: TableToolbarConfig;
  values?: T;
  onUpdate: (values: T) => void;
  onReset: () => void;
}

export const TableToolbar = <T extends TableToolbarValues>({
  config = {},
  className,
  children,
  values,
  onUpdate,
  onReset,
  ...props
}: TableToolbarProps<T>) => {
  const intl = useIntl();

  const { enableSearch = true, filters } = config;
  const [search, setSearch] = useState(values?.search || '');

  useEffect(() => {
    setSearch(values?.search || '');
  }, [values?.search]);

   
  const handleUpdateParamsDebounced = useCallback(debounce(onUpdate, 800), [onUpdate]);

  const handleParamChange = useCallback(
    (name: string, value: FilterValue) => {
      const newValues = filter((item) => item !== undefined, { ...values, [name]: value }) as unknown as T;

      if (name === 'search') {
        setSearch(value as string);
        handleUpdateParamsDebounced(newValues);
        return;
      }

      onUpdate(newValues);
    },
    [onUpdate, values, handleUpdateParamsDebounced]
  );

  const handleSearchChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      handleParamChange('search', value === '' ? undefined : value);
    },
    [handleParamChange]
  );

  const notEmpty = !isEmpty(values);

  const renderSearch = () => {
    if (!enableSearch) return null;

    return (
      <input
        value={search}
        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-8 w-40 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 lg:w-64"
        placeholder={intl.formatMessage({
          defaultMessage: 'Search',
          id: 'DateTable / Table toolbar / Search default placeholder',
        })}
        onChange={handleSearchChange}
      />
    );
  };

  return (
    <div className={cn('flex w-full items-center justify-between gap-2 overflow-auto p-1', className)} {...props}>
      <div className="flex flex-1 items-center gap-2">
        {enableSearch && renderSearch()}
        {filters?.map((filter) => (
          <TableToolbarFacetedFilter
            key={filter.id}
            config={filter}
            onChange={handleParamChange}
            value={values?.[filter.id]}
          />
        ))}
        {notEmpty && (
          <Button aria-label="Reset filters" variant="ghost" className="h-8 px-2 lg:px-3" onClick={onReset}>
            <FormattedMessage id="Table Toolbar / Reset" defaultMessage="Reset" />
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};
