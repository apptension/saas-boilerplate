'use client';

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { useIntl } from 'react-intl';

import { cn } from '../../../lib/utils';
import { DatePicker, DatePickerProps } from './datePicker.component';

export interface DueDatePickerProps extends Omit<DatePickerProps, 'showTime' | 'timeStep'> {
  /** Reference date (e.g., invoice issue date) to calculate due date from - ISO string (YYYY-MM-DD) or Date */
  referenceDate?: string | Date;
  /** Custom day offset options (default: [7, 14, 30, 60]) */
  dayOffsets?: number[];
  /** Labels for day offset buttons (optional) */
  dayOffsetLabels?: Record<number, string>;
  /** Label text for the quick select section */
  quickSelectLabel?: string;
}

/**
 * Parse a value (string or Date) into a Date object.
 */
function parseValue(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;
  
  return undefined;
}

/**
 * DueDatePicker - A date picker with quick selection buttons for common payment terms.
 * Calculates due date based on a reference date (e.g., invoice issue date) plus day offsets.
 */
export function DueDatePicker({
  referenceDate,
  dayOffsets = [7, 14, 30, 60],
  dayOffsetLabels,
  quickSelectLabel,
  value,
  onChange,
  className,
  ...datePickerProps
}: DueDatePickerProps) {
  const intl = useIntl();
  const parsedReferenceDate = useMemo(() => parseValue(referenceDate), [referenceDate]);

  const dueDateOptions = useMemo(() => {
    if (!parsedReferenceDate) return [];

    return dayOffsets.map((days) => {
      const dueDate = addDays(parsedReferenceDate, days);
      const label = dayOffsetLabels?.[days] ?? intl.formatMessage({ id: 'DueDatePicker / Days label', defaultMessage: '{days}d' }, { days });
      return {
        days,
        date: dueDate,
        isoDate: format(dueDate, 'yyyy-MM-dd'),
        label,
      };
    });
  }, [parsedReferenceDate, dayOffsets, dayOffsetLabels, intl]);
  
  // Check if current value matches any of the preset options
  const selectedOffset = useMemo(() => {
    if (!value) return null;
    const currentValue = typeof value === 'string' ? value.split('T')[0] : format(value, 'yyyy-MM-dd');
    const matching = dueDateOptions.find((opt) => opt.isoDate === currentValue);
    return matching?.days ?? null;
  }, [value, dueDateOptions]);
  
  const handleOffsetClick = useCallback((isoDate: string) => {
    onChange?.(isoDate);
  }, [onChange]);
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Quick select buttons - only show if reference date is set */}
      {parsedReferenceDate && dueDateOptions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {quickSelectLabel && (
            <span className="text-xs text-muted-foreground mr-1">{quickSelectLabel}</span>
          )}
          {dueDateOptions.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => handleOffsetClick(option.isoDate)}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors border',
                selectedOffset === option.days
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border'
              )}
              title={format(option.date, 'dd MMM yyyy')}
            >
              +{option.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Date picker */}
      <DatePicker
        value={value}
        onChange={onChange}
        {...datePickerProps}
      />
    </div>
  );
}

DueDatePicker.displayName = 'DueDatePicker';
