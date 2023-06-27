import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillNotificationsListQuery } from '../tests/factories';
import { withProviders } from '../utils/storybook';
import { NotificationsButton, NotificationsButtonProps } from './notificationsButton.component';

const Template: StoryFn<NotificationsButtonProps> = (args: NotificationsButtonProps) => {
  return <NotificationsButton {...args} />;
};

const meta: Meta = {
  title: 'Notifications/NotificationsButton',
  component: NotificationsButton,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: { onClick: action('on click') },

  decorators: [
    withProviders({
      apolloMocks: append(fillNotificationsListQuery([])),
    }),
  ],
};
