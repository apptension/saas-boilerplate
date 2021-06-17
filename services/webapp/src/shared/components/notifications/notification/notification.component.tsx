import React, { ReactNode } from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import { ButtonVariant } from '../../button';
import { Icon } from '../../icon';
import { Author, Avatar, Container, Content, MarkAsReadButton, Time } from './notification.styles';

export interface NotificationProps {
  children?: ReactNode;
}

export const Notification = ({ children }: NotificationProps) => {
  return (
    <Container>
      <Avatar src="https://picsum.photos/24/24" />
      <MarkAsReadButton variant={ButtonVariant.RAW}>
        <Icon icon={mailOutlineIcon} />
      </MarkAsReadButton>
      <Time>2 hours ago</Time>
      <Author>michelle.rivera@example.com</Author>
      <Content>
        Two lines of text at maximum. Two lines of text maximum. Two lines of text maximum. Two lines...
      </Content>
    </Container>
  );
};
