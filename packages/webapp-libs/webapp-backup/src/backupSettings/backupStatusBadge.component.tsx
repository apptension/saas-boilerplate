import { Badge } from '@sb/webapp-core/components/ui/badge';
import { cn } from '@sb/webapp-core/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Status badge styling aligned with /management/documents list (DocumentStatusBadge).
 * Uses same color pattern: bg-*-100 text-*-700 dark:bg-*-900/40 dark:text-*-300
 */
const BACKUP_STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  FAILED: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  PROCESSING: {
    label: 'Processing',
    icon: Loader2,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  PARTIALLY_COMPLETED: {
    label: 'Partially completed',
    icon: CheckCircle2,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: 'Unknown',
  icon: AlertCircle,
  color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export interface BackupStatusBadgeProps {
  status: string;
  /** Display raw status with underscores replaced by spaces when no config (e.g. restore table) */
  formatLabel?: (raw: string) => string;
  small?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const BackupStatusBadge = ({
  status,
  formatLabel = (raw) => raw.replace(/_/g, ' '),
  small = false,
  showIcon = true,
  className,
}: BackupStatusBadgeProps) => {
  const config = BACKUP_STATUS_CONFIG[status] || {
    ...DEFAULT_STATUS_CONFIG,
    label: formatLabel(status),
  };

  const IconComponent = config.icon;
  const isAnimated = status === 'PROCESSING';

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium border-0 w-fit gap-1',
        config.color,
        small ? 'text-[10px] px-1.5 py-0' : 'text-[11px] px-2 py-0.5',
        className
      )}
    >
      {showIcon && (
        <IconComponent className={cn(small ? 'h-2.5 w-2.5' : 'h-3 w-3', isAnimated && 'animate-spin')} />
      )}
      {config.label}
    </Badge>
  );
};
