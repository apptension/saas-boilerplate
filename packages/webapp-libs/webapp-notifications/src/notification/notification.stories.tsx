import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../utils/storybook';
import { Button as NotificationButton } from './button';
import { Notification, NotificationProps } from './notification.component';
import { mockedNotificationProps } from './notification.fixtures';

const Container = styled.div`
  max-width: 320px;
`;

const Template: StoryFn<NotificationProps> = (args: NotificationProps) => {
  return (
    <Container>
      <Notification {...args} />
    </Container>
  );
};

const meta: Meta<typeof Notification> = {
  title: 'Notifications/Notification',
  component: Notification,
  decorators: [withProviders()],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...mockedNotificationProps,
    title: 'Item has been added!',
    content: 'Lorem ipsum item has been added to somewhere',
    onClick: action('click action'),
  },
};

export const NoAvatar: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...Default.args,
    avatar: null,
  },
};

export const Read: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...Default.args,
    readAt: '2021-06-17T16:45:33',
  },
};

export const OneAction: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...Default.args,
    children: <NotificationButton>Click me</NotificationButton>,
  },
};

export const TwoActions: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...Default.args,
    children: (
      <>
        <NotificationButton>Click me</NotificationButton>
        <NotificationButton color="green">Click me too</NotificationButton>
      </>
    ),
  },
};

export const ThreeActions: StoryObj<typeof meta> = {
  render: Template,

  args: {
    ...Default.args,
    children: (
      <>
        <NotificationButton>Click me</NotificationButton>
        <NotificationButton>Click me too</NotificationButton>
        <NotificationButton>Click us all</NotificationButton>
      </>
    ),
  },
};
