import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../utils/testUtils';
import { Message } from '../../../modules/snackbar/snackbar.types';
import { Snackbar } from './snackbar.component';

type StoryArgsType = { messages: Message[] };

const Template: Story<StoryArgsType> = ({ messages, ...args }: StoryArgsType) => (
  <ProvidersWrapper
    context={{
      store: (state) => {
        state.snackbar.messages = messages;
      },
    }}
  >
    <Snackbar {...args} />
  </ProvidersWrapper>
);

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

export const GenericError = Template.bind({});
GenericError.args = {
  messages: [{ id: 1, text: null }],
};

export const LongMessages = Template.bind({});
LongMessages.args = {
  messages: [
    { id: 1, text: 'very long message example very long message' },
    {
      id: 2,
      text: 'even longer message example even longer message example even longer message example even longer message example',
    },
  ],
};
