import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
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
