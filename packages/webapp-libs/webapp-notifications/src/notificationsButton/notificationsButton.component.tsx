import { FragmentType, getFragmentData, gql } from '@sb/webapp-api-client/graphql';
import { Button, ButtonProps } from '@sb/webapp-core/components/buttons';
import { Bell, BellDot } from 'lucide-react';
import * as React from 'react';
import { useIntl } from 'react-intl';

export const NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT = gql(/* GraphQL */ `
  fragment notificationsButtonContent on Query {
    hasUnreadNotifications
  }
`);

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  queryResult?: FragmentType<typeof NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT>;
};

export const NotificationsButton = React.forwardRef<HTMLButtonElement, NotificationsButtonProps>(
  ({ queryResult, ...props }: NotificationsButtonProps, ref) => {
    const data = getFragmentData(NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT, queryResult);

    return <Content hasUnreadNotifications={data?.hasUnreadNotifications ?? false} {...props} ref={ref} />;
  }
);

type ContentProps = Omit<NotificationsButtonProps, 'queryResult'> & {
  hasUnreadNotifications: boolean;
};

const Content = React.forwardRef<HTMLButtonElement, ContentProps>(
  ({ hasUnreadNotifications, ...props }: ContentProps, ref) => {
    const intl = useIntl();

    return (
      <Button
        variant="ghost"
        className="h-10 w-10 rounded-full px-0"
        data-unread={hasUnreadNotifications}
        aria-label={intl.formatMessage({
          defaultMessage: 'Open notifications',
          id: 'Notifications / Notifications Button / Label',
        })}
        {...props}
        ref={ref}
      >
        {hasUnreadNotifications ? <BellDot className="[&>circle]:stroke-red-500" /> : <Bell />}
      </Button>
    );
  }
);

export const NotificationsButtonFallback = () => <Content hasUnreadNotifications={false} />;
