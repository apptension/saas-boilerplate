import { FragmentType, getFragmentData, gql } from '@sb/webapp-api-client/graphql';
import { Button, ButtonProps } from '@sb/webapp-core/components/buttons';
import { cn } from '@sb/webapp-core/lib/utils';
import { Bell } from 'lucide-react';
import * as React from 'react';
import { useIntl } from 'react-intl';

export const NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT = gql(/* GraphQL */ `
  fragment notificationsButtonContent on Query {
    hasUnreadNotifications
    unreadNotificationsCount
  }
`);

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  queryResult?: FragmentType<typeof NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT>;
};

export const NotificationsButton = React.forwardRef<HTMLButtonElement, NotificationsButtonProps>(
  ({ queryResult, ...props }: NotificationsButtonProps, ref) => {
    const data = getFragmentData(NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT, queryResult);

    return (
      <Content
        hasUnreadNotifications={data?.hasUnreadNotifications ?? false}
        unreadCount={data?.unreadNotificationsCount ?? undefined}
        {...props}
        ref={ref}
      />
    );
  }
);

type ContentProps = Omit<NotificationsButtonProps, 'queryResult'> & {
  hasUnreadNotifications: boolean;
  unreadCount?: number;
};

const NotificationBadge = ({ count }: { count?: number }) => {
  const showCount = count !== undefined && count > 0;
  const displayCount = count && count > 99 ? '99+' : count;

  return (
    <span
      className={cn(
        'absolute flex items-center justify-center',
        'bg-red-500 dark:bg-red-400',
        'text-white dark:text-white',
        'font-semibold',
        'ring-2 ring-background',
        'animate-in zoom-in-50 duration-200',
        showCount
          ? 'top-0 right-0 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full -translate-y-1 translate-x-1'
          : 'top-1 right-1 w-2.5 h-2.5 rounded-full'
      )}
    >
      {showCount && displayCount}
    </span>
  );
};

const Content = React.forwardRef<HTMLButtonElement, ContentProps>(
  ({ hasUnreadNotifications, unreadCount, ...props }: ContentProps, ref) => {
    const intl = useIntl();

    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        data-unread={hasUnreadNotifications}
        aria-label={intl.formatMessage({
          defaultMessage: 'Open notifications',
          id: 'Notifications / Notifications Button / Label',
        })}
        {...props}
        ref={ref}
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications && <NotificationBadge count={unreadCount} />}
      </Button>
    );
  }
);

export const NotificationsButtonFallback = () => <Content hasUnreadNotifications={false} />;
