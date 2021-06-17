import React from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailUnreadOutlineIcon from '@iconify-icons/ion/mail-unread-outline';
import { ButtonVariant, ButtonProps } from '../../button';
import { Icon } from '../../icon';
import { Button } from './notificationsButton.styles';

const hasUnreadNotifications = true;

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'>;

export const NotificationsButton = (props: NotificationsButtonProps) => {
  return (
    <Button variant={ButtonVariant.ROUND} hasUnreadNotifications={hasUnreadNotifications} {...props}>
      <Icon icon={hasUnreadNotifications ? mailUnreadOutlineIcon : mailOutlineIcon} />
    </Button>
  );
};
