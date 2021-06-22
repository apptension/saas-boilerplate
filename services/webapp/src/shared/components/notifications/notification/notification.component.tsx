import React, { ReactNode, MouseEvent } from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailOpenOutlineIcon from '@iconify-icons/ion/mail-open-outline';
import { ThemeProvider } from 'styled-components';
import graphql from 'babel-plugin-relay/macro';
import { ButtonVariant } from '../../button';
import { Icon } from '../../icon';
import { ExtractNodeType } from '../../../utils/graphql';
import { notificationsListContent } from '../../../../__generated__/notificationsListContent.graphql';
import { RelativeDate } from '../../relativeDate';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { notificationMutation } from '../../../../__generated__/notificationMutation.graphql';
import { NotificationTheme } from './notification.types';
import { Title, Avatar, Container, Content, MarkAsReadButton, Time } from './notification.styles';

export type NotificationProps = Omit<ExtractNodeType<notificationsListContent['allNotifications']>, 'data'> & {
  title: ReactNode;
  content: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const Notification = ({ id, title, className, content, onClick, readAt, createdAt }: NotificationProps) => {
  const isRead = typeof readAt === 'string';

  const [commitNotificationMutation] = usePromiseMutation<notificationMutation>(graphql`
    mutation notificationMutation($input: UpdateNotificationMutationInput!) {
      updateNotification(input: $input) {
        hasUnreadNotifications
        notificationEdge {
          node {
            readAt
          }
        }
      }
    }
  `);

  const onToggleIsRead = async (event: MouseEvent) => {
    event.stopPropagation();
    return await commitNotificationMutation({
      variables: {
        input: { id, isRead: !isRead },
      },
      updater: (store) => {
        const value = store.getRootField('updateNotification').getValue('hasUnreadNotifications');
        store.getRoot().setValue(value, 'hasUnreadNotifications');
      },
    });
  };

  const theme: NotificationTheme = { isRead };

  return (
    <ThemeProvider theme={theme}>
      <Container className={className} onClick={onClick}>
        <Avatar src="https://picsum.photos/24/24" />
        <MarkAsReadButton variant={ButtonVariant.RAW} onClick={onToggleIsRead}>
          <Icon icon={isRead ? mailOpenOutlineIcon : mailOutlineIcon} />
        </MarkAsReadButton>
        <Time>
          <RelativeDate date={new Date(createdAt)} />
        </Time>
        <Title>{title}</Title>
        <Content>{content}</Content>
      </Container>
    </ThemeProvider>
  );
};
