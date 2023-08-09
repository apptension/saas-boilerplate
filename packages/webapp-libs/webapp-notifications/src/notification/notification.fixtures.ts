import { pick } from 'ramda';

import { notificationFactory } from '../tests/factories';
import { NotificationProps } from './notification.component';

export const mockedNotificationProps: NotificationProps = {
  title: 'Title',
  content: 'Lorem ipsum sit dolor amet',
  readAt: null,
  avatar: 'https://picsum.photos/24/24',
  ...pick(['createdAt', 'type', 'id', 'issuer'], notificationFactory()),
};
