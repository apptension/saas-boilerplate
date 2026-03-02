'use client';

import * as React from 'react';
import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isSameDay,
  isWithinInterval,
  isBefore,
  differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleDot } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface CalendarHeatmapProps {
  /** The start of the visible range */
  visibleStart?: Date;
  /** Number of weeks to display */
  weeksToShow?: number;
  /** Selected date range */
  selected?: { from?: Date; to?: Date };
  /** Callback when selection changes */
  onSelect?: (range: { from?: Date; to?: Date } | undefined) => void;
  /** Additional class name */
  className?: string;
  /** Week starts on (0 = Sunday, 1 = Monday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

// Day cell size - sized to fill available space nicely
const CELL_SIZE = 16;
const CELL_GAP = 3;

// Navigation button style
const navButtonClass = cn(
  'h-7 w-7 p-0 flex items-center justify-center rounded-md',
  'border border-border bg-background',
  'text-muted-foreground hover:text-foreground',
  'hover:bg-muted',
  'active:scale-95 transition-all duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
);

// CSS for heatmap animations and interactions
const heatmapAnimationStyles = `
  @keyframes heatmapFadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes todayPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    }
  }
  
  @keyframes selectPop {
    0% {
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .heatmap-grid-animate {
    animation: heatmapFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .heatmap-today {
    animation: todayPulse 2s ease-in-out infinite;
  }
  
  .heatmap-cell-select {
    animation: selectPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .heatmap-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    font-size: 11px;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 50;
    margin-bottom: 6px;
  }
  
  .heatmap-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
  
  .heatmap-cell:hover .heatmap-tooltip,
  .heatmap-cell:focus .heatmap-tooltip {
    opacity: 1;
  }
  
  /* Hide tooltips on touch devices */
  @media (hover: none) and (pointer: coarse) {
    .heatmap-tooltip {
      display: none;
    }
    
    .heatmap-cell button:hover {
      transform: none;
    }
  }
  
  /* Mobile responsive container */
  .heatmap-scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.2) transparent;
  }
  
  .heatmap-scroll-container::-webkit-scrollbar {
    height: 6px;
  }
  
  .heatmap-scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .heatmap-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
  
  .heatmap-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.3);
  }
`;

// Day labels (short form)
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarHeatmap({
  visibleStart: controlledVisibleStart,
  weeksToShow = 52, // Full year by default
  selected,
  onSelect,
  className,
  weekStartsOn = 1, // Monday by default
}: CalendarHeatmapProps) {
  // Calculate default visible start (center around selected range or today)
  const defaultVisibleStart = useMemo(() => {
    const referenceDate = selected?.from ?? new Date();
    // Go back half the weeks to center
    const weeksBack = Math.floor(weeksToShow / 2);
    const start = subWeeks(startOfWeek(referenceDate, { weekStartsOn }), weeksBack);
    return start;
  }, [selected?.from, weeksToShow, weekStartsOn]);

  const [visibleStart, setVisibleStart] = useState<Date>(
    controlledVisibleStart ?? defaultVisibleStart
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const edgeScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [edgeScrollDirection, setEdgeScrollDirection] = useState<'left' | 'right' | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Update visible start when controlled prop changes
  useEffect(() => {
    if (controlledVisibleStart) {
      setVisibleStart(controlledVisibleStart);
    }
  }, [controlledVisibleStart]);

  // Generate weeks array
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let currentWeekStart = visibleStart;

    for (let w = 0; w < weeksToShow; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(currentWeekStart, d));
      }
      result.push(week);
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }

    return result;
  }, [visibleStart, weeksToShow]);

  // Generate month labels with positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; year: number; weekIndex: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // Check the first day of the week
      const firstDayOfWeek = week[0];
      const monthOfFirstDay = firstDayOfWeek.getMonth();

      // Check if this week contains the start of a new month
      const weekContainsMonthStart = week.some((day) => {
        const dayOfMonth = day.getDate();
        return dayOfMonth >= 1 && dayOfMonth <= 7 && day.getMonth() !== currentMonth;
      });

      if (weekContainsMonthStart || weekIndex === 0) {
        const labelDate = week.find((d) => d.getDate() >= 1 && d.getDate() <= 7) ?? firstDayOfWeek;
        if (labelDate.getMonth() !== currentMonth || weekIndex === 0) {
          currentMonth = labelDate.getMonth();
          labels.push({
            month: format(labelDate, 'MMM'),
            year: labelDate.getFullYear(),
            weekIndex,
          });
        }
      }
    });

    return labels;
  }, [weeks]);

  // Navigation handlers - only animate on manual navigation
  const handleNavigate = useCallback((weeks: number) => {
    setShouldAnimate(true);
    setVisibleStart((prev) => addWeeks(prev, weeks));
    setAnimationKey((k) => k + 1);
  }, []);

  // Jump to today - centers today in the view
  const handleJumpToToday = useCallback(() => {
    const today = new Date();
    const weeksBack = Math.floor(weeksToShow / 2);
    const newStart = subWeeks(startOfWeek(today, { weekStartsOn }), weeksBack);
    setShouldAnimate(true);
    setVisibleStart(newStart);
    setAnimationKey((k) => k + 1);
  }, [weeksToShow, weekStartsOn]);

  // Calculate days in selection for tooltip
  const daysInSelection = useMemo(() => {
    if (!selected?.from || !selected?.to) return 0;
    return differenceInDays(selected.to, selected.from) + 1;
  }, [selected]);

  // Check if a date is in the selected range
  const isInRange = useCallback(
    (date: Date) => {
      if (!selected?.from) return false;
      if (!selected?.to) return isSameDay(date, selected.from);
      return isWithinInterval(date, { start: selected.from, end: selected.to });
    },
    [selected]
  );

  // Check if date is start or end of range
  const isRangeStart = useCallback(
    (date: Date) => selected?.from && isSameDay(date, selected.from),
    [selected?.from]
  );

  const isRangeEnd = useCallback(
    (date: Date) => selected?.to && isSameDay(date, selected.to),
    [selected?.to]
  );

  // Check if date is today
  const isToday = useCallback((date: Date) => isSameDay(date, new Date()), []);

  // Track if we're in "selecting end date" mode
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Handle day click - proper start/end selection like calendar
  const handleDayClick = useCallback(
    (date: Date) => {
      if (!onSelect) return;

      if (!selected?.from || (selected?.from && selected?.to)) {
        // No selection OR complete selection exists -> Start new selection
        onSelect({ from: date, to: undefined });
        setIsSelectingEnd(true);
      } else if (isSelectingEnd) {
        // Selecting end date
        if (isBefore(date, selected.from)) {
          // Clicked before start - swap them
          onSelect({ from: date, to: selected.from });
        } else if (isSameDay(date, selected.from)) {
          // Clicked same day - make it a single day selection
          onSelect({ from: date, to: date });
        } else {
          // Normal case - set end date
          onSelect({ from: selected.from, to: date });
        }
        setIsSelectingEnd(false);
      } else {
        // Edge case - has from but no to and not in selecting mode
        // This can happen when range is set externally
        if (isBefore(date, selected.from)) {
          onSelect({ from: date, to: selected.from });
        } else {
          onSelect({ from: selected.from, to: date });
        }
        setIsSelectingEnd(false);
      }
    },
    [selected, onSelect, isSelectingEnd]
  );

  // Reset selection mode when selected range changes externally
  useEffect(() => {
    if (selected?.from && selected?.to) {
      setIsSelectingEnd(false);
    }
  }, [selected?.from, selected?.to]);

  // Handle mouse down for drag selection
  const handleMouseDown = useCallback(
    (date: Date, e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      setIsDragging(true);
      setDragStart(date);
      onSelect?.({ from: date, to: undefined });
    },
    [onSelect]
  );

  // Handle mouse enter during drag
  const handleMouseEnter = useCallback(
    (date: Date) => {
      setHoverDate(date);
      if (isDragging && dragStart && onSelect) {
        if (isBefore(date, dragStart)) {
          onSelect({ from: date, to: dragStart });
        } else {
          onSelect({ from: dragStart, to: date });
        }
      }
    },
    [isDragging, dragStart, onSelect]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoverDate(null);
  }, []);

  // Edge scrolling while dragging - no animation to keep it smooth
  const startEdgeScroll = useCallback((direction: 'left' | 'right') => {
    if (edgeScrollIntervalRef.current) return;
    
    setShouldAnimate(false); // Disable animation during drag scroll
    setEdgeScrollDirection(direction);
    edgeScrollIntervalRef.current = setInterval(() => {
      setVisibleStart((prev) => addWeeks(prev, direction === 'right' ? 2 : -2));
    }, 150);
  }, []);

  const stopEdgeScroll = useCallback(() => {
    if (edgeScrollIntervalRef.current) {
      clearInterval(edgeScrollIntervalRef.current);
      edgeScrollIntervalRef.current = null;
    }
    setEdgeScrollDirection(null);
  }, []);

  // Handle mouse move for edge detection during drag
  const handleGridMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const edgeThreshold = 40; // pixels from edge to trigger scroll
    
    const distanceFromLeft = e.clientX - rect.left;
    const distanceFromRight = rect.right - e.clientX;

    if (distanceFromLeft < edgeThreshold) {
      startEdgeScroll('left');
    } else if (distanceFromRight < edgeThreshold) {
      startEdgeScroll('right');
    } else {
      stopEdgeScroll();
    }
  }, [isDragging, startEdgeScroll, stopEdgeScroll]);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
      stopEdgeScroll();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      stopEdgeScroll();
    };
  }, [stopEdgeScroll]);

  // Reorder day labels based on weekStartsOn
  const orderedDayLabels = useMemo(() => {
    const labels = [...DAY_LABELS];
    return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
  }, [weekStartsOn]);

  // Calculate preview range during hover
  const previewRange = useMemo(() => {
    if (!hoverDate || !selected?.from || selected?.to) return null;
    
    if (isBefore(hoverDate, selected.from)) {
      return { from: hoverDate, to: selected.from };
    } else {
      return { from: selected.from, to: hoverDate };
    }
  }, [hoverDate, selected]);

  // Check if date is in preview range
  const isInPreview = useCallback(
    (date: Date) => {
      if (!previewRange) return false;
      return isWithinInterval(date, { start: previewRange.from, end: previewRange.to });
    },
    [previewRange]
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Inject animation styles */}
      <style>{heatmapAnimationStyles}</style>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={navButtonClass}
            onClick={() => handleNavigate(-52)}
            aria-label="Go to previous year"
            title="Previous year"
          >
            <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            className={navButtonClass}
            onClick={() => handleNavigate(-4)}
            aria-label="Go to previous month"
            title="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {format(visibleStart, 'MMM yyyy')} – {format(addWeeks(visibleStart, weeksToShow - 1), 'MMM yyyy')}
          </span>
          {/* Jump to Today button */}
          <button
            type="button"
            onClick={handleJumpToToday}
            className={cn(
              'h-6 px-2 text-[10px] font-medium rounded-md flex items-center gap-1',
              'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-foreground',
              'transition-colors duration-150'
            )}
            title="Jump to today"
          >
            <CircleDot className="h-3 w-3" />
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={navButtonClass}
            onClick={() => handleNavigate(4)}
            aria-label="Go to next month"
            title="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            className={navButtonClass}
            onClick={() => handleNavigate(52)}
            aria-label="Go to next year"
            title="Next year"
          >
            <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Scrollable container for mobile */}
      <div className="heatmap-scroll-container pb-2">
        {/* Month labels */}
        <div 
          className="flex mb-2 ml-8"
          style={{ gap: `${CELL_GAP}px` }}
        >
          {monthLabels.map((label, i) => {
            const nextLabel = monthLabels[i + 1];
            const span = nextLabel ? nextLabel.weekIndex - label.weekIndex : weeksToShow - label.weekIndex;
            const width = span * (CELL_SIZE + CELL_GAP) - CELL_GAP;

            return (
              <div
                key={`${label.month}-${label.year}-${label.weekIndex}`}
                className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide overflow-hidden"
                style={{ 
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
              >
                {label.month}
                {label.month === 'Jan' && (
                  <span className="ml-0.5 text-[9px] opacity-60">{label.year}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid container */}
        <div className="flex">
        {/* Day labels */}
        <div 
          className="flex flex-col mr-2 justify-between"
          style={{ 
            height: `${7 * (CELL_SIZE + CELL_GAP) - CELL_GAP}px`,
            paddingTop: '1px',
          }}
        >
          {orderedDayLabels.map((day, i) => (
            <div
              key={day}
              className={cn(
                'text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none flex items-center justify-end',
                // Only show Mon, Wed, Fri for cleaner look
                i % 2 === 0 && 'opacity-0'
              )}
              style={{ height: `${CELL_SIZE}px`, width: '18px' }}
            >
              {day.slice(0, 2)}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          ref={gridRef}
          key={animationKey}
          className={cn(
            'flex select-none',
            shouldAnimate && 'heatmap-grid-animate',
            edgeScrollDirection === 'left' && 'cursor-w-resize',
            edgeScrollDirection === 'right' && 'cursor-e-resize'
          )}
          style={{ gap: `${CELL_GAP}px` }}
          onMouseLeave={() => {
            handleMouseLeave();
            stopEdgeScroll();
          }}
          onMouseUp={handleMouseUp}
          onMouseMove={handleGridMouseMove}
        >
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col"
              style={{ gap: `${CELL_GAP}px` }}
            >
              {week.map((day, dayIndex) => {
                const inRange = isInRange(day);
                const inPreview = isInPreview(day);
                const isStart = isRangeStart(day);
                const isEnd = isRangeEnd(day);
                const today = isToday(day);

                // Build tooltip text
                const tooltipText = (() => {
                  const dateStr = format(day, 'EEE, MMM d, yyyy');
                  if (isStart && isEnd) return `${dateStr} (single day)`;
                  if (isStart) return `${dateStr} (start)`;
                  if (isEnd) return `${dateStr} (end) · ${daysInSelection} days`;
                  if (inRange) return dateStr;
                  return dateStr;
                })();

                return (
                  <div
                    key={dayIndex}
                    className="heatmap-cell relative group"
                    style={{
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                    }}
                  >
                    <button
                      type="button"
                      className={cn(
                        'w-full h-full rounded-sm transition-all duration-100 ease-out',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                        // Base state
                        'bg-neutral-100 dark:bg-neutral-800',
                        'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-110',
                        // Preview state (when hovering to complete selection)
                        inPreview && !inRange && 'bg-neutral-200 dark:bg-neutral-700',
                        // In range state
                        inRange && 'bg-neutral-400 dark:bg-neutral-500',
                        // Start/End markers - stronger visual
                        (isStart || isEnd) && [
                          'bg-neutral-800 dark:bg-neutral-200',
                          'ring-2 ring-neutral-900 dark:ring-neutral-100',
                          'z-10',
                          'heatmap-cell-select',
                        ],
                        // Today marker with pulsing animation
                        today && !inRange && !isStart && !isEnd && [
                          'ring-2 ring-inset ring-neutral-500 dark:ring-neutral-400',
                          'heatmap-today',
                        ],
                        today && inRange && 'ring-2 ring-inset ring-neutral-600 dark:ring-neutral-300',
                        // Drag cursor
                        isDragging && 'cursor-grabbing'
                      )}
                      onClick={() => handleDayClick(day)}
                      onMouseDown={(e) => handleMouseDown(day, e)}
                      onMouseEnter={() => handleMouseEnter(day)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDayClick(day);
                        }
                      }}
                      aria-label={tooltipText}
                      aria-pressed={inRange}
                      tabIndex={0}
                    />
                    {/* Custom tooltip */}
                    <div className="heatmap-tooltip">
                      {tooltipText}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </div> {/* End of scroll container */}

      {/* Legend and selection info - responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4">
        {/* Selection info */}
        <div className="text-xs text-muted-foreground">
          {selected?.from && selected?.to ? (
            <span className="font-medium text-foreground">
              {daysInSelection} day{daysInSelection !== 1 ? 's' : ''} selected
            </span>
          ) : selected?.from && !selected?.to ? (
            <span className="text-amber-600 dark:text-amber-400">
              Click to select end date
            </span>
          ) : (
            <span>Click to select start date</span>
          )}
        </div>
        
        {/* Legend - hidden on very small screens, compact on mobile */}
        <div className="hidden xs:flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div 
              className="rounded-sm bg-neutral-100 dark:bg-neutral-800 ring-2 ring-inset ring-neutral-500 dark:ring-neutral-400"
              style={{ width: '10px', height: '10px' }}
            />
            <span className="hidden sm:inline">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="rounded-sm bg-neutral-400 dark:bg-neutral-500"
              style={{ width: '10px', height: '10px' }}
            />
            <span className="hidden sm:inline">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="rounded-sm bg-neutral-800 dark:bg-neutral-200 ring-2 ring-neutral-900 dark:ring-neutral-100"
              style={{ width: '10px', height: '10px' }}
            />
            <span className="hidden sm:inline">Start/End</span>
          </div>
        </div>
      </div>
    </div>
  );
}

CalendarHeatmap.displayName = 'CalendarHeatmap';
