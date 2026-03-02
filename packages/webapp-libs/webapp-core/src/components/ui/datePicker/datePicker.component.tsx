'use client';

import * as React from 'react';
import { useState, useCallback, useRef, useMemo } from 'react';
import { format, parse, parseISO, isValid, setHours, setMinutes, getHours, getMinutes, startOfDay } from 'date-fns';
import { CalendarIcon, X, Clock } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Button } from '../../buttons';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar } from '../calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

export interface DatePickerProps {
  /** The selected date as ISO string (YYYY-MM-DD or YYYY-MM-DDTHH:mm) or Date object */
  value?: string | Date;
  /** Callback when date changes - returns ISO string or undefined if cleared */
  onChange?: (value: string | undefined) => void;
  /** Placeholder text when no date selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Align popover */
  align?: 'start' | 'center' | 'end';
  /** Whether to show the clear button */
  clearable?: boolean;
  /** Date format for display (default: "dd MMM yyyy" or "dd MMM yyyy HH:mm" for datetime) */
  displayFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Name attribute for form integration */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Whether to include time picker (default: false) */
  showTime?: boolean;
  /** Time step in minutes for the time picker (default: 5) */
  timeStep?: number;
}

/**
 * Parse a value (string or Date) into a Date object.
 * Uses parseISO for ISO strings to avoid timezone issues.
 */
function parseValue(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  
  // Use parseISO for ISO format strings (handles YYYY-MM-DD and YYYY-MM-DDTHH:mm correctly)
  // parseISO treats date-only strings as local time, not UTC
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;
  
  // Fallback: try parsing with date-fns parse
  const fallbackParsed = parse(value, 'yyyy-MM-dd', new Date());
  if (isValid(fallbackParsed)) return fallbackParsed;
  
  return undefined;
}

/**
 * Format a date to the appropriate output string
 */
function formatOutput(date: Date, showTime: boolean): string {
  if (showTime) {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a number to 2 digits
 */
function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Generate hours options
 */
function generateHourOptions(): { value: string; label: string }[] {
  return Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: pad(i),
  }));
}

/**
 * Generate minutes options based on step
 */
function generateMinuteOptions(step: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 60; i += step) {
    options.push({ value: String(i), label: pad(i) });
  }
  return options;
}

/**
 * Compact Time Picker using Select dropdowns
 */
interface TimePickerProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  onTimeChange: (hours: number, minutes: number) => void;
  minuteStep: number;
  disabled?: boolean;
}

function TimePicker({ hours, minutes, onHoursChange, onMinutesChange, onTimeChange, minuteStep, disabled }: TimePickerProps) {
  const hourOptions = useMemo(() => generateHourOptions(), []);
  const minuteOptions = useMemo(() => generateMinuteOptions(minuteStep), [minuteStep]);
  
  // Find the closest valid minute
  const closestMinute = useMemo(() => {
    const validMinutes = minuteOptions.map(o => parseInt(o.value));
    return validMinutes.reduce((prev, curr) => 
      Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev
    );
  }, [minutes, minuteOptions]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 border-t border-border",
      disabled && "opacity-50 pointer-events-none"
    )}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      
      <Select
        value={String(hours)}
        onValueChange={(val) => onHoursChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-16 h-8 text-sm">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-48">
          {hourOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm font-medium text-muted-foreground">:</span>

      <Select
        value={String(closestMinute)}
        onValueChange={(val) => onMinutesChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-16 h-8 text-sm">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-48">
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quick preset buttons - compact */}
      <div className="flex items-center gap-1 ml-auto">
        {[
          { label: '9am', hours: 9, minutes: 0 },
          { label: '12pm', hours: 12, minutes: 0 },
          { label: '5pm', hours: 17, minutes: 0 },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onTimeChange(preset.hours, preset.minutes)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              hours === preset.hours && closestMinute === preset.minutes
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * DatePicker - A single date picker component that wraps Calendar in a Popover.
 * Supports both date-only and datetime modes.
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  align = 'start',
  clearable = true,
  displayFormat,
  minDate,
  maxDate,
  name,
  id,
  showTime = false,
  timeStep = 5,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Parse the value into a Date - memoized to prevent infinite loops
  const selectedDate = useMemo(() => parseValue(value), [value]);
  
  // Track the month shown in the calendar - initialize once, update only when popover opens
  const [month, setMonth] = useState<Date>(() => selectedDate ?? new Date());
  
  // Track if we need to sync month on open
  const lastSelectedDateRef = useRef<Date | undefined>(selectedDate);
  
  // Derived default display format
  const defaultDisplayFormat = showTime ? 'dd MMM yyyy HH:mm' : 'dd MMM yyyy';
  const actualDisplayFormat = displayFormat ?? defaultDisplayFormat;
  
  // Derived placeholder
  const actualPlaceholder = placeholder ?? (showTime ? 'Select date and time' : 'Select date');

  // Sync month when popover opens (not on every selectedDate change)
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen && selectedDate) {
      // Only update month if the date actually changed
      if (!lastSelectedDateRef.current || 
          lastSelectedDateRef.current.getTime() !== selectedDate.getTime()) {
        setMonth(selectedDate);
        lastSelectedDateRef.current = selectedDate;
      }
    }
    setOpen(isOpen);
  }, [selectedDate]);

  const handleSelect = useCallback((date: Date | undefined) => {
    if (date) {
      // Preserve time if in showTime mode and we have an existing selection
      let finalDate = date;
      if (showTime && selectedDate) {
        finalDate = setHours(setMinutes(date, getMinutes(selectedDate)), getHours(selectedDate));
      } else if (showTime) {
        // Default to 9:00 AM for new selections in datetime mode
        finalDate = setHours(setMinutes(date, 0), 9);
      }
      
      const outputValue = formatOutput(finalDate, showTime);
      onChange?.(outputValue);
      
      // Only close if not showing time (user might want to adjust time)
      if (!showTime) {
        setOpen(false);
      }
    }
  }, [onChange, showTime, selectedDate]);

  const handleHoursChange = useCallback((hours: number) => {
    if (!selectedDate) return;
    const newDate = setHours(selectedDate, hours);
    const outputValue = formatOutput(newDate, true);
    onChange?.(outputValue);
  }, [onChange, selectedDate]);

  const handleMinutesChange = useCallback((minutes: number) => {
    if (!selectedDate) return;
    const newDate = setMinutes(selectedDate, minutes);
    const outputValue = formatOutput(newDate, true);
    onChange?.(outputValue);
  }, [onChange, selectedDate]);

  const handleTimeChange = useCallback((hours: number, minutes: number) => {
    // Use selectedDate if exists, otherwise use today
    const baseDate = selectedDate ?? new Date();
    const newDate = setHours(setMinutes(baseDate, minutes), hours);
    const outputValue = formatOutput(newDate, true);
    onChange?.(outputValue);
  }, [onChange, selectedDate]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  }, [onChange]);

  const handleTodayClick = useCallback(() => {
    const today = new Date();
    handleSelect(today);
  }, [handleSelect]);

  const handleNowClick = useCallback(() => {
    const now = new Date();
    const outputValue = formatOutput(now, showTime);
    onChange?.(outputValue);
  }, [onChange, showTime]);

  const displayText = selectedDate 
    ? format(selectedDate, actualDisplayFormat) 
    : actualPlaceholder;

  const currentHours = selectedDate ? getHours(selectedDate) : 9;
  const currentMinutes = selectedDate ? getMinutes(selectedDate) : 0;

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
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {displayText}
            </span>
          </div>
          {clearable && selectedDate && !disabled && (
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
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </span>
          )}
          {/* Hidden input for form submission */}
          <input
            type="hidden"
            name={name}
            value={selectedDate ? formatOutput(selectedDate, showTime) : ''}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg border-border/80"
        align={align}
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => {
            // Use startOfDay for date-only comparisons to avoid timezone issues
            const dateOnly = startOfDay(date);
            if (minDate && dateOnly < startOfDay(minDate)) return true;
            if (maxDate && dateOnly > startOfDay(maxDate)) return true;
            return false;
          }}
          showYearNavigation
        />
        
        {/* Compact Time Picker */}
        {showTime && (
          <TimePicker
            hours={currentHours}
            minutes={currentMinutes}
            onHoursChange={handleHoursChange}
            onMinutesChange={handleMinutesChange}
            onTimeChange={handleTimeChange}
            minuteStep={timeStep}
            disabled={!selectedDate}
          />
        )}
        
        {/* Footer with Today/Now button */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-neutral-50 dark:bg-neutral-900">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={showTime ? handleNowClick : handleTodayClick}
            className="text-xs h-7"
          >
            {showTime ? 'Now' : 'Today'}
          </Button>
          <div className="flex items-center gap-2">
            {clearable && selectedDate && (
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
                Clear
              </Button>
            )}
            {showTime && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs h-7"
                disabled={!selectedDate}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = 'DatePicker';
