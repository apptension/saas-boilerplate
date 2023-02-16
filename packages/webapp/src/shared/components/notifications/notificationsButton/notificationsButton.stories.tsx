import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillNotificationsListQuery } from '../../../../mocks/factories';
import { withProviders } from '../../../utils/storybook';
import { NotificationsButton, NotificationsButtonProps } from './notificationsButton.component';

const Template: Story<NotificationsButtonProps> = (args: NotificationsButtonProps) => {
  return <NotificationsButton {...args} />;
};

export default {
  title: 'Shared/Notifications/NotificationsButton',
  component: NotificationsButton,
};

export const Default = Template.bind({});
Default.args = { onClick: action('on click') };
Default.decorators = [
  withProviders({
    apolloMocks: append(fillNotificationsListQuery([])),
  }),
];
