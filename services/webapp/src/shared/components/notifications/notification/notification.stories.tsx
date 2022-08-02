import styled from 'styled-components';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withRelay } from '../../../utils/storybook';
import { Notification, NotificationProps } from './notification.component';
import { mockedNotificationProps } from './notification.fixtures';
import { NotificationButton } from './index';

const Container = styled.div`
  max-width: 320px;
`;

const Template: Story<NotificationProps> = (args: NotificationProps) => {
  return (
    <Container>
      <Notification {...args} />
    </Container>
  );
};

export default {
  title: 'Shared/Notifications/Notification',
  component: Notification,
  decorators: [withRelay()],
};

export const Default = Template.bind({});
Default.args = {
  ...mockedNotificationProps,
  title: 'Item has been added!',
  content: 'Lorem ipsum item has been added to somewhere',
  onClick: action('click action'),
};

export const NoAvatar = Template.bind({});
NoAvatar.args = {
  ...Default.args,
  avatar: null,
};

export const Read = Template.bind({});
Read.args = {
  ...Default.args,
  readAt: '2021-06-17T16:45:33',
};

export const OneAction = Template.bind({});
OneAction.args = {
  ...Default.args,
  children: (
    <>
      <NotificationButton>Click me</NotificationButton>
    </>
  ),
};

export const TwoActions = Template.bind({});
TwoActions.args = {
  ...Default.args,
  children: (
    <>
      <NotificationButton>Click me</NotificationButton>
      <NotificationButton color="green">Click me too</NotificationButton>
    </>
  ),
};

export const ThreeActions = Template.bind({});
ThreeActions.args = {
  ...Default.args,
  children: (
    <>
      <NotificationButton>Click me</NotificationButton>
      <NotificationButton>Click me too</NotificationButton>
      <NotificationButton>Click us all</NotificationButton>
    </>
  ),
};
