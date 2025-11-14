import { NotificationType } from '@sb/webapp-api-client/graphql';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { RelativeDate } from '@sb/webapp-core/components/dateTime/relativeDate';
import { H4, Small } from '@sb/webapp-core/components/typography';
import { cn } from '@sb/webapp-core/lib/utils';
import { Bell, Mail, MailOpen } from 'lucide-react';
import { ReactNode } from 'react';

import { useToggleIsRead } from './notification.hooks';

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

  return (
    <div
      data-status={isRead ? 'read' : 'notRead'}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border-b px-4 py-3 transition-colors',
        'hover:bg-accent/50',
        'data-[status=read]:opacity-60',
        'cursor-pointer',
        className
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex-shrink-0">
        {hasAvatar ? (
          <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <H4 className="text-sm font-medium leading-none">{title}</H4>
          <Button
            variant={ButtonVariant.GHOST}
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleIsRead();
            }}
            aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
        <div className="flex items-center gap-2">
          <Small className="text-xs text-muted-foreground">
            <RelativeDate date={new Date(createdAt as string)} />
          </Small>
        </div>
        {children && (
          <div className="mt-2 flex flex-wrap items-start gap-2">{children}</div>
        )}
      </div>
    </div>
  );
};
