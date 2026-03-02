'use client';

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  format,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
  subQuarters,
  isSameDay,
  addMonths,
} from 'date-fns';
import { CalendarIcon, Check, ChevronDown, LayoutGrid, Calendar as CalendarViewIcon } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { DateRange } from 'react-day-picker';

// Hook to detect screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 900) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  
  return screenSize;
}

import { cn } from '../../../lib/utils';
import { Button } from '../../buttons';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar, CalendarHeatmap } from '../calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

// View toggle button styles
const viewToggleButtonClass = cn(
  'h-7 w-7 p-0 flex items-center justify-center rounded-md',
  'text-muted-foreground hover:text-foreground',
  'hover:bg-neutral-200 dark:hover:bg-neutral-700',
  'transition-all duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
);

type CalendarView = 'calendar' | 'heatmap';

export interface DateRangePreset {
  id: string;
  label: string;
  messageId?: string;
  getRange: () => { from: Date; to: Date };
}

export interface DateRangePickerProps {
  /** The selected date range */
  value?: { from: Date; to: Date };
  /** Callback when range changes */
  onChange?: (range: { from: Date; to: Date } | undefined) => void;
  /** Custom presets to show. If not provided, defaults are used. */
  presets?: DateRangePreset[];
  /** Fiscal year start month (1-12). Default is 1 (January) */
  fiscalYearStartMonth?: number;
  /** Whether to include fiscal year presets */
  includeFiscalPresets?: boolean;
  /** Placeholder text when no date selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Align popover */
  align?: 'start' | 'center' | 'end';
  /** Whether to show the clear button (in popover header) */
  clearable?: boolean;
}

const createDefaultPresets = (fiscalYearStartMonth = 1): DateRangePreset[] => {
  const today = new Date();
  const currentYear = today.getFullYear();

  // Calculate fiscal year dates
  const getFiscalYearStart = (year: number) => {
    const fiscalStart = new Date(year, fiscalYearStartMonth - 1, 1);
    if (fiscalStart > today && year === currentYear) {
      return new Date(year - 1, fiscalYearStartMonth - 1, 1);
    }
    return fiscalStart;
  };

  const getFiscalYearEnd = (startDate: Date) => {
    return endOfMonth(addMonths(startDate, 11));
  };

  const currentFiscalStart = getFiscalYearStart(currentYear);
  const currentFiscalEnd = getFiscalYearEnd(currentFiscalStart);
  const prevFiscalStart = addMonths(currentFiscalStart, -12);
  const prevFiscalEnd = addMonths(currentFiscalEnd, -12);

  const presets: DateRangePreset[] = [
    { id: 'thisMonth', label: 'This Month', messageId: 'DateRangePicker / This Month', getRange: () => ({ from: startOfMonth(today), to: endOfMonth(today) }) },
    {
      id: 'lastMonth',
      label: 'Last Month',
      messageId: 'DateRangePicker / Last Month',
      getRange: () => {
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
    { id: 'last3months', label: 'Last 3 Months', messageId: 'DateRangePicker / Last 3 Months', getRange: () => ({ from: startOfMonth(subMonths(today, 2)), to: endOfMonth(today) }) },
    { id: 'thisQuarter', label: 'This Quarter', messageId: 'DateRangePicker / This Quarter', getRange: () => ({ from: startOfQuarter(today), to: endOfQuarter(today) }) },
    {
      id: 'lastQuarter',
      label: 'Last Quarter',
      messageId: 'DateRangePicker / Last Quarter',
      getRange: () => {
        const lastQuarter = subQuarters(today, 1);
        return { from: startOfQuarter(lastQuarter), to: endOfQuarter(lastQuarter) };
      },
    },
    { id: 'thisYear', label: 'This Year', messageId: 'DateRangePicker / This Year', getRange: () => ({ from: startOfYear(today), to: endOfYear(today) }) },
    {
      id: 'lastYear',
      label: 'Last Year',
      messageId: 'DateRangePicker / Last Year',
      getRange: () => {
        const lastYear = subYears(today, 1);
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
      },
    },
    { id: 'last12months', label: 'Last 12 Months', messageId: 'DateRangePicker / Last 12 Months', getRange: () => ({ from: subMonths(today, 11), to: today }) },
    {
      id: 'thisFiscalYear',
      label: fiscalYearStartMonth === 1 ? 'This Calendar Year' : 'This Fiscal Year',
      messageId: fiscalYearStartMonth === 1 ? 'DateRangePicker / This Calendar Year' : 'DateRangePicker / This Fiscal Year',
      getRange: () => ({ from: currentFiscalStart, to: currentFiscalEnd }),
    },
    {
      id: 'lastFiscalYear',
      label: fiscalYearStartMonth === 1 ? 'Last Calendar Year' : 'Last Fiscal Year',
      messageId: fiscalYearStartMonth === 1 ? 'DateRangePicker / Last Calendar Year' : 'DateRangePicker / Last Fiscal Year',
      getRange: () => ({ from: prevFiscalStart, to: prevFiscalEnd }),
    },
  ];

  return presets;
};

export function DateRangePicker({
  value,
  onChange,
  presets: customPresets,
  fiscalYearStartMonth = 1,
  includeFiscalPresets = true,
  placeholder,
  className,
  disabled = false,
  numberOfMonths = 2,
  align = 'start',
  clearable = true,
}: DateRangePickerProps) {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const resolvedPlaceholder = placeholder ?? intl.formatMessage({ id: 'DateRangePicker / Placeholder', defaultMessage: 'Select date range' });
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );
  const [calendarView, setCalendarView] = useState<CalendarView>('calendar');
  const screenSize = useScreenSize();
  const isMobileOrTablet = screenSize === 'mobile' || screenSize === 'tablet';
  const isMobile = screenSize === 'mobile';
  
  // Responsive number of months - single month for mobile and tablet
  const responsiveNumberOfMonths = isMobileOrTablet ? 1 : numberOfMonths;

  // Create presets
  const presets = useMemo(() => {
    if (customPresets) return customPresets;
    const defaultPresets = createDefaultPresets(fiscalYearStartMonth);
    const yearQuarterMonthPresets = defaultPresets.filter((p) =>
      [
        'thisMonth',
        'lastMonth',
        'last3months',
        'thisQuarter',
        'lastQuarter',
        'thisYear',
        'lastYear',
        'last12months',
      ].includes(p.id)
    );
    if (includeFiscalPresets && fiscalYearStartMonth !== 1) {
      return [
        ...yearQuarterMonthPresets,
        ...defaultPresets.filter((p) =>
          ['thisFiscalYear', 'lastFiscalYear'].includes(p.id)
        ),
      ];
    }
    return yearQuarterMonthPresets;
  }, [customPresets, fiscalYearStartMonth, includeFiscalPresets]);

  // Generate year options (10 years: 5 past + current + 4 future)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = -5; i <= 4; i++) {
      years.push(currentYear + i);
    }
    return years;
  }, []);

  // Check if current temp selection matches a preset
  const activePreset = useMemo(() => {
    if (!tempRange?.from || !tempRange?.to) return null;
    for (const preset of presets) {
      const range = preset.getRange();
      if (isSameDay(tempRange.from, range.from) && isSameDay(tempRange.to, range.to)) {
        return preset.id;
      }
    }
    return null;
  }, [tempRange, presets]);

  // Check if current selection is a specific year
  const selectedSpecificYear = useMemo(() => {
    if (!tempRange?.from || !tempRange?.to) return null;
    const fromYear = tempRange.from.getFullYear();
    const toYear = tempRange.to.getFullYear();
    if (fromYear !== toYear) return null;
    
    const yearStart = startOfYear(tempRange.from);
    const yearEnd = endOfYear(tempRange.from);
    
    if (isSameDay(tempRange.from, yearStart) && isSameDay(tempRange.to, yearEnd)) {
      return fromYear;
    }
    return null;
  }, [tempRange]);

  const handlePresetClick = useCallback((preset: DateRangePreset) => {
    const range = preset.getRange();
    setTempRange({ from: range.from, to: range.to });
  }, []);

  const handleYearSelect = useCallback((yearStr: string) => {
    const year = parseInt(yearStr, 10);
    if (!isNaN(year)) {
      const yearDate = new Date(year, 0, 1);
      setTempRange({ from: startOfYear(yearDate), to: endOfYear(yearDate) });
    }
  }, []);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    setTempRange(range);
  }, []);

  const handleApply = useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      onChange?.({ from: tempRange.from, to: tempRange.to });
      setOpen(false);
    }
  }, [tempRange, onChange]);

  const handleCancel = useCallback(() => {
    setTempRange(value ? { from: value.from, to: value.to } : undefined);
    setOpen(false);
  }, [value]);

  const handleClear = useCallback(() => {
    setTempRange(undefined);
  }, []);

  const formatDateRange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      if (!from) return resolvedPlaceholder;
      if (!to) return format(from, 'dd MMM yyyy');
      return `${format(from, 'dd MMM yyyy')} – ${format(to, 'dd MMM yyyy')}`;
    },
    [resolvedPlaceholder]
  );

  // Sync temp range when popover opens
  React.useEffect(() => {
    if (open) {
      setTempRange(value ? { from: value.from, to: value.to } : undefined);
    }
  }, [open, value]);

  const displayText = value ? formatDateRange(value.from, value.to) : resolvedPlaceholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'group justify-between text-left font-normal gap-2 transition-colors duration-150',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'focus-visible:ring-offset-0',
            // Width fits content naturally
            'w-auto px-3',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="whitespace-nowrap">
              {displayText}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ml-1',
              open && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "p-0 flex flex-col shadow-lg border-border/80",
          // Mobile/Tablet: constrained width, Desktop: auto
          isMobileOrTablet 
            ? "w-[calc(100vw-1rem)] max-w-[400px]" 
            : "w-auto",
        )}
        align={isMobile ? 'center' : align}
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
        sticky="partial"
      >
        {/* Header with selected range display and view toggle */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              {tempRange?.from && tempRange?.to
                ? formatDateRange(tempRange.from, tempRange.to)
                : resolvedPlaceholder}
            </span>
            {activePreset && !isMobileOrTablet && (() => {
              const preset = presets.find((p) => p.id === activePreset);
              return preset ? (
                <span className="text-xs text-neutral-600 dark:text-neutral-400 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full whitespace-nowrap">
                  {preset.messageId ? <FormattedMessage id={preset.messageId} defaultMessage={preset.label} /> : preset.label}
                </span>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View toggle - hidden on mobile/tablet */}
            {!isMobileOrTablet && (
              <div className="flex items-center gap-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setCalendarView('calendar')}
                  className={cn(
                    viewToggleButtonClass,
                    calendarView === 'calendar' && 'bg-white dark:bg-neutral-600 shadow-sm text-foreground'
                  )}
                  title={intl.formatMessage({ id: 'DateRangePicker / Calendar view', defaultMessage: 'Calendar view' })}
                  aria-label={intl.formatMessage({ id: 'DateRangePicker / Switch to calendar view', defaultMessage: 'Switch to calendar view' })}
                  aria-pressed={calendarView === 'calendar'}
                >
                  <CalendarViewIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('heatmap')}
                  className={cn(
                    viewToggleButtonClass,
                    calendarView === 'heatmap' && 'bg-white dark:bg-neutral-600 shadow-sm text-foreground'
                  )}
                  title={intl.formatMessage({ id: 'DateRangePicker / Year view', defaultMessage: 'Year view (heatmap)' })}
                  aria-label={intl.formatMessage({ id: 'DateRangePicker / Switch to year view', defaultMessage: 'Switch to year view' })}
                  aria-pressed={calendarView === 'heatmap'}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {/* Clear button */}
            {clearable && tempRange && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150'
                )}
              >
                {intl.formatMessage({ id: 'DateRangePicker / Clear', defaultMessage: 'Clear' })}
              </button>
            )}
          </div>
        </div>

        <div className={cn(
          "flex flex-col max-h-[60vh] overflow-auto",
          // Desktop only: side-by-side layout
          !isMobileOrTablet && "sm:flex-row sm:max-h-none sm:overflow-visible"
        )}>
          {/* Presets - horizontal scroll on mobile/tablet, vertical on desktop */}
          <div className={cn(
            "border-b border-border py-2 bg-neutral-50 dark:bg-neutral-900 flex flex-col shrink-0",
            !isMobileOrTablet && "sm:border-b-0 sm:border-r sm:min-w-[140px]"
          )}>
            <div className={cn(
              "flex gap-1.5 px-2 overflow-x-auto scrollbar-none",
              !isMobileOrTablet && "sm:flex-col sm:gap-0.5 sm:overflow-x-visible"
            )}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors duration-150 text-left whitespace-nowrap shrink-0',
                    'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    // Desktop: full width vertical list
                    !isMobileOrTablet && 'sm:px-3 sm:py-2 sm:text-sm sm:w-full sm:justify-between',
                    activePreset === preset.id
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-foreground font-medium'
                      : cn(
                          'text-muted-foreground hover:text-foreground',
                          // Mobile/tablet: pill with border, Desktop: no border
                          isMobileOrTablet ? 'border border-border' : 'sm:border-0'
                        )
                  )}
                >
                  <span>{preset.messageId ? <FormattedMessage id={preset.messageId} defaultMessage={preset.label} /> : preset.label}</span>
                  {activePreset === preset.id && (
                    <Check className="h-3 w-3 text-foreground shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Year Selector Dropdown - desktop only */}
            {!isMobileOrTablet && (
            <div className="hidden sm:block px-2 pt-2 mt-2 border-t border-border">
              <Select
                value={selectedSpecificYear?.toString() ?? ''}
                onValueChange={handleYearSelect}
              >
                <SelectTrigger 
                  className={cn(
                    'w-full h-9 text-sm',
                    selectedSpecificYear && 'font-medium'
                  )}
                >
                  <SelectValue placeholder={intl.formatMessage({ id: 'DateRangePicker / Select Year', defaultMessage: 'Select Year...' })} />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}
          </div>

          {/* Calendar / Heatmap */}
          <div className={cn(
            "p-3 flex items-center justify-center",
            !isMobileOrTablet && "sm:p-4"
          )}>
            {calendarView === 'calendar' || isMobileOrTablet ? (
              <Calendar
                mode="range"
                defaultMonth={tempRange?.from}
                selected={tempRange}
                onSelect={handleRangeSelect}
                numberOfMonths={responsiveNumberOfMonths}
                showYearNavigation={!isMobileOrTablet}
              />
            ) : (
              <CalendarHeatmap
                selected={tempRange ? { from: tempRange.from, to: tempRange.to } : undefined}
                onSelect={(range) => {
                  if (range) {
                    setTempRange({ from: range.from, to: range.to });
                  } else {
                    setTempRange(undefined);
                  }
                }}
                weeksToShow={52}
              />
            )}
          </div>
        </div>

        {/* Footer with Cancel and Apply buttons */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border bg-neutral-50 dark:bg-neutral-900">
          <div className="text-xs text-muted-foreground">
            {tempRange?.from && !tempRange?.to && intl.formatMessage({ id: 'DateRangePicker / Select end date', defaultMessage: 'Select end date' })}
            {!tempRange?.from && intl.formatMessage({ id: 'DateRangePicker / Select start date', defaultMessage: 'Select start date' })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground h-8 px-3 text-sm"
            >
              {intl.formatMessage({ id: 'DateRangePicker / Cancel', defaultMessage: 'Cancel' })}
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempRange?.from || !tempRange?.to}
              className={cn(
                'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 h-8 px-4 text-sm',
                'hover:bg-neutral-800 dark:hover:bg-neutral-200',
                'disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500',
                'transition-colors duration-150'
              )}
            >
              {intl.formatMessage({ id: 'DateRangePicker / Apply', defaultMessage: 'Apply' })}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DateRangePicker.displayName = 'DateRangePicker';
