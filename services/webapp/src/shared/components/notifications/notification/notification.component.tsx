import React, { ReactNode } from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailOpenOutlineIcon from '@iconify-icons/ion/mail-open-outline';
import { ThemeProvider } from 'styled-components';
import { ButtonVariant } from '../../button';
import { Icon } from '../../icon';
import { ExtractNodeType } from '../../../utils/graphql';
import { notificationsListContent } from '../../../../__generated__/notificationsListContent.graphql';
import { RelativeDate } from '../../relativeDate';
import { Title, Avatar, Container, Content, MarkAsReadButton, Time } from './notification.styles';
import { NotificationTheme } from './notification.types';

export type NotificationProps = Omit<ExtractNodeType<notificationsListContent['allNotifications']>, 'data'> & {
  title: ReactNode;
  content: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const Notification = ({ title, className, content, onClick, readAt, createdAt }: NotificationProps) => {
  const isRead = typeof readAt === 'string';

  const theme: NotificationTheme = { isRead };

  return (
    <ThemeProvider theme={theme}>
      <Container className={className} onClick={onClick}>
        <Avatar src="https://picsum.photos/24/24" />
        <MarkAsReadButton variant={ButtonVariant.RAW}>
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
