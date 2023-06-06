import * as ToastPrimitives from '@radix-ui/react-toast';
import { useIntl } from 'react-intl';

import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport } from '../toast';
import { useToast } from '../useToast';

const ToastProvider = ToastPrimitives.Provider;

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
      {toasts.map(function ({ id, title, description, action, ...props }) {
        if (!title && !description) {
          description = defaultMessage;
        }
        return (
          <Toast key={id} data-testid={`toast-${id}`} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
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
