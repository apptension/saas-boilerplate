import { AlertCircle, AlertTriangle, CheckCircle2, Info, LucideIcon, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { cn } from '../../lib/utils';
import { useToast } from '../useToast';

type ToastVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

interface ToastIconConfig {
  icon: LucideIcon;
  className: string;
}

const variantIcons: Record<ToastVariant, ToastIconConfig> = {
  default: {
    icon: Info,
    className: 'text-muted-foreground',
  },
  success: {
    icon: CheckCircle2,
    className: 'text-green-600 dark:text-green-400',
  },
  destructive: {
    icon: AlertCircle,
    className: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    className: 'text-blue-600 dark:text-blue-400',
  },
};

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-background border border-border',
  success:
    'border-l-4 border-l-green-500 border-y border-r border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100',
  destructive:
    'border-l-4 border-l-destructive border-y border-r border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100',
  warning:
    'border-l-4 border-l-amber-500 border-y border-r border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100',
  info: 'border-l-4 border-l-blue-500 border-y border-r border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100',
};

const closeButtonStyles: Record<ToastVariant, string> = {
  default: 'text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring',
  success:
    'text-green-600 hover:text-green-700 hover:bg-green-100 focus:ring-green-500 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900',
  destructive:
    'text-red-600 hover:text-red-700 hover:bg-red-100 focus:ring-red-500 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900',
  warning:
    'text-amber-600 hover:text-amber-700 hover:bg-amber-100 focus:ring-amber-500 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900',
  info: 'text-blue-600 hover:text-blue-700 hover:bg-blue-100 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900',
};

const MAX_VISIBLE_TOASTS = 3;
const EXIT_ANIMATION_DURATION = 400; // ms

interface ToastItemProps {
  id: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: React.ReactNode;
  onDismiss: (id: number) => void;
  isExiting?: boolean;
}

function ToastItem({
  id,
  title,
  description,
  variant = 'default',
  action,
  onDismiss,
  isExiting = false,
}: ToastItemProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const intl = useIntl();

  // Enter animation - only run once on mount
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const iconConfig = variantIcons[variant];
  const IconComponent = iconConfig.icon;

  return (
    <div
      data-testid={`toast-${id}`}
      role="alert"
      aria-live="polite"
      className={cn(
        // Base styles
        'relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg py-4 px-4 pr-10 shadow-lg',
        // Variant styles
        variantStyles[variant]
      )}
      style={{
        // Enter: slide up from bottom
        // Exit: slide down with blur
        transform: !hasEntered
          ? 'translateY(100%) scale(0.9)'
          : isExiting
            ? 'translateY(20px) scale(0.9)'
            : 'translateY(0) scale(1)',
        opacity: !hasEntered ? 0 : isExiting ? 0 : 1,
        filter: isExiting ? 'blur(2px)' : 'none',
        transition: `all ${isExiting ? EXIT_ANIMATION_DURATION : 300}ms ease-out`,
        transformOrigin: 'center bottom',
      }}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('h-5 w-5 shrink-0 mt-0.5', iconConfig.className)} aria-hidden="true" />
        <div className="grid gap-1 min-w-0">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      {action}
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'absolute right-3 top-3 rounded-md p-1 opacity-70 transition-all duration-200',
          'hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
          closeButtonStyles[variant]
        )}
        aria-label={intl.formatMessage({
          defaultMessage: 'Dismiss notification',
          id: 'Toast message / Dismiss',
        })}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

const AUTO_DISMISS_DELAY = 5000; // ms
const STACK_OFFSET = 8; // px between stacked toasts
const STACK_SCALE = 0.03; // scale reduction per level

export function Toaster() {
  const intl = useIntl();
  const {
    toastState: { toasts },
    hideToast,
  } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dismissTimersRef = useRef<Map<number, { timeoutId: NodeJS.Timeout; remainingTime: number; startTime: number }>>(
    new Map()
  );
  // Track which toasts are currently exiting (for animation)
  const [exitingToasts, setExitingToasts] = useState<Set<number>>(new Set());

  const defaultMessage = intl.formatMessage({
    id: 'Snackbar / Generic error',
    defaultMessage: 'Something went wrong.',
  });

  const triggerExit = useCallback((id: number) => {
    setExitingToasts((prev) => new Set(prev).add(id));
    setTimeout(() => {
      hideToast(id);
      setExitingToasts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, EXIT_ANIMATION_DURATION);
  }, [hideToast]);

  // Handle auto-dismiss with pause on hover
  useEffect(() => {
    toasts.forEach((toast) => {
      const existingTimer = dismissTimersRef.current.get(toast.id);

      if (!existingTimer) {
        // New toast - set up timer
        if (!isHovered) {
          const timeoutId = setTimeout(() => {
            triggerExit(toast.id);
            dismissTimersRef.current.delete(toast.id);
          }, AUTO_DISMISS_DELAY);

          dismissTimersRef.current.set(toast.id, {
            timeoutId,
            remainingTime: AUTO_DISMISS_DELAY,
            startTime: Date.now(),
          });
        } else {
          // Hovered, just track remaining time
          dismissTimersRef.current.set(toast.id, {
            timeoutId: null as unknown as NodeJS.Timeout,
            remainingTime: AUTO_DISMISS_DELAY,
            startTime: Date.now(),
          });
        }
      }
    });

    // Clean up timers for removed toasts
    dismissTimersRef.current.forEach((timer, id) => {
      if (!toasts.find((t) => t.id === id)) {
        clearTimeout(timer.timeoutId);
        dismissTimersRef.current.delete(id);
      }
    });
  }, [toasts, isHovered, triggerExit]);

  // Pause/resume timers on hover change
  useEffect(() => {
    if (isHovered) {
      // Pause all timers
      dismissTimersRef.current.forEach((timer, id) => {
        clearTimeout(timer.timeoutId);
        const elapsed = Date.now() - timer.startTime;
        const remaining = Math.max(0, timer.remainingTime - elapsed);
        dismissTimersRef.current.set(id, {
          ...timer,
          timeoutId: null as unknown as NodeJS.Timeout,
          remainingTime: remaining,
        });
      });
    } else {
      // Resume all timers
      dismissTimersRef.current.forEach((timer, id) => {
        if (timer.remainingTime > 0) {
          const timeoutId = setTimeout(() => {
            triggerExit(id);
            dismissTimersRef.current.delete(id);
          }, timer.remainingTime);

          dismissTimersRef.current.set(id, {
            timeoutId,
            remainingTime: timer.remainingTime,
            startTime: Date.now(),
          });
        }
      });
    }
  }, [isHovered, triggerExit]);

  const handleDismiss = useCallback(
    (id: number) => {
      // Clear timer
      const timer = dismissTimersRef.current.get(id);
      if (timer) {
        clearTimeout(timer.timeoutId);
        dismissTimersRef.current.delete(id);
      }
      triggerExit(id);
    },
    [triggerExit]
  );

  const isExpanded = isHovered;
  // Always render all toasts, but visually stack/hide with CSS
  const hiddenCount = Math.max(0, toasts.length - MAX_VISIBLE_TOASTS);
  const shouldStack = toasts.length > 1 && !isExpanded;

  // Always render container for test compatibility (data-testid="toaster")
  if (toasts.length === 0) {
    return <div data-testid="toaster" />;
  }

  return (
    <div
      ref={containerRef}
      data-testid="toaster"
      className="fixed bottom-0 right-0 z-[100] flex flex-col p-4 w-full sm:max-w-[420px] pointer-events-none"
    >
      {/* 
        Inner wrapper handles hover - pointer-events-auto so gaps between 
        toasts also trigger hover (prevents flickering when moving between toasts)
      */}
      <div 
        className="relative pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Toast list - use CSS to handle stacking */}
        <div
          className="flex flex-col transition-all duration-300 ease-out"
          style={{ gap: shouldStack ? 0 : 8 }}
        >
          {toasts.map((toast, index) => {
            const { id, title, variant = 'default', action } = toast;
            let { description } = toast;

            if (!title && !description) {
              description = defaultMessage;
            }

            const isExiting = exitingToasts.has(id);
            
            // Calculate stacking - only for visible toasts when collapsed
            const isHidden = !isExpanded && index >= MAX_VISIBLE_TOASTS;
            const stackIndex = shouldStack ? Math.min(index, MAX_VISIBLE_TOASTS - 1) : 0;
            const stackTranslateY = shouldStack ? -stackIndex * STACK_OFFSET : 0;
            const stackScale = shouldStack ? 1 - stackIndex * STACK_SCALE : 1;
            const stackOpacity = shouldStack ? Math.max(0.4, 1 - stackIndex * 0.2) : 1;

            return (
              <div
                key={id}
                className="transition-all duration-300 ease-out"
                style={{
                  // Hide toasts beyond MAX_VISIBLE when not expanded
                  display: isHidden ? 'none' : 'block',
                  // Stack offset via margin (smoother than transform for stacking)
                  marginTop: shouldStack && index > 0 ? -56 : 0,
                  // Stacking visuals
                  transform: `translateY(${stackTranslateY}px) scale(${stackScale})`,
                  opacity: stackOpacity,
                  zIndex: toasts.length - index,
                }}
              >
                <ToastItem
                  id={id}
                  title={title}
                  description={description}
                  variant={variant as ToastVariant}
                  action={action}
                  onDismiss={handleDismiss}
                  isExiting={isExiting}
                />
              </div>
            );
          })}
        </div>

        {/* Hidden toasts indicator badge */}
        {!isExpanded && hiddenCount > 0 && (
          <div
            className={cn(
              'absolute -top-2 left-1/2 -translate-x-1/2 z-[200]',
              'px-2.5 py-0.5 text-xs font-medium rounded-full',
              'bg-primary text-primary-foreground shadow-md',
              'transition-all duration-200 pointer-events-auto cursor-default',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            <FormattedMessage
              defaultMessage="+{count} more"
              id="Toaster / Hidden count badge"
              values={{ count: hiddenCount }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
