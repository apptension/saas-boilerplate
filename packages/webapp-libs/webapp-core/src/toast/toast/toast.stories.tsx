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
  args: { toasts: [{ description: 'first message' }, { description: 'second message', variant: 'destructive' }] },
};

export const ErrorState: Story = {
  args: { toasts: [{ description: 'Error state', variant: 'destructive' }] },
};

export const LongMessages: Story = {
  args: {
    toasts: [
      { description: 'very long message example very long message' },
      {
        description:
          'even longer message example even longer message example even longer message example even longer message example',
      },
    ],
  },
};

export const WithTitle: Story = {
  args: { toasts: [{ description: 'Description message', title: 'Title message' }] },
};

export const WithAction: Story = {
  args: {
    toasts: [
      {
        description: 'Description message',
        title: 'Title message',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      },
    ],
  },
};
