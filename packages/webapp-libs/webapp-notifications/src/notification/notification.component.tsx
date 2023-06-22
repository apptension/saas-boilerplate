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
    <li
      data-status={isRead ? 'read' : 'notRead'}
      className={cn(
        'list-none rounded p-2 flex flex-row my-2 w-full cursor-pointer transition-colors',
        'text-accent-foreground data-[status=read]:text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        className
      )}
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
      {hasAvatar ? (
        <img src={avatar} alt="" className="mr-3 rounded-full w-10 h-10 object-cover" />
      ) : (
        <div className="flex items-center justify-center p-3 h-10 w-10 dark:bg-muted-foreground bg-slate-300 rounded-full mr-3">
          <Bell />
        </div>
      )}
      <div className="flex flex-col w-full">
        <H4 className="text-sm">{title}</H4>
        <p className="mt-1 text-xs">{content}</p>
        <div className="flex flex-row justify-between items-center">
          <Small className="text-xs text-muted-foreground">
            <RelativeDate date={new Date(createdAt as string)} />
          </Small>
        </div>

        {children && <footer className="flex flex-row flex-wrap items-start mt-2 gap-2">{children}</footer>}
      </div>
      <Button className="p-1 h-6" variant={ButtonVariant.GHOST} onClick={onToggleIsRead}>
        {isRead ? <MailOpen size={16} /> : <Mail size={16} />}
      </Button>
    </li>
  );
};
