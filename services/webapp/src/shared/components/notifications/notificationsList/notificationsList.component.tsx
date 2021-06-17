import React, { HTMLAttributes } from 'react';
import { FormattedMessage } from 'react-intl';

import { times } from 'ramda';
import { ButtonVariant } from '../../button';
import { Notification } from '../notification';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';

export type NotificationsListProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
};

export const NotificationsList = (props: NotificationsListProps) => {
  return (
    <Container {...props}>
      <Title>
        <FormattedMessage defaultMessage="Notifications" description="Notifications / Notifications List / Title" />
      </Title>
      <MarkAllAsReadButton variant={ButtonVariant.RAW}>
        <FormattedMessage
          defaultMessage="Mark all as read"
          description="Notifications / Notifications List / Mark all as read button"
        />
      </MarkAllAsReadButton>
      <List>
        {times(
          () => (
            <Notification />
          ),
          50
        )}
      </List>
    </Container>
  );
};
