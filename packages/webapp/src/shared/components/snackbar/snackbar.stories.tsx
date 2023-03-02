import { Story } from '@storybook/react';
import { Fragment, useEffect } from 'react';

import { useSnackbar } from '../../hooks';
import { withProviders } from '../../utils/storybook';
import { Snackbar } from './snackbar.component';

type Props = { messages: Array<string | null> };

const Template: Story<Props> = ({ messages }: Props) => {
  const { showMessage } = useSnackbar();

  useEffect(() => {
    messages?.forEach((message) => showMessage(message, { hideDelay: 60 * 1000 }));
  }, [showMessage, messages]);

  return <Fragment />;
};

export default {
  title: 'Shared/Snackbar',
  component: Snackbar,
};

export const Default = Template.bind({});
Default.args = { messages: ['first message', 'second message'] };
Default.decorators = [withProviders()];

export const GenericError = Template.bind({});
GenericError.args = { messages: [null] };
GenericError.decorators = [withProviders()];

export const LongMessages = Template.bind({});
LongMessages.args = {
  messages: [
    'very long message example very long message',
    'even longer message example even longer message example even longer message example even longer message example',
  ],
};
LongMessages.decorators = [withProviders()];
