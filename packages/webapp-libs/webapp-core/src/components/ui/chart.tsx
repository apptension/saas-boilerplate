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

// Chart color palette matching shadcn design tokens
export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  destructive: 'hsl(var(--destructive))',
  // Beautiful gradient palette
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  pink: '#ec4899',
  rose: '#f43f5e',
  orange: '#f97316',
  amber: '#f59e0b',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  // Chart-specific semantic colors
  chart1: '#6366f1', // Indigo
  chart2: '#10b981', // Emerald
  chart3: '#8b5cf6', // Violet
  chart4: '#f97316', // Orange
  chart5: '#ec4899', // Pink
};

// Gradient definitions for area charts
export const ChartGradients = () => (
  <defs>
    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.indigo} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.indigo} stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.emerald} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.emerald} stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.violet} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.violet} stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColors.orange} stopOpacity={0.4} />
      <stop offset="100%" stopColor={chartColors.orange} stopOpacity={0.05} />
    </linearGradient>
  </defs>
);

// Custom tooltip component with shadcn styling
type ChartTooltipPayloadItem = {
  name?: string;
  value?: number;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number | undefined) => string;
  labelFormatter?: (label: string) => string;
};

export const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      {label && (
        <p className="mb-1.5 text-xs font-medium text-foreground">
          {labelFormatter ? labelFormatter(String(label)) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: ChartTooltipPayloadItem, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color || chartColors.chart1 }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    {/* Subtle gradient accent */}
    <div
      className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
      style={{ backgroundColor: accentColor || chartColors.indigo }}
    />

    <div className="relative">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50"
            style={{ color: accentColor }}
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
