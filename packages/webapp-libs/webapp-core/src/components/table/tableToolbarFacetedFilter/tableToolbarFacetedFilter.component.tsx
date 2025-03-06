import { Check, PlusCircle, X } from 'lucide-react';
import { cond, equals } from 'ramda';
import { FormattedMessage } from 'react-intl';

import { Button } from '@sb/webapp-core/components/buttons';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@sb/webapp-core/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/ui/popover';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { Switch } from '@sb/webapp-core/components/ui/switch';
import { cn } from '@sb/webapp-core/lib/utils';

import { FilterValue, TABLE_FILTER_TYPES } from '../table.types';
import { TableToolbarFilterConfig } from '../tableToolbar/tableToolbar.types';

export interface TableToolbarFacetedFilterProps {
  value: FilterValue;
  config: TableToolbarFilterConfig;
  onChange: (id: string, value: FilterValue) => void;
}

export const TableToolbarFacetedFilter = ({ config, value, onChange }: TableToolbarFacetedFilterProps) => {
  const { type, options } = config;

  const renderBooleanSelection = () => {
    if (value === undefined) return null;
    const checked = typeof value === 'boolean' ? value : value === 'true';
    return (
      <>
        <Separator orientation="vertical" className="mx-2 h-4" />
        {checked ? (
          <Check className="text-primary size-4" data-testid="checked" />
        ) : (
          <X className="text-primary size-4" data-testid="not-checked" />
        )}
      </>
    );
  };

  const renderBooleanPopover = () => {
    const controlId = `filter-switch-${config.id}`;
    const checked = typeof value === 'boolean' ? value : value === 'true';
    return (
      <div>
        <div className="flex flex-row items-center p-3">
          <Switch
            id={controlId}
            checked={checked}
            onCheckedChange={(checked) => {
              onChange(config.id, checked ? checked : undefined);
            }}
          />
          <label
            htmlFor={controlId}
            className="pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {config.switchLabel || config.label}
          </label>
        </div>
      </div>
    );
  };

  const renderSelectSelection = () => {
    if (value === undefined) return null;

    const v = Array.isArray(value) ? value : ([value] as string[]);
    const selectedOptions = options?.filter((option) => v?.includes(option.value as string));

    if (!selectedOptions?.length) return null;

    return (
      <>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
          {selectedOptions.length}
        </Badge>
        <div className="hidden space-x-1 lg:flex">
          {selectedOptions.length > 2 ? (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {selectedOptions.length} selected
            </Badge>
          ) : (
            selectedOptions.map((option) => (
              <Badge variant="secondary" key={option.label} className="rounded-sm px-1 font-normal">
                {option.label}
              </Badge>
            ))
          )}
        </div>
      </>
    );
  };

  const renderSelectPopover = () => {
    const v = Array.isArray(value) ? value : ([value] as string[]);
    const selectedOptions = options?.filter((option) => v?.includes(option.value as string)) || [];
    const selectedValues = selectedOptions.map((option) => option.value);

    return (
      <Command>
        <CommandInput placeholder={config.label} />
        <CommandList className="max-h-full">
          <CommandEmpty>
            <FormattedMessage id="TableToolbarFacetedFilter / No results" defaultMessage="No results found." />
          </CommandEmpty>
          <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
            {options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <CommandItem
                  key={option.value as string}
                  onSelect={() => {
                    if (isSelected) {
                      onChange(config.id, selectedValues.filter((v) => v !== option.value) as string[]);
                    } else {
                      onChange(config.id, [...selectedValues, option.value] as string[]);
                    }
                  }}
                >
                  <div
                    className={cn(
                      'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                      isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className="size-4" aria-hidden="true" />
                  </div>
                  {option.icon && <option.icon className="text-muted-foreground mr-2 size-4" aria-hidden="true" />}
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          {(selectedOptions?.length || 0) > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => onChange(config.id, undefined)} className="justify-center text-center">
                  <FormattedMessage id="TableToolbarFacetedFilter / Clear filters" defaultMessage="Clear filters" />
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 size-4" />
          {config.label}
          {cond([[equals(TABLE_FILTER_TYPES.BOOLEAN), renderBooleanSelection]])(type)}
          {cond([[equals(TABLE_FILTER_TYPES.SELECT), renderSelectSelection]])(type)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        {cond([[equals(TABLE_FILTER_TYPES.BOOLEAN), renderBooleanPopover]])(type)}
        {cond([[equals(TABLE_FILTER_TYPES.SELECT), renderSelectPopover]])(type)}
      </PopoverContent>
    </Popover>
  );
};
