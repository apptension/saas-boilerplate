'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DayPicker, type DayPickerProps, useDayPicker, type DayButtonProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { addYears, subYears, format, isToday } from 'date-fns';
import { cn } from '../../../lib/utils';
import { buttonVariants } from '../button';

export type CalendarProps = DayPickerProps & {
  /** Enable year navigation arrows (jump 12 months) */
  showYearNavigation?: boolean;
  /** First day of the week (0 = Sunday, 1 = Monday, etc). Defaults to Monday (1). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

// Navigation button style - responsive sizing
const navButtonClass = cn(
  'h-6 w-6 sm:h-8 sm:w-8 p-0 flex items-center justify-center rounded-md',
  'border border-border bg-background',
  'text-muted-foreground hover:text-foreground',
  'hover:bg-muted',
  'active:scale-95 transition-all duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
);

// Custom Nav component with year navigation
interface CustomNavProps {
  showYearNavigation?: boolean;
  onPreviousClick?: React.MouseEventHandler<HTMLButtonElement>;
  onNextClick?: React.MouseEventHandler<HTMLButtonElement>;
  previousMonth?: Date;
  nextMonth?: Date;
}

function CustomNav({ showYearNavigation, onPreviousClick, onNextClick, previousMonth, nextMonth }: CustomNavProps) {
  const { goToMonth, previousMonth: prevMonth, nextMonth: nxtMonth } = useDayPicker();

  const handlePreviousYear = useCallback(() => {
    if (prevMonth) {
      goToMonth(subYears(prevMonth, 1));
    }
  }, [goToMonth, prevMonth]);

  const handleNextYear = useCallback(() => {
    if (nxtMonth) {
      goToMonth(addYears(nxtMonth, 1));
    }
  }, [goToMonth, nxtMonth]);

  const handlePreviousMonth = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onPreviousClick) {
      onPreviousClick(e);
    } else if (prevMonth) {
      goToMonth(prevMonth);
    }
  }, [onPreviousClick, goToMonth, prevMonth]);

  const handleNextMonth = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onNextClick) {
      onNextClick(e);
    } else if (nxtMonth) {
      goToMonth(nxtMonth);
    }
  }, [onNextClick, goToMonth, nxtMonth]);

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-8 z-10 pointer-events-none">
      <div className="flex items-center gap-1 pointer-events-auto">
        {showYearNavigation && (
          <div className="nav-button-wrapper">
            <button
              type="button"
              className={navButtonClass}
              onClick={handlePreviousYear}
              aria-label="Go to previous year"
            >
              <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="nav-button-tooltip">Previous year</div>
          </div>
        )}
        <div className="nav-button-wrapper">
          <button
            type="button"
            className={navButtonClass}
            onClick={handlePreviousMonth}
            disabled={!prevMonth && !previousMonth}
            aria-label="Go to previous month"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="nav-button-tooltip">Previous month</div>
        </div>
      </div>
      <div className="flex items-center gap-1 pointer-events-auto">
        <div className="nav-button-wrapper">
          <button
            type="button"
            className={navButtonClass}
            onClick={handleNextMonth}
            disabled={!nxtMonth && !nextMonth}
            aria-label="Go to next month"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="nav-button-tooltip">Next month</div>
        </div>
        {showYearNavigation && (
          <div className="nav-button-wrapper">
            <button
              type="button"
              className={navButtonClass}
              onClick={handleNextYear}
              aria-label="Go to next year"
            >
              <ChevronsRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="nav-button-tooltip">Next year</div>
          </div>
        )}
      </div>
    </div>
  );
}

// CSS for calendar animations and interactions
const calendarAnimationStyles = `
  @keyframes calendarFadeIn {
    from {
      opacity: 0;
      transform: scale(0.98) translateY(-2px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes todayPulse {
    0%, 100% {
      box-shadow: inset 0 0 0 2px currentColor;
    }
    50% {
      box-shadow: inset 0 0 0 2px currentColor, 0 0 0 3px rgba(0, 0, 0, 0.1);
    }
  }
  
  @keyframes selectPop {
    0% {
      transform: scale(0.85);
    }
    50% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .calendar-grid-animate {
    animation: calendarFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .calendar-today-pulse {
    animation: todayPulse 2.5s ease-in-out infinite;
  }
  
  .calendar-day-select {
    animation: selectPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* Enhanced hover effect for day buttons */
  .calendar-day-hover:hover {
    transform: scale(1.1);
    z-index: 10;
  }
  
  /* Smooth range background transition */
  .calendar-range-bg {
    transition: background-color 0.15s ease-out;
  }
  
  /* Day tooltip styles */
  .calendar-day-wrapper {
    position: relative;
  }
  
  /* Month container needs position for z-index to work */
  .calendar-month-container {
    position: relative;
  }
  
  /* Elevate the entire month when it contains a hovered day */
  .calendar-month-container:has(.calendar-day-wrapper:hover) {
    z-index: 50;
  }
  
  /* Week row needs position for z-index to work */
  .calendar-week-row {
    position: relative;
  }
  
  /* Elevate the week row when any day is hovered */
  .calendar-week-row:has(.calendar-day-wrapper:hover) {
    z-index: 100;
  }
  
  .calendar-day-wrapper:hover {
    z-index: 100;
  }
  
  .calendar-day-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 9999;
    margin-bottom: 4px;
  }
  
  .calendar-day-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
  
  .calendar-day-wrapper:hover .calendar-day-tooltip {
    opacity: 1;
  }
  
  /* Navigation button tooltip styles */
  .nav-button-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-button-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 50;
    margin-top: 4px;
  }
  
  .nav-button-tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }
  
  .nav-button-wrapper:hover .nav-button-tooltip {
    opacity: 1;
  }
  
  /* Hide tooltips on touch devices */
  @media (hover: none) and (pointer: coarse) {
    .calendar-day-tooltip,
    .nav-button-tooltip {
      display: none;
    }
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 640px) {
    .calendar-day-hover:hover {
      transform: none;
    }
  }
  
  /* Weekend day styling - 20% more transparent */
  .calendar-weekend-day {
    opacity: 0.8;
  }
  
  /* Weekend header styling (SA, SU) */
  .rdp-weekday:nth-child(6),
  .rdp-weekday:nth-child(7) {
    opacity: 0.8;
  }
`;

// Custom DayButton component with tooltip
function CustomDayButton({ day, modifiers, className, children, ...props }: DayButtonProps) {
  // day.date is the actual Date object in react-day-picker v9
  const dateObj = day.date;
  const today = isToday(dateObj);
  const tooltipText = format(dateObj, 'EEEE, MMMM d, yyyy') + (today ? ' (Today)' : '');
  
  return (
    <div className="calendar-day-wrapper">
      <button
        type="button"
        className={className}
        {...props}
      >
        {children}
      </button>
      <div className="calendar-day-tooltip">{tooltipText}</div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearNavigation = true,
  weekStartsOn = 1, // Default to Monday
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState<Date>(
    controlledMonth ?? props.defaultMonth ?? new Date()
  );
  const [animationKey, setAnimationKey] = useState(0);
  const previousMonthRef = useRef<Date | null>(null);

  // Use controlled or internal month
  const currentMonth = controlledMonth ?? internalMonth;

  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      previousMonthRef.current = newMonth;
      setAnimationKey((prev) => prev + 1);

      if (onMonthChange) {
        onMonthChange(newMonth);
      } else {
        setInternalMonth(newMonth);
      }
    },
    [onMonthChange]
  );

  // Update previousMonthRef when controlled month changes
  useEffect(() => {
    if (controlledMonth) {
      previousMonthRef.current = controlledMonth;
    }
  }, [controlledMonth]);

  return (
    <div className="relative">
      {/* Inject animation styles once */}
      <style>{calendarAnimationStyles}</style>
      
    <DayPicker
        key={animationKey}
      showOutsideDays={showOutsideDays}
        weekStartsOn={weekStartsOn}
        month={currentMonth}
        onMonthChange={handleMonthChange}
      className={cn('p-3', className)}
        modifiers={{
          weekend: { dayOfWeek: [0, 6] }, // Sunday (0) and Saturday (6)
        }}
        modifiersClassNames={{
          weekend: 'calendar-weekend-day',
        }}
      classNames={{
          // Container for all months - responsive padding for nav buttons
          months: cn(
            'relative flex flex-col sm:flex-row gap-4 sm:gap-8',
            showYearNavigation ? 'px-[3.25rem] sm:px-[4.5rem]' : 'px-8 sm:px-10'
          ),
          // Individual month - no animation here (keeps header static)
        month: 'flex flex-col gap-3 sm:gap-4 calendar-month-container',
          month_caption: 'flex justify-center pt-1 items-center h-7 sm:h-8',
          caption_label: cn(
            'text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground',
            'transition-opacity duration-200'
          ),
          // Hide default nav - we're using custom nav
          nav: 'hidden',
          button_previous: 'hidden',
          button_next: 'hidden',
          // Grid with elegant fade animation
          month_grid: cn(
            'w-full border-collapse',
            'calendar-grid-animate'
          ),
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-9 sm:w-10 font-medium text-[0.65rem] sm:text-[0.75rem] uppercase tracking-wide',
        week: 'flex w-full mt-1.5 sm:mt-2 calendar-week-row',
          // Day cell - base styling with hover scale - responsive size
          day: cn(
            'relative p-0 text-center text-xs sm:text-sm focus-within:relative focus-within:z-20',
            'h-9 w-9 sm:h-10 sm:w-10',
            'calendar-range-bg'
          ),
          // Day button - enhanced hover with scale effect - responsive size
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 sm:h-10 sm:w-10 p-0 font-medium rounded-md text-xs sm:text-sm',
            'hover:bg-muted transition-all duration-150 ease-out',
            'calendar-day-hover',
          'aria-selected:opacity-100'
        ),
          // Range start - rounded left corners, stronger background
        range_start: cn(
          'rounded-l-lg rounded-r-none',
            'bg-neutral-300 dark:bg-neutral-600',
            'calendar-range-bg'
        ),
          // Range end - rounded right corners, stronger background
        range_end: cn(
          'rounded-r-lg rounded-l-none',
            'bg-neutral-300 dark:bg-neutral-600',
            'calendar-range-bg'
        ),
        // Range middle - no rounding, solid background
        range_middle: cn(
          'rounded-none',
            'bg-neutral-300 dark:bg-neutral-600',
            'calendar-range-bg'
        ),
          // Selected (start/end) button style - stronger contrast with pop animation
        selected: cn(
            'bg-neutral-800 dark:bg-neutral-200',
          'text-white dark:text-neutral-900',
            'hover:bg-neutral-700 dark:hover:bg-neutral-300',
            'focus:bg-neutral-800 dark:focus:bg-neutral-200',
          'font-semibold',
            'transition-all duration-150',
            'calendar-day-select'
          ),
          // Today indicator - ring style (doesn't conflict with selection)
          today: cn(
            'ring-2 ring-inset ring-primary',
            '[&:not([aria-selected=true])]:text-primary',
            '[&:not([aria-selected=true])]:font-bold'
          ),
        // Outside days - very subtle
        outside: cn(
          'text-neutral-300 dark:text-neutral-600',
            'aria-selected:bg-neutral-200 dark:aria-selected:bg-neutral-700',
          'aria-selected:text-neutral-400 dark:aria-selected:text-neutral-500'
        ),
        disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
          Nav: (navProps) => (
            <CustomNav
              {...navProps}
              showYearNavigation={showYearNavigation}
            />
          ),
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" strokeWidth={2} />;
        },
          DayButton: CustomDayButton,
      }}
      {...props}
    />
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
