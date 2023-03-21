import mailOpenOutlineIcon from '@iconify-icons/ion/mail-open-outline';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import { NotificationType } from '@sb/webapp-api-client/graphql';
import { ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

import { useToggleIsRead } from './notification.hooks';
import { Actions, Avatar, Container, Content, MarkAsReadButton, RelativeDate, Title } from './notification.styles';
import { NotificationTheme } from './notification.types';

export type NotificationProps = Omit<NotificationType, 'data'> & {
  title: ReactNode;
  content: ReactNode;
  children?: ReactNode;
  avatar?: string | null;
  onClick?: () => void;
  className?: string;
};

export const Notification = ({
  id,
  title,
  children,
  avatar,
  className,
  content,
  onClick,
  readAt,
  createdAt,
}: NotificationProps) => {
  const hasAvatar = typeof avatar === 'string';
  const isRead = typeof readAt === 'string';
  const onToggleIsRead = useToggleIsRead({
    id,
    isRead: !isRead,
  });
  const theme: NotificationTheme = { isRead, hasAvatar };

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
        {hasAvatar && <Avatar src={avatar} />}
        <MarkAsReadButton variant={ButtonVariant.RAW} onClick={onToggleIsRead}>
          <Icon icon={isRead ? mailOpenOutlineIcon : mailOutlineIcon} />
        </MarkAsReadButton>
        <RelativeDate date={new Date(createdAt as string)} />
        <Title>{title}</Title>
        <Content>{content}</Content>
        {children && <Actions>{children}</Actions>}
      </Container>
    </ThemeProvider>
  );
};
