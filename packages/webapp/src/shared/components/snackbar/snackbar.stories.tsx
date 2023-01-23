import { Story } from '@storybook/react';
import { withProviders } from '../../utils/storybook';
import configureStore from '../../../app/config/store';
import { Snackbar } from './snackbar.component';

const Template: Story = () => <Snackbar />;

export default {
  title: 'Shared/Snackbar',
  component: Snackbar,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    reduxStore: configureStore({
      snackbar: {
        messages: [
          { id: 1, text: 'first message' },
          { id: 2, text: 'second message' },
        ],
      },
    }),
  }),
];

export const GenericError = Template.bind({});
GenericError.decorators = [
  withProviders({
    reduxStore: configureStore({
      snackbar: {
        messages: [{ id: 1, text: null }],
      },
    }),
  }),
];

export const LongMessages = Template.bind({});
LongMessages.decorators = [
  withProviders({
    reduxStore: configureStore({
      snackbar: {
        messages: [
          { id: 1, text: 'very long message example very long message' },
          {
            id: 2,
            text: 'even longer message example even longer message example even longer message example even longer message example',
          },
        ],
      },
    }),
  }),
];
