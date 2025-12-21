import { Meta, StoryObj } from '@storybook/react';
import { Fragment, useEffect } from 'react';

import { withProviders } from '../../utils/storybook';
import { ToastAction } from '../toast';
import { ToasterToastProps, useToast } from '../useToast';

type Props = { toasts: Array<ToasterToastProps> };
type Story = StoryObj<Props>;

const Template = ({ toasts }: Props) => {
  const { toast } = useToast();

  useEffect(() => {
    toasts?.forEach((toastObj) => toast(toastObj, { hideDelay: 60 * 1000 }));
  }, [toast, toasts]);

  return <Fragment />;
};

const meta: Meta<Props> = {
  title: 'Core/Toast',
  component: Template,
  decorators: [withProviders()],
};

export default meta;

export const Default: Story = {
  args: { toasts: [{ description: 'This is a default notification' }] },
};

export const Success: Story = {
  args: { toasts: [{ description: 'Your changes have been saved successfully!', variant: 'success' }] },
};

export const Destructive: Story = {
  args: { toasts: [{ description: 'An error occurred while processing your request.', variant: 'destructive' }] },
};

export const Warning: Story = {
  args: { toasts: [{ description: 'Your session will expire in 5 minutes.', variant: 'warning' }] },
};

export const Info: Story = {
  args: { toasts: [{ description: 'A new version of the app is available.', variant: 'info' }] },
};

export const AllVariants: Story = {
  args: {
    toasts: [
      { description: 'This is a default notification', variant: 'default' },
      { description: 'Your changes have been saved successfully!', variant: 'success' },
      { description: 'An error occurred while processing your request.', variant: 'destructive' },
      { description: 'Your session will expire in 5 minutes.', variant: 'warning' },
      { description: 'A new version of the app is available.', variant: 'info' },
    ],
  },
};

export const WithTitle: Story = {
  args: {
    toasts: [
      { title: 'Success', description: 'Your profile has been updated.', variant: 'success' },
      { title: 'Error', description: 'Failed to save changes.', variant: 'destructive' },
      { title: 'Warning', description: 'Please review your settings.', variant: 'warning' },
      { title: 'Information', description: 'New features are now available.', variant: 'info' },
    ],
  },
};

export const LongMessages: Story = {
  args: {
    toasts: [
      {
        description: 'This is a longer message that demonstrates how the toast handles multi-line content gracefully.',
        variant: 'success',
      },
      {
        description:
          'This is an even longer error message that spans multiple lines to show how the toast component handles extensive content without breaking the layout or causing visual issues.',
        variant: 'destructive',
      },
    ],
  },
};

export const WithAction: Story = {
  args: {
    toasts: [
      {
        description: 'Your session is about to expire.',
        title: 'Session Warning',
        variant: 'warning',
        action: <ToastAction altText="Extend session">Extend</ToastAction>,
      },
      {
        description: 'Failed to save document.',
        title: 'Save Error',
        variant: 'destructive',
        action: <ToastAction altText="Try again">Retry</ToastAction>,
      },
    ],
  },
};
