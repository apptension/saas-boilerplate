import { pick } from 'ramda';
import { notificationFactory } from "../../../../mocks/factories";
import { NotificationProps } from './notification.component';

export const mockedNotificationProps: NotificationProps = {
  title: 'Title',
  content: 'Lorem ipsum sit dolor amet',
  readAt: null,
  ...pick(['createdAt', 'type', 'id'], notificationFactory()),
};
