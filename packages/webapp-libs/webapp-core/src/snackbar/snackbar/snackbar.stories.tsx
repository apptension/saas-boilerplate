import { Meta, StoryObj } from '@storybook/react';
import { Fragment, useEffect } from 'react';

import { withProviders } from '../../utils/storybook';
import { useSnackbar } from '../useSnackbar';
import { Snackbar } from './snackbar.component';

type Story = StoryObj<typeof Snackbar>;
type Props = { messages: Array<string | null> };

const Template = ({ messages }: Props) => {
  const { showMessage } = useSnackbar();

  useEffect(() => {
    messages?.forEach((message) => showMessage(message, { hideDelay: 60 * 1000 }));
  }, [showMessage, messages]);

  return <Fragment />;
};

const meta: Meta<typeof Snackbar> = {
  title: 'Core/Snackbar',
  component: Template,
  decorators: [withProviders()],
};

export default meta;

export const Default: Story = {
  args: { messages: ['first message', 'second message'] },
};

export const GenericError: Story = {
  args: { messages: [null] },
};

export const LongMessages: Story = {
  args: {
    messages: [
      'very long message example very long message',
      'even longer message example even longer message example even longer message example even longer message example',
    ],
  },
};
