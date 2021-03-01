import React from 'react';
import { Story } from '@storybook/react';

import { prepareState } from '../../../mocks/store';
import { ProvidersWrapper } from '../../utils/testUtils';
import { Message } from '../../../modules/snackbar/snackbar.types';
import { Snackbar } from './snackbar.component';

const Template: Story<{ messages: Message[] }> = ({ messages, ...args }) => {
  const store = prepareState((state) => {
    state.snackbar.messages = messages;
  });

  return (
    <ProvidersWrapper context={{ store }}>
      <Snackbar {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Snackbar',
  component: Snackbar,
};

export const Default = Template.bind({});
Default.args = {
  messages: [
    { id: 1, text: 'first message' },
    { id: 2, text: 'second message' },
  ],
};

export const LongMessages = Template.bind({});
LongMessages.args = {
  messages: [
    { id: 1, text: 'very long message example very long message' },
    {
      id: 2,
      text:
        'even longer message example even longer message example even longer message example even longer message example',
    },
  ],
};
