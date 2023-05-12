import { StoryFn } from '@storybook/react';
import { Fragment, useEffect } from 'react';

import { useSnackbar } from '../useSnackbar';
import { withProviders } from '../../utils/storybook';
import { Snackbar } from './snackbar.component';

type Props = { messages: Array<string | null> };

const Template: StoryFn<Props> = ({ messages }: Props) => {
  const { showMessage } = useSnackbar();

  useEffect(() => {
    messages?.forEach((message) =>
      showMessage(message, { hideDelay: 60 * 1000 })
    );
  }, [showMessage, messages]);

  return <Fragment />;
};

export default {
  title: 'Core/Snackbar',
  component: Snackbar,
};

export const Default = {
  render: Template,
  args: { messages: ['first message', 'second message'] },
  decorators: [withProviders()],
};

export const GenericError = {
  render: Template,
  args: { messages: [null] },
  decorators: [withProviders()],
};

export const LongMessages = {
  render: Template,

  args: {
    messages: [
      'very long message example very long message',
      'even longer message example even longer message example even longer message example even longer message example',
    ],
  },

  decorators: [withProviders()],
};
