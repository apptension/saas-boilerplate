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
  icon?: ReactNode;
  iconClassName?: string;
  onClick?: () => void;
  className?: string;
};

export const Notification = ({
  id,
  title,
  children,
  avatar,
  icon,
  iconClassName,
  className,
  content,
  onClick,
  readAt,
  createdAt,
}: NotificationProps) => {
  const hasAvatar = typeof avatar === 'string';
  const hasIcon = !!icon;
  const isRead = typeof readAt === 'string';
  const onToggleIsRead = useToggleIsRead({
    id,
    isRead: !isRead,
  });

  return (
    <div
      data-status={isRead ? 'read' : 'unread'}
      className={cn(
        'group relative flex w-full items-start gap-3 px-4 py-3 transition-colors',
        'hover:bg-accent/50',
        'data-[status=read]:bg-transparent',
        'cursor-pointer',
        'border-b border-border/50 last:border-b-0',
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
      {/* Unread indicator - subtle left border */}
      {!isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}

      <div className="flex-shrink-0">
        {hasAvatar ? (
          <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-background" />
        ) : (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-muted', iconClassName)}>
            {hasIcon ? icon : <Bell className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <H4
            className={cn(
              'text-sm leading-none truncate',
              isRead ? 'font-normal text-muted-foreground' : 'font-semibold'
            )}
          >
            {title}
          </H4>
          <Button
            variant={ButtonVariant.GHOST}
            size="icon"
            className="h-6 w-6 shrink-0 opacity-60 transition-opacity hover:opacity-100 -mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggleIsRead(e);
            }}
            aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {isRead ? (
              <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </div>
        <p className={cn('text-sm line-clamp-3', isRead ? 'text-muted-foreground' : 'text-foreground')}>{content}</p>
        <div className="flex items-center gap-2">
          <Small className="text-xs text-muted-foreground">
            <RelativeDate date={new Date(createdAt as string)} />
          </Small>
        </div>
        {children && <div className="mt-2 flex flex-wrap items-start gap-2">{children}</div>}
      </div>
    </div>
  );
};
