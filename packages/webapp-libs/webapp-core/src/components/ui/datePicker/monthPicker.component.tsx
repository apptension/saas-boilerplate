'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { cn } from '../../../lib/utils';
import { Button } from '../../buttons';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

export interface MonthPickerProps {
  /** The selected month as YYYY-MM string (e.g., "2026-01") */
  value?: string;
  /** Callback when month changes - returns YYYY-MM string or undefined if cleared */
  onChange?: (value: string | undefined) => void;
  /** Placeholder text when no month selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Align popover */
  align?: 'start' | 'center' | 'end';
  /** Whether to show the clear button */
  clearable?: boolean;
  /** Date format for display (default: "MMM yyyy") */
  displayFormat?: string;
  /** Minimum selectable year */
  minYear?: number;
  /** Maximum selectable year */
  maxYear?: number;
  /** Name attribute for form integration */
  name?: string;
  /** ID attribute */
  id?: string;
}

/**
 * Parse a YYYY-MM value into year and month
 */
function parseValue(value: string | undefined): { year: number; month: number } | undefined {
  if (!value) return undefined;
  
  // Try YYYY-MM format
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Convert to 0-indexed
    if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11) {
      return { year, month };
    }
  }
  
  return undefined;
}

/**
 * Format year and month to YYYY-MM string
 */
function formatOutput(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * MonthPicker - A month picker component for selecting year and month only.
 */
export function MonthPicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  align = 'start',
  clearable = true,
  displayFormat = 'MMM yyyy',
  minYear,
  maxYear,
  name,
  id,
}: MonthPickerProps) {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: intl.formatDate(new Date(2022, i, 1), { month: 'short' }),
      fullLabel: intl.formatDate(new Date(2022, i, 1), { month: 'long' }),
    }));
  }, [intl]);

  const resolvedPlaceholder = placeholder ?? intl.formatMessage({ id: 'MonthPicker / Placeholder', defaultMessage: 'Select month' });

  const parsed = useMemo(() => parseValue(value), [value]);
  
  // Current viewing year in the picker (may differ from selected year)
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState<number>(() => parsed?.year ?? currentYear);
  
  // Computed min/max years
  const effectiveMinYear = minYear ?? currentYear - 10;
  const effectiveMaxYear = maxYear ?? currentYear + 10;
  
  // Sync view year when popover opens
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen && parsed) {
      setViewYear(parsed.year);
    } else if (isOpen) {
      setViewYear(currentYear);
    }
    setOpen(isOpen);
  }, [parsed, currentYear]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    const outputValue = formatOutput(viewYear, monthIndex);
    onChange?.(outputValue);
    setOpen(false);
  }, [onChange, viewYear]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  }, [onChange]);

  const handlePrevYear = useCallback(() => {
    setViewYear((y) => Math.max(effectiveMinYear, y - 1));
  }, [effectiveMinYear]);

  const handleNextYear = useCallback(() => {
    setViewYear((y) => Math.min(effectiveMaxYear, y + 1));
  }, [effectiveMaxYear]);

  const handleThisMonth = useCallback(() => {
    const now = new Date();
    const outputValue = formatOutput(now.getFullYear(), now.getMonth());
    onChange?.(outputValue);
    setOpen(false);
  }, [onChange]);

  const displayText = useMemo(() => {
    if (!parsed) return resolvedPlaceholder;
    const date = new Date(parsed.year, parsed.month, 1);
    return format(date, displayFormat);
  }, [parsed, resolvedPlaceholder, displayFormat]);

  // Check if a month is selected
  const isSelected = useCallback((monthIndex: number) => {
    return parsed?.year === viewYear && parsed?.month === monthIndex;
  }, [parsed, viewYear]);

  // Check if current month
  const isCurrentMonth = useCallback((monthIndex: number) => {
    const now = new Date();
    return viewYear === now.getFullYear() && monthIndex === now.getMonth();
  }, [viewYear]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            'group justify-between text-left font-normal gap-2 transition-colors duration-150 w-full',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'focus-visible:ring-offset-0',
            !parsed && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {displayText}
            </span>
          </div>
          {clearable && parsed && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
              aria-label={intl.formatMessage({ id: 'MonthPicker / Clear month', defaultMessage: 'Clear month' })}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </span>
          )}
          {/* Hidden input for form submission */}
          <input
            type="hidden"
            name={name}
            value={value ?? ''}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0 shadow-lg border-border/80"
        align={align}
        sideOffset={4}
      >
        {/* Year Navigation */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevYear}
            disabled={viewYear <= effectiveMinYear}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only"><FormattedMessage id="MonthPicker / Previous year" defaultMessage="Previous year" /></span>
          </Button>
          <span className="text-sm font-semibold">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleNextYear}
            disabled={viewYear >= effectiveMaxYear}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only"><FormattedMessage id="MonthPicker / Next year" defaultMessage="Next year" /></span>
          </Button>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => (
              <Button
                key={month.value}
                type="button"
                variant={isSelected(month.value) ? 'default' : 'ghost'}
                className={cn(
                  'h-9 text-sm font-medium',
                  isSelected(month.value) && 'bg-primary text-primary-foreground',
                  !isSelected(month.value) && isCurrentMonth(month.value) && 'bg-accent text-accent-foreground',
                  !isSelected(month.value) && !isCurrentMonth(month.value) && 'hover:bg-muted'
                )}
                onClick={() => handleMonthSelect(month.value)}
              >
                {month.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-neutral-50 dark:bg-neutral-900">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleThisMonth}
            className="text-xs h-7"
          >
            <FormattedMessage id="MonthPicker / This month" defaultMessage="This month" />
          </Button>
          {clearable && parsed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined);
                setOpen(false);
              }}
              className="text-xs text-muted-foreground h-7"
            >
              <FormattedMessage id="MonthPicker / Clear" defaultMessage="Clear" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

MonthPicker.displayName = 'MonthPicker';
