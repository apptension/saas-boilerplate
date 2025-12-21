import * as ToastPrimitives from '@radix-ui/react-toast';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, LucideIcon } from 'lucide-react';
import { useIntl } from 'react-intl';

import { cn } from '../../lib/utils';
import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport } from '../toast';
import { useToast } from '../useToast';

const ToastProvider = ToastPrimitives.Provider;

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

export function Toaster() {
  const intl = useIntl();
  const {
    toastState: { toasts },
  } = useToast();

  const defaultMessage = intl.formatMessage({
    id: 'Snackbar / Generic error',
    defaultMessage: 'Something went wrong.',
  });

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = 'default', ...props }) {
        if (!title && !description) {
          description = defaultMessage;
        }

        const iconConfig = variantIcons[variant as ToastVariant] || variantIcons.default;
        const IconComponent = iconConfig.icon;

        return (
          <Toast key={id} data-testid={`toast-${id}`} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <IconComponent className={cn('h-5 w-5 shrink-0 mt-0.5', iconConfig.className)} aria-hidden="true" />
              <div className="grid gap-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport data-testid="toaster" />
    </ToastProvider>
  );
}
