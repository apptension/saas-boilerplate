'use client';

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { format, parseISO, isValid, isBefore, isAfter, startOfDay } from 'date-fns';
import { CalendarIcon, X, ArrowRight, AlertCircle } from 'lucide-react';
import { useIntl } from 'react-intl';
import type { DateRange } from 'react-day-picker';

import { cn } from '../../../lib/utils';
import { Button } from '../../buttons';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar } from '../calendar';

export interface FormDateRangePickerProps {
  /** Start date value as ISO string (YYYY-MM-DD) */
  startValue?: string;
  /** End date value as ISO string (YYYY-MM-DD) */
  endValue?: string;
  /** Callback when start date changes */
  onStartChange?: (value: string | undefined) => void;
  /** Callback when end date changes */
  onEndChange?: (value: string | undefined) => void;
  /** Placeholder text when no dates selected */
  placeholder?: string;
  /** Start date placeholder */
  startPlaceholder?: string;
  /** End date placeholder */
  endPlaceholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Align popover */
  align?: 'start' | 'center' | 'end';
  /** Whether to show the clear button */
  clearable?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether start date is required */
  startRequired?: boolean;
  /** Whether end date is required */
  endRequired?: boolean;
  /** Label for start date */
  startLabel?: string;
  /** Label for end date */
  endLabel?: string;
  /** Show validation error state */
  hasError?: boolean;
  /** Custom validation error message */
  errorMessage?: string;
}

/**
 * Parse a value (string or Date) into a Date object.
 * Uses parseISO for ISO strings to avoid timezone issues.
 */
function parseValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
function formatOutput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * FormDateRangePicker - A date range picker designed for forms.
 * 
 * Features:
 * - Works with two separate form fields (start/end) for API compatibility
 * - Single UI control for selecting date ranges
 * - Built-in start ≤ end validation
 * - Graceful handling of partial selections
 * - Compact trigger showing both dates with arrow
 */
export function FormDateRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  placeholder,
  startPlaceholder,
  endPlaceholder,
  className,
  disabled = false,
  align = 'start',
  clearable = true,
  minDate,
  maxDate,
  startRequired = false,
  endRequired = false,
  startLabel,
  endLabel,
  hasError = false,
  errorMessage,
}: FormDateRangePickerProps) {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const resolvedPlaceholder = placeholder ?? intl.formatMessage({ id: 'FormDateRangePicker / Placeholder', defaultMessage: 'Select date range' });
  const resolvedStartPlaceholder = startPlaceholder ?? intl.formatMessage({ id: 'FormDateRangePicker / Start placeholder', defaultMessage: 'Start' });
  const resolvedEndPlaceholder = endPlaceholder ?? intl.formatMessage({ id: 'FormDateRangePicker / End placeholder', defaultMessage: 'End' });

  // Parse the values into Dates
  const startDate = useMemo(() => parseValue(startValue), [startValue]);
  const endDate = useMemo(() => parseValue(endValue), [endValue]);

  // Track temporary range during selection
  const [tempRange, setTempRange] = useState<DateRange | undefined>(() => {
    if (startDate || endDate) {
      return { from: startDate, to: endDate };
    }
    return undefined;
  });

  // Sync temp range when popover opens
  useEffect(() => {
    if (open) {
      setTempRange(startDate || endDate ? { from: startDate, to: endDate } : undefined);
    }
  }, [open, startDate, endDate]);

  // Validation: check if end is before start
  const hasValidationError = useMemo(() => {
    if (startDate && endDate) {
      return isBefore(startOfDay(endDate), startOfDay(startDate));
    }
    return false;
  }, [startDate, endDate]);

  // Handle range selection from calendar
  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    setTempRange(range);
  }, []);

  // Apply the selected range
  const handleApply = useCallback(() => {
    if (tempRange?.from) {
      onStartChange?.(formatOutput(tempRange.from));
    } else {
      onStartChange?.(undefined);
    }
    
    if (tempRange?.to) {
      onEndChange?.(formatOutput(tempRange.to));
    } else {
      onEndChange?.(undefined);
    }
    
    setOpen(false);
  }, [tempRange, onStartChange, onEndChange]);

  // Clear both dates
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStartChange?.(undefined);
    onEndChange?.(undefined);
    setTempRange(undefined);
  }, [onStartChange, onEndChange]);

  // Clear temp range in popover
  const handleClearTemp = useCallback(() => {
    setTempRange(undefined);
  }, []);

  // Format date for display
  const formatDateDisplay = useCallback((date: Date | undefined, placeholderText: string) => {
    if (!date) return placeholderText;
    return format(date, 'dd MMM yyyy');
  }, []);

  // Get display text for trigger
  const displayText = useMemo(() => {
    if (!startDate && !endDate) return resolvedPlaceholder;
    return null; // We'll show structured display instead
  }, [startDate, endDate, resolvedPlaceholder]);

  // Check if we can apply (at least one date selected)
  const canApply = tempRange?.from || tempRange?.to;

  // Determine the month to show in the calendar
  const defaultMonth = useMemo(() => {
    return tempRange?.from ?? tempRange?.to ?? startDate ?? endDate ?? new Date();
  }, [tempRange, startDate, endDate]);

  const showError = hasError || hasValidationError;
  const displayError = errorMessage || (hasValidationError ? intl.formatMessage({ id: 'FormDateRangePicker / End date validation', defaultMessage: 'End date must be on or after start date' }) : undefined);

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(
              'group justify-between text-left font-normal gap-2 transition-colors duration-150 w-full min-h-[40px]',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'focus-visible:ring-offset-0',
              showError && 'border-destructive',
              !startDate && !endDate && 'text-muted-foreground',
              className
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              {displayText ? (
                <span className="truncate">{displayText}</span>
              ) : (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className={cn(
                    'truncate',
                    !startDate && 'text-muted-foreground'
                  )}>
                    {formatDateDisplay(startDate, resolvedStartPlaceholder)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className={cn(
                    'truncate',
                    !endDate && 'text-muted-foreground'
                  )}>
                    {formatDateDisplay(endDate, resolvedEndPlaceholder)}
                  </span>
                </div>
              )}
            </div>
            {clearable && (startDate || endDate) && !disabled && (
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
                aria-label={intl.formatMessage({ id: 'FormDateRangePicker / Clear dates', defaultMessage: 'Clear dates' })}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-lg border-border/80"
          align={align}
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={16}
          sticky="partial"
        >
          {/* Header with selection display and actions */}
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-neutral-50 dark:bg-neutral-900">
            {/* Current selection */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className={cn(
                'font-medium',
                !tempRange?.from && 'text-muted-foreground'
              )}>
                {tempRange?.from ? format(tempRange.from, 'dd MMM') : '—'}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className={cn(
                'font-medium',
                !tempRange?.to && 'text-muted-foreground'
              )}>
                {tempRange?.to ? format(tempRange.to, 'dd MMM') : '—'}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              {clearable && (tempRange?.from || tempRange?.to) && (
                <button
                  type="button"
                  onClick={handleClearTemp}
                  className={cn(
                    'text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded',
                    'hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150'
                  )}
                >
                  {intl.formatMessage({ id: 'FormDateRangePicker / Clear', defaultMessage: 'Clear' })}
                </button>
              )}
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!canApply}
                className={cn(
                  'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 h-7 px-3 text-xs',
                  'hover:bg-neutral-800 dark:hover:bg-neutral-200',
                  'disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500',
                  'transition-colors duration-150'
                )}
              >
                {intl.formatMessage({ id: 'FormDateRangePicker / Apply', defaultMessage: 'Apply' })}
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={defaultMonth}
              selected={tempRange}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              showYearNavigation
              disabled={(date) => {
                const dateOnly = startOfDay(date);
                if (minDate && isBefore(dateOnly, startOfDay(minDate))) return true;
                if (maxDate && isAfter(dateOnly, startOfDay(maxDate))) return true;
                return false;
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Validation error message */}
      {showError && displayError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

FormDateRangePicker.displayName = 'FormDateRangePicker';
