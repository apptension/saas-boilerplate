import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '../../lib/utils';

// Re-export recharts components for convenience
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
};

// Chart color palette based on brand gradient: #FFFE25 → #42F272
export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  destructive: 'hsl(var(--destructive))',
  // Brand gradient colors (from yellow #FFFE25 to green #42F272)
  brandYellow: '#FFFE25',
  brandYellowGreen: '#A0FA4B',
  brandLimeGreen: '#71F85D',
  brandGreen: '#42F272',
  // Extended palette derived from brand
  lime: '#84F052',
  chartreuse: '#B8FC38',
  spring: '#5CF566',
  mint: '#4DE87A',
  // Chart-specific colors using brand palette
  chart1: '#42F272', // Brand green (primary)
  chart2: '#FFFE25', // Brand yellow
  chart3: '#71F85D', // Brand lime green
  chart4: '#A0FA4B', // Brand yellow-green
  chart5: '#5CF566', // Spring green
};

// Gradient definitions for charts using brand colors
export const ChartGradients = () => (
  <defs>
    {/* Brand gradient: Yellow to Green (horizontal) - for strokes and bars */}
    <linearGradient id="gradientBrand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={chartColors.brandYellow} stopOpacity={1} />
      <stop offset="100%" stopColor={chartColors.brandGreen} stopOpacity={1} />
    </linearGradient>
    {/* Brand gradient reversed: Green to Yellow (horizontal) */}
    <linearGradient id="gradientBrandReverse" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={chartColors.brandGreen} stopOpacity={1} />
      <stop offset="100%" stopColor={chartColors.brandYellow} stopOpacity={1} />
    </linearGradient>
    {/* Brand bar gradient (for horizontal bars - left to right) */}
    <linearGradient id="gradientBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={chartColors.brandYellow} stopOpacity={0.9} />
      <stop offset="100%" stopColor={chartColors.brandGreen} stopOpacity={1} />
    </linearGradient>
    {/* Primary area gradient (green fade down) */}
    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.brandGreen} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.brandGreen} stopOpacity={0.05} />
    </linearGradient>
    {/* Secondary area gradient (yellow fade down) */}
    <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.brandYellow} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.brandYellow} stopOpacity={0.05} />
    </linearGradient>
    {/* Mixed brand gradient (vertical yellow to green fade) */}
    <linearGradient id="gradientMixed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.brandYellow} stopOpacity={0.6} />
      <stop offset="50%" stopColor={chartColors.brandLimeGreen} stopOpacity={0.3} />
      <stop offset="100%" stopColor={chartColors.brandGreen} stopOpacity={0.1} />
    </linearGradient>
    {/* Pie/donut gradient */}
    <linearGradient id="gradientPie" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={chartColors.brandYellow} stopOpacity={1} />
      <stop offset="100%" stopColor={chartColors.brandGreen} stopOpacity={1} />
    </linearGradient>
  </defs>
);

// Custom tooltip content component with shadcn styling
type ChartTooltipPayloadItem = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number | undefined, name?: string) => string;
  labelFormatter?: (label: string) => string;
  title?: string;
  showTotal?: boolean;
};

const ChartTooltipContent = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  title,
  showTotal,
}: ChartTooltipContentProps) => {
  if (!active || !payload?.length) return null;

  const total = showTotal ? payload.reduce((sum, entry) => sum + (entry.value || 0), 0) : null;

  return (
    <div className="min-w-[160px] overflow-hidden rounded-md border border-border bg-popover shadow-lg">
      {/* Header with gradient accent */}
      {(title || label) && (
        <div className="border-b border-border bg-muted/50 px-3 py-2">
          {title && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          )}
          {label && (
            <p className="text-sm font-semibold text-foreground">
              {labelFormatter ? labelFormatter(String(label)) : label}
            </p>
          )}
        </div>
      )}

      {/* Data rows */}
      <div className="space-y-1 px-3 py-2">
        {payload.map((entry: ChartTooltipPayloadItem, index: number) => {
          const hasColor = entry.color && !entry.color.startsWith('url(');
          return (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                {hasColor && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                )}
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {formatter ? formatter(entry.value, entry.name) : entry.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total row */}
      {showTotal && total !== null && (
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Total</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{total}</span>
        </div>
      )}
    </div>
  );
};

// Wrapper component that uses recharts Tooltip with our custom content
type ChartTooltipWrapperProps = {
  formatter?: (value: number | undefined, name?: string) => string;
  labelFormatter?: (label: string) => string;
  title?: string;
  showTotal?: boolean;
};

export const ChartTooltip = ({ formatter, labelFormatter, title, showTotal }: ChartTooltipWrapperProps) => (
  <Tooltip
    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
    wrapperStyle={{ outline: 'none', zIndex: 50 }}
    content={({ active, payload, label }) => (
      <ChartTooltipContent
        active={active}
        payload={payload as ChartTooltipPayloadItem[]}
        label={label}
        formatter={formatter}
        labelFormatter={labelFormatter}
        title={title}
        showTotal={showTotal}
      />
    )}
  />
);

// Stat card component for dashboard
type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  accentColor?: string;
};

export const StatCard = ({ title, value, description, icon, trend, className, accentColor }: StatCardProps) => (
  <div
    className={cn(
      'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg',
      className
    )}
  >
    {/* Subtle gradient accent in background */}
    <div
      className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-25"
      style={{ backgroundColor: accentColor || chartColors.brandGreen }}
    />

    <div className="relative">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-black dark:text-black"
            style={{ backgroundColor: accentColor || chartColors.brandGreen }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && (
          <span
            className={cn('flex items-center text-sm font-medium', {
              'text-emerald-600 dark:text-emerald-400': trend.isPositive,
              'text-rose-600 dark:text-rose-400': !trend.isPositive,
            })}
          >
            <span className="mr-0.5">{trend.isPositive ? '↑' : '↓'}</span>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  </div>
);

// Chart container with consistent styling
type ChartContainerProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
};

export const ChartContainer = ({ children, title, description, className, action }: ChartContainerProps) => (
  <div className={cn('rounded-xl border bg-card shadow-sm', className)}>
    {(title || description || action) && (
      <div className="flex items-start justify-between border-b px-6 py-4">
        <div>
          {title && <h3 className="text-base font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// Empty state for charts
type ChartEmptyStateProps = {
  message?: string;
  className?: string;
};

export const ChartEmptyState = ({ message = 'No data available', className }: ChartEmptyStateProps) => (
  <div className={cn('flex h-48 items-center justify-center text-sm text-muted-foreground', className)}>{message}</div>
);

// Chart legend item
type ChartLegendItemProps = {
  color: string;
  label: string;
  value?: string | number;
};

export const ChartLegendItem = ({ color, label, value }: ChartLegendItemProps) => (
  <div className="flex items-center gap-2">
    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-sm text-muted-foreground">{label}</span>
    {value !== undefined && <span className="ml-auto text-sm font-medium tabular-nums">{value}</span>}
  </div>
);

// Axis styling defaults
export const axisDefaults = {
  tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
  axisLine: { stroke: 'hsl(var(--border))' },
  tickLine: { stroke: 'hsl(var(--border))' },
};

// Grid styling defaults
export const gridDefaults = {
  strokeDasharray: '4 4',
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.5,
};
