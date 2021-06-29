import { ReactNode } from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailOpenOutlineIcon from '@iconify-icons/ion/mail-open-outline';
import { ThemeProvider } from 'styled-components';
import { ButtonVariant } from '../../button';
import { Icon } from '../../icon';
import { ExtractNodeType } from '../../../utils/graphql';
import { notificationsListContent } from '../../../../__generated__/notificationsListContent.graphql';
import { RelativeDate } from '../../relativeDate';
import { NotificationTheme } from './notification.types';
import { Actions, Avatar, Container, Content, MarkAsReadButton, Time, Title } from './notification.styles';
import { useToggleIsRead } from './notification.hooks';

export type NotificationProps = Omit<ExtractNodeType<notificationsListContent['allNotifications']>, 'data'> & {
  title: ReactNode;
  content: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const Notification = ({
  id,
  title,
  children,
  className,
  content,
  onClick,
  readAt,
  createdAt,
}: NotificationProps) => {
  const isRead = typeof readAt === 'string';
  const onToggleIsRead = useToggleIsRead({
    id,
    isRead: !isRead,
  });
  const theme: NotificationTheme = { isRead };

  return (
    <ThemeProvider theme={theme}>
      <Container
        className={className}
        role="link"
        tabIndex={0}
        onClick={onClick}
        onKeyUp={(event) => {
          const { target, key } = event;
          if (
            key === 'Enter' &&
            target instanceof Element &&
            target.tagName === 'LI' &&
            target.isEqualNode(document.activeElement)
          ) {
            onClick?.();
          }
        }}
      >
        <Avatar src="https://picsum.photos/24/24" />
        <MarkAsReadButton variant={ButtonVariant.RAW} onClick={onToggleIsRead}>
          <Icon icon={isRead ? mailOpenOutlineIcon : mailOutlineIcon} />
        </MarkAsReadButton>
        <Time>
          <RelativeDate date={new Date(createdAt)} />
        </Time>
        <Title>{title}</Title>
        <Content>{content}</Content>
        {children && <Actions>{children}</Actions>}
      </Container>
    </ThemeProvider>
  );
};
